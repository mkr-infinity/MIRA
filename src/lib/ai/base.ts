import type { ChatRequest, ChatResponse, ToolDefinition, ProviderConfig } from "../../types";

export type { ChatRequest, ChatResponse, ToolDefinition, ProviderConfig } from "../../types";

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
