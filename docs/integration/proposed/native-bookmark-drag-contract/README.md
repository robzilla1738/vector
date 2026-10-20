# Actual Bookmarks owner drag callback contract

The original begin callback is not a no-argument closure. Setter46121ac alone does not establish its type. Both actual invocation sites prove the same four-argument boolean-return contract:

* Drag4619134..46191e0 loads the real primary BookmarkNode from owner6f8 into x1. It copies the displayed row ImageView420's ImageModel348 with6bed5c into a temporary, passes that reference in x2, calls row GetBoundsInScreen1427574 and passes its16-byte Rect in x3, and passes the screen point returned by461baec in x4. The bool return is saved and gates the actual detached drag path.
* Release461a078..461a110 repeats the same image/row-rectangle/pointer setup and consumes the bool before deciding whether to invoke actual detached6d8.
* Region462d1c0 first rejects null/non-URL nodes and missing actual saved-entry leaf. It uses x4 as screen Point for real leaf/fallback geometry, forwards x2 ImageModel and x3 row bounds into original4651140 drag presentation, and returns real admission. No caller may substitute a fire-and-forget notification or pretend a rejected drop was accepted.
* Original6bed5c copies the ImageModel variant, including its vector/color representation. New `VerticalBookmarkRowView::GetDragImageModel()` returns the actual ImageView's model, without rasterization, favicon substitution or invented fallback image. Row bounds already use the inherited real View::GetBoundsInScreen API.
* Detached6d8 takes the actual BookmarkNode pointer; finish6e0 has no arguments. ProjectionChanged6c8 has no arguments and reads the owner's separately retained860/861/970/978 state; its setter4612080 immediately invokes an installed callback.

The new callback header gives the coherent owning-view/region port exact shared C++ types. The owning view is still in progress, so these are not mounted or claimed to implement the drag lifecycle by themselves. The planned owner uses `SetProjectionChangedCallback(BookmarkDragProjectionChangedCallback)`, `SetDragCallbacks(BookmarkDragBeginCallback, BookmarkDragDetachedCallback, BookmarkDragFinishedCallback)` and actual getters for the retained projection. Root owns the genuine region callbacks; no shared region is modified here.

Two counted row insertion anchors on actual289 output (including the real155 layout setter correction), plus one genuinely new callback header. `verify.py` checks original byte/assembly/API pins and disposable three-file replay. No build, native runtime, synthetic drag or owner data access.
