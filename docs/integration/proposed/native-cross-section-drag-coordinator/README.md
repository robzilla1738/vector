# Genuine region cross-section drag coordinator

Two NEW main-UI files. This composes the actual mounted Bookmarks owner, saved-pin leaf, admission state, preview/hint and concrete conversion helpers; it changes no shared region/GN/native files. No source-only result is actual drag acceptance.

## Exact source identity

The original constructor pins distinguish these callback families:

| Genuine owner | Update/begin | Finish/detach | Cleanup | Additional |
|---|---|---|---|---|
| Saved entries6a8,4606ee0 |462b5c0|462ba98|462beac|real EntryDragData|
| Bookmarks6a0,46121ac |462d1c0|462d5e0|462d8a4|462ce28 projectionChanged via4612080|

462d248 is an **interior instruction** of462d1c0's actual admission branch.462c248 is an **interior instruction** of462c188, not the drag-update entry.462d99c/462e4bc/462e9d8 are genuine Chats Select/Rename settlement/Archive callbacks, not drag. No task callback is installed on saved pins. The eleven immutable bounded source ranges and17 actual API snapshots are pinned by `source-evidence.json`.

## Concrete implemented behavior

- Constructor requires the real BrowserWindowInterface, region, `AuxBookmarksSection` and its real inner owner, saved leaf, actual custom outer scroll, optional genuine live PinnedTabContainerView, actual ProfilePreviewAdmission, region-child CrossSectionDragPreview and a mandatory region Delegate. It installs the **actual typed callback slots**, without placeholder closures. Other inner-owner callbacks (model contents, activation, selection) remain untouched.
- Saved update requires the genuine outer section visible+expanded, inner visible, actual admission and pointer inside outer section SCREEN bounds. It calls the real inner `UpdateExternalBookmarkInsertion`. An engaged target clears remove-only6c0/hint. Preview target follows the source's vertical grab fraction: source-height<1 gives.5, otherwise clamp((pointerY-sourceY)/sourceHeight,0,1); followY=pointerY-trunc(fraction*targetHeight). The optional return remains the original insertion SCREEN rect; only presentation follows the pointer.
- Outside/rejection clears real insertion(animated), stops/hides the same preview and releases its actual lock. Remove-only is **strictly pointerY>savedLeafScreenBottom+12**, even when the Bookmarks section is unavailable; it displays the actual Remove bookmark hint through the existing genuine BookmarkDragHint, sets6c0 and returns an engaged **empty** rect. Otherwise it clears remove-only/hint and returns nullopt, allowing the saved leaf's own genuine reorder. No fabricated default gap or success is returned.
- Saved finish calls the real `ConvertSavedPinToBookmark` with **data.title**, actual saved URL and optional actual TabHandle. Normal AddURL failure leaves the saved pin/live tab untouched. Remove-only adds no bookmark, clears6c0 before conversion and retires its hint; it returns actual saved-URL absence, includingfalse when a duplicate survives first-match removal. Source post-conversion effects still run for that mutating remove-only branch even if its final absence result isfalse. Normal failed AddURL only hides/releases presentation; successful normal conversion runs the source's required region effects. The concrete conversion helper already refreshes saved entries.
- Saved cleanup clears insertion(animated), hides/stops preview, releases lock, clears6c0 and hides the actual remove hint. It does not arbitrarily clear a different live bookmark-projection hint when6c0 wasfalse.
- Bookmark begin accepts only the real URL node. It uses the existing actual admission algorithm and `UpdateBookmarkPinnedDropProjection`, including original empty-pin fallback from actual custom scroll/live pinned container geometry. The early collapsed/admission rejection clears saved insertion and candidate, and leaves hide/release to the immediately dispatched genuine finished callback, matching the original early branch. Accepted targets update the same preview in pinned-tile mode. Candidate6c8 is retained as genuine BookmarkModel id+uuid; `candidate_bookmark()` reacquires the actual current node rather than retaining a dangling raw pointer. It is not used as URL-derived authority or an invented extra finish gate.
- Bookmark detach calls `ConvertBookmarkToPinnedEntry` with actual `GetAssociatedTabHandle(node)` from the real inner owner. That helper pins only the actual handle, commits the saved pref, rolls back its newly pinned state on failure and removes the actual bookmark only after genuine commit. Coordinator clears candidate, hides/releases preview and requests the exact source region refresh/layout effects. Cleanup clears candidate and actual saved insertion and hides/releases preview. Neither direction closes user tabs or infers ownership from title/URL.
- ProjectionChanged reads the inner owner's real active/detached/title/SCREENpoint fields and updates the **same** BookmarkDragHint. No new page bridge, floating-web implementation or guessed copy is introduced.
- Original4651140 only acquires its shared drag lock when actual a08 hover-expanded istrue and ca0 isempty. The coordinator preserves that guard, owns the real lock returned by its required Delegate, and releases it on the actual hide/drop/cleanup boundaries. Original7fb63f4 stores its type then registers the actual lock;465ad24..58 maps type2 to c8c, and34f96fc..718 forces the genuine hover-expanded state true while that counter ispositive. Thus type2 maps by **behavior**, not numeric coincidence, to the current platform's genuine `kKeepExpanded` lock; there is no replacement lock registry or always-expanded policy. Preview bounds are converted from actual SCREEN coordinates to the actual region via155 Views. All morph/170ms/reduced-motion behavior stays in the already source-ported preview.

