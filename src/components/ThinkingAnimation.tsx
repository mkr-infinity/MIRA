import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getAccentColor, hexToRgba } from "../lib/theme";

const statuses = [
  "Thinking…",
  "Analyzing…",
  "Processing…",
  "Formulating…",
  "Reasoning…",
];

export function ThinkingAnimation() {
  const [index, setIndex] = useState(0);
  const accent = getAccentColor();

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % statuses.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="relative w-6 h-6 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
            opacity: 0.2,
          }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
      </div>
      <div className="h-5 flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-mono tracking-wide"
            style={{ color: 'var(--muted)' }}
          >
            {statuses[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
