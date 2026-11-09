import type { Skill } from "../types";

/**
 * Parse a single .md file into a Skill object.
 *
 * Two author-friendly formats are accepted:
 *
 * 1. YAML-style front-matter:
 *    ---
 *    name: Web Search
 *    icon: search
 *    category: Research
 *    description: One-line description
 *    tags: web, research
 *    enabled: true
 *    ---
 *    <markdown body used as the prompt>
 *
 * 2. Lightweight header style:
 *    # Skill: Name
 *    icon: search
 *    category: research
 *    description: Short description
 *    tags: web, research
 *
 *    <prompt body>
 *
 * Falls back to deriving the name from the filename. Ids are stable slugs so
 * re-importing the same file updates instead of duplicating.
 */
export function parseSkillMarkdown(filename: string, content: string): Skill | null {
  if (!content.trim()) return null;

  let meta: Record<string, string> = {};
  let body = content;

  // Format 1: front-matter block
  const fm = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/m.exec(content);
  if (fm) {
    body = fm[2];
    for (const line of fm[1].split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const k = line.slice(0, idx).trim().toLowerCase();
      const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (k) meta[k] = v;
    }
  } else {
    // Format 2: `# Skill: Name` header + leading `key: value` lines
    const lines = content.split(/\r?\n/);
    let promptStart = 0;
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const l = lines[i].trim();
      if (i === 0 && l.startsWith("#")) {
        meta.name = l.replace(/^#+\s*(?:Skill\s*:\s*)?/i, "").trim();
        continue;
      }
      const m = l.match(/^(name|icon|description|category|tags|enabled)\s*:\s*(.+)$/i);
      if (m) {
        meta[m[1].toLowerCase()] = m[2].trim();
        continue;
      }
      if (l === "" && Object.keys(meta).length > 0) {
        promptStart = i + 1;
        break;
      }
      // A non-header, non-empty line means there is no header block
      promptStart = 0;
      break;
    }
    body = lines.slice(promptStart || 0).join("\n");
    if (!Object.keys(meta).length) body = content;
  }

  const baseName = filename.replace(/\.md$/i, "").replace(/[_-]+/g, " ").trim();
  const name = meta.name || meta.title || baseName || "Untitled skill";
  const id =
    (meta.id || baseName || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `skill-${Date.now()}`;

  const tags = meta.tags
    ? meta.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8)
    : undefined;

  const prompt = body.trim();
  if (!prompt) return null;

  return {
    id,
    name,
    // Prefer an explicit description; fall back to the first prompt line so
    // cards are never empty.
    description:
      meta.description ||
      meta.summary ||
      prompt.split(/\r?\n/).find((l) => l.trim() && !l.trim().startsWith("#"))?.slice(0, 120) ||
      "",
    prompt,
    icon: meta.icon || "sparkles",
    category: meta.category || "imported",
    enabled: meta.enabled ? meta.enabled === "true" : true,
    source: "imported",
    sourcePath: meta.path || undefined,
    tags,
  };
}

/** Serialize a skill back to its .md form (front-matter + prompt body). */
export function skillToMarkdown(s: Skill): string {
  const fm = [
    `name: ${s.name}`,
    s.description ? `description: ${s.description}` : "",
    `icon: ${s.icon || "sparkles"}`,
    `category: ${s.category || "custom"}`,
    s.tags?.length ? `tags: ${s.tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return `---\n${fm}\n---\n\n${s.prompt}\n`;
}

/** Download a skill as a .md file. */
export function downloadSkillMarkdown(s: Skill): void {
  const blob = new Blob([skillToMarkdown(s)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = (s.name || "skill").replace(/[/\\?%*:|"<>]/g, "-").slice(0, 50).trim() || "skill";
  a.download = `${slug}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
