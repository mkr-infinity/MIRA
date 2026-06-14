import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig } from "./base";
import { logProviderStart, logProviderDone, logProviderError } from "./devlog";

const GEMINI_DEFAULT =
  "https://generativelanguage.googleapis.com/v1beta/models";

export const geminiAdapter: ProviderAdapter = {
  id: "gemini",
  name: "Google Gemini",
  async chat(req, cfg) {
    const model = req.model || cfg.model;
    const url = `${GEMINI_DEFAULT}/${model}:generateContent?key=${cfg.apiKey}`;
    const systemMessages = req.messages.filter((m) => m.role === "system");
    const contents = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMessages.length
          ? {
              parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
            }
          : undefined,
        generationConfig: {
          temperature: req.temperature,
          maxOutputTokens: req.maxTokens,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return {
      content:
        data.candidates?.[0]?.content?.parts
          ?.map((p: { text: string }) => p.text)
          .join("") || "",
    };
  },

  async streamChat(req, cfg, onChunk, signal) {
    const t0 = performance.now();
    const model = req.model || cfg.model;
    const totalChars = (req.messages || []).reduce((s, m) => s + (m.content?.length || 0), 0);
    logProviderStart("gemini", model, (req.messages || []).length, totalChars);
    const url = `${GEMINI_DEFAULT}/${model}:streamGenerateContent?key=${cfg.apiKey}&alt=sse`;
    const systemMessages = req.messages.filter((m) => m.role === "system");
    const contents = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMessages.length
          ? {
              parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
            }
          : undefined,
        generationConfig: {
          temperature: req.temperature,
          maxOutputTokens: req.maxTokens,
        },
      }),
      signal,
    });
    if (!res.ok || !res.body) {
      const err = await res.text();
      logProviderError("gemini", new Error(err), res.status);
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let usageMeta: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } | undefined;
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
          const text = json.candidates?.[0]?.content?.parts
            ?.map((p: { text: string }) => p.text)
            .join("");
          if (text) {
            content += text;
            onChunk({ content: text });
          }
          if (json.usageMetadata) usageMeta = json.usageMetadata;
        } catch {
          // ignore
        }
      }
    }
    const usage = usageMeta
      ? {
          promptTokens: usageMeta.promptTokenCount || 0,
          completionTokens: usageMeta.candidatesTokenCount || 0,
          totalTokens: usageMeta.totalTokenCount || 0,
        }
      : undefined;
    logProviderDone("gemini", model, Math.round(performance.now() - t0), usage);
    return { content, usage };
  },

  async listModels(cfg) {
    if (!cfg.apiKey) return [];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${cfg.apiKey}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models || [])
        .map((m: { name: string }) => m.name.replace("models/", ""))
        .filter((n: string) => n.includes("gemini"));
    } catch {
      return [];
    }
  },
};
