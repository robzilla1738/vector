# Browser excellence plan (2026-10-29)

Robert asked for a thorough review of the browser experience — the agent, quality of life, Spaces, profiles, the gutter and window borders, how tabs work, dragging, pinning, renaming, creating a Space — and a plan to make all of it excellent, with Aside and Arc as the references. During the review he added: support for macOS versions before 27; Aux's own implementation of everything that came from Aside, behaving the same; every Settings item set up correctly for Aux; import from other browsers and a proper onboarding flow; **Spaces instead of profiles**; and no over-testing.

**Out of scope:** release, notarization, distribution, updates and the hosted cloud service. Everything stays local.

**Sources:** nine read-only code reviews of build 77 and the durable checkout, plus an on-screen look at build 77 beside the running Aside and the saved Arc references (`out/acceptance/20261027/ref/`). Findings marked *(check)* were inferred from code and need one look on screen before or while fixing. File paths are under the durable checkout's `src/` unless they start with `vendor/`, `scripts/` or `docs/`; `frame/` means `chrome/browser/ui/views/frame/`.

## Progress (build 112, 2026-10-30)

**Read this first:** [the audit of build 112](2026-10-30-plan-audit.md) checked every item against the code and overrules this section. It found Batch 6 (onboarding) largely unbuilt, the chrome://settings cleanup in Batch 7 not started, and the Batch 8 approvals popover missing. The list below describes what was built, not what's finished.

Build 112 (`out/release/1.0.0-112`) carries everything below. It is assembled from the durable checkout with the release transforms, `--pdf-runtime`, `--computer-use-helper` and `--memory-helper`. It launches, and the items marked *(seen)* were checked on screen. The rest is built and unit-tested but not yet driven by hand.

**Done**
- **Batch 1:**
  - Shortcuts: page-first; Ask Aux on Ctrl+Command+E; Ctrl+1–9 for Spaces.
  - The window opens before the daemon is ready.
  - Sidebar rows persist *(seen)*; Clear works per Space; close falls back safely.
  - Find bar in the card; downloads popover on the footer button.
  - Import is history, bookmarks and cookies, with File › Import going to Aux's route; first-run screens are off.
- **Batch 2, Spaces replace profiles:**
  - A browser-wide Space directory (`chrome/browser/aux/organization/space_directory.*`) gives one footer row, the Spaces menu, Ctrl+1–9, next/previous and the two-finger swipe, across every data group *(seen)*.
  - Opening a Space in another group moves the window to that group's profile.
  - Create a Space offers "Sign-ins and cookies": shared with a group, or Isolated, which makes a new profile *(seen)*. Isolated Spaces show a lock.
  - The profile dots, the startup picker and the footer profile button are gone. `aux open --space` works alone.
  - One agent across Spaces: name, look and setup live once (`agent-shared`); Instructions and personality saves are written to every local account; each group keeps its own home thread.
- **Batch 3:**
  - Row state, accessibility, keyboard, rename, the shared menu, archive (sorted, filter field, relative dates) and multi-select actions.
  - A split shows as one row *(seen)*.
  - Ctrl+Tab and Cmd+1–9 follow the sidebar; the Ctrl+Tab panel takes the theme and reacts to the Control key's release.
  - Pins: "Back to pinned page", no "Pins" header *(seen)*, 6 px drag threshold.
  - Tab cleanup offers 12 h, 24 h, 7 days and 30 days.
  - Sidebar inks go through `SidebarInk` (bookmark rows, headers, header actions, footer, Space dots); the shared-update dot uses the accent.
- **Batch 4:**
  - Reorder Space icons by dragging.
  - Drop a tab on a Space icon; resting on it opens that Space.
  - Emoji search; swipe between Spaces (the sidebar slides in its own group, with a live preview across groups); the dead `AuxSpacesSwitcher` is removed.
- **Batch 5:**
  - One frame metric set; the card corner is the window's own corner less the gutter, which is 16 points on macOS 26+ (measured on 27) and 10 on 15.
  - No card shadow: the sidebar covered it on the leading edge, so the edges read unevenly. Every edge is now the same clean line, as Arc draws its dark card.
  - **Arc-style sidebar top** *(seen)*: window controls, toggle, extensions, back, forward and reload on one row. The Agent button leads the footer, and the footer sits lower.
  - **Address field above Tabs** *(seen)*: by Robert's call it left the top of the sidebar for its own row between Bookmarks and Tabs. It sticks to the top of the list when the list scrolls (scrolling not yet driven by hand).
  - **One window surface** *(seen)*: the sidebar, the gutter around the page and the Agent card's surround all paint the Space theme and backdrop, or nothing so the window material shows. There is no outline at the sidebar edge and no page-colored toolbar.
  - The Agent panel is a card with the same gutter and corner.
  - The doubled collapse icon in a revealed sidebar is fixed.
  - The command bar clamps to the window, sits in the upper third and animates scale and opacity.
  - The narrow sidebar is clamped to its address row.
  - Peek is an in-window sheet (Option-Shift-click) with Open in split and Expand to tab, and failures show as a status.
  - Little Aux opens with no window, remembers its frame, has Move to Space and a Settings switch.
  - Frame behavior is keyed on the build flag.
- **Batch 6:**
  - Arc's pinned Spaces, folders, favorites and themes import into Aux Spaces.
  - Partial imports succeed with a plain message and Try again (onboarding and Settings).
  - Edge is a source; the password writer is removed.
- **Batch 7:**
  - A Shortcuts page; command-bar commands (Settings pages, window, find, zoom, bookmark, duplicate, mute, full screen, pause ad blocking).
  - Per-site ad-block pause (command bar and Settings › Paused sites).
  - Crash consent, version line and theme picker API.
  - Menus.
  - Billing, Ads and Sync rows removed.
  - Copy fixes; diagnostic logs removed.
- **Batch 8:**
  - Browser-backed web search.
  - Local agent CLIs: ACP driver, Aux approvals, one session per thread, watchdog, real model lists, sign-in errors.
  - Panel home thread, Stop on the agent button, "Can't reach" with backoff, the status in the button's accessible name.
  - Command-bar Ask to the home thread.
  - On-device dictation (Speech framework).
- **Batch 9:**
  - The floor is macOS 15. The glass variant and `_NSThemeWidget` CHECKs are guarded, and Endpoint Security custody is 27+ only.
  - The 34 poppler/nss/glib/gpgme runtime files are rebuilt from pinned sources for 15.0 (`scripts/runtime/build-pdf-runtime.py`, assembled with `--pdf-runtime`).
- **Batch 10:**
  - Aux's own text for all 51 built-in skills (`vendor/aux-skills/`).
  - CLI `spaces`, `tabs`, `chats`, `status`, `list` and `resolve`.
  - Specs for the Computer Use helper protocol and the memory helper formats (`docs/spec/`).
  - **Computer Use helper** (`apps/computer-use-helper/`): Aux's own Swift app on that protocol, Accessibility only, with no keyboard or pointer capture. Assembled with `--computer-use-helper`.
  - **Memory helper** (`apps/memory-helper/`): Aux's own `aux-memory`, bit-exact with the supplied one on the fixtures (`scripts/memory-helper/compare.py`). Assembled with `--memory-helper`, and it runs under the build 96 daemon *(seen in the process list)*.
  - **Daemon routers** (`vendor/aux-daemon/`): the root router serves 273 of 285 procedures from Aux's modules. Every input and output schema and route meta matches the supplied procedure (parity harness). remoteControl and externalPasswordManagers stay supplied, as agreed.
  - **Daemon stores:** settings, Projects, task transcripts, the task store (SessionStore and its turn tables), the inbox and notification grants, recent tasks, routines with their scheduler, channel connections, memory pages and the Context Awareness ledger's read side are Aux modules. Each replaces the supplied store for every caller; parity compares on-disk bytes against the same build with the store edits undone.
  - **Extension, first two steps** (`vendor/aux-extension/`): tokens and fonts (Geist replaces the commercial display face), the New Tab page's first paint from the same tokens and fonts *(seen)*, the 14 shared components, and the routes users see most (New Tab body, the Agent panel shell, the chat view, the chats sidebar, the Settings shell and page kit, Settings › Appearance, the mini popup, the command bar, and the composer: attachments, send/queue/edit, the toolbar and model menu *(seen)*, notices, comments and Projects, the side panel, conversation rendering, the transcript row model, the message list with its scroll controller, and its icon and editor head; Settings › Security & Privacy, Account *(seen)*, Channels, Memory and Context Awareness, General, Models, Developers, Agent, Projects, the Plugins header, Routines and the Tasks page; the New Tab tasks strip; onboarding; the New Tab omnibox engine; the task session page; permission prompts; Plugins › MCPs; the connect dialog; model select; skills; the app shell UI; the splash; the tool steps and cards; and the smaller live chunks) as readable source, render-checked against the supplied ones *(New Tab and Agent panel seen)*. Dialogs, alert dialogs, popovers and the select popup use the 12px corner.
