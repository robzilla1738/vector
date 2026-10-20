# Actual empty-pin boundary: live PinnedTabContainerView

Incremental source-only followup to0ee971e79, two helper files. Root rebase must retain its336 explicit ClampSub integer-conversion fix; this patch only tightens the boundary type/include/comment and does not change positioning. No shared native source/GN/build/runtime was touched.

The previous unresolved +478/+338 mapping is now closed by actual metadata validation and assignment:

1. `c75eea0..c75ef18` validates an incoming view's metadata virtual+58 against`78abd18` (walking genuine metadata ancestry) before storing it at actual region+478.
2. `78abd18` initializes through`78abef4`; its class literal at`da9be7f` is **TabStripView**, path`da9be8c` is `chrome/browser/ui/views/tabs/common/tab_strip_view.h`.
3. Actual constructor`4127d28` installs primary vtable`e5a57f0`; +58 points`78abd60`→`78abd18`, independently tying the constructed class to that metadata.
4. `41278c0..4127938` validates its incoming child against`789e0f0` before writing **actual TabStripView+338**.
5. `789e0f0` initializes through`789e1b0`; the class literal`da9b94a` is **PinnedTabContainerView**, path`da9b961` is `chrome/browser/ui/views/tabs/common/pinned_tab_container_view.h`.
6. `464d3f0` reads precisely region478→child338; if that actual live pinned container is visible/nonempty it uses its SCREEN y minus4 as the fallback top.

This is the live pinned-tab collection, distinct from the genuine saved-entry leaf and the real Bookmarks owner. Neither NewTabButton nor UnpinnedTabContainer is a valid substitution. The helper now requires `const PinnedTabContainerView*` and includes the actual class header, preventing an unrelated generic View from silently filling this role.

## Exact root call

The current155 public `BaseTabStripRegionView::GetPinnedTabsContainer()` delegates to the actual `tab_strip_view_->GetPinnedTabsContainer()`. Use that real getter with the real outer custom scrollbody (original5b0):

```cpp
const gfx::Rect fallback = aux::BookmarkPinnedDropFallbackBounds(
    *this, actual_outer_scroll_body, GetPinnedTabsContainer());
const auto projection = aux::UpdateBookmarkPinnedDropProjection(
    node, *aux_profile_preview_admission_, width(), *pinned_tab_entries_,
    screen_point, fallback);
```

Root owns the actual outer custom-scroll mount and region callbacks. A missing body produces the genuine empty fallback; no substitute bounds may be invented. A null actual pinned-container getter is legitimate absence; a real visible/nonempty container must be supplied. Existing proof retains exact fallback height52 (original metric0x3a→40 plus12) and preview insetsTLBR(4,8,8,8).

`python3 verify.py` passes two-file independent replay and13 bounded original source/data pins. This closes the source mapping gap only. Root must compile its rebased helper/region call and observe real disposable drag geometry before claiming packaged acceptance.
