// Tiny classname helper for theme-aware components. Use these instead of
// hardcoded `bg-mira-*` so the theme actually switches.
//
// Example:
//   <div className={cx("p-4", theme.surface, theme.border, "border")}>
//
// Or, in light mode specifically, you can still use `html.light:` Tailwind
// variants. The tokens here are the preferred path because they automatically
// respond to the active theme.
export const theme = {
  bg: "mira-bg",
  surface: "mira-surface",
  elevated: "mira-elevated",
  hover: "mira-hover",
  border: "mira-border",
  text: "mira-text",
  muted: "mira-muted",
  subtle: "mira-subtle",
  accent: "mira-accent",
  accentBg: "mira-accent-bg",
  accentSoft: "mira-accent-soft",
  danger: "mira-danger",
  warning: "mira-warning",
  success: "mira-success",
};

// Merge multiple class strings, deduped
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