- **Memory indexing fixed:** since at least build 55 the daemon refused the memory helper ("unsupported identity"). Assembly signed the unsigned memory-distribution copy, and the re-pin then rewrote the policy's `sourceSha256`, which the daemon checks against a compiled constant. Assembly now leaves `Contents/Resources/aux/memory-distribution` alone; the warning is gone in build 96.
- **Corners at the sidebar fixed** *(seen)*: Chromium's stroked floating corners drew stray bright arcs where the card met the sidebar; they no longer show around the Aux card. The card keeps its own radius with the Agent panel open or closed.
- **Agent panel mirrors the sidebar** *(seen)*: its composer sits 6pt from the page and the window, like sidebar rows.
- **Tabs, reworked** *(seen)*:
  - Hover shows the tab's card with its thumbnail; a tab that isn't loaded keeps its tooltip.
  - Dragging onto a tab previews the split on the page after 300 ms: the tab it joins fills the half it will take, and the side of the row under the pointer picks the side.
  - Dragging onto the page goes back to the tab that was open before the press and previews the half.
  - Dragging to Bookmarks opens a gap in the list; the address row is part of the drop band. A split row's bookmark takes that tab's own title.
  - A split is always one row: the native split row no longer shows beside the tree, even while a tab is being adopted. Duplicates weren't reproduced by drag or by restart; other routes are unconfirmed.
- **Split and right sidebar edges** *(seen)*: the stock side-panel shadow stayed on in split view; it's off in every layout. Split pane outlines are quiet hairlines, the active pane a step clearer. Gutters measure 6pt on every side.
- **Gutter seam fixed** *(seen)*: in the single-page card layout the surface view under the card was hidden, so the gutter around the page (and beside the Agent panel) showed bare window material instead of the Space color. It now shows, and rounds only the corners on the window's edge.

**Not done, and why**
- **Batch 10 rewrites still to do:**
  - The daemon's remaining services: the ledger's write, read-content, verify and clear paths; MCP state with its manager; the agent server; and the model registry. The registry runs credentials through its core paths (33 uses), so it stays supplied until the credential store is in scope, along with auth, tokens and the Keychain.
  - The rest of the extension's supplied UI, listed in `extension-supplied-ui-sweep.tsv` (bytes, JSX calls, copy strings, chunk; sizes include bundled libraries). Live UI left: Channels chat (`route-VV0zL3cm`), onboarding `ai` and its hero, `experimental`, `communication`, `recovery`, `progress`, `route-BiU8pLwS`, `route-Dh145hWk`, `-utils`, and small icon chunks. `components-BlZz2O2v` mixes the off-by-scope Vault UI and needs a decision. Features that are off by scope (billing, payments, add-on credits, the built-in password manager, hosted sign-in, referrals) are not rewritten; their removal is a separate item. Bundled libraries (markdown, diagrams, router, icon sets, three.js, material-color-utilities) stay supplied. The Spaces sidebar is native browser UI, already Aux source. Bundled third-party libraries (for example material-color-utilities) stay supplied.
  - The native addons: Aux's own `aux-macos-utilities.node` is built and matches the supplied one under parity (`apps/macos-utilities-addon`), but is not swapped in. That takes a fixed Developer ID copy plus new pins in `AuxFreshBootstrapPolicy.json`, the aux-daemon constants (a relink) and the browser (a native build); see `docs/spec/native/macos-utilities.md` section 7. `aux-pdf.node` turns out to be Aux's own earlier PDFium build, re-signed; its sources, GN target, spec (`docs/spec/native/pdf.md`) and parity test are in `apps/pdf-addon` (10/10 against the supplied image). Its build script is not committed: to link outside `out/AuxFast` it swaps the checkout's link filter for the upstream toolchain files, and loosening that guard is Robert's call. The supplied `native/aux-pdf-pins.cjs` also pins an older image; the daemon loads PDF through a linked binding, so it is probably unused. The supplied `native/aux-macos-utilities.cjs` pins an older image and would refuse if required, but nothing requires it.
  - The memory agent predicted a seatbelt denial when a memory folder sits inside a task home. It has not appeared in builds 96–99 (no memory warnings in the daemon log); revisit only if it does.
  - The memory-distribution `aux-memory` stays unsigned, as supplied. Notarization may reject an unsigned Mach-O in the bundle; that is checked when notarization runs.
- **Organization model unit tests:**
  - They compile, but linking a test binary needs `aux_test` outputs in `build/toolchain/apple/host-output-allowlist.json`.
  - The permission classifier refused that edit even with Robert's approval, so Robert adds it by hand.
