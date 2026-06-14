// Text-to-Speech using the Web Speech API. Prefers high-quality local voices.
//
// Robustness notes:
//  - `speak()` uses a generation counter so callbacks from a cancelled
//    previous utterance are ignored.
//  - `stop()` no longer fires `onEnd` of the cancelled utterance, so the
//    voice-mode auto-listen logic doesn't get a false "done" signal.
//  - Voices are loaded eagerly (some browsers populate them async).
//  - `whenReady()` resolves when at least one voice is available.

export interface SpeakOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (e: any) => void;
  onBoundary?: (charIndex: number, charLength: number) => void;
}

export class TextToSpeech {
  private synth: SpeechSynthesis | null = null;
  private current: SpeechSynthesisUtterance | null = null;
  private currentGen = 0;
  private voicesReady = false;
  private voiceReadyPromise: Promise<void> | null = null;
  private voiceQueue: Array<() => void> = [];

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.voiceReadyPromise = this.loadVoices();
    }
  }

  private loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) return resolve();
      const tryLoad = () => {
        const vs = this.synth!.getVoices();
        if (vs && vs.length) {
          this.voicesReady = true;
          const q = this.voiceQueue.splice(0);
          q.forEach((fn) => fn());
          resolve();
          return true;
        }
        return false;
      };
      if (tryLoad()) return;
      const onVoices = () => {
        if (tryLoad()) {
          this.synth?.removeEventListener?.("voiceschanged", onVoices);
        }
      };
      this.synth.addEventListener?.("voiceschanged", onVoices);
      // Some browsers never fire voiceschanged; poll for a while.
      let tries = 0;
      const poll = setInterval(() => {
        if (tryLoad() || ++tries > 20) clearInterval(poll);
      }, 250);
    });
  }

  whenReady(): Promise<void> {
    if (this.voicesReady) return Promise.resolve();
    return this.voiceReadyPromise ?? Promise.resolve();
  }

  listVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  pickVoice(preferred?: string, lang?: string): SpeechSynthesisVoice | null {
    const voices = this.listVoices();
    if (!voices.length) return null;

    if (preferred) {
      const exact = voices.find((v) => v.name === preferred);
      if (exact) return exact;
      const partial = voices.find(
        (v) =>
          v.name.toLowerCase().includes(preferred.toLowerCase()) ||
          v.lang.toLowerCase().includes(preferred.toLowerCase())
      );
      if (partial) return partial;
    }

    // Prefer the requested language (default English) before scoring.
    const wantLang = (lang || "en").toLowerCase().split("-")[0];
    const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(wantLang));
    const pool = matching.length ? matching : voices;

    const ranked = [...pool].sort((a, b) => {
      const score = (v: SpeechSynthesisVoice) => {
        const n = v.name.toLowerCase();
        let s = 0;
        if (n.includes("natural") || n.includes("neural")) s += 50;
        if (n.includes("google")) s += 30;
        if (
          n.includes("microsoft") &&
          (n.includes("david") ||
            n.includes("aria") ||
            n.includes("jenny") ||
            n.includes("guy") ||
            n.includes("samantha") ||
            n.includes("nova"))
        )
          s += 40;
        if (n.includes("enhanced") || n.includes("premium")) s += 20;
        if (v.localService) s += 5;
        if (v.default) s += 2;
        return s;
      };
      return score(b) - score(a);
    });
    return ranked[0] || pool[0] || voices[0];
  }

  async speak(text: string, opts: SpeakOptions = {}) {
    if (!this.isSupported() || !text.trim()) return;
    this.synth = this.synth || window.speechSynthesis;
    if (this.synth) await this.loadVoices();

    // Bump generation so the previous utterance's callbacks are ignored.
    const myGen = ++this.currentGen;

    // Cancel the previous utterance silently (do NOT call its onEnd).
    this.cancelInternal();

    const utter = new SpeechSynthesisUtterance(text);
    const v = this.pickVoice(opts.voice, opts.lang);
    if (v) utter.voice = v;
    if (v?.lang) utter.lang = v.lang;
    utter.rate = clamp(opts.rate ?? 1, 0.5, 2);
    utter.pitch = clamp(opts.pitch ?? 1, 0, 2);
    if (typeof opts.volume === "number") utter.volume = clamp(opts.volume, 0, 1);

    utter.onstart = () => {
      if (myGen !== this.currentGen) return;
      opts.onStart?.();
    };
    utter.onend = () => {
      if (myGen !== this.currentGen) return;
      this.current = null;
      opts.onEnd?.();
    };
    utter.onerror = (e) => {
      if (myGen !== this.currentGen) return;
      this.current = null;
      const err = (e as any)?.error;
      // 'interrupted' and 'canceled' are normal during stop() calls.
      if (err === "interrupted" || err === "canceled") {
        opts.onEnd?.();
      } else {
        opts.onError?.(e);
      }
    };
    if (opts.onBoundary) {
      utter.onboundary = (e) =>
        opts.onBoundary?.((e as any).charIndex || 0, (e as any).charLength || 0);
    }

    this.current = utter;
    try {
      this.synth!.speak(utter);
    } catch (e: any) {
      opts.onError?.(e);
    }
  }

  /** Cancel any in-flight utterance, silently. */
  stop() {
    this.cancelInternal();
  }

  private cancelInternal() {
    if (!this.synth) return;
    // Bumping the generation makes any pending onend/onerror a no-op.
    this.currentGen++;
    try {
      this.synth.cancel();
    } catch {
      // ignore
    }
    this.current = null;
  }

  isSpeaking(): boolean {
    if (!this.synth) return false;
    // Some browsers briefly leave `speaking` true after a cancel.
    return Boolean(this.synth.speaking) && !this.synth.pending;
  }

  /** Chrome can drop mid-utterance after ~15s; this keeps the synth alive. */
  ping() {
    if (!this.synth || !this.current) return;
    if (this.synth.speaking && !this.synth.paused) {
      try {
        this.synth.pause();
        this.synth.resume();
      } catch {
        // ignore
      }
    }
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export const tts = new TextToSpeech();
