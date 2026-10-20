# Supplied sidebar scrolling-contents owner (region5c0)

The original e724750 subclass is not a plain View even though it inherits plain View metadata. This port preserves its real preferred-size cache, invalidation hooks, right-button callback and constructor Flex layout. It does not replace or duplicate the already ported VerticalTabStripScrollView's elastic/input behavior.

## Actual source behavior

- `4661240`: preferred sizes are cached by optional bounded width. A bounded caller width is used exactly. An unbounded caller uses this view's actual positive width; if neither exists, the query stays unbounded. Height is always unbounded. Cache misses call the genuine base View CalculatePreferredSize (therefore the actual Flex layout/children).
- `466141c`: **ChildPreferredSizeChanged and ChildVisibilityChanged**, slots2f8/300, clear the cache then call inherited PreferredSizeChanged(slot308). PreferredSizeChanged itself is not overridden. `466145c` does the same only when hierarchy details.parent is this contents owner.
- `46611d8`: `(event.flags & allFiveMouseButtons)==right` invokes the real bound callback `(source,event)` and returns true; every other press returns false. The callback is mandatory in the actual constructor and remains required here. No owner accesses occur after dispatch, since a real menu action can close the window.
- `462bffc`: the region callback requires actual BrowserView and owning BrowserWidget, floors actual event.location_f, converts from the actual source to screen, then calls BrowserWidget's real ShowContextMenuForViewImpl(source,point,kMouse). Root must bind that real callback with its region lifetime. This class neither substitutes menu items nor claims the widget's existing hit-test/admission gates succeeded.
- Contents constructor: vertical FlexLayout, collapsed margins, cross-axis stretch, default child FlexSpecification(Vertical,Preferred,Preferred,false,PreferredCross). This is the original nonflexing child sizing, not invented extra spacing/stretching.

## Outer5b0 exact configuration

`ConfigureSidebarContentsScrollView` applies the proven generic settings: use actual contents preferred size; ClipHeightTo(0,0); transparent/null background; no overflow indicator separators; vertical overflow gradient; outer Flex(Vertical,ScaleToMinimum,Unbounded,false,PreferredCross).WithWeight(1). The zero preferred-height clip works with the real weighted outer Flex allocation; it is not a hard zero actual viewport size.

Source also installs the real VerticalTabStripScrollBar(state_controller) and sets original scrollbar+409=false, hiding its actual thumb then invalidating layout/paint. The class/header identity is positively proven at7fb6fe0→7fb6fe4 with literals db10e11/db10e2b. Its exact155 API for that original boolean has not been proven, so the generic configure helper deliberately does not invent a public hide/overlay replacement. Root retains ownership of that bounded remaining scrollbar adaptation and actual outer creation/mount.

New source files are `aux_sidebar_contents_view.{h,cc}`. The real current155 AddChildView API requires class metadata registration; that narrow introspection adaptation does not change its View/Flex behavior. Root owns UI sources/GN, real menu callback, full body mount and compilation. Original bounded byte pins plus independent two-file filesystem replay pass; no native writes/builds or runtime/profile/auth/Keychain operations were performed here.
