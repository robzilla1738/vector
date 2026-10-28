# ui-polish-c1

Third UI batch, from the owner's review of `32ab761c`: "uniform spacing around the browser main view at all times, including split views", "in the Little Arc style window I don't like the button", "the sidebar is still randomly laid out".

| Surface | Change |
|---|---|
| Page view | The page is one rounded card with the same 8 DIP inset on every side: a single page or split, toolbar on top or in the sidebar. Full screen stays flush. `MultiContentsView::SetAuxCardLayout`, set from `BrowserViewTabbedLayoutImpl` for vertical-tab windows on macOS |
| Split view | The gap between panes is 8 DIP (`MultiContentsResizeArea::kHandleResizeAxisPadding` 6 → 4, plus the 4 DIP handle), matching the outer inset |
| Peek and Quick window | "Open in Aux" is a quiet chip in the address field's neutral fill and the toolbar text color, not a tinted pill |
| Cmd+K palette | "Recent files" shows only for an empty or matching query (`edits.json`, `vendor/provided/aux-productivity-files.mjs`) |
| Sidebar | One grid: pills and tiles 8 px from the edge, header text and row icons at 16, 32 px rows with 2 px gaps, one header style, thin dividers between sections (Recent files gains one). Tidy and Clear are 24 px icon buttons. The Space name and "+" use the muted row color. Pins hides when nothing is pinned |
| Navigation in sidebar | Arc's header: traffic lights, the sidebar toggle and back/reload share one row; the address field sits directly below. The caption row leaves the flex pass and is placed over the toolbar, so Pins and the body follow in the normal layout. Forward is the last button to overflow |

## Left as is

- Split pane labels stay in Chromium's bottom-right flap, now domain only. Arc's header sits at the top, but it reserves a strip above the page. Moving the flap to the top without that would cover each page's top-right controls, and a reserved header changes Chromium's pane outline and focus model.
- Peek and Quick window keep the macOS title row above their bar; Little Arc merges them.

## Verified (seal `6b81a1bb`)

Real input, Tinted transparency: the merged navigation row, address field, section order and dividers; Pins hidden when empty; the page card's even inset in single and split view; split chooser labels; quit 6.4 to 8.0 s signed in.

## Open

- With one Aux pin, the tile's icon draws right of center. The tile code is unchanged and centers its icon, so this came from this batch's section changes; not yet traced.
- At the default sidebar width, forward goes to the overflow menu (the extensions button is not a responsive element). A wider sidebar shows it.
- The Transparent style lets bright windows behind show through strongly. Tinted, which matches Aside, is clearer; the default stays as supplied.
- The first Pins tile layout with a third-width grid was tried and reverted: one pin stretches across, as before.
