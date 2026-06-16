import { useState, useEffect, useMemo, useRef } from "react";
import { useStore } from "../store";
import {
  X,
  Key,
  Sparkles,
  Volume2,
  Folder,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  Globe,
  Cpu,
  Save,
  Plus,
  Trash2,
  FileText,
  ChevronDown,
  Bug,
  Mic,
  Code,
  Image as ImageIcon,
  Music,
  Search,
  Brain,
  AlertCircle,
  Camera,
  Github,
  Coffee,
  Loader2,
  ExternalLink,
  Languages,
  Puzzle,
  Globe as GlobeIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProviderId, ProviderConfig, Skill, Project, ProjectFile, PluginConfig } from "../types";
import { getAdapter } from "../lib/ai";
import { findModelMeta, modelsForProvider, formatContextWindow, type ModelMeta } from "../lib/ai/models";
import { detectAllLocalModels, type ProbeResult } from "../lib/localModels";
import { isTauri } from "../lib/platform";
import { storage } from "../lib/storage";
import { metaFor } from "../lib/ai/providerMeta";
import { AboutView } from "./AboutView";
import { MiraLogo } from "./MiraLogo";
import { cx } from "../lib/theme";
import { tts } from "../lib/voice/tts";
import { THEMES, type ThemeId } from "../lib/theme";

type Tab = "general" | "providers" | "voice" | "skills" | "memory" | "projects" | "logs" | "data" | "custom" | "plugins" | "about";

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

const ICONS: Record<string, any> = {
  search: Search,
  code: Code,
  image: ImageIcon,
  music: Music,
  cpu: Cpu,
  brain: Brain,
  sparkles: Sparkles,
  mic: Mic,
  file: FileText,
};

