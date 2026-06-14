// Dev logging helper for AI provider adapters. Logs the request payload
// (truncated) and tracks the stream duration + token usage.

import { devlog } from "../log";

export function logProviderStart(provider: string, model: string, msgCount: number, totalChars: number) {
  devlog(provider, `→ streamChat start`, {
    model,
    messages: msgCount,
    payloadKb: Math.round(totalChars / 1024 * 10) / 10,
  });
}

export function logProviderChunk(provider: string, chunkLen: number, totalLen: number) {
  devlog(provider, `chunk +${chunkLen} (total ${totalLen})`, undefined, "debug");
}

export function logProviderDone(provider: string, model: string, durationMs: number, usage?: { promptTokens: number; completionTokens: number; totalTokens: number }) {
  devlog(provider, `← streamChat done in ${durationMs}ms`, {
    model,
    latencyMs: durationMs,
    tokens: usage?.totalTokens,
    prompt: usage?.promptTokens,
    completion: usage?.completionTokens,
  });
}

export function logProviderError(provider: string, err: any, status?: number) {
  const msg = err?.message || String(err);
  devlog(provider, `Error: ${msg}`, { status }, "error");
}