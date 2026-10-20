# Cover the supplied inset in Chromium155's immersive source host

**One-file Chromium155 platform adaptation**, following the restored original externally parented top-container branch. It preserves the original shifted child rectangle and Cocoa behavior. It is not claimed to be a recovered original Chrome-side `OnViewBoundsChanged` resize operation; that exact original method remains unrecovered.

## Source and actual runtime boundary

The preceding `native-immersive-sidebar-inset` proposal pins the supplied routine's actual leading reservation and child-local normalization. The returned top-container X remains nonzero, and its width excludes that inset. Root's v405 disposable fullscreen image shows navigation starting beside the sidebar but ending early; its owned-window record reports a1446-wide offscreen source window and a1728-wide visible AppKit overlay. Those capture records are external hash pins, not copied owner state. The offscreen window width **alone** is not evidence of a visible clipping defect.

Actual155's `TopContainerOverlayView` has no layout manager that moves this child to origin0. Its genuine reparent operation retains that view under the overlay. The common layout then sets the source-faithful shifted top-container bounds. `ImmersiveModeControllerMac::OnViewBoundsChanged` resizes the source overlay widget to **bounds.size()**, even though the child retains **bounds.x()** inside it. Thus the source compositor has only the reduced width while the retained child extends to **bounds.right()**. This is a concrete coordinate-space mismatch at the new original/155 boundary, independent of choosing a screenshot offset.

## Original Cocoa callback comparison

Original arm64 SHA `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. The bounded Cocoa top-view callback at `9c2a180..9c2a25c` converts the incoming rectangle toCGRect, retains only its height in d8, gets the actual overlay view/window frame, and conditionally calls `setFrameSize:` with the existing window width and new height. It then preserves toolbar-visibility policy and invokes the real Reanchor virtual at+98. Actual selector stubs (`view`, `window`, `frame`, `setFrameSize:`, `setVisibility:`) are decoded in the evidence manifest.

This corresponds to actual155 `ImmersiveModeControllerCocoa::OnTopViewBoundsChanged`: AppKit owns the visible titlebar width; the method updates height and reanchors. It supplies no source-backed reason to force a new Cocoa X/width, move the native visible overlay or replace AppKit's own layout. Those methods remain unchanged.

## Narrow correction

In the **source host** only, and only under `ENABLE_AUX_BROWSER && IS_MAC`, when the browser draws vertical tabs, the actual top container is externally parented, and its actual X is positive, resize the source overlay widget to `gfx::Size(bounds.right(), bounds.height())`. For an origin0 host this is exactly the span needed to contain its shifted child. There is no fixed width, sidebar constant, screenshot coordinate, native-origin override or generic fullscreen test.

The actual supplied child origin/width, unchanged bounds sent over Mojo, AppKit height/reveal/reanchor, focus, separate horizontal-tab host sizing and destruction lifecycle are preserved. Unshifted, horizontal, internally parented, non-Aux and non-macOS paths retain their existing size operation. The method's existing empty-bounds return remains first.

## Delivery and verification

Existing source file `chrome/browser/ui/views/frame/immersive_mode_controller_mac.mm`, baseline `aa76012ccca1284686169f2436d64fc5992197d9cf63bb29bddfdb862e5a5c68`, output `94b9d3f25a776e0a71f05e222648dc26cfe8246e63ef19824a74c01631eeaa52`. Two count-one anchors (explicit build-config include and source-host size operation). No public API/GN/Mojo change.

`verify.py` checks immutable source/evidence pins, the existing original-layout evidence, and disposable one-file patch replay. Chromium clang-format was run on the changed method range. No native/shared writes, build, app launch, owner-data access, OS grant or signing occurred. Root must focused-compile the existing immersive-mode object and observe the actual matching fullscreen/right controls, collapsed width, normal window and exit/re-entry paths. The source diagnosis and patch replay are not runtime/visual acceptance.
