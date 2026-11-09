import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyTheme, isThemeId } from "./lib/theme";
import "./index.css";

// Self-hosted fonts (@fontsource) — the desktop app must render identically
// with no network access. Weights match the families used by the theme
// system (see tailwind.config.js fontFamily + index.css theme tokens).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/orbitron/500.css";
import "@fontsource/orbitron/600.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/orbitron/800.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";
import "@fontsource/lora/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

// Set the initial theme synchronously (before React mounts) to avoid a flash
// of the wrong theme. Read MIRA key first, fall back to legacy JARVIS key for
// upgrades. Covers all themes, not just light/dark.
try {
  const stored =
    localStorage.getItem("mira:initial-theme") ??
    localStorage.getItem("jarvis:initial-theme");
  if (isThemeId(stored)) {
    applyTheme(stored);
  }
} catch {}

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found — check index.html");
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
