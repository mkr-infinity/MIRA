import { useEffect, useState } from "react";
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
  | "about";

const SIDEBAR_COLLAPSE_KEY = "jarvis:sidebar-collapsed";

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
    <div className="h-full w-full flex mira-bg mira-text overflow-hidden">
      <Sidebar
        onOpenSettings={(tab) => {
          setSettingsTab((tab as SettingsTab) || "general");
          setSettingsOpen(true);
        }}
        onOpenVoiceMode={() => setVoiceMode(true)}
        voiceMode={voiceMode}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
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

