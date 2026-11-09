import Prism from "prismjs";
// Language components register themselves onto the shared Prism instance.
// Kept deliberately small — common languages only, so the bundle stays light.
import "prismjs/components/prism-markup";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-go";

/** Normalize the code-fence language tag to a Prism language id. */
function prismLang(lang: string): string | null {
  const l = lang.toLowerCase().trim();
  const aliases: Record<string, string> = {
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    node: "javascript",
    ts: "typescript",
    tsx: "tsx",
    jsx: "jsx",
    html: "markup",
    xml: "markup",
    svg: "markup",
    vue: "markup",
    svelte: "markup",
    py: "python",
    python3: "python",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    console: "bash",
    yml: "yaml",
    golang: "go",
    rs: "rust",
    c: "clike",
    cpp: "clike",
    "c++": "clike",
    java: "clike",
    cs: "clike",
    "c#": "clike",
    kotlin: "clike",
    swift: "clike",
    php: "clike",
  };
  const id = aliases[l] || l;
  return Prism.languages[id] ? id : null;
}

/** Highlight code to an HTML string with Prism token spans (safe: Prism
 *  escapes input text itself). Unknown languages return null so the caller
 *  can render plain text. */
export function highlightToHtml(code: string, lang: string): string | null {
  const id = prismLang(lang);
  if (!id) return null;
  try {
    return Prism.highlight(code, Prism.languages[id], id);
  } catch {
    return null;
  }
}
