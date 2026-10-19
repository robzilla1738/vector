# Aux canonical arch mark

The owner supplied `/Users/rcourson/Downloads/arch-mark.svg` as the updated Aux logo on 2026-10-19 and directed its use everywhere. `arch-mark.svg` is a byte-exact copy: SHA-256 `45ba4f1d823cab3085cad8902fd17420ff5a9a5ac3139b180bfc0902875f515c`. It retains the supplied attribution comment, 1024×1024 viewBox, both path definitions, `scale(12.8)` group and 80×80 clip. The previous raster-derived symbol is superseded and remains recoverable in Git history.

No image generation, path tracing, cropping, contour fitting, smoothing or shape redesign is used. `aux-mark-white.svg` is the byte-exact white alias; `aux-mark-dark.svg` and `aux-mark-current.svg` change only fills. The shared UI, first-frame new tab and independent Vault masks use the canonical SVG. Supplied UI inline SVG replacements retain both paths/group/clip and use a 1024 viewBox inside their original 64px component slots. The original slot tint/opacity remains a rendering-role choice, not a path change.

`aux-mark-white.png` rasterizes the entire transparent 1024px SVG canvas in a disposable headless browser. Its alpha bounds are `[111,131,912,861]`; those intrinsic margins are preserved. `aux-icon-1024.png` composites that unchanged raster onto a dark `#171717` app-icon canvas. `Aux.iconset/`, `Aux.icns` and `vendor/provided-ui/branding/icon48.png` are size derivatives. `MenuBarIcon.png` and `MenuBarIcon@2x.png` are transparent 16px/32px white template derivatives for cloned Computer Use helper resources. No helper or installed browser is modified by generating these assets.

`aux-artwork-preview.png` shows the supplied shape on light/dark and icon sizes; it was visually inspected. `inventory.json` pins the source and all active derivatives, consumer locations, and the separately staged native proposal. `aux-approved-source.png` from the obsolete raster process was removed from the active asset directory; its original bytes remain in prior commits.

## Reproduce

Pillow and an explicitly disposable headless Chrome profile are used only to rasterize local SVG. No owner profile, network resource or OS grant is needed.

```sh
python3 scripts/prepare-aux-artwork.py
node scripts/make-icon.mjs
python3 scripts/propose-native-branding.py --source-root /path/to/chromium/src
node scripts/record-aux-brand.mjs
node --test scripts/lib/aux-mark.test.mjs
```

`make-icon.mjs` uses macOS `sips` and `iconutil` for the iconset/ICNS. The native proposal under `docs/integration/proposed/native-branding-assets` includes 23 narrowly listed product-brand resources, each with a baseline and replacement hash. Generating the proposal changes no live Chromium file. Root subsequently applied all23 through compositionv24; `applied-v24.json` records their verified current hashes. The full native build is running; final packaging, signing and installation remain pending. The proposal manifest and inventory retain their original proposal-time status. Four original wide wordmark canvases retain their 97×22 or 194×44 dimensions with the canonical mark in the original leading square and transparent remaining width; no new text artwork is invented. Functional/provider icons are excluded.

Historical `vendor/aside/patches/extensions.mjs` still belongs to the superseded staging path; its old single-path artwork extractor must not be used for this logo. The active faithful stager is `scripts/lib/provided-ui.mjs`, which uses `scripts/lib/aux-mark.mjs` and verifies both paths. Historical screenshots and prior source snapshots remain historical evidence, not active branding assets.
