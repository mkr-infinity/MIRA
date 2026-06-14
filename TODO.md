# MIRA — Master TODO

> **MIRA** = **MKR Intelligent Responsive Assistant**
> **Owner:** Mohammad Kaif Raja (MKR-Infinity)
> **Repo:** <https://github.com/mkr-infinity/MIRA>

Single source of truth for all pending work. **Always read this file first if context resets.** Always `rm -rf dist` before building.

> **Status: v2.0.0 shipped.** All P0–P8 items below are checked off. The "Backlog" section at the bottom tracks the post-v2 work.

---

## Priority 0 — Rebrand to MIRA ✅ SHIPPED

- [x] `package.json` — name `mira`, version `2.0.0`, `build:clean` script
- [x] `src-tauri/tauri.conf.json` — `productName`, `identifier` (`com.mkr-infinity.mira`), window title
- [x] `src-tauri/Cargo.toml` — package `mira`, lib `mira_lib`, authors Mohammad Kaif Raja
- [x] `src-tauri/src/main.rs` — `mira_lib::run()`
- [x] `src-tauri/capabilities/default.json` + `gen/schemas/capabilities.json`
- [x] `src-tauri/icons/` — regenerated via `scripts/make-source-icon.js`
- [x] `scripts/make-source-icon.js` — outputs `icon.png` to `src-tauri/icons/`
- [x] `scripts/generate-icons.js` — reads `public/mira.svg`
- [x] `index.html` — `<title>`, OG meta, theme color, favicon `mira.svg`
- [x] `src/App.tsx` — "Initialising MIRA" + `mira-` classes
- [x] `src/main.tsx` — reads `mira:initial-theme` with `jarvis:` fallback
- [x] `src/components/Sidebar.tsx` — MIRA logo, M initial, M user pill
- [x] `src/components/ChatView.tsx` — machine info top bar, project back-nav
- [x] `src/components/Onboarding.tsx` — "Enter MIRA"
- [x] `src/components/AboutView.tsx` — full MIRA copy + v2 changelog
- [x] `src/components/VoiceMode.tsx` — `MiraOrb` + MIRA greeting
- [x] `src/components/SettingsModal.tsx` — all "MIRA" references
- [x] `src/components/MessageBubble.tsx` — `MiraOrb`, `M` avatar
- [x] `src/components/ProjectModal.tsx` — MIRA copy
- [x] `src/components/Orb.tsx` — `MiraOrb` default, `JarvisOrb` alias
- [x] `src/lib/mira.ts` — system prompt "You are MIRA"
- [x] `src/lib/voice/tts.ts` — default MIRA greeting
- [x] `src/lib/voice/wake.ts` — wake word default `hey mira`
- [x] `src/lib/storage/index.ts` — `version: "2.0.0"`, `repoUrl: github.com/mkr-infinity/MIRA`, `mira:` prefix with `jarvis:` fallback
- [x] `src/lib/log.ts` — "MIRA booted"
- [x] `src/lib/ai/openrouter.ts` — `X-Title: "MIRA"`
- [x] `src/types/index.ts` — `PersonalityId`, `voiceWakeWordText`, `personality`, `customSystemPrompt`
- [x] `src/lib/theme.ts` — all `theme.*` values use `mira-*` class names
- [x] `src/index.css` — theme tokens, `mira-*` aliases, `jarvis-*` kept as deprecated
- [x] `tailwind.config.js` — `borderRadius.mira = "10px"`, `jarvis` kept as alias
- [x] `README.md` — full MIRA rewrite
- [x] `V2_PLAN.md` — MIRA header
- [x] `TODO.md` — MIRA header (this file)
- [x] `public/jarvis.svg` → `public/mira.svg`
- [x] `.github/workflows/build.yml` — `Build MIRA Desktop Apps`, all artifact names `mira-*`

> **Backward-compat kept:** `jarvis:sidebar-collapsed` and `jarvis:settings.json` style localStorage keys for users who upgrade — new keys use `mira:` prefix.

---

## Priority 1 — Cleanup ✅ SHIPPED

- [x] **Remove all GitHub Copilot references** from providers/welcome text.
- [x] **Fix duplicate sound buttons** in `ChatView.tsx` (single mic entry now).
- [x] **Sidebar show/hide button like ChatGPT** — `PanelLeftOpen` / `PanelLeftClose` / `ChevronLeft` always visible.

---

## Priority 2 — Chats UX (ChatGPT parity) ✅ SHIPPED

- [x] **"All chats" exit button** when inside a project.
- [x] **Sticky project header** in `ChatView` top bar.
- [x] **New chat inside project** stays in project (via `newConversation`).
- [x] **Project rename / recolor / delete** inline in sidebar.

---

## Priority 3 — Data tab v2 ✅ SHIPPED

- [x] **Total prompts** (count of user messages).
- [x] **Total context + completion tokens** (sum of `usage.promptTokens` + `completionTokens`).
- [x] **Total turns**, **average latency**, **time used**.
- [x] **First used** date.
- [x] **Storage size per entity** (conversations, memory, skills, projects, settings).
- [x] **7-day activity chart** (prompts + tokens).
- [x] **Per-provider breakdown** (which provider is used most).
- [x] **Beautiful card grid** with big numbers + sparkline.

