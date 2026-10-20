# Neutral Aux new-tab mark

The actual bundled Agent new-tab document now supplies a theme-colored canonical Aux vector as its tab favicon, replacing the black application-icon tile visible in v530. The owner SVG's two paths and full viewBox are preserved by lossless relative-to-absolute path conversion at its existing 80-unit local scale. This is a branding adaptation of the observed supplied neutral product-mark treatment, not a claim of copying Aside logo geometry.

The condition uses the primary frame committed extension identity and newtab.html path, including chrome://newtab virtual navigation. Other sites, extensions, and Agent pages retain their favicon. Native theme color retains light/dark/high-contrast changes; no screenshot-specific color is introduced. The favicon stays at the normal 16px slot. NewTab's existing exact recovered 12px plus is unchanged. Footer status is not invented.

Apply native.patch with the manifest pins atop v530 through the normal serialized composition path. No native checkout, build or signing was performed in this lane. Focused validation: patch dry-run and deterministic generation from both canonical SVG paths. Integrator should inspect a fresh New Tab and another site, then switch theme once.
