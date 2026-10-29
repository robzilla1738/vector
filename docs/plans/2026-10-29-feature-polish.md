# Feature polish pass (in progress, paused 2026-10-29)

Robert: "for the ones that do exist make sure they are excellent." This pass drives each existing feature on build 56 and fixes what isn't up to the bar. Screenshots are in `out/acceptance/20261029/` (local only).

## Checked on build 56

| Feature | Result |
|---|---|
| Cmd+T / K / L bar | Works; defects P1–P5 below |
| Sidebar collapse (Cmd+S) and hover reveal | Good |
| Minimal UI | Defect M1 |
| Pins (pin to all Spaces, open, back to a tab) | Works; defects PN1, PN2 |
| Same tab list in a second window | Works (each window keeps its own active tab) |
| Peek (link menu "Open Link in Peek", Escape) | Good |
| Picture in picture | In the video's context menu; Cmd+K hides it until the video plays (not yet tried further) |

Not reached yet: splits (verified in build 42), Quick window, downloads and AI rename, site routing, tab cleanup, shortcut settings, CLI `aux open`, extensions, profiles, @tab mentions.

## Defects found

- **ID1, sidebar rows that won't open (serious).** Clicking a loaded web page's row, or picking it in Cmd+K, does nothing. Cause: Aux's user-data keys were all `const char kKey = 0`. The build uses `-fmerge-all-constants`, so the keys share one address. Saving a pin's URL overwrote the tab's sidebar identity, and the same clash hits the bookmark-tab, retained-group, capture and file keys. Eleven keys are affected.
- **P1, Cmd+L.** The address isn't selected, so typing adds to it.
- **P2, Cmd+T with plain words.** "gith" is labeled "Open in new tab" instead of a search.
- **P3, Recently Closed.** The same page is listed many times.
- **P4, spellcheck.** The bar's field shows a spellcheck underline.
- **P5, the current tab.** It is offered as a "Switch" result.
- **K1, shortcuts.** 20 Aux commands have no default shortcut (minimal UI, Spaces, panes, split, Quick window, screenshot, PiP and others).
- **M1, minimal UI.** It changes nothing visible in sidebar layout.
- **T1, tooltips.** Tab rows show raw `chrome-extension://` and `chrome://` addresses.
- **CM1, tab menu.** Labels are jargon: "Close this view (unload)", "Close tab everywhere (archive)", "Undo organization change".
- **PN1, first pin.** It didn't show until a second pin was made.
- **PN2, pin gap.** There is a row-high gap under the pin tiles. It may be ID1, since a duplicated entry leaves an empty slot, so recheck it after that fix.
- **W1, empty tabs.** Untouched "New Tab" rows from closed windows stay in the shared list.

## Done so far (not yet seen on screen)

- **Command bar, P1–P5.** Release edits are in `vendor/provided/command-bar/integration.mjs`, wired into `scripts/release/transforms.mjs`. Host tests pass.
- **Native, in the durable checkout only.** Not yet built or exported to `chromium/tree`.
  - ID1: every key is a distinct string.
  - K1: Ctrl+Command defaults for the Aux commands, plus Alt+Command+N for Quick window and Command+Shift+2 for screenshot.
  - M1: minimal mode lays out the page flush and hides the sidebar.
  - T1: web rows show title and address; Aux pages show only the title.
  - CM1: the labels are now "Unload tab", "Archive tab" and "Undo".

## Resume here

1. Fix the one compile error: `aux_feature_commands.cc:164`, where `VerticalTabStripStateController::SetCollapsed` is private. Use the controller's public toggle or collapse path, then rebuild with `scripts/native-build.py third_party/ninja/ninja -C out/AuxFast chrome`.
2. Assemble build 57 and recheck ID1, P1–P5, K1, M1, T1, CM1, PN1 and PN2 on screen.
3. Continue the feature list above, fix W1, then export `chromium/tree`, pin it, and run `verify-candidate.py`.
