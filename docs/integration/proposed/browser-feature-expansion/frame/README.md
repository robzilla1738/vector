# Frame and native sidebar navigation — inactive source proposal

Execution baseline `02ce77253`; first lane commit `1e688dd56` supplied the state
contract, guarded reparent controller and hover correction. The consolidated
successor now includes **actual BrowserView, ToolbarView and native layout
consumers**, not only an unused controller. Ten native files (seven existing,
three new) are pinned in `files.json`. `native.patch` applies to their recorded
original baselines; it is not an incremental patch over the first proposal.
Only proposal files were edited by this lane. Root projection/build is separate.

## Implemented source

- One pure frame projection resolves docked/hidden/hover presentation, reserved
  width, pending navigation relocation, minimal-mode redundant chrome and full
  URL requirements. No new animation timer, curve, radius or color is introduced.
- `AuxNavigationPlacement` reparents the genuine native ToolbarView. It checks
  actual focus, expected parents, same-widget hosts, minimum width, destruction
  and reentrant callbacks; it creates no replacement editor or URL model.
- BrowserView owns a real hidden-by-default sidebar header before pins/body,
  and observes `aux.sidebar_navigation_enabled`, `aux.minimal_ui_enabled` and
  Chromium's existing full-URL preference. Posted updates consume real region
  focus/hover/menu/resize state and actual toolbar interaction state. Movement
  occurs outside layout traversal and is retried on focus/activation/layout
  changes. Old-profile preferences are detached/rebound with the existing
  transaction; presentation waits until that transaction finishes.
- ToolbarView's opt-in compact layout retains every real child and the existing
  responsive Flex/overflow controller. The actual LocationBarView occupies a
  reserved second row; navigation/actions remain in the first. Origin/security
  controls are never shrunk below their minimum. Unsupported alternate/WebUI
  toolbar implementations refuse docking; the selected native implementation
  has a real compact route. Returning to top restores original layout behavior.
- Root layout consumes actual parentage for main-content minimum size and top
  toolbar allocation. A sidebar toolbar uses its parent material rather than
  painting opaque page corners inside the sidebar. The page gets the existing
  window's top radii when it becomes the top surface. Default top-toolbar
  geometry, materials, colors, glass and radii remain unchanged.
- Minimal mode removes the bookmarks row without changing its persisted
  visibility preference. Sidebar navigation removes the redundant top toolbar
  allocation. When navigation stays at the top, the trusted URL/permission UI
  remains available, including full-URL mode.
- Docked/auto-hide mode delegates to the real vertical-tab controller. Retained
  hover now honors keyboard focus and keep-current menu/drag locks. A deferred
  sidebar editor uses the real hover owner until it can relocate; that placement
  hold is not fed back as a menu lock. Explicit force-collapse retains precedence.
- An omnibox popup keeps its actual sidebar toolbar host expanded; historical
  force-collapse remains for the top-hosted omnibox. Native focus ordering is
  updated after reparenting. BrowserView destroys the controller before its
  owned hierarchy; deferred callbacks refuse teardown/profile-transition state.

## Root registration and remaining integration

1. Register these three files in the selected `chrome/browser/ui/BUILD.gn` views
   target: `views/frame/aux_frame_presentation_state.h`,
   `views/frame/aux_navigation_placement.h`, and
   `views/frame/aux_navigation_placement.cc`. Do not enable the retired shell.
2. Register Boolean profile preferences `aux.sidebar_navigation_enabled` and
   `aux.minimal_ui_enabled`, both **false** by default, using the existing
   admitted preference/lifecycle boundary. Constants are public in the pure
   frame header. Existing `omnibox::kPreventUrlElisionsInOmnibox` registration
   remains authoritative; no duplicate URL preference is introduced.
3. Command/Settings integration invokes those profile preferences and
   `VerticalTabStripRegionView::SetAuxSidebarMode`. UI strings/commands belong to
   the navigation/Settings lane. This source does not create a separate command
   registry or persist hover/focus state.
4. Project consolidated source with all other accepted proposals, compile the
   actual changed Chromium units, then build/package through the integrator.
   The selected tree may already contain the first proposal; compare/replace
   with these final source hashes rather than applying the whole patch twice.
5. Verify actual dock/undock, focused edit and popup/menu close, narrow width,
   hover/drag, both sidebars, profile switch and minimal-mode restoration. A
   narrow host refuses rather than clips; actual default-width readability and
   responsive overflow require observation, not an inference from this code.

## Focused evidence and limits

`python3 check.py` verifies baseline/successor pins and applies the exact patch
only inside a disposable temporary directory. `--check-selected` additionally
requires the live selected tree to remain at the original baseline; this is
expected to refuse after root projects a successor. Plain replay is not proof
that a changed native tree matches original inputs.

`tests/frame_state_check.cc` has compile-time checks for default preservation,
zero reserved width when hidden, focus-held relocation, menu/drag/motion holds,
and minimal/full-URL precedence. Its syntax-only command passed:

```
python3 scripts/native-build.py xcrun clang++ -std=c++20 -fsyntax-only \
  -I docs/integration/proposed/browser-feature-expansion/frame/source \
  docs/integration/proposed/browser-feature-expansion/frame/tests/frame_state_check.cc
```

No executable/signature results from that check. Actual changed Chromium
translation-unit compilation, final build and live visual/interaction acceptance
remain root integration gates. No app was launched, quit or restarted by this
lane; no signing, owner-profile, provider or cloud operation occurred. This is
implemented source, not accepted FX-FRAME completion.
