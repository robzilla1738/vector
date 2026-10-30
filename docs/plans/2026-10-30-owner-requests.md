# Owner requests ledger

Everything Robert has asked for in this round, in his order. The final audit checks this list and [the plan](2026-10-29-browser-excellence.md) against the code and the running build. Status here is set only by that audit or an on-screen check, never by a progress note.

Status: **seen** (checked on screen), **built** (in code, not yet seen), **open** (not done), **his** (needs Robert or a login).

## Frame, borders, surfaces

| # | Request | Status |
|---|---|---|
| 1 | Borders right by the sidebar clean; one shade, the sidebar color everywhere | seen |
| 2 | Top area not messy; plugin in the sidebar as Arc does; URL full width; Aux moved elsewhere | seen |
| 3 | Footer sits lower on the sidebar | seen |
| 4 | Right sidebar layout, width and edges correct | seen |
| 5 | No doubled collapse icons | seen |
| 6 | New Tab page and popups match theme settings and layout | seen |
| 7 | Rounded corners perfectly uniform | seen |
| 8 | Bezels and border gaps like Arc around the center and both sidebars | seen |
| 9 | Rounded border clean where it meets the left sidebar | seen |
| 10 | Same gaps in split view and other layouts; right sidebar follows them | seen |
| 11 | Theme changes repaint everything; layout stays put when customizing a theme | seen |
| 12 | URL area follows the theme | seen |
| 13 | Search/Ask follows the theme | seen |

## Sidebar and tabs

| # | Request | Status |
|---|---|---|
| 14 | URL bar sits directly above Tabs, not at the very top | seen |
| 15 | Drag a tab to Bookmarks | seen |
| 16 | Drag a tab over another tab with a well-thought-out split preview | seen |
| 17 | Hover a tab shows a preview | seen |
| 18 | A split is one tab showing both, never the tabs individually as well | built; a drag split seen, other routes not reproduced |
| 19 | Collapsed: no traffic lights over the page, as in Arc | seen |
| 20 | Hover pop-out is full height with the traffic lights in it, so it doesn't go away | seen |
| 21 | Hover pop-out outline correct in every theme | seen (navy, light, green, unthemed) |
| 22 | Pins separate per Space | built (leak fixed in code; re-check) |
| 23 | Bookmarks separate per Space, regardless of cookies | seen |
| 24 | Agent thread follows cookie sharing; can be separate across Spaces | built |

## Pages and panels

| # | Request | Status |
|---|---|---|
| 25 | New Tab stays centered; the Chats view doesn't come back | seen |
| 26 | Site panel and extensions like Arc: simple buttons, a layout that expands | seen |
| 27 | Hide Send feedback | built |
| 28 | Clean up the Max plan | built |
| 29 | Clean up UltraBrowse | built |
| 30 | Onboarding brings over passwords if possible | built (Chromium family and Safari; Firefox and Zen not possible; real import is his) |

## Runtime and build

| # | Request | Status |
|---|---|---|
| 31 | Do the runtime work | seen (inventory found nothing above macOS 15 beyond the PDF stack; rg fixed) |
| 32 | Everything in the plan complete and ready to test | open: see [the second audit](2026-10-30-plan-audit-2.md) |
| 33 | Every item in the plan and from Robert done and excellent | open |

## Standing rules from earlier in the work

Isolated Spaces get their own extensions. Rewrite only the supplied parts Aux can't build. Cmd+T opens the centered command bar. macOS 15 is the floor. No "Sign in with…"; drive local agent CLIs. The window opens before the daemon is ready. Spaces replace profiles. Preserve settled design decisions. Don't over-test. Update all docs.
