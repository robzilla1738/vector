# Vector desktop — UI/UX audit against the Dia / macOS bar

> **Historical (Sep 2026, pre-M1).** Written against the first desktop shell, which was replaced by the Arc-style sidebar shell described in [`docs/ui/shell.md`](../ui/shell.md). Kept for the reasoning; the specific bugs and line references no longer apply.

Scope: `apps/desktop/{main,preload,renderer}` read-only. ~4.7k LOC total; renderer is 14 components + one 692-line `styles.css`. All line refs are to files under `/agent/workspace/vector/apps/desktop/`.

**Verdict in one line:** the bones are right (system font, token layer, hiddenInset + vibrancy, native menus/context menus, keyboard-first) but the surface is a competent developer tool, not a Dia-grade consumer browser: no system theme/accent tracking, an opaque "inspector" instead of a chat surface, a permanently visible activity bar, several outright bugs (toasts hidden behind the native page, address field that can't be cleared, six components referencing an undefined `.fade-in` class, unfocusable tabs), and hard cuts everywhere the page hides.

---

## 1. Component inventory

Styling everywhere is **one global stylesheet with BEM-ish short class names + CSS custom-property tokens**; no CSS modules, no Tailwind, no styled-components. Inline `style={{}}` is used as an escape hatch (29 occurrences, 12 of them in Settings).

| Component | Purpose | LOC | Styling notes |
|---|---|---|---|
| `App.tsx` | Root layout, theme attr, shortcut dispatcher (both renderer keys and forwarded page keys), stage-rect reporting via ResizeObserver, NewTabHome, toasts | 316 | global classes; `--sb-w`/`--rail-w` inline vars; 3× `document.querySelector(".omnibox input")` |
| `Toolbar.tsx` (`Toolbar`, `OmniBox`) | 52px top bar: sidebar toggle, back/fwd/reload-stop, address field, Vector/Chrome label, controller chip, Focus/Overview/Table segmented control, bookmark, inspector toggle | 184 | classes; good aria/titles; `value={val \|\| display}` controlled-input hack |
| `Sidebar.tsx` (`Sidebar`, `SbTab`) | Left tab rail: pins, tab list, sets, footer (Chrome pill, history/downloads/settings) | 153 | classes; `SbTab` is a `<div onClick>` (not focusable); 1 inline style for controller dot |
| `Rail.tsx` (`Rail`, `AgentCard`, `StepRow`) | Right "agent inspector": chat thread list, turns (user bubble + run card w/ status badges, steps, Q&A), composer | 338 | classes; auto-grow textarea via direct `style.height` mutation |
| `Palette.tsx` | ⌘K: URL/search/agent row, ~30 commands, sets, bookmarks; two sub-levels (Chrome tab picker, split picker) | 264 | classes; items are `<div>`s with no role |
| `Settings.tsx` | Right drawer: theme, Gateway key, planner/vision model, cookies import, search engine, workers, model-call cap, data dir, clear history | 230 | classes + **12 inline styles** |
| `ResultsTable.tsx` | Set results table: sort, filter, CSV/JSON export, copy row, open source | 162 | classes; sticky `<th>` with `top:-16px` hack; sort glyphs are text "▲▼" |
| `Overview.tsx` | Tab/set grid with screenshots, polled every 4s | 119 | classes; 3 inline |
| `ActivityShelf.tsx` | Always-visible 28px bottom bar with counts + expandable timeline | 106 | classes |
| `Inspector.tsx` | Observation drawer (elements / raw JSON), historical vs live | 90 | classes + 6 inline (incl. width 460) |
| `icons.tsx` | lucide-react icon map, 15px/1.7 and 12px/2 presets | 75 | n/a — consistent weight, good |
| `FindBar.tsx` | In-flow find strip: input, n/N, prev/next/close | 55 | classes |
| `Downloads.tsx` | In-flow bottom shelf list with Open/Reveal | 51 | classes |
| `ResizeHandle.tsx` | Pointer-capture drag edge, dbl-click reset | 41 | classes; solid implementation |
| `History.tsx` | Reuses palette shell: search box + list | 34 | classes; `key={i}`; no keyboard nav |
| `SiteTile.tsx` | Favicon tile with letter fallback | 20 | classes; `.tile-letter` **undefined in CSS**; favicon `<img>` overlays letter rather than replacing it |
| `store.ts` | Zustand store, event reducer, chat queue | 454 | — |
| `chrome.ts` | Pure URL / overlay / activity-count rules | 102 | — |
| `styles.css` | Everything | 692 | tokens at top, then ~30 sections |

---

## 2. Design-system assessment

**What exists (styles.css:3-107)** — a real token layer: font stacks, 7-step type scale, 6-step spacing, 5 radii, `--toolbar-h`, `--traffic-inset`, easing + two durations, and two full semantic palettes (`bg-0..3`, `ink-0..2`, `line`, `glass`, `accent`, `ok/warn/err` + `-soft`/`-line` variants, `--ring`, `--selection`, `--shadow`). Light and dark are attribute-scoped (`[data-theme]`). `prefers-reduced-motion` and `prefers-reduced-transparency` are both honored (140-154). This is a much better start than most Electron apps.

**Where it falls short of the bar:**

| Area | Finding | Evidence |
|---|---|---|
| System theme | Theme is a stored setting, `dark` by default, options only `dark`/`light`. Nothing reads `prefers-color-scheme` or `nativeTheme`. The **native vibrancy material follows the OS** while the DOM follows the setting → light-sidebar-material under dark glass (or vice versa) whenever they disagree. | `App.tsx:68`, `Settings.tsx:60,75`; no `nativeTheme` anywhere in `main/` |
| Accent color | Hardcoded Apple blue (`#0a84ff`/`#007aff`). Never reads `systemPreferences.getAccentColor()`; a user with a purple/graphite accent gets blue rings, blue selection, blue bubbles. | `styles.css:58,94` |
| Type scale | `--fs-xs` and `--fs-sm` are **both 11px** (dead token). Body of most surfaces is 12px (`--fs-md`), not macOS's 13px; badges are 10px (`.st`, `.impl-badge`). Tab titles 12px/500 — Dia/Safari use 13px. | `styles.css:8-9,159-175,318` |
| Spacing grid | Tokens are 4/8/12/16/24/32 but the sheet is full of 5/7/9/11/14px values (28 occurrences): `.chat-card padding: 9px 11px`, `.composer gap: 7px`, `.step-row gap: 7px`, `.tl-item gap: 9px`, `.rail-head padding: 12px 14px 10px`, `.act-counts gap: 14px`. | `styles.css:453,476,519,490,424,624` |
| Radii | Tokens 4/6/10/12 — **no 8px token**, yet the most important control (omnibox) uses literal `8px`; segmented buttons use literal `5px`/`6px`. | `styles.css:376,400,655` |
| Motion | `--ease` is easeOutQuint (good), 120/180ms (good). But **`.fade-in` is used by 6 components and is not defined** → palette, settings, history, inspector, find bar, downloads all hard-cut in. Drawers don't slide. Sidebar/rail animate `width`, which reflows the whole app and fires the ResizeObserver → IPC → native `setBounds` per frame. | `Settings.tsx:65`, `History.tsx:15`, `Inspector.tsx:47`, `FindBar.tsx:30`, `Downloads.tsx:17`, `ResultsTable.tsx:91`; `styles.css:276,419` |
| Focus rings | `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` — a hard web ring. macOS is a ~3px soft ring at ~50% alpha (`--ring` exists and is already used on the omnibox, but not for `:focus-visible`). | `styles.css:128-133` vs 381 |
| Scrollbars | Custom always-visible 8px `::-webkit-scrollbar` disables macOS overlay scrollbars in sidebar/rail/lists. Dia has overlay scrollbars. | `styles.css:135-138` |
| Cursor | `button { cursor: pointer }` globally — native macOS controls (and Dia) use the arrow cursor. `.sb-tab` correctly uses `cursor: default`, so it's inconsistent within the same rail. | `styles.css:124,306` |
| Selection | `body { user-select: none }` with only two opt-ins (`.insp-json`, data-dir span). **Agent replies, results, and step details cannot be selected/copied.** | `styles.css:120,667`, `Settings.tsx:218` |
| Consistency | Two segmented-control implementations (`.mode-seg` vs `.seg`) with different padding/radius; two "sp" spacer idioms (`.sp` scoped to three parents + `style={{flex:1}}` elsewhere); `kbd` styled as 3D keycap (2px bottom border) while everything else is flat. | `styles.css:395-403,653-657,288,344,428`, `ResultsTable.tsx:95`, `styles.css:205-209` |
| Hardcoded colors | Mostly tokenised; stray literals: `rgba(0,0,0,0.38)` scrim, `rgba(0,0,0,0.5)` `.ov-src`, `#fff` on primary/bubble. | `styles.css:531,565,200,448` |

Net: **6/10** design system. Token layer is real and mostly used; the misses are the ones that make it feel non-native (system theme/accent, ring, scrollbars, cursor, grid discipline).

---

## 3. Electron main window — macOS nativeness

`main/index.ts:521-551`:

| Setting | Value | Assessment |
|---|---|---|
| Window class | `BaseWindow` + `WebContentsView` shell + per-tab `WebContentsView`s | Correct modern architecture. |
| `titleBarStyle` | `hiddenInset` | Correct. |
| `trafficLightPosition` | `{x:16, y:18}` | Lights are 12px tall → centre y=24; toolbar is 52px → centre 26. **2px low.** Use `y: 20`. `--traffic-inset: 80px` is fine for 3 lights at x=16. |
| `vibrancy` | `"sidebar"` on the **whole window**, `visualEffectState: "active"` | Material is right for a sidebar, but applying it window-wide means the stage (`--stage-bg` opaque) and rail (`--bg-1-solid` opaque) paint over it anyway; only sidebar+toolbar are translucent. The renderer *also* applies `backdrop-filter: blur(40px) saturate(1.8)` on `.toolbar`/`.sidebar` (styles.css:274,362) — redundant with native vibrancy (there is nothing DOM-side to blur) and costs a compositing layer. Pick one: native vibrancy + semi-transparent CSS fills, drop `backdrop-filter`. |
| `transparent` | `true`; shell `setBackgroundColor("#00000000")` | OK for vibrancy. **Page views never get a background color** → Chromium's default white paints during navigation/tab creation → white flash in dark mode on every new tab. Fix: `view.setBackgroundColor(themeIsDark ? "#161617" : "#f5f5f7")` in `native-views.ts:53`. |
| `backgroundColor` (window) | unset | Fine with transparent. |
| `minWidth/minHeight` | 1100 × 720 | Aggressive. Dia works down to ~700px; with sidebar closed Vector's toolbar would survive ~760px. Suggest 800 × 600. |
| `roundedCorners` | `true` | Default; fine. |
| Window title | static `"Vector"` | Never `setTitle(activePage.title)` → Mission Control / Dock window list / ⌘\` all say "Vector". |
| Fullscreen | no `enter-full-screen`/`leave-full-screen` handling | Traffic lights hide in fullscreen but `--traffic-inset: 80px` stays → 80px dead gap at top-left (styles.css:285-286). |
| Native theme sync | none | See §2. `nativeTheme.themeSource` should follow the setting so the material matches. |
| Application menu | Full template (index.ts:590-673) with roles + shortcuts routed through one dispatcher | Good. Gaps: no `Preferences… ⌘,` in the app menu, no `services` role, no `role: "windowMenu"` (window list), no Bookmarks/History menus, `⌘S` overrides Save Page (Arc precedent — acceptable). |
| Context menus | Native `Menu.popup()` for page (links/images/spelling/edit/nav/inspect) and chrome | Good. But **right-click anywhere in chrome (including on a tab) shows the *page* menu** (`App.tsx:262-267`) — no tab menu (Close, Close Others, Duplicate, Pin, Copy URL). |
| Overlay ↔ native view | `ui.overlay(true)` → `applyStage()` → `setVisible(false)` on the page **synchronously, before** React commits the scrim (`store.ts:130-133`: `bridge.overlay()` then `set()`) | **Flashy.** Sequence is: page disappears → one frame of bare `--stage-bg` → scrim + palette pop in with no transition (`.fade-in` undefined). On close the reverse. Fix: paint a `capturePage()` snapshot into `#stage` as a `<img>` before hiding the view, animate the scrim/palette in 150ms, and only then hide. |
| Stage bounds | ResizeObserver → `ui.setStage` IPC per resize event | During the 200ms sidebar `width` transition that's ~12 IPC round-trips and 12 native `setBounds` calls; the native view lags the DOM by a frame → visible tearing at the sidebar edge. Prefer `transform: translateX` for the collapse (no reflow) and report bounds only at start/end, or use `will-change` + a single `setBounds` at the end with the previous frame captured. |
| Tab switch | `focusPage` re-adds child view (z-order) and `applyStage()` toggles `setVisible` | Instant swap, no flash except the white-bg case above. Acceptable. |
| Shell webPreferences | `sandbox: false` on the shell | Not a UI issue; note for security review. |

Nativeness: **6.5/10**. Right primitives, missing the last-mile sync (theme, accent, title, fullscreen, background color, transitions).

---

## 4–5. Per-surface review and scores (1–10 vs Dia/macOS)

### Toolbar / address field — **5/10**
- **Bug:** `value={val || display}` (`Toolbar.tsx:51`) — a controlled input whose value falls back to the URL when empty, so **select-all + delete snaps the URL back**; the user cannot clear the field or type a query starting from empty. Fix: separate `editing` state; on focus seed `val = display`, on blur/Escape reset.
- Escape handler is a `window` listener that blurs *any* target (`Toolbar.tsx:18-24`) — pressing Esc in the chat composer or palette input blurs it.
- Displays the raw URL minus `https://`; Dia shows **title + domain**, reveals the URL on hover/focus, and dims the path. No http/insecure treatment, no hover-revealed bookmark button (bookmark and inspector icons are permanent).
- Permanent "Vector" label (`Toolbar.tsx:135`) is noise 99% of the time; show only when `backend === "chrome"`.
- Three text-label segmented control (Focus/Overview/Table) in the toolbar is a workspace-mode picker, not a browser control; Dia has nothing like it in the toolbar. Move to the sidebar footer or palette.
- `⌘K` hint is a clickable `<span>` (not a button, no keyboard access) (`Toolbar.tsx:60`).
- Good: proper `aria-label`s, disabled states, stop/reload swap, 32px hit targets, drag region with no-drag controls.

### Tab rail (sidebar) — **5/10**
- **Tabs are `<div onClick>` with no `tabIndex`/`role`** (`Sidebar.tsx:18-27`) — unreachable by keyboard, `.sb-tab:focus-visible` (styles.css:133) never fires. Sets *are* `<button>`s → inconsistent.
- No drag-to-reorder, no pinned tabs, no hover URL preview, no tab context menu (see §3), no close-on-middle-click feedback.
- `.sb-tabs` is a drag region (styles.css:300); wheel-scrolling over empty rail area is at the mercy of Electron's drag-region event swallowing, and right-click there does nothing.
- Collapse: `width → 0` with children fixed at `--sb-w` and `overflow: hidden` — content is clipped, not slid. Meanwhile `.sb-closed .toolbar { padding-left: 80px }` **jumps instantly at t=0** while the sidebar is still animating for 200ms → toolbar controls hop right then the sidebar finishes closing. Animate the padding or, better, translate the sidebar and keep the traffic-light inset in a fixed toolbar element.
- Active tab is a solid `--bg-2` block with inset hairline — reads as a card, not a selection pill; Dia uses a translucent tinted pill and extends page colour into it.
- Loading spinner is a 12px CSS ring at 700ms linear — fine. Favicon fallback (globe) fine. Title 12px is small.
- `SiteTile` letter and favicon overlap (`SiteTile.tsx:16-17`); `.tile-letter` undefined.

### Command palette (⌘K) — **5.5/10**
- Functionally rich (URL/search/agent, sub-levels, sets, bookmarks) and keyboard-driven (arrows/enter/esc, scrollIntoView). 17px input is right.
- **Bug:** Escape in a sub-level (Chrome picker / split picker) calls `back()` (`Palette.tsx:243`) **and** bubbles to `App.tsx:249` which closes the whole overlay. `stopPropagation` needed.
- Zero accessibility: items are `<div>`s, no `role="listbox"/"option"`, no `aria-activedescendant`, input has no `aria-label`.
- No enter animation (undefined `.fade-in`), heavy 38% black scrim — Dia/Raycast use no scrim or a very light one.
- Shortcut hint `k` is rendered **left of the label** (`Palette.tsx:254`) — should be right-aligned; description `d` is right-aligned lowercase API names ("runs.start on the active page", "sets.create from tabs") — leaks implementation vocabulary to users.
- Flat list, no section headers or icons; commands, sets and bookmarks interleave; hard `slice(0, 20)`; substring match only, no fuzzy/recency ranking.
- `onMouseEnter → setSel` makes the selection jump when the list scrolls under a stationary cursor.
- Focus is not restored to the previous element on close.

### Agent inspector / chat (Rail) — **4/10** (the biggest gap to Dia)
- It *is* a bolted-on panel: opaque `--bg-1-solid` (styles.css:417) while sidebar/toolbar are glass; header says "Agent"; thread list is a toggle in the header rather than a first-class surface.
- Assistant turns are **run-status cards**: `st` badge ("completed"/"partially completed"), `impl-badge`, "0-model" badge, "12 steps · 3 calls" meta, chevron to raw step rows with mono op names and millisecond timings (`Rail.tsx:69-103`). Dia's reply is prose with citations; the machinery is hidden behind a disclosure at most. Keep the detail but demote it: default collapsed, one quiet "Show work" affordance.
- **Replies are not selectable** (global `user-select: none`); results are `JSON.stringify`'d (`Rail.tsx:111,113`); no markdown rendering; no streaming text.
- User bubble is solid accent with 12/12/4/12 radius (iMessage) — fine, but no `overflow-wrap: anywhere` → long URLs overflow the bubble (styles.css:448).
- Auto-scroll to bottom fires on *any* step/prompt change (`Rail.tsx:217-220`) even when the user has scrolled up to read — needs a "near bottom" guard.
- No empty-state illustration/suggestions; copy "Ask Vector to work this page. Browsing stays in the address field." is defensive. Dia shows contextual prompt chips and a brand moment.
- No @-mention / tab-context attachment UI, no stop button in the composer while a run is live (only on the card), no "answer required" highlight beyond an inline field.
- Composer: 34px accent send button, Enter/Shift+Enter correct, auto-grow to 96px — good. Composer doesn't disable/queue-indicate when a run is live except via a "queued" tag later.
- Resize: 272–560, dbl-click reset, persisted — good.

### Activity shelf — **4/10**
- A permanent 28px strip at the bottom of the stage even when idle, showing "No activity" (`ActivityShelf.tsx:24-25`). That's a 28px tax on every page for a feature most sessions never use, and it's exactly the kind of "duplicative UI" Dia's design essay calls out. Auto-hide when idle; surface live count in the toolbar inspector button badge instead.
- Counts with `<b>` numbers are good ("never an invented percentage" is honoured). Timeline rows reuse `.tl-item` nicely.
- Buttons in the expanded body are `.btn.sm` text buttons ("Resume", "Pause", "Stop", "Results", "Inspect") — five buttons with no hierarchy.

### Results table — **5/10**
- Works: sort, filter, export, copy, open source. Empty state has a headline, body, CTA — good pattern.
- Header labels `st`, `source`, `observed` are cryptic; sort glyphs are text `▲▼` appended with a space (`ResultsTable.tsx:74`); `<th>` clickable without `aria-sort` or a button.
- `position: sticky; top: -16px` (styles.css:580) couples the header to the wrapper padding — a magic number that breaks if padding changes.
- URLs truncated by `.slice(0, 64)` instead of CSS ellipsis; every cell in mono → dense, developer-y. Use system font for values, mono only for IDs.
- No virtualization; fine up to a few hundred rows, will stutter beyond. No column resizing, no row selection.

### Find bar — **7/10**
- Best surface here: in-flow (page stays live, highlighting works), select-on-focus, Enter/Shift+Enter, n/N with tabular nums, "No results" in red, clean teardown clears highlights. 40px height, 460px max input.
- Fires `pages.find` on every keystroke with no debounce; main-process fallback does a full DOM tree walk (index.ts:210-220) — slow on large pages.
- No enter animation; icon buttons 22px are a little small for the bar's 40px height.
- Escape is also caught by `App.tsx:249` — harmless here but duplicated.

### New tab page — **3/10**
- "New Tab / Type an address or search above. / [Focus address field]" (`App.tsx:27-35`). A button whose only job is to focus another control is an anti-pattern; the omnibox is already focused on mount. Dia's NTP is the product's front door: a large centred "Ask or search" field with routing, and favourites.
- Favourites only render if bookmarks exist; 32px tiles in a wrapped row with no labels.
- Recommend: centred 44px input styled like the omnibox (same `--r-*`), favourites grid with labels, recent chats/sets below.

### Settings — **4/10**
- 400px fixed drawer with 12 inline styles; theme toggle labels are lowercase `dark`/`light`; no **System** option; "Clear history" is destructive with no confirmation and no toast.
- Number inputs and raw URL template ("%s is replaced by the query") are power-user-only; Dia hides model config entirely.
- Native `<select>` is acceptable in Electron/macOS, but the rest of the controls (inputs at 7px/9px padding) don't match macOS field metrics (22px height, 5px radius).
- No focus set on open, no focus restore on close, hard cut in/out. "Saved" indicator is an 11px inline span.
- Positives: never re-seeds the masked key; probe/import feedback inline.

### History — **4/10**
- Reuses the palette shell (good visual consistency) but **no keyboard navigation** — arrows/Enter do nothing, only click works. `key={i}`. No grouping by day, no favicon, full `toLocaleString()` timestamps, no delete-entry, fetch on every keystroke without debounce, and the empty state can't distinguish "no history" from "no matches".

### Downloads — **5/10**
- In-flow shelf (page stays live) with Open/Reveal — sensible. Raw state strings ("progressing", "interrupted") shown to users; no progress bar, no cancel, no clear-completed, no per-item icon by type. Safari/Dia use a toolbar popover; a bottom shelf is Chrome-2015.

### Overview (tab grid) — **6/10**
- Nice cards, hover lift, active outline, set-mode variant. But polls `capturePage()` for **every tab every 4s** while open (`Overview.tsx:48`) — CPU/GPU cost for a mode most users won't leave open; capture once on entry and on tab change instead. Not a Dia feature at all — consider whether it earns its place in the toolbar.

### Toasts — **3/10** (because they're invisible)
- `.toasts` is `position: fixed; bottom: 38px; left: 50%` (styles.css:669) — squarely inside the stage rect, which the native `WebContentsView` covers whenever a page is showing. **"Bookmarked", "History cleared", and every `errToast` are hidden behind the page** in the common case. Move toasts into the toolbar (Dia-style inline status) or the rail/sidebar, or hide the view briefly — anywhere outside the stage rect.

---

## 6. Findings ranked

### P0 — broken or badly misleading
1. **Toasts render behind the native page.** `styles.css:669-676`, `App.tsx:309-313`. Fix: position toasts over the sidebar or as a toolbar status chip; never inside `#stage`'s rect.
2. **Address field cannot be cleared / edited from empty.** `Toolbar.tsx:51` `value={val || display}`. Fix: explicit `editing` flag; seed `val` from `display` on focus; render `display` only when not editing.
3. **`.fade-in` undefined** → palette/settings/history/inspector/find/downloads all hard-cut. `Settings.tsx:65`, `History.tsx:15`, `Inspector.tsx:47`, `FindBar.tsx:30`, `Downloads.tsx:17`, `ResultsTable.tsx:91`. Fix: add `.fade-in { animation: fade 160ms var(--ease) }` + a `slide-in` for drawers; honour reduced-motion (already global).
4. **Sidebar tabs unreachable by keyboard.** `Sidebar.tsx:18` `<div onClick>`. Fix: `<button role="tab" aria-selected>` inside `role="tablist"`, arrow-key navigation, `aria-label` on the close button already exists.
5. **Agent replies can't be selected or copied.** `styles.css:120` `user-select: none` on body. Fix: opt-in `user-select: text` on `.chat-reply`, `.chat-result`, `.tl-detail`, table cells, palette descriptions.

### P1 — visible polish/native-feel defects
6. **Theme doesn't follow system; native material and DOM theme can disagree.** `App.tsx:68`, `Settings.tsx:75`, no `nativeTheme` in main. Fix: add `system` option (default), resolve via `nativeTheme.shouldUseDarkColors` + `updated` event, and set `nativeTheme.themeSource` from the setting so vibrancy matches.
7. **Accent colour hardcoded.** `styles.css:58,94`. Fix: `systemPreferences.getAccentColor()` + `accent-color-changed` → push to renderer → set `--accent` (derive `--ring`, `--selection`, `--accent-soft` via `color-mix()`).
8. **White flash on new/loading page views in dark mode.** `native-views.ts:53-61` never sets background. Fix: `view.setBackgroundColor(stageBg)` at creation and on theme change.
9. **Overlay open/close is a hard cut with a one-frame bare stage.** `store.ts:130-133` hides the view before React paints the scrim. Fix: capture → paint snapshot into `#stage` → animate scrim in → hide view; reverse on close.
10. **Toolbar padding jumps at t=0 during sidebar collapse.** `styles.css:285-286` vs `:276`. Fix: animate `padding-left` with the same 200ms curve, or move the traffic-light inset to a fixed-position spacer.
11. **Palette Escape in sub-level closes the whole palette.** `Palette.tsx:243` + `App.tsx:249`. Fix: `e.stopPropagation()` in palette when it handled Esc, or have App ignore Esc when `e.defaultPrevented`.
12. **Global Escape blur from OmniBox.** `Toolbar.tsx:18-24`. Fix: scope to the input's own `onKeyDown`.
13. **Permanent activity bar when idle.** `ActivityShelf.tsx:24`. Fix: render nothing when `idle && !shelfOpen`; show a small badge on the inspector toolbar button when live.
14. **Focus ring is a hard 2px web outline.** `styles.css:128-132`. Fix: `outline: none; box-shadow: 0 0 0 3px var(--ring)` with radius following the control (`border-radius: inherit`).
15. **Custom always-visible scrollbars.** `styles.css:135-138`. Fix: delete; let macOS overlay scrollbars apply (Electron respects the system setting when unstyled).
16. **Traffic lights 2px low; fullscreen leaves 80px dead inset; window title static.** `index.ts:529`, no fullscreen handlers, no `setTitle`. Fix: `y: 20`; on `enter-full-screen` send `fullscreen:true` and set `--traffic-inset: 12px`; `win.setTitle(activePage.title)` on activation/title change.
17. **Rail auto-scroll hijacks reading position.** `Rail.tsx:217-220`. Fix: only scroll if `scrollHeight - scrollTop - clientHeight < 80`.
18. **Palette a11y.** `Palette.tsx:249-258`. Fix: `role="listbox"`, `role="option"`, `aria-selected`, `aria-activedescendant` on the input, `aria-label`.
19. **Right-click on a tab shows page menu.** `App.tsx:262-267`. Fix: `ui.contextMenu("tab", pageId)` with Close / Close Others / Duplicate / Copy URL / Pin.
20. **Find fires IPC per keystroke; DOM walk fallback.** `FindBar.tsx:37`, `index.ts:210-220`. Fix: 80ms debounce in `find()`.

### P2 — refinement
21. Duplicate type tokens (`--fs-xs`==`--fs-sm`), missing 8px radius token, 28 off-grid px values. `styles.css:8-9,22-26`, listed in §2.
22. Two segmented-control styles; unify `.mode-seg`/`.seg` into one `.segmented` with 2px inset, 28px height, 6px inner radius, 0.5px hairline.
23. `button { cursor: pointer }` → `default` for native feel (`styles.css:124`).
24. `backdrop-filter` redundant with window vibrancy; remove or drop native vibrancy (`styles.css:274,362`).
25. Sidebar/rail animate `width` (reflow + per-frame IPC). Use `transform` for collapse; keep `width` static (`styles.css:276,419`).
26. Overview polls `capturePage` every 4s (`Overview.tsx:48`).
27. Results table: header labels, `aria-sort`, CSS ellipsis instead of `.slice(0,64)`, `top:-16px` sticky hack (`ResultsTable.tsx:74,127-131,140`, `styles.css:580`).
28. History: keyboard nav, day grouping, favicons, relative times, `key={i}` (`History.tsx:20-28`).
29. Settings: System theme, capitalised labels, destructive confirm, remove 12 inline styles, macOS field metrics (`Settings.tsx:75,225`).
30. `SiteTile` letter/favicon overlap; define `.tile-letter`; hide letter `onLoad` (`SiteTile.tsx:16-17`).
31. `kbd` 3D keycap → flat pill (`styles.css:205-209`).
32. `minWidth 1100` → ~800 (`index.ts:524`).
33. `document.querySelector(".omnibox input")` ×3 → store-held ref or a `focusOmni` event (`App.tsx:21,32,232`).
34. `.chat-bubble.user` needs `overflow-wrap: anywhere`; `.chat-result-row .v` needs it too (`styles.css:448,464`).
35. Palette `d` strings expose API names ("runs.start", "sets.create", "chrome.attach") — rewrite as user language (`Palette.tsx:92,151,158,183,184`).

---

## 7. Top 10 changes for Dia-level polish (highest visual impact per effort first)

1. **Define the missing motion (`.fade-in`, drawer slide, scrim fade) and sequence overlay hide/show behind a snapshot.** Half a day; removes every hard cut in the app. (Findings 3, 9)
2. **Follow system appearance and accent.** `system` theme default + `nativeTheme.themeSource` + `systemPreferences.getAccentColor()` → `--accent`/`--ring`/`--selection` via `color-mix()`. One day; instantly "feels like my Mac". (6, 7)
3. **Make the rail a chat, not an inspector.** Same glass material as the sidebar; prose replies first, selectable; status/steps/model badges behind one "Show work" disclosure; markdown rendering; contextual suggestion chips in the empty state; a stop button in the composer while live. Two to three days; this is where Dia spends its novelty budget. (5, 17, 34)
4. **Fix the toolbar: clearable address field showing title + domain, hover-revealed URL and bookmark button, drop the permanent "Vector" label, move Focus/Overview/Table out of the toolbar.** One day. (2, 12; §4 toolbar)
5. **Hide the activity shelf when idle; badge the inspector button instead.** Two hours; returns 28px to every page and removes the most un-Dia element on screen. (13)
6. **Rebuild the new tab page around a centred ask/search field with labelled favourites.** One day; it is the first thing every new user sees. (§4 NTP)
7. **Native details pass:** `setBackgroundColor` on page views, traffic light `y:20`, fullscreen inset, `setTitle`, `cursor: default`, overlay scrollbars, soft `--ring` focus ring, min window 800×600. Half a day; each is tiny, together they are the difference between "Electron app" and "Mac app". (8, 14, 15, 16, 23, 32)
8. **Keyboard + a11y sweep:** tabs as `role=tab` buttons with arrow nav, palette listbox semantics, history arrow/Enter, focus restore on overlay close, scoped Escape handling. One day. (4, 11, 18, 28)
9. **Grid & token discipline:** collapse the 28 off-grid values to `--space-*`, add `--r-8`, dedupe `--fs-xs/--fs-sm`, unify the two segmented controls, kill inline styles in Settings/Inspector. Half a day; compounds across every surface. (21, 22, 29)
10. **Tab rail interactions:** translucent selection pill, drag-reorder, tab context menu, sidebar collapse via `transform` with the toolbar inset animating in step, 13px titles. One to two days. (10, 19, 25)
