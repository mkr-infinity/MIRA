import type { Skill } from "../types";

// Parse a single .md file into a Skill object. Accepts YAML-style front-matter:
//
//   ---
//   name: Web Search
//   icon: search
//   category: Research
//   description: One-line description
//   ---
//   <markdown body used as the prompt>
//
// Falls back to deriving name from the filename if front-matter is missing.
export function parseSkillMarkdown(filename: string, content: string): Skill | null {
  if (!content.trim()) return null;
  const fm = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/m.exec(content);
  let meta: Record<string, string> = {};
  let body = content;
  if (fm) {
    body = fm[2];
    for (const line of fm[1].split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (k) meta[k] = v;
    }
  }
  const baseName = filename.replace(/\.md$/i, "").replace(/[_-]+/g, " ").trim();
  const name = meta.name || meta.title || baseName || "Untitled skill";
  const id = (meta.id || baseName || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: id || `skill-${Date.now()}`,
    name,
    description: meta.description || meta.summary || "",
    prompt: body.trim(),
    icon: meta.icon || "sparkles",
    category: meta.category || "Imported",
    enabled: meta.enabled ? meta.enabled === "true" : true,
    source: "imported",
    sourcePath: meta.path || undefined,
  };
}