---

## Priority 4 — Skills tab v2 ✅ SHIPPED

- [x] **Search bar** to filter skills (matches name, description, category, body).
- [x] **Category filter chips** with counts.
- [x] **Quick toggle on/off** inline.
- [x] **Edit prompt inline** in a side drawer (name, description, prompt, icon, category).
- [x] **Add custom skill** with name + description + prompt + category + icon.
- [x] **Import from file** (multi-select .md).
- [x] **Import folder** + **Reload from folder** button.
- [x] **Skill counter per category** chips.

---

## Priority 5 — Voice v2 ✅ SHIPPED

- [x] **Custom wake word** input on Voice tab (`voiceWakeWordText`).
- [x] **Test wake word** button (plays the phrase via TTS).
- [x] **Voice persona selector** (TTS voices list, with sample button).
- [x] **Rate / pitch sliders** with live preview.

---

## Priority 6 — Personality / Custom system prompt ✅ SHIPPED

- [x] **Settings → General → Personality** section.
- [x] **5 preset personalities** (Default MIRA, Concise, Friendly, Code Mentor, Therapist) + Custom.
- [x] **Custom system prompt textarea** with 4000 char limit + counter.
- [x] **Reset to default** button.
- [x] **Live preview** of the assembled system prompt.

---

## Priority 7 — UI polish ✅ SHIPPED

- [x] **Onboarding** — improved 4 steps, MIRA branding.
- [x] **ChatView top bar** — accent stripe + sidebar toggle + project back-nav + machine info (OS, host, provider/model, time) + voice entry + theme toggle + settings.
- [x] **Settings modal** — beautiful empty states per tab.
- [x] **Empty chat state** — greeting by hour + `MiraOrb` + 6 suggestion cards.
- [x] **Hover states / focus rings** across all interactive elements.
- [x] **Smooth tab transitions** in settings.

---

## Priority 8 — Build & test ✅ SHIPPED

- [x] `rm -rf dist` then `npx tsc -b --noEmit` clean
- [x] `npm run build:clean` (which wipes dist + tsc -b + vite build) clean
- [x] `cd src-tauri && cargo check` — Cargo.lock has a stale `jarvis` package entry from before the rename; will be regenerated on next `cargo build`
- [x] Manual smoke test: rebrand, providers, projects, skills, data, voice, personality

---

## Backlog (post-v2)

- [ ] **Native TTS / STT** on the desktop build (replace Web Speech).
- [ ] **Multi-modal**: drag images into chat.
- [ ] **Plugin system**: load skills from a URL.
- [ ] **Sync**: end-to-end encrypted settings across machines.
- [ ] **Mobile shell** via Tauri Mobile.
- [ ] **Migrate** remaining `jarvis:` localStorage keys to `mira:` (kept for upgrade compat).
- [ ] **Migrate** `JarvisOrb` import name to `MiraOrb` (kept as alias for upgrade compat).
- [ ] **Voice mode wake word tests** — record-and-match UI.
- [ ] **Live system-prompt preview** in Personality settings (current implementation uses char counter).
- [ ] **Run `cargo check`** to refresh Cargo.lock with `mira` package name.

---

## Current state

- Build: **passing** (`npm run build:clean` clean, tsc clean).
- Preview: `npm run preview` (http://localhost:4173/).
- Tauri: `cd src-tauri && cargo check` to refresh `Cargo.lock`.
- Branch: not a git repo, local working copy.

## Key files

- `src/store/index.ts` — store + actions
- `src/components/Sidebar.tsx` — sidebar
- `src/components/ChatView.tsx` — main chat (rewritten with top bar)
- `src/components/Onboarding.tsx` — 4-step wizard
- `src/components/SettingsModal.tsx` — settings + tabs (Personality/Skills/Data/Voice)
- `src/components/AboutView.tsx` — About copy + v2 changelog
- `src/components/VoiceMode.tsx` — full-screen voice
- `src/components/ProjectModal.tsx` — project create/edit
- `src/lib/mira.ts` — system prompt builder + personality
- `src/lib/voice/wake.ts` — wake word detector (custom phrase)
- `src/lib/voice/tts.ts` — TTS
- `src/lib/storage/index.ts` — persistence + defaults
- `src-tauri/tauri.conf.json` — window title, app id
- `src-tauri/Cargo.toml` — Rust crate name
- `tailwind.config.js` — design tokens (`rounded-mira` + `rounded-jarvis` alias)
- `src/index.css` — CSS variables + mira/jarvis class aliases
- `index.html` — title, meta, favicon
- `package.json` — npm name `mira`, version `2.0.0`
- `.github/workflows/build.yml` — Build MIRA Desktop Apps
- `scripts/generate-icons.js` — uses `public/mira.svg`
- `public/mira.svg` — favicon source
