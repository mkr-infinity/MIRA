import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig } from "./base";
import { logProviderStart, logProviderDone, logProviderError } from "./devlog";

const OLLAMA_DEFAULT = "http://localhost:11434";

export const ollamaAdapter: ProviderAdapter = {
  id: "ollama",
  name: "Ollama (Local)",
  async chat(req, cfg) {
    const base = cfg.baseUrl || cfg.localEndpoint || OLLAMA_DEFAULT;
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: req.model || cfg.model,
        messages: req.messages,
        stream: false,
        options: {
          temperature: req.temperature,
          num_predict: req.maxTokens,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return { content: data.message?.content || "" };
  },

  async streamChat(req, cfg, onChunk, signal) {
    const t0 = performance.now();
    const base = cfg.baseUrl || cfg.localEndpoint || OLLAMA_DEFAULT;
    const totalChars = (req.messages || []).reduce((s, m) => s + (m.content?.length || 0), 0);
    logProviderStart("ollama", req.model || cfg.model, (req.messages || []).length, totalChars);
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: req.model || cfg.model,
        messages: req.messages,
        stream: true,
        options: {
          temperature: req.temperature,
          num_predict: req.maxTokens,
        },
      }),
      signal,
    });
    if (!res.ok || !res.body) {
      const err = await res.text();
      logProviderError("ollama", new Error(err), res.status);
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let content = "";
    let reasoning = "";
    let buffer = "";
    let promptTokens = 0;
    let completionTokens = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          const chunk = json.message?.content || "";
          const reasonChunk = json.message?.reasoning_content || "";
          if (chunk) {
            content += chunk;
            onChunk({ content: chunk });
          }
          if (reasonChunk) {
            reasoning += reasonChunk;
            onChunk({ reasoning: reasonChunk });
          }
          if (json.prompt_eval_count) promptTokens = json.prompt_eval_count;
          if (json.eval_count) completionTokens = json.eval_count;
        } catch {
          // ignore
        }
      }
    }
    const usage = (promptTokens || completionTokens)
      ? { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens }
      : undefined;
    logProviderDone("ollama", req.model || cfg.model, Math.round(performance.now() - t0), usage);
    return { content, reasoning: reasoning || undefined, usage };
  },

  async listModels(cfg) {
    try {
      const base = cfg.baseUrl || cfg.localEndpoint || OLLAMA_DEFAULT;
      const res = await fetch(`${base}/api/tags`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models || []).map((m: { name: string }) => m.name);
    } catch {
      return [];
    }
  },
};
