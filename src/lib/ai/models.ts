// Curated model details. Used as a fallback when the live API doesn't return
// metadata, and to enrich simple model lists with context window, capabilities,
// and human-readable descriptions.

export interface ModelMeta {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutput: number;
  description: string;
  capabilities: string[];
  pricing?: { input: number; output: number; unit: "per_1m_tokens" };
  releaseDate?: string;
}

export const KNOWN_MODELS: ModelMeta[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    maxOutput: 16384,
    description:
      "OpenAI's flagship multimodal model. Fast, smart, handles text and vision. Best for most tasks.",
    capabilities: ["text", "vision", "tools", "json"],
    pricing: { input: 2.5, output: 10, unit: "per_1m_tokens" },
    releaseDate: "2024-05",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    contextWindow: 128000,
    maxOutput: 16384,
    description:
      "Smaller, faster, much cheaper. Great for everyday chat and quick tasks.",
    capabilities: ["text", "vision", "tools", "json"],
    pricing: { input: 0.15, output: 0.6, unit: "per_1m_tokens" },
    releaseDate: "2024-07",
  },
  {
    id: "o1-preview",
    name: "o1-preview",
    provider: "openai",
    contextWindow: 128000,
    maxOutput: 32768,
    description:
      "Reasoning model. Thinks step-by-step before answering. Slower, better at math and code.",
    capabilities: ["text", "reasoning", "tools"],
    pricing: { input: 15, output: 60, unit: "per_1m_tokens" },
    releaseDate: "2024-09",
  },
  {
    id: "o1-mini",
    name: "o1-mini",
    provider: "openai",
    contextWindow: 128000,
    maxOutput: 65536,
    description:
      "Smaller reasoning model. Faster than o1-preview, still very capable at code and logic.",
    capabilities: ["text", "reasoning", "tools"],
    pricing: { input: 3, output: 12, unit: "per_1m_tokens" },
    releaseDate: "2024-09",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    contextWindow: 128000,
    maxOutput: 4096,
    description: "Previous generation flagship. Still excellent, often cheaper than 4o.",
    capabilities: ["text", "vision", "tools", "json"],
    pricing: { input: 10, output: 30, unit: "per_1m_tokens" },
    releaseDate: "2024-04",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    contextWindow: 16385,
    maxOutput: 4096,
    description: "Older but very fast and cheap. Good for simple tasks.",
    capabilities: ["text", "tools", "json"],
    pricing: { input: 0.5, output: 1.5, unit: "per_1m_tokens" },
    releaseDate: "2023-06",
  },

  // Anthropic
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutput: 8192,
    description:
      "Anthropic's best balance of speed and intelligence. Excellent at code, writing, and analysis.",
    capabilities: ["text", "vision", "tools"],
    pricing: { input: 3, output: 15, unit: "per_1m_tokens" },
    releaseDate: "2024-10",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutput: 8192,
    description: "Fast and cheap. Great for everyday chat and lightweight tasks.",
    capabilities: ["text", "tools"],
    pricing: { input: 0.8, output: 4, unit: "per_1m_tokens" },
    releaseDate: "2024-11",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
    maxOutput: 4096,
    description:
      "Most intelligent Claude 3 model. Best for complex reasoning and long documents.",
    capabilities: ["text", "vision", "tools"],
    pricing: { input: 15, output: 75, unit: "per_1m_tokens" },
    releaseDate: "2024-02",
  },

  // Google
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    contextWindow: 2000000,
    maxOutput: 8192,
    description:
      "Google's top model. Massive 2M context window — fits entire codebases or books.",
    capabilities: ["text", "vision", "audio", "tools"],
    pricing: { input: 1.25, output: 5, unit: "per_1m_tokens" },
    releaseDate: "2024-05",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    contextWindow: 1000000,
    maxOutput: 8192,
    description: "Fast and cheap Gemini. Great default for quick tasks.",
    capabilities: ["text", "vision", "audio", "tools"],
    pricing: { input: 0.075, output: 0.3, unit: "per_1m_tokens" },
    releaseDate: "2024-05",
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash (Experimental)",
    provider: "gemini",
    contextWindow: 1000000,
    maxOutput: 8192,
    description: "Next-gen Gemini with improved tool use and multimodal reasoning.",
    capabilities: ["text", "vision", "audio", "tools"],
    releaseDate: "2024-12",
  },

  // Ollama / local
  {
    id: "llama3.2",
    name: "Llama 3.2",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 8192,
    description: "Meta's latest open model. Good general-purpose, runs locally.",
    capabilities: ["text", "tools"],
    releaseDate: "2024-09",
  },
  {
    id: "llama3.1",
    name: "Llama 3.1",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 8192,
    description: "Meta's previous generation. Strong open-weight baseline.",
    capabilities: ["text", "tools"],
    releaseDate: "2024-07",
  },
  {
    id: "qwen2.5",
    name: "Qwen 2.5",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 8192,
    description: "Alibaba's strong open model. Great at code and multilingual tasks.",
    capabilities: ["text", "tools"],
    releaseDate: "2024-09",
  },
  {
    id: "mistral",
    name: "Mistral",
    provider: "ollama",
    contextWindow: 32000,
    maxOutput: 8192,
    description: "Mistral AI's compact model. Fast and efficient.",
    capabilities: ["text", "tools"],
    releaseDate: "2024-07",
  },
  {
    id: "phi3",
    name: "Phi-3",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 4096,
    description: "Microsoft's small but capable model. Runs on modest hardware.",
    capabilities: ["text"],
    releaseDate: "2024-04",
  },
  {
    id: "gemma2",
    name: "Gemma 2",
    provider: "ollama",
    contextWindow: 8192,
    maxOutput: 4096,
    description: "Google's open model. Good for chat, summarisation, and simple tasks.",
    capabilities: ["text"],
    releaseDate: "2024-07",
  },
  {
    id: "gemma3",
    name: "Gemma 3",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 8192,
    description: "Google's latest open model. Strong multilingual, runs on a single GPU.",
    capabilities: ["text", "vision"],
    releaseDate: "2025-03",
  },
  {
    id: "phi3.5",
    name: "Phi-3.5",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 4096,
    description: "Microsoft's small but capable model. Runs on modest hardware.",
    capabilities: ["text"],
    releaseDate: "2024-08",
  },
  {
    id: "codellama",
    name: "CodeLlama",
    provider: "ollama",
    contextWindow: 16384,
    maxOutput: 4096,
    description: "Meta's code-focused model. Strong at completions and refactors.",
    capabilities: ["text", "code"],
    releaseDate: "2024-01",
  },
  {
    id: "deepseek-coder-v2",
    name: "DeepSeek Coder V2",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 8192,
    description: "Mixture-of-experts code model. Excellent for long-context code tasks.",
    capabilities: ["text", "code"],
    releaseDate: "2024-06",
  },
  {
    id: "mistral-nemo",
    name: "Mistral Nemo",
    provider: "ollama",
    contextWindow: 128000,
    maxOutput: 8192,
    description: "Mistral + NVIDIA. Compact 12B with strong reasoning.",
    capabilities: ["text", "tools"],
    releaseDate: "2024-07",
  },
];

export function findModelMeta(id: string): ModelMeta | undefined {
  return KNOWN_MODELS.find(
    (m) => m.id.toLowerCase() === id.toLowerCase()
  );
}

export function modelsForProvider(provider: string): ModelMeta[] {
  return KNOWN_MODELS.filter((m) => m.provider === provider);
}

export function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
}
