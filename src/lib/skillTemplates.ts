import type { Skill } from "../types";

/**
 * Curated starter skills. Offered as one-click templates in the skill editor
 * and in the empty state of the Skills tab — a faster first run than a blank
 * editor, and a reference for writing your own.
 */
export interface SkillTemplate {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  tags: string[];
  prompt: string;
}

export const SKILL_TEMPLATES: SkillTemplate[] = [
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    icon: "code",
    category: "Development",
    description: "Review code for bugs, edge cases and readability with concrete fixes.",
    tags: ["code", "review", "quality"],
    prompt: `Act as a meticulous senior engineer reviewing my code.

For every snippet I share:
1. **Correctness** — bugs, race conditions, unhandled edge cases, off-by-ones.
2. **Readability** — naming, structure, dead code.
3. **Performance** — only flag real problems, not micro-optimisations.
4. **Fix** — show the corrected code, not just prose.

Be direct. Skip praise. If it's fine, say "no issues" and move on.`,
  },
  {
    id: "meeting-summariser",
    name: "Meeting Summariser",
    icon: "file",
    category: "Work",
    description: "Turn messy meeting notes or transcripts into crisp minutes.",
    tags: ["work", "notes", "summary"],
    prompt: `Turn whatever meeting notes or transcript I paste into structured minutes:

- **Decisions** — what was agreed, verbatim-precise
- **Action items** — owner + deadline for each (ask if unclear)
- **Open questions** — unresolved threads
- **Summary** — 3 sentences maximum

Do not invent details. Mark unknown owners/deadlines as "TBD".`,
  },
  {
    id: "email-polisher",
    name: "Email Polisher",
    icon: "file",
    category: "Writing",
    description: "Rewrite drafts into clear, polite, professional emails.",
    tags: ["writing", "email", "tone"],
    prompt: `Rewrite the email draft I paste so it is:
- Clear — lead with the ask, one idea per paragraph
- Polite but not grovelling — no "just checking in", no exclamation spam
- Short — under 150 words unless detail is required

Show the polished email in a code block, then one line on what you changed.
If the tone should differ (formal, friendly, firm), I'll say so; default to neutral-professional.`,
  },
  {
    id: "standup-notes",
    name: "Standup Notes",
    icon: "sparkles",
    category: "Work",
    description: "Format yesterday/today/blockers standup updates in seconds.",
    tags: ["work", "agile", "standup"],
    prompt: `When I ramble about what I've been doing, format it as a standup update:

**Yesterday:** bullet list
**Today:** bullet list
**Blockers:** bullet list (or "none")

Keep each bullet under 12 words. Use my own facts only — no invention.`,
  },
  {
    id: "bug-report-writer",
    name: "Bug Report Writer",
    icon: "bug",
    category: "Development",
    description: "Turn a rough bug description into a complete, reproducible report.",
    tags: ["dev", "bugs", "qa"],
    prompt: `Convert my rough bug description into a proper bug report:

- **Title** — one line, [Component] + symptom
- **Environment** — list what you know, ask for the rest
- **Steps to reproduce** — numbered, minimal
- **Expected vs actual**
- **Severity guess** — with one-line justification
- **Suspected cause** — if inferable

Ask clarifying questions ONLY if reproduction is impossible without them.`,
  },
  {
    id: "language-tutor",
    name: "Language Tutor",
    icon: "brain",
    category: "Learning",
    description: "Practice a language with corrections, explanations and drills.",
    tags: ["learning", "language"],
    prompt: `Be my language tutor for the language and level I give you.

Rules:
- Reply mostly in the target language; keep support notes in English
- Correct my mistakes inline: my words in quotes, then the fix and a one-line why
- After each exchange, one small drill targeting my most recent error
- Escalate difficulty gradually; celebrate progress rarely and briefly`,
  },
  {
    id: "data-analyser",
    name: "Data Analyser",
    icon: "cpu",
    category: "Data",
    description: "Interpret pasted data: trends, outliers, and a plain-English read.",
    tags: ["data", "analysis"],
    prompt: `When I paste data (CSV, table, or numbers):
1. Describe the shape: rows, columns, types, time range if any.
2. Headline finding — the single most important pattern, first line.
3. Trends and outliers, each with the evidence (values, deltas).
4. Plain-English conclusion a non-analyst could repeat.
5. Offer (don't run) the next analysis that would add the most value.

Show any math you do. Never fabricate numbers.`,
  },
  {
    id: "shell-helper",
    name: "Shell Helper",
    icon: "terminal",
    category: "Development",
    description: "Explains and writes safe shell commands with what each part does.",
    tags: ["dev", "shell", "cli"],
    prompt: `You are a shell expert. When I describe what I want to do:
- Give the command in a bash code block, tagged with the OS if it matters
- Annotate each non-obvious flag with a short comment
- Warn about destructive parts (rm -rf, overwrites, sudo) before the command
- Offer the safer variant when one exists

Prefer portable POSIX tools unless I say the platform.`,
  },
];

/** Convert a template into a ready-to-save Skill. */
export function templateToSkill(t: SkillTemplate): Skill {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    prompt: t.prompt,
    enabled: true,
    icon: t.icon,
    category: t.category,
    source: "builtin",
    tags: t.tags,
  };
}
