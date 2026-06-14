// Centralised metadata for each provider so we don't repeat strings in JSX.

import type { ProviderId } from "../../types";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  description: string;
  apiKeyUrl?: string;
  apiKeyLabel?: string;
  docsUrl?: string;
  modelsUrl?: string;
  signupLabel?: string;
  /** Local install one-liner shown in the empty state. */
  installHint?: string;
}

export const PROVIDER_META: Record<ProviderId, ProviderMeta> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, o1, o3-mini via OpenAI.",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    apiKeyLabel: "Get an OpenAI API key",
    docsUrl: "https://platform.openai.com/docs",
    modelsUrl: "https://platform.openai.com/docs/models",
    signupLabel: "OpenAI dashboard",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 3.5 / 3.7 / 4 via Anthropic.",
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    apiKeyLabel: "Get an Anthropic API key",
    docsUrl: "https://docs.anthropic.com",
    modelsUrl: "https://docs.anthropic.com/en/docs/about-claude/models",
    signupLabel: "Anthropic console",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    description: "Gemini 1.5 / 2.0 via Google AI Studio.",
    apiKeyUrl: "https://aistudio.google.com/apikey",
    apiKeyLabel: "Get a Gemini API key",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    modelsUrl: "https://ai.google.dev/gemini-api/docs/models",
    signupLabel: "Google AI Studio",
  },
  ollama: {
    id: "ollama",
    name: "Ollama (local)",
    description: "Run Llama, Qwen, Phi, Mistral and more on your machine.",
    docsUrl: "https://ollama.com/library",
    modelsUrl: "https://ollama.com/library",
    signupLabel: "Browse Ollama models",
    installHint: "Install from ollama.com, then `ollama pull llama3.2`",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified API for hundreds of models — Anthropic, Google, Meta, Mistral, and more.",
    apiKeyUrl: "https://openrouter.ai/keys",
    apiKeyLabel: "Get an OpenRouter API key",
    docsUrl: "https://openrouter.ai/docs",
    modelsUrl: "https://openrouter.ai/models",
    signupLabel: "OpenRouter dashboard",
  },
  custom: {
    id: "custom",
    name: "Custom",
    description: "Bring your own OpenAI-compatible endpoint. Supports custom base URL, API key, and auth headers.",
    docsUrl: "#",
    signupLabel: "Configure your endpoint",
  },
};

export function metaFor(id: ProviderId): ProviderMeta {
  return PROVIDER_META[id] ?? PROVIDER_META.openai;
}
