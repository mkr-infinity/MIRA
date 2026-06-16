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
  LogIn,
  Loader2,
  Mic,
  Volume2,
  Sun,
  Moon,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Zap,
  Bot,
} from "lucide-react";
import { getAdapter } from "../lib/ai";
import { findModelMeta, formatContextWindow, type ModelMeta } from "../lib/ai/models";
import { detectAllLocalModels, type ProbeResult } from "../lib/localModels";
import { tts } from "../lib/voice/tts";
import { motion, AnimatePresence } from "framer-motion";
import type { ProviderId, ProviderConfig } from "../types";
import { cx, THEMES, type ThemeId } from "../lib/theme";
import { MiraLogo } from "./MiraLogo";

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

  const canContinue = useMemo(() => {
    if (step === "welcome") return true;
    if (step === "provider") {
      if (!selectedProvider) return false;
      const meta = providerMeta[selectedProvider];
      if (meta.needsKey && !apiKey.trim()) return false;
      if (testStatus === "testing" || probing) return false;
      // For local: require a model to be picked (only from real detection)
      if (meta.needsLocal && !pickedModel) return false;
      // For custom: require base URL
      if (selectedProvider === "custom" && !ollamaEndpoint.trim()) return false;
      return true;
    }
    if (step === "voice") return true;
    return true;
  }, [step, selectedProvider, apiKey, testStatus, probing, pickedModel]);

  // When a provider is selected, seed the model list correctly:
  // - cloud providers: curated list (will be merged with live after Test)
  // - local providers: ALWAYS start empty — only show what `/api/tags` actually returns
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
        if (selectedProvider === "custom") {
          cfg.baseUrl = ollamaEndpoint;
        }
        if (cfg.authType === "local") cfg.localEndpoint = ollamaEndpoint;
      }
      const adapter = getAdapter(selectedProvider);
      const live = await adapter.listModels(cfg);
      if (live.length) {
        const merged: ModelMeta[] = [];
        for (const id of live) {
          const meta = findModelMeta(id);
          merged.push(
            meta || {
              id,
              name: id,
              provider: selectedProvider,
              contextWindow: 0,
              maxOutput: 0,
              description: "Detected on your account.",
              capabilities: ["text"],
            }
          );
        }
        setModels(merged);
        if (live.includes(pickedModel) || !pickedModel) {
          setPickedModel(live[0]);
        }
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
      // First, probe the typed endpoint directly so the user gets fast feedback.
      const cfg: ProviderConfig = settings.providers.find((p) => p.id === selectedProvider)!;
      if (cfg) cfg.localEndpoint = ollamaEndpoint;
      const adapter = getAdapter(selectedProvider);
      let live: string[] = [];
      try {
        live = await adapter.listModels(cfg);
      } catch {
        live = [];
      }

      // Always also scan well-known local servers in parallel.
      const results = await detectAllLocalModels();
      setProbeResults(results);

      // Prefer models from the endpoint the user typed; fall back to other
      // detected servers (LM Studio, vLLM, etc.) so the user can still
      // see what's installed.
      const fromTyped = live.map((id) => ({ id, source: ollamaEndpoint }));
      if (fromTyped.length === 0) {
        const found = results.find((r) => r.ok && r.models.length);
        if (found) {
          fromTyped.push(...found.models.map((m) => ({ id: m.id, source: found.server.baseUrl })));
        }
      }

      if (fromTyped.length) {
        const merged: ModelMeta[] = fromTyped.map(({ id }) => {
          const meta = findModelMeta(id);
          return (
            meta || {
              id,
              name: id,
              provider: selectedProvider,
              contextWindow: 0,
              maxOutput: 0,
              description: "Detected on your machine.",
              capabilities: ["text"],
            }
          );
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
      const patch: Partial<ProviderConfig> = {
        model: pickedModel || providerMeta[selectedProvider].defaultModel,
      };
      if (selectedProvider === "custom") {
        patch.apiKey = apiKey;
        patch.baseUrl = ollamaEndpoint;
        patch.authHeaderName = "Authorization";
      } else if (providerMeta[selectedProvider].needsKey) {
        patch.apiKey = apiKey;
      }
      if (providerMeta[selectedProvider].needsLocal) patch.localEndpoint = ollamaEndpoint;
      await setProviderConfig(selectedProvider, patch);
    }
    await updateSettings({
      userName: userName || "sir",
      theme: themeChoice,
      onboardingComplete: true,
    });
  }

  function goNext() {
    if (step === "welcome") setStep("provider");
    else if (step === "provider") setStep("voice");
    else if (step === "voice") {
      finish();
      setStep("done");
    } else if (step === "done") {
      finish();
    }
  }
  function goBack() {
    if (step === "provider") setStep("welcome");
    else if (step === "voice") setStep("provider");
  }

  return (
    <div className="h-full w-full grid-bg mira-bg mira-text overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Progress */}
        <div className="w-full h-1 mira-elevated">
          <motion.div
            className="h-full mira-accent-bg"
            initial={{ width: 0 }}
            animate={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
                      tts.speak(
                        "Good day, sir. All systems are operational. I am ready when you are.",
                        { onEnd: () => setVoiceTest("done") }
                      );
                      setVoiceTest("speaking");
                    }}
                    testState={voiceTest}
                  />
                )}
                {step === "done" && <DoneStep />}
              </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className="flex items-center justify-between mt-10">
              <button
                onClick={goBack}
                disabled={step === "welcome" || step === "done"}
                className="flex items-center gap-1 px-4 py-2 text-sm mira-muted hover:mira-text disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-1 px-5 py-2.5 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {step === "voice" ? "Finish" : "Continue"}
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-mira mira-accent-bg text-white font-medium hover:opacity-90"
                >
                  Enter MIRA
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-40 h-40 mx-auto mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl animate-breathe" />
        <div className="absolute inset-3 rounded-full border border-white/5" />
        <div className="absolute inset-6 rounded-full border border-white/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MiraLogo size={80} glow={true} />
        </div>
      </motion.div>
      <div className="flex justify-center mb-4">
        <MiraLogo size={48} glow={true} />
      </div>
      <h1 className="font-display text-5xl font-semibold mb-3 tracking-tight gradient-text">
        MIRA
      </h1>
      <p className="text-lg max-w-lg mx-auto mb-2" style={{color: 'var(--muted)'}}>
        Your personal AI, on every device.
      </p>
      <p className="text-sm max-w-lg mx-auto" style={{color: 'var(--muted)'}}>
        Conversational, voice-activated, and ready to control your desktop. Connect a model to get started.
      </p>
      <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-mono uppercase tracking-wider flex-wrap" style={{color: 'var(--muted)'}}>
        <span className="flex items-center gap-1.5">
          <Zap size={11} className="mira-accent" /> Multi-provider
        </span>
        <span className="flex items-center gap-1.5">
          <Mic size={11} className="mira-accent" /> Voice mode
        </span>
        <span className="flex items-center gap-1.5">
          <Cpu size={11} className="mira-accent" /> Local + cloud
        </span>
        <span className="flex items-center gap-1.5">
          <Bot size={11} className="mira-accent" /> Memory & skills
        </span>
      </div>
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
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">Connect a model</h2>
        <p className="text-sm mira-muted">
          Pick a provider. All keys stay on this machine.
        </p>
      </div>

      {/* Provider tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PROVIDER_ORDER.map((p) => {
          const m = providerMeta[p];
          const Icon = m.icon;
          const isSelected = props.selected === p;
          return (
            <button
              key={p}
              onClick={() => props.onSelect(p)}
              className={cx(
                "p-3 rounded-mira border text-left transition-all",
                isSelected
                  ? "mira-elevated mira-text mira-border"
                  : "mira-elevated mira-muted hover:mira-hover border-transparent"
              )}
              style={isSelected ? { boxShadow: `inset 0 0 0 1px ${m.color}` } : undefined}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color: m.color }} />
                <span className="text-sm font-medium capitalize">{p}</span>
              </div>
              <p className="text-[10px] mira-muted leading-relaxed line-clamp-2">{m.tagline}</p>
            </button>
          );
        })}
      </div>

      {meta && (
        <div className="mira-elevated rounded-mira p-4 space-y-4 animate-fade-in">
          {meta.needsKey && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">API key</div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={props.showKey ? "text" : "password"}
                    value={props.apiKey}
                    onChange={(e) => props.setApiKey(e.target.value)}
                    placeholder="Paste your key here…"
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
                  className="px-3 py-2 rounded-mira mira-elevated mira-text border mira-border hover:mira-hover text-sm flex items-center gap-1.5 disabled:opacity-40"
                >
                  <RefreshCw size={13} className={props.testStatus === "testing" ? "animate-spin" : ""} />
                  Test
                </button>
              </div>
              {meta.url && (
                <a
                  href={meta.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-[11px] mira-muted hover:mira-text"
                >
                  Get a key <ExternalLink size={10} />
                </a>
              )}
              {props.testStatus === "ok" && (
                <p className="text-[11px] mira-success mt-1.5 flex items-center gap-1">
                  <Check size={11} /> Verified.
                </p>
              )}
              {props.testStatus === "fail" && (
                <p className="text-[11px] mira-danger mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> {props.testError}
                </p>
              )}
            </div>
          )}

          {props.selected === "custom" && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Base URL</div>
              <input
                value={props.ollamaEndpoint}
                onChange={(e) => props.setOllamaEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="mira-input font-mono text-sm w-full"
              />
              <p className="text-[11px] mira-muted mt-1">
                An OpenAI-compatible API endpoint.
              </p>
            </div>
          )}

          {meta.needsLocal && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Local endpoint</div>
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
                  className="px-3 py-2 rounded-mira mira-accent-bg text-white border border-transparent hover:opacity-90 text-sm flex items-center gap-1.5 disabled:opacity-40"
                  title="Probe this endpoint + scan Ollama, LM Studio, vLLM, llama.cpp, Jan, GPT4All, KoboldCpp"
                >
                  <Cpu size={13} className={props.probing ? "animate-spin" : ""} />
                  {props.probing ? "Detecting" : "Detect"}
                </button>
              </div>
              <p className="text-[11px] mira-muted mt-1.5">
                Install: <code className="font-mono">curl -fsSL https://ollama.com/install.sh | sh</code>{" "}
                · pull: <code className="font-mono">ollama pull llama3.2</code>
              </p>
              {props.probeResults && (
                <div className="mt-2 rounded-mira border mira-border mira-elevated divide-y divide-[color:var(--border)]">
                  {props.probeResults.map((r) => (
                    <div key={r.server.id} className="flex items-center justify-between gap-2 px-3 py-1.5 text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background:
                              r.ok && r.models.length
                                ? "#10B981"
                                : r.ok
                                ? "#F59E0B"
                                : "#525252",
                          }}
                        />
                        <span className="mira-text font-medium">{r.server.label}</span>
                        <code className="mira-muted font-mono text-[10px] truncate">
                          {r.server.baseUrl}
                        </code>
                      </div>
                      <span className="mira-muted font-mono text-[10px] flex-shrink-0">
                        {r.ok
                          ? `${r.models.length} model${r.models.length === 1 ? "" : "s"} · ${r.durationMs}ms`
                          : r.error || "no response"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {props.models.length > 0 ? (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Model</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {props.models.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => props.onPickModel(m.id)}
                    className={cx(
                      "p-2 rounded-mira border text-left transition-colors",
                      props.pickedModel === m.id
                        ? "mira-accent-soft border-transparent"
                        : "mira-elevated mira-border hover:mira-hover"
                    )}
                  >
                    <div className="text-sm font-medium mira-text">{m.name}</div>
                    <div className="text-[10px] font-mono mira-muted">
                      {formatContextWindow(m.contextWindow || 0)} ctx
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : meta.needsLocal ? (
            <div className="rounded-mira border mira-border mira-elevated px-3 py-3 text-[11px] mira-muted">
              <p className="mira-text mb-1">No local models detected yet.</p>
              <p>
                Make sure Ollama is running on <code className="font-mono">{props.ollamaEndpoint}</code> and you
                have pulled at least one model, then tap <span className="mira-text">Detect</span>.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t mira-border">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Your name</div>
              <input
                ref={props.nameInputRef}
                value={props.userName}
                onChange={(e) => props.setUserName(e.target.value)}
                placeholder="sir"
                className="mira-input text-sm"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] mira-muted mb-1.5">Theme</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => props.setTheme(t.id)}
                    className={cx(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs",
                      props.theme === t.id
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] mira-text"
                        : "mira-elevated mira-muted border-transparent hover:border-[var(--accent)]/30"
                    )}
                  >
                    <div className="flex gap-0.5">
                      {t.preview.map((c, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-white/10"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceStep({
  onTest,
  testState,
}: {
  onTest: () => void;
  testState: "idle" | "speaking" | "done";
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">Voice</h2>
        <p className="text-sm mira-muted">
          Tap below to hear MIRA. You can change voices in Settings later.
        </p>
      </div>
      <div className="py-6">
        <motion.button
          onClick={onTest}
          whileTap={{ scale: 0.95 }}
          className="relative w-28 h-28 rounded-full mira-elevated border mira-border flex items-center justify-center mx-auto hover:mira-hover"
        >
          <Volume2 size={36} className="mira-accent" />
          {testState === "speaking" && (
            <span className="absolute inset-0 rounded-full border-2 animate-ping" style={{ borderColor: "var(--accent)" }} />
          )}
        </motion.button>
        <p className="text-sm mira-muted mt-4">
          {testState === "idle" && "Tap to play a sample"}
          {testState === "speaking" && "Speaking…"}
          {testState === "done" && "Working. Press F11 anytime for full voice mode."}
        </p>
      </div>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 18 }}
        className="w-24 h-24 mx-auto mb-6"
      >
        <MiraLogo size={96} glow={true} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-display text-3xl font-semibold mb-2 gradient-text">You're set</h2>
        <p className="text-sm max-w-md mx-auto" style={{color: 'var(--muted)'}}>
          MIRA is ready. Type or press F11 to start talking.
        </p>
      </motion.div>
    </div>
  );
}
