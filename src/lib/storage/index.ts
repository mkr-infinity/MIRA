import type { Conversation, AppSettings, MemoryItem, Skill, Project, ProjectMemoryItem, CustomCommand } from "../../types";

/**
 * Local persistence layer. Uses Tauri's filesystem when running in the desktop
 * app, falls back to IndexedDB / localStorage in the browser. All data lives
 * under the user's Desktop/MIRA folder (or browser equivalent).
 */

import { isTauri } from "../platform";

const DIR_NAME = "MIRA";

let baseDir: string | null = null;

async function getBaseDir(): Promise<string> {
  if (baseDir) return baseDir;
  if (!isTauri()) {
    baseDir = "mira";
    return baseDir;
  }
  try {
    const { appDataDir, desktopDir, join } = await import("@tauri-apps/api/path");
    const desktop = await desktopDir();
    const target = await join(desktop, DIR_NAME);
    baseDir = target;
    await ensureDir(target);
    return target;
  } catch (e) {
    // fallback to appData
    const { appDataDir, join } = await import("@tauri-apps/api/path");
    const d = await appDataDir();
    const target = await join(d, DIR_NAME);
    baseDir = target;
    await ensureDir(target);
    return target;
  }
}

async function ensureDir(path: string) {
  try {
    const { mkdir, exists } = await import("@tauri-apps/plugin-fs");
    if (!(await exists(path))) {
      await mkdir(path, { recursive: true });
    }
  } catch (e) {
    console.warn("[MIRA] ensureDir failed:", e);
  }
}

