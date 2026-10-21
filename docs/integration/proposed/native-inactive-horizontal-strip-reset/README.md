# Reset only an initialized horizontal tab strip

Pinned to actual composition v600. Parent supplied the bounded actual v597 crash stack: TabStrip::Reset +48, BrowserView::OnVerticalTabStripModeChanged, VerticalTabStripStateController::OnModeChanged, preference notification, AuxBrowserPreferencesFunction::RunAux. No private crash-report contents were read by this lane.

BrowserView creates the legacy horizontal region in all modes, but initializes only the chosen region. Vertical startup therefore legitimately leaves its horizontal tab container absent. VerticalTabStripStateController::OnModeChanged publishes its preference notification even when the effective mode is unchanged. BrowserView's vertical branch resets the horizontal region and initializes the vertical region. Legacy InitializeTabStrip is idempotent through tab_strip_set_; ResetTabStrip was not. It unconditionally called TabStrip::Reset, whose RemoveChildViewT receives the exchanged absent tab_container_. The collection-based BaseTabStripRegionView already treats resetting an absent root as a no-op.

Use the legacy region's existing ownership flag to return before tearing down an uninitialized/already-reset strip. When initialized, the existing controller observation teardown, flag transition, tab container destruction, and transient-state resets execute unchanged. Do not change preferences, suppress notifications, disable horizontal mode, or weaken TabStrip invariants. This also prevents duplicate observer removal for a controller that never initialized. The existing Initialize guard makes repeated effective-mode notifications symmetric and harmless for both regions.

This is a necessary Chromium155 lifecycle adaptation, not claimed as recovered original code. No UI geometry or visual changes.

Validation: one counted anchor and isolated git apply check/replay exactly reproduce output SHA-256. No shared native edits/build/runtime/signing. Integrator focused compile: horizontal_tab_strip_region_view object. Actual lean check should exercise vertical-setting notification while already vertical, then vertical/horizontal/vertical preference transitions and confirm active tab preservation.