const ACCENT_COLORS = ["#00D4FF", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#3B82F6", "#C2410C", "#84CC16", "#A855F7", "#F43F5E"];

export function SettingsModal({
  open,
  onClose,
  initialTab = "general",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 mira-backdrop"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Settings"
              className="w-full max-w-4xl h-full max-h-[88vh] glass-strong rounded-2xl shadow-pop flex flex-col overflow-hidden"
            >
              <SettingsContent tab={tab} setTab={setTab} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SettingsContent({
  tab,
  setTab,
  onClose,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onClose: () => void;
}) {
  const tabs: Array<{ id: Tab; label: string; icon: any; group: string }> = [
    { id: "general", label: "General", icon: Sparkles, group: "Workspace" },
    { id: "providers", label: "Providers", icon: Key, group: "Workspace" },
    { id: "voice", label: "Voice", icon: Volume2, group: "Workspace" },
    { id: "skills", label: "Skills", icon: Brain, group: "Workspace" },
    { id: "memory", label: "Memory", icon: Brain, group: "Workspace" },
    { id: "projects", label: "Projects", icon: Folder, group: "Workspace" },
    { id: "data", label: "Data", icon: Folder, group: "System" },
    { id: "custom", label: "Custom CSS", icon: Code, group: "System" },
    { id: "plugins", label: "Plugins", icon: Puzzle, group: "System" },
    { id: "logs", label: "Logs", icon: FileText, group: "System" },
    { id: "about", label: "About", icon: Coffee, group: "System" },
  ];
  const grouped = tabs.reduce<Record<string, typeof tabs>>((acc, t) => {
    (acc[t.group] ||= []).push(t);
    return acc;
  }, {});
  const activeLabel = tabs.find((t) => t.id === tab)?.label;
  return (
    <>
      <header className="h-16 flex items-center gap-3 px-5 border-b mira-border flex-shrink-0 glass">
        <MiraLogo size={32} glow={true} />
        <div className="flex flex-col leading-tight">
          <h1 className="font-display text-base font-semibold gradient-text">MIRA</h1>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] mira-muted">
            {activeLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-auto p-2 rounded-lg hover:mira-hover mira-muted hover:mira-text transition-colors"
        >
          <X size={16} />
        </button>
      </header>
      <div className="flex-1 flex min-h-0 flex-col sm:flex-row">
        <nav aria-label="Settings" className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r mira-border p-2 sm:p-3 flex-shrink-0 overflow-x-auto sm:overflow-y-auto flex sm:flex-col gap-1 sm:gap-0">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="text-[9px] font-mono uppercase tracking-[0.25em] mira-muted px-2 mb-1.5">
                {group}
              </div>
              <div role="tablist" aria-orientation="vertical" className="space-y-0.5">
                {items.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-mira text-sm transition-all ${
                        tab === t.id
                          ? "mira-elevated mira-text font-medium"
                          : "mira-muted hover:mira-text"
                      }`}
                      style={tab === t.id ? { background: "var(--accent-soft)" } : undefined}
                    >
                      <Icon size={14} className={tab === t.id ? "mira-accent" : ""} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {tab === "general" && <GeneralTab />}
            {tab === "providers" && <ProvidersTab />}
            {tab === "voice" && <VoiceTab />}
            {tab === "skills" && <SkillsTab />}
            {tab === "memory" && <MemoryTab />}
            {tab === "projects" && <ProjectsTab />}
            {tab === "logs" && <LogsTab />}
            {tab === "data" && <DataTab />}
            {tab === "custom" && <CustomCSSTab />}
            {tab === "plugins" && <PluginsTab />}
            {tab === "about" && <AboutView />}
          </div>
        </div>
      </div>
    </>
  );
}

function GeneralTab() {
  const { settings, updateSettings, setTheme } = useStore();
  function restartOnboarding() {
    if (
      !confirm(
        "Restart the 4-step setup? Your chats, projects, and memory will be kept — only the welcome wizard will run again."
      )
    ) {
      return;
    }
    updateSettings({ onboardingComplete: false });
  }
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-1">General</h2>
          <p className="text-sm mira-muted">
            Tune how MIRA behaves and looks.
          </p>
        </div>
        <button
          onClick={restartOnboarding}
          className="px-3 py-1.5 rounded-mira mira-elevated border mira-border mira-text text-xs hover:mira-hover"
          title="Re-run the 4-step setup wizard"
        >
          Restart onboarding
        </button>
      </div>

      {/* Profile — emerald */}
      <Section
        icon={Camera}
        title="Profile"
        description="Your name, photo, and accent color across the app."
        accent="brand"
      >
        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-2 mira-border flex items-center justify-center mira-text text-2xl font-semibold flex-shrink-0"
              style={
                settings.accentColor && !settings.avatar
                  ? { background: `${settings.accentColor}25`, color: settings.accentColor, borderColor: `${settings.accentColor}60` }
                  : undefined
              }
            >
              {settings.avatar ? (
                <img src={settings.avatar} alt={settings.userName || "User"} className="w-full h-full object-cover" />
              ) : (
                (settings.userName || "M").slice(0, 1).toUpperCase()
              )}
            </div>
            <label className="mira-chip cursor-pointer hover:mira-hover transition-colors">
              <Camera size={10} />
              <span>Upload</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert("Image is too large. Max 2MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    updateSettings({ avatar: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
            </label>
            {settings.avatar && (
              <button
                onClick={() => updateSettings({ avatar: "" })}
                className="mira-chip hover:mira-hover transition-colors"
              >
                <X size={10} />
                <span>Remove</span>
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4 min-w-0">
            <Field label="Display name">
              <input
                value={settings.userName}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                placeholder="What should MIRA call you?"
                className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-emerald-500/50"
              />
            </Field>

            <Field label="Accent color">
              <div className="flex flex-wrap gap-1.5">
                {(["", "#00D4FF", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#3B82F6", "#C2410C", "#84CC16", "#A855F7", "#F43F5E"] as const).map((c) => (
                  <button
                    key={c || "auto"}
                    onClick={() => updateSettings({ accentColor: c })}
                    className={cx(
                      "w-7 h-7 rounded-full border-2 transition-transform",
                      (settings.accentColor || "") === c ? "scale-110" : "hover:scale-105"
                    )}
                    style={{
                      background: c || "linear-gradient(135deg, var(--accent), var(--accent-soft))",
                      borderColor: (settings.accentColor || "") === c ? "var(--text)" : "var(--border)",
                    }}
                    title={c ? c : "Theme default"}
                  />
                ))}
              </div>
              <Hint>Used for your avatar and the active state. Empty = theme accent.</Hint>
            </Field>
          </div>
        </div>
      </Section>

      {/* Appearance & model defaults — cyan */}
      <Section
        icon={Eye}
        title="Appearance & model defaults"
        description="Theme, sampling, and token budget. Apply to every new conversation."
        accent="brand"
      >
        <Field label="Theme">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  settings.theme === t.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_12px_var(--accent-ring)]"
                    : "mira-border mira-elevated hover:border-[var(--accent)]/40"
                }`}
              >
                <div className="flex gap-0.5">
                  {t.preview.map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <span className={`text-xs font-medium ${
                  settings.theme === t.id ? "mira-accent" : "mira-muted"
                }`}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`Temperature · ${settings.temperature.toFixed(1)}`}>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
            <Hint>Lower is more focused. Higher is more creative.</Hint>
          </Field>
          <Field label="Max output tokens">
            <input
              type="number"
              min="256"
              max="32000"
              value={settings.maxTokens}
              onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) || 4096 })}
              className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text font-mono text-sm focus:outline-none focus:border-cyan-500/50"
            />
          </Field>
        </div>
      </Section>

      {/* Behavior — amber */}
      <Section
        icon={Brain}
        title="Behavior & resilience"
        description="Desktop control, provider fallbacks, and skill folder."
        accent="brand"
      >
        <ToggleRow
          label="Desktop notifications"
          description="Show a desktop notification when MIRA replies."
          checked={!!settings.notificationsEnabled}
          onChange={(v) => {
            updateSettings({ notificationsEnabled: v });
            if (v && typeof Notification !== "undefined" && Notification.permission === "default") {
              Notification.requestPermission();
            }
          }}
        />
        <ToggleRow
          label="Desktop control"
          description="Let MIRA open apps, set volume, play music, etc."
          checked={settings.desktopControlEnabled}
          onChange={(v) => updateSettings({ desktopControlEnabled: v })}
        />

        <ToggleRow
          label="Auto-rotate across providers"
          description="If the active provider fails, try the next enabled one before giving up."
          checked={settings.autoFallback}
          onChange={(v) => updateSettings({ autoFallback: v })}
        />

        <ToggleRow
          label="Cycle all providers on error"
          description="When auto-rotate is on, also try providers that are disabled or missing keys. Slower but maximises uptime."
          checked={settings.cycleAllProviders}
          onChange={(v) => updateSettings({ cycleAllProviders: v })}
        />

        <Field label="Skill folder (optional)">
          <div className="flex gap-2">
            <input
              value={settings.skillFolder || ""}
              onChange={(e) => updateSettings({ skillFolder: e.target.value })}
              placeholder="/Users/you/MIRA/skills"
              className="mira-input font-mono text-sm"
            />
            <button
              onClick={async () => {
                if (!isTauri()) {
                  alert("Folder picking requires the desktop app. Use the file input in the Skills tab in the browser.");
                  return;
                }
                const { open } = await import("@tauri-apps/plugin-dialog");
                const picked = await open({ directory: true, multiple: false });
                if (typeof picked === "string") updateSettings({ skillFolder: picked });
              }}
              className="px-3 py-2 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-sm"
            >
              Browse
            </button>
          </div>
          <Hint>Each <code>.md</code> file in this folder becomes a skill (uses front-matter for name/icon/category).</Hint>
        </Field>
      </Section>

      {/* Personality — fuchsia */}
      <Section
        icon={Sparkles}
        title="Personality"
        description="Pick a preset to shape MIRA's voice, or write your own system prompt."
        accent="brand"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {([
            { id: "default", label: "Default MIRA", desc: "Calm, dry-witted butler." },
            { id: "concise", label: "Concise", desc: "Tight, no fluff." },
            { id: "friendly", label: "Friendly", desc: "Warm colleague." },
            { id: "code-mentor", label: "Code Mentor", desc: "Optimised for code." },
            { id: "therapist", label: "Therapist", desc: "Listens, reflects." },
            { id: "custom", label: "Custom", desc: "Your own prompt." },
          ] as const).map((p) => {
            const active = (settings.personality || "default") === p.id;
            return (
              <button
                key={p.id}
                onClick={() => updateSettings({ personality: p.id })}
                className={cx(
                  "text-left p-3 rounded-mira border transition-all",
                  active
                    ? "mira-elevated mira-text border-fuchsia-500/50"
                    : "mira-elevated mira-muted border-transparent hover:mira-hover"
                )}
                style={active ? { boxShadow: "inset 0 0 0 1px rgba(217,70,239,0.4)" } : undefined}
              >
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-[11px] mira-muted mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>

        {(settings.personality || "default") === "custom" && (
          <div className="space-y-2">
            <Field label="Custom system prompt">
              <textarea
                value={settings.customSystemPrompt || ""}
                onChange={(e) => updateSettings({ customSystemPrompt: e.target.value })}
                rows={8}
                placeholder="You are MIRA, a personal AI assistant…&#10;&#10;Tips: keep prose tight, call tools by name, never use emojis."
                className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text text-sm focus:outline-none focus:border-fuchsia-500/50 resize-none font-mono"
                maxLength={4000}
              />
              <div className="flex items-center justify-between text-[10px] mira-muted">
                <span>
                  This replaces MIRA's default personality entirely. Memory, skills, and desktop tools are still appended.
                </span>
                <span className="font-mono">{(settings.customSystemPrompt || "").length}/4000</span>
              </div>
            </Field>
            <button
              onClick={() => updateSettings({ customSystemPrompt: "" })}
              className="text-[11px] mira-muted hover:mira-text"
            >
              Reset custom prompt
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}

function ProvidersTab() {
  const { settings, setActiveProvider, setProviderConfig, setProviderModels } = useStore();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">AI providers</h2>
        <p className="text-sm mira-muted">
          Connect any combination. All keys stay on this machine — paste a key, hit
          <span className="font-mono"> Fetch models</span>, and you&apos;re live.
        </p>
      </div>
      <div className="grid gap-3">
        {settings.providers.map((p) => (
          <ProviderCard
            key={p.id}
            provider={p}
            active={p.id === settings.activeProviderId}
            onActivate={() => setActiveProvider(p.id)}
            onUpdate={(patch) => setProviderConfig(p.id, patch)}
            onModels={(ids) => setProviderModels(p.id, ids)}
          />
        ))}
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  active,
  onActivate,
  onUpdate,
  onModels,
}: {
  provider: ProviderConfig;
  active: boolean;
  onActivate: () => void;
  onUpdate: (patch: Partial<ProviderConfig>) => Promise<void>;
  onModels: (ids: string[]) => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState<ModelMeta[]>([]);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [ollamaEmpty, setOllamaEmpty] = useState(false);
  const [probeResults, setProbeResults] = useState<ProbeResult[] | null>(null);
  const [probing, setProbing] = useState(false);

  useEffect(() => {
    // Curated defaults for cloud providers only.
    // Local providers MUST start empty — we only show models that the
    // /api/tags (or equivalent) probe actually returns.
    if (provider.authType === "local") {
      setModels([]);
    } else {
      setModels(modelsForProvider(provider.id));
    }
  }, [provider.id]);

  async function verifyAndFetch() {
    setVerifying(true);
    setVerifyStatus("idle");
    setOllamaEmpty(false);
    try {
      const adapter = getAdapter(provider.id);
      const live = await adapter.listModels(provider);
      if (provider.authType === "local" && live.length === 0) {
        setOllamaEmpty(true);
      }
      const curated = modelsForProvider(provider.id);
      // For local providers: ONLY show what was actually detected. Never
      // pretend a model is installed when it isn't.
      // For cloud: if the API returned models, use ONLY those — the user
      // can only chat with what their key has access to. Curated is only
      // a fallback for providers (e.g. Anthropic) that have no /models
      // endpoint, in which case `live` is empty.
      let merged: ModelMeta[];
      if (provider.authType === "local") {
        merged = live.map((id) => {
          const meta = findModelMeta(id);
          return (
            meta || {
              id,
              name: id,
              provider: provider.id,
              contextWindow: 0,
              maxOutput: 0,
              description: "Detected locally on your machine.",
              capabilities: ["text"],
            }
          );
        });
      } else if (live.length > 0) {
        merged = live.map((id) => {
          const meta = findModelMeta(id);
          return (
            meta || {
              id,
              name: id,
              provider: provider.id,
              contextWindow: 0,
              maxOutput: 0,
              description: "Available in your account.",
              capabilities: ["text"],
            }
          );
        });
      } else {
        // Provider has no /models endpoint (e.g. Anthropic) — fall back to curated.
        merged = [...curated];
      }
      setModels(merged);
      setVerifyStatus("ok");
      // Persist the live IDs to the store so model cycling in the
      // chat pipeline can find a working model on the next error.
      onModels(live);
    } catch (e: any) {
      setVerifyStatus("fail");
      if (provider.authType === "local") setOllamaEmpty(true);
    } finally {
      setVerifying(false);
    }
  }

  async function probeAll() {
    setProbing(true);
    try {
      const results = await detectAllLocalModels();
      setProbeResults(results);
      // Pull models from the same server as this provider, or any OpenAI-compat
      const sameServer = results.find(
        (r) => r.ok && r.server.baseUrl === (provider.localEndpoint || provider.baseUrl)
      );
      const detected: ModelMeta[] = (sameServer?.models || []).map((m) => ({
        id: m.id,
        name: m.id,
        provider: provider.id,
        contextWindow: 0,
        maxOutput: 0,
        description: `Detected on ${m.server} (${m.serverId})`,
        capabilities: ["text"],
      }));
      if (detected.length) {
        setModels(detected);
        setVerifyStatus("ok");
        setOllamaEmpty(false);
      }
    } finally {
      setProbing(false);
    }
  }

  const authBadge = {
    api_key: { label: "API key" },
    browser_oauth: { label: "Browser sign-in" },
    local: { label: "Local" },
  }[provider.authType];

  return (
    <div
      className={cx(
        "rounded-mira border mira-elevated overflow-hidden",
        active ? "ring-1 ring-current" : "mira-border"
      )}
      style={active ? { boxShadow: `0 0 0 1px var(--accent) inset` } : undefined}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-mira mira-elevated flex items-center justify-center mira-accent border mira-border">
          {provider.authType === "local" ? <Cpu size={18} /> : provider.authType === "browser_oauth" ? <Globe size={18} /> : <Key size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium mira-text">{metaFor(provider.id).name}</h3>
            {active && <Badge>active</Badge>}
            <Badge>{authBadge.label}</Badge>
            
          </div>
          <p className="text-xs mira-muted mt-1">{metaFor(provider.id).description}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
            {metaFor(provider.id).apiKeyUrl && (
              <a
                href={metaFor(provider.id).apiKeyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mira-accent hover:underline"
                title={metaFor(provider.id).apiKeyLabel}
              >
                <Key size={10} /> {metaFor(provider.id).apiKeyLabel} <ExternalLink size={9} />
              </a>
            )}
            {metaFor(provider.id).modelsUrl && (
              <a
                href={metaFor(provider.id).modelsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mira-muted hover:mira-text"
                title={`Browse ${metaFor(provider.id).name} models`}
              >
                Browse models <ExternalLink size={9} />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Toggle checked={provider.enabled} onChange={(v) => onUpdate({ enabled: v })} />
          {!active && provider.enabled && (
            <button
              onClick={onActivate}
              className="px-3 py-1.5 rounded-lg mira-elevated mira-text text-xs font-medium hover:mira-hover border mira-border"
            >
              Use
            </button>
          )}
        </div>
      </div>

      {provider.enabled && (
        <div className="px-4 pb-4 space-y-3">
          {provider.authType === "api_key" && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">API key</div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={provider.apiKey || ""}
                    onChange={(e) => {
                      onUpdate({ apiKey: e.target.value });
                      setVerifyStatus("idle");
                    }}
                    placeholder="Paste your key here…"
                    className="mira-input pr-10 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 mira-muted hover:mira-text"
                    type="button"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={verifyAndFetch}
                  disabled={!provider.apiKey || verifying}
                  className="px-3 py-2 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-sm flex items-center gap-1.5 disabled:opacity-40"
                >
                  <RefreshCw size={13} className={verifying ? "animate-spin" : ""} />
                  {verifying ? "Checking" : "Fetch models"}
                </button>
              </div>
              {verifyStatus === "ok" && (
                <p className="text-[11px] mira-success mt-1.5 flex items-center gap-1">
                  <Check size={11} /> Verified. {models.length} models available.
                </p>
              )}
              {verifyStatus === "fail" && (
                <p className="text-[11px] mira-danger mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> Couldn't reach the provider with this key.
                </p>
              )}
              {ollamaEmpty && (
                <div className="mt-2 p-3 rounded-mira mira-elevated border mira-border space-y-2">
                  <p className="text-sm mira-text">No models installed.</p>
                  <p className="text-[11px] mira-muted">
                    Install one in a terminal:
                  </p>
                  <code className="block mira-bg mira-text p-2 rounded-md text-[11px] font-mono">
                    ollama pull llama3.2
                  </code>
                  <button
                    onClick={verifyAndFetch}
                    className="text-[11px] mira-accent hover:underline"
                  >
                    Re-check
                  </button>
                </div>
              )}
            </div>
          )}

          {provider.authType === "local" && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Endpoint</div>
              <div className="flex gap-2">
                <input
                  value={provider.localEndpoint || ""}
                  onChange={(e) => onUpdate({ localEndpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="mira-input font-mono text-sm"
                />
                <button
                  onClick={verifyAndFetch}
                  disabled={verifying}
                  className="px-3 py-2 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-sm flex items-center gap-1.5 disabled:opacity-40"
                  title="Probe the endpoint above"
                >
                  <RefreshCw size={13} className={verifying ? "animate-spin" : ""} />
                  Detect
                </button>
                <button
                  onClick={probeAll}
                  disabled={probing}
                  className="px-3 py-2 rounded-mira mira-accent-bg text-white border border-transparent hover:opacity-90 text-sm flex items-center gap-1.5 disabled:opacity-40"
                  title="Scan all known local model servers (Ollama, LM Studio, vLLM, llama.cpp, Jan, GPT4All, KoboldCpp, text-gen-webui)"
                >
                  <Cpu size={13} className={probing ? "animate-spin" : ""} />
                  {probing ? "Scanning" : "Scan all"}
                </button>
              </div>
              {probeResults && (
                <div className="mt-2 rounded-mira border mira-border mira-elevated divide-y divide-[color:var(--border)]">
                  {probeResults.map((r) => (
                    <div key={r.server.id} className="flex items-center justify-between gap-2 px-3 py-2 text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: r.ok && r.models.length ? "#10B981" : r.ok ? "#F59E0B" : "#525252" }}
                        />
                        <span className="mira-text font-medium">{r.server.label}</span>
                        <code className="mira-muted font-mono text-[10px] truncate">{r.server.baseUrl}</code>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.ok ? (
                          <span className="mira-success font-mono">{r.models.length} model{r.models.length === 1 ? "" : "s"}</span>
                        ) : (
                          <span className="mira-muted font-mono">{r.error || "no response"}</span>
                        )}
                        <span className="mira-muted font-mono text-[10px]">{r.durationMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Model</div>
            <button
              onClick={() => setModelPickerOpen(!modelPickerOpen)}
              className="w-full text-left mira-input font-mono text-sm"
            >
              {provider.model || (provider.authType === "local" ? "No model detected" : "Select a model")}
            </button>
            {modelPickerOpen && (
              <div className="mt-2 max-h-72 overflow-y-auto rounded-mira border mira-border mira-elevated space-y-0.5 p-1">
                {models.length === 0 ? (
                  <div className="p-3 text-center space-y-1">
                    <p className="text-xs mira-muted">
                      {provider.authType === "local"
                        ? "No local models detected."
                        : "No models yet — paste a key and tap \"Fetch models\" first."}
                    </p>
                    {provider.authType === "local" && (
                      <p className="text-[10px] mira-muted font-mono">
                        Tap <span className="mira-text">Scan all</span> to probe Ollama, LM Studio, vLLM, llama.cpp, Jan, GPT4All, KoboldCpp, and text-gen-webui on default ports.
                      </p>
                    )}
                  </div>
                ) : (
                  models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onUpdate({ model: m.id });
                        if (!active) onActivate();
                        setModelPickerOpen(false);
                      }}
                      className={cx(
                        "w-full text-left p-2 rounded-md hover:mira-hover transition-colors",
                        m.id === provider.model ? "mira-accent-soft" : ""
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium mira-text">{m.name}</span>
                        {m.id === provider.model && <Check size={12} className="mira-accent" />}
                      </div>
                      <div className="text-[10px] font-mono mira-muted mt-0.5">
                        {m.id} · {formatContextWindow(m.contextWindow || 0)} ctx · {formatContextWindow(m.maxOutput || 0)} out
                      </div>
                      {m.description && (
                        <div className="text-[11px] mira-muted mt-0.5 line-clamp-2">
                          {m.description}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {(provider.id === "openai" || provider.id === "openrouter") && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Custom base URL (optional)</div>
              <input
                value={provider.baseUrl || ""}
                onChange={(e) => onUpdate({ baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="mira-input font-mono text-sm"
              />
            </div>
          )}

          {provider.id === "custom" && (
            <div className="space-y-3">
              <Field label="Base URL (required)">
                <input
                  value={provider.baseUrl || ""}
                  onChange={(e) => onUpdate({ baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="mira-input font-mono text-sm"
                />
                <Hint>A URL pointing to an OpenAI-compatible API endpoint.</Hint>
              </Field>
              <Field label="Display label (optional)">
                <input
                  value={provider.displayLabel || ""}
                  onChange={(e) => onUpdate({ displayLabel: e.target.value })}
                  placeholder="My custom provider"
                  className="mira-input font-mono text-sm"
                />
              </Field>
              <Field label="Auth header name">
                <input
                  value={provider.authHeaderName || "Authorization"}
                  onChange={(e) => onUpdate({ authHeaderName: e.target.value })}
                  placeholder="Authorization"
                  className="mira-input font-mono text-sm"
                />
                <Hint>
                  Set to <span className="font-mono">Authorization</span> for Bearer token auth,
                  or a custom header name if your endpoint expects one.
                </Hint>
              </Field>
              <Field label="Extra headers (JSON)">
                <textarea
                  value={JSON.stringify(provider.extraHeaders || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      onUpdate({ extraHeaders: parsed });
                    } catch {
                      // allow typing
                    }
                  }}
                  rows={4}
                  placeholder='{"X-Custom-Header": "value"}'
                  className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text text-sm focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                />
                <Hint>Extra HTTP headers sent with every request. Must be valid JSON.</Hint>
              </Field>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

function LogsTab() {
  const { logs, clearLogs, settings, updateSettings } = useStore();
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error" | "debug">("all");
  const [source, setSource] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const sources = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => s.add(l.source));
    return Array.from(s).sort();
  }, [logs]);

  useEffect(() => {
    if (source !== "all" && !sources.includes(source)) setSource("all");
  }, [sources, source]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "all" && l.level !== filter) return false;
      if (source !== "all" && l.source !== source) return false;
      return true;
    });
  }, [logs, filter, source]);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs.length, autoScroll]);

  const levelColor: Record<string, string> = {
    debug: "mira-muted",
    info: "mira-text",
    warn: "text-amber-400",
    error: "mira-danger",
  };

  const levelIcon: Record<string, string> = {
    debug: "·",
    info: "→",
    warn: "!",
    error: "×",
  };

  function exportLogs() {
    const text = logs
      .map((l) => `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}${l.meta ? " " + JSON.stringify(l.meta) : ""}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyLogs() {
    const text = filtered
      .map((l) => `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-1">Logs</h2>
          <p className="text-sm mira-muted">
            Live dev log of every action, network call, and provider request. Capped at the most recent 1,000 events.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="mira-chip">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>live</span>
          </span>
          <span className="text-xs mira-muted font-mono">
            {filtered.length} / {logs.length}
          </span>
        </div>
      </div>

      <Card>
        <ToggleRow
          label="Capture logs"
          description="Mirror console output, AI events, voice and desktop actions, and every network call into this panel."
          checked={settings.logsEnabled}
          onChange={(v) => updateSettings({ logsEnabled: v })}
        />
        <div className="mt-3 pt-3 border-t mira-border">
          <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-2">What gets logged</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            {[
              { src: "boot", desc: "App startup" },
              { src: "init", desc: "Store hydration" },
              { src: "settings", desc: "Settings changes" },
              { src: "providers", desc: "Provider swap/config" },
              { src: "sendMessage", desc: "Chat turns" },
              { src: "openai/anthropic/…", desc: "AI requests + tokens" },
              { src: "fetch/xhr", desc: "Every network call" },
              { src: "voice", desc: "STT/TTS events" },
              { src: "desktop", desc: "OS commands" },
              { src: "memory/skills/projects", desc: "CRUD actions" },
              { src: "console", desc: "console.* output" },
              { src: "errors", desc: "Provider + runtime" },
            ].map((t) => (
              <div key={t.src} className="flex items-center gap-1.5">
                <code className="px-1 py-0.5 rounded font-mono text-[10px] mira-elevated mira-text">{t.src}</code>
                <span className="mira-muted">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "info", "warn", "error", "debug"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              "px-3 py-1.5 rounded-mira text-xs font-mono uppercase tracking-wider border transition-colors",
              filter === f
                ? "mira-elevated mira-text mira-border"
                : "mira-muted hover:mira-text border-transparent"
            )}
          >
            {f}
            <span className="ml-1.5 mira-muted">
              {f === "all" ? logs.length : logs.filter((l) => l.level === f).length}
            </span>
          </button>
        ))}
        {sources.length > 0 && (
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-2 py-1.5 rounded-mira text-xs font-mono mira-elevated border mira-border mira-text focus:outline-none"
          >
            <option value="all">all sources ({logs.length})</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s} ({logs.filter((l) => l.source === s).length})
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={copyLogs}
            className="px-3 py-1.5 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-xs"
            title="Copy filtered logs to clipboard"
          >
            Copy
          </button>
          <button
            onClick={exportLogs}
            className="px-3 py-1.5 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-xs"
            title="Download all logs as .log"
          >
            Export
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1.5 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-xs"
            title="Clear log buffer"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="mira-bg mira-border border rounded-mira p-2 h-[480px] overflow-y-auto font-mono text-[11px] leading-relaxed"
      >
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center mira-muted text-sm gap-2">
            <Code size={20} className="mira-muted" />
            <div>No log entries match the current filters.</div>
            <div className="text-[10px] font-mono">
              {logs.length === 0 ? "Waiting for activity… send a message to see logs flow." : "Try clearing the filter."}
            </div>
          </div>
        ) : (
          filtered.map((l) => {
            const expanded = expandedIds.has(l.id);
            const hasMeta = l.meta && Object.keys(l.meta).length > 0;
            return (
              <div key={l.id} className={cx("group rounded px-2 py-0.5 hover:mira-hover", expanded && "mira-elevated")}>
                <div className="flex items-start gap-2">
                  <span className="mira-muted flex-shrink-0 tabular-nums">
                    {new Date(l.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className={cx("flex-shrink-0 w-10 uppercase font-bold tabular-nums", levelColor[l.level])}>
                    {levelIcon[l.level]} {l.level}
                  </span>
                  <span className="mira-muted flex-shrink-0 font-semibold">[{l.source}]</span>
                  <span className="mira-text break-all flex-1">{l.message}</span>
                  {hasMeta && (
                    <button
                      onClick={() => toggleExpand(l.id)}
                      className="mira-muted hover:mira-text flex-shrink-0 px-1"
                      title={expanded ? "Hide details" : "Show details"}
                    >
                      <ChevronDown size={10} className={cx("transition-transform", expanded && "rotate-180")} />
                    </button>
                  )}
                </div>
                {expanded && hasMeta && (
                  <pre className="ml-[120px] mt-1 p-2 rounded mira-elevated text-[10px] mira-muted overflow-x-auto">
{JSON.stringify(l.meta, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function VoiceTab() {
  const { settings, updateSettings } = useStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [wakeTest, setWakeTest] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  useEffect(() => {
    function load() {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length) setVoices(v);
    }
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  async function testWakeWord() {
    if (!settings.voiceWakeWord) {
      updateSettings({ voiceWakeWord: true });
    }
    setWakeTest("testing");
    try {
      const text = `Wake word test. Say "${settings.voiceWakeWordText || "hey mira"}" to wake me.`;
      tts.speak(text, {
        voice: settings.voiceName,
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        lang: settings.voiceLang,
        onEnd: () => setWakeTest("ok"),
        onError: () => setWakeTest("fail"),
      });
      // TTS has no callback we can wire to "wake word detector" — for now
      // the test is simply: did the system play the prompt?
      setTimeout(() => setWakeTest((s) => (s === "testing" ? "ok" : s)), 1500);
    } catch {
      setWakeTest("fail");
    }
  }

  async function testVoice() {
    setWakeTest("testing");
    try {
      await tts.whenReady();
      tts.speak(
        "Hello. I am MIRA, your personal AI assistant. How may I help you today?",
        {
          voice: settings.voiceName,
          rate: settings.voiceRate,
          pitch: settings.voicePitch,
          lang: settings.voiceLang,
          onEnd: () => setWakeTest("ok"),
          onError: () => setWakeTest("fail"),
        }
      );
      setTimeout(() => setWakeTest((s) => (s === "testing" ? "ok" : s)), 4000);
    } catch {
      setWakeTest("fail");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">Voice</h2>
        <p className="text-sm mira-muted">
          Speech recognition and synthesis run locally on your device.
        </p>
      </div>

      {/* Input & wake word — violet */}
      <Section
        icon={Mic}
        title="Input & wake word"
        description="MIRA listens for a phrase and starts a voice session automatically."
        accent="brand"
      >
        <ToggleRow
          label="Wake word"
          description="Continuously listen for a phrase to start a voice session."
          checked={settings.voiceWakeWord}
          onChange={(v) => updateSettings({ voiceWakeWord: v })}
        />
        <Field label="Wake word phrase">
          <div className="flex gap-2">
            <input
              value={settings.voiceWakeWordText || "hey mira"}
              onChange={(e) => updateSettings({ voiceWakeWordText: e.target.value })}
              placeholder="hey mira"
              maxLength={32}
              className="flex-1 px-3 py-2 rounded-lg mira-elevated border mira-border mira-text font-mono text-sm focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={testWakeWord}
              className="px-3 py-2 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-sm flex items-center gap-1.5"
              title="Play a test phrase containing your wake word"
            >
              {wakeTest === "testing" ? <Loader2 size={13} className="animate-spin" /> : <Mic size={13} />}
              Test
            </button>
          </div>
          <Hint>
            Use 1-3 words. MIRA listens for this exact phrase in the audio stream and starts a voice session when heard.
            {wakeTest === "ok" && <span className="mira-success"> · Test played.</span>}
            {wakeTest === "fail" && <span className="mira-danger"> · TTS not available.</span>}
          </Hint>
        </Field>
      </Section>

      {/* Output voice — cyan */}
      <Section
        icon={Volume2}
        title="Output voice"
        description="Choose how MIRA sounds. Pitch and rate are tuned per voice."
        accent="brand"
      >
        <ToggleRow
          label="Auto-speak replies"
          description="MIRA reads out its responses."
          checked={settings.voiceAutoSpeak}
          onChange={(v) => updateSettings({ voiceAutoSpeak: v })}
        />
        <Field label="Voice">
          <div className="flex gap-2">
            <select
              value={settings.voiceName}
              onChange={(e) => updateSettings({ voiceName: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">System default (best available)</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <button
              onClick={testVoice}
              className="px-3 py-2 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-sm flex items-center gap-1.5"
              title="Play a sample with the selected voice"
            >
              {wakeTest === "testing" ? <Loader2 size={13} className="animate-spin" /> : <Volume2 size={13} />}
              Test
            </button>
          </div>
        </Field>
        <Field label="Language">
          <div className="flex gap-2">
            <input
              value={settings.voiceLang || "en-US"}
              onChange={(e) => updateSettings({ voiceLang: e.target.value })}
              placeholder="en-US"
              maxLength={10}
              className="flex-1 px-3 py-2 rounded-lg mira-elevated border mira-border mira-text font-mono text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="button"
              onClick={() => updateSettings({ voiceLang: "en-US" })}
              className="px-3 py-2 rounded-mira mira-elevated mira-muted border mira-border hover:mira-text text-xs"
              title="Reset to English (US)"
            >
              <Languages size={13} />
            </button>
          </div>
          <Hint>BCP-47 tag (e.g. <span className="font-mono">en-US</span>, <span className="font-mono">fr-FR</span>, <span className="font-mono">ja-JP</span>). Used for both STT and TTS.</Hint>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Rate · ${settings.voiceRate.toFixed(1)}x`}>
            <input
              type="range" min="0.5" max="2" step="0.1"
              value={settings.voiceRate}
              onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </Field>
          <Field label={`Pitch · ${settings.voicePitch.toFixed(1)}`}>
            <input
              type="range" min="0" max="2" step="0.1"
              value={settings.voicePitch}
              onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function SkillsTab() {
  const {
    skills,
    saveSkill,
    removeSkill,
    toggleSkill,
    importSkills,
    loadSkillFolder,
    settings,
  } = useStore();
  const [editing, setEditing] = useState<Skill | null>(null);
  const [importing, setImporting] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [reloadMsg, setReloadMsg] = useState<string>("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of skills) {
      const c = (s.category || "uncategorised").toLowerCase();
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([id, count]) => ({ id, count }));
  }, [skills]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return skills.filter((s) => {
      if (category !== "all" && (s.category || "uncategorised").toLowerCase() !== category) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.category || "").toLowerCase().includes(q) ||
        s.prompt.toLowerCase().includes(q)
      );
    });
  }, [skills, query, category]);

  async function importSkillFolder() {
    setImporting(true);
    try {
      if (isTauri()) {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readDir, readTextFile } = await import("@tauri-apps/plugin-fs");
        const selected = await open({ directory: true, multiple: false });
        if (!selected || typeof selected !== "string") return;
        const entries = await readDir(selected);
        const incoming: Skill[] = [];
        for (const entry of entries) {
          if (entry.isFile && entry.name?.endsWith(".md")) {
            const content = await readTextFile(`${selected}/${entry.name}`);
            const parsed = parseSkillMarkdown(entry.name, content);
            if (parsed) incoming.push(parsed);
          }
        }
        if (incoming.length) {
          await importSkills(incoming);
        } else {
          alert("No .md skill files found in that folder.");
        }
      } else {
        // Browser fallback: use file input
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ".md";
        input.onchange = async () => {
          if (!input.files) return;
          const incoming: Skill[] = [];
          for (const f of Array.from(input.files)) {
            const text = await f.text();
            const parsed = parseSkillMarkdown(f.name, text);
            if (parsed) incoming.push(parsed);
          }
          if (incoming.length) await importSkills(incoming);
        };
        input.click();
      }
    } catch (e: any) {
      alert("Import failed: " + e.message);
    } finally {
      setImporting(false);
    }
  }

  async function reloadConfiguredFolder() {
    setReloading(true);
    setReloadMsg("");
    try {
      const res = await loadSkillFolder();
      setReloadMsg(res.message);
    } finally {
      setReloading(false);
      setTimeout(() => setReloadMsg(""), 3500);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-1">Skills</h2>
          <p className="text-sm mira-muted">
            Toggleable behaviour modules. Attach a folder of <code className="text-cyan-400 font-mono">.md</code> files to bulk-import.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {settings.skillFolder && (
            <button
              onClick={reloadConfiguredFolder}
              disabled={reloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg mira-elevated mira-muted hover:text-cyan-400 border mira-border text-sm"
              title="Reload the configured skill folder"
            >
              <RefreshCw size={14} className={reloading ? "animate-spin" : ""} />
              {reloading ? "Reloading" : "Reload"}
            </button>
          )}
          <button
            onClick={importSkillFolder}
            disabled={importing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg mira-elevated mira-muted hover:text-cyan-400 border mira-border text-sm"
          >
            <Folder size={14} />
            {importing ? "Importing…" : "Import folder"}
          </button>
          <button
            onClick={() => setEditing(blankSkill())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            <Plus size={14} /> New skill
          </button>
        </div>
      </div>

      {/* Search + category filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 mira-muted pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${skills.length} skill${skills.length === 1 ? "" : "s"}…`}
            className="mira-input pl-8 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 mira-muted hover:mira-text p-1"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <CategoryChip
            id="all"
            label="All"
            count={skills.length}
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              id={c.id}
              label={c.id}
              count={c.count}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
            />
          ))}
        </div>
        {reloadMsg && (
          <div className="text-[11px] mira-muted">{reloadMsg}</div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-sm mira-muted border border-dashed mira-border rounded-mira">
          {query
            ? `No skills match "${query}".`
            : category !== "all"
            ? `No skills in category "${category}".`
            : "No skills yet. Hit New skill or import a folder of .md files."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((s) => {
            const Icon = ICONS[s.icon || "sparkles"] || Sparkles;
            return (
              <div
                key={s.id}
                className={cx(
                  "p-4 rounded-mira border transition-all",
                  s.enabled
                    ? "border-cyan-500/30 bg-cyan-500/5"
                    : "mira-border mira-elevated"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-mira bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium mira-text">{s.name}</h3>
                      {s.category && <Badge>{s.category}</Badge>}
                      {s.source === "imported" && <Badge>imported</Badge>}
                    </div>
                    <p className="text-xs mira-muted mt-0.5">{s.description}</p>
                  </div>
                  <Toggle checked={s.enabled} onChange={() => toggleSkill(s.id)} />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => setEditing(s)}
                    className="text-xs mira-muted hover:text-cyan-400 px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeSkill(s.id)}
                    className="ml-auto text-xs mira-muted hover:text-red-400 px-2 py-1 flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <SkillEditor
          skill={editing}
          onClose={() => setEditing(null)}
          onSave={(s) => {
            saveSkill(s);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  id: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "px-2.5 py-1 rounded-pill text-[10px] font-mono uppercase tracking-wider border transition-colors flex items-center gap-1.5",
        active
          ? "mira-elevated mira-text border-cyan-500/50"
          : "mira-muted hover:mira-text border-transparent hover:mira-hover"
      )}
    >
      <span>{label}</span>
      <span className={cx("text-[9px]", active ? "mira-accent" : "opacity-60")}>{count}</span>
    </button>
  );
}

function parseSkillMarkdown(filename: string, content: string): Skill | null {
  // Expected format (front-matter style):
  // # Skill: Name
  // icon: search
  // category: research
  // description: Short description
  //
  // <prompt body>
  const lines = content.split("\n");
  let name = filename.replace(/\.md$/i, "");
  let icon = "sparkles";
  let category = "imported";
  let description = "";
  let promptStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (i === 0 && l.startsWith("#")) {
      name = l.replace(/^#+\s*(?:Skill:\s*)?/i, "").trim() || name;
      continue;
    }
    const m = l.match(/^(icon|description|category):\s*(.+)$/i);
    if (m) {
      const key = m[1].toLowerCase();
      if (key === "icon") icon = m[2].trim();
      else if (key === "description") description = m[2].trim();
      else if (key === "category") category = m[2].trim();
      continue;
    }
    if (l === "" && promptStart === 0) {
      promptStart = i + 1;
      break;
    }
  }
  const prompt = lines.slice(promptStart).join("\n").trim();
  if (!prompt) return null;
  return {
    id: Math.random().toString(36).slice(2),
    name,
    description: description || prompt.slice(0, 100),
    prompt,
    enabled: true,
    icon,
    category,
  };
}

function MemoryTab() {
  const { memory, addMemory, removeMemory } = useStore();
  const [newItem, setNewItem] = useState("");
  const [tags, setTags] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">Memory</h2>
        <p className="text-sm mira-muted">
          Facts MIRA remembers about you across all conversations.
        </p>
      </div>
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newItem.trim()) return;
            addMemory({
              content: newItem.trim(),
              tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
              source: "user",
            });
            setNewItem("");
            setTags("");
          }}
          className="space-y-2"
        >
          <textarea
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Something to remember… e.g. I work on Rust web servers"
            rows={2}
            className="w-full bg-transparent text-sm mira-text placeholder:mira-muted resize-none focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="flex-1 mira-elevated px-3 py-2 rounded-lg text-sm mira-text placeholder:mira-muted border mira-border focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </form>
      </Card>
      <div className="space-y-2">
        {memory.length === 0 && (
          <div className="text-center py-8 text-sm mira-muted">
            No memories yet. Say "Remember I prefer dark themes" in chat.
          </div>
        )}
        {memory.map((m) => (
          <div
            key={m.id}
            className="group p-3 rounded-mira border mira-border mira-elevated hover:border-cyan-500/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Brain size={14} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm mira-text">{m.content}</p>
                {m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded-pill mira-elevated mira-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeMemory(m.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 mira-muted hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsTab() {
  const { projects, createProject, updateProject, deleteProject, addProjectFile, removeProjectFile, setActiveProject, activeProjectId, newConversation } = useStore();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  async function importFiles(projectId: string) {
    try {
      if (isTauri()) {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");
        const selected = await open({ multiple: true, directory: false });
        if (!selected) return;
        const files = Array.isArray(selected) ? selected : [selected];
        for (const f of files) {
          if (typeof f !== "string") continue;
          const text = await readTextFile(f);
          const name = f.split(/[\\/]/).pop() || f;
          await addProjectFile(projectId, {
            id: Math.random().toString(36).slice(2),
            name,
            type: name.split(".").pop() || "txt",
            size: text.length,
            content: text,
            addedAt: Date.now(),
          });
        }
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = async () => {
          if (!input.files) return;
          for (const f of Array.from(input.files)) {
            const text = await f.text();
            await addProjectFile(projectId, {
              id: Math.random().toString(36).slice(2),
              name: f.name,
              type: f.name.split(".").pop() || "txt",
              size: f.size,
              content: text,
              addedAt: Date.now(),
            });
          }
        };
        input.click();
      }
    } catch (e: any) {
      alert("Import failed: " + e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-1">Projects</h2>
          <p className="text-sm mira-muted">
            Group conversations, attach reference files, and set standing instructions.
          </p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing({
              id: "",
              name: "",
              description: "",
              color: ACCENT_COLORS[0],
              icon: "folder",
              customInstructions: "",
              files: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 border border-cyan-500/30"
        >
          <Plus size={14} /> New project
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {projects.length === 0 && (
          <div className="text-center py-12 text-sm mira-muted border border-dashed mira-border rounded-mira">
            No projects yet. Create one to organise related conversations.
          </div>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-mira border ${
              activeProjectId === p.id
                ? "border-cyan-500/50 bg-cyan-500/5"
                : "mira-border mira-elevated"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-mira flex items-center justify-center"
                style={{ background: `${p.color}20`, color: p.color }}
              >
                <Folder size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium mira-text">{p.name}</h3>
                  {activeProjectId === p.id && <Badge>active</Badge>}
                </div>
                {p.description && (
                  <p className="text-xs mira-muted mt-0.5">{p.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono mira-muted">
                  <span>{p.files.length} files</span>
                  {p.customInstructions && <span>· has instructions</span>}
                </div>
                {p.files.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.files.slice(0, 5).map((f) => (
                      <span
                        key={f.id}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-pill mira-elevated mira-muted flex items-center gap-1"
                      >
                        <FileText size={9} /> {f.name}
                      </span>
                    ))}
                    {p.files.length > 5 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-pill mira-elevated mira-muted">
                        +{p.files.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setActiveProject(p.id);
                    newConversation(p.id);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1"
                >
                  Open chat
                </button>
                <button
                  onClick={() => setEditing(p)}
                  className="text-xs mira-muted hover:text-cyan-400 px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete project "${p.name}"?`)) deleteProject(p.id);
                  }}
                  className="text-xs mira-muted hover:text-red-400 px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProjectEditor
          project={editing}
          isNew={creating}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={async (p) => {
            if (creating) {
              const id = createProject(p);
              setActiveProject(id);
            } else {
              await updateProject(p.id, p);
            }
            setEditing(null);
            setCreating(false);
          }}
          onAddFiles={() => editing.id && importFiles(editing.id)}
          onRemoveFile={(fileId) => editing.id && removeProjectFile(editing.id, fileId)}
        />
      )}
    </div>
  );
}

function ProjectEditor({
  project,
  isNew,
  onClose,
  onSave,
  onAddFiles,
  onRemoveFile,
}: {
  project: Project;
  isNew: boolean;
  onClose: () => void;
  onSave: (p: Project) => void | Promise<void>;
  onAddFiles: () => void;
  onRemoveFile: (id: string) => void;
}) {
  const [p, setP] = useState(project);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 rounded-2xl border mira-border mira-surface shadow-2xl max-h-[85vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold mb-4">
          {isNew ? "New project" : "Edit project"}
        </h2>
        <div className="space-y-3">
          <Field label="Name">
            <input
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50"
              autoFocus
            />
          </Field>
          <Field label="Description">
            <input
              value={p.description || ""}
              onChange={(e) => setP({ ...p, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50"
            />
          </Field>
          <Field label="Colour">
            <div className="flex gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setP({ ...p, color: c })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    p.color === c ? "ring-2 ring-white scale-110" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </Field>
          <Field label="Custom instructions">
            <textarea
              value={p.customInstructions || ""}
              onChange={(e) => setP({ ...p, customInstructions: e.target.value })}
              rows={4}
              placeholder="Standing instructions for every conversation in this project. e.g. 'Always respond in formal English and prefer concise answers.'"
              className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </Field>
          {!isNew && (
            <Field label="Reference files">
              <div className="space-y-1">
                {p.files.length === 0 && (
                  <div className="text-xs mira-muted">No files attached.</div>
                )}
                {p.files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md mira-elevated text-xs"
                  >
                    <FileText size={12} className="text-cyan-400" />
                    <span className="font-mono flex-1 truncate">{f.name}</span>
                    <span className="mira-muted">{(f.size / 1024).toFixed(1)}K</span>
                    <button onClick={() => onRemoveFile(f.id)} className="mira-muted hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={onAddFiles}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md mira-elevated mira-muted hover:text-cyan-400 border border-dashed mira-border text-xs"
                >
                  <Plus size={12} /> Attach file
                </button>
              </div>
            </Field>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm mira-muted hover:mira-hover">
            Cancel
          </button>
          <button
            onClick={() => onSave(p)}
            disabled={!p.name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-30"
          >
            <Save size={14} /> {isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PluginsTab() {
  const { settings, updateSettings } = useStore();
  const [editing, setEditing] = useState<PluginConfig | null>(null);
  const plugins = settings.plugins || [];

  function addPlugin() {
    const newPlugin: PluginConfig = {
      id: Math.random().toString(36).slice(2),
      name: "",
      enabled: true,
      url: "",
      description: "",
      version: "1.0.0",
    };
    setEditing(newPlugin);
  }

  function savePlugin(p: PluginConfig) {
    const exists = plugins.some((x) => x.id === p.id);
    const updated = exists
      ? plugins.map((x) => (x.id === p.id ? p : x))
      : [...plugins, p];
    updateSettings({ plugins: updated });
    setEditing(null);
  }

  function removePlugin(id: string) {
    if (confirm("Remove this plugin?")) {
      updateSettings({ plugins: plugins.filter((p) => p.id !== id) });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-1">Plugins</h2>
          <p className="text-sm mira-muted">
            Load external JS modules to extend MIRA's capabilities.
          </p>
        </div>
        <button
          onClick={addPlugin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 border border-cyan-500/30"
        >
          <Plus size={14} /> Add plugin
        </button>
      </div>

      {plugins.length === 0 ? (
        <div className="text-center py-10 text-sm mira-muted border border-dashed mira-border rounded-mira">
          No plugins added yet. Click "Add plugin" to load a JS module from a URL.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {plugins.map((p) => (
            <div key={p.id} className="p-4 rounded-mira border mira-border mira-elevated">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-mira bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Puzzle size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium mira-text">{p.name || "Untitled plugin"}</h3>
                    <Badge>v{p.version}</Badge>
                  </div>
                  <p className="text-xs mira-muted mt-0.5">{p.description || "No description"}</p>
                  <code className="block text-[10px] font-mono mira-muted mt-1 truncate">{p.url}</code>
                </div>
                <Toggle checked={p.enabled} onChange={(v) => savePlugin({ ...p, enabled: v })} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => setEditing(p)} className="text-xs mira-muted hover:text-cyan-400 px-2 py-1">Edit</button>
                <button onClick={() => removePlugin(p.id)} className="text-xs mira-muted hover:text-red-400 px-2 py-1 ml-auto">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl border mira-border mira-surface shadow-2xl">
            <h2 className="font-display text-lg font-semibold mb-4">
              {editing.name ? `Edit ${editing.name}` : "New plugin"}
            </h2>
            <div className="space-y-3">
              <Field label="Name">
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50" />
              </Field>
              <Field label="JS module URL">
                <input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder="https://example.com/plugin.js"
                  className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text font-mono text-sm focus:outline-none focus:border-cyan-500/50" />
                <Hint>The plugin must export <code className="font-mono">onMessage</code> or <code className="font-mono">onSettings</code>.</Hint>
              </Field>
              <Field label="Description">
                <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50" />
              </Field>
              <Field label="Version">
                <input value={editing.version} onChange={(e) => setEditing({ ...editing, version: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text font-mono text-sm focus:outline-none focus:border-cyan-500/50" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm mira-muted hover:mira-hover">Cancel</button>
              <button onClick={() => savePlugin(editing)} disabled={!editing.name.trim() || !editing.url.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-30">
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomCSSTab() {
  const { settings, updateSettings } = useStore();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">Custom CSS</h2>
        <p className="text-sm mira-muted">
          Inject your own CSS to override MIRA's styles. Changes apply in real time.
        </p>
      </div>
      <Card>
        <Field label="CSS code">
          <textarea
            value={settings.customCSS || ""}
            onChange={(e) => updateSettings({ customCSS: e.target.value })}
            rows={20}
            placeholder="/* MIRA custom styles */&#10;&#10;.message-bubble {&#10;  background: rgba(255,255,255,0.05);&#10;  border-radius: 12px;&#10;}"
            className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text text-sm focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
          />
          <Hint>
            Use any valid CSS. Changes are saved automatically. Reset below to clear.
          </Hint>
        </Field>
        <button
          onClick={() => updateSettings({ customCSS: "" })}
          className="text-[11px] mira-muted hover:mira-text"
        >
          Reset custom CSS
        </button>
      </Card>
    </div>
  );
}

function DataTab() {
  const { settings, conversations, memory, skills, projects, errors, clearError } = useStore();
  const [dir, setDir] = useState("");
  useEffect(() => { storage.getDataDir().then(setDir); }, []);

  // ---- Aggregated stats ----
  const stats = useMemo(() => {
    let totalPrompts = 0;
    let totalContext = 0;
    let totalCompletion = 0;
    let totalAssistantTurns = 0;
    const latencies: number[] = [];
    let firstUsedAt: number | null = null;
    const providerCounts: Record<string, { prompts: number; tokens: number }> = {};
    let estimatedSavedMs = 0;
    let totalChars = 0;

    for (const c of conversations) {
      if (!firstUsedAt || c.createdAt < firstUsedAt) firstUsedAt = c.createdAt;
      const prov = c.provider || "unknown";
      if (!providerCounts[prov]) providerCounts[prov] = { prompts: 0, tokens: 0 };
      for (const m of c.messages) {
        if (m.role === "user") {
          totalPrompts += 1;
          providerCounts[prov].prompts += 1;
          totalChars += m.content.length;
        }
        if (m.role === "assistant") {
          totalAssistantTurns += 1;
          if (m.usage?.promptTokens) totalContext += m.usage.promptTokens;
          if (m.usage?.completionTokens) {
            totalCompletion += m.usage.completionTokens;
            providerCounts[prov].tokens += m.usage.completionTokens;
          }
          if (typeof m.latencyMs === "number" && m.latencyMs > 0) latencies.push(m.latencyMs);
        }
      }
    }
    // Heuristic "time saved" = assume a user would take 4x as long to type the assistant's output.
    // Use total completion tokens * 25 chars/token / ~40 wpm typing.
    if (totalCompletion > 0) {
      const words = (totalCompletion * 0.75); // 0.75 word per token rough
      estimatedSavedMs = Math.round((words / 40) * 60_000);
    }
    const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const sortedLat = [...latencies].sort((a, b) => a - b);
    const medianLatency = sortedLat.length
      ? sortedLat[Math.floor(sortedLat.length / 2)]
      : 0;
    return {
      totalPrompts,
      totalContext,
      totalCompletion,
      totalAssistantTurns,
      avgLatency,
      medianLatency,
      firstUsedAt,
      providerCounts,
      totalChars,
      estimatedSavedMs,
    };
  }, [conversations]);

  // ---- 7-day bar chart: prompts/day ----
  const last7 = useMemo(() => {
    const days: { label: string; key: string; prompts: number; tokens: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        key,
        label: d.toLocaleDateString([], { weekday: "short" }),
        prompts: 0,
        tokens: 0,
      });
    }
    const idx = new Map(days.map((d, i) => [d.key, i]));
    for (const c of conversations) {
      for (const m of c.messages) {
        if (m.role === "user") {
          const k = new Date(m.timestamp).toISOString().slice(0, 10);
          const i = idx.get(k);
          if (i != null) days[i].prompts += 1;
        }
        if (m.role === "assistant" && m.usage?.totalTokens) {
          const k = new Date(m.timestamp).toISOString().slice(0, 10);
          const i = idx.get(k);
          if (i != null) days[i].tokens += m.usage.totalTokens;
        }
      }
    }
    return days;
  }, [conversations]);

  const maxPrompts = Math.max(1, ...last7.map((d) => d.prompts));

  // ---- Per-entity storage sizes ----
  const entitySizes = useMemo(() => {
    const sample = (v: unknown) => {
      try { return JSON.stringify(v).length; } catch { return 0; }
    };
    return [
      { id: "conversations", label: "Conversations", count: conversations.length, bytes: sample(conversations) },
      { id: "memory", label: "Memory", count: memory.length, bytes: sample(memory) },
      { id: "skills", label: "Skills", count: skills.length, bytes: sample(skills) },
      { id: "projects", label: "Projects", count: projects.length, bytes: sample(projects) },
      { id: "settings", label: "Settings", count: 1, bytes: sample(settings) },
    ] as Array<{ id: string; label: string; count: number; bytes: number }>;
  }, [conversations, memory, skills, projects, settings]);
  const totalEntityBytes = entitySizes.reduce((a, b) => a + b.bytes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">Data & storage</h2>
        <p className="text-sm mira-muted">
          Everything lives on this device. No telemetry, no cloud sync.
        </p>
      </div>

      <Card>
        <Field label="Data directory">
          <div className="flex gap-2">
            <input
              readOnly
              value={dir}
              className="flex-1 px-3 py-2 rounded-lg mira-elevated border mira-border mira-text font-mono text-xs"
            />
            <button
              onClick={() => storage.getDataDir().then(setDir)}
              className="p-2 rounded-lg mira-elevated border mira-border mira-muted hover:text-cyan-400"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <Hint>
            {isTauri()
              ? "Stored under your Desktop/MIRA folder."
              : "Running in browser — using localStorage."}
          </Hint>
        </Field>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => useStore.getState().exportConversations()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            <Save size={14} /> Export all data
          </button>
          <button
            onClick={() => useStore.getState().importConversations()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg mira-elevated mira-text border mira-border hover:mira-hover text-sm"
          >
            <Folder size={14} /> Import data
          </button>
        </div>
        <Hint>Export as JSON. Import merges conversations, memory, and skills.</Hint>
      </Card>

      {/* Beautiful stat grid */}
      <div>
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] mira-muted mb-2">
          Lifetime usage
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat
            label="Prompts"
            value={formatNum(stats.totalPrompts)}
            accent
            hint={`${stats.totalAssistantTurns} assistant replies`}
          />
          <Stat
            label="Context tokens"
            value={formatNum(stats.totalContext)}
            hint="Sent to model"
          />
          <Stat
            label="Completion tokens"
            value={formatNum(stats.totalCompletion)}
            hint="Received from model"
          />
          <Stat
            label="Time saved"
            value={formatDuration(stats.estimatedSavedMs)}
            hint="vs typing replies"
          />
          <Stat
            label="Avg latency"
            value={stats.avgLatency ? `${formatNum(Math.round(stats.avgLatency))} ms` : "—"}
            hint={stats.medianLatency ? `median ${formatNum(stats.medianLatency)} ms` : "no data"}
          />
          <Stat
            label="Characters typed"
            value={formatNum(stats.totalChars)}
            hint="all user messages"
          />
          <Stat
            label="First used"
            value={stats.firstUsedAt ? new Date(stats.firstUsedAt).toLocaleDateString() : "—"}
            hint={stats.firstUsedAt ? new Date(stats.firstUsedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
          />
          <Stat
            label="Storage"
            value={formatBytes(totalEntityBytes)}
            hint="on disk"
          />
        </div>
      </div>

      {/* 7-day bar chart */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold">Last 7 days</h3>
          <span className="text-[10px] font-mono uppercase tracking-wider mira-muted">
            prompts per day
          </span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {last7.map((d) => {
            const h = (d.prompts / maxPrompts) * 100;
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div className="w-full h-full flex items-end justify-center">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(4, h)}%`,
                      background:
                        d.prompts > 0
                          ? "var(--accent)"
                          : "var(--border)",
                      boxShadow: d.prompts > 0 ? "0 0 8px var(--accent-faint)" : "none",
                    }}
                    title={`${d.label}: ${d.prompts} prompts, ${formatNum(d.tokens)} tokens`}
                  />
                </div>
                <div className="text-[9px] font-mono mira-muted uppercase tracking-wider">
                  {d.label}
                </div>
                {d.prompts > 0 && (
                  <div className="text-[9px] font-mono mira-text font-medium">
                    {d.prompts}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Per-provider breakdown */}
      {Object.keys(stats.providerCounts).length > 0 && (
        <Card>
          <h3 className="font-display text-base font-semibold mb-3">By provider</h3>
          <div className="space-y-2">
            {Object.entries(stats.providerCounts)
              .sort((a, b) => b[1].prompts - a[1].prompts)
              .map(([id, v]) => {
                const total = stats.totalPrompts || 1;
                const pct = (v.prompts / total) * 100;
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono uppercase tracking-wider mira-text">{id}</span>
                      <span className="font-mono mira-muted">
                        {v.prompts} prompts · {formatNum(v.tokens)} tok
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full mira-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Per-entity storage sizes */}
      <Card>
        <h3 className="font-display text-base font-semibold mb-3">Storage breakdown</h3>
        <div className="space-y-1.5">
          {entitySizes.map((e) => {
            const pct = totalEntityBytes ? (e.bytes / totalEntityBytes) * 100 : 0;
            return (
              <div key={e.id} className="flex items-center gap-3 text-xs">
                <div className="w-32 flex-shrink-0 truncate mira-text">{e.label}</div>
                <div className="flex-1 h-2 rounded-full mira-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full mira-accent-bg"
                    style={{ width: `${Math.max(2, pct)}%`, background: "var(--accent)" }}
                  />
                </div>
                <div className="w-28 text-right font-mono mira-muted flex-shrink-0">
                  {formatBytes(e.bytes)}
                </div>
                <div className="w-14 text-right font-mono mira-muted flex-shrink-0">
                  {e.count} item{e.count === 1 ? "" : "s"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs mt-3 pt-2 border-t mira-border">
          <span className="mira-muted">Total on disk</span>
          <span className="font-mono mira-text font-medium">{formatBytes(totalEntityBytes)}</span>
        </div>
      </Card>

      {errors.length > 0 && (
        <Card>
          <h3 className="font-medium mira-text mb-2">Recent errors</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {errors.map((e) => (
              <div key={e.id} className="p-2 rounded-md bg-red-500/5 border border-red-500/20 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-red-300 truncate">
                    {e.reason} · {e.provider}
                  </div>
                  <button
                    onClick={() => clearError(e.id)}
                    className="mira-muted hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="mira-muted mt-1 line-clamp-2">{e.hint}</div>
                <a
                  href={buildIssueUrl(e, settings.repoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-cyan-400 hover:text-cyan-300"
                >
                  <Bug size={11} /> Report this error
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(ms: number): string {
  if (!ms) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${(ms / 3_600_000).toFixed(1)}h`;
  return `${(ms / 86_400_000).toFixed(1)}d`;
}

const DEFAULT_REPO = "https://github.com/mkr-infinity/MIRA";

function buildIssueUrl(e: any, repo: string) {
  const base = (repo || DEFAULT_REPO).replace(/\/+$/, "");
  const title = `[Bug] ${e.reason} on ${e.provider}`;
  const body = [
    `**What happened**`,
    e.reason,
    ``,
    `**Hint**`,
    e.hint,
    ``,
    `**Status**`,
    e.status || "n/a",
    ``,
    `**Provider / Model**`,
    `Provider: ${e.provider}`,
    `Model: ${e.model}`,
    ``,
    `**Error message**`,
    "```",
    e.message,
    "```",
    ``,
    `**Context**`,
    e.context || "(none)",
    ``,
    `**Environment**`,
    `- MIRA version: ${navigator.userAgent.includes("MIRA") ? "2.0.0" : "2.0.0"}`,
    `- Platform: ${navigator.platform}`,
    `- User agent: ${navigator.userAgent}`,
  ].join("\n");
  return `${base}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-mira border mira-border mira-elevated space-y-4">
      {children}
    </div>
  );
}

/**
 * Sub-section card with an accent color, icon, title, and description.
 * Used to break big settings panels into themed, scannable blocks.
 */
type Accent = "brand";
const ACCENT: Record<Accent, { ring: string; text: string; bg: string; border: string; chip: string }> = {
  brand: {
    ring: "from-cyan-500/30 to-cyan-500/0",
    text: "text-cyan-300",
    bg: "bg-cyan-500/[0.08]",
    border: "border-cyan-500/30",
    chip: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
  },
};

function Section({
  icon: Icon,
  title,
  description,
  accent = "brand",
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }> | any;
  title: string;
  description?: string;
  accent?: Accent;
  children: React.ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <section
      className={`relative rounded-mira border ${a.border} mira-elevated overflow-hidden`}
    >
      {/* accent gradient halo */}
      <div
        className={`pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r ${a.ring}`}
      />
      <header className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div
          className={`w-8 h-8 rounded-md ${a.bg} ${a.border} border flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={15} className={a.text} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-sm font-semibold mira-text leading-tight">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-xs mira-muted mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </header>
      <div className="px-4 pb-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider mira-muted mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Hint({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs mira-muted mt-1 ${className}`}>{children}</p>;
}

function Stat({
  label,
  value,
  count,
  hint,
  accent,
}: {
  label: string;
  value?: string;
  count?: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="p-3 rounded-mira mira-elevated border mira-border">
      <div className="text-[9px] font-mono uppercase tracking-[0.2em] mira-muted mb-1">
        {label}
      </div>
      <div
        className={cx(
          "text-xl font-display font-semibold tabular-nums",
          accent ? "mira-accent" : "mira-text"
        )}
      >
        {value ?? count}
      </div>
      {hint && (
        <div className="text-[10px] font-mono mira-muted mt-0.5 truncate" title={hint}>
          {hint}
        </div>
      )}
    </div>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-pill bg-cyan-500/20 text-cyan-400 ${className}`}>
      {children}
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx("mira-toggle", checked && "on")}
    >
      <span className="thumb" />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg mira-elevated cursor-pointer">
      <div>
        <div className="text-sm font-medium mira-text">{label}</div>
        <div className="text-xs mira-muted">{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </label>
  );
}

function blankSkill(): Skill {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    description: "",
    prompt: "",
    enabled: true,
    icon: "sparkles",
    category: "custom",
  };
}

function SkillEditor({ skill, onClose, onSave }: { skill: Skill; onClose: () => void; onSave: (s: Skill) => void }) {
  const [s, setS] = useState(skill);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 rounded-2xl border mira-border mira-surface shadow-2xl">
        <h2 className="font-display text-lg font-semibold mb-4">
          {s.name ? `Edit ${s.name}` : "New skill"}
        </h2>
        <div className="space-y-3">
          <Field label="Name">
            <input
              value={s.name}
              onChange={(e) => setS({ ...s, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50"
            />
          </Field>
          <Field label="Description">
            <input
              value={s.description}
              onChange={(e) => setS({ ...s, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50"
            />
          </Field>
          <Field label="Prompt">
            <textarea
              value={s.prompt}
              onChange={(e) => setS({ ...s, prompt: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Icon">
              <select
                value={s.icon}
                onChange={(e) => setS({ ...s, icon: e.target.value })}
                className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50"
              >
                {Object.keys(ICONS).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <input
                value={s.category || ""}
                onChange={(e) => setS({ ...s, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg mira-elevated border mira-border mira-text focus:outline-none focus:border-cyan-500/50"
              />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm mira-muted hover:mira-hover">
            Cancel
          </button>
          <button
            onClick={() => onSave(s)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
