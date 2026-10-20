# Let the supplied window material reach the screen

Aux already installs the supplied full-window native material in `NativeWidgetNSWindowBridge`. That is not sufficient when the replacement Chromium frame paints opaque layers above it. This proposal removes those competing owners for Aux on macOS, rather than inventing a more transparent color or changing the supplied Glass variant.

## Source and current obstruction

The pinned original in `../native-window-vibrancy/source-evidence.json` and its bounded disassembly establish:

- Original04383998..043839bc gates the browser-window effect by `BrowserNativeWidgetWindow`.
- Original04384058 creates `NSGlassEffectView` (macOS26+, nonfullscreen), with the optional original variant and blending selector. The creator has no Chromium tint subview or opaque remainder. The fallback is `NSVisualEffectView`, UnderWindowBackground, BehindWindow, FollowsWindowActiveState.
- Original043843a0 reparents the compositor to the effect's contentView when available, otherwise root. Original0438541c replaces the effect while preserving that compositor.
- Original04385914..0438597c updates effect visibility and window opacity/background from the supplied disabled preference. On enabled macOS26 it uses system background alpha0.001. Fullscreen switches to the original fallback; it does not introduce a full opaque Chromium canvas.

The source binary SHA-256 is 64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c. All the original selector/import decoding and exact excerpt hashes remain in that pinned proposal.

Actual v524 has that source owner, but also three independent Chromium155 obstructions:

1. BrowserNativeWidgetMac::OnWidgetInitDone subscribes to GlassFrameService. Its eligible branch adds a second GlassFrameBackgroundView, a tint subview with dark opacity0.80/light-vertical0.65, and an opaque background covering the remainder of the window. Its ineligible branch makes the whole compositor/window opaque.
2. BrowserFrameViewMac::OnPaint draws an opaque full-frame color whenever that separate service is ineligible. Its frame layer also declares opaque bounds then.
3. BrowserWidget only requests a translucent native window when that service reports eligibility; the sidebar background likewise paints full frame color when the service becomes ineligible. That service can change independently of the original material preference, including activation, theme, battery and fullscreen conditions.

Thus the previously verified existence of an NSGlassEffectView did not prove that its output reached the screen. This is a static compositing obstruction finding, not a claimed runtime measurement of which pixel layer currently dominates.

## Integration correction

The Aux bundle gate is identical to the already integrated source bridge's `dev.aux.browser` gate. BrowserWidget requests a translucent compositor. BrowserNativeWidgetMac skips its duplicate material subscription/creation and explicitly keeps the compositor clear; the supplied bridge retains ownership of disabled/background/fullscreen behavior. BrowserFrameViewMac keeps its frame layer and paint transparent above that original owner. Native sheets and unrelated widgets are not modified by these browser classes.

The Aux Mac sidebar's already recovered admission owner keeps its primary backing clear over the original material independently of upstream glass eligibility, including the source fallback in fullscreen. Existing retained-overlay fade, blur, corners, shadows, hover lifecycle and motion constants are unchanged. Toolbar/page painters are a separate coordinated proposal. No universal color tokens, system preferences, OS appearance, original effect implementation, or arbitrary alpha values are changed.

These are necessary Chromium155 integration adaptations around the reused source, not claims that the original browser C++ class implementation has been recovered. Existing source caveat about hiding an effect with a nonnil contentView remains as documented; this proposal does not rewrite that original behavior.

## Validation

Four exact actual-v524 baseline and output hashes are recorded in files.json. Disposable replay verifies all patch outputs. No native checkout changes, build, profile reads, preference mutation, signing or launch were performed. Integrator should compile and compare both apps above the same colorful desktop region, checking active/inactive and retained hover state. Actual liquid-glass appearance remains a runtime acceptance condition; this patch does not alone establish full-product parity.
