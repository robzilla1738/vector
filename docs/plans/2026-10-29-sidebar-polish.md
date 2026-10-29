# Sidebar polish (2026-10-29, builds 71–77)

Robert: "make sure everything in sidebar is excellent. Dragging tabs, dragging tab to bookmark, dragging tab out to split with another and then what shows during that. Closing tabs, renaming etc and all icons are same size and it's beautiful and well spaced out."

The native changes are in `chromium/tree`, exported and committed with the Spaces pass in `252870228` (see "Handoff" below). Screenshots are in `out/acceptance/20261029/sidebar/` (local only).

## What changed

| Area | Before | Now |
|---|---|---|
| Dragging a tab row out of the list | Nothing happened: a row could only move within Tabs | It can land on **Bookmarks** (the card slides into the gap where the bookmark will go), on **Pins** (the card becomes a tile in the grid, or the first pin under the address field), or on the **page**: one half of the page is tinted in the Space's color, with the tab's name on a card, and dropping opens the two side by side. Pages that can't be kept (New Tab, Aux pages) only split |
| The dragged row | Translucent, so the row underneath showed through ("New Tab" printed over "New Tab") | A frosted card with a hairline edge; rows it passes over blur behind it |
| Hovering one tab over another | The dragged row vanished, leaving an empty slot | It rests faded in its place; the target row lights up with the split icon |
| Rename | A dialog | In place: double-click a row, press F2, or choose Rename. Return or clicking away keeps the name; Escape drops it. A double-click on an inactive tab opens it first; the field takes focus back from the page that opens |
| One-tone favicons | GitHub's white mark was near invisible on a light theme | A favicon that is a single gray tone is drawn in the sidebar's ink in pin tiles, tab rows and bookmark rows; colored and two-tone icons are unchanged |
| Light-mode active row | An opaque white pill | A white wash at 80%, so the theme's hue shows through |
| Empty Pins row | A second, empty row of space under the tiles (the grid was measured at its 32pt natural width, so one tile per row) | Sections measure their content at their real width; Bookmarks sits right under the tiles |
| Bookmarks empty hint | "Drag tabs here to add bookmarks" stayed on top of the dropped card | Hidden while a tab is over Bookmarks |
| "Recovery — New Tab" rows | Listed for every empty New Tab closed from the shared list | Not listed: an empty New Tab has nothing to recover |
| Footer "+" | Smaller and thinner than Downloads and Search | Same 16px grid and stroke (done in the Spaces session at Robert's request from this pass) |

## Checked on screen

On builds 71–77:
- reorder, with neighbors sliding aside;
- drop on a tab row to split;
- drag to the page to split, left or right half;
- drag to Bookmarks;
- drag to Pins, after which the tab leaves the list;
- close with the row's ×;
- rename from the menu, and by double-click (77);
- the GitHub tile on a light theme (77);
- the Pins spacing.

A split tab that is then bookmarked stays in Tabs, because split tabs are never folded into bookmarks.

## Code

- `views/frame/aux_tab_row_drop_router.{h,cc}` (new): routes a row dragged out of the list to Bookmarks, Pins or a page split, and owns the split preview window.
- `views/frame/aux_organization_tree_view.{h,cc}`: the outside-drop interface, frosted lift and faded carry, inline rename, double-click detection, and New Tab recovery filtering.
- `views/frame/aux_sidebar_body.{h,cc}`: owns the router.
- `views/frame/aux_section_clip_view.{h,cc}` and `aux_pins_section.cc`: measure content at the real width.
- `views/frame/aux_vertical_tab_bookmarks_view.cc`: hides the empty hint during a drop.
- `views/frame/aux_favicon_contrast.{h,cc}` (new): draws one-tone favicons in the sidebar ink. It's used by `aux_vertical_bookmark_row_view.{h,cc}`, `views/tabs/vertical/vertical_pinned_tab_entries_view.cc` and the tree rows.
- `ui/BUILD.gn`: the router and favicon pairs.

## Handoff

Robert made the Spaces/themes session the main one. That session exported `chromium/tree` with these files and committed it (`252870228`); this doc and the STATUS, index and checklist updates were committed after it. Builds 70 and 73 don't exist: 70's assembly overlapped another build and was stopped, and 73 failed to compile. 75 carried temporary logging. Two sessions shared the checkout this afternoon under `/tmp/aux-native-build.lock` (ninja and assembly) and `/tmp/aux-ui.lock` (any input to, or relaunch of, the running app).