- **Not built, with reasons:**
  - The CLI `ask`, `exec`, `repl` and `mcp` (they need an approval design).
  - The Web Store banner rule (the selector can't be seen from here).
  - The page-info ad-block switch (no Aux section in page info).
  - The `aside_*` popup names (set by the supplied extension).
  - The traffic-light offset constant (not found).
- **Live checks still owed:**
  - CLI provider turns with Robert's logins.
  - A themed Space on screen with the new single surface.
  - Peek and Little Aux by hand.
  - Dictation permission prompts.
  - A macOS 15 VM run.
  - Arc import against a real `StorableSidebar.json`.

## Decisions kept

The plan refines these; it does not reverse them. Anything that would is a question for Robert.

- **The agent:** one primary agent per user, named Aux by default, with a home thread, plus **side chats inside the agent panel** for one-off work (the Muse model). No Chats list in the sidebar. The agent button is a pinned-style tile beside the address field. Name, look and Instructions only; no style or initiative settings; routines are its initiative. One logo per surface. ([agent model](2026-10-28-agent-model.md))
- **Sidebar (Arc header, Aside sections):** traffic lights, sidebar toggle and back/forward/reload on one row; then Pins, Bookmarks, the filled address field, Tabs (Robert moved the field above Tabs on 2026-10-30). Pins hide when empty. AI Tidy removed. No Space switcher in the sidebar body; Spaces live in the footer. Archived tabs behind the Tabs-header button. Footer: Downloads popover, Search, "+". ([checklist](2026-10-28-ui-review-checklist.md) rows 1–5, 19, 36, 41, 50)
- **Page frame:** the page is one rounded card with an even gutter, single or split; one rounding scale; split panes with a hover pill instead of a title bar; no Google-branded content anywhere; no blue focus ring on the address field.
- **Tabs:** × on hover closes; rename in place (double-click, F2, menu); drag to reorder, onto a tab to split, to Bookmarks, to Pins, onto the page to split, with the frosted card and half-page preview. ([sidebar polish](2026-10-29-sidebar-polish.md))
- **Spaces and themes:** a theme per Space, falling back to a default; an emoji per Space; Aux's own theme picker with Aux presets and terminal classics; one uniform shade across every surface, with ink-based borders and 7:1 text contrast; Create a Space with icon, name and color preview. ([Spaces and themes](2026-10-29-spaces-and-themes.md))
- **Little Aux and Peek** exist and follow Little Arc's single quiet bar.
- **Scope:** bring-your-own models (API keys, or the user's own local agent CLIs; see answer 5); no payments, Pro or hosted credits; no built-in password manager (users bring 1Password and the like through extensions); routines run on this device only.
- **Crash reports:** opt-in, off by default, asked once after the first crash (release decision 6).

## Decisions (2026-10-30)

These overrule anything older in this plan.

- **Pins and bookmarks are per Space**, whether or not Spaces share cookies.
- **The Agent's home thread follows cookie sharing:** Spaces that share sign-ins share a thread; an isolated Space has its own.
- **Onboarding brings over passwords if possible.**
- **Send feedback is hidden.** Max plan and ultrabrowse leftovers are removed.
- **The runtime is rebuilt for macOS 15 in full:** Node, Python and rg as well as the PDF stack.
- **The address field sits directly above Tabs.**
- **Collapsed sidebar, as in Arc:** no traffic lights over the page; they appear inside the sidebar when it pops out, and the page keeps the even gutter on every side.
- **Site panel, as in Arc:** the address field keeps two simple icons, copy link and a sliders button. The sliders button opens one popover: a row of simple action tiles (share, screenshot, reader and the like), Extensions as a small icon grid with a + tile (replacing the puzzle button), Settings as a short list of this site's permissions, and a footer with the connection state and a ⋯ for the full site info.
- **New Tab is always the centered logo, search bar and chip row.** The task cards stay off it.

## New decisions (2026-10-29)

1. **Spaces replace profiles.** There are no user-visible profiles. When you create a Space you choose whether it **shares** sign-ins, cookies and site data with another Space or is **isolated**. Design in [Batch 2](#batch-2--spaces-replace-profiles).
2. **Aux's own implementation of every Aside-derived part, behaving the same.** The supplied implementation becomes the reference for behavior, not shipped code. Persisted formats and wire protocols stay compatible. Track in [Batch 10](#batch-10--auxs-own-implementation-of-the-aside-parts). This changes the standing rule in AGENTS.md; proposed wording is at the end, and AGENTS.md is not edited until Robert says so.
3. **Lean verification.** See [How changes are checked](#how-changes-are-checked).
4. **Robert's answers below** (extensions per isolated Space, the rewrite boundary, the address field, macOS 15, local agent CLIs instead of sign-in, open before the daemon is ready).

## Robert's answers (2026-10-29)

1. **Isolated Spaces have their own extensions**, as in Arc. Install 1Password in each isolated Space.
2. **"Aside-derived" means the supplied parts Aux can't build from its own source:** the agent extension, daemon JS, Computer Use, memory helper, runtime, skills, and the native addons reconstructed from disassembly. The native Chromium code in `chromium/tree` is already Aux source; parts ported from Aside's fork are rewritten as they're touched, not as a separate project.
3. **The address field stays as it is.** Clicking it edits in place with its dropdown; Cmd+T opens the centered command bar.
4. **macOS 15 Sequoia is the floor.**
5. **No "Sign in with…" provider flows for now.** Do what T3 Code does: Aux drives the agent CLIs the user already has installed and signed in to, so any local agent tool works. API keys stay. See Batch 8.
6. **Open the browser before the daemon is ready.** Speed and quality of life win. This reverses the startup half of D12 ("no profile before the daemon is ready and authorized"). See 1.2.

## What the review found

The design direction is right and much of it is well built: row metrics are consistent, drag visuals are good, the Space theme model is sound, and most Settings rows are wired to real prefs. The gaps are of four kinds:

1. **A few things are broken outright:**
   - Cmd+Left/Right in a text field goes Back/Forward instead of moving the cursor, which can lose what you typed.
   - The first start shows no window for 30–55 s, and a startup failure shows no browser at all.
   - Any tab retitling cancels a drag in progress.
   - The Tabs "Clear" button closes pinned tabs and tabs in other Spaces.
   - Extensions have no visible place in sidebar mode.
   - The find bar opens under the sidebar.
   - Footer Space icons past about five can't be reached.
   - New users who stay local never see onboarding.
   - The agent's web search and the composer's dictation call hosted routes that don't exist, so both always fail.
2. **Live state is missing from tab rows:** no audio or mute indicator, no loading, crashed or unloaded state, no focus ring, and no accessibility role.
3. **The Arc signatures are missing:**
   - swipe between Spaces
   - reorder Spaces
   - drag a tab onto a Space
   - Ctrl+1–9 to jump to a Space
   - a Spaces menu
   - "back to pinned page"
   - Arc import into real Spaces and Pins
   - the sidebar staying put in fullscreen
   - Little Aux with no window open
4. **Leftovers point at removed or foreign things:**
   - Settings rows for Tidy, Chats, Pro relays, billing, and CLI commands that don't ship
   - chrome://settings full of Google services
   - a Google Lens string on New Tab
   - "Help improve Aux" that does nothing
   - importers that save passwords and payment cards into Chromium's own stores

## How the work is ordered

Batches are in dependency order. Batch 1 makes everything safe to build on. Batch 2 changes the model that Spaces, import and onboarding sit on, so it lands before those. Batches 3–9 can run in parallel lanes once their files don't overlap: Batches 3 and 4 share `frame/aux_organization_*`, so run them in one lane or in sequence. Batch 10 is a long track alongside the rest. What gates each item is a native build plus a look on screen, unless noted (owner approval, a fixture, Apple).

---

## Batch 1 — Nothing broken

| # | Problem | Fix | Where |
|---|---|---|---|
| 1.1 | Aux's keyboard bindings run before the focused field. Cmd+Left/Right navigate Back/Forward from inside text fields. Cmd+K, Cmd+E, Cmd+S, Cmd+Shift+C and Cmd+Shift+A never reach web apps (Slack, Notion, Docs, Figma). | Only reserved chords (Cmd+T/W/N/Q, Cmd+L) go before the responder; everything else goes through the normal path after it, the way upstream delays Back/Forward. Add an "always use for Aux" switch per shortcut for anyone who wants Aux to win. | `chrome/browser/ui/cocoa/chrome_command_dispatcher_delegate.mm:84-97`, `chrome/browser/ui/aux_keyboard_shortcuts.mm:50-70`, `global_keyboard_shortcuts_mac.mm:88` |
| 1.2 | No window until the daemon is ready (nested RunLoop, 90 s deadline). On timeout `profile_ = nullptr; return;` and no window ever opens. Links from other apps wait behind it. | **Open the browser at once (Robert, 2026-10-29: speed wins; reverses D12's startup gate).** Restore the session and open links immediately, and start the daemon in parallel. Find everything that assumes a ready, authorized daemon at profile creation (`profile_gate.cc`, `browser_platform.cc`, the organization and agent bridges) and make it wait lazily for readiness instead of blocking. Agent surfaces show a quiet "starting" state: the button, the panel, New Tab's agent banner and the daemon-backed Settings sections. If the daemon fails, browsing is unaffected and the agent button says "The agent couldn't start — Try again". The shutdown RunLoop stays. Update STATUS and the release checklist where they cite D12. | `chrome/browser/aux/browser_platform.cc:150-171`, `chrome/browser/ui/startup/startup_browser_creator_impl.cc:275` |
| 1.3 | The tab list is rebuilt from scratch on every change. A title change or finished load cancels drags, loses hover (× vanishes), makes context-menu commands fail ("The profile or tab list changed"), flickers favicons, and costs roughly n³ per rebuild across two trees. | Keep rows alive and update them from the model's `Delta::changed_entries`. While a drag is active, defer refreshes the way rename does. Don't Notify when Reconcile changed nothing. Build one handle→index map per refresh. Context-menu commands check only their target entry's revision. | `frame/aux_organization_tree_view.cc:527-545, 813-816`, `frame/aux_organization_window_controller.cc:100, 492, 1569-1577, 1746` |
| 1.4 | Tabs-header **Clear** closes every closable tab in the window, including pinned tabs and loaded tabs from other Spaces, but leaves unloaded tabs in the current Space. | Clear the active Space's unpinned, unkept entries in one archive batch, with Undo. | `frame/aux_tabs_actions.cc` `ClearAccepted` |
| 1.5 | Extensions are unreachable in sidebar mode. Their container, the split button and pinned actions stay "visible" at an empty rect, so there are no icons, keyboard focus can land on zero-size buttons, and popups anchor to nothing. This is the same pattern as the build 38 crash. | Really hide them. Add an extensions button in the address row (puzzle icon, Arc-style) that opens a menu listing every extension, with pin-to-row for the few you want visible (1Password). Popups anchor to it. | `chrome/browser/ui/views/toolbar/toolbar_view.cc:1691-1704, 1861` |
| 1.6 | The find bar opens under the sidebar address field (off the window's left edge), or in the gutter when the sidebar is collapsed. | In sidebar mode, position against the page card (the active pane in a split), inside the inset. | `toolbar_view.cc:2365` `GetFindBarBoundingBox` |
| 1.7 | The download bubble and the "download started" animation aim at the hidden toolbar button *(check)*. | Route every download bubble and animation to the footer Downloads button in sidebar mode. | `download_toolbar_ui_controller.cc:1154, 1263` |
| 1.8 | Footer Space icons have no overflow: about five fit, the rest are clipped and can't be clicked. | Scroll horizontally with the active Space kept in view, plus an overflow menu. Batch 2 removes the profile dots, which frees the row. | `frame/aux_space_dots.cc:132-135` |
| 1.9 | Importers write passwords into Chromium's disabled password store (File menu → Firefox) and Safari payment cards into autofill. | Revert the Firefox password mask and `AddFirefoxPasswordForms`. Drop payment cards and autofill from Safari and from `supportedDataKinds`. Point File › Import at Aux's importer. | `chrome/browser/importer/importer_list.cc`, `profile_writer.cc`, `extensions/api/aux_browser_import/{safari_import,migrator,import_service}.cc`, `browser_command_controller.cc` |
| 1.10 | The Chromium first-run screens and default-browser check are suppressed only in non-official builds; `flags.release.gn` is official. The `first_run_service.cc` edit is a no-op (`&& true`). | Suppress them under `ENABLE_AUX_BROWSER` regardless of build type. | `chrome/app/chrome_main_delegate.cc`, `chrome/browser/ui/startup/first_run_service.cc` |
| 1.11 | Close can silently do nothing: `HandleClose` reports handled, then refuses on an identity or owner mismatch, e.g. after a redirect. | Fall back to a normal close, and show the one-line status if anything is refused. | `frame/aux_organization_window_controller.cc:1345-1369` |
| 1.12 | Possible null dereference if a profile switch retires the sidebar body mid-drag. | Check `outside_` before use. | `frame/aux_organization_tree_view.cc:952`, `aux_sidebar_body.cc:197` |

## Batch 2 — Spaces replace profiles

**Model.**
- A **data group** is one hidden Chromium profile: cookies, site data, history, extensions, autofill, permissions, downloads list. Every Space belongs to exactly one data group.
- The first group is "Default". Creating a Space offers **Sign-ins and cookies:** "Shared with ‹Space›" (the default, listing one Space per group) or "Isolated". Isolated creates a new hidden profile for that Space.
- Later Spaces can share with it, so Work and Work Projects can share one isolated group.
- A Space's group is fixed after creation. Moving a Space to another group would mean moving cookies, which Chromium can't do safely; the Space menu offers "Duplicate into…" instead.

**What the user sees.**
- One row of Space icons in the footer; isolated Spaces show a small lock badge.
- The profile picker, profile pager dots, profile menu, "Profile N" creation, profile swipe and the profile Theme item go away.
- The default theme moves to Settings › Appearance › "Default theme" (the existing profile theme store).
- Startup opens the last-used Space; there is no picker.

**How it works.**
- Switching to a Space in another data group swaps the window's profile with the existing same-window profile switch (`frame/aux_profile_switch_*`). Spaces in the same group switch as today.
- The organization model moves from per-profile to browser-wide: the Spaces list and their order live in local state, and the entries stay in each group's profile. It's browser-wide, not per-profile models merged in the footer, so that ordering, Ctrl+1–9 and the swipe treat all Spaces as one list.
- Pins: global pins are global across all groups. A pin always opens in the Space you're in, which is the safe choice for isolation.
- Link routing rules target Spaces instead of profiles (`chrome/browser/aux/routing/`). `aux open --profile` becomes `--space` (keep `--profile` as an alias).

**The agent.**
- One agent across all Spaces: one name, look, Instructions and home thread.
- The daemon binds one account per profile today (`accounts.json` `profileAccountBindings`). Bind every hidden profile to the same local account and keep a per-Space browsing context, so the agent browses with the sign-ins of the Space it's acting in.
- Memory stays one store.
- **Extensions** belong to the data group (answer 1): an isolated Space starts with none. Its Create flow offers "Add your extensions", listing the Default group's extensions to install from the Web Store, so 1Password is one click.

**Migration.** Each existing profile becomes a data group. Its Spaces keep their tabs, pins, themes and emoji. The first profile is "Default". This is a versioned migration with a legacy reader, per AGENTS.md; nothing is deleted.

**Clean-ups this enables:** the two identical dot rows, the profile-create flow with no choices, and the swipe that moves between profiles.

**Tests worth having (cheap, high value):** model tests for group assignment, migration and ordering. Wire `organization_model_unittest.cc` into a build target; it has never run.

## Batch 3 — Sidebar and tabs

**Row state and accessibility**
- Audio and mute: a speaker beside × that mutes on click.
- Loading: a throbber in place of the favicon.
- Crashed: a sad-tab glyph.
- Unloaded rows dimmed.
- Favicons read live from `ContentFaviconDriver` instead of a history lookup per rebuild.
- `kTree`/`kTreeItem` roles with selected, expanded and level.
- A focus ring on rows, tiles, bookmark rows and the new-tab row.
- The list is one Tab stop, with arrow-key roving and type-to-find.
- (`frame/aux_organization_tree_view.cc:184-203`, `frame/aux_vertical_bookmark_row_view.cc`, `tabs/vertical/vertical_pinned_tab_entries_view.cc`)

**Mouse and drag**
- Middle-click closes a row.
- Activate on press.
- Clicking the active row keeps focus in the page.
- Autoscroll in an edge band during any sidebar drag.
- Split arms only after about 450 ms of hovering over a row (or with ⌥); otherwise the drop shows the reorder gap. Today the middle 40% of each row means split, so reorders turn into splits.
- Dropping onto an expanded folder inserts at the top.
- Drag pins and bookmarks back into Tabs (unpin into the active Space).
- No write for a drop in place.
- Archived rows aren't draggable.
- Thresholds unified at 6 px.
- (`:336-371, 934, 973-991, 1056`, `aux_cross_section_drag_coordinator.cc`)

**Multi-select:** Cmd- and Shift-select already work; make drag, close, archive, move and "New folder with tabs" act on the whole selection.

**Rename**
- Commit compares against the text the field started with, so tabbing away doesn't freeze an automatic title.
- An empty name, or "Reset name" in the menu, returns to the page title (`TitleMode::kAutomatic`).
- Folder double-click renames without toggling first.
- Remove the dead Shift+Return branch.
- Drop the one-second focus steal.
- Cap the length to the model's limit.
- (`:91-105, 719-720, 893-897`, `aux/organization/organization_model.cc:451`)

**One context menu, shared by rows and pin tiles:**
- Copy link (⇧⌘C)
- Duplicate
- Open in split / Split with…
- Reload
- Mute
- Pin / Unpin
- Add to bookmarks
- Move to Space ›
- Add to folder › (with New folder)
- Rename / Reset name
- Keep in Space
- Unload
- Archive
- Close tabs below
- Close other tabs

"Move to" lists only valid targets: never itself or its own descendants. It takes no hard-coded English and never aborts on a missing Space.

**Folders:** "New folder" in the Tabs header and the menu, named inline like rename. A collapsed folder still shows its active tab. (`NewFolder()` has no callers today.)

**Pins**
- "Back to pinned page" when a pin has navigated away (`launch_url` is stored but unused). Show a small mark on the tile, plus a menu item, as Arc does.
- Cmd+W on a pin unloads it rather than closing it.
- Pins stay global (decision kept). Many pins or a big pinned folder must not squeeze Tabs *(check)*.

**Archive**
- Archived tabs sort by date with relative labels and a filter field.
- Clicking one restores and opens it, then returns to Tabs.
- Cmd+Shift+T reopens the last closed tab in its old place, not at the end with a "Recovery" row (`browser_command_controller.cc:932`).
- Auto-archive keeps today's default (off), and gains 12-hour and 24-hour choices offered in onboarding (Arc's default is 12 h).

**Keyboard**
- Ctrl+Tab and Cmd+1–9 follow the active Space's visible list. Cmd+1–9 targets pins first, as Arc does.
- Activation scrolls the row into view.
- Escape cancels a drag without activating the tab, and isn't swallowed otherwise.
- (`frame/aux_tab_switcher.cc:94-99`, `browser_command_controller.cc:908-919`)

**Split tabs in the list:** a split shows as one row with both favicons (Arc), not two highlighted rows (seen on build 77).

**Paint consistency**
- One row painter and one close button for tab and bookmark rows; the light-mode bookmark selection is opaque white today.
- Every sidebar ink goes through `aux_theme::SidebarForeground` (bookmark rows, headers, header actions, new-tab row, dots).
- The cyan shared-update dot uses the theme accent and sits before the ×.
- The status line is anchored under the Tabs header so it's visible in long lists.
- The Ctrl+Tab panel uses the Aux theme and stops polling the Control key.

**Section labels:** Arc shows no "Pins" label and Aside shows none either. Keep the order (decision kept), but drop the Pins header label and let the tiles speak for themselves *(Robert to glance at it on screen)*.

## Batch 4 — Spaces flows

**Getting around**
- **Swipe** with two fingers between Spaces, with the sidebar sliding. Reuse the profile preview machinery (`aux_profile_preview_*`) driven by the Space list, then delete the dead `AuxSpacesSwitcher`.
- Switching animates in the direction of travel.
- Ctrl+1–9 jumps to Space N (remappable).
- A **Spaces menu** in the menu bar: New Space, Next, Previous, then the list.
- Space dots are 24×24 targets with a selected state.

**Organizing**
- Drag dots to reorder; `kMoveSpace` exists but is unused. Add Move left/right to the Space menu too.
- Dots are drop targets for a dragged tab, and hovering about 500 ms switches to that Space so the tab can be placed.

**Windows**
- Cmd+N opens in the current Space (today it's always the first).
- A window whose Space is deleted elsewhere falls back to the neighbour that received the tabs, and shows that Space's page.
- Returning to a Space shows its last active tab.

**Races**
- Cancel and Escape are disabled while Create is saving. Today cancelling leaves a Space with no theme.
- A new tab records its Space when it's inserted, not at reconcile, so it can't land in a Space you just switched to.
- Delete commits before switching.
- The Create panel closes if the Space's group changes.
- Palette commands queue while a save is in flight instead of doing nothing.
- (`frame/aux_space_create_view.cc:422-557`, `aux_organization_window_controller.cc:388-459`, `aux_space_menu.cc:165-172`, `aux_organization_ui_commands.cc:104`)

**Create a Space**
- Return on an empty name says so.
- Name length is capped.
- Fields lock while saving, with a small spinner.
- Swatches never shrink below 24 px; wrap to two rows.
- Adds the Batch 2 sign-ins choice.

**Emoji:** typing searches the emoji set instead of committing the first character.

**Theme picker**
- Changing only the mode doesn't add a Graphite tint ("No color" state).
- Choosing an Aux preset after a terminal preset resets intensity and mode.
- The color plane reaches muted, neutral and dark colors, with a hex field.
- Presets sit in two rows of five.
- The picker fits a 13-inch screen (it's about 600 px tall).

**Contrast**
- Check text against the color actually drawn (#202124 today, not #0A0A0A).
- `background` tokens follow the same rule.
- (`chrome/browser/themes/aux_theme_editor.cc:129-147, 235`)

**Clean-up**
- Reset removes only Aux tokens, not Chromium's theme.
- Deleting a Space anywhere removes its theme entry.
- One preview per window, not per profile.

**Performance**
- Cache the themed backdrop by (Space, mode, revision) and bake the grain; today `GetBackdrop` re-validates prefs and redraws the grain on every paint.
- Preview ticks refresh only this window's pages.
- Inject the page tint at document start so New Tab and the side panel don't flash their own palette.
- (`frame/themed_background.cc:117-146`, `aux_page_tint.cc:137-175`, `browser_view.cc:5436`)

**One shade, everywhere** *(check)*
- Extend the mixer to `kColorSysBase*`, `kColorSysSurface2–5` and omnibox results.
- Stop the accent from regenerating Chromium's Material palette, so the find bar, hover cards, permission bubbles and chrome:// pages match the shade.

**Sizes:** one radius and size scale across Create, the picker, menus and the sidebar (matches 5.1).

## Batch 5 — Window frame, gutter and split

**One geometry spec, used in every mode.**
- Write it once (`aux_frame_metrics.h`), with:
  - the gutter G
  - the card radius R
  - the pane gap
  - the control radius 8
  - the popover radius 12
- R is derived from the real window corner (`_getCachedWindowCornerRadius`) minus G, so the card is concentric on macOS 15, 26 and 27.
- Today:
  - the window is hard-coded 16 while macOS 26+ draws 20
  - the card is 10
  - the inset is 6 on three sides and 0 beside the sidebar (8 from the sidebar's own margin)
  - split outside card mode clips at 6 with an outline at 10
- (`frame/layout/browser_view_tabbed_layout_impl.cc:80, 1360, 1369, 1906`, `frame/browser_frame_view_mac.mm:369`, `frame/contents_container_outline.h:26`, `multi_contents_view.h:67`)

**Even gutter on all four sides.** The gap between the sidebar and the card equals the top, right and bottom gaps. On build 77 the card touches the sidebar's edge. Update STATUS, which says 8 where the code says 6.

**The card in every mode:** horizontal tabs (checklist 6), fullscreen, minimal UI, Peek, Quick window and split; decide explicitly which mode is flush, if any. Drop the top separator on every scheme so chrome://, PDF and file pages don't draw a hairline and jump 1 px (`layout_impl.cc:310-326`).

**Card edge.** On dark pages build 77 shows a light rim around the card. Use Arc's soft shadow with a faint ink edge, and the same treatment for single and split.

**Split**
- **Active pane:** a clear accent ring or slight dimming of inactive panes. Today it's 16% vs 10% ink.
- **Divider:** the hit area widens to about 12 px while the visual gap stays.
- **Pill:** fades in, and its 56-px reveal zone doesn't cover site controls.
- **Narrow-pane controls:** icons, not "‹ ›" text.
- **Dragging panes:** to rearrange.
- **Sidebar:** one row per split (Batch 3).

**Window dragging:** the gutter and the empty space under the last sidebar row drag the window, and double-click zooms per the macOS setting (`vertical_tab_strip_region_view.cc:435-480`) *(check)*.

**Hidden sidebar**
- Reveal in about 220–250 ms (today 450).
- Works on inactive windows.
- The hover zone matches the gutter.
- Mouse-exit tracking instead of a 100 ms poll.
- (`frame/aux_profile_preview_admission.cc`, `aux_profile_preview_retention.cc`)

**Fullscreen** keeps navigation in the sidebar and reveals the whole sidebar on edge hover (`browser_view.cc:6416`).

**A narrow sidebar never throws navigation to a top bar.** Clamp the minimum width or compact the field (`AuxNavigationPlacement::Update`).

**Address field and command bar**
- Clicking the field keeps editing in place with its dropdown, and Cmd+T keeps opening the centered command bar (answer 3). Only polish: the dropdown's corners match the field's.
- The command bar clamps to the window, sits in the upper third, grows with its results, and animates opacity and transform instead of resizing the widget every frame.
- (`frame/aux_tab_search_bubble.cc:95, 532-660`)

**Peek**
- An in-window sheet at about 90% of the card over a dimmed backdrop, with Expand to tab and Open in split.
- Failures show as a toast, not a modal alert.
- Option-click stays macOS's "download linked file"; Peek moves to a modifier that doesn't collide.
- (`chrome/browser/ui/aux_preview/*`, `aux_preview_ingress.cc:95`)

**Little Aux**
- Opens with no window open.
- Remembers its own place and size.
- Gets a "Move to Space" picker.
- Localized strings.
- A Settings toggle (pref `aux.little_aux_links_enabled`).
- (`app_controller_mac.mm:2741-2756`, `aux_preview_controls.cc`)

**Infobars and side panels:** infobars sit inside the card. Every side panel (Reading list, Bookmarks, History, Agent) is a sibling card with the same gutter, instead of Chromium's shadow box *(check)*.

**Housekeeping**
- Frame behavior is keyed on the build flag, not `BaseBundleID()=="dev.aux.browser"`.
- `UpdateAuxFramePresentation` posts only when its inputs change.
- The 0.5 DIP divider is anti-aliased or snapped for 1x displays.
- Traffic-light offsets come from AppKit's real button frames, not the hard-coded 76.
- Fix the possible layout loop at the narrow-split threshold.

## Batch 6 — Import and onboarding

**Onboarding (every new user, local or signed in, one window with step dots)**
0. **No waiting screen.** The flow opens with the first window (1.2). Steps 1–4 and 7 don't need the daemon (import runs through the native `chrome.auxBrowserImport`). Steps 5 and 6 show "Getting your agent ready…" inline if the daemon isn't up yet, and continue on their own when it is.
1. **Welcome.** "A browser with an agent built in." No sign-in.
2. **Bring your stuff** (skippable).
   - Detected browsers with their profiles and last-used time, Arc first.
   - Per source: Spaces and pins (Arc, Dia), Bookmarks, History, "Stay signed in to sites" (cookies), Extensions.
   - The footnote "Passwords stay in your password manager."
   - Each Arc or Chrome profile can become an isolated Space group or merge into Default.
3. **Keychain explainer**, only if cookies were chosen. "macOS will ask to let Aux read Chrome Safe Storage. Choose Always Allow."
4. **Your password manager** (skippable). Revive the supplied step that detects 1Password, Bitwarden, Dashlane and others and installs the extension. Today it's redirected away (`scripts/lib/provided-password-manager-scope.mjs`).
5. **Meet your agent:** the existing name-and-look sheet, inline. It stays reachable from the panel for anyone who skipped.
6. **Connect a model** (skippable). Lists the agent CLIs found on this Mac, each with "Use" or the login command to run (Batch 8), then API keys. No "Sign in with…" rows.
7. **Make it yours:** the default theme, with imported Arc Spaces previewed in their colors and emoji.
8. **Finishing touches**
   - Default browser: on.
   - Add to Dock: off.
   - Tab cleanup: Never / 12 h / 24 h / 7 days.
   - Mini popup and CLI: optional.
   - "Send crash reports": off.
   - Then "Start browsing".

Completion is stored locally per user. Today the guard only fires for cloud accounts (function `K` in `-types-*.js`, `/_public/onboarding` `beforeLoad`). Settings › General gets "Run setup again". The Done step stops calling the cloud `completeOnboarding` for local users and drops the hidden `keepTasksRunning`.

**Import**
- **Arc → real Spaces.** Arc Favorites become global Pins. Each Arc Space becomes an Aux Space (title, color into its theme, icon into its emoji), with its pinned container as Space entries and folders. Today's bookmark-folder mapping remains the fallback.
  - Code: `aux_browser_import/migrator.cc` (parse favorites and the Space color and icon fields), `import_service.cc`, `chrome/browser/aux/organization/*` (batch create), `aux_theme_editor.cc`, `aux_browser_import.json`.
  - Validate against a fixture of Arc's `StorableSidebar.json`, never Robert's real profile unasked (owner gate for any real sample).
- **Partial success.** Cookies run last. If the Keychain prompt is denied, bookmarks and history still commit and the screen says "Imported everything except site sign-ins", with Try again. Raw errors are mapped to plain copy (`ReadChromiumMigrationSnapshot`).
- **Sources:** add Edge (`com.microsoft.edgemac`, already a family but filtered out), then Vivaldi, Opera, Chromium, Zen (Firefox family) and Orion (HTML file).
- **More data:** open tabs into the Space, the default search engine, and re-import with "merge" instead of being blocked once imported.
- **The importer doesn't force on Chromium's horizontal bookmarks bar** in sidebar mode (`kShowBookmarkBar`) *(check)*.
- **Dead path:** delete the standalone `chrome://aux-import-data` importer unless its profile clone is reused for "become an isolated group" (recommended: reuse it, then delete the rest).
- **Copy:**
  - "In Safari, choose File › Export Browsing Data to File…"
  - Drop the "Safari passwords ZIP file" label and the dead "Importing your passwords…" / "…autofill data…" labels.
  - The onboarding skill should stop promising logins.

## Batch 7 — Settings and quality of life

**Aux Settings, fix or remove**
- **Help improve Aux:** becomes "Send crash reports", bound to the real crash consent (`aux_crash_reporting::SetConsent`). Today it toggles analytics that are compiled off, and nothing lets you change crash consent.
- **Developers:** rewrite around what ships. Hide the MCP section (its config runs `aux mcp`, which doesn't exist) and the `exec`/`repl` FAQ until those commands return (Batch 10 restores them).
- **Aux browser skill:** take `aux list`/`aux resolve` and the memory/history claim out of `AUX_BROWSER_SKILL`.
- **Channels:** remove the pinned Grok Bot, dots and Muse rows. They need a cloud relay that doesn't exist and show "Upgrade to Pro".
- **Send feedback:** point it at the support page. It posts to a route the hosted service doesn't have.
- **Appearance**
  - Remove "Customize Tidy Tabs" and "Recent chats in sidebar".
  - "Customize sidebar" becomes a Bookmarks toggle with no Chats wording.
  - Replace the old Theme editor dialog with a button that opens Aux's theme picker; Ctrl+Cmd+T opens the picker. Color scheme ends up in one place.
- **General**
  - "Check for updates" says "Aux 1.0.0 (77) · local build", not "Chromium 155…".
  - Background service shows the Aux version, not 1.26.1016.1852.
  - Tab cleanup gains 12 h and 24 h.
  - A Little Aux toggle; "Run setup again".
- **Models:** remove "Open billing".
- **Agent**
  - The runtime copy says it's bundled, and drops the update line while its release URL is `127.0.0.1:9`.
  - Move "Clean up agent tabs" out from under Computer Use.
- **Account:** hide Sync, Devices and Browser data recovery while sync is unavailable.
- **Memory:** decide on Context Awareness (eap-only, "requires the Max plan" copy). Hide it until it's real.
- **Search index:** rebuild it (stale: Ask Aux on tab switch, Statistics, Tidy; missing: Link routing, Tab cleanup, Peek, Minimal UI, Your agent and more).
- **Dead code:** delete the Remote Control panel, Pro strings and billing routes (`/billing/`, `/payment-use/`, `/liquid-glass-playground/`, `/error-test/`, `/artifact-test/`).
- **Copy:**
  - Lasso: "Select text, then click the blue dot"
  - "Loading.." → "Loading…"
  - "Others " → "Others"
  - "run a task"
  - one spelling of "ad blocker"
- **New settings:**
  - ad blocking per site (below)
  - ask before quitting with ⌘Q
  - a Shortcuts section of its own (out of Appearance), global across Spaces

**chrome://settings**
- Hide People/You and Google/Sync, Privacy Sandbox ("Ads privacy" row removed from Aux Settings too), preload via Google servers, enhanced spell check, image descriptions, Google history and price tracking, and the leftover Google Password Manager entry. Turn their prefs off by default.
- Keep the sections Aux links to (Site settings, Security, Downloads, On startup, Accessibility, System).
- The About page shows Aux's version and no Chromium updater.
- Safe Browsing: confirm the key is in the build; otherwise hide Enhanced.
- (`chrome/browser/resources/settings/`, `settings_chromium_strings.grdp`, `account_consistency_mode_manager.cc:150`)

**Menus**
- A Spaces menu (Batch 4).
- An Aux block in the Tab menu: Copy URL, Pin, Keep in Space, Split, Archive, Move to Space, Toggle sidebar, Little Aux. Labels show remapped keys.
- Help › Keyboard Shortcuts (a cheat sheet from `kBindings`).
- Remove or redirect Chromium's Pin Tab, Add Tab to Group, Switch to vertical tabs and Always Show Bookmarks Bar.
- The sidebar ⋯ menu's hints follow remaps, and single-item submenus become rows.
- (`chrome/browser/ui/cocoa/main_menu_builder.mm`, `frame/aux_sidebar_view.cc:1312-1386`)

**Command bar**
- Add the common commands: Settings sections, New window, Find, Print, Zoom, Bookmark, Mute, Duplicate, Move to new window, Switch Space, Import, Theme, and "Pause blocking on this site".
- Simple local math and unit answers.
- (`aux_keyboard_shortcuts.mm:87-127`)

**Shortcuts**
- Errors name the command or macOS shortcut that owns the chord and offer Replace; today they show raw numbers like "commands 34057 and 34132".
- Merge the duplicate split commands into "Split side by side" and "Split stacked".
- Make the Toggle Sidebar and Minimal UI copy clearly different.
- Ask Aux moves off Cmd+E so Use Selection for Find keeps it.
- Function keys can be bound.
- Rename the agent extension's "Open Aux sidepanel" (Alt+Shift+B).

**Ad blocking:** a per-site pause from the site-info bubble and the command bar (`aux_adblock.json` has no allowlist), plus a built-in cosmetic rule that hides the Chrome Web Store's "Switch to Chrome?" banner.

**Smaller fixes**
- Remove New Tab's "Drag an image to search with Google Lens" string.
- Hide the content-filter debug page behind Developer mode.
- Anchor the crash-restore bubble to the sidebar header *(check)*.
- Quit hides windows at once while the daemon drains.

## Batch 8 — The agent

The design is kept: one agent, a home thread and side chats in the panel. The work is making every path through it real. Short paths: `pcli/` = `vendor/provided/provider-cli/`, `agent/` = `vendor/provided/agent/`.

**Broken today**
- **8.1 Web search always fails.** The daemon registers `websearch` for every model and exposes it to CLI providers over MCP, and it calls `api.getaux.co/search`. The hosted service has no such route (confirmed).
  - Fix: use the provider's own search tool where the model has one (OpenAI and Anthropic do), else an optional search API key in Settings › Models. With neither, the tool is left out of the tool list and the prompt.
- **8.2 Dictation always fails.** The composer mic posts to `/stt/transcribe`, which returns 404, and nothing reads the service's `enabled:false`.
  - Fix: on-device speech through macOS's Speech framework (macOS 13+, no account). Until that lands, hide the mic.
- **8.3 "Sign in with…" goes away (answer 5).**
  - Kimi and Meta sign-in throw today, and Copilot's dialog loops on "Check again".
  - Remove the in-app subscription sign-in rows and their dead code paths (`pcli/borrowed-identity-removal.mjs`, `catalog.mjs`, the supplied `ai-*` sign-in flows).
  - Settings › Models has two sections: **Local agents** (8.4) and **API keys**.

**Local agents, the T3 Code model**

Aux drives the agent CLIs the user already has installed and signed in to, and never signs in on their behalf. `pcli/` already does this for T3 Code's set: Codex (`codex-app-server`), Claude Code, Cursor, Grok Build and OpenCode. The work is to make it general and as good as an API key.
- **8.4 Any local agent.**
  - Detect installed CLIs at daemon start. Each row shows Ready / Not signed in (with its login command and "Open Terminal") / Not installed (with the install link). Detection already exists: `detect.mjs`, `catalog.mjs`.
  - Finish Copilot (`driver: null` today).
  - Add a generic **ACP driver**: the Agent Client Protocol, which Gemini CLI and other agents speak. Any ACP agent on PATH then works without its own driver.
  - A "Add a local agent…" row takes a command for anything else that speaks ACP.
  - Refresh on window focus, so running `claude auth login` in Terminal flips the row to Ready.
- **8.5 Their own tools, under Aux's permissions.** "Use any local tools the user has" means the agent may use the CLI's own shell and file tools as well as Aux's browser tools. The fix is to route every one of those actions through Aux's permission modes (`guard`, approvals, final confirm), not to turn them off.
  - Today Codex runs `sandbox:'read-only'` with `approvalPolicy:'never'`, so it can read any file with no Aux approval.
  - Cursor runs its own tools with `--trust`, and Claude runs MCP-only (`--tools ''`).
  - Instead: Codex runs `approvalPolicy:'on-request'`, with its approval requests relayed to Aux's approval card. Claude uses its permission-prompt tool pointed at Aux's MCP. Cursor and OpenCode use their ask modes.
  - Each turn's working folder is an Aux run folder, plus whatever folders the user has granted in Settings › Agent › File permissions.
  - A prompt-injected page can no longer read or run anything without an approval the user sees (`drivers.mjs:57-71, 216`).
  - A turn waiting on an approval must not time out: suspend Aux's 180 s idle kill and the CLI's MCP tool timeout while a card is open *(check: the card has never been seen on a CLI turn)*.
- **8.5a Identity.** Cursor and OpenCode turns carry no system prompt, so the agent doesn't know it's Aux and ignores Instructions and memory. Pass it through each CLI's rules or instructions mechanism, and the ACP session's system prompt.
- **8.6 Capability:** every CLI model is advertised with no reasoning, no vision, a 200k context and zero cost (`pcli/aux-daemon.mjs:33-45`). Map effort to each CLI, pass images where the CLI accepts them, and report real context sizes.
- **8.7 Tool cards:** CLI tool activity shows as "Using repl" lines inside the thinking text (`aux-daemon.mjs:231`). Emit tool-call start/end events so the supplied tool cards render.
- **8.8 Speed:**
  - Each turn spawns a fresh CLI and re-sends the conversation flattened to its newest 60,000 characters (`aux-daemon.mjs:24, 63-73`). Keep one long-lived session per thread (the Codex app-server thread, `claude --resume`).
  - Route titles, download names and other quick calls to a fast model.
  - Start CLI detection when the daemon starts instead of on the first send, which can wait up to ~20 s (`aux-daemon.mjs:156`, `detect.mjs`).
- **8.9 Processes:** CLI children are `detached:true`, so they can outlive a crashed daemon, and Grok's per-turn config holds a bearer token until its folder goes. Tie children to the daemon's lifetime (`pcli/process.mjs:35`).
- **8.10 Models:** read the Codex model list from the app-server instead of the hard-coded three, and use real IDs for Claude's fast model.

**The agent button and status**
- **8.11** The button reflects only the home thread. Combine status across every session (approval beats question beats working), so a side chat or routine waiting on you shows the amber dot (`agent/aux-agent.mjs` chromeChats).
- **8.12** Approvals from the button: the amber dot opens a small popover with Approve/Deny and the question. `AuxTaskReviewBubble` and `AuxNativeTaskFeed` already exist but are dead, because `AuxSidebarView` is never constructed. Reuse them under the button, or delete them.
- **8.13** When working, the button's menu gets Stop. Rows of tabs the agent is driving get a small working mark, not only a grey group. Toolbar mode's "Ask ‹Name›" pill shows the same ring and dot.
- **8.14** When the daemon is unreachable, the button stops spinning and says "Can't reach ‹Name›", with polling backed off. Combine the per-window 1 s chat poll and 2 s tab poll into one shared feed (`aux_chats_transport.cc:34, 149`, `aux_agent_session_tabs_*`).
- **8.15** Clicking the button returns the panel to the home thread (an open item in the agent design).
- **8.16** Accessibility: the status goes into the accessible name, only the focused window announces, and the bezel uses theme tokens.

**Composer, panel and setup**
- **8.17** "Ask" in the command bar sends the text to the panel's home thread. Today it opens `newtab.html?mode=ask&q=…` and never submits, which also puts the question in history (`aux_tab_search_bubble.cc:1286-1306`).
- **8.18** Instructions: a failed read must not leave the box editable and empty, or a save overwrites AGENTS.md. Show "Couldn't load instructions — Retry" (`agent/aux-agent-ui.js:257-264`).
- **8.19** Escape in Customize asks before discarding edits, and in Meet it doesn't count as Skip (`aux-agent-ui.js:305-309`).
- **8.20** With no model connected, the empty panel says "Connect a model to start" with a button, instead of "Ask me anything…" (`:403-414`). Onboarding step 6 covers new users.
- **8.21** Side chats: the panel's "Side chats" menu is always there, even before the first chat, and lists only real side chats. Routines, channels and New Tab chats get their own filters.
- **8.22** Memory changes reach the home thread's prompt (memory is missing from `contextStamp`), and the stamp is set only after a successful rebuild.
- **8.23** Download-name suggestions queue instead of failing on a second concurrent download, and use the fast model.

**Errors**
- **8.24** Auth errors name the right place ("Settings › Models") and, for CLI providers, the command (`codex login`, `claude auth login`), with an Open Models button. A CLI "not signed in" counts as auth, not generic.
- **8.25** New error kinds for offline and network. "Out of credits" gets a retry and a settings action.

**Mini popup:** never opens in incognito or guest. Escape returns focus to the previous app, the hotkey toggles, and losing focus hides it (`extensions/api/aux_mini_popup/aux_mini_popup_api.cc:474-485`).

**Clean-up**
- Strip or test-gate the remaining billing strings ("Upgrade to Pro", "Add credits", the Free plan limit, "Share a free week of Aux Pro").
- Remove the dead `auxCredentials` API, the one-shot "Aux Ask validation" log and the `aside_*_popup` surface names.
- Update `provider-funded-launch.md` and the agent plan to the CLI provider path.

**Checking this batch**
- One live session with the approved gateway test model: send a turn, use a browser tool, approve from the button, rename, and leave Instructions intact after a daemon restart. Remove the credential afterward.
- CLI providers need Robert's own CLI logins, so those checks happen when he signs in. No other live passes.

## Batch 9 — Older macOS

**Today:** one line blocks everything below 27, `LSMinimumSystemVersion` 27.0.0 in `chrome/app/aux-product-Info.plist:7-8`. Chromium 155 itself targets macOS 13, and almost every binary declares 13.

1. **macOS 26 Tahoe** (small)
   - Set the floor to 26.0.
   - Hide the REPL below 27 (Endpoint Security descendant clients are 27-only).
   - Guard the private `variant` KVC call (`native_widget_ns_window_bridge.mm:281`).
   - Check on the existing `aux-ci` Tart image (26.6.2).
2. **macOS 15 Sequoia** (the floor, answer 4)
   - Rebuild the agent runtime's poppler, nss, glib and gpgme (34 files built for 26) with a 15.0 deployment target from pinned sources.
   - Set the floor to 15.0.
   - Make the frame right on 15: glass fallback, card radius from the real window corner (Batch 5), traffic-light offsets from AppKit.
   - Soften the `_NSThemeWidget` `CHECK`s (`browser_native_widget_window_mac.mm:164,187`).
   - Make the Endpoint Security startup custody conditional before it is ever enabled (`chrome_exe_main_mac.cc:150`).
   - Confirm the daemon picks `p256_v1` below 26.
   - Name the permissions pane per OS ("Accessibility" before 27).
   - Check on a cirruslabs `macos-sequoia` Tart VM. The license allows two macOS guests at once, and the Tartelet pool uses one.
3. **Below 15** is out of scope. The memory model uses the iOS 18 opset (re-export it for 14), and Computer Use screenshots need a pre-14 path for 13. Batch 10 makes both ours to change.

## Batch 10 — Aux's own implementation of the Aside parts

**Already Aux's own:**
- the hosted service
- the agent layer
- the provider CLIs
- the native CLI
- the build and release tooling

**Still supplied:**

| Part | Form today | Order |
|---|---|---|
| Agent runtime (Node, Python, rg, poppler…) | third-party binaries, some carrying At Inc. signatures | 1. Rebuild from upstream with our own scripts, keeping the file layout and `version.txt` (also unblocks macOS 15) |
| Built-in skills (35) | supplied Markdown | 2. Rewrite with the same names and front matter |
| Computer Use helper | compiled Swift, byte-patched | 3. New Swift app, same bundle IDs, launch policy, TCC marker, permission screens; document the daemon↔helper protocol first (it is undocumented) |
| CLI parity | native `aux-cli` has `open` only; Aside's had ~30 commands | 4. Build `list`, `resolve`, `exec`, `mcp`, `repl`… on the daemon's existing tRPC (decide which set is "parity") |
| Memory helper | compiled Rust plus Core ML models | 5. Rewrite, keeping catalog format 2 and the index on disk byte-compatible; compare embeddings numerically on a fixed corpus |
| Daemon JS (~395 tRPC procedures, ~30 tools, ~34 `Aux.*` CDP commands) | minified 12 MB bundle with count-checked edits | 6. Replace one router namespace at a time behind a dispatcher that falls back to the supplied bundle. Keep `/health`, the auth bytes, SQLite/JSONL schemas, Keychain item names and prompts verbatim |
| Agent extension (New Tab, side panel, Settings, onboarding, popups) | minified 47 MB bundle, no source maps, 155 files edited | 7. CSS tokens, fonts and shared components first, then route by route. Keep the extension key and ID, storage keys and private-API calls |
| Native addons and crypto authority | Aux source reconstructed from disassembly | 8. Re-author against their documented JSON contracts (answer 2) |

**Step 0: freeze the reference before replacing anything.** From the current build, record:
- the tRPC procedure list with input and output shapes
- prompts and tool schemas
- storage, SQLite and JSON schemas from a disposable home
- `Aux.*` command traces
- one screenshot per extension route

Then add a thin contract test layer that runs against either implementation.

**Avoiding double work.** Small extension fixes in Batches 6–8 (copy, hiding rows) stay as count-checked edits. New extension features — the onboarding flow, Settings rewrites — are written as Aux-owned modules hooked in the way the agent layer was, so they become the first pieces of the Aux-owned extension.

**Rules that change** (proposed; AGENTS.md and the contract are not edited until Robert approves):
- AGENTS.md lines 3, 9 and 11 ("reuses the Aside implementation… not a clean-room rebuild", "Reuse the supplied source and packages directly…", "Change only what Aux needs…") become: *"Aux is its own implementation. The supplied Aside implementation is the behavioral reference: Aux's parts behave the same, keep its persisted formats and wire protocols compatible, and replace it part by part with tests that pass against both."*
- Line 23 (authorized inputs) becomes reference-only.
- `docs/design/aside-contract.md` changes title and lines 3, 7 and 8 to match.
- AGENTS.md's Scope line ("users bring provider API keys (BYOK) or sign in with a supported subscription (ChatGPT/Codex, Claude Pro/Max, GitHub Copilot, Kimi, Meta, Grok…)") becomes: *"Users bring provider API keys, or Aux drives agent CLIs they have installed and signed in to (Codex, Claude Code, Cursor, Grok Build, OpenCode, Copilot, any ACP agent). Aux never signs in to a provider on the user's behalf."* The contract's Inference line follows.
- STATUS's D12 line ("The nested startup and shutdown RunLoops stay…") becomes: the startup gate is gone (answer 6); the shutdown RunLoop stays.
- `README.md:3`, the ARCHITECTURE table (already stale: the daemon is a native host, not an SEA; the CLI is native), `bundle.json` (`"implementation":"supplied"`) and `check-provided.mjs` follow as each part is replaced.

## How changes are checked

No over-testing.
- **Each change:** `pnpm test`, plus one look at the changed thing in a real build.
- **Automated tests only where a regression is likely and cheap to catch:**
  - the organization model (Space groups, migration, ordering, Clear scope)
  - persisted formats and wire protocols
  - importer mapping against fixtures
  - contract tests for replaced Aside parts
- **Not included:** receipts per item, repeated full journey passes, or test matrices across every mode — unless the change is layout in those modes (Batch 5 gets one screenshot per mode once).
- **Close-out:** STATUS and the checklist are updated per batch, not per item.

## Owner gates

- **Keychain:** cookie import from Chrome reads a real Safe Storage item (AGENTS.md: Keychain needs Robert's yes).
- **Arc data:** a real Arc sample for import validation, if a fixture isn't enough.
- **1Password:** the pairing check (R18).
- **AI turn:** the live turn uses the recorded spending authority.
- **Apple:** the REPL stays inactive until Apple answers `2H4D7KNGUP`.
