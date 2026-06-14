export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "ollama"
  | "openrouter"
  | "custom";

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  enabled: boolean;
  // for browser-auth providers
  authType: "api_key" | "browser_oauth" | "local";
  // for local providers
  localEndpoint?: string;
  /** Custom-only: name of the HTTP header that carries the API key (default: Authorization). */
  authHeaderName?: string;
  /** Custom-only: extra headers to send with every request. */
  extraHeaders?: Record<string, string>;
  /** Custom-only: a free-form label shown in the providers list. */
  displayLabel?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  reasoning?: string;
  timestamp: number;
  provider?: ProviderId;
  model?: string;
  toolCalls?: ToolCall[];
  toolResults?: Array<{ toolCallId: string; result: string; ok: boolean }>;
  attachments?: Array<{ name: string; type: string; size: number }>;
  error?: string;
  streaming?: boolean;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  latencyMs?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  result: unknown;
  error?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  // base64 or path
  data?: string;
  path?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  provider: ProviderId;
  model: string;
  projectId?: string | null;
}

export type ProjectMemoryScope = "all" | "project" | "none";

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  customInstructions?: string;
  memoryScope?: ProjectMemoryScope;
  pinned?: boolean;
  order?: number;
  files: ProjectFile[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  path?: string;
  addedAt: number;
}

export interface MemoryItem {
  id: string;
  content: string;
  tags: string[];
  createdAt: number;
  source: "user" | "auto";
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  prompt: string;
  enabled: boolean;
  icon?: string;
  category?: string;
  source?: "builtin" | "imported";
  sourcePath?: string;
}

export interface ProjectMemoryItem {
  id: string;
  projectId: string;
  content: string;
  createdAt: number;
}

export interface CustomCommand {
  id: string;
  trigger: string;     // phrase to match at the start of a user message
  label: string;
  action: "set_temperature" | "set_theme" | "set_concise" | "set_voice" | "switch_provider" | "run_shell" | "set_focus" | "remind";
  value: string;       // payload for the action
  enabled: boolean;
  createdAt: number;
}

export type PersonalityId =
  | "default"
  | "concise"
  | "friendly"
  | "code-mentor"
  | "therapist"
  | "custom";

export interface AppSettings {
  theme: "dark" | "light";
  voiceEnabled: boolean;
  voiceAutoSpeak: boolean;
  voiceWakeWord: boolean;
  voiceName: string;
  voiceRate: number;
  voicePitch: number;
  voiceLang: string;
  userName: string;
  providers: ProviderConfig[];
  activeProviderId: ProviderId;
  temperature: number;
  maxTokens: number;
  desktopControlEnabled: boolean;
  dataDir: string;
  onboardingComplete: boolean;
  voiceModeFullscreen: boolean;
  // Repository for "Report Error" — used to deep-link bug reports
  repoUrl: string;
  // Auto-rotate across providers when the active one fails
  autoFallback: boolean;
  // Cycle through ALL providers on error (including ones without valid keys).
  // When off, only rotates to providers that are enabled and have valid creds.
  cycleAllProviders: boolean;
  // Optional on-disk folder of `.md` skill files to import
  skillFolder: string;
  // Logs panel visibility + capture
  logsEnabled: boolean;
  // Display version
  version: string;
  // User profile picture (base64 data URL) and accent color (used in
  // the sidebar user pill and across the app to give the user identity)
  avatar?: string;
  accentColor?: string;
  // ---- MIRA additions ----
  // Custom wake word phrase (replaces hard-coded "hey mira")
  voiceWakeWordText?: string;
  // Personality / system prompt overrides
  personality?: PersonalityId;
  customSystemPrompt?: string;
  // Cached live model IDs per provider (populated by Settings → Fetch models).
  // Used by the model-cycling logic in the store.
  providerModels?: Partial<Record<ProviderId, string[]>>;
}

export interface ChatRequest {
  provider: ProviderId;
  model: string;
  messages: Array<{
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    toolCallId?: string;
    toolCalls?: ToolCall[];
  }>;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  stream?: boolean;
  signal?: AbortSignal;
}

export interface ChatResponse {
  content: string;
  reasoning?: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface DesktopAction {
  type:
    | "open_app"
    | "open_url"
    | "play_music"
    | "search_web"
    | "system_command"
    | "set_volume"
    | "notify"
    | "clipboard"
    | "screenshot"
    | "shutdown"
    | "lock";
  payload: Record<string, unknown>;
}
