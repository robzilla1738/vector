# UI review checklist (Robert, 2026-10-28)

Every UI request from the 2026-10-28 review, with its state. "Verified" means checked in a real Developer ID build; "built" means compiled into the next build but not yet seen.

| # | Request | State |
|---|---|---|
| 1 | Sidebar header like Arc: traffic lights, toggle, back/forward/reload on one row; URL field alone below | Verified (build 23) |
| 2 | Collapsing the sidebar keeps the URL in the sidebar (hover the edge to reveal) | Verified (build 23); single-row preview header verified (build 40) |
| 3 | No red text in the Tabs header; Space switcher removed from the sidebar | Verified (build 31) |
| 4 | AI tidy removed | Verified (build 31) |
| 5 | Sidebar order: pinned, URL, Bookmarks, Chats, Tabs (Recent Files removed) | Verified (build 31) |
| 6 | Horizontal tabs seamless like Aside: no per-tab boxes, active tab joins the toolbar, nothing over the traffic lights | Built (build 40: strip without per-tab boxes, active tab joined to the toolbar, glass restored); horizontal mode not yet looked at |
| 7 | Bezels thinner and uniform in every view (6 DIP card inset) | Verified (build 27) |
| 8 | No hard corners behind popups (⌘T search, new tab) | Built |
| 9 | AI button inside the sidebar URL field | Superseded: the Agent's chrome button sits beside the address field (43) |
| 10 | One consistent rounding (card 10; split panes concentric) | Built |
| 11 | Split view: even spacing, no top split icon, no pane title bar, hover pill like Arc | Built |
| 12 | Drag a tab onto another tab to split, shown cleanly like Arc | Verified (build 42): dropping Downloads on the middle of New Tab opened them side by side with no crash; mid-drag the neighbours slid aside and the dragged row followed the pointer, and a dropped reorder held. Build 43: the dragged row fades over a split target, which lights up with a split glyph (the labels overlapped before), and the split no longer also shows as a chip row under the list |
| 13 | Little Aux looks and behaves like Little Arc (links from other apps open in it) | Built (opening by default; look to verify) |
| 14 | Sidebar URL field lighter; no dark box behind the text | Verified (build 33) |
| 15 | Aux logo plain white/black, no tile: tab favicons, URL field chip | Verified (build 42): plain mark for New Tab, Downloads in the sidebar foreground, site favicons load (GitHub) |
| 16 | Close (×) on tab hover | Verified (build 42): × appears on hover and closes the tab exactly as Cmd+W does. Build 41's × only archived the list entry and left a "Recovery" row for a page with live work; fixed |
| 17 | No profile button on the new tab page | Verified (build 31) |
| 18 | New tab suggestions: Aux's own, centered, unobtrusive (chip row) | Built (package edits) |
| 19 | Sidebar footer a little lower, with Downloads next to search | Verified (build 31) |
| 20 | Downloads button opens an Arc-style popover with "see all" to the full page | Built |
| 21 | Security chip ("Not Secure") rounding matches the field | Built |
| 22 | Aux Settings: no doubled borders (flush panel) | Built (package edits) |
| 23 | Side panel chat menu says "No chats yet" when empty | Built (package edits) |
| 24 | Downloads page like Arc, titled "Downloads"; no Aux logo on internal pages | Verified page (build 35); logo removal built |
| 25 | URL field focus: no blue ring, matching radius | Built |
| 26 | URL dropdown like Arc | Built (build 40: rounded panel, plain rows, no side suggestions); not yet looked at |
| 27 | No artifacts on selected/hovered tab edges | Verified (build 42): the selected row's corners are clean |
| 28 | Equal space left and right of sidebar rows | Built |
| 29 | No black box behind the search icon in the URL field | Built |
| 30 | Arc-style "Create a Space" flow | Built (build 40: + in the footer opens a name-and-color panel in the sidebar; Space dots beside it, seen in build 42); the panel not yet opened |
| 31 | Navigation never starts in the top bar on a new window | Verified (build 40) |
| 32 | Clicking the URL drops down suggestions (local history; needs some history) | Built (build 33) |
| 33 | New tab page: logo, search bar and suggestions centered top to bottom | Verified (build 40) |
| 34 | Codex banner becomes "Connect your agents", stacked Codex, Claude and agent tiles, opening AI setup | Verified (build 40) |
| 35 | Internal page icons in tabs white or theme-matched (Downloads and others) | Verified (build 42), see 15 |
| 36 | One icon size and style across the sidebar footer | Verified (build 42) |
| 37 | The downloads button opens the small popover first, "see all" goes to the page | Built (build 40); empty state built too |
| 38 | Split by dragging a tab, no crash, clean reorder without the divider bar | Verified (build 42), see 12 |
| 39 | No "Install" chip in the sidebar URL field (Arc has none; installing a site as an app stays in the menu) | Verified (build 42) |
| 40 | Installing a site as an app works and files it under "Aux Apps", not "Chromium Apps" | Built (build 42): release packaging had grown Info.plist past Chromium's allowance, so the shortcut helper aborte| 41 | No Side chats list in the sidebar | Verified (build 47): Chats list hidden |
| 42 | Agent setup clean: no clipped content or off borders | Verified (build 47): full-panel view, nothing clipped |
| 43 | Agent as a smaller button to the right of the URL field, tasteful liquid-chrome finish | Verified (build 51): chrome bezel beside the field; corner matched to the field (build 52) |
| 44 | One logo per surface (favicons and tab icons aside) | Verified (build 54): name-only panel header, swatches in pickers, one face per surface; the new tab page keeps its logo and the default-browser nudge loses its own |
| 45 | Side panel bottom: effort must not overlap other items | Verified (build 51): gap between the model, effort and context ring |
| 46 | No style or initiative options; name, picture and instructions; a few nice looks plus a custom picture | Verified (build 54): five looks plus "+"; Instructions (seed heading hidden), Memory and Routines |
| 47 | Agent not named Aux and not the Aux logo: a mascot | Verified (build 53): Otto, a silver pebble with two pill eyes, in the button, greeting and Meet Otto; the old default name migrated |
d; the allowance is raised. Installing was not repeated |

Builds 41–43 are local Developer ID builds under `out/release/`. Build 42 was launched and checked on screen (items marked build 42). Build 43 adds the split fixes in 12.

