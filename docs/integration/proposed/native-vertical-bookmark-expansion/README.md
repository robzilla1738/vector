# Original VerticalTabBookmarksView expansion model

This is the first new-file implementation slice for the genuine supplied Bookmarks body, not a replacement body mount. The independent body-retirement proposal remains held. L2 owns the shared original section/header and Chats owner; this module is disjoint from those and from the actual region.

The original constructor at `460f608` names `VerticalTabBookmarksView` at `decb6ef`, with source path `../../chrome/browser/ui/views/frame/vertical_tab_bookmarks_view.cc` at `decb708`. Its inherited metadata leads to the real ScrollView source, and the constructor installs the original custom vertical scrollbar `7fb6840`. It is a ScrollView-based custom bookmark component, not a stock BookmarkBarView. No existing independent Aux bookmark grid/bar defines its model or behavior.

## Exact ported state

Reader `461003c` clears the in-memory sorted set, gets the real profile preference list `aside.vertical_tabs.expanded_bookmark_folder_ids`, accepts string values only, parses them with the original StringToInt64 call and inserts successful results into a sorted unique int64 set. It does not restrict IDs to positive values, coerce integers, trim strings or invent default expanded folders. The155 module uses the actual public conversion and `base::flat_set` APIs.

Folder-action branch `4614898` handles a real folder node. If its ID is already expanded, it removes that ID alone, preserving descendant expansion. Otherwise it inserts the clicked folder and all consecutive folder ancestors through the real parent chain. It then writes the sorted set as decimal strings into the actual profile list preference and explicitly requests an animated rebuild. The URL branch of the original method is different and is **not** implemented as a fake success here; `ToggleFolder` returns false for null/URL input, and the future real View owns actual navigation/activation.

The real preference registrar is initialized at `46101b0` and subscribes to callback `461dd0c`. That callback copies the old set, reloads, and requests a non-animated rebuild only when the effective sorted set changes. The module preserves this behavior. Own writes update the set before the synchronous preference notification, so that notification observes the same set; the explicit folder-action rebuild remains animated. The owning View must preserve the original `6f3/6f4/6f5` coalesced rebuild loop rather than treating these callbacks as permission to replace/reorder live rows independently.

Registration `34e3f1c` creates an empty List Value (type7) for this exact key and passes registration flags0. `RegisterVerticalTabBookmarkExpansionPrefs` therefore uses `PrefRegistrySimple::RegisterListPref` with its actual empty-list/default-flags API. There is no inferred starter data or syncable registration. The legacy key bytes are part of the supplied implementation inside isolated Aux profiles.

## Integration contract

New files: `chrome/browser/ui/views/frame/aux_vertical_tab_bookmark_expansion.{h,cc}`. Exported class `aux::VerticalTabBookmarkExpansion(PrefService&, RebuildCallback<void(bool animate)>)`, `expanded_ids()`, `IsExpanded(id)` and `ToggleFolder(actual_node)`. The caller must pass the genuine currently authoritative profile's registered PrefService and actual model node; no path/URL/title lookup substitutes for that association. Registrar lifetime is owned by the class and ends before its callback/cache members. A future retained same-window View must retire/recreate or explicitly rebind this profile-scoped owner at the already genuine transfer boundaries; this unmounted slice does not guess that owner lifecycle.

The integrator owns GN and profile-pref registration. Required dependencies are base, components/bookmarks/browser and components/prefs. No region, existing renderer, root GN or shared native source is changed. The future genuine component will consume this model with L2's actual AuxSectionView contract; it is not yet mounted and cannot justify retiring the existing body by itself.

## Evidence and limits

`source-evidence.json` pins original reader, writer, callback, registration instructions and actual155 APIs. `verify.py` checks those exact bytes/literals/calls and replays the two new files. No model/service, owner profile, app, browser or network is executed. Native compilation is pending. Actual row geometry/icons, bookmark-model notifications, drag/context actions, URL activation, animation and genuine mount remain the next source recovery work; no readiness or visual fidelity is claimed for them.
