import { motion } from "framer-motion";
import { getAccentColor, hexToRgba } from "../lib/theme";

interface Props {
  state: "idle" | "listening" | "thinking" | "speaking" | "denied" | "unsupported";
  size?: number;
}

// Backward-compat alias
export { MiraOrb as JarvisOrb };

export function MiraOrb({ state, size = 180 }: Props) {
  const isActive = state !== "idle";
  const accent = getAccentColor();
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
          width: size * 1.5,
          height: size * 1.5,
          background: `radial-gradient(circle, ${
            state === "speaking" ? "rgba(245,158,11,0.2)" : hexToRgba(accent, 0.15)
          } 0%, ${hexToRgba(accent, 0.05)} 40%, transparent 70%)`,
        }}
        animate={
          isActive
            ? { scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }
            : { scale: 1, opacity: 0.4 }
        }
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating outer ring with dash array (arc reactor style) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          border: `2px solid ${state === "speaking" ? "rgba(245,158,11,0.4)" : hexToRgba(accent, 0.3)}`,
          borderTopColor: "transparent",
          borderRightColor: state === "speaking" ? "rgba(245,158,11,0.8)" : hexToRgba(accent, 0.7),
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: ringSpeed, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner ring (counter-rotating) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.82,
          height: size * 0.82,
          border: `1.5px solid ${state === "speaking" ? "rgba(245,158,11,0.25)" : hexToRgba(accent, 0.2)}`,
          borderBottomColor: "transparent",
          borderLeftColor: state === "speaking" ? "rgba(245,158,11,0.6)" : hexToRgba(accent, 0.6),
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: ringSpeed * 1.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.98,
          height: size * 0.98,
          border: `1px dashed ${state === "speaking" ? "rgba(245,158,11,0.15)" : hexToRgba(accent, 0.12)}`,
        }}
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: ringSpeed * 2, repeat: Infinity, ease: "linear" }}
      />

      {/* Core orb */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: state === "speaking"
            ? 'linear-gradient(135deg, #F59E0B, #D97706)'
            : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          boxShadow:
            state === "speaking"
              ? "0 0 80px rgba(245,158,11,0.6), inset 0 0 30px rgba(255,255,255,0.3)"
              : `0 0 80px ${hexToRgba(accent, 0.5)}, inset 0 0 30px rgba(255,255,255,0.3)`,
        }}
        animate={
          isActive
            ? { scale: [1, 1.06, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-white/60 blur-md" />
        </div>
      </motion.div>

      {/* Status text */}
      {isActive && (
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.3em]"
          style={{ color: hexToRgba(accent, 0.8) }}
        >
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
