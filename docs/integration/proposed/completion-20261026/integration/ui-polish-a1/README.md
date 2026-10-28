# ui-polish-a1

The 2026-10-27 UI pass with real input, signed in to the production test account, covered the sidebar, sidebar navigation, settings, the Cmd+T palette, split view, Peek, Mini popup and the menus. This lane holds the fixes. Candidate edits are in `edits.json` (applied with `scripts/candidate/prepare_edits.py`); native edits are in the durable checkout and exported with `scripts/chromium-tree.py`.

## URL bar in the sidebar

Already built: Settings › Appearance › **Navigation in sidebar** (`aux.sidebar_navigation_enabled`, `aux_navigation_placement.cc`) moves the real toolbar and location bar into the open sidebar, and the page goes full height. Typing a URL there navigates, and the full URL shows. It falls back to the top toolbar when the sidebar is collapsed, in full screen, or too narrow.

Defect fixed: with it on, the traffic lights dropped about 17 pt below the sidebar toggle. The titlebar height took the toolbar's two-row minimum height. `BrowserView::GetFrameElementInfo` now leaves out the location row (`ToolbarView::GetAuxSidebarNavigationRowHeight`).

## Fixes

| Surface | Seen | Fix |
|---|---|---|
| Peek | Opened centered on the whole display, not over its window; Escape did nothing; clicking back on the browser window left Peek open behind it | Centered over the source window and kept on screen; Escape (when the page does not use it) and activating the source window dismiss it. Dismissal arms only after Peek has been active, so the context menu closing cannot dismiss it while it opens (`aux_preview_controller.cc`, `aux_preview_controls.cc`) |
| Link context menu | "Open link in Peek" among Title Case items | "Open Link in Peek" |
| Recent files | Every file showed the website globe | Photo, video or document glyph from the file extension |
| Split view tab chooser | Aux pages showed the extension ID `gokkff…` as their site | "Aux" (`tab_search/tab_data.ts`) |
| Cmd+T palette | Aux pages showed `chrome-extension://gokkff…/newtab.html` | "Aux" (`vendor/provided/aux-navigation-command-bar.mjs`) |
| Settings, chats and tasks search | Placeholder "Search.." | "Search…" |
| Mini popup | Default Shift-Command-Space belongs to Visual Intelligence on macOS 27 (and 1Password took it here), so the popup never opened | Default is now Control-Shift-Space |
| View menu | "Always Show Image Search Shortcut" and "Always Show AI Mode" (Lens and AI Mode are off in Aux) | Removed |
| Signed-in Quit | About 25 s | Service: `/users/settings` merges partial writes and always returns `sync`. Daemon: a failed account event refresh reaches its caller but no longer counts as unsettled broker work, so an offline or failed refresh cannot hold the native owner at Quit |
| app.getaux.co | No favicon, so its tabs showed a globe | `app/icon.png` (Aux icon) |

## Seen and left

- The sidebar's Transparent style lets bright windows behind it show through strongly. Tinted is the alternative in Appearance; the default stays as supplied.
- The second "Enter Full Screen" in View is AppKit's hidden alternate item, not a duplicate.
- The device row shows the daemon component version `1.26.1016.1852`; the app version is `1.26.1016.1888`. Changing the daemon's version string would change component replacement, so it stays.
- When the sidebar address field is edited on an Aux page, the "Aux Browser" chip is clipped by Chromium's leading-decoration width cap.

## Second batch: Arc and Aside as the reference (seal `32ab761c`)

The owner asked for a clean version of Arc's and Aside's sidebar, split view and Little Arc, with no Google-branded content. References were captured from the local Arc and the running Aside (read only; the Arc test tabs were closed again) into `out/acceptance/20261027/ref/`:

- **Arc sidebar:** back, forward and reload in the traffic-light row; a filled "Search or Enter URL…" field showing the domain; a pin grid; the Space name with a divider; "+ New Tab"; tabs.
- **Aside sidebar:** opaque, Pins as a 3-column tile grid, thin dividers between Bookmarks, Chats and Tabs, 13 pt rows.
- **Little Arc:** one bar with a centered address field and "Open in Personal ⌘O".
- **Arc split view:** rounded pane cards, each with a slim header (back, forward, domain, close), the active pane outlined, one sidebar row with both tabs.

Shipped in this batch:

| Surface | Change |
|---|---|
| Sidebar navigation | The address field in the sidebar keeps its filled field background at rest (`LocationBarView::RefreshBackground`); the top toolbar stays flat |
| Split view | Pane labels show the domain only (`multi_contents_view_mini_toolbar.cc`); the tooltip keeps the full address without credentials |
| Peek and Quick window | Back on the left, the address, and an "Open in Aux" button at the trailing end; the "Peek · profile" label shows only when a restriction needs explaining; the dismiss button stays on Peek only. Verified: Escape and clicking the window dismiss Peek; "Open in Aux" moves a Quick window page into the main window |
| Google content | The profile picker and the tangible-sync sign-in pages no longer show the Google Material banner shapes. Lens and AI Mode menu items were removed in the first batch |

Still different from the references (next steps):

- Back, forward and reload sit on a second row instead of the traffic-light row, and the downloads, extensions and split buttons share that row.
- Split pane labels sit at the bottom of the pane; Arc puts a header at the top.
- Scrolling the tab list slides rows under the fixed "Pins" header.
- Typing in the Cmd+K palette ranks "Recent files" above a matching command.
- Little Arc's address shares the traffic-light row; Aux's popup keeps a separate title row.
