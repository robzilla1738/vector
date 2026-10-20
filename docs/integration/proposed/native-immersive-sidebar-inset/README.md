# Preserve the sidebar beside an externally hosted toolbar

The supplied tabbed-layout routine has an external-parent branch missing from the retained Chromium155 implementation. This proposal restores it in the actual existing `BrowserViewTabbedLayoutImpl::CalculateTopContainerLayout`, scoped to `ENABLE_AUX_BROWSER && IS_MAC`. It does not alter the verified windowed caption allowance or replace original state with a fullscreen heuristic.

Root's controlled v401 incognito fullscreen observation shows the sidebar body while its genuine top controls are covered by the full-width navigation toolbar. That capture motivates this investigation; the original instructions below, not screenshot coordinates or an inferred historical reference mode, define the correction.

## Exact supplied branch

Original arm64 SHA `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`; ranges, bytes and listings are pinned in `source-evidence.json`.

- `45e9cc0` is the real tabbed top-container-layout virtual (paired with the genuine proposed-layout virtual `45e7a80` in the recorded original vtable). It retains original top Y in w26.
- `45e9cf8..45e9d18` skips this extra inset when actual top-container `+58` is parented to actual BrowserView `+30`.
- `45e9d18..45e9d48` requires transient strip type1 (vertical), the actual vertical region `+78` directly parented to BrowserView, and that region visible. It is not an account/incognito or generic fullscreen test.
- `45e9d4c..45e9d58` obtains that region's genuine preferred width through `View::GetPreferredSize` (`7d5c80`, whose actual preferred-size virtual dispatch is pinned separately). The all-zero `SizeBounds` supplies unconstrained preferred size; no fixed sidebar width is introduced.
- `45e9d5c..45e9dc4` uses the actual persisted-collapse predicate. Thunk `91e291c` resolves to `c770db0`, which obtains `VerticalTabStripStateController` through `114694`, its exact `VerticalTabStripStateController::kDataKeyImpl` string pin, and returns bit0 of controller+90. When **not collapsed**, the width is max(preferred width, ceil(leading exclusion content width + horizontal padding)). A collapsed strip uses preferred width without this caption minimum.
- `45e9dc8..45e9de4` clamps that amount to the current client width and applies a left inset through actual layout-params inset helper `3ccfa8`.
- **Companion normalization is necessary:** `45ea2c0..45ea300` checks the external parent again and nonzero resulting X; `45ea364..45ea3e0` subtracts that X from each nonempty immediate child layout. The return at `45ea304..45ea33c` retains the shifted container X and reduced width. This preserves children in container-local coordinates; adding only the leading inset would double-shift the toolbar.

## Actual155 adaptation

The actual common layout explicitly lays out an externally parented top container before `CalculateProposedLayout`. Its parameters still describe the entire window. The latter's ordinary vertical-sidebar inset therefore does not reach that external toolbar. The proposal restores the original reservation inside the real top-container routine and its original immediate-child normalization before returning the container rectangle. The existing parent conversion, immersive offset, native overlay/reveal, focus and fullscreen lifecycle remain intact.

The typed existing APIs map the source operations directly: `TabStripType::kVertical`, `IsParentedToAndVisible`, `GetPreferredSize`, `delegate().IsVerticalTabStripCollapsed()`, `ContentWithPadding()`, `base::ClampCeil`, `InsetHorizontal` and real `ProposedLayout::children`. No public-header/interface/GN dependency change is required. The existing build defines the Aux buildflag used elsewhere in the same target.

Internal/windowed top-container layout has already reserved sidebar space and does not enter either added branch. No sidebar offset override, guessed fullscreen style, synthetic profile state or replacement control is introduced. Non-Aux and non-macOS builds retain their existing implementation.

## Delivery and limits

One existing CC file, two count-one anchors. Baseline `51f9087e02654b3d3a4854211cccfa6068576ba60896b0e6dc3aa10cbbe48302` (actual403, unchanged from401); output `c16c802195823f8e6a9ec8103beb1be1471fdebdad248e4faad514a6f105c6e1`. `native.patch` replays only on that baseline. The immutable baseline and proposed source are included.

`python3 docs/integration/proposed/native-immersive-sidebar-inset/verify.py` verifies six original code ranges, three data pins, four actual155 source excerpts, counted transformations and disposable patch replay. Changed ranges were checked with Chromium clang-format. This lane made no shared-native write, native build, app launch, profile/data access, signing or OS action. Actual focused compilation and matching fullscreen/windowed/collapsed/content-fullscreen observation remain root integration work; this is not a visual-parity acceptance claim.
