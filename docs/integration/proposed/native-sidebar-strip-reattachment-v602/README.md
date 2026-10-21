# Restore retained strip visibility ownership on reattachment

One file/one exact anchor on native602 (`aux_sidebar_body.cc` unchanged from601). Source-only, no shared build or UI operation. Complements the independent width-cache repair.

`Retire()` returns the retained native strip to the region's FlexLayout. The strip keeps `BaseTabStripRegionView::SetTabStripView`'s scale-to-zero FlexSpecification. FlexLayout can legitimately set its child invisible when its allocated main size becomes zero (`flex_layout.cc`312/1223). Removing that child discards the old layout manager's visibility ownership (`LayoutManagerBase::ViewRemoved`); adding it under a new layout carries the View's current visibility. The destination Tabs contents BoxLayout does not know the old FlexLayout intended visibility.

This is possible during the otherwise synchronous profile transaction: target insertion occurs before `Complete`→sidebar `End`→`Build`, and active-tab change invokes `BrowserView::OnActiveTabChanged`→`UpdateUIForContents(..., true)`→`DeprecatedLayoutImmediately`. Thus the temporary direct-region child can receive a layout-owned hidden state before reattachment.

After reattaching the genuine strip under Tabs, set only the strip's visibility true, matching initial construction. The Tabs section ancestor still owns collapse/presentation visibility. Native row/projection visibility, eligibility, pinned entries, geometry, styling and animation remain unchanged. No descendants are forced visible, no data fabricated and no profile guards relaxed. This applies to both commit and rollback because Build derives the current authoritative profile.

Count-check and `git apply --check` pass. Actual601 early phase diagnostics did not separately identify each hidden ancestor, so the specific retained false state is source-supported rather than runtime-proven. The fix restores correct ownership at that real reparent boundary regardless of whether it caused the observed601 missing row. Compile/runtime confirmation remains integrator-owned.
