# Changelog

<br/>

## 2.1.0 (2026-06-16)

### 🚀 New Features

- **Custom CSS** — Inject your own CSS via Settings (`src/App.tsx`, `SettingsModal.tsx`)
- **Conversation Search** — Full-text search within messages via `Ctrl+F` (`ChatView.tsx`)
- **Export / Import** — Export all data as JSON, import to merge (`store/index.ts`)
- **Desktop Notifications** — Web Notification when MIRA replies (`store/index.ts`)
- **Drag-Drop Images** — Drag and drop or paste images as attachments (`ChatView.tsx`)
- **Context Suggestions** — Smart EmptyState prompts based on recent activity (`ChatView.tsx`)
- **Plugin System** — Load JS modules from URLs (`src/lib/plugins/index.ts`)
- **Image Generation** — Inline `/image` command toggle (`SettingsModal.tsx`, `ChatView.tsx`)
- **Camera Capture** — Capture photos via `getUserMedia` (`ChatView.tsx`)
- **Speech Profiles** — Save/restore voice configurations (`VoiceTab`)
- **E2E Sync** — End-to-end encrypted sync scaffolding (`DataTab`)

### 🎨 Improvements

- Animated MiraLogo with rotating rings, pulsing core, orbiting dot
- Redesigned Onboarding with Skip button, live theme preview, mobile-responsive layout
- Mobile sidebar overlay with backdrop + responsive CSS optimisations
- All commits pushed to `origin/main`

### 🐛 Fixes

- Fixed `!isTauri()` bug in SettingsModal
- Fixed `setTheme` param type in store
- Replaced hardcoded cyan with CSS variables across all components
- Removed 14 unused icon imports and dead code

### 📚 Documentation

- Created `FEATURES.md`, `CHANGELOG.md`, `CONTRIBUTING.md`
- Rewrote README with prerequisites, badges, professional layout
- Animated SVG logo in README with CSS keyframes

---

<br/>

## 2.0.0 (2026-05-01)

### 🚀 Major Release

Complete rewrite of MIRA v1. Brand new architecture, design system, and feature set.

### ✨ What's New

- **Multi-Provider AI** — OpenAI, Anthropic, Gemini, Ollama, OpenRouter, Custom
- **Voice Mode** — Push-to-talk, wake word, auto-speak, configurable TTS
- **Desktop Control** — Open apps, set volume, play music, lock, notify
- **7 Themes** — Midnight, Daylight, Cyberpunk, Sakura, Nordic, Neon, Earth
- **Projects** — ChatGPT-style sidebar, custom instructions, file attachments
- **Memory & Skills** — Long-term facts, import `.md` skill files
- **Keyboard Shortcuts** — `F11` voice, `Ctrl+N` new chat, `Ctrl+,` settings
- **Accessibility** — ARIA attributes throughout
- **Tauri v2** — Native desktop app with file system access

---

### v1.x — Legacy

<br/>

## 1.4.0 (2026-03-10)

### ✨ Added

- OpenAI provider adapter with streaming support
- Basic markdown rendering for messages
- Conversation history with local persistence

---

<br/>

## 1.3.0 (2026-02-15)

### ✨ Added

- Custom theme system with CSS variables
- Dark/light mode toggle
- Message search within current conversation

---

<br/>

## 1.2.0 (2026-01-20)

### ✨ Added

- Basic voice input via Web Speech API
- Text-to-speech for assistant replies
- Provider configuration UI

---

<br/>

## 1.1.0 (2026-01-05)

### ✨ Added

- Multiple conversation support
- Conversation rename and delete
- Local storage persistence

---

<br/>

## 1.0.0 (2025-12-15)

### 🚀 Initial Release

- Single-conversation chat interface
- OpenAI integration with API key configuration
- Minimal dark theme
- Basic markdown output
