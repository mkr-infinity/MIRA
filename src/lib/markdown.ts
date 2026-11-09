import type { Conversation } from "../types";

/** Serialize a conversation to a readable Markdown document. */
export function conversationToMarkdown(conv: Conversation): string {
  const lines: string[] = [
    `# ${conv.title || "Conversation"}`,
    "",
    `> Exported from MIRA · ${new Date(conv.updatedAt).toLocaleString()}`,
    "",
  ];
  for (const m of conv.messages) {
    if (m.role === "system") continue;
    const who = m.role === "user" ? "**You**" : "**MIRA**";
    const ts = new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    lines.push(`### ${who} · ${ts}`, "", m.content, "");
  }
  return lines.join("\n");
}

/** Download a conversation as a .md file (filename-safe slug from the title). */
export function downloadConversationMarkdown(conv: Conversation): void {
  const md = conversationToMarkdown(conv);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = (conv.title || "conversation").replace(/[/\\?%*:|"<>]/g, "-").slice(0, 50).trim() || "conversation";
  a.download = `${slug}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
