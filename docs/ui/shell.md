# Vector desktop shell

The renderer in `apps/desktop/renderer/src` is the browser chrome around the
runtime's pages: an Arc-style sidebar, a command bar in that sidebar, an inset
stage card, and a resizable agent rail. It is React 19 + zustand, styled with
plain CSS on a single token sheet (Inter Variable, Lucide icons, charcoal).
Nothing in the shell talks to Electron except through the preload
`contextBridge` (`bridge.ts`); `sandbox: true` and the permission handlers in
`main/` are unchanged by the redesign.

```
.app
├── .degraded                     runtime-disconnected banner (full width, only when offline)
└── .app-body
    ├── .sidebar                  spaces · 5 pin tiles · folders · unfiled tabs · footer
    │                             CommandBar lives here when the sidebar is expanded
    └── .main-col
        ├── .toolbar              only when the sidebar is hidden: nav · CommandBar · chrome
        └── .main
            ├── .stage-wrap       FindBar? · Stage (.stage-card) · Downloads?
            └── .rail             AgentRail (RunPanel | SetPanel | home) + composer
```

Overlays (`Palette`, `Settings`, `History`, `Inspector`) are portalled siblings
of `.app-body`; toasts sit bottom-left over the sidebar.

## Component map

| File | Role |
| --- | --- |
| `App.tsx` | Frame, shortcut dispatch (renderer + main-process shortcuts), stage-rect reporting to the native view, `narrow` media query |
| `components/Sidebar.tsx` | Space switcher, 5-up pin row, 📁 tab folders (indent, group hover, WAAPI open/close), unfiled tabs under New Tab, drag-reorder, collapsed rail with hover-peek, tab/folder context menus. Hosts `CommandBar` when expanded |
| `components/Toolbar.tsx` | Shown only when the sidebar is hidden: back/forward/reload, `CommandBar`, controller chip, overview, bookmark, rail toggle |
| `components/CommandBar.tsx` | One field for URL / search / agent prompt; intent chip; suggestion popover (open tabs, recent, saved programs, run again) |
| `intent.ts` | Pure intent detection shared by command bar, palette and tests |
| `components/Stage.tsx` | Inset rounded card; load progress line; `EngineBadge`; empty / loading / crashed / disconnected messages; `StartPage` for blank tabs; `MockPage` in mock mode |
| `components/EngineBadge.tsx`, `engine.ts` | Chromium / Your Chrome / Vector Engine badge with hover card (route reason, route ms, first paint) |
| `components/AgentRail.tsx` | Rail chrome, home view (live, sets, searchable past runs — virtualized at 30+), composer, `ResizeHandle` |
| `components/RunPanel.tsx` | Goal, status/elapsed/model calls/cost, page chip, takeover banner + Return control, needs-input prompt, final answer with copy, `StepTimeline`, `ObservationPanel` |
| `components/StepTimeline.tsx` | Steps with outcome, duration, detail, inspect-observation affordance |
| `components/ObservationPanel.tsx` | Compact observation: title/url/viewport, headings, refs, raw text |
| `components/SetPanel.tsx` | Set status, per-member segmented bar, member grid, failed list, Results |
| `components/Palette.tsx` | ⌘K: intent routing, tab switch, agent/window/spaces/sets/chrome/bookmarks commands, two-level pickers (split view, borrow a Chrome tab) |
| `components/StartPage.tsx` | Weather, command bar, suggested prompts, favourites, recent |
| `components/VirtualList.tsx` | Fixed-row-height windowed list used by the tab list and past runs |
| `components/Overview.tsx`, `ResultsTable.tsx`, `History.tsx`, `Settings.tsx`, `Inspector.tsx`, `FindBar.tsx`, `Downloads.tsx` | Secondary surfaces restyled on the tokens |
| `favicon.ts` | Favicon candidate chain (page icon → DuckDuckGo → Google s2) + host letter |
| `workspace.ts` | Spaces / pins (cap 5) / folders / tab order (persisted in localStorage), `hostOf` |
| `store.ts` | zustand workspace: runtime snapshot + events, UI state (mode, overlay, sidebar mode, rail view, widths, `narrow`) |
| `mock/bridge.ts`, `mock/fixtures.ts` | Scripted bridge for browser-only development and screenshots |

## Shortcuts

Handled in `App.tsx` (`dispatchShortcut`), both from the renderer `keydown`
listener and from the main-process accelerator relay.

