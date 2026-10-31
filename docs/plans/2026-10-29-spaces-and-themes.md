# Spaces, profiles and themes (2026-10-29, builds 64–69 and 80–81)

> **Superseded:** the [finish plan](../ROADMAP-EXECUTION-GRAPH.md) replaces this page wherever they disagree. It stays for its decisions and history.

Robert asked that profiles and Spaces be customizable the way Arc does it: a color per Space and per profile, an emoji per Space, a theme editor, and a Create a Space flow that works well. He then asked that the color reach both sidebars, the New Tab page and dropdowns; that the theme be Aux's own rather than a copy of Arc's, with borders that follow it and contrast handled for the user; that everything be one uniform shade rather than lighter in some places; and for terminal-style default themes. Builds 70–79 belong to the parallel sidebar session ([sidebar polish](2026-10-29-sidebar-polish.md)); the two sessions shared the durable checkout under build and UI locks. The native changes are in the durable checkout and exported to `chromium/tree`. Screenshots are in `out/acceptance/20261029b/` (local only).

## The model

- **A Space has its own theme**, stored per Space ID in the profile pref `aux.theme.spaces`. A Space without one uses the **profile theme** (`aux.theme.tokens`, the same store the Settings › Appearance dialog edits). So the profile's color is the default every Space starts from.
- **A Space's icon** is its existing `icon` field, now an emoji. An empty icon (or the old `◉` placeholder) shows a dot in the Space's color.
- Theme tokens gained `colors` (2–3 colors, a gradient starting at `tint`) and `grain` (0–1), and `tintStrength` now runs to 1. If the Settings dialog changes only the tint, the gradient is dropped rather than refused.
- Each window shows its active Space's theme. The window's color key carries the Space, and switching Spaces recolors only that window.
- **One shade:** a themed window has one color, C, used for the sidebar, the gutter around the page, the toolbar, the Agent side panel, bubbles, dropdowns, menus and dialogs, and Aux's own pages (New Tab, side panel content, command bar). Gradients and grain paint across the window's frame in one coordinate space. Native macOS context menus stay system menus.
- **Steps, not new colors:** on Aux's pages, cards and popovers are C stepped 6% toward the text color, muted fills 9%, hover 12%, borders and inputs 16%. Native separators, dividers, the page-card outline and toolbar lines are the readable ink of C at about 16% alpha (bubble borders 20%), so lines carry the hue and never vanish.
- **Contrast:** C is the theme color laid over the mode's base at the chosen intensity, eased back only as far as needed to keep the mode's own text (near white in dark, near black in light) at 7:1. Every gradient stop is held to the same rule. Aux's pages are put into the window's light or dark mode so their text matches C; clearing the theme restores the page's own mode. A Space dot whose color is too close to the sidebar shade is drawn in the sidebar ink instead.
- With a colored theme, the sidebar paints the theme over the window material (it was transparent over the system gray in the default Tinted style, so a theme only changed accents). Gradients and grain are painted across the whole window in one coordinate space.

## What you can do

| Where | What |
|---|---|
| Footer | One icon per Space (emoji, or a dot in its color), shown even with a single Space. Click selects; right-click opens the Space menu |
| Space menu | Edit Theme…, Change Icon…, Rename…, New Space…, Delete Space… |
| Theme picker | Aux's own design, shown in the window's shade: Auto/Light/Dark as one segmented control; a smooth color plane (hue across, light to deep down) holding up to three colors; a Colors row to pick, add or remove one (two or three blend into a gradient); ten Aux presets (Graphite, then Ocean, Iris, Aurora and Sunset after the agent's looks, then Ember, Rose, Dune, Moss, Glacier); ten terminal classics (Dracula, Nord, Solarized Dark and Light, Gruvbox, Tokyo Night, Catppuccin Mocha and Latte, One Dark, Rosé Pine), each setting its background at full strength, its accent and its mode; and labeled Intensity and Grain sliders with values. Changes show live; clicking away or Done keeps them; Escape puts the old theme back. "Use profile theme" removes a Space's own theme |
| Emoji picker | 48 common emoji, a field that takes any typed or pasted emoji (first character), "All emoji…" for the macOS viewer, and "No icon" |
| Create a Space | Icon, name and color (profile color, eight solids, or a custom color through the full picker). The window previews the color as you pick. Create waits for any save already in flight instead of failing, saves the color as the Space's theme and opens the new Space on a fresh tab. The New Space command (palette/shortcut) opens the same panel |
| Delete Space | Confirms first. Open tabs and folders move to the neighboring Space; its archived tabs and its theme are deleted. Never closes a page |
| Switching Spaces | The window shows the Space's most recent open tab, else reopens its most recent saved tab, else starts an empty Space on a new tab. Before, the previous Space's page stayed on screen |
| Profile menu › ⋮ › Theme | The profile theme picker, with a line saying it applies to every Space without its own theme |

## Bugs fixed on the way

- Creating a Space failed with "profile changed or saving" whenever a tab title or activity write was still in flight. Space commands now wait for it to settle (up to 5 s).
- No visible way to rename, re-icon or delete a Space; the old switcher was removed in an earlier pass.
- Escape in a button-less bubble closes instead of cancelling, so the first build saved the theme on Escape (fixed in 65).
- Emoji cells elided to "…" (fixed in 65). Grain was drawn at 1x on Retina (2x tile in 66).
- `kRemoveEmptySpace` refused any Space that had ever had a tab (archived ones count). The new `kDeleteSpace` model action removes a Space and its archived records once its open ones are moved out in the same batch; a unit test covers it (`organization_model_unittest.cc` is not in a build target, so it was not run).

## Checked on screen (builds 64–65, 68, 80–81)

Builds 80–81: Ocean, then Dracula and Solarized Light as one shade across the sidebar, gutter, toolbar, Agent side panel, New Tab page, command bar and picker; the Space dot stays visible on a matching theme. Build 68: the Aux picker layout and presets. Builds 64–65: Space menu; theme picker for a Space, with live preview of a solid, then a gradient plus grain; Escape revert (65); emoji grid (65); Change Icon; Create a Space with an emoji, a name and orange, previewed and then saved; switching between Spaces recolors the window and shows each Space's tab; Delete Space moves its tab to the neighbor and removes its theme; the profile Theme item and picker.

## Not checked yet

- Auto on a Space whose mode differs from the system (Light was checked with Solarized Light in build 81). The macOS window material and system context menus follow the system, not the Space.
- Two windows on the same profile showing different Spaces at once.
- Quit and reopen with Space themes (the prefs persist; restore wasn't observed).
- Renaming through the dialog, and the macOS emoji viewer path ("All emoji…").
