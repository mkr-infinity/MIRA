import { create } from "zustand";
import type {
  AppSettings,
  Conversation,
  Message,
  MemoryItem,
  Skill,
  ProviderId,
  ProviderConfig,
  Project,
  ProjectFile,
  ProjectMemoryItem,
  CustomCommand,
} from "../types";
import { storage, defaultSettings, defaultSkills } from "../lib/storage";
import { getAdapter } from "../lib/ai";
import { tts } from "../lib/voice/tts";
import { buildSystemPrompt } from "../lib/mira";
import { isTauri } from "../lib/platform";
import { devlog } from "../lib/log";
import type { ThemeId } from "../lib/theme";
import { parseAndExecuteToolCalls, DESKTOP_TOOL_DEFS } from "../lib/desktop";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  provider: ProviderId;
  model: string;
  message: string;
  reason: string;
  status?: number;
  hint?: string;
  context?: string;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
  meta?: Record<string, unknown>;
}

const LOG_LIMIT = 1000;

interface State {
  ready: boolean;
  settings: AppSettings;
  conversations: Conversation[];
  activeId: string | null;
  memory: MemoryItem[];
  skills: Skill[];
  projects: Project[];
  projectMemory: ProjectMemoryItem[];
  customCommands: CustomCommand[];
  activeProjectId: string | null;
  logs: LogEntry[];
  // transient
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  voiceTranscript: string;
  voiceMode: boolean;
  errors: ErrorLog[];
}

