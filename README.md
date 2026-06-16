<div align="center">

<img src="assets/mira-logo.svg" width="120" height="120" alt="MIRA Logo" />

# MIRA

**Your intelligent AI assistant that lives on your machine.**

No telemetry. No accounts. Just you and your AI.

<br/>

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tauri](https://img.shields.io/badge/Tauri-2-FFC131?style=flat-square&logo=tauri)](https://tauri.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

<br/>

<p>
  <a href="#-prerequisites">Prerequisites</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-keyboard-shortcuts">Shortcuts</a> ·
  <a href="#-build">Build</a> ·
  <a href="#-contributing">Contributing</a>
</p>

<br/>

---

</div>

<br/>

## 📋 Prerequisites

Before running `npm install`, ensure you have the following installed:

| Tool  | Minimum Version | Installation                              |
|-------|-----------------|------------------------------------------|
| Node  | `>=20`          | [nodejs.org](https://nodejs.org)         |
| npm   | `>=10`          | ships with Node                          |
| Rust  | `>=1.77`        | [rustup.rs](https://rustup.rs) *         |

> *Rust is only required for the **desktop (Tauri)** build. The web version works without it.

<br/>

## 🚀 Quick Start

```bash
git clone https://github.com/mkr-infinity/MIRA
cd MIRA
npm install
npm run dev
```

Open **http://localhost:5173** and you're ready to go.

<br/>

## ✨ Features

### 🤖 AI Providers

Connect any combination of providers — all keys stay on your machine.

| Provider   | Auth        | Default Model                  |
|------------|-------------|--------------------------------|
| **OpenAI** | API key     | `gpt-4o-mini`                  |
| **Anthropic** | API key  | `claude-3-5-sonnet-20241022`   |
| **Gemini** | API key     | `gemini-1.5-flash`             |
| **Ollama** | Local       | auto-detected                  |
| **OpenRouter** | API key | `anthropic/claude-3.5-sonnet`  |
| **Custom** | API key     | any OpenAI-compatible endpoint |

> 💡 **Auto-fallback** — If your active provider fails, MIRA silently rotates to the next enabled one.

### 🎙️ Voice

- Push-to-talk with arc-reactor orb animation
- Auto-speak replies with configurable voice, rate, and pitch
- Wake word activation ("Hey MIRA")
- Save and restore speech profiles

### 🎨 Customisation

- **7 themes** — Midnight, Daylight, Cyberpunk, Sakura, Nordic, Neon, Earth
- **Custom CSS** — Inject your own styles in real-time
- **Accent color** — Choose from 10 accent colors or let the theme decide
- **Personality presets** — Default, Concise, Friendly, Code Mentor, Therapist, or write your own system prompt

### 📁 Projects

Organise conversations into projects with:
- Custom instructions injected into every prompt
- File attachments (text content appended automatically)
- Color-coded sidebar navigation

### 🖼️ Image Attachments

- **Drag & drop** images into the chat
- **Paste** from clipboard
- **Camera capture** via `getUserMedia`
- All images stored as base64 in message attachments

### 🔍 Full-Text Search

Press `Ctrl+F` to search within the current conversation. Results are highlighted and navigable with up/down arrows.

### 🔌 Plugin System

Load external JavaScript modules from URLs to extend MIRA's capabilities. Plugins can hook into messages and settings.

### 🔒 Privacy

- 100% local — all data stays on your machine
- No telemetry, no tracking, no accounts
- Open source (MIT license)
- API keys never leave your device

### 🔄 E2E Sync

End-to-end encrypted sync across devices (scaffold). Bring your own relay server or use the default.

> 📖 See [FEATURES.md](./FEATURES.md) for the complete feature list.

<br/>

## ⌨️ Keyboard Shortcuts

| Shortcut      | Action              |
|---------------|---------------------|
| `F11`         | Enter voice mode    |
| `Escape`      | Close modal / exit voice |
| `Ctrl + N`    | New conversation    |
| `Ctrl + ,`    | Open settings       |
| `Ctrl + /`    | Focus chat input    |
| `Ctrl + F`    | Search in conversation |

<br/>

## 🔧 Build

```bash
# Web (browser)
npm run dev          → http://localhost:5173
npm run build        → production build
npm run preview      → preview build

# Desktop (requires Rust)
npm run tauri:dev    → hot-reload desktop app
npm run tauri:build  → platform installers
```

<br/>

## 📚 Documentation

| File              | Description                |
|-------------------|----------------------------|
| [FEATURES.md](./FEATURES.md)   | Complete feature list      |
| [CHANGELOG.md](./CHANGELOG.md) | Version history            |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Setup, guidelines, structure |

<br/>

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Setup instructions
- Project structure
- Code style guidelines
- PR workflow

<br/>

## 📄 License

**MIT** — Made with 💙 by [Mohammad Kaif Raja](https://mkr-infinity.github.io)

<br/>

---

<div align="center">

**[⬆ Back to top](#mira)**

</div>
