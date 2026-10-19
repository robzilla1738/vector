# Aux extension

Independent implementation based on docs/spec/ui/{tokens,newtab,chat,settings,secondary,onboarding,utilities}.md, docs/spec/daemon/{core,agent,services}.md and docs/spec/native/{apis-core,omnibox}.md.

`pnpm --filter @aux/extension build` emits `dist/manifest.json`, the public generated extension identity and CSP-compatible JavaScript. Load only in a disposable Aux profile. Native auth is mandatory: missing `chrome.auxAccount` shows an actionable connection error; it never obtains a signing key from HTTP. The background worker registers its account/profile/incognito route on the authenticated daemon WebSocket and permits only explicit tab/window/page commands.

`pnpm --filter @aux/extension typecheck` checks the extension and shared UI. Vite's development server supports UI work without native APIs, with explicit unavailable errors. It does not provide fake account/backend data.

Implemented surfaces are a first functional slice. The conversation polls authoritative transcript rows; full streaming event reconciliation, attachment/context uploads, formatted math, richer queue editing, artifacts, tab search, overlays, full settings inventory, import/recovery and screenshot parity remain outstanding. Project/routine creation, memory editing and local onboarding require their real daemon methods. Settings server/skill/privacy diagnostic panels expose actual backend responses and errors pending dedicated editors.
