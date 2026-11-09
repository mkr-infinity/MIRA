import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  Search,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Image as ImageIcon,
  Paperclip,
  Camera,
} from "lucide-react";
import { stt } from "../lib/voice/stt";
import { tts } from "../lib/voice/tts";
import { MessageBubble } from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";
import { isTauri } from "../lib/platform";
import { desktop } from "../lib/desktop";
import type { ProviderId } from "../types";
import { THEME_IDS, type ThemeId } from "../lib/theme";
import { metaFor } from "../lib/ai/providerMeta";
import { modelsForProvider } from "../lib/ai/models";
import { THEMES } from "../lib/theme";
import { MagneticGrid } from "./MagneticGrid";

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
  // Narrowed selectors: subscribing to the whole store here would re-render
  // the entire chat on every log entry and every streaming token.
  const conversations = useStore((s) => s.conversations);
  const activeId = useStore((s) => s.activeId);
  const settings = useStore((s) => s.settings);
  const isProcessing = useStore((s) => s.isProcessing);
  const isListening = useStore((s) => s.isListening);
  const isSpeaking = useStore((s) => s.isSpeaking);
  const voiceTranscript = useStore((s) => s.voiceTranscript);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const projects = useStore((s) => s.projects);
  const searchMessageQuery = useStore((s) => s.searchMessageQuery);
  const searchMessageResults = useStore((s) => s.searchMessageResults);
  const sendMessage = useStore((s) => s.sendMessage);
  const stopGeneration = useStore((s) => s.stopGeneration);
  const setListening = useStore((s) => s.setListening);
  const setSpeaking = useStore((s) => s.setSpeaking);
  const setVoiceTranscript = useStore((s) => s.setVoiceTranscript);
  const setTheme = useStore((s) => s.setTheme);
  const setActiveProject = useStore((s) => s.setActiveProject);
  const setSearchMessageQuery = useStore((s) => s.setSearchMessageQuery);
  const setProviderConfig = useStore((s) => s.setProviderConfig);
  const customCommands = useStore((s) => s.customCommands);
  const addLocalNote = useStore((s) => s.addLocalNote);
  const updateSettings = useStore((s) => s.updateSettings);
  const setActiveProvider = useStore((s) => s.setActiveProvider);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchIdx, setSearchIdx] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState<Array<{ name: string; type: string; size: number; content: string }>>([]);

  // Auto-grow the composer with its content (capped at max-h-32 = 128px)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [input]);

  const captureCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      // Wait a frame for the camera to warm up
      await new Promise((r) => requestAnimationFrame(r));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());
      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onload = () => {
          setPendingImages((prev) => [...prev, { name: "Camera capture", type: "image/png", size: blob.size, content: reader.result as string }]);
        };
        reader.readAsDataURL(blob);
      }, "image/png");
    } catch (e: any) {
      useStore.getState().log("error", "camera", `Camera access failed: ${e?.message || e}`);
    }
  }, []);

  const handleFiles = useCallback((files: FileList) => {
    const images: typeof pendingImages = [];
    for (const f of Array.from(files)) {
      if (f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          images.push({ name: f.name, type: f.type, size: f.size, content: reader.result as string });
          if (images.length === Array.from(files).filter((x) => x.type.startsWith("image/") && x.size <= 10 * 1024 * 1024).length) {
            setPendingImages((prev) => [...prev, ...images]);
          }
        };
        reader.readAsDataURL(f);
      }
    }
  }, []);

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

  // F11 to open voice mode, Ctrl+F to search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        onOpenVoiceMode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchMessageQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenVoiceMode, searchOpen]);

  /** Execute a user-defined slash command. Returns true when handled. */
  function tryCustomCommand(msg: string): boolean {
    if (!msg.startsWith("/")) return false;
    const [triggerRaw, ...rest] = msg.slice(1).split(" ");
    const trigger = triggerRaw.toLowerCase();
    const arg = rest.join(" ").trim();
    const cmd = customCommands.find((c) => c.enabled && c.trigger.toLowerCase() === trigger);
    if (!cmd) return false;
    const value = arg || cmd.value;
    const run = async () => {
      try {
        switch (cmd.action) {
          case "set_temperature": {
            const t = parseFloat(value);
            if (Number.isNaN(t) || t < 0 || t > 2) return addLocalNote(`Invalid temperature: ${value}`);
            await updateSettings({ temperature: t });
            addLocalNote(`Temperature set to ${t}.`);
            break;
          }
          case "set_theme": {
            if (!THEME_IDS.includes(value as ThemeId)) return addLocalNote(`Unknown theme "${value}" — themes: ${THEME_IDS.join(", ")}`);
            await useStore.getState().setTheme(value as ThemeId);
            addLocalNote(`Theme switched to ${value}.`);
            break;
          }
          case "set_concise": {
            const on = value === "" ? true : /^(on|true|yes|1)$/i.test(value);
            await updateSettings({ personality: on ? "concise" : "default" });
            addLocalNote(on ? "Concise personality on." : "Default personality restored.");
            break;
          }
          case "set_voice": {
            const on = /^(on|true|yes|1)$/i.test(value || "on");
            await updateSettings({ voiceAutoSpeak: on });
            addLocalNote(`Auto-speak ${on ? "enabled" : "disabled"}.`);
            break;
          }
          case "switch_provider": {
            const target = settings.providers.find((p) => p.id === value || p.name.toLowerCase() === value.toLowerCase());
            if (!target) return addLocalNote(`Unknown provider "${value}" — available: ${settings.providers.map((p) => p.id).join(", ")}`);
            await setActiveProvider(target.id as ProviderId);
            addLocalNote(`Switched to ${target.name}.`);
            break;
          }
          case "run_shell": {
            const r = await desktop.runCommand(value);
            addLocalNote(r.ok ? `$ ${value}\n\n\`\`\`\n${(r.message || "(no output)").slice(0, 2000)}\n\`\`\`` : `$ ${value}\n\n✗ ${r.message}`);
            break;
          }
          case "set_focus": {
            document.querySelector<HTMLTextAreaElement>("[data-chat-input]")?.focus();
            break;
          }
          case "remind": {
            const m = /^(\d+)\s*([mhd])\s+(.+)$/i.exec(value);
            if (!m) return addLocalNote(`Reminder format: /${cmd.trigger} 10m take the pills`);
            const mult = { m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2].toLowerCase() as "m" | "h" | "d"];
            const what = m[3];
            addLocalNote(`Reminder set: I'll ping you in ${m[1]}${m[2]} — "${what}".`);
            setTimeout(() => {
              desktop.notify("MIRA reminder", what).catch(() => {});
            }, Number(m[1]) * mult);
            break;
          }
        }
      } catch (e: any) {
        addLocalNote(`Command failed: ${e?.message || e}`);
      }
    };
    void run();
    return true;
  }

  function handleSend(text?: string) {
    let msg = (text ?? input).trim();
    if (!msg && pendingImages.length === 0) return;
    if (isProcessing) return;
    if (tryCustomCommand(msg)) {
      setInput("");
      return;
    }
    // Append image names to the message text
    if (pendingImages.length > 0) {
      const imageRefs = pendingImages.map((img) => `[Image: ${img.name}]`).join("\n");
      msg = msg ? `${msg}\n\n${imageRefs}` : imageRefs;
    }
    setInput("");
    sendMessage(msg, pendingImages.length > 0 ? pendingImages : undefined);
    setPendingImages([]);
  }

  // Models offered by the quick switcher: live-fetched cache first, then
  // the curated catalog, deduped, current model pinned on top.
  const switcherModels = useMemo(() => {
    const pid = resolvedProvider?.id;
    if (!pid) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    const push = (m: string) => {
      if (m && !seen.has(m) && list.length < 40) {
        seen.add(m);
        list.push(m);
      }
    };
    push(resolvedProvider?.model || "");
    for (const m of settings.providerModels?.[pid] || []) push(m);
    for (const m of modelsForProvider(pid)) push(m.id);
    return list;
  }, [resolvedProvider?.id, resolvedProvider?.model, settings.providerModels]);

  const orbState = isProcessing
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : isListening
    ? "listening"
    : "idle";

  return (
    <div
      className="flex-1 h-full min-h-0 flex flex-col mira-bg relative"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
    >
      <MagneticGrid lineCount={32} repulsionRadius={200} maxDisplacement={35} />
      {/* Drag-drop overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-cyan-400/50 bg-cyan-500/5">
              <ImageIcon size={40} className="text-cyan-400" />
              <p className="text-lg font-medium text-white">Drop images to attach</p>
              <p className="text-sm text-gray-400">Max 10 MB per image</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
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

        {/* Current model badge — click for the quick model switcher */}
        <div className="relative hidden md:block flex-shrink-0">
          <button
            onClick={() => setModelMenuOpen((v) => !v)}
            title="Switch model"
            aria-label="Switch model"
            aria-expanded={modelMenuOpen}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md border hover:scale-[1.02] transition-all duration-200 group"
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
            <ChevronRight
              size={11}
              className={`mira-muted transition-transform ${modelMenuOpen ? "rotate-90" : ""}`}
            />
          </button>
          <AnimatePresence>
            {modelMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setModelMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-mira border mira-border glass-strong shadow-pop overflow-hidden"
                >
                  <div className="px-3 py-2 border-b mira-border flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider mira-muted">
                      {providerName} models
                    </span>
                    <button
                      onClick={() => {
                        setModelMenuOpen(false);
                        onOpenSettings("providers");
                      }}
                      className="text-[10px] font-mono mira-accent hover:underline"
                    >
                      settings
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {switcherModels.length <= 1 && !switcherModels[0] ? (
                      <div className="px-3 py-3 text-xs mira-muted">
                        No models cached yet — pick one in Settings → Providers.
                      </div>
                    ) : (
                      switcherModels.map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            if (resolvedProvider && m !== resolvedProvider.model) {
                              setProviderConfig(resolvedProvider.id, { model: m });
                            }
                            setModelMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:mira-hover transition-colors"
                        >
                          <Check
                            size={12}
                            className={`flex-shrink-0 ${m === resolvedProvider?.model ? "mira-accent" : "opacity-0"}`}
                          />
                          <span className="text-xs font-mono mira-text truncate">{m}</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Message search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 border-b mira-border overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2">
              <Search size={14} className="mira-muted flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchMessageQuery}
                onChange={(e) => { setSearchMessageQuery(e.target.value); setSearchIdx(0); }}
                placeholder="Search in conversation…"
                className="flex-1 bg-transparent border-0 focus:ring-0 text-sm mira-text placeholder:mira-muted outline-none"
              />
              {searchMessageResults.length > 0 && (
                <span className="text-xs font-mono mira-muted tabular-nums">
                  {searchIdx + 1}/{searchMessageResults.length}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchIdx((i) => Math.max(0, i - 1));
                  const id = searchMessageResults[Math.max(0, searchIdx - 1)];
                  if (id) document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                disabled={searchMessageResults.length === 0}
                className="p-1 rounded mira-muted hover:mira-text disabled:opacity-30"
                aria-label="Previous match"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => {
                  setSearchIdx((i) => Math.min(searchMessageResults.length - 1, i + 1));
                  const id = searchMessageResults[Math.min(searchMessageResults.length - 1, searchIdx + 1)];
                  if (id) document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                disabled={searchMessageResults.length === 0}
                className="p-1 rounded mira-muted hover:mira-text disabled:opacity-30"
                aria-label="Next match"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => { setSearchOpen(false); setSearchMessageQuery(""); }}
                className="p-1 rounded mira-muted hover:mira-text"
                aria-label="Close search"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Pending image attachments */}
      {pendingImages.length > 0 && (
        <div className="px-4 pt-2 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-2">
            {pendingImages.map((img, i) => (
              <div key={i} className="relative group flex-shrink-0">
                <img
                  src={img.content}
                  alt={img.name}
                  className="w-16 h-16 rounded-lg object-cover border mira-border"
                />
                <button
                  onClick={() => setPendingImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              aria-label="Attach file"
            >
              <Plus size={18} />
            </button>
            {settings.imageGenEnabled && (
              <button
                onClick={() => setInput((v) => v ? `${v}\n/image ` : "/image ")}
                className="p-2.5 rounded-xl hover:mira-hover mira-muted hover:mira-text transition-colors"
                title="Generate an image"
                aria-label="Generate an image"
              >
                <ImageIcon size={18} />
              </button>
            )}
            <button
              onClick={captureCamera}
              className="p-2.5 rounded-xl hover:mira-hover mira-muted hover:mira-text transition-colors"
              title="Capture from camera"
              aria-label="Capture from camera"
            >
              <Camera size={18} />
            </button>
            <textarea
              ref={inputRef}
              data-chat-input
              aria-label="Message MIRA"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (items) {
                  const files: File[] = [];
                  for (const item of Array.from(items)) {
                    if (item.type.startsWith("image/")) {
                      const file = item.getAsFile();
                      if (file) files.push(file);
                    }
                  }
                  if (files.length > 0) {
                    e.preventDefault();
                    const dt = new DataTransfer();
                    files.forEach((f) => dt.items.add(f));
                    handleFiles(dt.files);
                  }
                }
              }}
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
              aria-label={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {isProcessing ? (
              <button
                onClick={stopGeneration}
                className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                title="Stop"
                aria-label="Stop generating"
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
                aria-label="Send message"
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
      aria-label={label}
    >
      <Icon size={16} />
    </button>
  );
}

function EmptyState({ onPrompt, onVoice }: { onPrompt: (p: string) => void; onVoice: () => void }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const settings = useStore((s) => s.settings);
  const conversations = useStore((s) => s.conversations);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const projects = useStore((s) => s.projects);
  const accent = settings.accentColor || "#00D4FF";

  // Dynamic suggestions based on context
  const suggestions = useMemo(() => {
    const base = [
      { label: "Open Brave and play lofi music", icon: Volume2, tag: "desktop" },
      { label: "Search the web for the latest AI news", icon: Globe, tag: "web" },
      { label: "Write a Python script to rename files in /tmp", icon: Code, tag: "code" },
      { label: "Remember I prefer dark themes and lo-fi", icon: Brain, tag: "memory" },
      { label: "Set system volume to 40% and lock", icon: Settings, tag: "system" },
    ];
    // Add context-aware suggestions
    if (conversations.length > 0) {
      const lastConv = conversations[0];
      const lastMsg = lastConv.messages[lastConv.messages.length - 1];
      if (lastMsg) {
        base.push({ label: `Continue: "${lastMsg.content.slice(0, 40)}…"`, icon: Sparkles, tag: "chat" });
      }
      base.push({ label: "Summarise the last conversation", icon: Sparkles, tag: "chat" });
    }
    if (activeProjectId) {
      const proj = projects.find((p) => p.id === activeProjectId);
      if (proj) {
        base.push({ label: `Review ${proj.name} project files`, icon: FolderOpen, tag: "project" });
      }
    }
    // Shuffle and pick 6
    const shuffled = base.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, [conversations, activeProjectId, projects]);

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
          {suggestions.map((s) => {
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
