import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig } from "./base";
import { logProviderStart, logProviderDone, logProviderError } from "./devlog";

const OPENAI_DEFAULT = "https://api.openai.com/v1";

export const openaiAdapter: ProviderAdapter = {
  id: "openai",
  name: "OpenAI",
  async chat(req, cfg) {
    const base = cfg.baseUrl || OPENAI_DEFAULT;
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model || cfg.model,
        messages: req.messages,
        temperature: req.temperature,
        max_tokens: req.maxTokens,
        stream: false,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
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
      res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: req.model || cfg.model,
          messages: req.messages,
          temperature: req.temperature,
          max_tokens: req.maxTokens,
          stream: true,
          stream_options: { include_usage: true },
        }),
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
          const delta = json.choices?.[0]?.delta?.content;
          const reasoningDelta = json.choices?.[0]?.delta?.reasoning_content;
          if (delta) {
            content += delta;
            onChunk({ content: delta });
          }
          if (reasoningDelta) {
            reasoning += reasoningDelta;
            onChunk({ reasoning: reasoningDelta });
          }
          if (json.usage) {
            usage = {
              promptTokens: json.usage.prompt_tokens || 0,
              completionTokens: json.usage.completion_tokens || 0,
              totalTokens: json.usage.total_tokens || 0,
            };
          }
        } catch {
          // ignore
        }
      }
    }
    logProviderDone("openai", req.model || cfg.model, Math.round(performance.now() - t0), usage);
    return { content, reasoning: reasoning || undefined, usage };
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
