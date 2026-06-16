import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the initial theme synchronously to avoid a flash of the wrong theme
// Read MIRA key first, fall back to legacy JARVIS key for upgrades.
try {
  const stored =
    localStorage.getItem("mira:initial-theme") ??
    localStorage.getItem("jarvis:initial-theme");
  if (stored === "light" || stored === "dark") {
    document.documentElement.classList.toggle("dark", stored === "dark");
    document.documentElement.classList.toggle("light", stored !== "dark");
  }
} catch {}

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found — check index.html");
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
