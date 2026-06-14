export interface ProbeResult {
  ok: boolean;
  server: { id: string; label: string; baseUrl: string };
  models: Array<{ id: string; name?: string; server: string; serverId: string }>;
  durationMs: number;
  error?: string;
}

interface LocalServer {
  id: string;
  label: string;
  baseUrl: string;
  probe: (url: string) => Promise<{ ok: boolean; models: ProbeResult["models"]; durationMs: number; error?: string }>;
}

/** Well-known local model servers that MIRA can auto-detect. */
export const LOCAL_SERVERS: LocalServer[] = [
  {
    id: "ollama",
    label: "Ollama",
    baseUrl: "http://localhost:11434",
    async probe(url) {
      const t0 = performance.now();
      try {
        const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return { ok: false, models: [], durationMs: Math.round(performance.now() - t0), error: `HTTP ${res.status}` };
        const data = await res.json();
        const models = (data.models || []).map((m: any) => ({
          id: m.name,
          name: m.name,
          server: "Ollama",
          serverId: "ollama",
        }));
        return { ok: true, models, durationMs: Math.round(performance.now() - t0) };
      } catch (e: any) {
        return { ok: false, models: [], durationMs: Math.round(performance.now() - t0), error: e?.message || "Connection failed" };
      }
    },
  },
  {
    id: "lm-studio",
    label: "LM Studio",
    baseUrl: "http://localhost:1234",
    async probe(url) {
      const t0 = performance.now();
      try {
        const res = await fetch(`${url}/v1/models`, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return { ok: false, models: [], durationMs: Math.round(performance.now() - t0), error: `HTTP ${res.status}` };
        const data = await res.json();
        const models = (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.id,
          server: "LM Studio",
          serverId: "lm-studio",
        }));
        return { ok: true, models, durationMs: Math.round(performance.now() - t0) };
      } catch (e: any) {
        return { ok: false, models: [], durationMs: Math.round(performance.now() - t0), error: e?.message || "Connection failed" };
      }
    },
  },
];

export async function detectAllLocalModels(): Promise<ProbeResult[]> {
  const results = await Promise.all(
    LOCAL_SERVERS.map(async (server) => {
      const { ok, models, durationMs, error } = await server.probe(server.baseUrl);
      return { ok, server: { id: server.id, label: server.label, baseUrl: server.baseUrl }, models, durationMs, error };
    })
  );
  return results;
}
