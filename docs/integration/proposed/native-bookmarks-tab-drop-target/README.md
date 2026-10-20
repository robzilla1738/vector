# Original Bookmarks native tab-drop interface

Two-file source-only port on actual original-derived `aux::VerticalTabBookmarksView`; no new GN sources. The supplied constructor460f6e0..6e4 installs a real secondary `TabDragTarget` vtable e720bc8 at+4f8. The current ScrollView owner now implements that interface through proper C++ multiple inheritance and forwards into its same genuine Impl/model/rows/hint callback. No View reinterpret cast, fake controller, duplicated bookmark model or replacement UI.

## Native owner contract

The actual region returns this genuine target after saved/native priorities when BOTH the real Bookmarks outer section668 and inner6a0 are visible and the point lies inside the region screen bounds (original465a480..490; normal fallback465a7b0). The point need not already be in the inner rectangle; update itself controls active acceptance. Root can expose the actual inner owner as `TabDragTarget*` through Body. No private byte offset is used in Aux.

`OnTabDragEntered`, exit and ended forward original461ec30 cleanup: clear cached payload/destination/row indicators and the existing projection/hint state. `OnTabDragUpdated` reproduces461edc0: exactly one actual tab, valid source WebContents URL inside visible loaded Bookmarks, current real model scope; cache URL/title, fallback empty title to real host/spec, publish native hint through existing `SetProjection(...,detached=false)`, and mark the actual visible folder under the point. Capture that folder's real current append index. Return the controller's actual attached context (original461f21c), preserving native drag ownership rather than switching profiles or manufacturing a window.

Native drop does NOT use the saved-entry external gap animation. Existing saved-entry `UpdateExternalBookmarkInsertion`/conversion and internal row dragging stay intact. A native hover chooses a folder only; otherwise commit uses the source default parent. No title/URL-based tab ownership inference.

`CanDropTab` is genuine active7c8 && !retired7c9. The retirement flag is positively pinned: original destructor46103cc writes1 at46103d0 to+7c9. It is **not** the separate row-drag flag742. Commit461f7f8 snapshots/clears native state first, then source4613354 validates model/URL, uses captured explicit folder/index or default append, supplies actual title fallback, calls real `BookmarkModel::AddURL`, queues the original pending navigation and invokes the existing activated callback. The actual browser tab is not pinned/unpinned/detached/closed/submitted.

The current155 lifetime adaptation re-resolves folder ID+UUID before model mutation, checks weak liveness across genuine callbacks/model observers, clears incoming state on model rebuild, and notifies actual native target will-destroy subscribers before profile retirement and destruction. The source row/model/menu owners remain the same instances.

## Integration and evidence

No default callbacks are introduced: the existing actual inner projection callback reaches `CrossSectionDragCoordinator::ProjectionChanged` and genuine `BookmarkDragHint`; the existing activated callback reaches the real body/projection owner. Root must retire the target at the existing pre-profile-transfer boundary before model/row teardown (already `RetireForProfileChange`).

`verify.py` checks two-file disposable replay plus original constructor/retirement/update/commit/vtable bytes. Bounded REA snapshots are retained; one secondary-address decompile lookup failed explicitly, and the full LLVM source remains authoritative. No native files were changed, compiled or run. Actual native tab dragging, cancellation, bookmark creation and hint rendering remain unverified until root integrates and observes the local build.
