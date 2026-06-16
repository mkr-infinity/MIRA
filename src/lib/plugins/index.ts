import type { PluginConfig } from "../../types";
import { devlog } from "../log";

interface PluginAPI {
  onMessage?: (content: string) => string | Promise<string>;
  onSettings?: () => Record<string, unknown>;
}

const loadedPlugins = new Map<string, PluginAPI>();

export async function loadPlugin(config: PluginConfig): Promise<PluginAPI | null> {
  if (loadedPlugins.has(config.id)) return loadedPlugins.get(config.id)!;
  try {
    const mod = await import(/* @vite-ignore */ config.url);
    const api: PluginAPI = {
      onMessage: mod.onMessage,
      onSettings: mod.onSettings,
    };
    loadedPlugins.set(config.id, api);
    devlog("plugins", `Loaded plugin: ${config.name} v${config.version}`);
    return api;
  } catch (e: any) {
    devlog("plugins", `Failed to load plugin ${config.name}: ${e?.message || e}`, undefined, "error");
    return null;
  }
}

export function unloadPlugin(id: string) {
  loadedPlugins.delete(id);
  devlog("plugins", `Unloaded plugin ${id}`);
}

export function getPlugin(id: string): PluginAPI | undefined {
  return loadedPlugins.get(id);
}

export async function runMessageHooks(
  content: string,
  plugins: PluginConfig[]
): Promise<string> {
  let result = content;
  for (const p of plugins) {
    if (!p.enabled) continue;
    const api = await loadPlugin(p);
    if (api?.onMessage) {
      const r = await api.onMessage(result);
      if (typeof r === "string") result = r;
    }
  }
  return result;
}
