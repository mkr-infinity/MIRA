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
- All 44+ commits pushed to `origin/main`

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

### 🚀 Initial Release

- Multi-provider AI chat (OpenAI, Anthropic, Gemini, Ollama, OpenRouter, Custom)
- Voice mode with push-to-talk, wake word, auto-speak
- Desktop control (open apps, set volume, play music, lock, notify)
- 7 themes: Midnight, Daylight, Cyberpunk, Sakura, Nordic, Neon, Earth
- Projects with custom instructions and file attachments
- Long-term memory and skill system
- Keyboard shortcuts and accessibility (ARIA)
- Tauri desktop app support
- 100% local, no telemetry, no accounts
