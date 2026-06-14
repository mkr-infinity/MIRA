import { stt } from "./stt";

/**
 * Simple continuous wake-word listener. When the configured wake word is
 * detected, it forwards the next phrase to the onCommand callback.
 *
 * Implementation uses the Web Speech API (runs locally in the browser/engine).
 * Replace with Porcupine/Whisper for production-grade accuracy.
 */
export class WakeWordListener {
  private running = false;
  private activeRecognition: any = null;
  private wakeWord: string;
  private onCommand: (text: string) => void = () => {};
  private onWake?: () => void;
  private onSleep?: () => void;
  private isArmed = false;
  private bufferTimeout: number | null = null;

  constructor(wakeWord: string) {
    this.wakeWord = wakeWord.toLowerCase();
  }

  start(opts: {
    onCommand: (text: string) => void;
    onWake?: () => void;
    onSleep?: () => void;
  }) {
    if (this.running) return;
    this.onCommand = opts.onCommand;
    this.onWake = opts.onWake;
    this.onSleep = opts.onSleep;
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    try {
      this.activeRecognition?.stop();
    } catch {
      // ignore
    }
    this.activeRecognition = null;
    this.isArmed = false;
  }

  private loop() {
    if (!this.running) return;
    stt.start({
      continuous: false,
      onResult: (text) => {
        const t = text.toLowerCase();
        if (t.includes(this.wakeWord)) {
          if (!this.isArmed) {
            this.isArmed = true;
            this.onWake?.();
          }
          const after = t.split(this.wakeWord).pop()?.trim();
          if (after) {
            this.onCommand(after);
            this.isArmed = false;
            this.onSleep?.();
          }
        } else if (this.isArmed) {
          this.onCommand(text);
          this.isArmed = false;
          this.onSleep?.();
        }
      },
      onEnd: () => {
        if (this.running) {
          // small delay before restarting to avoid hammering
          setTimeout(() => this.loop(), 200);
        }
      },
      onError: () => {
        if (this.running) setTimeout(() => this.loop(), 1000);
      },
    });
    this.activeRecognition = (stt as any).recognition;
  }
}
