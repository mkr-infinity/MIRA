import { useState, useEffect, useMemo, useRef } from "react";
import { useStore } from "../store";
import {
  ChevronRight,
  ChevronLeft,
  Key,
  Cpu,
  Globe,
  Sparkles,
  Check,
  ExternalLink,
  Loader2,
  Mic,
  Volume2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Zap,
  Bot,
  ArrowRight,
} from "lucide-react";
import { getAdapter } from "../lib/ai";
import { findModelMeta, formatContextWindow, type ModelMeta } from "../lib/ai/models";
import { detectAllLocalModels, type ProbeResult } from "../lib/localModels";
import { tts } from "../lib/voice/tts";
import { motion, AnimatePresence } from "framer-motion";
import type { ProviderId, ProviderConfig } from "../types";
import { cx, THEMES, type ThemeId } from "../lib/theme";
import { MiraLogo } from "./MiraLogo";
import { MagneticGrid } from "./MagneticGrid";

type Step = "welcome" | "provider" | "voice" | "done";

const STEPS: Step[] = ["welcome", "provider", "voice", "done"];

const providerMeta: Record<string, {
  tagline: string;
  needsKey: boolean;
  needsLocal: boolean;
  icon: any;
  color: string;
  url?: string;
  defaultModel: string;
}> = {
  openai: {
    tagline: "GPT-4o, o1, GPT-4 Turbo",
    needsKey: true,
    needsLocal: false,
    icon: Sparkles,
    color: "#10A37F",
    url: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
  },
  anthropic: {
    tagline: "Claude 3.5 Sonnet, Opus, Haiku",
    needsKey: true,
    needsLocal: false,
    icon: Sparkles,
    color: "#D97757",
    url: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-3-5-sonnet-20241022",
  },
  gemini: {
    tagline: "Gemini 1.5 Pro & Flash",
    needsKey: true,
    needsLocal: false,
    icon: Sparkles,
    color: "#4285F4",
    url: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-1.5-flash",
  },
  ollama: {
    tagline: "Run Llama, Mistral, Qwen locally",
    needsKey: false,
    needsLocal: true,
    icon: Cpu,
    color: "#00D4FF",
    defaultModel: "llama3.2",
  },
  openrouter: {
    tagline: "Hundreds of models, one key",
    needsKey: true,
    needsLocal: false,
    icon: Sparkles,
    color: "#8B5CF6",
    url: "https://openrouter.ai/keys",
    defaultModel: "anthropic/claude-3.5-sonnet",
  },
  custom: {
    tagline: "Any OpenAI-compatible endpoint",
    needsKey: true,
    needsLocal: false,
    icon: Globe,
    color: "#10B981",
    defaultModel: "",
  },
};

const PROVIDER_ORDER: ProviderId[] = ["openai", "anthropic", "gemini", "openrouter", "custom", "ollama"];

