# Desktop acceptance journeys

The single Batch 3 pass, run with `aux_drive.py` against the current candidate. Recipes come from `docs/integration/proposed/completion-20261026/desktop/acceptance/README.md`. Run each group once and record every ID with `aux_drive.py record ID accepted|defect|external "what was seen" shots...`. Collect defects, fix them in one build, then rerun only the failed IDs.

Setup: `python3 scripts/acceptance/aux_drive.py check` must report all three permissions ok. Start the fixture server with `python3 -B docs/integration/proposed/completion-20261026/desktop/acceptance/browser-fixture.py`; it prints its loopback URL, called FIXTURE below. Then `aux_drive.py launch`.

## 1. Lifecycle and isolation

| ID | Steps | Accepted when |
|---|---|---|
| L-finder | `open -a` the app from Finder, without the workspace launcher | It reaches the profile picker or restores windows, with no refusal line |
| R07 | Open FIXTURE`/?profile=work` and `/?profile=personal` in the two profiles and save a distinct note in each | Each profile sees only its own note; each can have its own theme |
| L-persist | Create a Space, set a theme and remap one shortcut; Quit; relaunch | All three persist |
| L-abort | `aux_drive.py abort`, then `launch` | The daemon exits within about 21 s and relaunch works |
| L-close | Close a window that has a protected or unsaved page | The close prompt appears |

## 2. Organization and windows

| ID | Steps | Accepted when |
|---|---|---|
| R01 | Pin a tab to all Spaces; create a pinned folder; close the pinned tab | It shows in every Space and unloads instead of closing |
| R02 | Nest one folder in another | The nesting persists and collapses |
| R03 | Create a Space with an icon from + and by swipe; switch Spaces with the mouse wheel | All three work |
| R04 | Collapse and expand bookmarks and pins | State persists across relaunch |
| R06 | Lower the inactivity threshold, wait, and check the tab | It is archived and Undo restores it |
| R19 | Open a second window on the same profile | Same tab list, independent active tab and Space |
| R21 | Split four fixture pages; change orientation, resize, focus and close one pane; restore after relaunch | All work; the split restores ("View 1 of N") |
| R21-menu | Open the split toolbar menu | No "Send Feedback" item |

## 3. Navigation and layout

| ID | Steps | Accepted when |
|---|---|---|
| R08 | Visit FIXTURE`/a?b=c#d` | The full URL is shown in every URL surface |
| R14 | Press Cmd+T, Cmd+K and Cmd+L | Cmd+T opens the centered palette and creates no tab until commit; K and L route correctly |
| R15 | Remap an allowed shortcut; try a reserved one | The allowed remap works; the reserved one is refused with a hint |
| R27 | Add a site rule that routes a host to the work profile; open it | It opens in the work profile |
| R28 | Run `aux open URL --profile work`, `aux list`, `aux resolve URL` from the installed CLI | Correct profile, JSON list, resolve decision |
| R09 | Toggle the sidebar between docked and auto-hide, and hover to reveal it | Smooth, correct states |
| R10 | Toggle minimal edge-to-edge mode | Chrome hides and restores |
| R11 | Use the sidebar URL field and back/forward | They work while the sidebar is open |
| R12 | Open the theme editor; cancel, then apply | Cancel reverts; apply persists |
| R13 | Watch tab open/close and button presses | Motion, rounded corners, active shadow and pressed state are present |
| R16 | Peek a link; dismiss; peek again and promote | Preview, dismiss and promote work |
| R17 | Open a Quick Window and hand it off to a full window | Both work |

## 4. Files, media and tools

| ID | Steps | Accepted when |
|---|---|---|
| R22 | Download both FIXTURE `notes.txt` files and the image | A collision gets a distinct name; content is right; smart rename is offered |
| R25 | Rename and Undo in Recent Files; drag a file into the composer; relaunch | All work; the attachment content is restored |
| R26 | Play the FIXTURE video and pop it out | PiP opens and controls work |
| R29 | Toggle developer mode; open pane-bound DevTools | DevTools attaches to the right pane |
| R30 | Take a region screenshot and a full-page capture | Both are saved and attachable |

## 5. AI (Muse Spark 1.3 Contributor only, $1 cap; remove the connection afterwards)

| ID | Steps | Accepted when |
|---|---|---|
| A-connect | Add the authorized Gateway connection in Settings; select the model | Connected, model listed |
| A-stream | Ask a question with page and tab context; then cancel a second request | The stream completes; cancel stops it |
| R23 | Reference a tab with @ in chat | The answer uses that tab |
| R24 | Run a page action and a grounded search | Results cite the page |
| R05 | Run Tidy Tabs, then Undo | Tabs are grouped; Undo restores them |
| A-files | Attach the TXT, image, PDF and HEIC fixtures; ask about each | Content is read correctly |
| A-pdf | Ask the REPL to read the PDF with `aux.pdf` | Text returned |
| A-memory | Save a memory; search for it | Found with a citation |
| A-routine | Create a device routine; run it | It runs on "This computer" and notifies |
| A-cleanup | Remove the Gateway connection | It is gone from Settings |

## 6. External (record as `external` unless its prerequisites exist)

| ID | Needs |
|---|---|
| R18 | Official extension install and autofill. Desktop-app pairing needs a signed app in `/Applications`. Use Robert's existing personal 1Password account (his choice, 2026-10-28) with one clearly named dummy fixture login; never read, use, export or change real saved logins, and keep desktop accounts signed in |
| X-native-host | A native-messaging host round trip through the host lease, using a dummy host |
