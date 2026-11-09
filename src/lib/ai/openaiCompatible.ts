import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig, ToolDefinition } from "./base";
import { toOpenAiMessages, contentLength } from "./base";
import type { ToolCall } from "../../types";
import { logProviderStart, logProviderDone, logProviderError } from "./devlog";

/**
 * Factory for OpenAI-compatible chat-completions providers (OpenAI, Groq,
 * DeepSeek, Mistral, xAI, Together, …). All of them share the same wire
 * protocol: `POST {base}/chat/completions` with Bearer auth, SSE streaming
 * with `data:` frames, and the same tool-call delta shape — so one battle
 * tested implementation serves them all.
 */
export interface OpenAiCompatibleConfig {
  id: ProviderAdapter["id"];
  name: string;
  defaultBaseUrl: string;
  /** Extra static headers (e.g. OpenRouter's X-Title). */
  extraHeaders?: Record<string, string>;
  /** True for the native OpenAI API — enables reasoning-model quirks. */
  openaiNative?: boolean;
}

/** OpenAI reasoning models reject `temperature`, `max_tokens` and (older
 *  builds) the `system` role — they want `max_completion_tokens` and user-role
 *  instructions. */
function isReasoningModel(model: string): boolean {
  return /^(o[134](-|$)|gpt-5)/.test(model.trim().toLowerCase());
}

/** Render a ToolCall array to inline text (e.g. `open_app("Brave")`) */
function toolCallsToInline(tcs: ToolCall[]): string {
  return tcs
    .filter((tc) => tc.name)
    .map((tc) => {
      const args = tc.arguments as Record<string, string>;
      const vals = Object.values(args)
        .map((v) => `"${String(v)}"`)
        .join(", ");
      return `${tc.name}(${vals})`;
    })
    .join(" ");
}

