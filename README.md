<div align="center">

<img src="assets/mira-logo.svg" width="140" alt="MIRA Logo" />

# MIRA

<br/>

| | | |
|---|---|---|
| ![Midnight](https://img.shields.io/badge/Midnight-000000?style=for-the-badge&labelColor=000000&color=00D4FF) | ![Daylight](https://img.shields.io/badge/Daylight-FAF7F2?style=for-the-badge&labelColor=FAF7F2&color=C2410C) | ![Cyberpunk](https://img.shields.io/badge/Cyberpunk-0A0014?style=for-the-badge&labelColor=0A0014&color=FF2D95) |
| ![Sakura](https://img.shields.io/badge/Sakura-1A0F1E?style=for-the-badge&labelColor=1A0F1E&color=FF6EB4) | ![Nordic](https://img.shields.io/badge/Nordic-0F1923?style=for-the-badge&labelColor=0F1923&color=88C0D0) | ![Neon](https://img.shields.io/badge/Neon-000000?style=for-the-badge&labelColor=000000&color=39FF14) |
| ![Earth](https://img.shields.io/badge/Earth-0F1208?style=for-the-badge&labelColor=0F1208&color=8BC34A) | | |

<br/>

**Your personal AI assistant that lives on your machine.**

<br/>

[🚀 Get Started](#-get-started) · [🔌 Providers](#-providers) · [🎨 Themes](#-themes) · [🎙️ Voice](#%EF%B8%8F-voice-mode) · [⌨️ Shortcuts](#%EF%B8%8F-keyboard-shortcuts) · [📦 Build](#-build)

</div>

---

## 🌟 What is MIRA?

<div align="center">

<br/>

**MIRA** is a beautiful, privacy-first AI desktop assistant.  
It connects to **any AI provider**, responds to your **voice**,  
organizes work into **projects**, and keeps **every byte of data** on your machine.

<br/>

> No accounts. No telemetry. No cloud. Just you and your AI.

<br/>

</div>

<table>
<tr>
<td align="center" width="25%">

### 🤖

**6 Providers**

OpenAI · Anthropic · Gemini  
Ollama · OpenRouter · Custom

</td>
<td align="center" width="25%">

### 🎙️

**Voice Mode**

Arc-reactor orb · STT/TTS  
F11 to enter · Wake word

</td>
<td align="center" width="25%">

### 🖥️

**Desktop Control**

Open apps · Play music  
Set volume · Lock · Notify

</td>
<td align="center" width="25%">

### 📁

**Projects**

ChatGPT-style sidebar  
Custom instructions  
Attached files

</td>
</tr>
<tr>
<td align="center">

### 🎨

**7 Themes**

Midnight · Daylight · Cyberpunk  
Sakura · Nordic · Neon · Earth

</td>
<td align="center">

### 🧠

**Memory & Skills**

Long-term facts  
Import `.md` files  
Searchable library

</td>
<td align="center">

### 🔍

**Full-text Search**

Search conversations  
Highlight & navigate  
`Ctrl+F` in chat

</td>
<td align="center">

### 📦

**Import / Export**

JSON export all data  
Import conversations  
Memory merge

</td>
</tr>
<tr>
<td align="center">

### 🖼️

**Image Attachments**

Drag & drop images  
Paste from clipboard  
Camera capture

</td>
<td align="center">

### 🎛️

**Custom CSS**

Inject custom styles  
Real-time preview  
Reset anytime

</td>
<td align="center">

### 🔌

**Plugins**

Load JS modules  
Extend MIRA  
URL-based

</td>
<td align="center">

### 🔄

**E2E Sync**

End-to-end encrypted  
Cross-device sync  
Self-hostable relay

</td>
</tr>
</table>

---

## 🚀 Get Started

<br/>

### 🌐 Option 1: Browser

```bash
git clone https://github.com/mkr-infinity/MIRA
cd MIRA
npm install
npm run dev
```

Open **http://localhost:5173** → Done 🎉

<br/>

### 🖥️ Option 2: Desktop App

```bash
npm install
npm run tauri:dev       # development
npm run tauri:build     # production build
```

<br/>

### 📋 First Launch

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   1️⃣  Onboarding wizard opens automatically            │
│   2️⃣  Pick a provider → paste your API key             │
│   3️⃣  Test the voice sample                            │
│   4️⃣  Press F11 for voice mode · Start chatting        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

<br/>

---

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

> 💡 **Auto-fallback** — if your active provider fails, MIRA silently rotates to the next enabled one.

<br/>

---

## 🎨 Themes

<br/>

Every component — the orb, sidebar, messages, settings — dynamically adapts to your chosen theme.

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

---

## 🎙️ Voice Mode

<br/>

```
         ╭──────────────────────╮
         │                      │
         │    ◉ MIRA ORB        │
         │    (animated)        │
         │                      │
         ╰──────────────────────╯
           ─── LISTENING ───

    [F11] Enter · [Esc] Exit · Hold to speak
```

<br/>

- **Arc-reactor orb** — animated orb with rotating rings, pulsing core, orbiting dot
- **Push-to-talk** — hold to speak, release to send
- **Auto-speak** — MIRA replies by voice automatically
- **Interrupt** — cut MIRA off mid-sentence
- **Custom voice** — pick any OS voice, adjust rate & pitch
- **Wake word** — say "Hey MIRA" to activate

<br/>

---

## ⌨️ Keyboard Shortcuts

<br/>

| Shortcut | Action |
|----------|--------|
| `F11` | Enter voice mode |
| `Escape` | Close modal / exit voice |
| `Ctrl + N` | New conversation |
| `Ctrl + ,` | Open settings |
| `Ctrl + /` | Focus chat input |
| `Ctrl + F` | Search in conversation |

<br/>

---

## 📁 Projects

<br/>

Organize conversations into projects. Each project has:

- **Memory scope** — project-only or shared globally
- **Custom instructions** — injected into every prompt
- **Attached files** — text content appended automatically
- **Color coding** — visual distinction in the sidebar

<br/>

---

## 🧠 Memory & Skills

<br/>

**Memory:** Share facts that persist across sessions. Say *"Remember I prefer dark mode"* and MIRA recalls it forever.

**Skills:** Import `.md` files as reusable prompt modules:

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

## 🔒 Privacy

<br/>

```
┌─────────────────────────────────────────────┐
│                                             │
│   ✅  All data lives on YOUR machine        │
│   ✅  No telemetry · No tracking            │
│   ✅  No accounts · No signup               │
│   ✅  Open source (MIT license)             │
│   ✅  API keys never leave your device       │
│                                             │
└─────────────────────────────────────────────┘
```

<br/>

---

## 📦 Storage

<br/>

| Platform | Location |
|----------|----------|
| Browser | `localStorage` with `mira:` prefix |
| Desktop | `~/Desktop/MIRA/` |

```
settings.json          →  Configuration
conversations.json     →  Chat history
memory.json            →  Long-term facts
skills.json            →  Skill definitions
projects.json          →  Project data
project_memory.json    →  Project memory
custom_commands.json   →  Custom commands
```

<br/>

---

## 🔧 Build

<br/>

**Prerequisites:** Node 20+ · npm or pnpm · (Desktop: Rust 1.77+)

```bash
# Web
npm install
npm run dev         →  localhost:5173
npm run build       →  production build
npm run preview     →  preview production build

# Desktop
npm run tauri:dev   →  hot-reload
npm run tauri:build →  platform installers
```

<br/>

---

## 📂 Project Structure

<br/>

```
src/
├── App.tsx                    # Root layout
├── main.tsx                   # Boot
├── index.css                  # CSS variables
├── store/index.ts             # Zustand store
├── lib/
│   ├── ai/                    # Provider adapters
│   ├── voice/                 # TTS / STT
│   ├── desktop/               # Desktop control
│   ├── storage/               # Persistence
│   └── theme.ts               # Theme helpers
├── components/
│   ├── Sidebar.tsx            # Chat list
│   ├── ChatView.tsx           # Main chat
│   ├── VoiceMode.tsx          # Voice mode
│   ├── Orb.tsx                # Arc-reactor
│   ├── Onboarding.tsx         # First-run wizard
│   ├── SettingsModal.tsx      # Settings
│   ├── MessageBubble.tsx      # Messages
│   ├── MiraLogo.tsx           # Animated logo
│   ├── ThinkingAnimation.tsx  # Thinking indicator
│   ├── ActivityLog.tsx        # Activity
│   └── AboutView.tsx          # About
│   └── plugins/               # Plugin loader
├── components/
│   ├── Sidebar.tsx            # Chat list
│   ├── ChatView.tsx           # Main chat
│   ├── VoiceMode.tsx          # Voice mode
│   ├── Orb.tsx                # Arc-reactor
│   ├── Onboarding.tsx         # First-run wizard
│   ├── SettingsModal.tsx      # Settings
│   ├── MessageBubble.tsx      # Messages
│   ├── MiraLogo.tsx           # Animated logo
│   ├── ThinkingAnimation.tsx  # Thinking indicator
│   ├── ActivityLog.tsx        # Activity
│   └── AboutView.tsx          # About
└── types/index.ts             # Types
```

<br/>

---

## 📄 License

<br/>

**MIT** — Made with 💙 by [Mohammad Kaif Raja (MKR-Infinity)](https://mkr-infinity.github.io)

<br/>

---

<div align="center">

**[⬆ Back to top](#mira)**

</div>
