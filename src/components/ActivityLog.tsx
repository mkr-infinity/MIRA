import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2, Check, AlertCircle, Cpu, Clock } from "lucide-react";
import type { ProviderId } from "../types";
import { metaFor } from "../lib/ai/providerMeta";

interface ActivityStep {
  label: string;
  status: "pending" | "active" | "done" | "error";
  detail?: string;
}

interface Props {
  providerId?: ProviderId;
  model?: string;
  steps?: ActivityStep[];
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  latencyMs?: number;
  toolResults?: string[];
  isProcessing?: boolean;
}

export function ActivityLog({
  providerId,
  model,
  steps = [],
  usage,
  latencyMs,
  toolResults,
  isProcessing,
}: Props) {
  const [open, setOpen] = useState(false);
  const providerName = providerId ? metaFor(providerId).name : "";

  const defaultSteps: ActivityStep[] = [
    { label: `Sending request to ${providerName}${model ? ` (${model})` : ""}…`, status: "done" },
    { label: "Waiting for response…", status: isProcessing ? "active" : "done" },
  ];
  if (!isProcessing && usage) {
    defaultSteps.push({
      label: `Received ${usage.totalTokens || "?"} tokens`,
      status: "done",
      detail: `${usage.promptTokens || 0} prompt · ${usage.completionTokens || 0} completion`,
    });
  }
  if (!isProcessing && latencyMs != null) {
    defaultSteps.push({
      label: `Completed in ${latencyMs}ms`,
      status: "done",
    });
  }
  if (toolResults?.length) {
    defaultSteps.push({
      label: `Executed ${toolResults.length} desktop action${toolResults.length > 1 ? "s" : ""}`,
      status: "done",
    });
  }

  const displaySteps = steps.length ? steps : defaultSteps;

  if (!providerId && !steps.length) return null;

  return (
    <div className="mt-2 -mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] font-mono opacity-40 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--muted)' }}
      >
        {isProcessing ? (
          <Loader2 size={10} className="animate-spin mira-accent" />
        ) : (
          <Cpu size={10} />
        )}
        <span>{isProcessing ? "Processing…" : `${displaySteps.length} step${displaySteps.length > 1 ? "s" : ""}`}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown size={10} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="mt-1.5 rounded-lg border p-2 space-y-1"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              {displaySteps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] font-mono leading-relaxed">
                  {s.status === "active" ? (
                    <Loader2 size={10} className="animate-spin mira-accent flex-shrink-0 mt-0.5" />
                  ) : s.status === "done" ? (
                    <Check size={10} className="mira-success flex-shrink-0 mt-0.5" />
                  ) : s.status === "error" ? (
                    <AlertCircle size={10} className="mira-danger flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock size={10} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--subtle)' }} />
                  )}
                  <div className="min-w-0">
                    <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                    {s.detail && (
                      <span className="ml-1" style={{ color: 'var(--subtle)' }}>· {s.detail}</span>
                    )}
                  </div>
                </div>
              ))}
              {usage && (
                <div
                  className="mt-1.5 pt-1.5 border-t text-[9px] font-mono flex gap-3"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--subtle)' }}
                >
                  <span>{usage.promptTokens || "?"} in</span>
                  <span>{usage.completionTokens || "?"} out</span>
                  <span>{usage.totalTokens || "?"} total</span>
                  {latencyMs != null && (
                    <>
                      <span>·</span>
                      <span>{latencyMs}ms</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