| Keys | Action |
| --- | --- |
| ⌘L / ⌘E | Focus the command bar (selects the URL) |
| ⌘K | Command palette |
| ⌘T | New tab · ⌘⇧T reopen last closed |
| ⌘W | Close overlay → close tab → close window |
| ⌘1…⌘8, ⌘9 | Tab N in this space, last tab |
| ⌃Tab / ⌃⇧Tab, ⌘⌥← / → , ⌘⇧[ / ] | Cycle tabs |
| ⌘⇧A | Toggle agent rail |
| ⌘⇧O | Tab overview |
| ⌘S | Collapse / expand sidebar (rail with hover-peek) |
| ⌘D / ⌘⇧D | Bookmark page / bookmark all tabs |
| ⌘F, ⌘G / ⌘⇧G | Find in page, next / previous match |
| ⌘R / ⌘⇧R | Reload / hard reload |
| ⌘[ / ⌘], ⌥← / ⌥→ | Back / forward |
| ⌘+ / ⌘− / ⌘0 | Zoom |
| ⌘Y, ⌘⇧J, ⌘, | History, downloads, settings |
| ⌘O, ⌘P | Open file, print |
| ⌘⌥I, ⌘⇧C, ⌘⌥U | DevTools, DevTools, view source |
| ⌘⇧⌫ | Clear history |
| Esc | Close the current overlay |

Inside the command bar: `↑/↓` move through suggestions, `↵` runs the selected
suggestion (or the detected intent), `Tab` on a run intent flips the scope
between "on this page" and "in a new tab", `Esc` restores the page URL.
Prefixes: `/` command, `>` force a run, `?` force a search.

Sidebar tab rows are a roving-tabindex `tablist`: `↑/↓` move focus,
`⌥↑ / ⌥↓` reorder, `⌫` closes, middle-click closes, right-click opens the
context menu (reload, duplicate, copy URL, pin, move to space, close others).

## Design tokens (`tokens.css`)

Every colour, radius, size and duration used by `styles.css` is a custom
property defined once in `tokens.css`. Components never introduce literals.

- **Type** — `--font-ui` (`Inter Variable` → Inter → system), `--font-mono`;
  sizes `--fs-2xs … --fs-3xl` = 11 / 12 / 12 / 13 / 15 / 18 / 22 / 28 px;
  line heights `--lh-tight|normal|relaxed`; tracking `--tracking-tight|snug|wide`.
- **Icons** — Lucide stroke at `--ico-sm 14` / `--ico 16` / `--ico-lg 20`.
  Folder rows use the 📁 emoji, not a stroke folder.
- **Spacing** — 4 px grid, `--space-0 … --space-9` (2 → 56 px).
- **Radii** — `--r-xs … --r-2xl` = 4 / 6 / 8 / 10 / 12 / 16 px, `--r-pill`.
- **Shell metrics** — `--toolbar-h 52`, `--sidebar-w 240`, `--sidebar-rail-w 56`,
  `--rail-w 360` (both panels are user-resizable; widths persist in
  localStorage `vector.sb-w` / `vector.rail-w`), `--stage-inset 8`,
  `--stage-radius` (`--r-2xl`), `--control-h 28`, `--control-h-lg 34`, `--hit 32`,
  `--traffic-inset 80` (macOS traffic lights).
- **Motion** — `--t-fast 120`, `--t-med 180`, `--t-slow 240` ms; eases
  `--ease-out`, `--ease-spring`, `--ease-in-out`. `prefers-reduced-motion`
  zeroes the durations and collapses every animation/transition to 0.01 ms.
  `prefers-reduced-transparency` removes the backdrop blurs.
- **Colour** — two appearances, `[data-theme="dark"|"light"]`. Dark chrome
  `--sb-bg` / `--bg-window` / `--stage-frame` is `#1f1f1f` so the stage floats
  in an even gutter. Surfaces `--bg-0 … --bg-3`, `--bg-hover/active`, glass,
  hairlines `--line`, `--line-strong`, `--line-inset`; ink `--ink-0 … --ink-3`,
  `--ink-inverse`; accent is the inverse of the canvas (no purple agent tint,
  no teal engine tint — `--agent` and `--engine` follow ink). Semantic
  `--ok`, `--warn`, `--err` keep distinct hues.
- **Space identity** — `[data-space="blue|violet|pink|orange|green|teal|slate"]`
  sets `--space-color` to grayscale steps, not a rainbow.
- **Z** — `--z-stage < --z-panel < --z-peek < --z-scrim < --z-drawer < --z-toast`.

## States

- **Empty** — no tabs: sidebar hint + `StartPage` (weather, command bar,
  suggested prompts, favourites, recent). No runs: rail home explains where
  the agent works.
- **Loading** — 2 px sweeping progress line at the top of the stage card; tab
  favicon becomes a spinner.
