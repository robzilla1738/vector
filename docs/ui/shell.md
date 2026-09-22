# Aux desktop shell

This is the product GUI (`pnpm dev`): one native desktop window with embedded
page views, browser chrome, workspace, and agent rail.

The renderer in `apps/desktop/renderer/src` is the browser chrome around the
runtime's pages: Aside-inspired sidebar, top command bar, continuous rounded
main surface and resizable agent rail. It is React 19 + zustand, styled with
plain CSS and shared tokens (Geist/Geist Mono, Central Icons, neutral surfaces).
The current spec is [visual direction](../AUX-DESIGN-DIRECTION.md); verification
limits are in [Aside parity](../ASIDE-PARITY.md).
Nothing in the shell talks to Electron except through the preload
`contextBridge` (`bridge.ts`); `sandbox: true` and the permission handlers in
`main/` are unchanged by the redesign.

```
.app
├── .degraded                     runtime-disconnected banner (full width, only when offline)
└── .app-body
    ├── .sidebar                  pins · bookmarks · chats · tabs/folders · space footer
    │                             fully hidden or floating edge-hover peek when closed
    └── .main-col
        ├── .toolbar              loaded page: out of flow until top-edge hover or focus; otherwise a 40px row
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
| `components/Sidebar.tsx` | Space switcher, row-filling pins, collapsible bookmarks/chats/tabs, tab folders, drag-reorder, fully hidden mode with floating edge peek, tab/folder context menus. A web tab dropped on Bookmarks is saved |
| `components/Toolbar.tsx` | On a loaded page the row is out of the layout until the pointer reaches the top or the field is focused. Back/forward/reload, `CommandBar`, the controller chip, overview, bookmark and the rail toggle reveal together. Touch keeps the row in the layout. ⌘L still focuses it |
| `components/CommandBar.tsx` | One field for URL / search / agent prompt; intent chip; suggestion popover (open tabs, recent, saved programs, run again) |
| `intent.ts` | Pure intent detection shared by command bar, palette and tests |
| `components/Stage.tsx` | Inset rounded card; load progress line; `EngineBadge`; empty / loading / crashed / disconnected messages; `StartPage` for blank tabs; `EngineView` (`pages.capture`) for engine pages; `MockPage` in mock mode |
| `components/EngineBadge.tsx`, `engine.ts` | Chromium / Your Chrome / Vector Engine badge with hover card (route reason, route ms, first paint) |
| `components/AgentRail.tsx` | Rail chrome, home view (live, sets, searchable past runs — virtualized at 30+), composer, `ResizeHandle` |
| `components/RunPanel.tsx` | Goal, status/elapsed/model calls/cost, page chip, takeover banner + Return control, needs-input prompt, final answer with copy, `StepTimeline`, `ObservationPanel` |
| `components/Conversation.tsx` | Chat transcript and composer. A web-tab context shows that page's preview beside the messages as soon as the chat opens. The globe hides it. The preview is a sibling of the message column and hides when the chat column is under 900px |
| `components/StepTimeline.tsx` | Steps with outcome, duration, detail, inspect-observation affordance |
| `components/ObservationPanel.tsx` | Compact observation: title/url/viewport, headings, refs, raw text |
| `components/SetPanel.tsx` | Set status, per-member segmented bar, member grid, failed list, Results |
| `components/Palette.tsx` | ⌘K: intent routing, tab switch, agent/window/spaces/sets/chrome/bookmarks commands, two-level pickers (split view, borrow a Chrome tab) |
| `components/StartPage.tsx` | Aux arch mark, Search/Ask field, recent chats and routines |
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
| ⌘S | Hide / expand sidebar (no logo strip; edge-hover peek) |
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
Opening that menu leaves the loaded page painted: the stage moves aside for
the menu, and the menu does not cover the page with the shell overlay.

## Design tokens (`tokens.css`)

Every colour, radius, size and duration used by `styles.css` is a custom
property defined once in `tokens.css`. Components never introduce literals.

- **Type** — Geist Variable and Geist Mono; 14px interface default with user scaling;
  line heights `--lh-tight|normal|relaxed`; tracking `--tracking-tight|snug|wide`.
- **Icons** — Central Icons at `--ico-sm 14` / `--ico 16` / `--ico-lg 20`.
  Folders and sidebar toggles share the same icon family.
- **Spacing** — 4 px grid, `--space-0 … --space-9` (2 → 56 px).
- **Radii** — shared reference tokens, 0.5px hairlines and 1.4 squircle factor.
- **Shell metrics** — `--toolbar-h 40`, fully closed sidebar width 0;
  both panels are user-resizable and their widths persist in
  localStorage `vector.sb-w` / `vector.rail-w`. Controls are 28/32px;
  `--traffic-inset 80` (macOS traffic lights). On a loaded page the native
  view radius is 0 so the page sits flush; the rounded edge is `.main-col`,
  with a 14px radius on the stage card in horizontal tabs. The window glass
  matches the window corner radius and stays unclipped, so the corner stays
  clear. The home Tab hint matches the Search and Ask pills (26px, medium
  weight, same radius and fill).
- **Motion** — `--t-fast 150`, `--t-med 150`, `--t-slow 240` ms; toolbar reveal 180ms; eases
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

- **Empty** — no tabs: sidebar hint + `StartPage` (Aux mark, Search/Ask field,
  recent chats/routines). No runs: rail home explains where
  the agent works.
- **Loading** — 2 px sweeping progress line at the top of the stage card; tab
  favicon becomes a spinner.
- **Disconnected** — full-width warning banner with *Reconnect now*; composer
  disabled; rail shows *offline*; stage shows *Waiting for the runtime*.
- **Long titles** — single-line ellipsis everywhere (tab rows, run rows, command
  bar title, member labels); full text in `title` tooltips.
- **40+ tabs** — the tab list virtualizes at 28 rows (`VirtualList`, 32 px
  rows); past runs virtualize at 30. Hidden mode has no persistent icon rail.
- **Narrow** — ≤ 1100 px the agent rail clamps to 340 px and an expanded
  sidebar can close while the agent rail is open. ≤ 1000 px the command bar takes
  more of the toolbar and the control chip drops its label. ≤ 820 px the
  sidebar and rail float over the stage as glass panels.
- **Controller** — a status chip marks agent vs human control; taking over
  shows *You're in control · Return* (toolbar when visible, otherwise the
  sidebar / run panel). The stage card does not use a colored agent ring.
  A page an agent is driving stays laid out when it is not the visible tab.
  A conversation preview keeps its own hold, so the capture cannot release
  that lease, and releasing the lease cannot hide a page the preview is
  still capturing.

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
| `sidebar` | `expanded`, `hidden`; legacy `rail` normalizes to hidden |
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
  `favicon.test.ts`, `EngineView.test.tsx`, `StepTimeline.test.tsx` and
  `ObservationPanel.test.tsx`. Repo unit tests also cover toolbar-edge
  geometry, bookmark drop, stage clearance beside a menu, and the separate
  preview and agent-stage holds (`tests/unit/toolbar-edge.test.ts`,
  `bookmark-drop.test.ts`, `stage-obstruction.test.ts`,
  `offscreen-holds.test.ts`).
- `tests/unit/chrome-tokens.test.ts` — token and chrome CSS contracts
  (native material layering, row-filling pins, coordinated toolbar reveal).

## Runtime contract dependencies

`engine.ts` was written against the pre-engine contract and keeps local
unions (`EngineBackend`, `EngineMode`, `EngineRoute`) plus a defensive
`engineOf(page)` reader. On `m1/integrate` the contract has landed, so the
runtime now emits what the shell reads:

- `Backend` / `PageTarget.backend` is `"vector" | "chrome" | "vector-engine"`
  (`contracts/ids.ts`, `BackendSchema`) — the badge shows *Chromium*, *Your
  Chrome* or *Vector Engine* from it.
- `settings.engineMode: "off" | "auto" | "always"` (desktop default `auto`)
  is in `SettingsSetParams`
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
