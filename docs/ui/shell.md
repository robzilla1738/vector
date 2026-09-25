# Aux desktop shell

This is the product GUI (`pnpm dev`): one native desktop window with embedded
page views, browser chrome, workspace, and agent rail.

The renderer in `apps/desktop/renderer/src` is the browser chrome around the
runtime's pages: Aside-inspired sidebar, top command bar, continuous rounded
main surface and resizable agent rail. It is React 19 + zustand, styled with
plain CSS and shared tokens (Geist/Geist Mono, Central Icons, neutral surfaces).
The current spec and verification gates are in the [reviewed roadmap](../ROADMAP.md). The [earlier visual direction](../archive/2026-09-24-b0-reset/AUX-DESIGN-DIRECTION.md) and [parity audit](../archive/2026-09-24-b0-reset/ASIDE-PARITY.md) are historical.
Nothing in the shell talks to Electron except through the preload
`contextBridge` (`bridge.ts`); `sandbox: true` and the permission handlers in
`main/` are unchanged by the redesign.

```
.app
├── .degraded                     runtime-disconnected banner (full width, only when offline)
└── .app-body
    ├── .sidebar                  pins · bookmarks · chats · tabs/folders · space footer
    │                             expanded column; collapsed-only inset edge preview in vertical mode
    └── .main-col
        ├── .toolbar              loaded page: out of flow until top-edge hover or focus; otherwise a 40px row
        └── .main
            ├── .stage-wrap       FindBar? · Stage (.stage-card) · Downloads?
            └── .rail             AgentRail (RunPanel | SetPanel | home) + composer
```

Overlays (`Palette`, `Settings`, `History`, `Inspector`) are portalled siblings
of `.app-body`; toasts sit bottom-left over the sidebar.

## Component map
See the [September 23 implementation checkpoint](../archive/2026-09-24-b0-reset/ui/design-update-2026-09-23.md)
for current behavior, storage scope, native input invariants and pickup checks.
The diagram above shows the vertical layout. Horizontal mode adds
`HorizontalTabs`/`HorizontalPins` above the URL row and a click-operated
`ChatSidebar`; it is the default for profiles without an explicit tab layout.

| Added/refined module | Responsibility |
| --- | --- |
| `HorizontalTabs.tsx`, `HorizontalPins.tsx` | Compact native-glass strip, corner joins, grouped tabs, pin activation |
| `TabPreview.tsx` | Delayed real capture, bounded card, stable page geometry |
| `ChatSidebar.tsx`, `ChatSessions.tsx`, `chat-folders.ts` | Shared chat projects, hover/focus actions and inline disclosures |
| `RecentWork.tsx`, `Tasks.tsx`, `Routines.tsx`, `RoutineSchedule.tsx` | Bounded cards, filters, empty states and schedule summaries |
| `use-window-drag.ts`, main `window-drag.ts` | Captured blank-area dragging with shell-only native IPC |
| main `sidebar-glass.ts`, `toolbar-glass.ts`, `windows/surface.ts` | Page blur, adaptive toolbar ink and native hit order |




| File | Role |
| --- | --- |
| `App.tsx` | Frame, shortcut dispatch (renderer + main-process shortcuts), stage-rect reporting to the native view, `narrow` media query |
| `components/Sidebar.tsx` | Space switcher, row-filling pins, collapsible bookmarks/chats/tabs, tab folders, drag-reorder, fully hidden mode. Expanded mode is a persistent column. Collapsed vertical edge hover floats an inset glass preview without changing page bounds. A web tab dropped on Bookmarks is saved |
| `components/Toolbar.tsx` | On a loaded page the row is out of the layout until the pointer reaches the top or the field is focused. A frost on the page fades out by the bottom of that row. Back/forward/reload, `CommandBar`, the controller chip, overview, bookmark and the rail toggle reveal together and stay clickable. Touch keeps the row in the layout. ⌘L still focuses it |
| `components/CommandBar.tsx` | One field for URL / search / agent prompt; intent chip; suggestion popover (open tabs, recent, saved programs, run again). The primary suggestion's enter mark is the same circular accent up-arrow as the composer send control. Other hints stay text keys |
| `intent.ts` | Pure intent detection shared by command bar, palette and tests |
| `components/Stage.tsx` | Inset rounded card; load progress line; empty / loading / crashed / disconnected messages; `StartPage` for blank tabs; `MockPage` in mock mode |
| `components/AgentRail.tsx` | Rail chrome, home view (live, sets, searchable past runs — virtualized at 30+), composer, `ResizeHandle` |
| `components/RunPanel.tsx` | Goal, status/elapsed/model calls/cost, page chip, takeover banner + Return control, needs-input prompt, final answer with copy, `StepTimeline`, `ObservationPanel` |
| `components/Conversation.tsx` | Chat transcript and composer. The chat surface is opaque, so a parked page underneath the shell cannot show through. A web-tab context shows a live preview of that page beside the messages as soon as the chat opens. The globe hides it. The preview is a sibling of the message column and hides when the chat column is under 900px. Clicking it offers Open in tab, and Split view only when `previewSplit` can pair the page with the current tab or another tab in the same Space. The composer is the reply field, dictation, and send; paste still adds images. With the sidebar hidden, the title uses the traffic-light inset |
| `components/StepTimeline.tsx` | Steps with outcome, duration, detail, inspect-observation affordance |
| `components/ObservationPanel.tsx` | Compact observation: title/url/viewport, headings, refs, raw text |
| `components/SetPanel.tsx` | Set status, per-member segmented bar, member grid, failed list, Results |
| `components/Palette.tsx` | ⌘K: intent routing, tab switch, agent/window/spaces/sets/chrome/bookmarks commands, two-level pickers (split view, borrow a Chrome tab) |
| `components/StartPage.tsx` | Aux arch mark, Search/Ask field, recent chats and routines |
| `components/VirtualList.tsx` | Fixed-row-height windowed list used by past runs. The sidebar tab list windows its loose tabs with `use-windowed-rows.ts` instead |
| `components/Skeleton.tsx` | Token-based placeholder rows for deferred surfaces and first list loads |
| `use-shortcut-label.ts` | Display chord for a command after the person's remaps; every visible shortcut hint goes through it |
| `use-dismissable.ts` | The Escape stack: the most recently opened menu, popover or dialog closes first |
| `components/Overview.tsx`, `ResultsTable.tsx`, `History.tsx`, `Settings.tsx`, `Inspector.tsx`, `FindBar.tsx`, `Downloads.tsx` | Secondary surfaces restyled on the tokens. Settings navigation is a quiet column with one selected row; preference fields group into rounded cards |
| `favicon.ts` | Favicon candidate chain (page icon → DuckDuckGo → Google s2) + host letter |
| `workspace.ts` | Spaces / pins (cap 5) / folders / tab order (persisted in localStorage), `hostOf`, `previewSplit` |
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
| ⌘S | Hide / expand sidebar; collapsed vertical edge hover previews an inset panel |
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

