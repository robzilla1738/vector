# Remove the actual Agent toolbar seam and restore the resting search glyph

The v527 signed screenshot shows a light one-pixel line despite transparent separator color. MultiContentsView::CalculateLayout reserves the ContentsSeparator preferred height before placing the renderer. That unpainted pixel exposes native material without the supplied80% tint. The fix disables both top separator reservations for a real committed Agent primary document when there is no infobar or split view. High contrast and other pages retain their rules. This removes the actual gap, not another color override.

The authenticated NTP's resting native location icon now takes the default search provider favicon path, producing a Google badge. The observed Aside address bar instead retains its plain magnifier. GetLocationIcon returns Chromium's existing standard search vector only for an empty resting non-keyword address bar; focused, edited, contextual and ordinary URL security icons retain existing behavior. LocationIconView clears the empty search glyph background after icon updates so branded-theme logic cannot leave an opaque circular backing over the shared tint.

This is a narrow observed-reference adaptation in native owners. No supplied page/CSS changes, search engine changes, fabricated state or screenshot-color selection. The former audit that separator paint was transparent was correct but insufficient: its reserved layout gap was visible over material.

Exact three current source preimages/outputs pinned; patch application passes. No shared native edit/build/sign/launch performed. Integrator should inspect empty NTP, address focus/edit/escape, ordinary site security icon and page switching in the combined build.
