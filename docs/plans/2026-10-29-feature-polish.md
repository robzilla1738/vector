# Feature polish pass (2026-10-29, builds 57–63)

Robert: "for the ones that do exist make sure they are excellent." Each existing feature was used on a local Developer ID build and fixed where it fell short. Screenshots are in `out/acceptance/20261029/` (local only). Build 63 (`out/release/1.0.0-63`) holds everything below.

## Fixed and checked on screen

| Feature | What changed | Build |
|---|---|---|
| Sidebar rows and pins | Rows for web pages wouldn't open after a pin was used. Aux's user-data keys were all `const char kKey = 0`, and `-fmerge-all-constants` gave them one address, so saving a pin's URL overwrote the tab's identity. All 11 keys are now distinct strings. | 57 |
| Cmd+L | The address arrives selected; typing replaces it | 57 |
| Cmd+T/K bar | Plain words say "Search the web"; the tab you're on isn't offered; a page closed several times is listed once; no spellcheck; every tab result reads "Switch" | 57 |
| Shortcuts | Every Aux command has a default (Ctrl+Cmd keys, Alt+Cmd+N for Quick window, Cmd+Shift+2 for screenshot) and its own description in Settings › Appearance | 57, 62 |
| Minimal UI (Ctrl+Cmd+S) | Hides the sidebar and lets the page fill the window; the same key restores it. The Settings text says so | 57, 62 |
| Tab rows | Tooltips show title and address (title only for Aux pages); the menu says "Unload tab", "Archive tab", "Undo" | 57 |
| Pins | No gap under the tiles | 57 |
| Agent button | A flat tile like the pinned tabs, no liquid chrome | 58 |
| Settings › Agent | One agent, so "Agent": item, heading, breadcrumb, tab title, Settings search | 58 |
| Closing tabs quickly | Closes queue instead of failing; any error is one short line that clears itself | 59 |
| Archived tabs | Not in the list any more. Hovering the Tabs header shows an archive button; it lists archived tabs under "Archived tabs" (New Tab hidden) and stays lit until you go back | 61–62 |
| Sidebar button row | Only back, forward and reload. The battery-saver leaf and the "»" overflow that held downloads are gone; downloads have the footer button | 60 |
| Quick window (Alt+Cmd+N) | Opens with an empty field reading "Search or type a URL", not "about:blank"; the placeholder stays while the field is focused | 62 |
| Empty New Tab rows | A New Tab row whose page is open in no window is archived instead of piling up after windows close (build 63 checks real tabs; build 62 wrongly archived one that was still open) | 63 |
| CLI | `aux --help` prints usage, `aux open` prints "Sent to Aux." and unknown commands say so. A bad `--profile` gives a plain alert. Assembly installs the CLI built with this browser. | 60–61 |
| Link routing and Tab cleanup | Plain intro text; the dialogs work | 62 |

## Working as they were

- Peek: "Open Link in Peek" in the link menu, then Escape.
- Picture in picture: the video menu has it, and Auto PiP is on in Settings.
- Second window: it shares the tab list and keeps its own active tab.
- Downloads: a name clash gets a safe name ("notes (2).txt").
- Screenshot: Cmd+Shift+2 opens a capture bar (screen, full page, selection), then a preview card with copy and save.
- Extensions page: Developer mode works for your own extensions.
- Chrome Web Store: it offers "Add to Chrome".
- `aux open <url> --profile …`.

## Open, and why

- **`aux list` and `aux resolve`:** they need the browser's native CLI service, which starts only in builds with `AUX_SEALED_NATIVE_COLD_ENTRY`; the shipped configuration doesn't define it. `aux open` uses a different path and works. The CLI now says plainly that `list`/`resolve` aren't available, and help lists only `open`. Turning that service on changes startup security and is a separate decision.
- **Chrome Web Store nag:** the store shows "Switch to Chrome?" because Aux doesn't present itself as Google Chrome. Not changed, since that would mean disguising the browser.
- **Needs Robert:**
  - AI download-name suggestions and @tab mentions need a model connected. No live key was entered.
  - Routing between profiles needs a second profile.
  - Extension installs and the 1Password pairing are his to do.
- **Review profile:** it has one "Recovery — chrome://newtab" row from build 62; close it with ×.
