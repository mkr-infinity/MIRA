import { useEffect, useState, useCallback } from "react";
import { useStore } from "./store";
import { Sidebar } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";
import { SettingsModal } from "./components/SettingsModal";
import { Onboarding } from "./components/Onboarding";
import { VoiceMode } from "./components/VoiceMode";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { installConsoleBridge } from "./lib/log";

installConsoleBridge();

type SettingsTab =
  | "general"
  | "providers"
  | "voice"
  | "skills"
  | "memory"
  | "projects"
  | "logs"
  | "data"
  | "custom"
  | "about";

const SIDEBAR_COLLAPSE_KEY = "mira:sidebar-collapsed";

export default function App() {
  const { ready, settings, init, setVoiceMode, voiceMode } = useStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("general");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const root = document.documentElement;
    const t = settings.theme || "dark";
    root.setAttribute("data-theme", t);
    // Backward compat: also toggle dark/light classes
    root.classList.toggle("dark", t === "dark" || t === "cyberpunk" || t === "neon");
    root.classList.toggle("light", t === "light" || t === "earth" || t === "nordic" || t === "sakura");
    try { localStorage.setItem("mira:initial-theme", t); } catch {}
  }, [settings.theme]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, sidebarCollapsed ? "1" : "0");
    } catch {}
  }, [sidebarCollapsed]);

  // Custom CSS injector
  useEffect(() => {
    const existing = document.querySelector("style[data-mira-css]");
    if (settings.customCSS?.trim()) {
      if (existing) {
        existing.textContent = settings.customCSS;
      } else {
        const style = document.createElement("style");
        style.setAttribute("data-mira-css", "");
        style.textContent = settings.customCSS;
        document.head.appendChild(style);
      }
    } else {
      existing?.remove();
    }
  }, [settings.customCSS]);

  // Auto-collapse sidebar on narrow viewports
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      // Ctrl+N — new chat
      if (mod && e.key === "n") {
        e.preventDefault();
        useStore.getState().newConversation();
      }
      // Ctrl+, — settings
      if (mod && e.key === ",") {
        e.preventDefault();
        setSettingsTab("general");
        setSettingsOpen(true);
      }
      // Escape — close modals/voice
      if (e.key === "Escape") {
        if (voiceMode) {
          setVoiceMode(false);
        } else if (settingsOpen) {
          setSettingsOpen(false);
        }
      }
      // Ctrl+/ — focus chat input
      if (mod && e.key === "/") {
        e.preventDefault();
        document.querySelector<HTMLTextAreaElement>("[data-chat-input]")?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settingsOpen, voiceMode]);

  if (!ready) {
    return (
      <div className="h-full w-full flex items-center justify-center mira-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin mira-accent" />
          <div className="font-mono text-xs uppercase tracking-[0.3em] mira-muted">
            Initialising MIRA
          </div>
        </div>
      </div>
    );
  }

  // First-run: show onboarding wizard
  if (!settings.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="h-full w-full flex mira-bg mira-text overflow-hidden relative">
      {/* Mobile overlay backdrop when sidebar is open */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      <div className={`${sidebarCollapsed ? "hidden md:block" : "fixed md:relative z-40 md:z-auto"} h-full`}>
        <Sidebar
          onOpenSettings={(tab) => {
            setSettingsTab((tab as SettingsTab) || "general");
            setSettingsOpen(true);
            setSidebarCollapsed(true);
          }}
          onOpenVoiceMode={() => { setVoiceMode(true); setSidebarCollapsed(true); }}
          voiceMode={voiceMode}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      </div>
      <ChatView
        onOpenSettings={(tab) => {
          setSettingsTab((tab as SettingsTab) || "general");
          setSettingsOpen(true);
        }}
        onOpenVoiceMode={() => setVoiceMode(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
      />
      <AnimatePresence>
        {voiceMode && <VoiceMode />}
      </AnimatePresence>
    </div>
  );
}

