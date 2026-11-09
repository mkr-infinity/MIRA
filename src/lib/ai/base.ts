import type { ChatRequest, ChatResponse, ToolDefinition, ProviderConfig, MessageContentPart } from "../../types";

export type { ChatRequest, ChatResponse, ToolDefinition, ProviderConfig, MessageContentPart } from "../../types";

/** Split a `data:image/png;base64,...` URL into mime + raw base64 payload. */
export function parseDataUrl(dataUrl: string): { mime: string; data: string } | null {
  const m = /^data:([^;,]+);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], data: m[2] };
}

/** Text-only view of a message's content (images ignored). */
export function contentToText(content: string | MessageContentPart[] | undefined): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content
    .filter((p): p is Extract<MessageContentPart, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Character count of the text portion of a message's content. */
export function contentLength(content: string | MessageContentPart[] | undefined): number {
  if (typeof content === "string") return content?.length || 0;
  return content?.reduce((s, p) => s + (p.type === "text" ? p.text.length : 0), 0) || 0;
}

/**
 * Messages in the OpenAI-compatible multimodal shape (used by the openai,
 * openrouter and custom adapters). Text-only messages keep their string
 * content; multimodal ones become `[{type:"text"},{type:"image_url"}]` parts.
 */
export function toOpenAiMessages(
  messages: ChatRequest["messages"]
): Array<{ role: string; content: unknown }> {
  return messages.map((m) => {
    if (typeof m.content === "string") {
      return { role: m.role, content: m.content };
    }
    const parts = m.content.map((p) =>
      p.type === "text"
        ? { type: "text", text: p.text }
        : { type: "image_url", image_url: { url: p.dataUrl } }
    );
    return { role: m.role, content: parts };
  });
}

export interface StreamChunk {
  content?: string;
  /** Reasoning / thinking tokens emitted by certain models (DeepSeek R1, Qwen, etc.). */
  reasoning?: string;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  chat(req: ChatRequest, cfg: ProviderConfig): Promise<ChatResponse>;
  streamChat(
    req: ChatRequest,
    cfg: ProviderConfig,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<ChatResponse>;
  listModels(cfg: ProviderConfig): Promise<string[]>;
}
