import { motion } from "framer-motion";

interface Props {
  state: "idle" | "listening" | "thinking" | "speaking" | "denied" | "unsupported";
  size?: number;
}

// Backward-compat alias
export { MiraOrb as JarvisOrb };

export function MiraOrb({ state, size = 180 }: Props) {
  const isActive = state !== "idle";
  const colorClass = state === "speaking" ? "from-amber-400 to-amber-600" : "from-cyan-300 to-cyan-500";
  const ringSpeed = state === "listening" ? 4 : state === "speaking" ? 2 : 16;

  // Generate particles
  const particles = Array.from({ length: 24 });

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Particles */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${50 + Math.cos((i / 24) * Math.PI * 2) * 40}%`,
                top: `${50 + Math.sin((i / 24) * Math.PI * 2) * 40}%`,
                animationDelay: `${(i * 0.15) % 4}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.4,
          height: size * 1.4,
          background: `radial-gradient(circle, ${
            state === "speaking" ? "rgba(245,158,11,0.25)" : "rgba(0,212,255,0.18)"
          } 0%, transparent 60%)`,
        }}
        animate={
          isActive
            ? { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }
            : { scale: 1, opacity: 0.5 }
        }
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Rotating outer ring */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          borderColor: state === "speaking" ? "rgba(245,158,11,0.5)" : "rgba(0,212,255,0.4)",
          borderTopColor: "transparent",
          borderRightColor: state === "speaking" ? "rgba(245,158,11,0.8)" : "rgba(0,212,255,0.8)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: ringSpeed, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner ring (counter-rotating) */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          borderColor: state === "speaking" ? "rgba(245,158,11,0.3)" : "rgba(0,212,255,0.25)",
          borderBottomColor: "transparent",
          borderLeftColor: state === "speaking" ? "rgba(245,158,11,0.7)" : "rgba(0,212,255,0.7)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: ringSpeed * 1.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Core orb */}
      <motion.div
        className={`relative rounded-full bg-gradient-to-br ${colorClass}`}
        style={{
          width: size * 0.55,
          height: size * 0.55,
          boxShadow:
            state === "speaking"
              ? "0 0 60px rgba(245,158,11,0.7), inset 0 0 30px rgba(255,255,255,0.4)"
              : "0 0 60px rgba(0,212,255,0.7), inset 0 0 30px rgba(255,255,255,0.4)",
        }}
        animate={
          isActive
            ? { scale: [1, 1.08, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-white/80 blur-sm" />
        </div>
      </motion.div>

      {/* Status text */}
      {isActive && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400/80">
          {state === "listening" ? "listening" : state === "speaking" ? "speaking" : "thinking"}
        </div>
      )}
    </div>
  );
}

export function VoiceWave({ active }: { active: boolean }) {
  const bars = [0, 1, 2, 3, 4];
  return (
    <div className="flex items-center gap-1 h-8">
      {bars.map((i) => (
        <div
          key={i}
          className="voice-bar"
          style={{
            height: active ? `${20 + Math.abs(Math.sin((Date.now() / 200) + i)) * 12}px` : "4px",
            animation: active ? `wave ${0.6 + i * 0.1}s ease-in-out infinite` : undefined,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
