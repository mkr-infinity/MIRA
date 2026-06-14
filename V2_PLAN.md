# MIRA v2 — Open Tasks & Resume Point

This file is the source of truth for the v2 release. If your context is fresh
or the conversation was cut off, read this file and resume.

> **MIRA** = **M**KR **I**ntelligent **R**esponsive **A**ssistant
> Owner: **Mohammad Kaif Raja (MKR-Infinity)**
> Repo: <https://github.com/mkr-infinity/MIRA>

## Aesthetic direction
- Dark: Vercel black/white (#000 / #0A0A0A / #141414 / #262626 / #FAFAFA)
- Light: Dribbble warm cream (#FAF7F2 / #FFFFFF / #F4EFE6 / #E5DDCC / #1A1612) + terracotta accent (#C2410C)
- Cyan (#00D4FF) is reserved as a subtle brand glow only — never a primary fill
- No emoji anywhere
- Toggle on-color = theme accent (dark = white, light = terracotta). NOT pink. NOT cyan fill.
- Sidebar = ChatGPT style. No skills grid, no Memory/Skills nav buttons.
- Settings = centered modal (scale+fade), not right slide-over
- Voice mode = full-screen, no "Standing by" flicker loop
- Class names: canonical `mira-*`; `jarvis-*` kept as deprecated aliases for upgrade compat

## v2 deliverables — all shipped
1. ✅ Toggle visual fix (`mira-toggle` / `jarvis-toggle` — hard-bounded thumb, no pink track, inset shadow only).
2. ✅ Sidebar inline project editor (create / rename / recolor / delete).
3. ✅ Sidebar collapse polish (icon-rail mode + always-visible show/hide buttons).
4. ✅ About v2 badge + version field (default `2.0.0`).
5. ✅ Logs panel (live tail, level filter, copy / clear / export, per-source filter, 1,000 event cap).
6. ✅ ChatView top status bar (provider · model, tokens, latency, voice entry, machine info).
7. ✅ Removed GitHub Copilot from default providers (code kept, not surfaced).
8. ✅ Ollama setup polish (curated list, "Start Ollama" empty state, no fake defaults).
9. ✅ Onboarding rewritten to 4 pages.
10. ✅ UI beauty pass (glowing MiraOrb, animated gradient backdrop, floating input card, sample prompts in 2×2 grid).
11. ✅ Full rebrand: **Jarvis → MIRA** (source, UI, package metadata, window title, tauri.conf, capabilities, About, splash, README).
12. ✅ Personality & custom system prompt (5 presets + custom textarea).
13. ✅ Custom wake word (Settings → Voice).
14. ✅ Skills v2 (search, category filter chips, inline edit drawer, folder reload).
15. ✅ Data v2 (lifetime stats, 7-day activity chart, per-provider breakdown, per-entity storage sizes, time-saved estimate).
16. ✅ Project back-navigation in ChatView ("All chats" pill + sidebar chevron).
17. ✅ Always-visible sidebar show/hide buttons (`PanelLeftOpen` / `PanelLeftClose` / `ChevronLeft`).
18. ✅ Fixed duplicate sound buttons (single mic entry in consolidated input).
19. ✅ Build always cleans `dist/` first (`build:clean` script + `tauri:build` wipes dist).
20. ✅ Renamed `public/jarvis.svg` → `public/mira.svg`.
21. ✅ GitHub Actions workflow `Build Jarvis Desktop Apps` → `Build MIRA Desktop Apps`, all artifact names → `mira-*`.
22. ✅ Cargo package renamed to `mira` / `mira_lib`; tauri identifier → `com.mkr-infinity.mira`.
23. ✅ localStorage `mira:` prefix (with `jarvis:` fallback for upgrades).
24. ✅ `src-tauri/icons/icon.png` & splash regenerated via `scripts/make-source-icon.js`.

## Implementation order (already executed)
- [x] V2_PLAN.md written
- [x] Toggle fix
- [x] Sidebar projects editor + collapse polish
- [x] About v2 badge + version field
- [x] Logs system
- [x] ChatView top status bar
- [x] Remove Copilot from default providers
- [x] Ollama onboarding improvement + curated list refresh
- [x] Onboarding 4-page rewrite
- [x] UI beauty pass
- [x] README rewrite
- [x] Full MIRA rebrand
- [x] Personality + custom system prompt
- [x] Custom wake word
- [x] Skills v2 (search, categories, drawer, reload)
- [x] Data v2 (stats, chart, breakdown)
- [x] ChatGPT-style sidebar w/ project back-nav
- [x] `rounded-jarvis` retained as alias; new `rounded-mira` in tailwind config
- [x] Type-check, build, dist clean — passing

## Backlog (post-v2 candidates)
- [ ] Native TTS / STT on the desktop build (replace Web Speech).
- [ ] Multi-modal: drag images into chat.
- [ ] Plugin system: load skills from a URL.
- [ ] Sync: end-to-end encrypted settings across machines.
- [ ] Mobile shell via Tauri Mobile.
- [x] Migrate all `rounded-jarvis` usage to `rounded-mira` (kept as alias for now).
- [x] Migrate `lib/jarvis.ts` filename to `lib/mira.ts`.

## Key file paths
- src/App.tsx
- src/main.tsx
- src/index.css
- src/store/index.ts
- src/types/index.ts
- src/lib/theme.ts
- src/lib/skills.ts
- src/lib/mira.ts           # MIRA_PERSONALITY + buildSystemPrompt
- src/lib/desktop/index.ts
- src/lib/ai/{index,openai,anthropic,gemini,ollama,openrouter,copilot,base,models}.ts
- src/lib/voice/{tts,stt,wake}.ts
- src/lib/storage/index.ts
- src/lib/platform.ts
- src/components/{Sidebar,ChatView,Onboarding,SettingsModal,VoiceMode,AboutView,ProjectModal,Orb,MessageBubble}.tsx
- src-tauri/{src/lib.rs,src/commands.rs,Cargo.toml,tauri.conf.json}
- tailwind.config.js
- .github/workflows/build.yml
- scripts/{generate-icons.js,make-source-icon.js}

## Build & verify
- `npx tsc -b --noEmit` must be clean ✅
- `rm -rf dist && npm run build` must succeed ✅
- `cd src-tauri && cargo check` must be clean (TBD; not run in this session)
- Preview: `python3 -m http.server 4173 --directory dist &`

## Style cheatsheet
- Surface: `mira-surface` (or `jarvis-surface` alias)
- Elevated card: `mira-elevated`
- Hover: `mira-hover`
- Text: `mira-text`
- Muted: `mira-muted`
- Accent: `mira-accent` (text), `mira-accent-bg` (background)
- Border: `mira-border` (border-color only)
- Backdrop: `mira-backdrop`
- Rounded: `rounded-mira` (10px) / `rounded-jarvis` (alias), `rounded-pill` (full)
- Inputs: `mira-input`
- Components: `mira-chip`, `mira-shadow`, `mira-backdrop`, `mira-toggle`
- Orb: `MiraOrb` (default), `JarvisOrb` (alias)
