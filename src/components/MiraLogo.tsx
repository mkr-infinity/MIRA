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
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(0,119,255,0.1) 40%, transparent 70%)`,
            filter: "blur(6px)",
          }}
          animate={animated ? { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
        className="relative z-10"
        fill="none"
      >
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
          <filter id={`mira-blur-${id}`}>
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Background ambient glow */}
        <circle cx="50" cy="50" r="46" fill={`url(#${glowId})`} opacity={0.4} />

        {/* Outer arc reactor segmented ring */}
        <circle
          cx="50" cy="50" r="44"
          stroke={`url(#${gradId})`}
          strokeWidth="1.5"
          strokeDasharray="5 3.5"
          opacity={0.8}
        />

        {/* Middle ring */}
        <circle
          cx="50" cy="50" r="34"
          stroke={`url(#${gradId})`}
          strokeWidth="1"
          opacity={0.45}
        />

        {/* Inner ring */}
        <circle
          cx="50" cy="50" r="24"
          stroke="#00D4FF"
          strokeWidth="1.8"
          opacity={0.35}
        />

        {/* Radiating energy lines (8 directions) */}
        <g opacity={0.35}>
          <line x1="50" y1="20" x2="50" y2="28" stroke={`url(#${gradId})`} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="50" y1="72" x2="50" y2="80" stroke={`url(#${gradId})`} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="20" y1="50" x2="28" y2="50" stroke={`url(#${gradId})`} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="72" y1="50" x2="80" y2="50" stroke={`url(#${gradId})`} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="28.8" y1="28.8" x2="34.5" y2="34.5" stroke={`url(#${gradId})`} strokeWidth="1" strokeLinecap="round" />
          <line x1="71.2" y1="28.8" x2="65.5" y2="34.5" stroke={`url(#${gradId})`} strokeWidth="1" strokeLinecap="round" />
          <line x1="28.8" y1="71.2" x2="34.5" y2="65.5" stroke={`url(#${gradId})`} strokeWidth="1" strokeLinecap="round" />
          <line x1="71.2" y1="71.2" x2="65.5" y2="65.5" stroke={`url(#${gradId})`} strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Core glow circle */}
        <circle cx="50" cy="50" r="14" fill={`url(#${glowId})`} stroke="#00D4FF" strokeWidth="1.5" opacity={0.9} />

        {/* Central bright core */}
        <circle cx="50" cy="50" r="5" fill="#00FFFF" opacity={0.85} />
        <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" opacity={0.95} />

        {/* Orbital arc (right side) */}
        <path
          d="M73.5 22.5 A38 38 0 0 1 84 50"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          strokeOpacity={0.6}
          strokeLinecap="round"
          filter={`url(#mira-blur-${id})`}
        />
        <path
          d="M73.5 22.5 A38 38 0 0 1 84 50"
          stroke="#00D4FF"
          strokeWidth="1.5"
          strokeOpacity={0.8}
          strokeLinecap="round"
        />

        {/* Orbital dot */}
        <circle cx="84" cy="50" r="3.5" fill="#00D4FF" fillOpacity={0.9} />
        <circle cx="84" cy="50" r="1.5" fill="#FFFFFF" fillOpacity={0.8} />
      </svg>
    </div>
  );
}
