# Frame and actual navigation placement — inactive source proposal

Execution baseline `02ce77253`. This lane preserves existing materials, colors,
corner radii, animation durations and the default top navigation. It changes two
actual native region files and adds three native files. `files.json` pins the
selected input bytes and every successor; `native.patch` replays only those files.
The selected native tree and accepted app were not modified.

## Implemented source

- `aux_frame_presentation_state.h`: one pure projection for docked/hidden/hover,
  reserved width, pending navigation relocation, minimal-mode redundant chrome
  and full-URL requirements. Hover never moves the top editor into the sidebar.
  A currently sidebar-hosted editor keeps a floating preview during a deferred
  collapse, instead of disappearing mid-edit. Minimal mode never hides the only
  trusted origin control.
- `aux_navigation_placement.{h,cc}`: reparents the genuine native navigation view,
  preserving its URL/history/security controller. Checks actual focus, actual
  parents, same-widget hosts, real minimum width, hierarchy destruction and
  reentrant callbacks. Uses view trackers and weak lifetime guards. It creates
  no editor and grants no profile/storage authority.
- `VerticalTabStripRegionView::SetAuxSidebarMode` delegates docked/auto-hide to
  the real state controller. `GetAuxFramePresentationInputs` exposes real native
  hover, focus, menu locks and drag/resize state for the root frame owner.
- Actual hover/retention now honors keyboard focus and keep-current menu/drag
  locks. Previously, the retained-panel predicate explicitly discarded focus,
  and its release timer saw only keep-expanded locks. Existing timing/animation
  owners remain in control. Explicit force-collapse retains precedence.
- The real omnibox popup takes keep-expanded only when its actual toolbar is in
  the sidebar; the existing top-toolbar force-collapse behavior is preserved.

## Root integration contract — required, not completed here

1. Register the three new files in the selected `chrome/browser/ui/BUILD.gn`
   views target. Do not enable `enable_aux_shell`.
2. BrowserView owns one `AuxNavigationPlacement`, passing its existing
   `ToolbarView`, actual top parent and a real sidebar header host. Create that
   header before the body without replacing supplied content. Keep native view
   ownership in the hierarchy; destroy this controller before its owner views.
3. Combine `GetAuxFramePresentationInputs()` with registered per-profile
   sidebar-navigation/minimal/full-URL preferences and actual native-menu/tab-
   drag state. Call `Update` outside a layout traversal when preferences,
   focus/menu/drag state or collapse transitions change. Retry after a deferred
   transition settles; never manufacture an editing=false input to force a move.
4. Use the returned projection in root layout. A `kUnavailable` result is not
   permission to hide a host: preserve actual hierarchy presentation and retry
   only after a valid owner is present. `kInsufficientWidth` leaves navigation at
   the top. Minimal suppresses redundant chrome only; full URL and trusted
   origin/permission UI stay reachable.
5. Root owns compact ToolbarView layout. A complete native toolbar may not fit a
   280-DIP sidebar. This proposal **refuses overflow**; it does not claim sidebar
   navigation accepted simply because a controller exists. Implement a reviewed
   compact layout/overflow route preserving the actual nav/location controls,
   then supply the measured content width. Do not shrink the origin/security
   controls below their validated minimum.
6. `layout/browser_view_tabbed_layout_impl.cc:1583` already skips top placement
   when toolbar's parent differs. Remaining toolbar minimum width/height inputs
   at lines471/583/724/837, and toolbar corner painting at1955+, must consume the
   actual host. The sidebar-hosted toolbar cannot receive the page's top-corner
   treatment. One root geometry owner coordinates both sidebars/chat/splits.
7. Before replacing a sidebar host or beginning profile-rebind presentation,
   invoke guarded `RestoreToTop`; respect `kDeferred` and preserve the live
   toolbar/host until edit/menu/drag completion. Normal BrowserView teardown may
   destroy its complete owned hierarchy after the controller; do not reparent
   during destruction. New preference writes join existing admitted lifecycle.
8. Expose toggles through the single command/Settings owner and actual profile
   preference registry. This lane does not create an independent command store,
   preference namespace or persistence path.

The root must also ensure a deferred sidebar editor retains its real preview
host and its actual widget focus. The model's overlay result does not itself
allocate native geometry or override an explicit user force-collapse action.

## Focused evidence

`python3 check.py` validates pinned baseline/successor bytes and applies the exact
patch only in a disposable temporary directory. `tests/frame_state_check.cc`
uses compile-time assertions for default preservation, docked/hidden/hover,
focus-held relocation, menu/drag/motion locks, and minimal/full-URL precedence.
It was checked with:

```
python3 scripts/native-build.py xcrun clang++ -std=c++20 -fsyntax-only \
  -I docs/integration/proposed/browser-feature-expansion/frame/source \
  docs/integration/proposed/browser-feature-expansion/frame/tests/frame_state_check.cc
```

This creates no executable or signature. Actual changed Chromium translation
units, native view parenting, narrow-toolbar behavior, final build and live
visual/interaction acceptance remain pending integrator projection. No app was
launched, quit or restarted; no signing, profile access, provider or cloud
operation occurred. Source implemented does not close FX-FRAME acceptance.
