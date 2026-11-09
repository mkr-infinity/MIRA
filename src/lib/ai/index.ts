import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig } from "./base";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { geminiAdapter } from "./gemini";
import { ollamaAdapter } from "./ollama";
import { openrouterAdapter } from "./openrouter";
import { groqAdapter } from "./groq";
import { deepseekAdapter } from "./deepseek";
import { mistralAdapter } from "./mistral";
import { xaiAdapter } from "./xai";
import { togetherAdapter } from "./together";
import { customAdapter } from "./custom";
import type { ProviderId } from "../../types";

const adapters: Record<string, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  ollama: ollamaAdapter,
  openrouter: openrouterAdapter,
  groq: groqAdapter,
  deepseek: deepseekAdapter,
  mistral: mistralAdapter,
  xai: xaiAdapter,
  together: togetherAdapter,
  custom: customAdapter,
};

export function getAdapter(id: ProviderId): ProviderAdapter {
  return adapters[id] || openaiAdapter;
}

export const allAdapters: ProviderAdapter[] = Object.values(adapters);

export type { ChatRequest, ChatResponse, ProviderConfig, ProviderAdapter };
