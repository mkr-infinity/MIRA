import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { Mic, MicOff, X, Volume2, Loader2, Square, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { stt } from "../lib/voice/stt";
import { tts } from "../lib/voice/tts";
import { MiraOrb, VoiceWave } from "./Orb";
import { cx } from "../lib/theme";

type Status = "idle" | "listening" | "thinking" | "speaking" | "denied" | "unsupported";

export function VoiceMode() {
  const {
    voiceMode,
    setVoiceMode,
    isListening,
    isProcessing,
    isSpeaking,
    voiceTranscript,
    setListening,
    setVoiceTranscript,
    setSpeaking,
    sendMessage,
    stopGeneration,
    settings,
  } = useStore();

  const [permError, setPermError] = useState<string | null>(null);
  const [sttSupported] = useState(() => stt.isSupported());
  const [ttsSupported] = useState(() => tts.isSupported());

  // Refs gate auto-listen so a React re-render (StrictMode, parent updates)
  // never re-fires the lifecycle.
  const greetedRef = useRef(false);
  const autoListenArmedRef = useRef(true);
  const exitedRef = useRef(false);
  const wasProcessingRef = useRef(false);

  useEffect(() => {
    if (!voiceMode) {
      // Reset for next entry.
      greetedRef.current = false;
      autoListenArmedRef.current = true;
      exitedRef.current = false;
      wasProcessingRef.current = false;
      stt.stop();
      tts.stop();
      return;
    }
    if (greetedRef.current) return;
    greetedRef.current = true;
    exitedRef.current = false;
    setPermError(null);

    if (!ttsSupported) {
      setPermError("Text-to-speech is not supported in this browser.");
      return;
    }

    (async () => {
      await tts.whenReady();
      tts.speak(greetingFor(settings.userName), {
        voice: settings.voiceName,
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        lang: settings.voiceLang,
        onStart: () => setSpeaking(true),
        onEnd: () => {
          setSpeaking(false);
          if (autoListenArmedRef.current && !exitedRef.current) {
            setTimeout(() => {
              if (autoListenArmedRef.current && !exitedRef.current) startListening();
            }, 350);
          }
        },
        onError: () => setSpeaking(false),
      });
    })();

    return () => {
      stt.stop();
      tts.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode]);

  // After a model turn finishes, re-arm listening (one-shot).
  useEffect(() => {
    if (!voiceMode) return;
    if (isProcessing) {
      wasProcessingRef.current = true;
      return;
    }
    if (wasProcessingRef.current && !isProcessing) {
      wasProcessingRef.current = false;
      if (!isSpeaking && !isListening && autoListenArmedRef.current && !exitedRef.current) {
        setTimeout(() => {
          if (autoListenArmedRef.current && !exitedRef.current) startListening();
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessing]);

  // Keep TTS alive in long utterances (Chrome 15s drop).
  useEffect(() => {
    if (!voiceMode) return;
    const id = setInterval(() => tts.ping(), 10000);
    return () => clearInterval(id);
  }, [voiceMode]);

  const startListening = () => {
    if (exitedRef.current || !voiceMode) return;
    if (!sttSupported) {
      setPermError("Speech recognition is not supported in this browser.");
      return;
    }
    setVoiceTranscript("");
    setPermError(null);
    setListening(true);
    autoListenArmedRef.current = false;
    stt.start({
      continuous: false,
      interimResults: true,
      lang: settings.voiceLang || "en-US",
      onResult: (text, isFinal) => {
        setVoiceTranscript(text);
        if (isFinal) {
          setListening(false);
          const final = text.trim();
          autoListenArmedRef.current = true;
          if (final) {
            sendMessage(final);
          }
        }
      },
      onError: (err) => {
        setListening(false);
        autoListenArmedRef.current = true;
        if (err === "not-allowed" || err === "service-not-allowed") {
          setPermError("Microphone permission denied. Allow access in your browser settings.");
        } else if (err && err !== "no-speech" && err !== "aborted") {
          setPermError(`Mic error: ${err}`);
        }
      },
      onEnd: () => {
        // Only reset state if it wasn't already reset.
        if (useStore.getState().isListening) {
          setListening(false);
        }
        // Re-arm listening so a follow-up utterance is captured.
        autoListenArmedRef.current = true;
      },
    });
  };

  const stopListening = () => {
    stt.stop();
    setListening(false);
    autoListenArmedRef.current = true;
  };

  const interruptSpeaking = () => {
    tts.stop();
    setSpeaking(false);
    autoListenArmedRef.current = true;
    setTimeout(() => startListening(), 150);
  };

  const close = () => {
    exitedRef.current = true;
    autoListenArmedRef.current = false;
    tts.stop();
    stt.stop();
    setSpeaking(false);
    setListening(false);
    setVoiceMode(false);
  };

  if (!voiceMode) return null;

  const status: Status = permError
    ? permError.includes("not supported")
      ? "unsupported"
      : "denied"
    : isProcessing
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : isListening
    ? "listening"
    : "idle";

  const statusLabel: Record<Status, string> = {
    idle: "Standing by",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    denied: "Microphone blocked",
    unsupported: "Voice not supported",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 mira-bg grid-bg"
    >
      {/* Top bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div
            className={cx(
              "w-2 h-2 rounded-full",
              status === "idle"
                ? "mira-muted"
                : status === "denied" || status === "unsupported"
                ? "bg-amber-400"
                : "bg-cyan-400 shadow-glow-sm animate-pulse"
            )}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] mira-muted">
            Voice Mode
          </span>
        </div>
        <button
          onClick={close}
          className="p-2 rounded-pill mira-elevated hover:mira-hover mira-muted hover:mira-text border mira-border"
          title="Exit (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Center content */}
      <div className="relative h-full flex flex-col items-center justify-center">
        <MiraOrb state={status} size={280} />

        <div className="mt-16 px-6 max-w-2xl w-full text-center">
          <AnimatePresence mode="wait">
            {permError ? (
              <motion.div
                key="perm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-3"
              >
                <AlertTriangle size={20} className="text-amber-400" />
                <p className="text-sm mira-text">{permError}</p>
                <button
                  onClick={() => {
                    setPermError(null);
                    autoListenArmedRef.current = true;
                    startListening();
                  }}
                  className="px-3 py-1.5 rounded-mira mira-elevated border mira-border text-xs mira-text hover:mira-hover"
                >
                  Try again
                </button>
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <VoiceWave active={isListening} />
                <p className="text-xl mira-text font-light leading-relaxed min-h-[3.5rem]">
                  {voiceTranscript || "Listening…"}
                </p>
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 mira-muted"
              >
                <Loader2 size={16} className="animate-spin mira-accent" />
                <span>Thinking…</span>
              </motion.div>
            ) : isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 mira-accent"
              >
                <Volume2 size={16} />
                <span>Speaking…</span>
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mira-muted text-sm font-mono uppercase tracking-[0.2em]"
              >
                {statusLabel.idle}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        {isSpeaking && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={interruptSpeaking}
            className="w-14 h-14 rounded-full mira-elevated border mira-border mira-text flex items-center justify-center hover:mira-hover"
            title="Interrupt"
          >
            <Square size={20} fill="currentColor" />
          </motion.button>
        )}

        <motion.button
          onClick={() => (isListening ? stopListening() : startListening())}
          disabled={isProcessing}
          whileTap={{ scale: 0.95 }}
          className={cx(
            "relative w-20 h-20 rounded-full flex items-center justify-center transition-all border-2",
            isListening
              ? "border-transparent"
              : isProcessing
              ? "mira-elevated mira-muted cursor-not-allowed border-transparent"
              : "mira-accent-bg border-transparent text-white shadow-glow-lg hover:scale-105"
          )}
          style={isListening ? { background: "var(--danger)" } : undefined}
          title={isListening ? "Stop listening" : "Tap to speak"}
        >
          {isListening ? <MicOff size={28} className="text-white" /> : <Mic size={28} />}
          {isListening && (
            <span
              className="absolute inset-0 rounded-full border-2 animate-ping"
              style={{ borderColor: "var(--danger)" }}
            />
          )}
        </motion.button>

        {isProcessing && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={stopGeneration}
            className="w-14 h-14 rounded-full mira-elevated border mira-border mira-danger flex items-center justify-center hover:mira-hover"
            title="Stop"
          >
            <Square size={20} fill="currentColor" />
          </motion.button>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.2em] mira-muted">
        Tap mic to {isListening ? "stop" : "speak"} · Esc to exit
      </div>

      <EscListener onEsc={close} />
    </motion.div>
  );
}

function EscListener({ onEsc }: { onEsc: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEsc();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEsc]);
  return null;
}

function greetingFor(name?: string): string {
  const h = new Date().getHours();
  const tod = h < 5 ? "evening" : h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  if (name && name.trim()) return `Good ${tod}, ${name.trim()}. How may I help you?`;
  return `Good ${tod}. How may I help you?`;
}