async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    if (isTauri()) {
      const { readTextFile, exists } = await import("@tauri-apps/plugin-fs");
      const dir = await getBaseDir();
      const path = `${dir}/${file}`;
      if (!(await exists(path))) return fallback;
      const text = await readTextFile(path);
      return JSON.parse(text) as T;
    } else {
      // MIRA uses `mira:` prefix; fall back to legacy `jarvis:` for upgrades.
      const raw =
        localStorage.getItem(`mira:${file}`) ??
        localStorage.getItem(`jarvis:${file}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    }
  } catch (e) {
    console.warn(`[MIRA] readJSON failed for ${file}, using defaults:`, e);
    return fallback;
  }
}

async function writeJSON(file: string, data: unknown): Promise<void> {
  try {
    if (isTauri()) {
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      const dir = await getBaseDir();
      await writeTextFile(`${dir}/${file}`, JSON.stringify(data, null, 2));
    } else {
      localStorage.setItem(`mira:${file}`, JSON.stringify(data));
    }
  } catch (e) {
    console.error(`[MIRA] writeJSON failed for ${file}:`, e);
  }
}

export const storage = {
  async getSettings(): Promise<AppSettings> {
    const s = await readJSON<AppSettings>("settings.json", defaultSettings());
    let changed = false;
    // Migration: v2.0.1 — clear fake "llama3.2" defaults for local providers
    for (const p of s.providers) {
      if (p.authType === "local" && p.model && !(p as any).__liveConfirmed) {
        const curatedLocalDefaults = ["llama3.2", "llama3.1", "qwen2.5", "mistral", "mistral-nemo", "phi3.5", "gemma2", "gemma3", "codellama", "deepseek-coder-v2"];
        if (curatedLocalDefaults.includes(p.model)) {
          p.model = "";
          changed = true;
        }
      }
    }
    // Migration: normalize theme — old "dark" → "dark", old "light" → "light",
    // any invalid value → "dark"
    const validThemes = ["dark", "light", "cyberpunk", "sakura", "nordic", "neon", "earth"];
    if (!validThemes.includes(s.theme)) {
      (s as any).theme = "dark";
      changed = true;
    }
    if (changed) {
      try { await writeJSON("settings.json", s); } catch {}
    }
    return s;
  },
  async saveSettings(s: AppSettings) {
    await writeJSON("settings.json", s);
  },
  async getConversations(): Promise<Conversation[]> {
    return readJSON<Conversation[]>("conversations.json", []);
  },
  async saveConversations(c: Conversation[]) {
    await writeJSON("conversations.json", c);
  },
  async getProjects(): Promise<Project[]> {
    return readJSON<Project[]>("projects.json", []);
  },
  async saveProjects(p: Project[]) {
    await writeJSON("projects.json", p);
  },
  async getProjectMemory(): Promise<ProjectMemoryItem[]> {
    return readJSON<ProjectMemoryItem[]>("project_memory.json", []);
  },
  async saveProjectMemory(items: ProjectMemoryItem[]) {
    await writeJSON("project_memory.json", items);
  },
  async getCustomCommands(): Promise<CustomCommand[]> {
    return readJSON<CustomCommand[]>("custom_commands.json", []);
  },
  async saveCustomCommands(items: CustomCommand[]) {
    await writeJSON("custom_commands.json", items);
  },
  async getMemory(): Promise<MemoryItem[]> {
    return readJSON<MemoryItem[]>("memory.json", []);
  },
  async saveMemory(m: MemoryItem[]) {
    await writeJSON("memory.json", m);
  },
  async getSkills(): Promise<Skill[]> {
    return readJSON<Skill[]>("skills.json", defaultSkills());
  },
  async saveSkills(s: Skill[]) {
    await writeJSON("skills.json", s);
  },
  async getDataDir() {
    return getBaseDir();
  },
};

export function defaultSettings(): AppSettings {
  return {
    theme: "dark",
    voiceEnabled: true,
    voiceAutoSpeak: true,
    voiceWakeWord: false,
    voiceName: "",
    voiceRate: 1,
    voicePitch: 1,
    voiceLang: "en-US",
    userName: "sir",
    providers: [
      {
        id: "openai",
        name: "OpenAI",
        apiKey: "",
        model: "gpt-4o-mini",
        enabled: true,
        authType: "api_key",
      },
      {
        id: "anthropic",
        name: "Anthropic",
        apiKey: "",
        model: "claude-3-5-sonnet-20241022",
        enabled: false,
        authType: "api_key",
      },
      {
        id: "gemini",
        name: "Google Gemini",
        apiKey: "",
        model: "gemini-1.5-flash",
        enabled: false,
        authType: "api_key",
      },
      {
        id: "ollama",
        name: "Ollama (Local)",
        model: "",
        enabled: false,
        authType: "local",
        localEndpoint: "http://localhost:11434",
      },
      {
        id: "openrouter",
        name: "OpenRouter",
        apiKey: "",
        model: "anthropic/claude-3.5-sonnet",
        enabled: false,
        authType: "api_key",
      },
      {
        id: "custom",
        name: "Custom",
        apiKey: "",
        baseUrl: "",
        model: "",
        enabled: false,
        authType: "api_key",
        authHeaderName: "Authorization",
      },
    ],
    activeProviderId: "openai",
    temperature: 0.7,
    maxTokens: 4096,
    desktopControlEnabled: true,
    dataDir: "",
    onboardingComplete: false,
    voiceModeFullscreen: true,
    repoUrl: "https://github.com/mkr-infinity/MIRA",
    autoFallback: true,
    cycleAllProviders: false,
    skillFolder: "",
    logsEnabled: true,
    version: "2.0.0",
    avatar: "",
    accentColor: "",
    voiceWakeWordText: "hey mira",
    personality: "default",
    customSystemPrompt: "",
    customCSS: "",
  };
}

export function defaultSkills(): Skill[] {
  return [
    {
      id: "web-search",
      name: "Web Search",
      description: "Search the internet and summarise results.",
      prompt:
        "When the user asks a question that benefits from up-to-date information, call the web_search tool.",
      enabled: true,
      icon: "search",
      category: "research",
    },
    {
      id: "code",
      name: "Code",
      description: "Write, review, and explain code in any language.",
      prompt:
        "Format code in fenced blocks with the language tag. Prefer concise examples with brief explanations.",
      enabled: true,
      icon: "code",
      category: "productivity",
    },
    {
      id: "image",
      name: "Image",
      description: "Generate or analyse images.",
      prompt:
        "If the user asks for an image, explain that you can open an image generation site via desktop control, or describe the image you would create.",
      enabled: true,
      icon: "image",
      category: "creative",
    },
    {
      id: "music",
      name: "Music",
      description: "Play music, manage playlists, control media.",
      prompt:
        "When the user says 'play music' or names a song/artist, call the play_music desktop action.",
      enabled: true,
      icon: "music",
      category: "lifestyle",
    },
    {
      id: "system",
      name: "System",
      description: "Control the computer: open apps, set volume, lock, etc.",
      prompt:
        "When the user asks you to operate the computer, use desktop_control tools: open_app, open_url, set_volume, lock, shutdown.",
      enabled: true,
      icon: "cpu",
      category: "lifestyle",
    },
    {
      id: "memory",
      name: "Memory",
      description: "Remember facts about the user across sessions.",
      prompt:
        "When the user shares a stable fact about themselves (name, preferences, projects), call the remember tool with a concise item.",
      enabled: true,
      icon: "brain",
      category: "productivity",
    },
  ];
}
