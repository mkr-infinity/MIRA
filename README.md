<div align="center">

<img src="assets/mira-logo.svg" width="130" height="130" alt="MIRA Logo" />

# MIRA

**Your intelligent AI assistant that lives on your machine.**

No telemetry. No accounts. No cloud. Just you and your AI.

<br/>

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=000)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&labelColor=000)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&labelColor=000)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&labelColor=000)](https://vitejs.dev)
[![Tauri](https://img.shields.io/badge/Tauri-2-FFC131?style=flat-square&logo=tauri&labelColor=000)](https://tauri.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square&labelColor=000)](CONTRIBUTING.md)

<br/>

<p>
  <a href="#-quick-start">🚀 Quick Start</a> ·
  <a href="#-what-you-can-do">✨ What You Can Do</a> ·
  <a href="#-beginner-guide">🎒 Beginner Guide</a> ·
  <a href="#-keyboard-shortcuts">⌨️ Shortcuts</a> ·
  <a href="#-build">🔧 Build</a> ·
  <a href="#-contributing">🤝 Contributing</a>
</p>

<br/>

---

</div>

<br/>

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/mkr-infinity/MIRA
cd MIRA

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser and follow the onboarding wizard — it walks you through picking an AI provider, pasting your API key, and testing voice in about 60 seconds.

<br/>

## ✨ What You Can Do

| Action | How |
|--------|-----|
| 💬 **Chat with AI** | Type a message and press `Enter` |
| 🎙️ **Use voice** | Press `F11` or click the mic button |
| 🖼️ **Attach images** | Drag & drop, paste, or click the camera icon |
| 🔍 **Search chats** | Press `Ctrl+F` in any conversation |
| ⚙️ **Change settings** | Press `Ctrl+,` to open settings |
| 📁 **Organise projects** | Create folders in the sidebar |
| 🎨 **Pick a theme** | Choose from 8 themes in settings |
| 🧠 **Add skills** | Teach MIRA custom abilities |

<br/>

## 🎒 Beginner Guide

### First time?

1. **Install Node.js** (version 20 or later) from [nodejs.org](https://nodejs.org)
2. **Clone and install** — run the commands in Quick Start above
3. **Pick a provider** — the onboarding wizard shows you options like OpenAI, Groq, or Ollama (local)
4. **Get an API key** — sign up at your chosen provider, grab a free key, and paste it in
5. **Start chatting** — type anything and press Enter

> Rust is **optional**. You only need it if you want to build the desktop app. The web version works in any browser.

### Need Rust for desktop build?

| Tool | Version | Install |
|------|---------|---------|
| Node | `>=20` | [nodejs.org](https://nodejs.org) |
| npm | `>=10` | ships with Node |
| Rust | `>=1.77` | [rustup.rs](https://rustup.rs) |

```bash
# After installing Rust, build the desktop app
npm run tauri:build
```

<br/>

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F11` | Enter / exit voice mode |
| `Escape` | Close modal / exit voice |
| `Ctrl + N` | New conversation |
| `Ctrl + ,` | Open settings |
| `Ctrl + /` | Focus the chat input |
| `Ctrl + F` | Search within conversation |

> All shortcuts work in both the web app and the desktop build.

<br/>

## 🔧 Build

```bash
# Web (browser)
npm run dev              # Development server at localhost:5173
npm run build            # Production build → dist/
npm run preview          # Preview the production build

# Desktop (requires Rust ≥1.77)
npm run tauri:dev        # Hot-reload desktop app
npm run tauri:build      # Platform-specific installer
```

### Output

| Command | Produces |
|---------|----------|
| `npm run build` | `dist/` — static files for any web server |
| `npm run tauri:build` | `.dmg` (macOS), `.msi` (Windows), `.AppImage` (Linux) |

<br/>

## 📚 Documentation

| File | What you'll find |
|------|------------------|
| [CHANGELOG.md](./CHANGELOG.md) | Full version history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute, code style, and project structure |

<br/>

## 🤝 Contributing

Contributions are welcome! Whether it's fixing a bug, adding a feature, or improving docs — every bit helps.

1. Fork the repo
2. Create a branch (`git checkout -b feat/my-thing`)
3. Make your changes
4. Run `npx tsc --noEmit` and `npm run build` to verify
5. Open a pull request

> See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

<br/>

## 📄 License

**MIT** — Free to use, modify, and distribute.
Made with 💙 by [Mohammad Kaif Raja](https://mkr-infinity.github.io).

<br/>

---

<div align="center">

**[⬆ Back to top](#mira)**

</div>
