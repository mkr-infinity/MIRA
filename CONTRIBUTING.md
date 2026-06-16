# Contributing

<br/>

Thanks for your interest in MIRA! 🎉

<br/>

## Prerequisites

| Tool  | Version  | Installation                                    |
|-------|----------|--------------------------------------------------|
| Node  | `>=20`   | [nodejs.org](https://nodejs.org)                 |
| npm   | `>=10`   | ships with Node                                  |
| Rust  | `>=1.77` | [rustup.rs](https://rustup.rs) *(desktop only)*  |

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

1. **Code style** — Follow existing patterns. No emojis in code comments. Use descriptive variable names.
2. **TypeScript** — Strict mode. Run `npx tsc --noEmit` before committing.
3. **Commits** — Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.). Keep them granular.
4. **PRs** — One feature per PR. Include screenshots for UI changes.
5. **Testing** — Verify with `npm run build` before submitting.

<br/>

## Feature Requests

Open an issue with the `enhancement` label. For major features, please discuss first.

<br/>

## Reporting Bugs

Open an issue with the `bug` label. Include:
- MIRA version
- Browser / platform
- Steps to reproduce
- Expected vs actual behaviour

<br/>

---

> See [FEATURES.md](./FEATURES.md) for a full feature list and [CHANGELOG.md](./CHANGELOG.md) for version history.
