# Exact saved-entry routing and scrolled-body priority

Incremental two-file proposal after5022cf002's standalone target outputs; no shared native mutation/build/runtime. Adds:

```
aux::SavedEntryDropRoute { kNone, kSavedEntries, kUnpinnedTopBand }
GetSavedEntryDropRoute(actual_context, saved, actual_base_region,
                      actual_outer_scroll, screen_point)
```

Run after the actual publication guard. Handle `kUnpinnedTopBand` by clearing actual839 through its normal effects and returning the real unpinned container's `GetTabDragTarget(point)`. Handle `kSavedEntries` by clearing839 and returning the genuine separate6b0 owner. Only `kNone` continues the separate native empty-pinned path. A false-only exclusion would incorrectly let the52px native-placeholder path override the original15px unpinned priority.

## Original control flow

*465a498..465a4c0/465a884..465a990:* require real native strip and outer body, active controller attached to actual native context, no originally pinned data. Read actual `outer->contents()->GetVisibleBounds().y()>=1`; this is a scrolled visible origin, **not** contents height/preferred size. If pointer is in outer screen x/width and y `[outer.top,outer.top+metric57/2)`, and actual unpinned container exists, return that target before saved/physical pinned branches. Original selector57 jumptable ced81c8[57] selects5039b0, literal30, hence15px. Chromium155 enum returns34 and must not substitute17px.

*465a4c4..465a5f4/465a5f8..465a638/465a998..465a9f4:* source w23 is actual attached active nonempty drag, no originally pinned entry/group header, at least one nonnull WebContents, and every nonnull contents present/ungrouped in actual model. Source w8 is inside **visible** saved leaf screen bounds. The nonempty saved owner routes only when w23&&w8.

*465a528..465a5a4/465aae0..465ab38:* only when saved entries are empty and pointer is outside its visible bounds, repeat the same genuine eligibility loop then hit-test original464d3f0 fallback rectangle. Return saved6b0 only on that hit. Source465a5a8 combines eligibility/hit, clears839 and returns6b0 at465a5f0. This is not unconditional empty-leaf eligibility and not an arbitrary URL drop classifier.

The helper uses root385's corrected40+12 empty bounds. A missing physical pinned container uses exact same region x/width and scroll y fallback,52px. Region root handles publication, latch effects, real target lifetime and teardown.

## Concrete remaining Bookmarks target gap

Original region returns `region6a0 + 0x4f8` (465a480..490) when actual Bookmarks section+inner are visible and pointer inside region, after higher-priority paths (also the no-native-strip fallback). This is a **secondary TabDragTarget interface on original VerticalTabBookmarksView**, distinct from saved6b0. Current genuine `aux::VerticalTabBookmarksView` inherits only ScrollView and exposes external saved-entry bookmark insertion/commit plus row-owned drag callbacks; it has no native `TabDragTarget` entry/update/exit/end/can-drop/commit/will-destroy implementation. Neither its `UpdateExternalBookmarkInsertion` nor a cast to the View supplies that missing native controller lifecycle. Root must leave this explicit until a separate source-backed native Bookmarks target port; this proposal does not create a no-op adapter or broaden ordinary fallback behavior.

Verification is isolated two-file replay plus original artifact/range/metric jump-table pins; native compilation and real drag acceptance pending.
