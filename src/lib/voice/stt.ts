// Speech-to-Text using the Web Speech API (browser-native, runs locally).
//
// Robustness notes:
//  - `start()` uses a generation counter so callbacks from a cancelled
//    previous recognition are ignored.
//  - `stop()` is silent: it does NOT fire `onEnd` of the cancelled session.
//  - The `no-speech` and `aborted` errors are normal in continuous/auto-listen
//    flows and are downgraded to `onEnd` so the caller can re-arm.

export interface STTStartOptions {
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export class SpeechToText {
  private recognition: any | null = null;
  private listening = false;
  private gen = 0;

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }

  isListening() {
    return this.listening;
  }

  start(opts: STTStartOptions) {
    if (!this.isSupported()) {
      opts.onError?.("Speech recognition is not supported in this browser.");
      return;
    }

    // Bump generation so any in-flight callbacks from a previous run are ignored.
    this.cancelInternal();
    const myGen = ++this.gen;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.continuous = opts.continuous ?? true;
    r.interimResults = opts.interimResults ?? true;
    r.lang = opts.lang || "en-US";
    r.maxAlternatives = 1;

    r.onstart = () => {
      if (myGen !== this.gen) return;
      this.listening = true;
      opts.onStart?.();
    };

    r.onresult = (e: any) => {
      if (myGen !== this.gen) return;
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (final) opts.onResult(final.trim(), true);
      else if (interim) opts.onResult(interim.trim(), false);
    };

    r.onerror = (e: any) => {
      if (myGen !== this.gen) return;
      this.listening = false;
      const code = e?.error || "speech-error";
      // Normal codes for auto-listen flows — treat as graceful end.
      if (code === "no-speech" || code === "aborted") {
        opts.onEnd?.();
      } else {
        opts.onError?.(code);
      }
    };

    r.onend = () => {
      if (myGen !== this.gen) return;
      this.listening = false;
      opts.onEnd?.();
    };

    this.recognition = r;
    try {
      r.start();
    } catch (e: any) {
      if (myGen !== this.gen) return;
      opts.onError?.(e?.message || "Failed to start speech recognition");
    }
  }

  stop() {
    this.cancelInternal();
  }

  private cancelInternal() {
    this.gen++; // invalidate in-flight callbacks
    const r = this.recognition;
    this.recognition = null;
    if (!r) return;
    try {
      r.onstart = null;
      r.onresult = null;
      r.onerror = null;
      r.onend = null;
      r.stop?.();
    } catch {
      // ignore
    }
    this.listening = false;
  }
}

export const stt = new SpeechToText();