Colours, radii, type sizes, weights and durations in `styles.css` come from
custom properties defined once in `tokens.css`. Spacing uses the scale where a
value is on it; about 150 off-scale optical offsets (3/5/7/9/18px and similar)
remain literal. `tests/unit/chrome-tokens.test.ts` ratchets the literal counts,
so they can fall but never rise. `tokens.css` declares the cascade layers,
`reset, tokens, base, components, overrides`: element selectors live in `base`,
and the reduced-motion, reduced-transparency and increased-contrast rules live
in `overrides`. The final refinement rules near the end of styles.css override earlier geometry where needed; inspect the computed style when maintaining this cascade.

- **Type** — Geist Variable and Geist Mono; 14px interface default with user scaling
  (`--fs-2xs … --fs-3xl`); weights `--fw-regular 400`, `--fw-book 450`, `--fw-medium 500`,
  `--fw-strong 550`, `--fw-semibold 600`; line heights `--lh-tight|normal|relaxed`;
  tracking `--tracking-tight|snug|wide`.
- **Icons** — Central Icons at `--ico-sm 14` / `--ico 16` / `--ico-lg 20`.
  Folders and sidebar toggles share the same icon family.
- **Spacing** — 4 px grid, `--space-0 … --space-9` (2 → 56 px), plus the half steps
  `--space-1-5` 6, `--space-2-5` 10 and `--space-3-5` 14 used by dense rows.
- **Radii** — `--r-xs … --r-2xl` scale by the 1.4 squircle factor (`--r-sm` 4, `--r-md` 6,
  `--r-lg` 8, `--r-xl` 12, `--r-2xl` 16 before the factor). Round-cornered shapes use
  `--r-control` 10, `--r-card` 14 and `--r-composer` 20. Hairlines are 0.5px.
  Tab close targets and the suggestion send mark stay circular; the shared squircle does not flatten them.
- **Shell metrics** — `--toolbar-h 40`, fully closed sidebar width 0;
  both panels are user-resizable and their widths persist in
  localStorage `aux.sb-w` / `aux.rail-w`. Controls are 28/32px;
  `--traffic-inset 80` (macOS traffic lights). For the 40px toolbar the
  light position is `{ x: 16, y: 13 }`: `y` is the top of the 13px circles.
  A loaded page uses the main column's corner (`--stage-radius` is
  `--r-xl`; a hidden sidebar stays square). Horizontal tabs keep a 14px
  card radius in CSS. The window glass matches the window corner radius
  and stays unclipped. The home Tab hint matches the Search and Ask pills
  (26px, medium weight, same radius and fill). With the sidebar hidden, a
  full-page chat title uses the traffic-light inset.
- **Motion** — `--t-quick 100` (menus, scrims), `--t-fast 150` (hover and focus),
  `--t-reveal 180` (toolbar controls), `--t-slow 240` (layout), `--t-enter 480`
  (quick ask), `--t-slide 560` ms (the toolbar slides over a loaded page); loops
  use `--t-spin`, `--t-sweep` and `--t-pulse`. Eases `--ease-out`, `--ease-in-out` and
  `--ease-emphasized`. The toolbar keeps the shell raised until its slide's
  `transitionend`, so JavaScript does not copy CSS durations. Menus and popovers
  share one entrance (`menu-enter`); dialogs use `.pop-in`. `prefers-reduced-motion`
  zeroes the durations and collapses every animation/transition to 0.01 ms.
  `prefers-reduced-transparency` removes the backdrop blurs. Scrims are a solid
  translucent `--scrim`: a CSS blur never reaches the native page views.
  `prefers-contrast: more` strengthens secondary ink, lines, hairlines (1px) and
  the focus ring.
