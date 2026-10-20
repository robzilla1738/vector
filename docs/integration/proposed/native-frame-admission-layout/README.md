# Use the sidebar's actual state for frame layout

The v510 sidebar uses `aux::ProfilePreviewAdmission` for the recovered collapse, hover and retention behavior. `VerticalTabStripRegionView::OnTabStripViewSet` deliberately skips both the upstream controller reset and its animation subscription when that owner exists; `RequestCollapse` likewise forwards to this owner and returns. However `BrowserViewTabbedLayoutImpl` continued reading the unstarted upstream controller. Its defaults are width 0 and top 1 (collapsed), even when the actual region is expanded at width 280. This creates a full-width toolbar and drops the sidebar below it.

This patch connects the typed frame geometry to the already installed owner, including its live SlideAnimation progress and requested collapse direction. The horizontal allocator's collapsed/expanding/collapsing query is connected to that same owner. Upstream layout remains the fallback when no admission is installed. No extra animation, screenshot coordinate, sidebar width, toolbar height or color is introduced.

The existing typed155 top/corner geometry checkpoints (.25/.75) are evaluated against the recovered owner's progress. This is a platform adaptation, **not a claim that Chromium's interpolation is the recovered original curve**. The owner's existing duration/tween, request handling and invalidation remain unchanged. Retained presentation clears the top offset, matching the existing recovered allowance writer. The region's actual preferred-size producer continues to own width.

## Evidence

- Native v510 `vertical_tab_strip_region_view.cc`: `OnTabStripViewSet`, `RequestCollapse`, `CalculatePreferredSize`, and `ApplyRetainedLayout` establish that the installed admission is the exclusive collapse/hover/retention owner and requests real browser layout on changes.
- Native `aux_profile_preview_admission.{h,cc}`: `collapse_value`, `collapse_animating`, `hover_expanded`, `retained`, `SetCollapseState` and delegate invalidation establish the available live state. These are the already integrated recovery of the supplied region's a08/a0a/a0b/a0c/cd0/f78 state.
- Native `chrome/browser/ui/views/animations/tab_strip_animations.cc`: default width0/top1 proves why reading this inactive producer is incorrect; its existing .25/.75 layout checkpoints are preserved as the typed adapter.
- Supplied source inventory: `/Users/rcourson/Downloads/aside-rea 2/native-fork/decompiled/`, framework SHA-256 `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. Original layout writer ranges `45e87b4..45e88a0` and retained reset `463fde0..463fe48` are pinned in the existing `native-top-caption-state/source-evidence.json`: geometry comes from actual toolbar/sidebar bounds and retained state, not fixed screenshot offsets.
- `/Users/rcourson/AI Blueprints/06/assets/runtime/ax-tree.txt` and the integrator's live desktop Aside comparison show a full-height expanded sidebar with the toolbar beside it. The live screenshot is confirmation of the wrong topology, not the source of a hardcoded coordinate.

## Verification and limits

`files.json` pins the actual v510 preimage and resulting file. `native.patch` applies cleanly to that exact preimage, with a matching output digest. Static inspection confirms settled expanded maps to top0/width1, settled collapsed maps to the existing exclusion height/width0, intermediate collapse/expand use the same owner's progress, and retained state maps to top0. No native checkout edits, builds, launches, signing or profile access occurred in this lane. The integrator must compile and observe the resulting live window before claiming visual parity. This patch does not claim to resolve unrelated top-control placement, color, address-bar or chat differences.
