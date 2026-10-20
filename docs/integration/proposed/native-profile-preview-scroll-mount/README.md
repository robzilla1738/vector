# Mount the genuine scrolling preview role in155

Apply after `a78e82997` and `d2dd372b7`. This changes only `common/tab_strip_view.cc`, pinned to actual native170; no existing inputs have been changed in the shared checkout.

The supplied constructor `37e0cd4..37e0e00` creates one `VerticalTabStripScrollView`, adds it to the real region, then installs the genuine prior `VerticalTabStripView` as its contents. Pinned live tabs are a separate preview role externalized from the original common TabStripView. It does not create two custom scrolling views.

Chromium155 now places the actual live pinned/unpinned containers under its common TabStripView, each with a ScrollView. This adaptation instantiates the restored custom class **only for the actual vertical unpinned surface**. Existing155 content creation, TabCollectionNode callbacks, drag, animation, profile migration and scrolling policy remain attached to those same live contents. Horizontal and pinned scrolling retain the existing class. No wrapper or surrogate tabs are added.

The current public `unpinned_tabs_scroll_view()` accessor returns this actual subclass as ScrollView; the region's admission code must use the actual subclass's `axis_lock()` and `scroll_sequence_active()`. It must not manufacture duplicate axis state. The third borrowed preview role is this exact descendant. Already delivered ProfilePreviewPresentation converts its actual parent coordinates before borrowing and restores its real parent/index afterwards. This is an explicit153→155 hierarchy adaptation, not a claim that those parent structures were byte-identical.

Root GN hook: common implementation already depends on vertical's public source set for the existing scrollbar; add `//chrome/browser:buildflags` to common implementation dependencies for the new enabledAux-only selection. Child scroll-port registers the new header/cc in vertical source sets. No region input trigger or visibility substitution is installed here.

Static source pins and disposable exact-input patch replay passed. Root owns focused compilation. No target run, owner data, shared native write or build.
