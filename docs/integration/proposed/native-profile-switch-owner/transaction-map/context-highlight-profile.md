# Actual context highlight through a window profile transfer

The current ContextHighlightWindowFeature does not cache a Profile, profile service, WebContents, or renderer. It retains the same BrowserWindowInterface, a ViewTracker for its shared overlay, and a real active-tab subscription. ContextHighlightTabFeature is tab-owned and observes its actual WebContents/RenderWidgetHost; its latest geometry stays with that real tab. Renderer callbacks resolve the tab's current BrowserWindowInterface each time.

The window overlay still needs a real transfer boundary: the stock GetActiveTabFeature dereferences a null active tab during an empty model, and an existing shared overlay can otherwise display stale source rects. This two-file source-pinned platform adaptation preserves the actual overlay and subscriptions:

* `CanPauseForAuxProfileSwitch()` requires same registered normal regular-profile owner and no update on the current stack.
* `PrepareForAuxProfileSwitch()` blocks transient geometry updates and hides the actual existing overlay host. It does not clear tab geometry, unregister renderer observers, manufacture rects, or delete/recreate UI.
* `FinishForAuxProfileSwitch()` is called after actual target insertion or actual source rollback. It consumes the pause and refreshes from the genuine active tab's latest rects/scale. An actually empty model hides the overlay and returns safely rather than fabricating a successful empty capture.

The stable BWF field should remain alive; do not reconstruct it or its renderer-facing tab features. The existing real active-tab subscription and tab renderer callbacks continue unchanged after Finish. This is a necessary Chromium155 platform adaptation, not a claim that the original profile-switch function had a named equivalent feature.

Source anchors: context_highlight_window_feature.{h,cc} constructor/OnActiveTabDidChange/GetActiveTabFeature/CreateViewForOverlay; context_highlight_tab_feature.{h,cc} OnTrackedElementRectsChanged/GetWindowFeature/OnWillDiscardContents/RegisterObserverWithHost. Every modified baseline/output SHA is pinned. Isolated patch replay and shared-input byte equality passed. No shared native writes/build, owner profile, renderer execution or runtime acceptance occurred.
