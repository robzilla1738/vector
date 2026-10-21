# Observed domain-button and focused site controls

The integrator observed the supplied desktop browser on an HTTPS external page: resting domain is an accessibility button; clicking opens native PageInfo (connection, site settings and cookies). Cmd+L replaces the resting display with the full URL editor and site-information then bookmark controls on the right. This is an observed Chromium155 integration adaptation, not a claim of recovered original C++.

Use the existing ShowPageInfoDialog for the origin button and expose that button to accessibility. Restrict its hit area to the origin text width, leaving title/remaining URL area to the existing editor. On secure normal HTTP(S) pages only, the neutral location icon is absent at rest and the same genuine LocationIconView is a trailing decoration when editing. Nonsecure levels, textual security warnings, keyword and overriding permission-chip paths are preserved. Full URL text/model, Cmd+L, selection, copy, and native PageInfo implementation are unchanged.

The bookmark PageActionView is hidden only during the existing resting origin/title presentation. Its GetDeclaredVisible getter reads model-declared eligibility stored separately from actual SetVisible; neither model visibility nor Cmd+D changes. Focus restores only a model-eligible star. Actual ordinary action model updates remain authoritative.

Pinned to native v550. Single-file replay and output SHA verified. No shared native/build/UI actions by this lane. Runtime acceptance: secure resting domain opens PageInfo; title/Cmd+L edits full URL; focused site-info then bookmark at right; warning and permission states remain visible; narrow width clips origin safely. Exact original spacing is not newly invented.
