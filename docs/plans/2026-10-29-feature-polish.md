# Feature polish pass (in progress, paused 2026-10-29)

Robert: "for the ones that do exist make sure they are excellent." This pass drives each existing feature on the latest local Developer ID build and fixes what isn't up to the bar. Screenshots are in `out/acceptance/20261029/` (local only). Builds 57–59 are in `out/release/`. Build 59 is the latest assembled build; build 60 is not assembled yet.

## Checked on screen

| Feature | Result |
|---|---|
| Sidebar rows and pins switching back and forth | Fixed in build 57 (ID1 below) |
| Cmd+L | Fixed in build 57: the address arrives selected, and the current tab isn't offered as a result |
| Minimal UI (Ctrl+Cmd+S) | Fixed in build 57: the sidebar hides and the page fills the window; the same key brings it back |
| Shortcuts | Fixed in build 57: every Aux command has a default (Ctrl+Cmd keys, plus Alt+Cmd+N for Quick window and Cmd+Shift+2 for screenshot). All show in Settings › Appearance with change and reset |
| Tab row tooltips | Fixed in build 57: title and address for web pages, title only for Aux pages |
| Gap under the pins | Gone in build 57 |
| Agent button | Build 58: a flat tile like the pinned tabs (no liquid chrome) |
| Settings › Agent | Build 58: the item, heading, breadcrumb, tab title and Settings search say "Agent" |
| Closing tabs quickly | Build 59: closes queue instead of failing. The error now reads "Couldn't close that tab. Try again." and clears itself |
| `aux open <url>` and `--profile` | Work. External links open in Little Aux |
| Peek, picture-in-picture, second window with the same tabs | Work (checked on build 56) |
| Link routing and Tab cleanup dialogs | Work. With only one profile, routing between profiles can't be tested |
| Downloads | Work, and a name clash gets a safe name ("notes (2).txt") |

## Built but not yet seen on screen (build 60)

- **Archived tabs:** the in-list row is gone. Hovering the Tabs header shows an archive button, which lists archived tabs and stays lit until you go back. An empty list says "No archived tabs".
- **Sidebar button row:** it keeps only back, forward and reload. Before, the battery-saver leaf and a "»" overflow holding downloads showed up there; downloads have the footer button.
- **CLI:**
  - `aux` and `aux --help` print usage instead of an internal identity error.
  - `aux open` prints "Sent to Aux."
  - Unknown commands say so.
  - Assembly now installs the CLI built with the browser (`native_cli_open`; `scripts/release/assemble.py`, guarded by the sealed file's hash).
- **Bad `--profile` alert:** "Couldn't open the link. The profile or Space it was sent to isn't available…"
- **Settings copy** (`vendor/provided/polish/`):
  - plain Link routing and Tab cleanup intros
  - Minimal UI says what it does
  - each shortcut has its own description instead of "Assign a shortcut to this browser command."
- **Tab menu labels:** "Unload tab", "Archive tab", "Undo" (in builds 57+).

## Open

- **`aux list` and `aux resolve`:** they fail with exit 78 on release builds. The handshake with the browser fails on the CLI side. Signatures, the Developer ID certificate and the running browser's dynamic signature all check out. Recheck with the rebuilt CLI in build 60; if it still fails, add a diagnostic to `ForwardTerminal`.
- **Needs a provider or a second profile:**
  - AI download-name suggestions and @tab mentions need a model connected. I didn't enter any live key.
  - Routing between profiles needs a second profile.
- **Not reached:** Quick window by shortcut, extensions install (1Password stays with you), screenshot capture.
- **Empty tabs:** untouched "New Tab" rows from closed windows stay in the shared list.

## Resume here

1. Rebuild native for build 60:
   ```
   scripts/native-build.py third_party/ninja/ninja -C out/AuxFast chrome native_cli_open
   ```
   A build started before the toolbar change, so run it again.
2. Assemble build 60 with the usual command, launch it, and check on screen:
   - the Tabs header archive button
   - the nav row after a download
   - the Settings copy
   - `aux --help`, `aux list` and `aux resolve`
3. Export `chromium/tree`, pin it in `current-source-selection.json`, run `scripts/verify-candidate.py` and `pnpm test`, update STATUS, and commit.

Native edits for builds 57–60 are in the durable checkout and are not yet exported to `chromium/tree`.
