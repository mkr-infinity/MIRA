// Install once at app boot. Mirrors console.* AND fetch/XHR into the
// MIRA log store and the in-app Logs panel. No-op for debug entries
// when `logsEnabled` is false.

import { useStore } from "../store";

let installed = false;

const mapLevel = (level: string): "debug" | "info" | "warn" | "error" => {
  if (level === "log") return "info";
  if (level === "debug" || level === "info" || level === "warn" || level === "error") {
    return level as any;
  }
  return "info";
};

const format = (args: any[]): { message: string; meta?: Record<string, unknown> } => {
  if (args.length === 0) return { message: "" };
  if (args.length === 1) return { message: stringify(args[0]) };
  if (args.length === 2) return { message: stringify(args[0]), meta: { value: args[1] } };
  return { message: stringify(args[0]), meta: { values: args.slice(1) } };
};

const stringify = (v: any): string => {
  if (typeof v === "string") return v;
  if (v instanceof Error) return v.stack || v.message;
  if (v && typeof v === "object") {
    try {
      const s = JSON.stringify(v);
      if (s && s.length < 800) return s;
    } catch {}
    try {
      return Object.prototype.toString.call(v) + (v?.message ? `: ${v.message}` : "");
    } catch {
      return String(v);
    }
  }
  return String(v);
};

function installConsoleInterceptor() {
  if (installed) return;
  installed = true;

  const methods: Array<"log" | "info" | "warn" | "error" | "debug"> = [
    "log", "info", "warn", "error", "debug",
  ];
  for (const m of methods) {
    const original = (console as any)[m].bind(console);
    (console as any)[m] = (...args: any[]) => {
      original(...args);
      try {
        const state = useStore.getState();
        if (!state.settings.logsEnabled && m === "debug") return;
        const { message, meta } = format(args);
        state.log(mapLevel(m), "console", message, meta);
      } catch {
        // store not ready yet, skip
      }
    };
  }
}

function installFetchBridge() {
  const origFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const t0 = performance.now();
    const input = args[0];
    const init = args[1] || {};
    const url = typeof input === "string" ? input : (input as Request).url;
    const method = (init.method || (input as Request).method || "GET").toUpperCase();
    try {
      const res = await origFetch(...args);
      const ms = Math.round(performance.now() - t0);
      const level: "info" | "warn" | "error" = res.ok ? "info" : res.status >= 500 ? "error" : "warn";
      try {
        useStore.getState().log(level, "fetch", `${method} ${url} → ${res.status}`, {
          method, url, status: res.status, durationMs: ms,
        });
      } catch {}
      return res;
    } catch (e: any) {
      const ms = Math.round(performance.now() - t0);
      try {
        useStore.getState().log("error", "fetch", `${method} ${url} failed: ${e?.message || e}`, {
          method, url, durationMs: ms, error: String(e),
        });
      } catch {}
      throw e;
    }
  };

  // XHR (some libs still use it)
  const OrigXHR = window.XMLHttpRequest;
  if (!(OrigXHR.prototype as any).__miraPatched) {
    (OrigXHR.prototype as any).__miraPatched = true;
    const origOpen = OrigXHR.prototype.open;
    const origSend = OrigXHR.prototype.send;
    OrigXHR.prototype.open = function (method: string, url: string) {
      (this as any).__mira = { method: (method || "GET").toUpperCase(), url, t0: 0 };
      return origOpen.apply(this, arguments as any);
    };
    OrigXHR.prototype.send = function () {
      const meta = (this as any).__mira;
      if (meta) meta.t0 = performance.now();
      this.addEventListener("loadend", () => {
        if (!meta) return;
        const ms = Math.round(performance.now() - meta.t0);
        const status = this.status || 0;
        const level: "info" | "warn" | "error" = status >= 200 && status < 300 ? "info" : status >= 500 ? "error" : "warn";
        try {
          useStore.getState().log(level, "xhr", `${meta.method} ${meta.url} → ${status}`, {
            method: meta.method, url: meta.url, status, durationMs: ms,
          });
        } catch {}
      });
      return origSend.apply(this, arguments as any);
    };
  }
}

export function installConsoleBridge() {
  installConsoleInterceptor();
  installFetchBridge();
  try {
    useStore.getState().log("info", "boot", "MIRA booted", {
      build: useStore.getState().settings.version,
      tauri: typeof (window as any).__TAURI_INTERNALS__ !== "undefined",
      ua: navigator.userAgent.slice(0, 80),
    });
  } catch {}
}

// Convenience helper for the rest of the codebase
export function devlog(source: string, message: string, meta?: Record<string, unknown>, level: "debug" | "info" | "warn" | "error" = "info") {
  try {
    useStore.getState().log(level, source, message, meta);
  } catch {}
}
