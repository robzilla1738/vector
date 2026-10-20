# Original465176c draggable screen bounds

Read-only source contract for root routing. No native patch, build, profile or runtime operation.

The current stock155 formula (nativeTabStrip top to region bottom minus bottom-container minimum height and region Flex margins) does **not** match the supplied implementation.

Original exact operands:

```cpp
auto bounds = actual_outer_scroll->GetBoundsInScreen();  // region5b0
if (actual_physical_pinned && actual_physical_pinned->GetVisible())
  bounds.Union(actual_physical_pinned->GetBoundsInScreen()); // 478->338
const int bottom = actual_profile_header && actual_profile_header->GetVisible()
    ? actual_profile_header->GetBoundsInScreen().y()        // region5a8
    : actual_region->GetBoundsInScreen().bottom();
bounds.set_height(std::max(0, bottom - bounds.y()));
return bounds;
```

4651780..1788 takes the outer body screen rectangle.4651790..17b0 unions visible native pinned bounds via99d480. That helper is Rect::Union (empty rectangle takes other, minima of origins/maxima of ends), not subtraction/intersection.46517b4..17cc uses visible actual profile/search header top;46517d0..17dc uses actual region bottom otherwise.46517e0..180c clamps/saturates height arithmetic; no bottom minimum, Flex-margin or NewTab-button subtraction. The header must be the same real mounted5a8, preserving supplied footer placement.

The caller465a7fc uses this hit region to return the actual unpinned target before the final visible-Bookmarks/inside-region fallback. Source routing effect belongs to root; this artifact only pins the bounded geometry question.
