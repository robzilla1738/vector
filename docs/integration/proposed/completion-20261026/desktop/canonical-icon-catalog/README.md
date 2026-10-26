# Canonical Aux icon catalog recipe

The initial unsigned candidate delivered the exact upstream Chromium Assets.car (`961218f6eef627cad9b6ef7401f1774efd9c1cbcd3eebd299d7843415a1fcbb7`, 437,192 bytes) in the main app and both Alerts helpers. Each plist selects CFBundleIconName=AppIcon. Apple defines this as the catalog asset used for the app icon; Chromium documents separate AppIcon bitmaps and macOS 26+ icon layers. Thus matching the canonical app.icns alone did not establish the modern app icon. The immutable upstream byte comparison and all three exact catalog/fallback paths are in source-catalog.json.

Actual assetutil metadata proves this catalog has only two logical icon contracts: AppIcon and the document badge Icon, plus their colors, gradients, vectors, stacks and generated packing data. There are no unrelated toolbar/UI resources to discard. catalog-scope.json lists all observed names and its exact record count. Main Info.plist actively references UTTypeIconBadgeName=Icon, so that name is deliberately retained. Original and Aux Vault IDs/denials are unrelated and untouched.

Root-only build command, serialized through the existing build lock:

```
python3 scripts/native-build.py python3 \
  docs/integration/proposed/completion-20261026/desktop/canonical-icon-catalog/build.py \
  --repository /Users/rcourson/Documents/Vibe/web \
  --receipt <actual unsigned whole-app receipt.json> \
  --receipt-sha256 <its actual SHA256> \
  --output /private/tmp/aux-canonical-icon-catalog-20261026-a1
```

The recipe has not been run by this worker. It writes only fresh isolated output; it never copies into an app, signs or launches one, nor invokes a Chromium build. Root will inspect its actual receipt and apply its three declared catalog replacements in the same final resource/OS metadata delta.

Inputs are the **existing approved** canonical arch-mark.svg and Aux.icns, plus the existing brand inventory; source-pins.json freezes their hashes. The script validates the SVG's complete two paths/viewBox, verifies the three old car and fallback ICNS hashes against the supplied whole-app receipt, then calls Apple's iconutil to extract exactly ten PNGs. It neither redraws nor resizes them. AppIcon.appiconset declares macOS sizes16/32/128/256/512 at1x/2x; Icon.iconset reuses the existing approved256/512 pixel renditions with the same source package type as Chromium's original document badge. No .icon layer from the Chromium catalog is copied.

The explicit actool command compiles for macosx / mac / deployment target27.0 / AppIcon. A post-build assetutil check requires all ten size/scale pairs, both AppIcon and Icon contracts, and no unrelated named assets. It retains all compiler output, PNG hashes, source metadata, resulting catalog digest and the three exact replacement records in a source-only build receipt. Existing fallback ICNS files remain untouched and CFBundleIconName stays AppIcon.

Only the recipe's Python syntax was checked here. Actual actool success, pixel display and final delivered inventory are root gates; the script does not infer them from source or metadata counts.

Primary references: [Apple CFBundleIconName](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html), [Apple document icon badge resources](https://developer.apple.com/documentation/bundleresources/information-property-list/utexportedtypedeclarations/uttypeicons), [Chromium's catalog structure](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/mac/icons.md). The immutable catalog URL and hash are separately preserved in source-catalog.json.
