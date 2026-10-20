# Genuine bookmark projection hint and pinned-drop admission

New helper paths only, after actual317 source. Region ownership, GN and actual native application stay root-owned. This does not replace or duplicate the already compiled CrossSectionDragPreview at originalregion6b8.

## Floating hint

Originalregion6d8/6e0 is a distinct retained TYPE_DRAG widget and text view. Projection callback462ce28 reads the real bookmark owner's active860, detached861, SCREEN point970 and actual title978. It hides the retained widget when inactive. Exact UTF16 literals are:

* normal empty title: `Add bookmark`
* normal title: `Add to bookmarks: <title>`
* detached empty title: `Remove bookmark`
* detached title: `Remove bookmark: <title>`

4634090 builds a Geist12px, normal400 label, line height16, centered/multiline, with vertical4/horizontal10 empty border. The custom container adds8px on each side; preferred size is the actual label size plus16. Its paint467aeec fills the inner8px-inset bounds at radius8 with role256, one shadow(offset0,3 blur6 role230), then a .5px role258 border inset.25 at radius8. Role270 is actual green text in both modes. Original bindings are independently pinned:

| Original role | Dark | Light |
| --- | --- | --- |
|256 fill|`ff18181b`|`fffafafa`|
|258 border|`26fafafa`|`1a0a0a0a`|
|230 shadow|`1a000000`|same|
|270 text|`ff16a34a`|same|

The helper uses these actual colours, without substituting current155 numeric IDs. `4650ec0` measures the actual text/widget, requests the display nearest the real SCREEN point, places at pointer(+4,+4), flips above with4px spacing if it would cross the display work-area bottom, and clamps origin to the work area while preserving measured size. No fixed invented hint width or replacement toast is used. Current155 client-owned/event-transparent/translucent/nonactivating TYPE_DRAG creation is the platform adaptation; original InitParams byte offsets are not asserted to be155 offsets.

### Root mount contract

Own `std::unique_ptr<aux::BookmarkDragHint>` in the actual region. Construct against `*this` at its real widget boundary. Forward the actual L4 owner's projection-change callback:

```cpp
hint->Update(bookmarks->drag_projection_active(),
             bookmarks->drag_projection_detached(),
             bookmarks->drag_title(), bookmarks->drag_screen_point());
```

The actual owner getters and typed callback are in L4's genuine `aux_vertical_tab_bookmarks_view.h`; they are not synthesized from URL/row state. Hide on actual drag cleanup and destroy the helper at actual region teardown/profile-owner retirement. It retains its widget across ordinary hidden updates, as the original does. No OS notification, browser tab or network operation is involved.

## Exact pinned-drop admission/projection helper

`UpdateBookmarkPinnedDropProjection` receives the actual BookmarkNode, existing compiled `ProfilePreviewAdmission`, actual region width, real saved-entry leaf, SCREEN point and genuine empty-leaf fallback bounds. It invokes **the existing actual** `AdmitsProfilePreview(width())` oracle. Source462d248..33c is the same collapsed/hover/retention/slide/151px predicate; no parallel width-only boolean or second animation state is introduced.

The actual nullable leaf must be checked by root before calling. Invalid/null/non-URL nodes return no candidate without clearing leaf insertion (original early branch). Rejected width clears insertion. A point in a real visible saved leaf calls its real UpdateDropInsertion. A nonempty leaf outside its actual bounds rejects. An empty leaf admits only within the actual fallback; the target preview insets are source TLBR(4,8,8,8). Returned candidate is the original borrowed BookmarkNode, including source's inside/query-unavailable case; it is never inferred from URL or a fake live tab.

Root stores/clears the real candidate from the result. Only an admitted real target bounds result goes to the existing CrossSectionDragPreview with unchanged actual row title/ImageModel/SCREEN row bounds. Root must weak-check itself after real leaf mutations, which can notify real view/pref observers. The helper does not delete bookmarks or claim conversion succeeded.

### Fallback geometry producer and explicit unresolved slot

`BookmarkPinnedDropFallbackBounds` implements464d3f0 from its **actual producer views**: region SCREEN x/width; initial y from actual custom outer scrollbody original5b0. If the actual region+478 child+338 is visible and has nonempty bounds, y becomes that child's SCREEN y minus4. Height is original layout metric0x3a plus12. This metric's original jump-table entryced81c8[58] resolves50394c (`movw0,#40`), so height is exactly52 independent of density. Do **not** substitute current155 kVerticalTabPinnedHeight, which returns32. A missing outer body returns the original empty rect.

The semantic class/current155 accessor of +478 child+338 is still unresolved here. Root must not guess NewTabButton or UnpinnedTabContainer from the offset. Pass nullptr only when that actual original optional boundary is absent; omitting a real present boundary is not fidelity. This unresolved binding affects empty-pin fallback mounting, not the independently mountable actual floating hint or existing nonempty-leaf projection.

## Evidence

`python3 verify.py` independently replays both new files and verifies20 bounded original source/data pins. No shared source edits, native compile, target execution, owner state, credentials, Keychain, grants or network were used. Root must add the two sources to its actual UI target, compile the concrete owner integration and observe real disposable dragging before claiming acceptance.
