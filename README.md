<div align="center">

<img src="assets/mira-logo.svg" width="120" />

# ✦ MIRA v2 ✦

### **M**KR **I**ntelligent **R**esponsive **A**ssistant

**Your personal AI desktop assistant.**

Multi-provider · Voice-activated · Project-aware · Fully local

[![GitHub release](https://img.shields.io/github/v/release/mkr-infinity/MIRA?style=flat-square&color=00D4FF)](https://github.com/mkr-infinity/MIRA/releases)
[![License](https://img.shields.io/github/license/mkr-infinity/MIRA?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/mkr-infinity/MIRA?style=flat-square&color=FFD700)](https://github.com/mkr-infinity/MIRA)

<br/>

Built with **Tauri 2 + React 18 + TypeScript + Zustand**

[🚀 Quick Start](#-quick-start) · [🔌 Providers](#-providers) · [🎨 Themes](#-themes) · [⌨️ Shortcuts](#%EF%B8%8F-keyboard-shortcuts) · [📦 Build](#-build)

</div>

---

## 🌟 Features

<table>
<tr>
<td>

**🤖 6 AI Providers**
- OpenAI · Anthropic · Gemini
- Ollama (local) · OpenRouter
- Custom OpenAI-compatible endpoint
- Auto-fallback on errors

</td>
<td>

**🎙️ Voice Mode**
- Full-screen arc-reactor orb
- Speech-to-text & text-to-speech
- Push-to-talk with F11
- Custom wake word support

</td>
</tr>
<tr>
<td>

**🖥️ Desktop Control**
- Open apps, URLs, folders
- Play music, search web
- Set volume, lock, shutdown
- Native notifications

</td>
<td>

**📁 Projects**
- ChatGPT-style sidebar
- Project-scoped chats
- Custom instructions per project
- Attached files & memory

</td>
</tr>
<tr>
<td>

**🧠 Memory & Skills**
- Long-term fact memory
- Import `.md` skill files
- Searchable skill library
- Category filtering

</td>
<td>

**🎨 7 Themes**
- Midnight · Daylight · Cyberpunk
- Sakura · Nordic · Neon · Earth
- Dynamic accent colors
- Animated components

</td>
</tr>
</table>

**⌨️ Keyboard Shortcuts** · **🔒 Zero telemetry** · **📊 Activity logs** · **🎯 Personality presets**

---

## 🚀 Quick Start

### 🌐 Browser (localhost)

```bash
git clone https://github.com/mkr-infinity/MIRA
cd MIRA
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

### 🖥️ Desktop (Tauri)

```bash
npm run tauri:dev      # hot-reload dev
npm run tauri:build    # produce platform installers
```

### 📋 First Launch

| Step | Action |
|------|--------|
| 1️⃣ | Onboarding wizard opens automatically |
| 2️⃣ | Pick a provider and enter your API key |
| 3️⃣ | Test the voice sample |
| 4️⃣ | Start chatting — press **F11** for voice mode |

---

## 🔌 Providers

| Provider | Auth | Default Model | Get Key |
|----------|------|---------------|---------|
| 🔹 OpenAI | API key | `gpt-4o-mini` | [platform.openai.com](https://platform.openai.com/api-keys) |
| 🟠 Anthropic | API key | `claude-3-5-sonnet-20241022` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| 🔵 Gemini | API key | `gemini-1.5-flash` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| 🦙 Ollama | none | auto-detected | [ollama.com](https://ollama.com) |
| 🟣 OpenRouter | API key | `anthropic/claude-3.5-sonnet` | [openrouter.ai](https://openrouter.ai/keys) |
| 🟢 Custom | API key | any endpoint | — |

> 💡 **Auto-fallback**: If your active provider fails, MIRA rotates to the next enabled one automatically.

---

## 🎨 Themes

Switch between **7 beautiful themes** in **Settings → General**:

| Theme | Preview | Style |
|-------|---------|-------|
| 🌑 **Midnight** | ⬛🔵 | True black + cyan |
| ☀️ **Daylight** | ⬜🟠 | Warm cream + terracotta |
| 🌆 **Cyberpunk** | 🟣💗 | Neon pink on deep purple |
| 🌸 **Sakura** | 🩷🌸 | Cherry blossom pink |
| ❄️ **Nordic** | 🔷🧊 | Icy blues on slate |
| ⚡ **Neon** | 🟢💜 | Electric green + magenta |
| 🌿 **Earth** | 🟤💚 | Forest greens + browns |

> 🎯 All components dynamically adapt to the active theme's accent color.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F11` | 🎙️ Enter voice mode |
| `Escape` | ❌ Close modal / exit voice |
| `Ctrl+N` | 💬 New conversation |
| `Ctrl+,` | ⚙️ Open settings |
| `Ctrl+/` | ✏️ Focus chat input |

---

## 📦 Storage

All data lives **100% locally** on your machine:

| Platform | Location |
|----------|----------|
| 🌐 Browser | `localStorage` with `mira:` prefix |
| 🖥️ Desktop | `~/Desktop/MIRA/` |

```
settings.json          ⚙️  App configuration
conversations.json     💬  Chat history
memory.json            🧠  Long-term facts
skills.json            🎯  Skill definitions
projects.json          📁  Project data
project_memory.json    🔗  Project-scoped memory
custom_commands.json   ⚡  Custom commands
```

---

## 🔧 Build

**Prerequisites:** Node 20+ · npm or pnpm

### 🌐 Web

```bash
npm install
npm run dev        # dev server → localhost:5173
npm run build      # production build
npm run preview    # preview build
```

### 🖥️ Desktop (requires Rust 1.77+)

```bash
npm run tauri:dev      # hot-reload dev
npm run tauri:build    # platform installers
```

---

## 📂 Project Structure

```
src/
├── App.tsx              🏠 Root layout, theme, shortcuts
├── main.tsx             🚀 Boot, theme pre-paint
├── index.css            🎨 CSS variables, components
├── store/index.ts       🗄️ Zustand store
├── lib/
│   ├── ai/              🤖 Provider adapters
│   ├── voice/           🎙️ TTS / STT
│   ├── desktop/         🖥️ Desktop control
│   ├── storage/         💾 Persistence layer
│   └── theme.ts         🎨 Theme helpers
├── components/
│   ├── Sidebar.tsx      📁 Chat list, projects
│   ├── ChatView.tsx     💬 Main chat interface
│   ├── VoiceMode.tsx    🎙️ Full-screen voice
│   ├── Orb.tsx          ✨ Arc-reactor animation
│   ├── Onboarding.tsx   🚀 First-run wizard
│   ├── SettingsModal.tsx ⚙️ All settings
│   └── MessageBubble.tsx 💬 Message rendering
└── types/index.ts       📝 TypeScript types
```

---

## 📄 License

MIT License · Made with 💙 by **[Mohammad Kaif Raja (MKR-Infinity)](https://mkr-infinity.github.io)**

---

<div align="center">

**[⬆ Back to top](#-mira-v2)**

</div>
