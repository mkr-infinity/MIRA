import { motion } from "framer-motion";
import { useId } from "react";

interface Props {
  size?: number;
  glow?: boolean;
  className?: string;
}

export function MiraLogo({ size = 36, glow = true, className }: Props) {
  const id = useId();
  const gradId = `mira-grad-${id}`;

  return (
    <div
      className={`relative flex items-center justify-center ${className || ""}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(0,212,255,0.35) 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg
        viewBox="0 0 64 64"
        style={{ width: size, height: size }}
        className="relative z-10"
        fill="none"
      >
        <defs>
          <linearGradient id={gradId} x1="-0.2" y1="0" x2="1.2" y2="1">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#0077FF" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="28" stroke="#00D4FF" strokeWidth="1.2" strokeOpacity="0.25" />
        <path
          d="M14 46V20l10 18 10-18v26"
          stroke={`url(#${gradId})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M48 18A22 22 0 0 1 54 32A22 22 0 0 1 46 46"
          stroke="#00D4FF"
          strokeWidth="1.8"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <circle cx="46" cy="46" r="2" fill="#00D4FF" fillOpacity="0.7" />
      </svg>
    </div>
  );
}
