/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        nunito: ["Nunito", "system-ui", "sans-serif"],
        orbitron: ["Orbitron", "system-ui", "sans-serif"],
        lora: ["Lora", "Georgia", "serif"],
        jakarta: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        // Vercel-inspired dark: true B&W with a thin accent for MIRA identity
        ink: {
          bg: "#000000",
          surface: "#0A0A0A",
          elevated: "#141414",
          hover: "#1A1A1A",
          border: "#262626",
          text: "#FAFAFA",
          muted: "#888888",
          subtle: "#525252",
        },
        // Dribbble-inspired light: warm cream + soft amber/coral accents
        cream: {
          bg: "#FAF7F2",
          surface: "#FFFFFF",
          elevated: "#F4EFE6",
          hover: "#EDE6D6",
          border: "#E5DDCC",
          text: "#1A1612",
          muted: "#6B6256",
          subtle: "#A89F8E",
          accent: "#C2410C",     // warm terracotta
          accentSoft: "#FED7AA", // peach
        },
        // Cyan accent — only used as a subtle brand glow, not as a primary fill
        brand: {
          DEFAULT: "#00D4FF",
          soft: "rgba(0, 212, 255, 0.12)",
          ring: "rgba(0, 212, 255, 0.35)",
        },
      },
      borderRadius: {
        mira: "10px",
        pill: "999px",
        // Deprecated alias — kept for backward compat
        jarvis: "10px",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(0, 212, 255, 0.3)",
        "glow": "0 0 20px rgba(0, 212, 255, 0.4)",
        "glow-lg": "0 0 40px rgba(0, 212, 255, 0.45)",
        "soft": "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
        "pop": "0 10px 40px -10px rgba(0,0,0,0.25)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.35)", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 212, 255, 0.6)", transform: "scale(1.04)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.92" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.25)" },
          "50%": { transform: "scaleY(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        breathe: "breathe 3s ease-in-out infinite",
        wave: "wave 1.2s ease-in-out infinite",
        "fade-up": "fade-up 240ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};
