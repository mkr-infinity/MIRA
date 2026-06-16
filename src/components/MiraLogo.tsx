import { motion } from "framer-motion";
import { useId } from "react";

interface Props {
  size?: number;
  glow?: boolean;
  className?: string;
  animated?: boolean;
}

export function MiraLogo({ size = 36, glow = true, className, animated = true }: Props) {
  const id = useId();
  const gradId = `mira-ring-${id}`;
  const glowId = `mira-glow-${id}`;

  return (
    <div
      className={`relative flex items-center justify-center ${className || ""}`}
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(0,119,255,0.1) 40%, transparent 70%)`,
            filter: "blur(6px)",
          }}
          animate={animated ? { scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Rotating ring wrapper */}
      <motion.div
        className="absolute inset-0"
        animate={animated ? { rotate: 360 } : undefined}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="50%" stopColor="#00AAFF" />
              <stop offset="100%" stopColor="#0077FF" />
            </linearGradient>
            <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00FFFF" stopOpacity={0.9} />
              <stop offset="40%" stopColor="#00D4FF" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0077FF" stopOpacity={0} />
            </radialGradient>
          </defs>
          {/* Outer segmented ring */}
          <circle cx="50" cy="50" r="44" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeDasharray="4 4" opacity={0.7} />
        </svg>
      </motion.div>

      {/* Counter-rotating middle ring */}
      <motion.div
        className="absolute inset-0"
        animate={animated ? { rotate: -360 } : undefined}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <circle cx="50" cy="50" r="34" stroke={`url(#${gradId})`} strokeWidth="1" opacity={0.35} strokeDasharray="8 6" />
        </svg>
      </motion.div>

      {/* Inner ring */}
      <svg
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
        className="relative z-10"
        fill="none"
      >
        <circle cx="50" cy="50" r="24" stroke="#00D4FF" strokeWidth="1.8" opacity={0.3} />

        {/* Core glow */}
        <motion.circle
          cx="50" cy="50" r="14"
          fill={`url(#${glowId})`}
          stroke="#00D4FF"
          strokeWidth="1.5"
          opacity={0.9}
          animate={animated ? { r: [14, 16, 14], opacity: [0.9, 0.6, 0.9] } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Central bright core */}
        <motion.circle
          cx="50" cy="50" r="5" fill="#00FFFF" opacity={0.85}
          animate={animated ? { r: [5, 6, 5], opacity: [0.85, 1, 0.85] } : undefined}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" opacity={0.95} />
      </svg>

      {/* Orbiting dot */}
      <motion.div
        className="absolute z-10"
        style={{ width: size, height: size }}
        animate={animated ? { rotate: 360 } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute"
          style={{
            top: 0,
            left: "50%",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#00D4FF",
            boxShadow: "0 0 8px rgba(0,212,255,0.8)",
            transform: "translateX(-50%)",
          }}
        />
      </motion.div>
    </div>
  );
}
