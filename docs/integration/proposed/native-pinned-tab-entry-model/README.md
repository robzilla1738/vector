# Supplied persistent pinned-tab entry model

This first disjoint dependency implements the actual persistent data model consumed by `VerticalPinnedTabEntriesView`. It does not rename or extract the independently written live pinned grid, does not mount a replacement view, and does not claim the preview's first leaf is ready. Three new paths have null actual baselines; no existing native code changes.

## Source and ownership

Original region construction037e0a38 calls04604e08 and stores the exact resulting child at region+6a8. Primary vtablee71f4b0 metadata identifies `VerticalPinnedTabEntriesView` (literaldecb673). Constructor preserves actual context pointers at340/348/350, installs the real model observer through tabstrip348 and listens to the actual profile PrefService key `pinned_tabs` at0460517c. The real pref-change callback is rebuild046051e4. These objects are separate from the stock `PinnedTabContainer` inside the actual TabStripView.

Rebuild0460521c calls041d4660 on the current profile. That function retrieves the actual PrefService, reads `pinned_tabs` as a List, visits values in original order, accepts dictionaries only, requires string field `url`, constructs a real GURL, rejects invalid GURLs, and reads optional string `title` as UTF8→UTF16. Missing/non-string title yields empty text. The return vector's entry stride is144 bytes: actual GURL120 plus u16string24. It does not create a UUID, deduplicate URLs, read a daemon task list or enumerate live pinned tabs as its source of persistent entries.

Writer041d4a24 uses a scoped list preference update for the same actual key, replaces the list, filters invalid GURLs, emits canonical `url`, and emits UTF16→UTF8 `title` only when nonempty. Unknown dictionary fields are not retained by that original writer. The order and duplicate valid entries are retained. The new module uses current155 typed base::ListValue/DictValue and PrefService::SetList for that same final preference operation; it does not add a sidecar file or parallel persistent store.

The original rebuild creates children through046055bc→c604534 (tail thunk)→c785524. That body clears prior real children, then constructs and attaches one real leaf per persistent entry through cbafcd4→0460ee60. The leaf primary metadata resolves04604e00→04604d00, literal `VerticalPinnedTabEntriesView::EntryView` atdecb5ac. Each real leaf holds its containing entries view at3d0 and its entry index at3e0. It is a native View with its own event/paint vtable, not merely the current independent Button tile. Update046078c0 derives the tooltip/name from the saved title, URL host or full URL, then overlays actual live-tab title/favicon state; those live associations do not replace the saved entry identity.

This evidence fixes the preview topology boundary: borrowing the complete AuxSidebarView or presenting the independently written live `AuxPinnedGrid` would include unrelated sections and the wrong model. The exact new leaf component, native matching/open actions, drag lifecycle and paint remain the next slice. No speculative View is returned from this module.

## Integrator hooks

- Compile `chrome/browser/ui/tabs/aux_pinned_tab_entries.cc` in the appropriate existing native browser/UI target; header at the same prefix. Dependencies are existing base, url and components/prefs; no new external library.
- At actual profile preference registration call `aux::RegisterPinnedTabEntriesPrefs(registry)`. Default is an empty List. Preserve the real profile PrefService as owner; never substitute a global account/default-profile preference store. The original preference name is safe inside isolated Aux profiles and remains unchanged.
- The eventual true component will call `ReadPinnedTabEntries(*profile->GetPrefs())`, observe `aux::kPinnedTabEntriesPref`, and use `WritePinnedTabEntries` for real accepted entry changes. This proposal does not eagerly read/write any preference or register an observer.
- Optional focused C++ fixtures are in `aux_pinned_tab_entries_unittest.cc`; add to the existing unit-test source list with components/prefs:test_support and gtest. They cover malformed value/URL filtering, order+duplicates, canonical serialization, optional titles and distinct in-memory PrefService isolation. They use no OS profile or filesystem. They are authored but **not compiled or run in this lane**.

## Verification and remaining limits

Run `python3 docs/integration/proposed/native-pinned-tab-entry-model/verify.py`. It hashes the pinned supplied arm64 extraction, exact model/constructor/leaf/thunk ranges and string literals, pins current155 typed preference APIs, checks actual call targets and replays all new files into a disposable tree. It confirms they are absent in shared native source. This is static source/replay verification only. The parent owns actual GN registration, compile and eventual disposable UI observation. No native writes/builds, app launches, OS actions or signing occurred.

Original adaptive layout source046080e0/04608d00/04608230 is also identified: height40, gap6, preferred width32 (actual GetLayoutConstant58/59 jump slots), variable columns up to4 with balancing instead of the independent always-three grid. Its collapsed/temporary width/drop flags and actual child actions/paint require separate complete port; those are deliberately not inferred into this data module. Current old sidebar behavior stays unchanged until that implementation is ready.
