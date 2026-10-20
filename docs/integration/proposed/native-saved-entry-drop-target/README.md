# Genuine saved-entry native tab-drop owner

Original region6b0 is a **separate 312-byte TabDragTarget delegate**, not saved leaf6a8. Its vtable is e508f60; constructor037dfc80.c769 stores it independently, while896 stores actual4604e08 leaf in6a8. This four-file source-only proposal adds `aux::SavedEntryDropTarget`, a tiny real saved-insertion helper, and a narrow public batch-pin wrapper around the existing real model operation. No UI replacement/URL ownership inference/detach-and-close workaround.

## Required actual owners

Construct inside `AuxSidebarBody` after actual leaves/model/native handler exist. Pass actual BrowserWindowInterface, region, saved leaf, physical native pinned container, outer ScrollView, existing TabDragHandler, real CrossSectionDragPreview, actual admission state, required type2 expansion-lock callback, required clear-empty839 callback, and genuine saved-commit-completed callback. No defaults/no-op callbacks. Retire before native collection/leaf/profile retirement.

Root owns routing: preserve actual projection f90 early-return and source465a4ec..465a5f4 saved-target priority (visible saved screen rectangle or empty saved leaf plus eligible drag). Return this owner, never `reinterpret_cast` the View or add invented inheritance to it. The independent empty-native-pinned placeholder path remains separate. Source original6a0+4f8 is Bookmarks' own target, not this6b0 target.

## Actual effects

Original465fd24 requires exactly one real tab in session drag data, obtains the source slot's actual rendered view through4117518, caches real WebContents URL/title, projects original4606940 saved insertion, then4651140 cross-section preview and4132e90 source-view suppression. The155 integration uses `TabDragHandler::ViewFromTabSlot` (slots are explicitly not real tab views in155), actual TabView data, real screen→region coordinates and real layer opacity save/restore. If155 actual tab has no layer, it receives an ordinary nonopaque paint layer to express original opacity; no screenshot or fake tab UI is created.

Original46607c4 commits cached URL/title through46070b8, then4116b58(true) validates real attached data and performs the model's batch pin operation (41e5da0), then actual presentation/projection refresh. Public `PinTabsForAuxSavedEntryDrop` forwards the existing private batch operation, preserving split behavior rather than sequentially pinning stale indices. Current155 controller calls target drop after stop and then its genuine stopped-drag lifecycle; this owner does not detach/close tabs or claim controller ownership.

Original shared cleanup46605cc and entry465fd1c call4660e8c(true): preserve current optional saved insertion or initialize at actual end, and **clear actual region839** with real pinned/layout/paint effects. This is the source-backed end cleanup requested by root, not a timer/proxy. Retire clears insertion before leaf destruction and notifies genuine `RegisterWillDestroyCallback` subscribers. Preview/actual layer/expansion lock are released on cleanup; weak checks stop after effects that retire the owner.

Metric correction: bounds call the root385 helper after its explicit original40+12 adaptation. Chromium155 `kVerticalTabPinnedHeight` is32; earlier21d4 documentation’s assumed40 was incorrect. No global metric is changed here.

## Verification and limits

`verify.py` replays all four files in a disposable filesystem and checks original arm64 binary/ranges/vtable. Bounded REA465fd24 snapshot is retained; full LLVM remains authority. Add the two new .h/.cc files to the existing enabled Mac native sources; no other GN source is needed. Native compile, actual drag/drop, cancellation and UI fidelity are unverified. This is a concrete source port awaiting root integration, not a completed runtime acceptance claim.
