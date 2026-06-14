# <img src="src-tauri/icons/icon.png" width="32" align="center" /> MIRA v2

> **M**KR **I**ntelligent **R**esponsive **A**ssistant — your personal AI desktop assistant. Multi-provider, voice-activated, project-aware, and runs entirely on your machine.

[![GitHub release](https://img.shields.io/github/v/release/mkr-infinity/MIRA)](https://github.com/mkr-infinity/MIRA/releases)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-blue)](#-downloads)
[![License](https://img.shields.io/github/license/mkr-infinity/MIRA)](LICENSE)
[![Stars](https://img.shields.io/github/stars/mkr-infinity/MIRA?style=social)](https://github.com/mkr-infinity/MIRA)

**MIRA** is a polished cross-platform AI desktop client built with Tauri 2, React 19, and TypeScript. It talks to any LLM you like, controls your machine, listens to your voice, and keeps every byte of your data local.

Made with care by **Mohammad Kaif Raja (MKR-Infinity)**.

![screenshot](docs/screenshot.png)

---

## Highlights

- **5 providers** — OpenAI, Anthropic, Google Gemini, OpenRouter, and local Ollama. No third-party SSO gymnastics; just clean API-key + local flows.
- **Voice mode** — full-screen arc-reactor orb, Web Speech STT/TTS, push-to-talk, voice picker, F11 to enter, custom wake word.
- **Desktop control** — open apps, open URLs, play music, search the web, set volume, lock, notify, run shell commands. Cross-platform.
- **ChatGPT-style sidebar** — projects with chat lists, project-scoped memory and files, always-visible show/hide button.
- **Personality & custom system prompt** — five built-in presets (Default MIRA, Concise, Friendly, Code Mentor, Therapist) plus a fully custom prompt.
- **Memory** — long-term facts that get injected into every system prompt.
- **Skills v2** — searchable, category-filtered, inline-editable. Import a folder of `.md` files; each file becomes a skill.
- **Data v2** — lifetime usage stats, 7-day activity chart, per-provider breakdown, per-entity storage sizes, time-saved estimate.
- **Logs** — toggle on a live tail of console output, AI events, voice and desktop actions. Filter by level. Copy or export.
- **Auto-fallback** — if your active provider fails on a retryable error (network, 5xx, 429), MIRA quietly rotates to the next enabled provider.
- **Themes** — Vercel-style true-black dark, and a Dribbble-style warm cream light. Custom accent color override.
- **Keyboard** — F11 to enter voice mode, Esc to exit.
- **Zero data leaves your machine.** All settings, conversations, memory, skills, and projects live under `~/Desktop/MIRA/`.

---

## Table of contents

- [Downloads](#-downloads)
- [Quick start](#-quick-start)
- [Providers](#-providers)
- [Voice mode](#-voice-mode)
- [Desktop control](#-desktop-control)
- [Projects, memory & skills](#-projects-memory--skills)
- [Personality & system prompt](#-personality--system-prompt)
- [Logs](#-logs)
- [Storage layout](#-storage-layout)
- [Build from source](#-build-from-source)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## Downloads

Grab the latest release for your platform:

- **Windows** — `MIRA_x.x.x_x64-setup.exe` (NSIS installer)
- **macOS** — `MIRA_x.x.x_aarch64.dmg` (Apple silicon) · `MIRA_x.x.x_x64.dmg` (Intel) · `MIRA_x.x.x_universal.dmg` (both)
- **Linux** — `MIRA_x.x.x_amd64.AppImage` · `MIRA_x.x.x_amd64.deb` · `MIRA_x.x.x_x86_64.rpm`

All artefacts are produced by the GitHub Actions matrix at `.github/workflows/build.yml` and attached to the `v*` tags.

---

## Quick start

1. **Install** the build for your platform (see above).
2. **Run** MIRA — first launch opens the 4-step onboarding.
3. **Pick a provider** and paste your key (or install Ollama for local).
4. **Test** the voice sample.
5. **Done** — start chatting, press **F11** for voice mode.

That's it. No account, no telemetry, no signup.

---

## Providers

| Provider | Auth | Default model | Notes |
| --- | --- | --- | --- |
| **OpenAI** | API key | `gpt-4o-mini` | Paste your key in the Providers card. |
| **Anthropic** | API key | `claude-3-5-sonnet-20241022` | Get a key at <https://console.anthropic.com>. |
| **Google Gemini** | API key | `gemini-1.5-flash` | Get a key at <https://aistudio.google.com/apikey>. |
| **OpenRouter** | API key | `anthropic/claude-3.5-sonnet` | Hundreds of models, one key. |
| **Ollama (local)** | none | (auto-detected) | Install from <https://ollama.com>, then `ollama pull llama3.2`. |

Each provider card has a **Fetch models** button that hits the live API and merges the results with the curated database in `src/lib/ai/models.ts`. No free-text model input — pick from the list.

When `Auto-rotate across providers` is on and the active provider fails with a retryable error (network, rate limit, 5xx, timeout), MIRA swaps to the next enabled provider and persists the swap on the conversation.

### Local / Ollama tips

- The provider card lists curated local models: `llama3.2`, `llama3.1`, `qwen2.5`, `mistral`, `mistral-nemo`, `phi3.5`, `gemma2`, `gemma3`, `codellama`, `deepseek-coder-v2`.
- MIRA only ever shows models that your local server has actually returned from `/api/tags` (or equivalent). No fake "selected" defaults.
- If the **Fetch models** call comes back empty, the card shows the exact `ollama pull <name>` command.

---

## Voice mode

- **F11** opens full-screen voice mode with a glowing arc-reactor orb.
- MIRA greets you once, then listens, replies by voice, and re-arms.
- **Interrupt** button to cut MIRA off mid-sentence.
- **Esc** to leave voice mode at any time.
- Voice name, rate, and pitch are configurable in **Settings → Voice**.
- **Custom wake word** in **Settings → Voice** — set any 1-3 word phrase.
- The browser build uses the OS-provided `SpeechSynthesis` voices; the desktop build can plug into native TTS later.

---

## Desktop control

These are exposed as both a function-call tool (for the model) and a JS module for the UI:

| Tool | What it does | Desktop | Browser |
| --- | --- | --- | --- |
| `open_app` | Launch an app by name (e.g. `Brave`, `Spotify`, `VS Code`) | yes | stub |
| `open_url` | Open any URL in the default browser | yes | yes (popup) |
| `open_folder` | Reveal a local path in the OS file manager | yes | fallback to URL |
| `play_music` | Open a music URL or search YouTube | yes | yes |
| `search_web` | Open a Google search | yes | yes |
| `set_volume` | 0–100 | yes (pactl / amixer / AppleScript / PowerShell) | no |
| `notify` | Native OS notification | yes (`notify-rust`) | Web Notifications |
| `type_text` | Type a string into the focused window | yes (xdotool / osascript / SendKeys) | no |
| `list_running_apps` | List the top user processes | yes (`ps` / `Get-Process`) | no |
| `clipboard_read` / `clipboard_write` | Read & write the clipboard | yes (`arboard`) | yes (`navigator.clipboard`) |
| `lock` / `shutdown` | OS-level | yes | no |
| `remember` | Save a fact to long-term memory | yes | yes |

Toggle the whole surface in **Settings → General → Desktop control**.

---

## Projects, memory & skills

### Projects (ChatGPT-style sidebar)

Create, edit, recolor, and delete projects **inline in the sidebar** — no need to open Settings. Each project stores:

- A name, accent color, and icon
- Custom instructions injected into the system prompt
- Optional attached files (text content is appended to the prompt)
- A memory scope: `project` only, `all` (shared with global), or `none`

The active project filters the recents list and pins its name to the chat header. Click the project pill in the top bar to jump back to **All chats**.

### Memory

Open Settings → **Memory** to add facts you'd like MIRA to remember. Each item is injected as a bullet under the system prompt on every turn.

### Skills v2

- **Search bar** at the top — match by name, description, category, or prompt body.
- **Category filter chips** with live counts.
- **Inline edit drawer** with `name / description / prompt / icon / category`.
- **Import folder** for `.md` files (or upload multiple in browser).
- **Reload** re-syncs the configured folder (added in v2).

Each Markdown file uses front-matter for metadata:

```
---
name: Web Search
icon: search
category: Research
description: Search the internet and summarise results.
---
When the user asks a question that benefits from up-to-date information,
prefer the web_search tool…
```

In Settings → **General**, you can also pin a folder that auto-loads on every boot.

---

## Personality & system prompt

Five built-in presets in **Settings → General → Personality**:

| Preset | Vibe |
| --- | --- |
| **Default MIRA** | Calm, dry-witted, butler-style. |
| **Concise** | Tight, no fluff, two-sentence replies. |
| **Friendly** | Warmer, conversational colleague. |
| **Code Mentor** | Optimised for code quality and clarity. |
| **Therapist** | Listens first, reflects, never diagnoses. |

Pick **Custom** to write your own system prompt entirely. MIRA still appends memory, skills, project files, and desktop-control context on top of your prompt.

---

## Logs

Settings → **Logs** opens a live tail of everything MIRA does — console output, AI streaming events, voice and desktop actions. Toggle **Capture logs** on or off. Filter by `all / info / warn / error / debug`. Copy or export to a `.log` file.

This is the fastest way to debug "why isn't this working" without leaving the app.

---

## Storage layout

All data lives locally. Tauri build:

```
~/Desktop/MIRA/
├── settings.json
├── conversations.json
├── memory.json
├── skills.json
├── projects.json
├── project_memory.json
├── custom_commands.json
└── skills/             (imported .md files mirror)
```

Browser build falls back to `localStorage` keys prefixed with `mira:` (with a transparent fallback to the legacy `jarvis:` prefix for upgrades).

---

## Build from source

Prerequisites: Node 20+, Rust 1.77+, pnpm or npm.

```bash
git clone https://github.com/mkr-infinity/MIRA
cd mira
npm install
npm run tauri:dev      # hot-reload desktop dev
npm run tauri:build    # produce platform installers (cleans dist first)
```

To produce all 9 platform binaries locally, use the GitHub Actions matrix — it spins up the right runners for you.

```bash
# Run the web build only (no Tauri)
npm run dev
npm run build
npm run preview        # http://localhost:4173/
```

---

## Troubleshooting

**"I see a pink toggle."** — You probably have a custom `accent` override. Edit `src/index.css` `--accent` (dark = cyan, light = terracotta) and rebuild.

**"The orb flickers between Standing by and Listening."** — Fixed in v2. Auto-listen is gated by a ref so it only re-arms after a real TTS end.

**"Ollama says no models."** — Run `ollama pull llama3.2` in a terminal, then click **Detect** again. Or check the endpoint URL in the provider card.

**"Models aren't loading for OpenAI."** — The card uses `stream_options.include_usage` to capture tokens. Some self-hosted proxies ignore that. Add a `Custom base URL` to override.

**"Voice is robotic."** — Your browser doesn't have neural voices. The desktop app will get native TTS in a future release; for now pick a higher-quality voice in **Settings → Voice**.

**"The sidebar doesn't collapse."** — Click the round logo at the top-left of the sidebar, or the new always-visible chevron button. The collapsed rail lives at the same spot; click again to expand.

---

## Development

```
src/
├── App.tsx              # Root layout, theme, sidebar collapse
├── main.tsx             # Boot, theme pre-paint
├── index.css            # CSS variables, components, scrollbars
├── store/index.ts       # Zustand store: chat, settings, projects, logs
├── lib/
│   ├── ai/              # Provider adapters + curated model DB
│   ├── voice/           # TTS / STT / wake-word
│   ├── desktop/         # JS wrappers + tool definitions
│   ├── skills.ts        # .md front-matter parser
│   ├── mira.ts          # Personality + system-prompt builder
│   ├── log.ts           # console.* interceptor → store
│   ├── platform.ts      # isTauri()
│   ├── storage/         # Tauri FS + localStorage fallback
│   └── theme.ts         # Class-name helpers
├── components/
│   ├── Sidebar.tsx
│   ├── ChatView.tsx
│   ├── Onboarding.tsx
│   ├── SettingsModal.tsx
│   ├── VoiceMode.tsx
│   ├── AboutView.tsx
│   ├── ProjectModal.tsx
│   ├── Orb.tsx
│   └── MessageBubble.tsx
└── types/index.ts       # AppSettings, ProviderConfig, Skill, Project…
```

Conventions:

- All theme colours are CSS variables in `src/index.css`. Don't hard-code hexes.
- Components consume `mira-*` classes (`.mira-bg`, `.mira-elevated`, etc.) which auto-flip with `<html class="dark|light">`. The `jarvis-*` aliases are kept as deprecated for backward compat.
- Log anything that the user might want to debug: `useStore.getState().log("info", "source", "message", { ...meta })`.
- Provider adapters return `{ content, usage }` from `streamChat`. Always try to populate `usage`.

---

## Roadmap

- Native TTS / STT on the desktop build (replace Web Speech).
- Multi-modal: drag images into chat.
- Plugin system: load skills from a URL.
- Sync: end-to-end encrypted settings across machines.
- Mobile shell via Tauri Mobile.

See [issues](https://github.com/mkr-infinity/MIRA/issues) for what's next.

---

## License

MIT — see [LICENSE](LICENSE).

Built with care by **Mohammad Kaif Raja (MKR-Infinity)** · [mkr-infinity.github.io](https://mkr-infinity.github.io) · [@mkr_infinity](https://instagram.com/mkr_infinity) · [Buy me a coffee](https://buymeacoffee.com/mkr_infinity)
