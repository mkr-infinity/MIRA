import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig } from "./base";
import { logProviderStart, logProviderDone, logProviderError } from "./devlog";

const ANTHROPIC_DEFAULT = "https://api.anthropic.com/v1";

export const anthropicAdapter: ProviderAdapter = {
  id: "anthropic",
  name: "Anthropic Claude",
  async chat(req, cfg) {
    const base = cfg.baseUrl || ANTHROPIC_DEFAULT;
    const systemMessages = req.messages.filter((m) => m.role === "system");
    const conversationMessages = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch(`${base}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.apiKey || "",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: req.model || cfg.model,
        max_tokens: req.maxTokens || 4096,
        temperature: req.temperature,
        system: systemMessages.map((m) => m.content).join("\n\n") || undefined,
        messages: conversationMessages,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return {
      content:
        data.content?.map((b: { text: string }) => b.text).join("") || "",
      usage: data.usage && {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
      },
    };
  },

  async streamChat(req, cfg, onChunk, signal) {
    const t0 = performance.now();
    const base = cfg.baseUrl || ANTHROPIC_DEFAULT;
    const totalChars = (req.messages || []).reduce((s, m) => s + (m.content?.length || 0), 0);
    logProviderStart("anthropic", req.model || cfg.model, (req.messages || []).length, totalChars);
    const systemMessages = req.messages.filter((m) => m.role === "system");
    const conversationMessages = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch(`${base}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.apiKey || "",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: req.model || cfg.model,
        max_tokens: req.maxTokens || 4096,
        temperature: req.temperature,
        system: systemMessages.map((m) => m.content).join("\n\n") || undefined,
        messages: conversationMessages,
        stream: true,
      }),
      signal,
    });
    if (!res.ok || !res.body) {
      const err = await res.text();
      logProviderError("anthropic", new Error(err), res.status);
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let inputTokens = 0;
    let outputTokens = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data) continue;
        try {
          const json = JSON.parse(data);
          if (json.type === "content_block_delta" && json.delta?.text) {
            content += json.delta.text;
            onChunk({ content: json.delta.text });
          }
          if (json.type === "message_delta" && json.usage) {
            inputTokens = json.usage.input_tokens || inputTokens;
            outputTokens = json.usage.output_tokens || outputTokens;
          }
          if (json.type === "message_start" && json.message?.usage) {
            inputTokens = json.message.usage.input_tokens || inputTokens;
          }
        } catch {
          // ignore
        }
      }
    }
    const usage = (inputTokens || outputTokens)
      ? { promptTokens: inputTokens, completionTokens: outputTokens, totalTokens: inputTokens + outputTokens }
      : undefined;
    logProviderDone("anthropic", req.model || cfg.model, Math.round(performance.now() - t0), usage);
    return { content, usage };
  },

  async listModels() {
    return [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];
  },
};
