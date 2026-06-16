# Contributing

<br/>

Thanks for your interest in MIRA! 🎉

<br/>

## Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| Node | `>=20` | [nodejs.org](https://nodejs.org) |
| npm | `>=10` | ships with Node |
| Rust | `>=1.77` | [rustup.rs](https://rustup.rs) *(desktop only)* |

<br/>

## Setup

```bash
git clone https://github.com/mkr-infinity/MIRA
cd MIRA
npm install
npm run dev
```

Open **http://localhost:5173** to preview.

<br/>

## Development

```bash
npm run dev          # hot-reload dev server
npm run build        # production build
npm run preview      # preview production build
npx tsc --noEmit     # type-check
npm run tauri:dev    # desktop dev (requires Rust)
npm run tauri:build  # desktop production build
```

<br/>

## Project Structure

```
src/
├── App.tsx                         # Root layout
├── main.tsx                        # Boot
├── index.css                       # CSS variables
├── store/index.ts                  # Zustand store
├── lib/
│   ├── ai/                         # Provider adapters
│   ├── voice/                      # TTS / STT
│   ├── desktop/                    # Desktop control
│   ├── storage/                    # Persistence
│   ├── plugins/                    # Plugin loader
│   └── theme.ts                    # Theme helpers
├── components/
│   ├── Sidebar.tsx                 # Chat list
│   ├── ChatView.tsx                # Main chat
│   ├── VoiceMode.tsx               # Voice mode
│   ├── Orb.tsx                     # Arc-reactor orb
│   ├── Onboarding.tsx              # First-run wizard
│   ├── SettingsModal.tsx           # Settings
│   ├── MessageBubble.tsx           # Messages
│   ├── MiraLogo.tsx                # Animated logo
│   ├── ThinkingAnimation.tsx       # Thinking indicator
│   ├── ActivityLog.tsx             # Activity
│   └── AboutView.tsx               # About
└── types/index.ts                  # Types
```

<br/>

## Guidelines

1. **Code style** — Follow existing patterns. Descriptive variable names. No emojis in comments.
2. **TypeScript** — Strict mode is on. Run `npx tsc --noEmit` before committing.
3. **Commits** — Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`).
4. **PRs** — One feature per PR. Screenshots help for UI changes.

<br/>

## Feature Requests & Bug Reports

Open an issue on GitHub. Use the `enhancement` or `bug` label. For bugs, include your MIRA version, browser/platform, and steps to reproduce.

<br/>

---

> See [CHANGELOG.md](./CHANGELOG.md) for version history.
