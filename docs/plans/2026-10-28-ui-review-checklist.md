# UI review checklist (Robert, 2026-10-28)

Every UI request from the 2026-10-28 review, with its state. "Verified" means checked in a real Developer ID build; "built" means compiled into the next build but not yet seen.

| # | Request | State |
|---|---|---|
| 1 | Sidebar header like Arc: traffic lights, toggle, back/forward/reload on one row; URL field alone below | Verified (build 23) |
| 2 | Collapsing the sidebar keeps the URL in the sidebar (hover the edge to reveal) | Verified (build 23); single-row preview header verified (build 40) |
| 3 | No red text in the Tabs header; Space switcher removed from the sidebar | Verified (build 31) |
| 4 | AI tidy removed | Verified (build 31) |
| 5 | Sidebar order: pinned, URL, Bookmarks, Chats, Tabs (Recent Files removed) | Verified (build 31) |
| 6 | Horizontal tabs seamless like Aside: no per-tab boxes, active tab joins the toolbar, nothing over the traffic lights | In progress (glass restored; strip polish with agent) |
| 7 | Bezels thinner and uniform in every view (6 DIP card inset) | Verified (build 27) |
| 8 | No hard corners behind popups (⌘T search, new tab) | Built |
| 9 | AI button inside the sidebar URL field | Verified (build 27) |
| 10 | One consistent rounding (card 10; split panes concentric) | Built |
| 11 | Split view: even spacing, no top split icon, no pane title bar, hover pill like Arc | Built |
| 12 | Drag a tab onto another tab to split, shown cleanly like Arc | Built (build 41): in the sidebar's tab list, dropping on the middle of a tab splits the two side by side and the target row lights up; above or below it reorders, with neighbours sliding aside to open a gap and the dragged row following the pointer. No divider bar. The build 38 crash on split (toolbar overflow layout) is fixed |
| 13 | Little Aux looks and behaves like Little Arc (links from other apps open in it) | Built (opening by default; look to verify) |
| 14 | Sidebar URL field lighter; no dark box behind the text | Verified (build 33) |
| 15 | Aux logo plain white/black, no tile: tab favicons, URL field chip | Built (build 41): sidebar tab rows draw the plain mark for the new tab and Agent pages; other internal pages (Downloads, Settings) draw their icon in the sidebar foreground, white in dark |
| 16 | Close (×) on tab hover | Built (build 41) in the sidebar tab rows: closes a tab, unloads a pinned one (Arc) |
| 17 | No profile button on the new tab page | Verified (build 31) |
| 18 | New tab suggestions: Aux's own, centered, unobtrusive (chip row) | Built (package edits) |
| 19 | Sidebar footer a little lower, with Downloads next to search | Verified (build 31) |
| 20 | Downloads button opens an Arc-style popover with "see all" to the full page | Built |
| 21 | Security chip ("Not Secure") rounding matches the field | Built |
| 22 | Aux Settings: no doubled borders (flush panel) | Built (package edits) |
| 23 | Side panel chat menu says "No chats yet" when empty | Built (package edits) |
| 24 | Downloads page like Arc, titled "Downloads"; no Aux logo on internal pages | Verified page (build 35); logo removal built |
| 25 | URL field focus: no blue ring, matching radius | Built |
| 26 | URL dropdown like Arc | In progress (agent) |
| 27 | No artifacts on selected/hovered tab edges | Built (build 41): the selected row's blurred shadow was clipped to the row into dark corner wedges; it now keeps a one-pixel edge inside its bounds |
| 28 | Equal space left and right of sidebar rows | Built |
| 29 | No black box behind the search icon in the URL field | Built |
| 30 | Arc-style "Create a Space" flow | In progress (agent) |
| 31 | Navigation never starts in the top bar on a new window | Verified (build 40) |
| 32 | Clicking the URL drops down suggestions (local history; needs some history) | Built (build 33) |
| 33 | New tab page: logo, search bar and suggestions centered top to bottom | Verified (build 40) |
| 34 | Codex banner becomes "Connect your agents", stacked Codex, Claude and agent tiles, opening AI setup | Verified (build 40) |
| 35 | Internal page icons in tabs white or theme-matched (Downloads and others) | Built (build 41), see 15 |
| 36 | One icon size and style across the sidebar footer | Built (build 40: + at 14, matching search and downloads) |
| 37 | The downloads button opens the small popover first, "see all" goes to the page | Built (build 40); empty state built too |
| 38 | Split by dragging a tab, no crash, clean reorder without the divider bar | Built (build 41), see 12 |

Build 41 (`out/release/1.0.0-41`, Developer ID, local) holds everything above. It was assembled and signature-checked but not launched, because the owner was using build 40 with the same state folder.

