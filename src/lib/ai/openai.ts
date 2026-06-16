import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig } from "./base";
import type { ToolCall } from "../../types";
import { logProviderStart, logProviderDone, logProviderError } from "./devlog";

const OPENAI_DEFAULT = "https://api.openai.com/v1";

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

export const openaiAdapter: ProviderAdapter = {
  id: "openai",
  name: "OpenAI",
  async chat(req, cfg) {
    const base = cfg.baseUrl || OPENAI_DEFAULT;
    const body: Record<string, unknown> = {
      model: req.model || cfg.model,
      messages: req.messages,
      temperature: req.temperature,
      max_tokens: req.maxTokens,
      stream: false,
    };
    if (req.tools?.length) body.tools = req.tools;
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
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

  async streamChat(req, cfg, onChunk, signal) {
    const t0 = performance.now();
    const base = cfg.baseUrl || OPENAI_DEFAULT;
    const totalChars = (req.messages || []).reduce((s, m) => s + (m.content?.length || 0), 0);
    logProviderStart("openai", req.model || cfg.model, (req.messages || []).length, totalChars);
    let res: Response;
    try {
      const body: Record<string, unknown> = {
        model: req.model || cfg.model,
        messages: req.messages,
        temperature: req.temperature,
        max_tokens: req.maxTokens,
        stream: true,
        stream_options: { include_usage: true },
      };
      if (req.tools?.length) body.tools = req.tools;
      res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (e: any) {
      logProviderError("openai", e);
      throw e;
    }
    if (!res.ok || !res.body) {
      const err = await res.text();
      logProviderError("openai", new Error(err), res.status);
      throw new Error(`OpenAI error ${res.status}: ${err}`);
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
            for (const [idx, cur] of toolCallDeltas) {
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
    for (const [idx, cur] of toolCallDeltas) {
      if (!cur.name) continue;
      let args: unknown;
      try { args = JSON.parse(cur.argsBuffer); } catch { args = cur.argsBuffer; }
      finalToolCalls.push({ id: cur.id, name: cur.name, arguments: args as Record<string, unknown> });
    }
    logProviderDone("openai", req.model || cfg.model, Math.round(performance.now() - t0), usage);
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
      const base = cfg.baseUrl || OPENAI_DEFAULT;
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
