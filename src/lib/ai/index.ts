import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig } from "./base";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { geminiAdapter } from "./gemini";
import { ollamaAdapter } from "./ollama";
import { openrouterAdapter } from "./openrouter";
import { customAdapter } from "./custom";
import type { ProviderId } from "../../types";

const adapters: Record<string, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  ollama: ollamaAdapter,
  openrouter: openrouterAdapter,
  custom: customAdapter,
};

export function getAdapter(id: ProviderId): ProviderAdapter {
  return adapters[id] || openaiAdapter;
}

export const allAdapters: ProviderAdapter[] = Object.values(adapters);

export type { ChatRequest, ChatResponse, ProviderConfig, ProviderAdapter };
