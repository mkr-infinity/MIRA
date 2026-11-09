import { isTauri } from "../platform";

export interface DesktopCommandResult {
  ok: boolean;
  message: string;
  data?: unknown;
}

async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

export const desktop = {
  async openApp(name: string): Promise<DesktopCommandResult> {
    try {
      if (isTauri()) {
        return await tauriInvoke<DesktopCommandResult>("open_app", { name });
      }
      return { ok: false, message: `Open ${name}: requires desktop build` };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Failed" };
    }
  },

  async openUrl(url: string): Promise<DesktopCommandResult> {
    try {
      if (isTauri()) {
        return await tauriInvoke<DesktopCommandResult>("open_url", { url });
      }
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w || w.closed) {
        return { ok: false, message: `Popup blocked. Open manually: ${url}` };
      }
      return { ok: true, message: `Opened ${url}` };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Failed" };
    }
  },

  async playMusic(query: string): Promise<DesktopCommandResult> {
    if (/^https?:\/\//.test(query)) {
      return this.openUrl(query);
    }
    // Try to play via system media player in Tauri
    if (isTauri()) {
      const encoded = encodeURIComponent(query);
      const searchUrl = `https://music.youtube.com/search?q=${encoded}`;
      // Try mpv (most capable), then vlc, then fallback to browser
      const playerCmds = [
        `mpv --no-video --ytdl-format=bestaudio 'ytsearch:${query}'`,
        `vlc --intf dummy 'ytsearch:${query}'`,
      ];
      for (const cmd of playerCmds) {
        const result = await this.runCommand(cmd);
        if (result.ok) return { ok: true, message: `Playing "${query}"` };
      }
      return this.openUrl(searchUrl);
    }
    // Browser: open YouTube Music search
    const search = encodeURIComponent(query);
    const w = window.open(`https://music.youtube.com/search?q=${search}`, "_blank", "noopener,noreferrer");
    if (!w || w.closed) {
      return { ok: false, message: `Pop-up blocked. Open manually: https://music.youtube.com/search?q=${search}` };
    }
    return { ok: true, message: `Playing "${query}" on YouTube Music` };
  },

  async searchWeb(query: string): Promise<DesktopCommandResult> {
    return this.openUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
  },

  async setVolume(level: number): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("set_volume", { level });
    }
    return { ok: false, message: "Volume control requires desktop build" };
  },

  async notify(title: string, body: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("notify", { title, body });
    }
    if ("Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          new Notification(title, { body });
          return { ok: true, message: "Notification sent" };
        }
      } catch {
        // ignore
      }
    }
    return { ok: false, message: "Notifications unavailable" };
  },

  async shutdown(): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("shutdown");
    }
    return { ok: false, message: "Shutdown requires desktop build" };
  },

  async lock(): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("lock");
    }
    return { ok: false, message: "Lock requires desktop build" };
  },

  async copyToClipboard(text: string): Promise<DesktopCommandResult> {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, message: "Copied to clipboard" };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Failed" };
    }
  },

  async systemInfo(): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("system_info");
    }
    const ua = navigator.userAgent;
    return { ok: true, message: ua, data: { platform: navigator.platform } };
  },

  async typeText(text: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("type_text", { text });
    }
    return { ok: false, message: "Type-text requires desktop build" };
  },

  async openFolder(path: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("open_folder", { path });
    }
    if (/^https?:\/\//.test(path)) return this.openUrl(path);
    return { ok: false, message: "Open-folder requires desktop build" };
  },

  async listRunningApps(limit = 15): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("list_running_apps", { limit });
    }
    return { ok: false, message: "Process list requires desktop build" };
  },

  async runCommand(command: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      const result = await tauriInvoke<DesktopCommandResult>("run_command", { command });
      if (result.ok) {
        const msg = result.message || "";
        const truncated = msg.length > 500 ? msg.slice(0, 500) + "…" : msg;
        return { ok: true, message: truncated, data: result.data };
      }
      return result;
    }
    return { ok: false, message: "Shell commands require the desktop build" };
  },

  async clipboardRead(): Promise<DesktopCommandResult> {
    try {
      if (isTauri()) {
        return tauriInvoke<DesktopCommandResult>("clipboard_read");
      }
      const text = await navigator.clipboard.readText();
      return { ok: true, message: "OK", data: { text } };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Clipboard read failed" };
    }
  },

  // ---- File operations (home-directory sandbox enforced by the Rust layer) ----

  /** Read a UTF-8 text file. Paths are relative to the user's home directory. */
  async readFile(path: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("read_file", { path });
    }
    return { ok: false, message: "File reading requires the desktop build" };
  },

  /** Create or overwrite a text file (parent folders are created). */
  async writeFile(path: string, content: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("write_file", { path, content });
    }
    return { ok: false, message: "File writing requires the desktop build" };
  },

  /** Append text to the end of a file (created if missing). */
  async appendFile(path: string, content: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("append_file", { path, content });
    }
    return { ok: false, message: "File writing requires the desktop build" };
  },

  /** Create a folder, including missing parents. */
  async createFolder(path: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("create_folder", { path });
    }
    return { ok: false, message: "Folder creation requires the desktop build" };
  },

  /** List a directory: [{ name, isDir, size }], folders first. */
  async listDir(path: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("list_dir", { path });
    }
    return { ok: false, message: "Directory listing requires the desktop build" };
  },

  /** Delete a single file (folders refused). */
  async deleteFile(path: string): Promise<DesktopCommandResult> {
    if (isTauri()) {
      return tauriInvoke<DesktopCommandResult>("delete_file", { path });
    }
    return { ok: false, message: "File deletion requires the desktop build" };
  },

  async clipboardWrite(text: string): Promise<DesktopCommandResult> {
    try {
      if (isTauri()) {
        return tauriInvoke<DesktopCommandResult>("clipboard_write", { text });
      }
      await navigator.clipboard.writeText(text);
      return { ok: true, message: "Copied to clipboard" };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Clipboard write failed" };
    }
  },
};