export function createOpenAiCompatibleAdapter(spec: OpenAiCompatibleConfig): ProviderAdapter {
  const authHeaders = (cfg: ProviderConfig): Record<string, string> => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
    ...spec.extraHeaders,
  });

  return {
    id: spec.id,
    name: spec.name,

    async chat(req, cfg) {
      const base = cfg.baseUrl || spec.defaultBaseUrl;
      const reasoning = !!spec.openaiNative && isReasoningModel(req.model || cfg.model);
      const messages = reasoning
        ? req.messages.map((m) =>
            m.role === "system"
              ? { ...m, role: "user" as const, content: `Instructions:\n${m.content}` }
              : m
          )
        : req.messages;
      const body: Record<string, unknown> = {
        model: req.model || cfg.model,
        messages: toOpenAiMessages(messages),
        stream: false,
      };
      if (reasoning) body.max_completion_tokens = req.maxTokens;
      else {
        body.temperature = req.temperature;
        body.max_tokens = req.maxTokens;
      }
      if (req.tools?.length) body.tools = req.tools;
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: authHeaders(cfg),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${spec.name} error ${res.status}: ${err}`);
      }
      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      const content = msg?.content || "";
      const toolCalls: ToolCall[] | undefined = msg?.tool_calls?.map(
        (tc: { id: string; function: { name: string; arguments: string } }) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments || "{}"),
        })
      );
      return {
        content,
        toolCalls,
        usage: data.usage && {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    },

    async streamChat(req: ChatRequest, cfg: ProviderConfig, onChunk, signal) {
      const t0 = performance.now();
      const base = cfg.baseUrl || spec.defaultBaseUrl;
      const totalChars = (req.messages || []).reduce((s, m) => s + contentLength(m.content), 0);
      logProviderStart(spec.id, req.model || cfg.model, (req.messages || []).length, totalChars);
      let res: Response;
      try {
        const reasoning = !!spec.openaiNative && isReasoningModel(req.model || cfg.model);
        const messages = reasoning
          ? req.messages.map((m) =>
              m.role === "system"
                ? { ...m, role: "user" as const, content: `Instructions:\n${m.content}` }
                : m
            )
          : req.messages;
        const body: Record<string, unknown> = {
          model: req.model || cfg.model,
          messages: toOpenAiMessages(messages),
          stream: true,
        };
        if (reasoning) body.max_completion_tokens = req.maxTokens;
        else {
          body.temperature = req.temperature;
          body.max_tokens = req.maxTokens;
          body.stream_options = { include_usage: true };
        }
        if (req.tools?.length) body.tools = req.tools as ToolDefinition[];
        res = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: authHeaders(cfg),
          body: JSON.stringify(body),
          signal,
        });
      } catch (e: any) {
        logProviderError(spec.id, e);
        throw e;
      }
      if (!res.ok || !res.body) {
        const err = await res.text();
        logProviderError(spec.id, new Error(err), res.status);
        throw new Error(`${spec.name} error ${res.status}: ${err}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";
      let reasoning = "";
      // Track tool calls across streaming deltas
      // Keyed by the delta's `index` field (position in the tool_calls array)
      const toolCallDeltas = new Map<
        number,
        { id: string; name: string; argsBuffer: string }
      >();
      let usage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            if (!delta) continue;
            // Content delta
            if (delta.content) {
              content += delta.content;
              onChunk({ content: delta.content });
            }
            // Reasoning delta
            if (delta.reasoning_content) {
              reasoning += delta.reasoning_content;
              onChunk({ reasoning: delta.reasoning_content });
            }
            // Tool calls delta — accumulate by index
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index;
                let cur = toolCallDeltas.get(idx);
                if (!cur) {
                  cur = { id: "", name: "", argsBuffer: "" };
                  toolCallDeltas.set(idx, cur);
                }
                if (tc.id) cur.id = tc.id;
                if (tc.function?.name) cur.name = tc.function.name;
                if (tc.function?.arguments) cur.argsBuffer += tc.function.arguments;
              }
              // Check if all tool calls have complete arguments (JSON-parseable)
              const resolved: ToolCall[] = [];
              let allResolved = true;
              for (const [, cur] of toolCallDeltas) {
                if (!cur.name) { allResolved = false; break; }
                let args: unknown;
                try {
                  args = JSON.parse(cur.argsBuffer);
                } catch {
                  allResolved = false;
                  break;
                }
                resolved.push({ id: cur.id, name: cur.name, arguments: args as Record<string, unknown> });
              }
              if (allResolved && resolved.length > 0) {
                const inline = toolCallsToInline(resolved);
                if (inline) {
                  content += (content && !content.endsWith(" ") ? " " : "") + inline;
                  onChunk({ content: inline });
                }
              }
            }
            // Usage
            if (json.usage) {
              usage = {
                promptTokens: json.usage.prompt_tokens || 0,
                completionTokens: json.usage.completion_tokens || 0,
                totalTokens: json.usage.total_tokens || 0,
              };
            }
          } catch {
            // ignore parse errors on partial lines
          }
        }
      }
      // Final tool calls after stream ends
      const finalToolCalls: ToolCall[] = [];
      for (const [, cur] of toolCallDeltas) {
        if (!cur.name) continue;
        let args: unknown;
        try { args = JSON.parse(cur.argsBuffer); } catch { args = cur.argsBuffer; }
        finalToolCalls.push({ id: cur.id, name: cur.name, arguments: args as Record<string, unknown> });
      }
      logProviderDone(spec.id, req.model || cfg.model, Math.round(performance.now() - t0), usage);
      return {
        content,
        reasoning: reasoning || undefined,
        toolCalls: finalToolCalls.length > 0 ? finalToolCalls : undefined,
        usage,
      };
    },

    async listModels(cfg) {
      if (!cfg.apiKey) return [];
      try {
        const base = cfg.baseUrl || spec.defaultBaseUrl;
        const res = await fetch(`${base}/models`, {
          headers: { Authorization: `Bearer ${cfg.apiKey}` },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map((m: { id: string }) => m.id);
      } catch {
        return [];
      }
    },
  };
}
