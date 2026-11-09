# Changelog

<br/>

## 2.1.1 (2026-11-09)

### 🚀 New Features

- **Five new built-in providers** — Groq, DeepSeek, Mistral, xAI (Grok) and Together AI join OpenAI/Anthropic/Gemini/Ollama/OpenRouter (11 total). All ride a shared, battle-tested OpenAI-compatible adapter factory (streaming, tool calls, usage, vision); existing installs gain them automatically via a settings migration

- **Vision** — attached images are now actually sent to multimodal models (previously only the file name reached the API): OpenAI-compatible parts, Anthropic content blocks, Gemini `inline_data`, Ollama `images`; sent images render as thumbnails in the user's bubble

### ⚡ Performance

- **Streaming render batching** — AI response tokens now flush to the UI once per animation frame instead of per-token, eliminating per-token array clones of the whole conversation store (the biggest source of jank on low-end machines)
- **Memoized chat** — `MessageBubble` is `React.memo` with narrowed store selectors; a streaming patch or log entry no longer re-renders every bubble, the sidebar, or the whole chat view
- **Code splitting** — SettingsModal (3.1k lines incl. AboutView), VoiceMode and Onboarding are lazy-loaded; vendor chunks split for framer-motion and the markdown pipeline; ES2021 build target for all desktop webviews

### 🎨 Fixes

- **Theme consistency** — single `applyTheme()` source of truth; pre-React theme init covers all 8 themes (previously 6 themes flashed wrong colors on startup); `anime` theme now correctly maps to the dark class in `setTheme`; storage migration no longer rewrites settings.json on every boot
- **Graceful stop** — stopping generation no longer fakes a "Network problem" error, walks the provider fallback chain, or logs error entries; timeout aborts are labelled correctly
- `regenerate()` preserves attachments; provider-validation failures clean up their timeout/abort-controller entries

### 🔒 Security & Privacy

- **Tauri CSP enabled** (was `null`) — `default-src 'self'`, `object-src`/`frame-src` locked down, connect-src restricted to self/IPC + provider endpoints
- **Fonts self-hosted** via `@fontsource` — zero CDN requests, identical rendering fully offline
- Desktop notification icon fixed (`/mira.svg`, was a 404ing `/favicon.ico`)

### 🧹 Dependency Hygiene

- Removed unused `highlight.js`, `react-router-dom`, `@tauri-apps/plugin-os`, `@tauri-apps/plugin-shell` (JS) and `tauri-plugin-shell` + `tokio features=["full"]` (Rust)
- Added `engines` field and an npm `typecheck` script

### ♿ Accessibility

- `prefers-reduced-motion` support (CSS + framer-motion `MotionConfig reducedMotion="user"`)
- `aria-label` on every icon-only button (composer, sidebar, message actions, search controls)

### 📚 Documentation

- README: corrected dev-server port (5173 → **1420**), Vite badge version, added `npm run typecheck`
- Merged the missing 2.0.1 entry from the legacy `changelog.txt` into this file; `changelog.txt` retired (single source of truth)
- Added a pull-request template

<br/>

## 2.0.1 (2024)

### 🐛 Fixes

- Fixed `isTauri()` call in SettingsModal (was missing parentheses)
- Fixed `setTheme` parameter type (string → ThemeId)
- Improved error handling in storage layer (log errors instead of swallowing)
- Added null checks for `#root` element in `main.tsx`
- Replaced non-null assertions with safe fallbacks in store
- Added `.catch()` to fire-and-forget storage saves
- Fixed `scheduleSave` using stale closure reference
- Added clipboard error handling in MessageBubble

### 🎨 Improvements

- Made Orb and ThinkingAnimation theme-aware (use accent color from CSS)
- Replaced hardcoded cyan colors with CSS variables across all components
- Added complete theme overrides for neon and nordic themes
- Removed 14 unused icon imports across 4 components
- Removed dead ThinkingDots and ThemeButton functions
- Added global keyboard shortcuts (Ctrl+N, Ctrl+,, Escape, Ctrl+/)
- Added ARIA attributes to SettingsModal, Onboarding, ChatView
- Added responsive sidebar auto-collapse on narrow viewports
- Animated sidebar collapse/expand with CSS transitions
- Fixed legacy 'jarvis' localStorage key to 'mira'

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