/** Un-escape \n, \t, \" and \\ inside an inline tool-call string argument. */
function unescapeString(s: string): string {
  return s.replace(/\\(n|t|"|\\)/g, (_, c) => (c === "n" ? "\n" : c === "t" ? "\t" : c));
}

/**
 * Parse a message for inline tool call patterns like `open_app("Brave")`
 * and execute each one found. Returns a human-readable result string
 * suitable for appending to the assistant's reply.
 *
 * Currently supported:
 *   open_app("name")
 *   open_url("url")
 *   play_music("query")
 *   search_web("query")
 *   set_volume(0-100)
 *   notify("title","body")
 *   remember("content")
 *   type_text("text")
 *   open_folder("path")
 *   list_running_apps()
 *   run_command("cmd")
 *   clipboard_write("text")
 *   clipboard_read()
 *   shutdown()
 *   lock()
 */
export async function parseAndExecuteToolCalls(text: string): Promise<string[]> {
  const results: string[] = [];

  const patterns: Array<{ pattern: string; fn: (...args: string[]) => Promise<DesktopCommandResult> }> = [
    { pattern: `open_app\(["']([^"']+)["']\)`, fn: (n) => desktop.openApp(n) },
    { pattern: `open_url\(["']([^"']+)["']\)`, fn: (u) => desktop.openUrl(u) },
    { pattern: `play_music\(["']([^"']+)["']\)`, fn: (q) => desktop.playMusic(q) },
    { pattern: `search_web\(["']([^"']+)["']\)`, fn: (q) => desktop.searchWeb(q) },
    { pattern: `set_volume\((\d+)\)`, fn: (l) => desktop.setVolume(parseInt(l)) },
    { pattern: `notify\(["']([^"']+)["'],\s*["']([^"']+)["']\)`, fn: (t, b) => desktop.notify(t, b) },
    { pattern: `type_text\(["']([^"']+)["']\)`, fn: (t) => desktop.typeText(t) },
    { pattern: `open_folder\(["']([^"']+)["']\)`, fn: (p) => desktop.openFolder(p) },
    { pattern: `list_running_apps\(\)`, fn: () => desktop.listRunningApps() },
    { pattern: `run_command\(["']([^"']+)["']\)`, fn: (c) => desktop.runCommand(c) },
    { pattern: `clipboard_write\(["']([^"']+)["']\)`, fn: (t) => desktop.clipboardWrite(t) },
    { pattern: `clipboard_read\(\)`, fn: () => desktop.clipboardRead() },
    { pattern: `shutdown\(\)`, fn: () => desktop.shutdown() },
    { pattern: `lock\(\)`, fn: () => desktop.lock() },
    {
    pattern: `read_file\(["']([^"']+)["']\)`,
    fn: async (p) => {
      const r = await desktop.readFile(p);
      if (!r.ok) return r;
      const content = (r.data as any)?.content || "";
      const preview = content.length > 4000
        ? content.slice(0, 4000) + "\n… (truncated, " + content.length + " chars total)"
        : content;
      return { ok: true, message: `Read ${p} (${content.length} chars):\n${preview}` };
    },
  },
  {
    pattern: `write_file\(["']([^"']+)["'],\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')\)`,
    fn: async (p, dq, sq) => desktop.writeFile(p, unescapeString(dq ?? sq ?? "")),
  },
  {
    pattern: `append_file\(["']([^"']+)["'],\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')\)`,
    fn: async (p, dq, sq) => desktop.appendFile(p, unescapeString(dq ?? sq ?? "")),
  },
  { pattern: `create_folder\(["']([^"']+)["']\)`, fn: (p) => desktop.createFolder(p) },
  {
    pattern: `list_dir\(["']([^"']+)["']\)`,
    fn: async (p) => {
      const r = await desktop.listDir(p);
      if (!r.ok) return r;
      const entries = ((r.data as any)?.entries || []) as Array<{ name: string; isDir: boolean; size: number }>;
      const lines = entries.slice(0, 100).map((e) => `${e.isDir ? "[dir] " : "[file] "}${e.name}`);
      return { ok: true, message: `${p}:\n${lines.join("\n")}` };
    },
  },
  { pattern: `delete_file\(["']([^"']+)["']\)`, fn: (p) => desktop.deleteFile(p) },
  { pattern: `remember\(["']([^"']+)["']\)`, fn: async (content) => {
        try {
          const { useStore } = await import("../../store");
          await useStore.getState().addMemory({ content, source: "auto", tags: [] });
          return { ok: true, message: `Remembered: ${content}` };
        } catch (e: any) {
          return { ok: false, message: e?.message || "Remember failed" };
        }
      }
    },
  ];

  for (const { pattern, fn } of patterns) {
    const re = new RegExp(pattern, "g");
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      try {
        const args = match.slice(1).filter((a) => a !== undefined);
        const result = await fn(...args);
        results.push(result.ok ? `✓ ${match[0]}` : `✗ ${match[0]}: ${result.message}`);
      } catch (e: any) {
        results.push(`✗ ${match[0]}: ${e?.message || "Execution failed"}`);
      }
    }
  }

  return results;
}

export const DESKTOP_TOOL_DEFS = [
  {
    name: "open_app",
    description:
      "Open a desktop application by name. Examples: 'Brave', 'Spotify', 'VS Code', 'Terminal', 'Finder', 'Explorer'.",
    parameters: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Application name to launch (e.g. 'Brave', 'Spotify')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "open_url",
    description: "Open a URL in the default browser.",
    parameters: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "URL to open" },
      },
      required: ["url"],
    },
  },
  {
    name: "play_music",
    description:
      "Play a song, artist, or playlist. First tries system media player (mpv/vlc), then falls back to opening YouTube Music in the browser.",
    parameters: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Song name, artist, or URL to play",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_web",
    description: "Perform a web search and open the results page.",
    parameters: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "set_volume",
    description: "Set the system volume (0-100).",
    parameters: {
      type: "object" as const,
      properties: {
        level: { type: "number", description: "Volume level 0-100" },
      },
      required: ["level"],
    },
  },
  {
    name: "notify",
    description: "Show a desktop notification.",
    parameters: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
        body: { type: "string" },
      },
      required: ["title", "body"],
    },
  },
  {
    name: "remember",
    description:
      "Save a fact about the user to long-term memory. Use for stable preferences, names, projects, etc.",
    parameters: {
      type: "object" as const,
      properties: {
        content: { type: "string", description: "The fact to remember" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "type_text",
    description: "Type a string into the currently focused window on the user's computer.",
    parameters: {
      type: "object" as const,
      properties: { text: { type: "string" } },
      required: ["text"],
    },
  },
  {
    name: "open_folder",
    description: "Open a local folder path in the OS file manager.",
    parameters: {
      type: "object" as const,
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "run_command",
    description: "Execute a shell command on the user's computer and return the output. Use for file operations, system queries, scripting, etc.",
    parameters: {
      type: "object" as const,
      properties: { command: { type: "string", description: "Shell command to run (bash/sh on Linux/macOS, cmd on Windows)" } },
      required: ["command"],
    },
  },
  {
    name: "read_file",
    description:
      "Read a UTF-8 text file. Paths are relative to the user's home directory (e.g. 'Desktop/notes.md', 'Documents/projects/app/main.tsx') or absolute inside it. The content is returned to you in the result.",
    parameters: {
      type: "object" as const,
      properties: { path: { type: "string", description: "Home-relative or absolute-inside-home path" } },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description:
      "Create or overwrite a text file inside the user's home directory. Parent folders are created automatically. Use \\n for newlines; the content is written verbatim after unescaping.",
    parameters: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Home-relative or absolute-inside-home path" },
        content: { type: "string", description: "Full file content to write" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "append_file",
    description: "Append text to the end of a file inside the user's home directory (created if missing).",
    parameters: {
      type: "object" as const,
      properties: {
        path: { type: "string" },
        content: { type: "string", description: "Text to append" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "create_folder",
    description: "Create a folder (including missing parents) inside the user's home directory.",
    parameters: {
      type: "object" as const,
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "list_dir",
    description:
      "List the entries of a directory inside the user's home directory. Returns names with [dir]/[file] markers.",
    parameters: {
      type: "object" as const,
      properties: { path: { type: "string", description: "Use '' or '.' for the home directory itself" } },
      required: ["path"],
    },
  },
  {
    name: "delete_file",
    description:
      "Delete a single file inside the user's home directory. Folders are refused. Confirm with the user for anything not clearly temporary.",
    parameters: {
      type: "object" as const,
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "clipboard_read",
    description: "Read the current text content of the system clipboard.",
    parameters: { type: "object" as const, properties: {} },
  },
  {
    name: "clipboard_write",
    description: "Write text to the system clipboard.",
    parameters: {
      type: "object" as const,
      properties: { text: { type: "string", description: "Text to copy to clipboard" } },
      required: ["text"],
    },
  },
  {
    name: "shutdown",
    description: "Shut down the computer.",
    parameters: { type: "object" as const, properties: {} },
  },
  {
    name: "lock",
    description: "Lock the computer screen.",
    parameters: { type: "object" as const, properties: {} },
  },
];