interface Actions {
  init: () => Promise<void>;
  setTheme: (t: ThemeId) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  setActiveProvider: (id: ProviderId) => Promise<void>;
  setProviderConfig: (id: ProviderId, patch: Partial<ProviderConfig>) => Promise<void>;
  setProviderModels: (id: ProviderId, models: string[]) => Promise<void>;
  newConversation: (projectId?: string | null) => string;
  setActive: (id: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  regenerate: () => Promise<void>;
  setListening: (b: boolean) => void;
  setSpeaking: (b: boolean) => void;
  setVoiceTranscript: (s: string) => void;
  setVoiceMode: (b: boolean) => void;
  addMemory: (m: Omit<MemoryItem, "id" | "createdAt">) => Promise<void>;
  removeMemory: (id: string) => Promise<void>;
  saveSkill: (s: Skill) => Promise<void>;
  removeSkill: (id: string) => Promise<void>;
  toggleSkill: (id: string) => Promise<void>;
  importSkills: (skills: Skill[]) => Promise<void>;
  loadSkillFolder: () => Promise<{ loaded: number; message: string }>;
  // projects
  createProject: (p: Partial<Project>) => string;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addProjectFile: (id: string, file: ProjectFile) => Promise<void>;
  removeProjectFile: (projectId: string, fileId: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;
  pinProject: (id: string, pinned: boolean) => Promise<void>;
  moveProject: (id: string, direction: "up" | "down") => Promise<void>;
  addProjectMemory: (projectId: string, content: string) => Promise<void>;
  removeProjectMemory: (itemId: string) => Promise<void>;
  addCustomCommand: (cmd: Omit<CustomCommand, "id" | "createdAt">) => Promise<void>;
  updateCustomCommand: (id: string, patch: Partial<CustomCommand>) => Promise<void>;
  removeCustomCommand: (id: string) => Promise<void>;
  // errors
  logError: (e: Omit<ErrorLog, "id" | "timestamp">) => ErrorLog;
  log: (level: LogLevel, source: string, message: string, meta?: Record<string, unknown>) => LogEntry | null;
  clearLogs: () => void;
  clearError: (id: string) => void;
  patchMessage: (convId: string, msgId: string, patch: Partial<Message>) => void;
  searchMessageQuery: string;
  searchMessageResults: string[];
  setSearchMessageQuery: (q: string) => void;
  searchInConversation: () => void;
  exportConversations: () => void;
  importConversations: () => Promise<void>;
}

const abortControllers = new Map<string, AbortController>();

export const useStore = create<State & Actions>((set, get) => ({
  ready: false,
  settings: defaultSettings(),
  conversations: [],
  activeId: null,
  memory: [],
  skills: [],
  projects: [],
  projectMemory: [],
  customCommands: [],
  activeProjectId: null,
  logs: [],
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  voiceTranscript: "",
  voiceMode: false,
  errors: [],
  searchMessageQuery: "",
  searchMessageResults: [],

  async init() {
    const [settings, conversations, memory, skills, projects, projectMemory, customCommands] = await Promise.all([
      storage.getSettings(),
      storage.getConversations(),
      storage.getMemory(),
      storage.getSkills(),
      storage.getProjects(),
      storage.getProjectMemory(),
      storage.getCustomCommands(),
    ]);
    set({
      settings,
      conversations,
      memory,
      skills,
      projects,
      projectMemory,
      customCommands,
      ready: true,
      activeId: conversations[0]?.id || null,
    });
    devlog("init", `Loaded store: ${conversations.length} convs, ${memory.length} memory, ${skills.length} skills, ${projects.length} projects, ${projectMemory.length} proj-memory, ${customCommands.length} cmds`, {
      tauri: isTauri(),
      dataDir: settings.dataDir,
    });

    // Auto-load any on-disk skill folder (desktop only)
    if (settings.skillFolder) {
      try {
        const res = await get().loadSkillFolder();
        devlog("init", `Skill folder reloaded: ${res.loaded} skill(s)`, { folder: settings.skillFolder });
      } catch (e: any) {
        devlog("init", `Skill folder reload failed: ${e?.message || e}`, { folder: settings.skillFolder }, "warn");
      }
    }
  },

  async setTheme(t: ThemeId) {
    const settings = { ...get().settings, theme: t };
    set({ settings });
    await storage.saveSettings(settings);
    const root = document.documentElement;
    root.setAttribute("data-theme", t);
    root.classList.toggle("dark", t === "dark" || t === "cyberpunk" || t === "neon");
    root.classList.toggle("light", t === "light" || t === "earth" || t === "nordic" || t === "sakura");
    try { localStorage.setItem("mira:initial-theme", t); } catch {}
    devlog("settings", `Theme → ${t}`);
  },

  async updateSettings(patch) {
    const keys = Object.keys(patch);
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await storage.saveSettings(settings);
    if (keys.length) devlog("settings", `Updated ${keys.join(", ")}`, patch as Record<string, unknown>, "debug");
  },

  async setActiveProvider(id) {
    const prev = get().settings.activeProviderId;
    await get().updateSettings({ activeProviderId: id });
    if (prev !== id) devlog("providers", `Active provider: ${prev} → ${id}`);
  },

  async setProviderConfig(id, patch) {
    const settings = { ...get().settings };
    settings.providers = settings.providers.map((p) =>
      p.id === id ? { ...p, ...patch } : p
    );
    set({ settings });
    await storage.saveSettings(settings);
    devlog("providers", `Provider config updated: ${id}`, { fields: Object.keys(patch) });
  },

  async setProviderModels(id, models) {
    const settings = { ...get().settings };
    const next = { ...(settings.providerModels || {}) };
    if (models.length === 0) {
      delete next[id];
    } else {
      next[id] = models;
    }
    settings.providerModels = next;
    set({ settings });
    await storage.saveSettings(settings);
  },

  newConversation(projectId) {
    const id = uid();
    const settings = get().settings;
    const provider = settings.providers.find(
      (p) => p.id === settings.activeProviderId
    ) ?? settings.providers[0];
    if (!provider) return id;
    const targetProject =
      projectId !== undefined
        ? projectId
        : get().activeProjectId;
    const conv: Conversation = {
      id,
      title: "New conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: settings.activeProviderId,
      model: provider.model,
      projectId: targetProject,
    };
    const conversations = [conv, ...get().conversations];
    set({ conversations, activeId: id, activeProjectId: targetProject });
    storage.saveConversations(conversations).catch((e) =>
      devlog("storage", `Failed to save conversations: ${e}`)
    );
    devlog("conversation", `New conversation ${id} (${provider.name}/${provider.model})`, {
      projectId: targetProject, provider: settings.activeProviderId,
    });
    return id;
  },

  setActive(id) {
    set({ activeId: id });
    const conv = get().conversations.find((c) => c.id === id);
    if (conv) devlog("conversation", `Active → ${id} (${conv.title})`);
  },

  async deleteConversation(id) {
    const conv = get().conversations.find((c) => c.id === id);
    const conversations = get().conversations.filter((c) => c.id !== id);
    const activeId = get().activeId === id ? conversations[0]?.id || null : get().activeId;
    set({ conversations, activeId });
    await storage.saveConversations(conversations);
    devlog("conversation", `Deleted ${id}${conv ? ` (${conv.title})` : ""}`, { count: conversations.length });
  },

  async renameConversation(id, title) {
    const conversations = get().conversations.map((c) =>
      c.id === id ? { ...c, title } : c
    );
    set({ conversations });
    await storage.saveConversations(conversations);
    devlog("conversation", `Renamed ${id} → "${title}"`);
  },

  async sendMessage(text) {
    if (!text.trim()) return;
    const { settings, conversations, activeId, projects, memory, skills } = get();
    let conv = conversations.find((c) => c.id === activeId);
    if (!conv) {
      const id = get().newConversation();
      conv = get().conversations.find((c) => c.id === id);
      if (!conv) return;
    }

    // Sync conversation provider/model with current active provider
    const activeProvider = settings.providers.find(
      (p) => p.id === settings.activeProviderId
    );
    if (activeProvider && conv && (conv.provider !== activeProvider.id || conv.model !== activeProvider.model)) {
      const convId = conv.id;
      const synced = get().conversations.map((c) =>
        c.id === convId
          ? { ...c, provider: activeProvider.id, model: activeProvider.model }
          : c
      );
      set({ conversations: synced });
      conv = { ...conv, provider: activeProvider.id, model: activeProvider.model };
    }

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    const assistantMsg: Message = {
      id: uid(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      provider: conv.provider,
      model: conv.model,
      streaming: true,
    };

    const updated = get().conversations.map((c) =>
      c.id === conv!.id
        ? {
            ...c,
            messages: [...c.messages, userMsg, assistantMsg],
            updatedAt: Date.now(),
            title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
          }
        : c
    );
    set({ conversations: updated, isProcessing: true });
    await storage.saveConversations(updated);

    if (conv.messages.length === 0) {
      get().renameConversation(conv.id, text.slice(0, 48));
    }

    tts.stop();
    set({ isSpeaking: false });

    const ac = new AbortController();
    abortControllers.set(conv.id, ac);

    // Hard timeout: if the entire request takes > 120s, abort it
    const TIMEOUT_MS = 120_000;
    const timeoutId = setTimeout(() => {
      if (!ac.signal.aborted) {
        devlog("sendMessage", `Request timed out after ${TIMEOUT_MS}ms, aborting`);
        ac.abort();
      }
    }, TIMEOUT_MS);

    const provider = settings.providers.find((p) => p.id === conv!.provider);

    devlog("sendMessage", `→ ${conv!.provider}/${provider?.model || "?"} (${text.length} chars)`, {
      conv: conv!.id,
      userMsgId: userMsg.id,
      assistantMsgId: assistantMsg.id,
      history: conv!.messages.length,
    });

    if (!provider) {
      get().patchMessage(conv.id, assistantMsg.id, {
        content:
          "No active AI provider. Open Settings and connect one — I can walk you through it.",
        streaming: false,
        error: "no_provider",
      });
      set({ isProcessing: false });
      return;
    }
    if (provider.authType === "api_key" && !provider.apiKey) {
      get().patchMessage(conv.id, assistantMsg.id, {
        content: `${provider.name} isn't connected. Add your API key in Settings → Providers, and we'll pick up where we left off.`,
        streaming: false,
        error: "missing_key",
      });
      set({ isProcessing: false });
      return;
    }
    if (provider.authType === "browser_oauth" && !provider.apiKey) {
      get().patchMessage(conv.id, assistantMsg.id, {
        content: `${provider.name} isn't signed in. Open Settings → Providers and click "Sign in" — your token will be saved locally.`,
        streaming: false,
        error: "not_signed_in",
      });
      set({ isProcessing: false });
      return;
    }

    const project = conv.projectId
      ? projects.find((p) => p.id === conv.projectId)
      : undefined;

    const sysPrompt = buildSystemPrompt({
      personality: settings.personality || "default",
      customSystemPrompt: settings.customSystemPrompt,
      projectInstructions: project?.customInstructions,
      projectFiles: project?.files,
      memory: memory.map((m) => ({ content: m.content })),
      skills: skills.filter((s) => s.enabled),
      userName: settings.userName,
      desktopControlEnabled: settings.desktopControlEnabled,
    });

    const apiMessages = [
      { role: "system" as const, content: sysPrompt },
      ...conv.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system" | "tool",
        content: m.content,
        toolCallId: m.toolResults?.[0]?.toolCallId,
      })),
      { role: "user" as const, content: text },
    ];

    const adapter = getAdapter(conv.provider);
    let accumulated = "";
    let accumulatedReasoning = "";
    let usedProvider = provider;
    let usedProviderId: ProviderId = conv.provider;
    let usedModel = conv.model;

    // Provider usability check (used for fallback chain)
    const isUsable = (p: typeof provider) => {
      if (!p || !p.enabled) return false;
      if (p.authType === "api_key") return !!p.apiKey;
      if (p.authType === "browser_oauth") return !!p.apiKey;
      if (p.authType === "local") return true;
      return false;
    };

    // Build the cycling chain.
    //
    // Order of attempts when the active (provider, model) fails:
    //   1. Other cached models on the SAME provider
    //   2. Other providers in `providers[]` order (only usable ones,
    //      unless `cycleAllProviders` is on)
    //
    // Each step is tried exactly once. The first one to succeed wins
    // and its (provider, model) is persisted on the conversation so the
    // working model stays sticky for future messages.
    type Step = { provider: ProviderConfig; model: string; id: ProviderId };
    const cycleChain: Step[] = [];
    if (settings.autoFallback) {
      // 1) same-provider sibling models (from cached `providerModels`)
      const cached = settings.providerModels?.[conv.provider] || [];
      for (const m of cached) {
        if (m && m !== conv.model) cycleChain.push({ provider, model: m, id: conv.provider });
      }
      // 2) other providers
      const startIdx = settings.providers.findIndex((p) => p.id === conv.provider);
      const cycleAll = !!settings.cycleAllProviders;
      for (let i = 1; i < settings.providers.length; i++) {
        const p = settings.providers[(startIdx + i) % settings.providers.length];
        if (p.id === conv.provider) continue;
        if (!cycleAll && !isUsable(p)) continue;
        cycleChain.push({ provider: p, model: p.model, id: p.id });
      }
    }

    let lastUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;
    let lastLatencyMs = 0;

    const attempt = async (prov: ProviderConfig, model: string) => {
      const a = getAdapter(prov.id);
      const t0 = performance.now();
      const tools = settings.desktopControlEnabled ? DESKTOP_TOOL_DEFS : undefined;
      const res = await a.streamChat(
        {
          provider: prov.id,
          model,
          messages: apiMessages,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          stream: true,
          tools,
        },
        prov,
        (chunk) => {
          if (chunk.content) accumulated += chunk.content;
          if (chunk.reasoning) accumulatedReasoning += chunk.reasoning;
          get().patchMessage(conv!.id, assistantMsg.id, { content: accumulated, reasoning: accumulatedReasoning });
        },
        ac.signal
      );
      lastLatencyMs = Math.round(performance.now() - t0);
      if (res.usage) lastUsage = res.usage;
      return res;
    };

    // Try the active (provider, model) first. If it fails, walk the
    // cycle chain one step at a time. Any error in the chain triggers
    // a try of the next (provider, model) pair — not just retryable ones,
    // because a 404 on a specific model shouldn't be terminal.
    const tried = new Set<string>([`${conv.provider}::${conv.model}`]);
    let firstError: any = null;
    let firstCls: ReturnType<typeof classifyError> | null = null;
    let lastError: any = null;
    let lastCls: ReturnType<typeof classifyError> | null = null;
    let fellBack = false;
    let firstAttempt = true;

    // Outer loop: try the current target, then walk the cycle.
    const tryOnce = async (prov: ProviderConfig, model: string) => {
      if (ac.signal.aborted) throw new Error("aborted");
      return attempt(prov, model);
    };

    // Initial attempt with the active (provider, model)
    try {
      await tryOnce(provider, conv.model);
      usedProvider = provider;
      usedProviderId = conv.provider;
      usedModel = conv.model;
    } catch (e: any) {
      firstError = e;
      firstCls = classifyError(e, provider.name);
      lastError = e;
      lastCls = firstCls;
      firstAttempt = false;
    }

    // Walk the cycle chain if we haven't already won.
    if (!firstAttempt) {
      for (const step of cycleChain) {
        const key = `${step.id}::${step.model}`;
        if (tried.has(key)) continue;
        tried.add(key);
        // Surface the switch to the user
        const label = step.id === conv.provider
          ? `${provider.name} → ${step.model}`
          : `${step.provider.name} (${step.model})`;
        accumulated = "";
        get().patchMessage(conv!.id, assistantMsg.id, {
          content: `*${firstCls?.reason ? `${firstCls.reason} on ${provider.name} — ` : ""}Retrying with ${label}…*\n\n`,
          streaming: true,
        });
        try {
          await tryOnce(step.provider, step.model);
          usedProvider = step.provider;
          usedProviderId = step.id;
          usedModel = step.model;
          // Persist the swap on the conversation so the working model
          // becomes the new default for the rest of the chat.
          const swapped = get().conversations.map((c) =>
            c.id === conv!.id ? { ...c, provider: step.id, model: step.model } : c
          );
          set({ conversations: swapped });
          await storage.saveConversations(swapped);
          fellBack = true;
          break;
        } catch (inner: any) {
          lastError = inner;
          lastCls = classifyError(inner, step.provider.name);
          // continue to the next step
        }
      }
    }

    // If nothing in the chain worked, surface the most recent error
    // to the assistant message and to the error log.
    if (!firstAttempt && !fellBack) {
      const cls = lastCls || firstCls!;
      const e = lastError || firstError;
      const reason = cls.reason;
      const status = cls.status;
      const hint = cls.hint;
      get().logError({
        provider: usedProviderId,
        model: usedModel,
        message: e?.message || String(e),
        reason,
        hint,
        status,
        context: `Last user message: "${text.slice(0, 200)}"`,
      });
      get().patchMessage(conv!.id, assistantMsg.id, {
        content:
          (accumulated ? accumulated + "\n\n---\n\n" : "") +
          `**I ran into a problem with ${usedProvider.name}.**\n\n` +
          `**Reason:** ${reason}\n` +
          (status ? `**Status:** ${status}\n` : "") +
          `**Hint:** ${hint}`,
        streaming: false,
        error: `${reason}${status ? ` (HTTP ${status})` : ""}`,
      });
    } else if (fellBack) {
      get().patchMessage(conv!.id, assistantMsg.id, {
        content: accumulated,
        streaming: false,
        usage: lastUsage,
        latencyMs: lastLatencyMs,
      });
    }

    // Final content to display and speak
    let finalContent = accumulated || "";
    let displayContent = finalContent;
    let toolResults: string[] = [];

    // Execute tool calls BEFORE speaking/displaying
    if (finalContent && settings.desktopControlEnabled) {
      try {
        toolResults = await parseAndExecuteToolCalls(finalContent);
        const toolPattern = /\b(?:open_app|open_url|play_music|search_web|set_volume|notify|type_text|open_folder|list_running_apps|run_command|clipboard_write|clipboard_read|remember)\s*\([^)]*\)\s*/g;
        displayContent = finalContent.replace(toolPattern, "").replace(/\s+/g, " ").trim();
      } catch (e: any) {
        devlog("sendMessage", `Tool execution error: ${e?.message}`);
      }
    }

    // Patch final display content
    if (finalContent) {
      let patchedContent = displayContent || finalContent;
      if (toolResults.length) {
        patchedContent += "\n\n" + toolResults.map((r) => `> ${r}`).join("\n");
      }
      get().patchMessage(conv!.id, assistantMsg.id, {
        content: patchedContent,
        streaming: false,
        usage: lastUsage,
        latencyMs: lastLatencyMs,
      });

      // Speak the CLEANED version (without tool call syntax)
      const speakText = displayContent || finalContent;
      if (settings.voiceAutoSpeak && speakText) {
        set({ isSpeaking: true });
        tts.speak(stripMarkdown(speakText), {
          voice: settings.voiceName,
          rate: settings.voiceRate,
          pitch: settings.voicePitch,
          onEnd: () => set({ isSpeaking: false }),
          onError: () => set({ isSpeaking: false }),
        });
      }
    }

    clearTimeout(timeoutId);
    abortControllers.delete(conv.id);
    set({ isProcessing: false });
    get().log("info", "sendMessage", `Completed turn: ${usedProvider.name}/${usedModel}`, {
      latencyMs: lastLatencyMs,
      tokens: lastUsage?.totalTokens,
    });
  },

  stopGeneration() {
    const { activeId } = get();
    if (activeId && abortControllers.has(activeId)) {
      abortControllers.get(activeId)!.abort();
      devlog("sendMessage", `Stopped generation on ${activeId}`);
    }
    tts.stop();
    set({ isProcessing: false, isSpeaking: false });
  },

  async regenerate() {
    const { activeId, conversations } = get();
    const conv = conversations.find((c) => c.id === activeId);
    if (!conv) return;
    const lastUserIdx = [...conv.messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const realIdx = conv.messages.length - 1 - lastUserIdx;
    const lastUser = conv.messages[realIdx];
    const trimmed = conv.messages.slice(0, realIdx);
    const updated = get().conversations.map((c) =>
      c.id === conv.id ? { ...c, messages: trimmed } : c
    );
    set({ conversations: updated });
    await storage.saveConversations(updated);
    devlog("sendMessage", `Regenerating: "${lastUser.content.slice(0, 60)}…"`);
    await get().sendMessage(lastUser.content);
  },

  setListening(b) {
    set({ isListening: b });
    devlog("voice", `Listening: ${b}`);
  },
  setSpeaking(b) {
    set({ isSpeaking: b });
    devlog("voice", `Speaking: ${b}`);
  },
  setVoiceTranscript(s) {
    set({ voiceTranscript: s });
  },
  setVoiceMode(b) {
    set({ voiceMode: b });
    devlog("voice", `Voice mode: ${b}`);
  },

  async addMemory(m) {
    const item: MemoryItem = { ...m, id: uid(), createdAt: Date.now() };
    const memory = [item, ...get().memory];
    set({ memory });
    await storage.saveMemory(memory);
    devlog("memory", `Added: "${m.content.slice(0, 80)}"`, { tags: m.tags, source: m.source });
  },
  async removeMemory(id) {
    const item = get().memory.find((m) => m.id === id);
    const memory = get().memory.filter((m) => m.id !== id);
    set({ memory });
    await storage.saveMemory(memory);
    devlog("memory", `Removed ${id}${item ? ` (${item.content.slice(0, 60)})` : ""}`);
  },

  async saveSkill(s) {
    const exists = get().skills.some((x) => x.id === s.id);
    const skills = exists
      ? get().skills.map((x) => (x.id === s.id ? s : x))
      : [s, ...get().skills];
    set({ skills });
    await storage.saveSkills(skills);
    devlog("skills", `${exists ? "Updated" : "Added"} skill: ${s.name}`, { category: s.category });
  },
  async removeSkill(id) {
    const skill = get().skills.find((s) => s.id === id);
    const skills = get().skills.filter((s) => s.id !== id);
    set({ skills });
    await storage.saveSkills(skills);
    devlog("skills", `Removed ${id}${skill ? ` (${skill.name})` : ""}`);
  },
  async toggleSkill(id) {
    const skill = get().skills.find((s) => s.id === id);
    const skills = get().skills.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    set({ skills });
    await storage.saveSkills(skills);
    if (skill) devlog("skills", `Toggled ${skill.name} → ${!skill.enabled ? "on" : "off"}`);
  },
  async importSkills(incoming) {
    const existing = new Set(get().skills.map((s) => s.id));
    const newOnes = incoming.filter((s) => !existing.has(s.id));
    const merged = [...newOnes, ...get().skills];
    set({ skills: merged });
    await storage.saveSkills(merged);
    devlog("skills", `Imported ${newOnes.length} new skill(s) (skipped ${incoming.length - newOnes.length} duplicates)`);
  },

  async loadSkillFolder() {
    const folder = get().settings.skillFolder;
    if (!folder) return { loaded: 0, message: "No skill folder configured" };
    try {
      if (isTauri()) {
        const { readDir, readTextFile } = await import("@tauri-apps/plugin-fs");
        const { parseSkillMarkdown } = await import("../lib/skills");
        const entries = await readDir(folder);
        const incoming: Skill[] = [];
        for (const entry of entries) {
          if (entry.isFile && entry.name?.endsWith(".md")) {
            try {
              const content = await readTextFile(`${folder}/${entry.name}`);
              const parsed = parseSkillMarkdown(entry.name, content);
              if (parsed) incoming.push(parsed);
            } catch (e: any) {
              devlog("skills", `Failed to read ${entry.name}: ${e?.message || e}`, undefined, "warn");
            }
          }
        }
        if (incoming.length) await get().importSkills(incoming);
        return { loaded: incoming.length, message: `Loaded ${incoming.length} skill(s) from ${folder}` };
      }
      return { loaded: 0, message: "Folder import requires the desktop app" };
    } catch (e: any) {
      return { loaded: 0, message: `Folder load failed: ${e?.message || e}` };
    }
  },

  // projects
  createProject(p) {
    const id = uid();
    const order = (Math.max(0, ...get().projects.map((x) => x.order || 0))) + 1;
    const project: Project = {
      id,
      name: p.name || "Untitled project",
      description: p.description || "",
      color: p.color || "#00D4FF",
      icon: p.icon || "folder",
      customInstructions: p.customInstructions || "",
      memoryScope: p.memoryScope || "project",
      pinned: !!p.pinned,
      order,
      files: p.files || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const projects = [project, ...get().projects];
    set({ projects, activeProjectId: id });
    storage.saveProjects(projects).catch((e) =>
      devlog("storage", `Failed to save projects: ${e}`)
    );
    devlog("projects", `Created project: ${project.name} (${id})`, { color: project.color, memoryScope: project.memoryScope });
    return id;
  },
  async pinProject(id, pinned) {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, pinned: !!pinned, updatedAt: Date.now() } : p
    );
    set({ projects });
    await storage.saveProjects(projects);
    devlog("projects", `Pinned ${id} = ${!!pinned}`);
  },
  async moveProject(id, direction) {
    const sorted = [...get().projects].sort((a, b) => {
      const ap = a.pinned === b.pinned ? (a.order || 0) - (b.order || 0) : (a.pinned ? -1 : 1);
      const bp = b.pinned === a.pinned ? (b.order || 0) - (a.order || 0) : (b.pinned ? -1 : 1);
      return ap - bp;
    });
    const idx = sorted.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    // Don't let pinned/unpinned jump over the boundary
    if (!!a.pinned !== !!b.pinned) return;
    const aOrder = a.order || 0;
    const bOrder = b.order || 0;
    const projects = get().projects.map((p) => {
      if (p.id === a.id) return { ...p, order: bOrder, updatedAt: Date.now() };
      if (p.id === b.id) return { ...p, order: aOrder, updatedAt: Date.now() };
      return p;
    });
    set({ projects });
    await storage.saveProjects(projects);
    devlog("projects", `Moved project ${id} ${direction}`);
  },
  async addProjectMemory(projectId, content) {
    const item: ProjectMemoryItem = {
      id: uid(),
      projectId,
      content,
      createdAt: Date.now(),
    };
    const projectMemory = [item, ...get().projectMemory];
    set({ projectMemory });
    await storage.saveProjectMemory(projectMemory);
    devlog("memory", `Added project memory → ${projectId}`, { len: content.length });
  },
  async removeProjectMemory(itemId) {
    const projectMemory = get().projectMemory.filter((m) => m.id !== itemId);
    set({ projectMemory });
    await storage.saveProjectMemory(projectMemory);
    devlog("memory", `Removed project memory ${itemId}`);
  },
  async addCustomCommand(cmd) {
    const item: CustomCommand = {
      id: uid(),
      trigger: cmd.trigger,
      label: cmd.label,
      action: cmd.action,
      value: cmd.value,
      enabled: cmd.enabled ?? true,
      createdAt: Date.now(),
    };
    const customCommands = [item, ...get().customCommands];
    set({ customCommands });
    await storage.saveCustomCommands(customCommands);
    devlog("commands", `Added custom command: /${item.trigger} → ${item.action}`);
  },
  async updateCustomCommand(id, patch) {
    const customCommands = get().customCommands.map((c) =>
      c.id === id ? { ...c, ...patch } : c
    );
    set({ customCommands });
    await storage.saveCustomCommands(customCommands);
  },
  async removeCustomCommand(id) {
    const customCommands = get().customCommands.filter((c) => c.id !== id);
    set({ customCommands });
    await storage.saveCustomCommands(customCommands);
    devlog("commands", `Removed custom command ${id}`);
  },
  async updateProject(id, patch) {
    const prev = get().projects.find((p) => p.id === id);
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
    );
    set({ projects });
    await storage.saveProjects(projects);
    devlog("projects", `Updated ${id}${prev ? ` (${prev.name})` : ""}`, { fields: Object.keys(patch) });
  },
  async deleteProject(id) {
    const proj = get().projects.find((p) => p.id === id);
    const unlinked = get().conversations.filter((c) => c.projectId === id).length;
    const projects = get().projects.filter((p) => p.id !== id);
    const conversations = get().conversations.map((c) =>
      c.projectId === id ? { ...c, projectId: null } : c
    );
    set({
      projects,
      conversations,
      activeProjectId: get().activeProjectId === id ? null : get().activeProjectId,
    });
    await Promise.all([storage.saveProjects(projects), storage.saveConversations(conversations)]);
    devlog("projects", `Deleted ${id}${proj ? ` (${proj.name})` : ""}`, { unlinked });
  },
  async addProjectFile(projectId, file) {
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? { ...p, files: [file, ...p.files], updatedAt: Date.now() }
        : p
    );
    set({ projects });
    await storage.saveProjects(projects);
  },
  async removeProjectFile(projectId, fileId) {
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? { ...p, files: p.files.filter((f) => f.id !== fileId), updatedAt: Date.now() }
        : p
    );
    set({ projects });
    await storage.saveProjects(projects);
    devlog("projects", `Removed file ${fileId} from project ${projectId}`);
  },
  setActiveProject(id) {
    const proj = id ? get().projects.find((p) => p.id === id) : null;
    set({ activeProjectId: id });
    devlog("projects", `Active project → ${id || "none"}${proj ? ` (${proj.name})` : ""}`);
  },

  logError(e) {
    const err: ErrorLog = { ...e, id: uid(), timestamp: Date.now() };
    set({ errors: [err, ...get().errors].slice(0, 50) });
    get().log("error", "provider", e.message, { reason: e.reason, status: e.status, provider: e.provider, model: e.model });
    return err;
  },
  clearError(id) {
    set({ errors: get().errors.filter((e) => e.id !== id) });
  },

  log(level, source, message, meta) {
    if (level === "debug" && !get().settings.logsEnabled) return null;
    const entry: LogEntry = { id: uid(), timestamp: Date.now(), level, source, message, meta };
    const logs = [entry, ...get().logs].slice(0, LOG_LIMIT);
    set({ logs });
    return entry;
  },
  clearLogs() {
    set({ logs: [] });
  },

  exportConversations() {
    const { conversations, memory, skills, projects, settings } = get();
    const data = { conversations, memory, skills, projects, settings, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    devlog("export", `Exported ${conversations.length} convs, ${memory.length} memory, ${skills.length} skills, ${projects.length} projects`);
  },

  async importConversations() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      if (!input.files?.[0]) return;
      try {
        const text = await input.files[0].text();
        const data = JSON.parse(text);
        if (data.conversations) {
          const merged = [...data.conversations, ...get().conversations];
          set({ conversations: merged });
          await storage.saveConversations(merged);
        }
        if (data.skills) {
          await get().importSkills(data.skills);
        }
        if (data.memory) {
          const merged = [...data.memory, ...get().memory];
          set({ memory: merged });
          await storage.saveMemory(merged);
        }
        devlog("export", `Imported: ${data.conversations?.length || 0} convs, ${data.memory?.length || 0} memory, ${data.skills?.length || 0} skills`);
      } catch (e: any) {
        devlog("export", `Import failed: ${e?.message || e}`, undefined, "error");
        alert("Import failed: " + (e?.message || "Invalid file"));
      }
    };
    input.click();
  },

  setSearchMessageQuery(q) {

  searchInConversation() {
    const { activeId, conversations, searchMessageQuery } = get();
    const q = searchMessageQuery.toLowerCase().trim();
    if (!q || !activeId) {
      set({ searchMessageResults: [] });
      return;
    }
    const conv = conversations.find((c) => c.id === activeId);
    if (!conv) {
      set({ searchMessageResults: [] });
      return;
    }
    const results = conv.messages
      .map((m, i) => ({ idx: i, id: m.id, content: m.content, role: m.role }))
      .filter((m) => m.content.toLowerCase().includes(q))
      .map((m) => m.id);
    set({ searchMessageResults: results });
    devlog("search", `In-conversation search "${searchMessageQuery}": ${results.length} hits`);
  },

  patchMessage(convId, msgId, patch) {
    const state = get();
    const conversations = state.conversations.map((c) => {
      if (c.id !== convId) return c;
      return {
        ...c,
        messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
      };
    });
    set({ conversations });
    scheduleSave(conversations);
  },
}));

