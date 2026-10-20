# Preview coordinates across the actual 155 hierarchy

This one-file followup pins the applied165 presentation output. It remains unwired and changes no shared native files.

The original uses raw view bounds: `4640600` unions each role's `View+1b8` rectangle and `4657fc4` copies that same raw rectangle into its restoration record. After moving the real child into the live preview host, `4657dcc..4657e34` subtracts only preview-top from the saved Y. There is no original coordinate conversion to reproduce blindly.

That original assumption has a concrete topology basis. `TabStripView` constructor `4127d28` preserves its third boolean at369. In `AddScrollViewContents`, the true branch `4127970..4127990` takes external parent340 and adds the pinned child to it; the false branch at4127a30 uses pinned scroll330. Current155 `TabStripView::AddScrollViewContents` instead always calls `pinned_tabs_scroll_view_->SetContents`. Thus a typed adapter accepting descendants via `Contains()` must not treat every descendant's raw parent-relative rectangle as region-relative.

The followup projects each actual parent-relative rectangle into its region using `View::ConvertRectToTarget(surface.parent(), &owner, surface.bounds())`. Starting at the parent deliberately excludes the leaf's live swipe transform. The top boundary receives the same treatment. It snapshots all five presentation rectangles before reparenting any child. The existing `ProfilePreviewViews` still stores the actual original parent/index/rawbounds/visibility/scroll offset for restoration; that record is not converted or overwritten. No whole-window screenshot or reconstructed tabs replace the actual Views.

This is a Chromium155 topology adaptation, not a claim that the original called `ConvertRectToTarget`. Original layer transforms of ancestors beyond the five leaf surfaces must remain absent or be accounted for by the eventual faithful owner binding. The original role mapping and actual fallback page/input owner are still required before activating gestures.

Focused check: verify pinned original bytes and current155 source headers; independently replay this one-file patch and verify its final hash. No native compile or UI/runtime acceptance.
