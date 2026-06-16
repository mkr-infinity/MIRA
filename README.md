<div align="center">

<img src="assets/mira-logo.svg" width="140" />

<br/>

# MIRA

<br/>

![Midnight](https://img.shields.io/badge/Midnight-000000?style=for-the-badge&labelColor=000000&color=00D4FF)
![Daylight](https://img.shields.io/badge/Daylight-FAF7F2?style=for-the-badge&labelColor=FAF7F2&color=C2410C&textColor=1A1612)
![Cyberpunk](https://img.shields.io/badge/Cyberpunk-0A0014?style=for-the-badge&labelColor=0A0014&color=FF2D95)
![Sakura](https://img.shields.io/badge/Sakura-1A0F1E?style=for-the-badge&labelColor=1A0F1E&color=FF6EB4)
![Nordic](https://img.shields.io/badge/Nordic-0F1923?style=for-the-badge&labelColor=0F1923&color=88C0D0)
![Neon](https://img.shields.io/badge/Neon-000000?style=for-the-badge&labelColor=000000&color=39FF14)
![Earth](https://img.shields.io/badge/Earth-0F1208?style=for-the-badge&labelColor=0F1208&color=8BC34A)

<br/>

**Your personal AI assistant that lives on your machine.**

<br/>

`Multi-provider` · `Voice-activated` · `Project-aware` · `Fully local`

<br/>

<a href="#-get-started">Get Started</a> · <a href="#-providers">Providers</a> · <a href="#-themes">Themes</a> · <a href="#-voice-mode">Voice</a> · <a href="#-keyboard-shortcuts">Shortcuts</a>

<br/>

</div>

---

<br/>

## What is MIRA?

<br/>

MIRA is a beautiful, privacy-first AI desktop assistant. It connects to **any AI provider** you choose, responds to your **voice**, organizes your work into **projects**, and keeps **every byte of data** on your machine.

No accounts. No telemetry. No cloud. Just you and your AI.

<br/>

<table>
<tr>
<td align="center" width="33%">

### 🤖

**6 Providers**

OpenAI · Anthropic · Gemini · Ollama · OpenRouter · Custom

</td>
<td align="center" width="34%">

### 🎙️

**Voice Mode**

Arc-reactor orb · STT/TTS · Push-to-talk · F11 to enter

</td>
<td align="center" width="33%>

### 🖥️

**Desktop Control**

Open apps · Play music · Set volume · Lock · Notify

</td>
</tr>
<tr>
<td align="center">

### 📁

**Projects**

ChatGPT-style sidebar · Project memory · Custom instructions

</td>
<td align="center">

### 🎨

**7 Themes**

Midnight · Daylight · Cyberpunk · Sakura · Nordic · Neon · Earth

</td>
<td align="center">

### 🧠

**Memory & Skills**

Long-term facts · Import .md files · Searchable library

</td>
</tr>
</table>

<br/>

---

<br/>

## 🚀 Get Started

<br/>

### Option 1: Browser (localhost)

```bash
git clone https://github.com/mkr-infinity/MIRA
cd MIRA
npm install
npm run dev
```

Open **http://localhost:5173** → Done 🎉

<br/>

### Option 2: Desktop App

```bash
npm install
npm run tauri:dev       # development
npm run tauri:build     # production build
```

<br/>

### First Launch

<br/>

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   1.  Onboarding wizard opens automatically         │
│                                                     │
│   2.  Pick a provider → paste your API key          │
│                                                     │
│   3.  Test the voice sample                         │
│                                                     │
│   4.  Start chatting → press F11 for voice mode     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

<br/>

---

<br/>

## 🔌 Providers

<br/>

| | Provider | Auth | Default Model | Get Key |
|:-:|----------|------|---------------|---------|
| 🔹 | **OpenAI** | API key | `gpt-4o-mini` | [Get Key →](https://platform.openai.com/api-keys) |
| 🟠 | **Anthropic** | API key | `claude-3-5-sonnet-20241022` | [Get Key →](https://console.anthropic.com/settings/keys) |
| 🔵 | **Gemini** | API key | `gemini-1.5-flash` | [Get Key →](https://aistudio.google.com/apikey) |
| 🦙 | **Ollama** | none | auto-detected | [Install →](https://ollama.com) |
| 🟣 | **OpenRouter** | API key | `anthropic/claude-3.5-sonnet` | [Get Key →](https://openrouter.ai/keys) |
| 🟢 | **Custom** | API key | any endpoint | — |

<br/>

> **Auto-fallback** — if your active provider fails, MIRA silently rotates to the next enabled one.

<br/>

---

<br/>

## 🎨 Themes

<br/>

<div align="center">

| | Theme | Colors |
|:-:|-------|--------|
| 🌑 | **Midnight** | True black + electric cyan |
| ☀️ | **Daylight** | Warm cream + terracotta |
| 🌆 | **Cyberpunk** | Neon pink on deep purple |
| 🌸 | **Sakura** | Cherry blossom pink on dark rose |
| ❄️ | **Nordic** | Icy blues on slate |
| ⚡ | **Neon** | Electric green + magenta |
| 🌿 | **Earth** | Forest greens + warm browns |

<br/>

</div>

> Every component — orb, sidebar, messages, settings — dynamically adapts to your theme's accent color.

<br/>

---

<br/>

## 🎙️ Voice Mode

<br/>

```
┌──────────────────────────────────────────────────┐
│                                                  │
│              ╭──────────────────╮                │
│              │                  │                │
│              │    ◉ ARC REACTOR │                │
│              │                  │                │
│              ╰──────────────────╯                │
│                                                  │
│            ─── LISTENING ───                     │
│                                                  │
│    Press F11 to enter · Escape to exit           │
│                                                  │
└──────────────────────────────────────────────────┘
```

<br/>

- **Arc-reactor orb** — beautiful animated orb that breathes with your conversation
- **Push-to-talk** — hold to speak, release to send
- **Auto-speak** — MIRA replies by voice automatically
- **Interrupt** — cut MIRA off mid-sentence
- **Custom voice** — pick any OS voice, adjust rate & pitch
- **Wake word** — say "Hey MIRA" to activate (configurable)

<br/>

---

<br/>

## ⌨️ Keyboard Shortcuts

<br/>

| Shortcut | Action |
|----------|--------|
| `F11` | 🎙️ Enter voice mode |
| `Escape` | ❌ Close modal / exit voice |
| `Ctrl + N` | 💬 New conversation |
| `Ctrl + ,` | ⚙️ Open settings |
| `Ctrl + /` | ✏️ Focus chat input |

<br/>

---

<br/>

## 📁 Projects

<br/>

Organize your conversations into projects, each with its own:

- **Memory scope** — project-only or shared with global
- **Custom instructions** — injected into the system prompt
- **Attached files** — text content appended to prompts
- **Color coding** — visual distinction in the sidebar

<br/>

---

<br/>

## 🧠 Memory & Skills

<br/>

### Memory

Facts you share with MIRA persist across sessions. Say *"Remember I prefer dark mode"* and MIRA will recall it forever.

### Skills

Import `.md` files as reusable prompt modules:

```markdown
---
name: Web Search
icon: search
category: Research
description: Search the internet and summarise results.
---

When the user asks a question that benefits from
up-to-date information, prefer the web_search tool…
```

<br/>

---

<br/>

## 🔒 Privacy

<br/>

```
┌─────────────────────────────────────────┐
│                                         │
│   ✅  All data lives on YOUR machine    │
│   ✅  No telemetry, no tracking        │
│   ✅  No accounts, no signup           │
│   ✅  Open source (MIT license)        │
│   ✅  API keys never leave your device  │
│                                         │
└─────────────────────────────────────────┘
```

<br/>

---

<br/>

## 📦 Storage

<br/>

| Platform | Location |
|----------|----------|
| 🌐 Browser | `localStorage` with `mira:` prefix |
| 🖥️ Desktop | `~/Desktop/MIRA/` |

```
settings.json          ⚙️  Configuration
conversations.json     💬  Chat history
memory.json            🧠  Long-term facts
skills.json            🎯  Skill definitions
projects.json          📁  Project data
project_memory.json    🔗  Project memory
custom_commands.json   ⚡  Custom commands
```

<br/>

---

<br/>

## 🔧 Build

<br/>

**Prerequisites:** Node 20+ · npm or pnpm · (Desktop: Rust 1.77+)

```bash
# 🌐 Web
npm install
npm run dev        # → localhost:5173
npm run build      # production build
npm run preview    # preview production build

# 🖥️ Desktop
npm run tauri:dev      # hot-reload
npm run tauri:build    # platform installers
```

<br/>

---

<br/>

## 📂 Project Structure

<br/>

```
src/
├── App.tsx                  🏠  Root layout
├── main.tsx                 🚀  Boot
├── index.css                🎨  CSS variables
├── store/index.ts           🗄️  Zustand store
├── lib/
│   ├── ai/                  🤖  Provider adapters
│   ├── voice/               🎙️  TTS / STT
│   ├── desktop/             🖥️  Desktop control
│   ├── storage/             💾  Persistence
│   └── theme.ts             🎨  Theme helpers
├── components/
│   ├── Sidebar.tsx          📁  Chat list
│   ├── ChatView.tsx         💬  Main chat
│   ├── VoiceMode.tsx        🎙️  Voice mode
│   ├── Orb.tsx              ✨  Arc-reactor
│   ├── Onboarding.tsx       🚀  First-run
│   ├── SettingsModal.tsx    ⚙️  Settings
│   ├── MessageBubble.tsx    💬  Messages
│   ├── ThinkingAnimation.tsx 🔮  Thinking
│   ├── ActivityLog.tsx      📊  Activity
│   ├── MiraLogo.tsx         🎯  Logo
│   └── AboutView.tsx        ℹ️  About
└── types/index.ts           📝  Types
```

<br/>

---

<br/>

## 📄 License

<br/>

**MIT** — Made with 💙 by [Mohammad Kaif Raja (MKR-Infinity)](https://mkr-infinity.github.io)

<br/>

---

<div align="center">

**[⬆ Back to top](#-mira)**

</div>
