import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyTheme, isThemeId } from "./lib/theme";
import "./index.css";

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
