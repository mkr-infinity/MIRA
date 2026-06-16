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
  <a href="#-prerequisites">📋 Prerequisites</a> ·
  <a href="#-quick-start">🚀 Quick Start</a> ·
  <a href="#-keyboard-shortcuts">⌨️ Shortcuts</a> ·
  <a href="#-build">🔧 Build</a> ·
  <a href="#-documentation">📚 Docs</a> ·
  <a href="#-contributing">🤝 Contributing</a> ·
  <a href="#-license">📄 License</a>
</p>

<br/>

---

</div>

<br/>

## 📋 Prerequisites

Before running `npm install`, make sure you have these installed:

| Tool  | Minimum | For             | Install                                    |
|-------|---------|-----------------|--------------------------------------------|
| Node  | `>=20`  | Runtime         | [nodejs.org](https://nodejs.org)           |
| npm   | `>=10`  | Package manager | ships with Node                            |
| Rust  | `>=1.77`| Desktop build   | [rustup.rs](https://rustup.rs)             |

> **Rust is optional.** The web version at `http://localhost:5173` works without it.  
> Rust + Tauri are only needed if you want to build the native desktop app.

<br/>

## 🚀 Quick Start

Get MIRA running in under a minute:

```bash
# 1. Clone
git clone https://github.com/mkr-infinity/MIRA
cd MIRA

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.  
The onboarding wizard will guide you through your first provider setup.

> 💡 **First time?** The wizard walks you through picking a provider, pasting your API key, and testing voice — takes about 60 seconds.

<br/>

### What you can do next

| Action | How |
|--------|-----|
| 💬 **Chat** | Type a message and press `Enter` |
| 🎙️ **Use voice** | Press `F11` or click the mic button |
| 🖼️ **Attach images** | Drag & drop, paste, or click the camera icon |
| 🔍 **Search** | Press `Ctrl+F` in any conversation |
| ⚙️ **Configure** | Press `Ctrl+,` to open settings |
| 📁 **Organise** | Create projects in the sidebar |

<br/>

## ⌨️ Keyboard Shortcuts

| Shortcut      | Action                    |
|---------------|---------------------------|
| `F11`         | Enter / exit voice mode   |
| `Escape`      | Close modal / exit voice  |
| `Ctrl + N`    | New conversation          |
| `Ctrl + ,`    | Open settings             |
| `Ctrl + /`    | Focus the chat input      |
| `Ctrl + F`    | Search within conversation|

> All shortcuts work in the web app and the desktop build.

<br/>

## 🔧 Build

Build MIRA for production or package it as a desktop app.

```bash
# ── Web (browser) ─────────────────────────────
npm run dev              # Development server at localhost:5173
npm run build            # Production build → dist/
npm run preview          # Preview the production build

# ── Desktop (requires Rust ≥1.77) ─────────────
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
| [FEATURES.md](./FEATURES.md) | Complete feature list — providers, voice, themes, plugins, and more |
| [CHANGELOG.md](./CHANGELOG.md) | Full version history from v1.0.0 to latest |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Setup guide, project structure, coding guidelines, PR workflow |

<br/>

## 🤝 Contributing

We'd love your help! Whether it's a bug fix, a new feature, or better docs — every contribution counts.

**Quick steps:**

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-thing`)
3. Make your changes
4. Run `npx tsc --noEmit` and `npm run build` to verify
5. Commit with [conventional commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, etc.)
6. Open a pull request

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
