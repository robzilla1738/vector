# Immediate genuine saved-entry refresh and capture identity

Incremental after7b75b176d; two leaf files only. Root composition retains its309 BubbleAnchor/iterator spelling fixes. No shared native source, GN, build or runtime was touched.

The original46051e4 has no drag admission check. It reads actual saved prefs and native presentation immediately. `4605404..46054d4` compares actual child count, old/new entry counts and **every ordered full URL string**. The same ordered roster keeps the actual rows and their capture/focus identity; `4605618..4605658` updates both existing rows and the actual ghost immediately. Changed count or ordered URL identity calls trampoline`c604534`→`c785524` to stop row animations, remove all children, recreate actual EntryViews, and reset/update the existing ghost at index0 when nonempty. It does not reuse row identity by URL after a reorder.

The port removes the blanket drag-time defer and refresh_after_drag state. Genuine model/favicon/pref events now update actual existing rows/ghost while capture remains active whenever the ordered URL roster is unchanged. Changed identities recreate rows even when counts match, fixing the old same-count-only reuse. This also preserves the original consequence that a real external pref-order change during drag ends the captured row rather than silently postponing the change.

Original capture loss460ce54 posts weak active-drag cleanup460f1f8 without persisting reorder. Current155's owner has a raw dragged-row alias; before structural removal the port clears that alias, retains an explicit cleanup-pending flag, releases capture and posts the existing weak CancelEntryDrag operation. This preserves posted cleanup and real region cleanup notification while preventing the raw alias from surviving deletion. No fabricated replacement identity or deferred pref write is used. Pausing/destroying the real profile cancels through the existing lifecycle; stale posted callbacks are weak-bound.

## Fallback glyph proof

The fallback is **not** a stock155 globe. Original4607a48..60 selects VectorIcon descriptore82cf08→representatione82cef8→pathce79914. The existing leaf includes the302 original scalar/path values (24-unit canvas rendered at16px); raw path SHA256 is49ab027dbdd19eafb6f2d10896207243cf9139ee33d472996ee6becf85de2221, pinned here. Root's original native-pinned-tab-entry-view and native-vertical-bookmark-row source inventories independently record the same descriptor/path. This proposal leaves the genuine glyph unchanged.

`python3 verify.py` passes two-file replay and twelve bounded original source/data pins. Native focused compilation and disposable capture/refresh observation remain required. Root still owns actual region outgoing update/finish/cleanup/preview wiring. This removes the previously identified drag-refresh semantic gap at the leaf boundary; it does not claim packaged full-UI acceptance.