- **Disconnected** — full-width warning banner with *Reconnect now*; composer
  disabled; rail shows *offline*; stage shows *Waiting for the runtime*.
- **Long titles** — single-line ellipsis everywhere (tab rows, run rows, command
  bar title, member labels); full text in `title` tooltips.
- **40+ tabs** — the tab list virtualizes at 28 rows (`VirtualList`, 32 px
  rows); the collapsed rail caps at 40 tiles; past runs virtualize at 30.
- **Narrow** — ≤ 1100 px the agent rail clamps to 340 px and an expanded
  sidebar folds to its rail while the agent rail is open (the rail's expand
  button then closes the agent rail instead). ≤ 1000 px the command bar takes
  more of the toolbar and the control chip drops its label. ≤ 820 px the
  sidebar and rail float over the stage as glass panels.
- **Controller** — a status chip marks agent vs human control; taking over
  shows *You're in control · Return* (toolbar when visible, otherwise the
  sidebar / run panel). The stage card does not use a colored agent ring.

## Accessibility

Roles: `tablist`/`tab` for tabs and spaces, `listbox`/`option` +
`combobox` for the palette and command-bar suggestions, `dialog` for sheets and
the palette, `menu`/`menuitem` for menus, `alert` for the degraded banner,
`status` for the takeover banner, `aria-live` toasts. Focus is visible on every
control (`:focus-visible` ring shaped by the control); roving tabindex in the
tab list; Esc closes menus, pickers and overlays and returns focus to where it
came from. Icons carry `aria-label`s or are `aria-hidden` decorations.

## Mock mode

`pnpm -C apps/desktop dev:mock` runs `vite --mode mock` on `127.0.0.1:5197`
with a scripted bridge, so the shell can be developed and reviewed in a plain
browser. Query parameters:

| Param | Values |
| --- | --- |
| `scenario` | `start`, `browsing` (default), `run`, `takeover`, `needs-input`, `set`, `many` (45 tabs), `disconnected` |
| `theme` | `dark` (default), `light` |
| `sidebar` | `expanded`, `rail`, `hidden` |
| `rail` | `1` opens the agent rail on the live run |
| `live` | `1` keeps streaming new steps into the run |
| `sbw`, `railw` | initial sidebar / rail widths in px |
| `engine` | `off`, `auto`, `always` — mocked `settings.engineMode` |

Screenshots: with the mock server running,
`node apps/desktop/scripts/screenshots.mjs [outDir] [only]` renders the
fifteen reference states in `docs/ui/screenshots/` with Playwright (1440×900
@2x, plus a 900×700 narrow capture).

## Tests and gates

- `pnpm -C apps/desktop typecheck` — main, preload and renderer.
- `pnpm -C apps/desktop build` — tsc + esbuild bundle + vite build.
- `pnpm -C apps/desktop test` — vitest: `intent.test.ts` (command-bar intent
  detection), `workspace.test.ts` (space / tab / pin / folder reducers),
  `favicon.test.ts`, `StepTimeline.test.tsx` and `ObservationPanel.test.tsx`.
- `tests/unit/chrome-tokens.test.ts` — token and chrome CSS contracts
  (sidebar/window match, 5-col pins, folder indent).

## Runtime contract dependencies

`engine.ts` was written against the pre-engine contract and keeps local
unions (`EngineBackend`, `EngineMode`, `EngineRoute`) plus a defensive
`engineOf(page)` reader. On `m1/integrate` the contract has landed, so the
runtime now emits what the shell reads:

- `Backend` / `PageTarget.backend` is `"vector" | "chrome" | "vector-engine"`
  (`contracts/ids.ts`, `BackendSchema`) — the badge shows *Chromium*, *Your
  Chrome* or *Vector Engine* from it.
- `settings.engineMode: "off" | "auto" | "always"` (default `auto`) is in `SettingsSetParams`
  and returned by `settings.get`; the Settings radio writes it through
  `settings.set` and the runtime applies it on the next `pages.open`.
- `PageTarget.routeReason` is set on every page (`pages.open` result,
  `workspace.get`, `page.added` / `page.updated` events) — the hover card
  shows it.
- `Run.config.implementation` / `routeReason` are read when present.

Still local to the shell: `EngineRoute.routeMs` and `firstPaintMs` (and the
`route` object they hang off) exist only in the mock bridge — the runtime
does not report them, so the hover card shows the reason alone on real
pages. The two `TODO(contracts)` comments (`engine.ts`, `Settings.tsx`) mark
where the local unions can collapse onto `@vector/contracts`.
