# Canonical Aux browser illustration icon

The supplied browser-icon illustration is an original-product logo. This proposal substitutes the existing complete canonical Aux icon in that same512px slot. It does not redraw the mark or change CSS/layout. The WebP is a lossless encoding of `assets/brand/Aux.iconset/icon_512x512.png`, already derived from the owner's two-path SVG. The manifest pins the canonical SVG, derived PNG, original raster and replacement.

Reproduce with `cwebp -quiet -lossless assets/brand/Aux.iconset/icon_512x512.png -o vendor/provided-ui/branding/aux-browser-icon.webp`. Decode equality with the source PNG,512px dimensions and complete source SVG are verified separately from the ordinary byte-identical visual baseline. This is an explicit branding-only exception, never an assertion that changed artwork hashes stayed identical. The accepted app remains unchanged. Settings guide screenshots containing original-product labels remain a distinct artwork gap.
