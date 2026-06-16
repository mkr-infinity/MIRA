// Theme metadata and classname helpers.
// Themes are applied via the `data-theme` attribute on <html>.

export type ThemeId = "dark" | "light" | "cyberpunk" | "sakura" | "nordic" | "neon" | "earth";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  accent: string;
  bg: string;
  surface: string;
  font: string;
  preview: [string, string, string, string]; // bg, surface, accent, text
}

export const THEMES: ThemeMeta[] = [
  {
    id: "dark",
    name: "Midnight",
    description: "Vercel-inspired true black & cyan",
    accent: "#00d4ff",
    bg: "#000000",
    surface: "#0a0a0a",
    font: "Inter",
    preview: ["#000000", "#0a0a0a", "#00d4ff", "#fafafa"],
  },
  {
    id: "light",
    name: "Daylight",
    description: "Warm cream + terracotta",
    accent: "#c2410c",
    bg: "#faf7f2",
    surface: "#ffffff",
    font: "Nunito",
    preview: ["#faf7f2", "#ffffff", "#c2410c", "#1a1612"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Blade Runner neon pink on deep purple",
    accent: "#ff2d95",
    bg: "#0a0014",
    surface: "#120024",
    font: "Orbitron",
    preview: ["#0a0014", "#120024", "#ff2d95", "#f0e6ff"],
  },
  {
    id: "sakura",
    name: "Sakura",
    description: "Soft cherry blossom pink on dark rose",
    accent: "#ff6eb4",
    bg: "#1a0f1e",
    surface: "#261528",
    font: "Lora",
    preview: ["#1a0f1e", "#261528", "#ff6eb4", "#fce4f0"],
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Icy blues + snow whites on slate",
    accent: "#88c0d0",
    bg: "#0f1923",
    surface: "#162028",
    font: "Plus Jakarta Sans",
    preview: ["#0f1923", "#162028", "#88c0d0", "#dce8f0"],
  },
  {
    id: "neon",
    name: "Neon",
    description: "Electric green + magenta on pitch black",
    accent: "#39ff14",
    bg: "#000000",
    surface: "#0a0a0a",
    font: "Orbitron",
    preview: ["#000000", "#0a0a0a", "#39ff14", "#f0f0f0"],
  },
  {
    id: "earth",
    name: "Earth",
    description: "Forest greens + warm browns on deep soil",
    accent: "#8bc34a",
    bg: "#0f1208",
    surface: "#181e10",
    font: "Nunito",
    preview: ["#0f1208", "#181e10", "#8bc34a", "#e8f0e0"],
  },
];

// Merge multiple class strings, deduped
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Get current theme ID from the DOM
export function getCurrentTheme(): ThemeId {
  return (document.documentElement.getAttribute("data-theme") as ThemeId) || "dark";
}

// Get metadata for a theme
export function themeMeta(id: ThemeId): ThemeMeta {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
