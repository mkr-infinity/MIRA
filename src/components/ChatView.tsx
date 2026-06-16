import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { MiraOrb, VoiceWave } from "./Orb";
import {
  Send,
  Mic,
  MicOff,
  Square,
  Plus,
  Sun,
  Volume2,
  StopCircle,
  Settings,
  Sparkles,
  Globe,
  Code,
  Brain,
  PanelLeftOpen,
  PanelLeftClose,
  ArrowLeft,
  FolderOpen,
} from "lucide-react";
import { stt } from "../lib/voice/stt";
import { tts } from "../lib/voice/tts";
import { MessageBubble } from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";
import { isTauri } from "../lib/platform";
import { metaFor } from "../lib/ai/providerMeta";
import { THEMES } from "../lib/theme";

interface Props {
  onOpenSettings: (tab?: string) => void;
  onOpenVoiceMode: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatView({
  onOpenSettings,
  onOpenVoiceMode,
  sidebarCollapsed,
  onToggleSidebar,
}: Props) {
  const {
    conversations,
    activeId,
    settings,
    isProcessing,
    isListening,
    isSpeaking,
    voiceTranscript,
    sendMessage,
    stopGeneration,
    setListening,
    setSpeaking,
    setVoiceTranscript,
    setTheme,
    setActiveProject,
    activeProjectId,
    projects,
  } = useStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const conv = conversations.find((c) => c.id === activeId);
  const activeProvider = settings.providers.find(
    (p) => p.id === settings.activeProviderId
  );
  // The provider actually in use by this conversation (may differ from the
  // globally active one after model cycling or manual conversation switching).
  const convProvider = settings.providers.find(
    (p) => p.id === (conv?.provider ?? settings.activeProviderId)
  );
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const accent = settings.accentColor || "#00D4FF";
  const resolvedProvider = convProvider || activeProvider;
  const providerName = resolvedProvider?.name || metaFor(activeProvider?.id || "openai").name;
  const modelName = resolvedProvider?.model || conv?.model || "No model selected";

  useEffect(() => {
    const el = messagesEndRef.current;
    const scroller = scrollRef.current;
    if (!el || !scroller) return;
    // Only auto-scroll if the user is already near the bottom (within 120px)
    // so we don't yank them away when they're reading older messages.
    const distanceFromBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    el.scrollIntoView({
      behavior: nearBottom ? "smooth" : "auto",
      block: "end",
    });
  }, [conv?.messages.length, conv?.messages[conv.messages.length - 1]?.content]);

  // On conversation switch, jump instantly to bottom (no smooth scroll flicker)
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    el.scrollIntoView({ block: "end" });
  }, [activeId]);

  useEffect(() => {
    if (isListening) {
      stt.start({
        continuous: false,
        interimResults: true,
        lang: useStore.getState().settings.voiceLang || "en-US",
        onResult: (text, isFinal) => {
          setVoiceTranscript(text);
          if (isFinal) {
            setInput((v) => (v ? v + " " : "") + text);
            setListening(false);
            setVoiceTranscript("");
            setTimeout(() => {
              const final = (useStore.getState().settings.voiceAutoSpeak
                ? text
                : (document.querySelector("textarea") as HTMLTextAreaElement)?.value || text);
              if (final.trim()) handleSend(final.trim());
            }, 100);
          }
        },
        onError: (err) => {
          setListening(false);
          setVoiceTranscript("");
          if (err === "not-allowed" || err === "service-not-allowed") {
            useStore.getState().log("error", "voice", "Microphone permission denied");
          }
        },
        onEnd: () => {
          if (useStore.getState().isListening) setListening(false);
        },
      });
    } else {
      stt.stop();
    }
    return () => stt.stop();
  }, [isListening]);

  useEffect(() => {
    const id = setInterval(() => {
      const speaking = tts.isSpeaking();
      if (speaking !== isSpeaking) setSpeaking(speaking);
    }, 250);
    return () => clearInterval(id);
  }, [isSpeaking, setSpeaking]);

  // F11 to open voice mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        onOpenVoiceMode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenVoiceMode]);

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isProcessing) return;
    setInput("");
    sendMessage(msg);
  }

  const orbState = isProcessing
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : isListening
    ? "listening"
    : "idle";

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col mira-bg">
      {/* Top bar — glass effect with refined accent */}
      <header
        className="h-12 flex-shrink-0 flex items-center gap-3 px-3 border-b mira-border glass relative overflow-hidden"
      >
        {/* Accent stripe on the left edge */}
        <div
          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}80` }}
        />

        {/* Sidebar toggle (ChatGPT-style, always available) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md mira-muted hover:mira-text hover:mira-hover transition-colors flex-shrink-0"
            title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        )}

        {/* Project back-nav when inside a project */}
        {activeProject ? (
          <button
            onClick={() => setActiveProject(null)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md mira-elevated border mira-border hover:mira-hover transition-colors flex-shrink-0"
            style={{ color: activeProject.color, borderColor: `${activeProject.color}55` }}
            title="Back to All chats"
          >
            <ArrowLeft size={12} />
            <FolderOpen size={12} />
            <span className="text-[11px] font-mono uppercase tracking-wider truncate max-w-[140px]">
              {activeProject.name}
            </span>
            <span className="text-[9px] font-mono opacity-60">·</span>
            <span className="text-[10px] font-mono opacity-70">All chats</span>
          </button>
        ) : null}

        {/* Conversation title */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <h1 className="font-display text-sm font-semibold mira-text truncate max-w-[280px]">
            {conv?.title || "New conversation"}
          </h1>
        </div>

        <div className="flex-1" />

        {/* Current model badge — shows active provider + model */}
        <button
          onClick={() => onOpenSettings("providers")}
          title="Open providers"
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border hover:scale-[1.02] transition-all duration-200 group flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${
                isProcessing ? "bg-amber-400" : "bg-cyan-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isProcessing ? "bg-amber-400" : "bg-cyan-400"
              }`}
            />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[8.5px] font-mono uppercase tracking-[0.18em] mira-muted">
              {providerName}
            </span>
            <span
              className="text-[11px] font-mono font-medium truncate max-w-[180px] group-hover:opacity-80 transition-opacity"
              style={{ color: modelName === "No model selected" ? 'var(--muted)' : 'var(--text)' }}
            >
              {modelName}
            </span>
          </span>
        </button>

        {/* Top-right controls — single voice entry point + theme + settings */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <TopButton
            icon={Volume2}
            label="Voice mode (F11)"
            onClick={onOpenVoiceMode}
            active={isListening || isSpeaking}
          />
          {isSpeaking && (
            <TopButton
              icon={StopCircle}
              label="Stop speaking"
              onClick={() => {
                tts.stop();
                setSpeaking(false);
              }}
            />
          )}
          <TopButton
            icon={Sun}
            label={`Theme: ${THEMES.find((t) => t.id === settings.theme)?.name || "Dark"}`}
            onClick={() => {
              const idx = THEMES.findIndex((t) => t.id === settings.theme);
              setTheme(THEMES[(idx + 1) % THEMES.length].id);
            }}
          />
          <button
            onClick={() => onOpenSettings("general")}
            className="p-2 rounded-lg hover:mira-hover mira-muted hover:mira-text transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto grid-bg">
        {!conv || conv.messages.length === 0 ? (
          <div className="min-h-full">
            <EmptyState onPrompt={(p) => handleSend(p)} onVoice={onOpenVoiceMode} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-6 pb-32">
            {conv.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Voice waveform */}
      <AnimatePresence>
        {(isListening || voiceTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 pb-2 flex-shrink-0 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-pill mira-elevated border border-cyan-500/30 shadow-glow-sm">
              <VoiceWave active={isListening} />
              <span className="text-sm mira-text font-mono">
                {voiceTranscript || "Listening…"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input — glass morphism, refined */}
      <div className="p-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div
            className="relative flex items-end gap-2 p-2 rounded-2xl border glass-strong shadow-lg transition-all duration-200"
            style={{ boxShadow: "0 8px 32px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setInput((v) => v + ` [attached: ${f.name}]`);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl hover:mira-hover mira-muted hover:mira-text transition-colors"
              title="Attach"
            >
              <Plus size={18} />
            </button>
            <textarea
              data-chat-input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening
                  ? "Listening…"
                  : `Message MIRA${activeProvider ? ` · ${activeProvider.name}` : ""}…`
              }
              rows={1}
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none px-2 py-2.5 text-sm mira-text placeholder:mira-muted max-h-32"
              style={{ minHeight: "40px" }}
            />
            {/* Voice input (push-to-talk) — single mic button */}
            <button
              onClick={() => setListening(!isListening)}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "hover:mira-hover mira-muted hover:text-cyan-400"
              }`}
              title={isListening ? "Stop listening" : "Voice input (push-to-talk)"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {isProcessing ? (
              <button
                onClick={stopGeneration}
                className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                title="Stop"
              >
                <Square size={18} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  background: accent,
                  boxShadow: input.trim() ? `0 0 20px ${accent}60` : 'none',
                }}
                title="Send"
              >
                <Send size={18} />
              </button>
            )}
          </div>
          <div className="text-center text-[10px] mira-muted mt-2 font-mono flex items-center justify-center gap-3 flex-wrap">
            <span>Press F11 for voice mode</span>
            <span className="opacity-30">·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border mira-border mira-elevated text-[9px]">Enter</kbd>
              <span>send</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border mira-border mira-elevated text-[9px]">Shift</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded border mira-border mira-elevated text-[9px]">Enter</kbd>
              <span>newline</span>
            </span>
            <span className="opacity-30">·</span>
            <span>{isTauri() ? "Local build" : "Browser preview"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? "text-cyan-400 bg-cyan-500/10"
          : "mira-muted hover:mira-hover hover:mira-text"
      }`}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}

function EmptyState({ onPrompt, onVoice }: { onPrompt: (p: string) => void; onVoice: () => void }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const { settings } = useStore();
  const accent = settings.accentColor || "#00D4FF";

  const prompts = [
    { label: "Open Brave and play lofi music", icon: Volume2, tag: "desktop" },
    { label: "Summarise the last conversation", icon: Sparkles, tag: "chat" },
    { label: "Search the web for the latest AI news", icon: Globe, tag: "web" },
    { label: "Write a Python script to rename files in /tmp", icon: Code, tag: "code" },
    { label: "Remember I prefer dark themes and lo-fi", icon: Brain, tag: "memory" },
    { label: "Set system volume to 40% and lock", icon: Settings, tag: "system" },
  ];

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center px-6 py-10 text-center relative overflow-hidden">
      {/* Soft glow backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 60%)` }}
        />
      </div>
      <div className="relative w-full max-w-3xl">
        <div className="mb-6 relative inline-block">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-breathe"
            style={{ background: accent }}
          />
          <MiraOrb state="idle" size={220} />
        </div>
        <h2 className="font-display text-4xl font-semibold gradient-text mb-2 tracking-tight">
          {greeting}, {settings.userName || "sir"}.
        </h2>
        <p className="mira-muted max-w-md mx-auto mb-8">
          Your intelligent assistant. Speak or type — open apps, play music, search the web, or just chat.
        </p>
        <button
          onClick={onVoice}
          className="mb-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-pill glass-strong mira-text hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
        >
          <Volume2 size={14} className="mira-accent" />
          <span className="text-sm font-medium">Enter voice mode</span>
          <span className="text-[9px] font-mono mira-muted ml-1 px-1.5 py-0.5 rounded-pill border" style={{borderColor: 'rgba(255,255,255,0.1)'}}>F11</span>
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
          {prompts.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                onClick={() => onPrompt(s.label)}
                className="text-left px-4 py-3 rounded-mira border hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group flex items-start gap-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-7 h-7 rounded-md glass-strong flex items-center justify-center flex-shrink-0">
                  <Icon size={12} className="mira-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-mono uppercase tracking-wider mira-muted mb-0.5">{s.tag}</div>
                  <div className="text-sm mira-muted group-hover:mira-text leading-snug transition-colors">{s.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
