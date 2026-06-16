import { useEffect, useState } from "react";
import { useStore } from "../store";
import { Copy, RefreshCw, Volume2, Check, ChevronDown, ChevronRight, Brain, Terminal, type LucideIcon } from "lucide-react";
import { tts } from "../lib/voice/tts";
import type { Message } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MiraLogo } from "./MiraLogo";
import { ThinkingAnimation } from "./ThinkingAnimation";
import { ActivityLog } from "./ActivityLog";

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const lang = className?.replace("language-", "") || "sh";

  return (
    <div className="relative group my-2 rounded-lg overflow-hidden border mira-border mira-elevated">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b mira-border">
        <span className="text-[10px] font-mono uppercase tracking-wider mira-muted">{lang}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 text-[10px] font-mono mira-muted hover:mira-text transition-colors"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          <span>{copied ? "copied" : "copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed mira-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded text-[0.88em] font-mono mira-accent-soft mira-text border mira-border">
      {children}
    </code>
  );
}

function ToolCallBlock({ text }: { text: string }) {
  const toolPattern = /\b(open_app|open_url|play_music|search_web|set_volume|notify|type_text|open_folder|list_running_apps|run_command|clipboard_read|clipboard_write|remember)\s*\(([^)]*)\)/g;
  const calls: string[] = [];
  let m;
  while ((m = toolPattern.exec(text)) !== null) calls.push(m[0]);
  if (!calls.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {calls.map((call, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono mira-accent-soft mira-accent border mira-border"
        >
          <Terminal size={9} />
          {call}
        </span>
      ))}
    </div>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const { isProcessing, regenerate, settings, isSpeaking, conversations, activeId } = useStore();
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(message.streaming || false);
  const conv = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (message.streaming) setShowReasoning(true);
  }, [message.streaming]);

  if (message.role === "system") return null;

  const accent = settings.accentColor || "#00D4FF";

  return (
    <div id={`msg-${message.id}`} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} group`}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden glass-strong">
            <MiraLogo size={24} glow={false} />
          </div>
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {/* Reasoning block */}
        {!isUser && message.reasoning && message.streaming && (
          <div className="mb-2 w-full rounded-lg border border-amber-500/20 bg-amber-500/5 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-amber-400/80">
                <Brain size={10} />
                Thinking…
              </span>
              <button onClick={() => setShowReasoning(!showReasoning)} className="text-amber-400/50 hover:text-amber-400 transition-colors">
                {showReasoning ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            </div>
            {showReasoning && (
              <div className="px-3 pb-2 text-[11px] text-amber-200/60 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {message.reasoning}
              </div>
            )}
          </div>
        )}
        {!isUser && message.reasoning && !message.streaming && (
          <>
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="mb-1.5 flex items-center gap-2 px-3 py-1 rounded-lg border border-amber-500/15 bg-amber-500/[0.03] hover:bg-amber-500/[0.07] transition-colors text-left"
            >
              <Brain size={10} className="text-amber-400/50" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/50">
                {showReasoning ? "Hide reasoning" : `View reasoning (${message.reasoning.length} chars)`}
              </span>
              {showReasoning ? <ChevronDown size={11} className="ml-1 text-amber-400/40" /> : <ChevronRight size={11} className="ml-1 text-amber-400/40" />}
            </button>
            {showReasoning && (
              <div className="mb-2 w-full rounded-lg border border-amber-500/15 bg-amber-500/[0.03] px-3 py-2 text-[11px] text-amber-200/50 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {message.reasoning}
              </div>
            )}
          </>
        )}

        {/* Activity log for assistant messages */}
        {!isUser && (
          <div className="w-full px-1">
            <ActivityLog
              providerId={message.provider || conv?.provider}
              model={message.model || conv?.model}
              isProcessing={message.streaming}
              usage={message.usage}
              latencyMs={message.latencyMs}
            />
          </div>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl w-full ${
            isUser
              ? "rounded-tr-sm text-sm"
              : "rounded-tl-sm border"
          }`}
          style={isUser ? {
            background: `${accent}18`,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: `${accent}30`,
            color: "var(--text)",
          } : {
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {message.streaming && !message.content ? (
            <ThinkingAnimation />
          ) : isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="markdown text-sm prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const isBlock = className?.startsWith("language-");
                    if (isBlock) return <CodeBlock className={className}>{children}</CodeBlock>;
                    return <InlineCode {...props}>{children}</InlineCode>;
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              <ToolCallBlock text={message.content} />
            </div>
          )}
          {message.error && !message.streaming && (
            <div className="mt-2 text-xs text-red-400 font-mono border-t border-red-500/20 pt-2">
              ✗ {message.error}
            </div>
          )}
        </div>

        {/* Actions row */}
        <div className={`flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? "flex-row-reverse" : ""}`}>
          {!isUser && !message.streaming && message.content && (
            <>
              <ActionBtn
                icon={copied ? Check : Copy}
                label="Copy"
                onClick={() => {
                  navigator.clipboard.writeText(message.content).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              />
              <ActionBtn
                icon={Volume2}
                label="Read aloud"
                onClick={() => tts.speak(message.content, {
                  voice: settings.voiceName,
                  rate: settings.voiceRate,
                  pitch: settings.voicePitch,
                })}
              />
              <ActionBtn
                icon={RefreshCw}
                label="Regenerate"
                onClick={() => regenerate()}
                disabled={isProcessing}
              />
            </>
          )}
          <span className="ml-1 text-[9px] font-mono mira-muted select-none">
            {formatTime(message.timestamp)}
          </span>
          {!isUser && message.model && !message.streaming && (
            <span className="text-[9px] font-mono mira-muted ml-1">· {message.model}</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div
            className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{
              background: `${accent}25`,
              color: accent,
              borderColor: `${accent}50`,
            }}
          >
            {(settings.userName || "U").slice(0, 1).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="p-1.5 rounded-md mira-muted hover:mira-text hover:mira-elevated transition-all disabled:opacity-30"
    >
      <Icon size={12} />
    </button>
  );
}

