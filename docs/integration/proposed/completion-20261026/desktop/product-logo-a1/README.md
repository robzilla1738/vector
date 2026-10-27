# product-logo-a1

Replaces the remaining Chromium product-logo artwork in the Aux Chromium tree with artwork derived from `assets/brand/arch-mark.svg`. Only logo artwork changes; no C++ call sites, strings, layout or legal notices change.

- `baseline/` holds the original files at their Chromium-relative paths; `source/` holds the replacements. `projection.json` records both SHA-256 values per file (`outputSha256` equals `sourceSha256`, matching the earlier batch format).
- `generate.py <chromium-src> <workspace-root> <out-dir>` reproduces `source/`. It reads both arch-mark paths verbatim. SVG outputs embed the unchanged path data; `.icon` outputs are an exact scale transcription of the same paths (the single `s` segment is expanded to its equivalent full relative cubic).
- Monochrome icons (`product.icon`, both `chrome_product.icon`, `product_chrome_refresh_old.icon`, `product_old.icon` at 32 and 16) contain only the mark and keep taking their colour from the caller.
- The multicolour `product_refresh.icon`, `product_logo.svg` and `product_logo_animation.svg` use the same composition as the already applied `product_logo_*.png` files and `aux-icon-1024.png`: a white mark on a full `#171717` canvas. The animation file keeps its 160-unit canvas with a centred 80-unit logo, because the intro page sizes it at twice the logo slot, and keeps the original one-second opacity reveal.

Surfaces: profile picker and intro, search-engine choice, feature showcase, default-browser modal and guided setter, and omnibox-everywhere WebUI (`IDR_PRODUCT_LOGO_SVG` and `IDR_PRODUCT_LOGO_ANIMATION_SVG`). Also startup, session-restore, default-browser, pin and PDF infobars, the default-browser bubble, the task manager, contextual-tasks and autofill popups, app menu and toasts, and omnibox pedals and searchbox (`kProductIcon`, `kProductRefreshIcon`, `kChromeProductIcon`, `kProductChromeRefreshOldIcon`, `kProductOldIcon`).