export function Onboarding() {
  const { settings, updateSettings, setActiveProvider, setProviderConfig } = useStore();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [ollamaEndpoint, setOllamaEndpoint] = useState("http://localhost:11434");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testError, setTestError] = useState("");
  const [models, setModels] = useState<ModelMeta[]>([]);
  const [pickedModel, setPickedModel] = useState<string>("");
  const [probing, setProbing] = useState(false);
  const [probeResults, setProbeResults] = useState<ProbeResult[] | null>(null);
  const [voiceTest, setVoiceTest] = useState<"idle" | "speaking" | "done">("idle");
  const [userName, setUserName] = useState("sir");
  const [themeChoice, setThemeChoice] = useState<ThemeId>((settings.theme as ThemeId) || "dark");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const stepIdx = STEPS.indexOf(step);

  // Apply theme immediately when user selects it
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeChoice);
    root.classList.toggle("dark", themeChoice === "dark" || themeChoice === "cyberpunk" || themeChoice === "neon");
    root.classList.toggle("light", themeChoice === "light" || themeChoice === "earth" || themeChoice === "nordic" || themeChoice === "sakura");
  }, [themeChoice]);

  const canContinue = useMemo(() => {
    if (step === "welcome") return true;
    if (step === "provider") {
      if (!selectedProvider) return false;
      const meta = providerMeta[selectedProvider];
      if (meta.needsKey && !apiKey.trim()) return false;
      if (testStatus === "testing" || probing) return false;
      if (meta.needsLocal && !pickedModel) return false;
      if (selectedProvider === "custom" && !ollamaEndpoint.trim()) return false;
      return true;
    }
    if (step === "voice") return true;
    return true;
  }, [step, selectedProvider, apiKey, testStatus, probing, pickedModel]);

  useEffect(() => {
    if (!selectedProvider) {
      setModels([]);
      setPickedModel("");
      return;
    }
    const meta = providerMeta[selectedProvider];
    if (meta.needsLocal) {
      setModels([]);
      setPickedModel("");
      setTestStatus("idle");
      setTestError("");
    } else {
      setPickedModel(meta.defaultModel);
      setTestStatus("idle");
      setTestError("");
    }
  }, [selectedProvider]);

  async function testApiKey() {
    if (!selectedProvider) return;
    setTestStatus("testing");
    setTestError("");
    try {
      const cfg: ProviderConfig = settings.providers.find((p) => p.id === selectedProvider)!;
      if (cfg) {
        cfg.apiKey = apiKey;
        if (selectedProvider === "custom") cfg.baseUrl = ollamaEndpoint;
        if (cfg.authType === "local") cfg.localEndpoint = ollamaEndpoint;
      }
      const adapter = getAdapter(selectedProvider);
      const live = await adapter.listModels(cfg);
      if (live.length) {
        const merged: ModelMeta[] = [];
        for (const id of live) {
          const meta = findModelMeta(id);
          merged.push(meta || { id, name: id, provider: selectedProvider, contextWindow: 0, maxOutput: 0, description: "Detected on your account.", capabilities: ["text"] });
        }
        setModels(merged);
        if (live.includes(pickedModel) || !pickedModel) setPickedModel(live[0]);
      } else {
        setModels([]);
        setPickedModel("");
      }
      setTestStatus("ok");
    } catch (e: any) {
      setTestError(e?.message || "Couldn't reach the provider");
      setTestStatus("fail");
    }
  }

  async function detectLocal() {
    if (!selectedProvider) return;
    setProbing(true);
    setTestError("");
    try {
      const cfg: ProviderConfig = settings.providers.find((p) => p.id === selectedProvider)!;
      if (cfg) cfg.localEndpoint = ollamaEndpoint;
      const adapter = getAdapter(selectedProvider);
      let live: string[] = [];
      try { live = await adapter.listModels(cfg); } catch { live = []; }
      const results = await detectAllLocalModels();
      setProbeResults(results);
      const fromTyped = live.map((id) => ({ id, source: ollamaEndpoint }));
      if (fromTyped.length === 0) {
        const found = results.find((r) => r.ok && r.models.length);
        if (found) fromTyped.push(...found.models.map((m) => ({ id: m.id, source: found.server.baseUrl })));
      }
      if (fromTyped.length) {
        const merged: ModelMeta[] = fromTyped.map(({ id }) => {
          const meta = findModelMeta(id);
          return meta || { id, name: id, provider: selectedProvider, contextWindow: 0, maxOutput: 0, description: "Detected on your machine.", capabilities: ["text"] };
        });
        setModels(merged);
        setPickedModel(fromTyped[0].id);
        setTestStatus("ok");
      } else {
        setModels([]);
        setPickedModel("");
        setTestStatus("fail");
        setTestError("No local models found. Is Ollama running on " + ollamaEndpoint + "?");
      }
    } finally {
      setProbing(false);
    }
  }

  async function finish() {
    if (selectedProvider) {
      await setActiveProvider(selectedProvider);
      const patch: Partial<ProviderConfig> = { model: pickedModel || providerMeta[selectedProvider].defaultModel };
      if (selectedProvider === "custom") { patch.apiKey = apiKey; patch.baseUrl = ollamaEndpoint; patch.authHeaderName = "Authorization"; }
      else if (providerMeta[selectedProvider].needsKey) { patch.apiKey = apiKey; }
      if (providerMeta[selectedProvider].needsLocal) patch.localEndpoint = ollamaEndpoint;
      await setProviderConfig(selectedProvider, patch);
    }
    await updateSettings({ userName: userName || "sir", theme: themeChoice, onboardingComplete: true });
  }

  async function skip() {
    await updateSettings({ onboardingComplete: true });
  }

  function goNext() {
    if (step === "welcome") setStep("provider");
    else if (step === "provider") setStep("voice");
    else if (step === "voice") { finish(); setStep("done"); }
    else if (step === "done") finish();
  }

  function goBack() {
    if (step === "provider") setStep("welcome");
    else if (step === "voice") setStep("provider");
  }

  return (
    <div className="h-full w-full mira-bg mira-text overflow-y-auto">
      <MagneticGrid lineCount={20} repulsionRadius={180} maxDisplacement={50} />
      {/* Jarvis-style scan lines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.5) 2px, rgba(0,212,255,0.5) 4px)",
          backgroundSize: "100% 4px",
        }}
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-5" style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />
      </div>

      <div className="relative min-h-full flex flex-col">
        {/* Progress */}
        <div className="w-full h-1 mira-elevated">
          <motion.div
            className="h-full mira-accent-bg"
            initial={{ width: 0 }}
            animate={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Skip button */}
        {step !== "done" && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={skip}
              className="px-4 py-2 text-sm mira-muted hover:mira-text transition-colors rounded-lg hover:mira-elevated"
            >
              Skip setup
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === "welcome" && <WelcomeStep />}
                {step === "provider" && (
                  <ProviderStep
                    selected={selectedProvider}
                    onSelect={setSelectedProvider}
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                    showKey={showKey}
                    setShowKey={setShowKey}
                    ollamaEndpoint={ollamaEndpoint}
                    setOllamaEndpoint={setOllamaEndpoint}
                    models={models}
                    pickedModel={pickedModel}
                    onPickModel={setPickedModel}
                    testStatus={testStatus}
                    testError={testError}
                    onTest={testApiKey}
                    onDetectLocal={detectLocal}
                    probing={probing}
                    probeResults={probeResults}
                    userName={userName}
                    setUserName={setUserName}
                    theme={themeChoice}
                    setTheme={setThemeChoice}
                    nameInputRef={nameInputRef}
                  />
                )}
                {step === "voice" && (
                  <VoiceStep
                    onTest={() => {
                      tts.speak("Good day, sir. All systems are operational. I am ready when you are.", { onEnd: () => setVoiceTest("done") });
                      setVoiceTest("speaking");
                    }}
                    testState={voiceTest}
                  />
                )}
                {step === "done" && <DoneStep onEnter={goNext} />}
              </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className="flex items-center justify-between mt-8 sm:mt-10">
              <button
                onClick={goBack}
                disabled={step === "welcome" || step === "done"}
                className="flex items-center gap-1 px-4 py-2 text-sm mira-muted hover:mira-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] mira-muted">
                {stepIdx + 1} / {STEPS.length}
              </div>
              {step !== "done" ? (
                <button
                  onClick={goNext}
                  disabled={!canContinue}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl mira-accent-bg text-white font-medium hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {step === "voice" ? "Finish" : "Continue"}
                  <ArrowRight size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  const [displayText, setDisplayText] = useState("");
  const fullText = "MKR Intelligent Responsive Assistant";
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursor = setInterval(() => {
      setShowCursor((c) => !c);
    }, 530);
    return () => clearInterval(cursor);
  }, []);

  return (
    <div className="text-center py-4 sm:py-8 relative">
      {/* Jarvis rotating rings */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto mb-6 sm:mb-8"
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-500/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border border-cyan-400/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-6 rounded-full border border-cyan-300/8"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <MiraLogo size={72} glow={true} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-[10px] font-mono text-cyan-400/50 mb-3 tracking-[0.3em] uppercase"
      >
        &gt; SYSTEM INITIALIZED
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h1 className="font-display text-4xl sm:text-6xl font-bold mb-3 tracking-tight gradient-text">
          MIRA
        </h1>
        <p className="text-sm font-mono text-cyan-400/70 mb-2 h-5">
          {displayText}
          {showCursor && <span className="text-cyan-400 ml-0.5">▎</span>}
        </p>
        <p className="text-xs sm:text-sm max-w-md mx-auto" style={{ color: "var(--subtle)" }}>
          Multi-provider, voice-activated, runs on your machine.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mt-6 space-y-1"
      >
        {["VOICE MODULE: ONLINE", "MEMORY BANK: STANDBY", "PROVIDER INTERFACE: READY"].map((msg, i) => (
          <motion.div
            key={msg}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.25 }}
            className="text-[10px] font-mono text-emerald-400/50"
          >
            &gt; {msg}
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8 sm:mt-10 flex items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex-wrap"
        style={{ color: "var(--subtle)" }}
      >
        {[
          { icon: Zap, label: "Multi-provider" },
          { icon: Mic, label: "Voice mode" },
          { icon: Cpu, label: "Local + cloud" },
          { icon: Bot, label: "Memory" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon size={11} className="mira-accent" /> {label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function ProviderStep(props: {
  selected: ProviderId | null;
  onSelect: (p: ProviderId) => void;
  apiKey: string;
  setApiKey: (s: string) => void;
  showKey: boolean;
  setShowKey: (b: boolean) => void;
  ollamaEndpoint: string;
  setOllamaEndpoint: (s: string) => void;
  models: ModelMeta[];
  pickedModel: string;
  onPickModel: (m: string) => void;
  testStatus: "idle" | "testing" | "ok" | "fail";
  testError: string;
  onTest: () => void;
  onDetectLocal: () => void;
  probing: boolean;
  probeResults: ProbeResult[] | null;
  userName: string;
  setUserName: (s: string) => void;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  nameInputRef?: React.RefObject<HTMLInputElement>;
}) {
  const meta = props.selected ? providerMeta[props.selected] : null;
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Connect a model</h2>
        <p className="text-sm mira-muted">
          Pick a provider. All keys stay on this machine.
        </p>
      </div>

      {/* Provider tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {PROVIDER_ORDER.map((p) => {
          const m = providerMeta[p];
          const Icon = m.icon;
          const isSelected = props.selected === p;
          return (
            <motion.button
              key={p}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => props.onSelect(p)}
              className={cx(
                "p-3 sm:p-4 rounded-xl border text-left transition-all",
                isSelected
                  ? "mira-elevated mira-text"
                  : "mira-elevated mira-muted hover:mira-hover border-transparent"
              )}
              style={isSelected ? { borderColor: m.color, boxShadow: `0 0 20px ${m.color}15` } : undefined}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${m.color}20` }}>
                  <Icon size={14} style={{ color: m.color }} />
                </div>
                <span className="text-sm font-semibold capitalize">{p}</span>
              </div>
              <p className="text-[10px] sm:text-[11px] mira-muted leading-relaxed line-clamp-2">{m.tagline}</p>
            </motion.button>
          );
        })}
      </div>

      {meta && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mira-elevated rounded-xl p-4 sm:p-5 space-y-4 border mira-border"
        >
          {meta.needsKey && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-2">API key</div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={props.showKey ? "text" : "password"}
                    value={props.apiKey}
                    onChange={(e) => props.setApiKey(e.target.value)}
                    placeholder="Paste your key here..."
                    className="mira-input pr-10 font-mono text-sm"
                  />
                  <button
                    onClick={() => props.setShowKey(!props.showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 mira-muted hover:mira-text"
                    type="button"
                  >
                    {props.showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={props.onTest}
                  disabled={!props.apiKey || props.testStatus === "testing"}
                  className="px-4 py-2 rounded-xl mira-accent-bg text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 hover:opacity-90 transition-all"
                >
                  <RefreshCw size={13} className={props.testStatus === "testing" ? "animate-spin" : ""} />
                  Test
                </button>
              </div>
              {meta.url && (
                <a href={meta.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-[11px] mira-accent hover:underline">
                  Get a key <ExternalLink size={10} />
                </a>
              )}
              {props.testStatus === "ok" && (
                <p className="text-[11px] mira-success mt-2 flex items-center gap-1">
                  <Check size={11} /> Verified
                </p>
              )}
              {props.testStatus === "fail" && (
                <p className="text-[11px] mira-danger mt-2 flex items-center gap-1">
                  <AlertCircle size={11} /> {props.testError}
                </p>
              )}
            </div>
          )}

          {props.selected === "custom" && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-2">Base URL</div>
              <input
                value={props.ollamaEndpoint}
                onChange={(e) => props.setOllamaEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="mira-input font-mono text-sm w-full"
              />
            </div>
          )}

          {meta.needsLocal && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-2">Local endpoint</div>
              <div className="flex gap-2">
                <input
                  value={props.ollamaEndpoint}
                  onChange={(e) => props.setOllamaEndpoint(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="mira-input font-mono text-sm flex-1"
                />
                <button
                  onClick={props.onDetectLocal}
                  disabled={props.probing}
                  className="px-4 py-2 rounded-xl mira-accent-bg text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 hover:opacity-90"
                >
                  <Cpu size={13} className={props.probing ? "animate-spin" : ""} />
                  {props.probing ? "Detecting" : "Detect"}
                </button>
              </div>
              {props.probeResults && (
                <div className="mt-3 rounded-xl border mira-border mira-elevated divide-y divide-[color:var(--border)]">
                  {props.probeResults.map((r) => (
                    <div key={r.server.id} className="flex items-center justify-between gap-2 px-3 py-2 text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.ok && r.models.length ? "#10B981" : r.ok ? "#F59E0B" : "#525252" }} />
                        <span className="mira-text font-medium">{r.server.label}</span>
                      </div>
                      <span className="mira-muted font-mono text-[10px] flex-shrink-0">
                        {r.ok ? `${r.models.length} model${r.models.length === 1 ? "" : "s"}` : r.error || "no response"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {props.models.length > 0 ? (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-2">Model</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {props.models.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => props.onPickModel(m.id)}
                    className={cx(
                      "p-2.5 rounded-xl border text-left transition-all",
                      props.pickedModel === m.id
                        ? "mira-accent-soft border-transparent"
                        : "mira-elevated mira-border hover:mira-hover"
                    )}
                  >
                    <div className="text-sm font-medium mira-text">{m.name}</div>
                    <div className="text-[10px] font-mono mira-muted">{formatContextWindow(m.contextWindow || 0)} ctx</div>
                  </button>
                ))}
              </div>
            </div>
          ) : meta.needsLocal ? (
            <div className="rounded-xl border mira-border mira-elevated px-4 py-3 text-[11px] mira-muted">
              <p className="mira-text mb-1">No local models detected.</p>
              <p>Make sure Ollama is running, then tap <span className="mira-accent font-medium">Detect</span>.</p>
            </div>
          ) : null}

          {/* Name and Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t mira-border">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-2">Your name</div>
              <input
                ref={props.nameInputRef}
                value={props.userName}
                onChange={(e) => props.setUserName(e.target.value)}
                placeholder="sir"
                className="mira-input text-sm"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-2">Theme</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => props.setTheme(t.id)}
                    className={cx(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] transition-all",
                      props.theme === t.id
                        ? "border-[var(--accent)] mira-accent-soft mira-text font-medium"
                        : "mira-elevated mira-muted border-transparent hover:border-[var(--accent)]/30"
                    )}
                  >
                    <div className="flex gap-0.5">
                      {t.preview.map((c, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="truncate w-full text-center">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function VoiceStep({ onTest, testState }: { onTest: () => void; testState: "idle" | "speaking" | "done" }) {
  return (
    <div className="space-y-6 text-center py-4 sm:py-8">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Voice</h2>
        <p className="text-sm mira-muted">
          Tap below to hear MIRA. Change voices in Settings later.
        </p>
      </div>
      <div className="py-4 sm:py-8">
        <motion.button
          onClick={onTest}
          whileTap={{ scale: 0.95 }}
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full mira-elevated border-2 mira-border flex items-center justify-center mx-auto hover:scale-105 transition-transform"
          style={testState === "speaking" ? { borderColor: "var(--accent)", boxShadow: "0 0 40px var(--accent-faint)" } : undefined}
        >
          <Volume2 size={32} className="mira-accent" />
          {testState === "speaking" && (
            <motion.span
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--accent)" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>
        <p className="text-sm mira-muted mt-4">
          {testState === "idle" && "Tap to play a sample"}
          {testState === "speaking" && "Speaking..."}
          {testState === "done" && "Working! Press F11 for full voice mode."}
        </p>
      </div>
    </div>
  );
}

function DoneStep({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="text-center py-8 sm:py-12">
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8"
      >
        <MiraLogo size={120} glow={true} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3 gradient-text">You're all set</h2>
        <p className="text-sm sm:text-base max-w-md mx-auto mb-8" style={{ color: "var(--muted)" }}>
          MIRA is ready. Type a message or press F11 to start talking.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="px-8 py-3 rounded-xl mira-accent-bg text-white font-semibold text-base flex items-center gap-2 mx-auto hover:opacity-90 transition-all"
        >
          Enter MIRA <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}