- **Colour** — two appearances, `[data-theme="dark"|"light"]`. Dark chrome
  `--sb-bg` / `--bg-window` / `--stage-frame` is `oklch(20.5% 0 0)` so the stage
  floats in an even gutter. Surfaces `--bg-0 … --bg-3` (dark popovers `--bg-2`
  share the `--bg-1` panel step; light lifts them to white), `--bg-hover/active`, glass,
  hairlines `--line`, `--line-strong`, `--line-inset`; ink `--ink-0 … --ink-3`,
  `--ink-inverse`; accent is the inverse of the canvas (no purple agent tint,
  no teal engine tint — `--agent` and `--engine` follow ink). Semantic
  `--ok`, `--warn`, `--err` keep distinct hues; their `-soft`/`-line` variants,
  `--selection` and the diff fills are `color-mix` of the base colour.
- **Space identity** — `[data-space="blue|violet|pink|orange|green|teal|slate"]`
  sets `--space-color` to a muted hue at one lightness per appearance
  (`--space-l`, `--space-c`), so swatches are distinct without competing with
  the blue accent. Nested swatches resolve the current appearance.
- **Z** — `--z-stage < --z-panel < --z-peek < --z-scrim < --z-drawer < --z-toast`.

## States
The full-page **new conversation** state centers a 56px subdued Aux mark and
uses a bottom composer capped at 880px, with a compact context row. It is separate
from the StartPage search hero and from embedded or populated conversation views.
Chat Projects are session folders, not repository workspaces. Jump to latest is
an icon-only floating arrow that does not move the composer.




- **Empty** — no tabs: sidebar hint + `StartPage` (Aux mark, Search/Ask field,
  recent chats/routines). No runs: rail home explains where
  the agent works.
- **Loading** — 2 px sweeping progress line at the top of the stage card; tab
  favicon becomes a spinner. Deferred surfaces (Settings, Library, Tasks, Palette)
  show a skeleton until their chunk loads; Library and conversation history show
  placeholder rows on first load.
- **Disconnected** — full-width warning banner with *Reconnect now*; composer
  disabled; rail shows *offline*; stage shows *Waiting for the runtime*.
- **Long titles** — single-line ellipsis everywhere (tab rows, run rows, command
  bar title, member labels); full text in `title` tooltips.
- **Many tabs** — past 60 loose tabs in a Space the sidebar windows the list
  (`use-windowed-rows.ts`, 32px stride, paused while dragging); past runs
  virtualize past 30 (`VirtualList`). Hidden mode has no persistent icon rail.
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
came from. Menus, popovers, the sidebar peek and the space editor register with
`useDismissable`, so the most recently opened one closes first; the current
overlay closes only when none is open. Shortcut hints in titles, menus and the
palette follow the person's remapped shortcuts. Icons carry `aria-label`s or are `aria-hidden` decorations.

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

Screenshots: with the mock server running,
`node apps/desktop/scripts/screenshots.mjs [outDir] [only]` renders the
fifteen reference states in `docs/ui/screenshots/` with Playwright (1440×900
@2x, plus a 900×700 narrow capture).

## Tests and gates

- `pnpm -C apps/desktop typecheck` — main, preload and renderer.
- `pnpm -C apps/desktop build` — tsc + esbuild bundle + vite build.
- `pnpm -C apps/desktop test` — vitest: `intent.test.ts` (command-bar intent
  detection), `workspace.test.ts` (space / tab / pin / folder reducers),
  `favicon.test.ts`, `StepTimeline.test.tsx` and
  `ObservationPanel.test.tsx`. Repo unit tests also cover toolbar-edge
  geometry, bookmark drop, stage clearance beside a menu, and the separate
  preview and agent-stage holds (`tests/unit/toolbar-edge.test.ts`,
  `bookmark-drop.test.ts`, `stage-obstruction.test.ts`,
  `offscreen-holds.test.ts`, `page-pointer.test.ts`).
- `tests/unit/chrome-tokens.test.ts` — token and chrome CSS contracts
  (native material layering, row-filling pins, coordinated toolbar reveal,
  the suggestion send mark, round tab-close targets, settings groups,
  sidebar states and chat attachments; focused native regressions are listed in local-testing.md).
  `workspace.test.ts` covers `previewSplit`.

## Runtime contract dependencies

- `Backend` / `PageTarget.backend` is `"aux" | "chrome"`
  (`contracts/ids.ts`, `BackendSchema`) — embedded Chromium or attached
  Chrome.
- `PageTarget.routeReason` is set on every page (`pages.open` result,
  `workspace.get`, `page.added` / `page.updated` events).
- `Run.config.implementation` / `routeReason` are read when present.
