# Sidebar favicon presentation owners

Reuse the exact supplied16px bookmark fallback-page vector for HTTP(S) tabs with no valid favicon, themed by the toolbar-icon role. Preserve all actual site favicons and special-page defaults. This avoids selecting a faint raster variant against a translucent tab background. The exact page path/descriptor is copied byte-for-byte from the existing recovered bookmark glyph include; no new glyph is drawn.

Move canonical transparent Aux artwork to actual bundled Agent favicon producer, covering Settings and NewTab live tabs. Pinned rows now accept every valid ImageModel, including native vectors and generators, instead of discarding them and fetching boxed raster artwork. Saved Agent/newtab tiles explicitly use the canonical vector too, so closed pins cannot reinstate the old boxed icon from favicon storage. No favicon DB, profile prefs or remote requests changed. Actual external site artwork remains intact.

Three file targets (two edited, one include-only source addition); no GN compilation unit or header changes. Pins actual551. Patch dry-run, exact copied glyph proof and mutation-count checks only; no shared edit/build. Integrator checks favicon-less ExampleDomain active/inactive, real favicon site, and live/closed Agent NewTab+Settings saved tiles.