## Root assembly and required effects

Register only `aux_cross_section_drag_coordinator.{h,cc}` in the actual main browser UI target. Existing dependencies are the already registered main-UI Bookmarks/saved-pin/conversion/preview/hint owners and Views. No new service, backend endpoint, private ledger or GN dependency direction is introduced.

Create the coordinator **after all genuine owners and preview have been added to the actual region**, and store it in the real region. The supplied preview must be the direct region child, not a floating replacement. Actual outer-scroll and optional live-pinned pointers must be the proven leaves (region5b0 / TabStripView338). Constructor immediately binds the typed slots, so the integrator must not also install competing closures on those same slots.

Implement the mandatory Delegate with the actual current region:

- `AcquireDragExpansionLock()` returns its real `GetExpandOnHoverLock(ExpandOnHoverLockType::kKeepExpanded)`. No empty/dummy lock is accepted. The source lock is only requested after the real admission hover-expanded guard.
- `SavedPinConversionCompleted()` performs the genuine462c188 then4645400 then original region layout-invalidating effects. Conversion/pref/model operations are already concrete; do not repeat them here.
- `BookmarkConversionCompleted()` performs the genuine4645400 then original region layout-invalidating effects. It must not replace them with an invented tab lifecycle event or successful backend response.

Root owns these shared region implementations/mounts; no inert Delegate implementation is provided or claimed. `Cancel()` cancels the actual two captures, clears both insertion/candidate states and hints, but keeps the callback binding for genuine continued ownership. Invoke it only at the actual source cancellation/disabled-owner boundary, not unconditionally for normal hide/reopen. `Retire()` is mandatory **before** actual profile/context rebind or child teardown: it invalidates weak callbacks, clears only owned slots, cancels captures, clears insertion states and hides/releases all owned presentation. Recreate with real new-profile owners after the genuine transfer completes. A BrowserWindowInterface pointer surviving a profile swap does not authorize an old BookmarkModel.

##155 lifetime adaptations and limits

Browser/profile/TabStripModel identity is snapshotted, actual Views use ViewTracker, admission uses its genuine weak pointer, and notifying conversions/query/layout boundaries recheck survival. The old node candidate uses actual id+uuid reacquisition. Drag locks are moved into a local release owner before hide/layout, so a reentrant retirement cannot access a dead coordinator. Callback/capture cancellation precedes profile retirement; no fake model state or profile creation is involved.

Static original source/API/patch replay pass. Native compile, the real region Delegate/mount/cancel/retire call sites, real pointer/capture observation, reduced-motion drag and pixel fidelity are unverified here. Existing supplied state/owner patches remain prerequisites, not substitutes for those observations. No shared native writes/builds, owner profiles, OS interactions or signing were used.
