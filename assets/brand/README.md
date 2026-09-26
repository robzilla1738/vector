# Aux artwork

The user approved the generated colored icon on 2026-09-20. `aux-approved-source.png`
preserves that output. Its exterior fringe was removed by deterministic masking;
the interior artwork was retained. The matching white mark is extracted from this
same colored icon, rather than the separately generated, differently shaped mark.

- `aux-icon-1024.png`: RGBA macOS master. Artwork is centered in an 824px box on
  a 1024px canvas, with transparent exterior and balanced approximately 100px insets.
  This is the padded flat asset for the current Electron/ICNS integration.
- `Aux.iconset/`: all ten macOS standard/Retina entries, 16 through 1024 physical pixels.
- `../icon.icns`: compiled native icon used by electron-builder.
- `aux-mark-white.svg`: scalable, pure-white transparent silhouette.
- `aux-mark-white.png`: matching transparent raster, 847 × 671px, including 24px insets.
- `aux-artwork-preview.png`: inspection sheet on light/dark backgrounds and at small sizes.

The renderer uses the mark as a theme-colored CSS mask, so it stays legible in both
appearances. The favicon, About panel and development Dock use the colored PNG.
No black canvas, checkerboard, shadow or extra corner clipping is applied.

## Rebuild

The approved source is committed; image generation is not part of a build.
To re-extract deterministically from it, run from the repository root:

```sh
uv run --python 3.9 --with pillow==11.3.0 --with numpy==2.0.2 --with scipy==1.13.1 --with opencv-python-headless==5.0.0.93 python scripts/prepare-aux-artwork.py
node scripts/make-icon.mjs
```

The second command requires macOS `sips` and `iconutil`; it validates the master,
resizes directly from it, preserves alpha, refreshes the renderer PNG and iconset,
and replaces the ICNS only after successful compilation. The old Quick Look SVG
thumbnail step was removed because it could flatten the background.

Apple references: [app icons](https://developer.apple.com/design/human-interface-guidelines/app-icons/)
and [icon asset catalogs](https://developer.apple.com/documentation/xcode/configuring-your-app-icon).
This supplies the existing flat ICNS integration, not a layered Icon Composer asset.

## Generation provenance

Built-in imagegen was used with the supplied image as reference. The selected prompt
requested preservation of the colored rounded square and pale mark, removal of only
the black exterior, transparent output, clean edges and macOS padding. The generated
output retained unwanted fringe; the user authorized using the generated version,
then deterministic cleanup produced the shipping files above. A separate prompt for
a flat white cutout changed the silhouette and was not used. No image generation API
key or external image service is needed to regenerate the final assets from the source.
