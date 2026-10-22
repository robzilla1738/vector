# Aux asset path identity — byte-preserving relocation

Separate, inactive source slice. No existing UI/staging/package/gate code is edited. The default helper relocates seven original Agent WebP filenames from `assets/aside-...` to `assets/aux-...` while returning the exact same input Buffer. All seven files match their original1852 SHA/length pins and the accepted visual baseline. This changes paths, not pixels, component structure, typography, geometry or behavior.

Six active importer modules need one exact basename rewrite each. A seventh original importer, `assets/password-LjdLcSRV.js`, originally referenced the manager asset once; existing branding already changes that reference to `aux-password-manager-CZ9IYl_W.webp`. The stage still retained the old asset basename. Therefore the apparent “unused” asset was an already-renamed reference missed by an old-name-only search. The helper validates that exact known pre-relocated reference (or relocates its original form), retains/renames the asset and never enables or deletes excluded product UI.

`inputs.json` records seven source asset hashes/lengths and every original importer hash/count. Unknown importers with these names, mixed old/new references, changed asset bytes, repeated normal rewrites and path collisions fail closed.

## Integration

```js
const asset = relocateAuxAssetPath({component:'agent', path, bytes});
// Write asset.bytes under asset.path, retaining its original content and mode.
const code = applyAuxAssetReferenceIdentity({component:'agent', path, text, original});
// Add both returned anchors and all helper/pin inputs to the external stage audit.
```

The caller owns atomic staging and must reject duplicate output paths across the whole stage. Neither function moves files or operates on a profile.

Two pure functions expose the visual mapping transparently:

- `relocateAuxVisualBaseline(originalBaseline.files)` returns delivery-path expected entries plus all seven explicit `from → to` references/hashes. The original accepted baseline remains unchanged and external.
- `canonicalizeAuxVisualAssetInventory(actualDeliveredFiles)` verifies all seven new paths/hashes, rejects missing/old/mixed/duplicate entries and returns entries under their original canonical baseline paths. Unknown extra assets remain in the list for the normal complete visual gate to report.

Neither mapping drops an asset or silently waives a hash mismatch. Required legal notices and HTML `aside` semantics are untouched.

## Explicit separate branding-image receipts

Path-only migration is not full branding: independent visual inspection found original product pixels in the browser-icon, CLI guide and mini-popup guide rasters. Their replacement is a **separate reviewed artwork slice**. This helper does not alter those images or declare their pixels Aux.

To support that later review without relaxing the default gate, `relocateAuxAssetPath`, `relocateAuxVisualBaseline` and `canonicalizeAuxVisualAssetInventory` accept optional `reviewedReplacements`. Each entry must contain exact `receiptBytes`, an externally pinned `receiptSha256`, and actual `sourceBytes`. Required receipt shape:

```json
{
  "version": 1,
  "kind": "aux-reviewed-asset-replacement",
  "path": "assets/aside-CeBDTZrg.webp",
  "originalSha256": "d0d55a418b2a03bffc682d95f11a2f79579fd46ca053a9b893a974f3a3e4c66d",
  "output": {"sha256": "<exact new raster hash>", "bytes": 123},
  "source": {"kind": "canonical-aux-svg", "sha256": "45ba4f1d823cab3085cad8902fd17420ff5a9a5ac3139b180bfc0902875f515c"}
}
```

For `canonical-aux-svg`, sourceBytes must be the complete canonical SVG matching its fixed owner-provided hash. The external receipt may additionally bind PNG derivation input/tool/source hashes; the integrator must verify that actual derivation. This pure helper authenticates the receipt/source/output pins, not a rendering algorithm. Alternative `reviewed-output-source` requires sourceBytes to equal the exact replacement image's declared hash and byte length. Arbitrary source kinds, wrong canonical source, unpinned/changed receipts, old-hash mismatches and duplicate overrides reject.

The baseline mapping records `explicitBrandingReplacements`, `unchangedRelocatedAssets`, `baselineVisualFiles` and `expectedUnchangedVisualFiles`. For example, one explicitly reviewed raster replacement among135 baseline assets reports one replacement and134 expected unchanged files, rather than135 unchanged. Final acceptance still compares actual delivered bytes. Inverse mapping preserves the replacement's actual hash; it never pretends new pixels equal the original raster.

## Focused checks

```sh
node --experimental-vm-modules --test vendor/provided/aux-asset-path-identity.test.mjs
```

Four checks use actual supplied assets, all seven actual source importers and the accepted baseline. They verify exact byte preservation, six composed importer rewrites plus the known existing manager reference, JavaScript parsing, complete bidirectional path coverage, collision/missing/mixed/hash rejection and explicit receipt/source-proof behavior. The replacement-receipt fixture is synthetic pinning arithmetic, not a visual derivation acceptance claim. No real UI/app or provider operation was performed.
