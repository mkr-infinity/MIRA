# MIRA v2

> **M**KR **I**ntelligent **R**esponsive **A**ssistant

Your personal AI desktop assistant. Multi-provider, voice-activated, project-aware, and runs entirely on your machine.

Built with **Tauri 2 + React 18 + TypeScript + Zustand**.

---

## Features

- **6 AI Providers** — OpenAI, Anthropic, Gemini, Ollama (local), OpenRouter, Custom endpoint
- **Voice Mode** — full-screen arc-reactor orb, STT/TTS, push-to-talk, F11 to enter
- **Desktop Control** — open apps, URLs, play music, search, set volume, lock, notify
- **Projects** — ChatGPT-style sidebar with project-scoped chats, memory, and files
- **7 Themes** — Midnight, Daylight, Cyberpunk, Sakura, Nordic, Neon, Earth
- **Memory** — long-term facts injected into every conversation
- **Skills** — import `.md` files as reusable prompt modules
- **Keyboard Shortcuts** — Ctrl+N (new chat), Ctrl+, (settings), Ctrl+/ (focus input), Escape (close)
- **Zero telemetry** — all data stays on your machine

---

## Quick Start

### Browser (localhost)

```bash
git clone https://github.com/mkr-infinity/MIRA
cd MIRA
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Desktop (Tauri)

```bash
npm run tauri:dev      # hot-reload dev
npm run tauri:build    # produce platform installers
```

### First Launch

1. Onboarding wizard opens automatically
2. Pick a provider and enter your API key (or use Ollama for local)
3. Test the voice sample
4. Start chatting — press **F11** for voice mode

---

## Providers

| Provider | Auth | Default Model |
|----------|------|---------------|
| OpenAI | API key | `gpt-4o-mini` |
| Anthropic | API key | `claude-3-5-sonnet-20241022` |
| Gemini | API key | `gemini-1.5-flash` |
| Ollama | none | auto-detected |
| OpenRouter | API key | `anthropic/claude-3.5-sonnet` |
| Custom | API key | any OpenAI-compatible endpoint |

Auto-fallback rotates to the next provider on retryable errors.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F11` | Enter voice mode |
| `Escape` | Close modal / exit voice mode |
| `Ctrl+N` | New conversation |
| `Ctrl+,` | Open settings |
| `Ctrl+/` | Focus chat input |

---

## Themes

Switch between 7 themes in **Settings → General**:

| Theme | Style |
|-------|-------|
| Midnight | True black + cyan (default) |
| Daylight | Warm cream + terracotta |
| Cyberpunk | Neon pink on deep purple |
| Sakura | Cherry blossom pink on dark rose |
| Nordic | Icy blues on slate |
| Neon | Electric green + magenta |
| Earth | Forest greens + warm browns |

All components dynamically adapt to the active theme accent color.

---

## Storage

All data lives locally:

**Browser:** `localStorage` with `mira:` prefix
**Desktop:** `~/Desktop/MIRA/`

```
settings.json
conversations.json
memory.json
skills.json
projects.json
project_memory.json
custom_commands.json
```

---

## Build

**Prerequisites:** Node 20+, pnpm or npm

```bash
# Web only
npm install
npm run dev        # dev server at localhost:5173
npm run build      # production build
npm run preview    # preview build

# Desktop (requires Rust 1.77+)
npm run tauri:dev
npm run tauri:build
```

---

## License

MIT

Made by **Mohammad Kaif Raja (MKR-Infinity)**