let saveTimer: number | null = null;
function scheduleSave(_conversations: Conversation[]) {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    const latest = useStore.getState().conversations;
    storage.saveConversations(latest).catch((e) =>
      devlog("storage", `scheduleSave failed: ${e}`)
    );
  }, 500);
}

function classifyError(
  e: unknown,
  providerName: string
): { reason: string; hint: string; status?: number } {
  const raw: string = (e instanceof Error ? e.message : String(e)) + "";
  let status: number | undefined;
  const statusMatch = raw.match(/\b(4\d{2}|5\d{2})\b/);
  if (statusMatch) status = parseInt(statusMatch[1]);

  if (status === 401 || /unauthori[sz]ed|invalid api key|authentication/i.test(raw)) {
    return {
      reason: "Authentication failed",
      hint: `Your ${providerName} API key is invalid, expired, or revoked. Update it in Settings → Providers.`,
      status,
    };
  }
  if (status === 403 || /forbidden|permission/i.test(raw)) {
    return {
      reason: "Permission denied",
      hint: `Your ${providerName} account doesn't have access to this model or endpoint. Check your plan and the model name in Settings.`,
      status,
    };
  }
  if (status === 404 || /not found|model .* does not exist/i.test(raw)) {
    return {
      reason: "Model not found",
      hint: `The model ID is wrong or no longer available. Pick a current model in Settings → Providers.`,
      status,
    };
  }
  if (status === 429 || /rate limit|quota|too many requests/i.test(raw)) {
    return {
      reason: "Rate limited or quota exceeded",
      hint: `${providerName} is throttling requests or you've hit your plan's limit. Wait a moment, switch models, or upgrade your plan.`,
      status,
    };
  }
  if (status === 402 || /insufficient|balance|payment/i.test(raw)) {
    return {
      reason: "Out of credit",
      hint: `Your ${providerName} account has no remaining credit. Top it up and try again.`,
      status,
    };
  }
  if (/network|failed to fetch|load failed|timeout|abort/i.test(raw)) {
    return {
      reason: "Network problem",
      hint: `Couldn't reach ${providerName}. Check your internet connection, firewall, or VPN.`,
    };
  }
  if (/cors|cross-origin/i.test(raw)) {
    return {
      reason: "CORS blocked",
      hint: `${providerName} is blocking browser requests. If you're using a local model, set the CORS origin to allow MIRA.`,
    };
  }
  if (status && status >= 500) {
    return {
      reason: `${providerName} is having issues`,
      hint: `The provider returned a ${status}. Try again in a few minutes, or switch to another provider.`,
      status,
    };
  }
  return {
    reason: "Unexpected error",
    hint: raw.length < 200 ? raw : "Check the error log in Settings → About for the full message.",
  };
}

function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, ". ")
    .trim();
}
