# Supplied bookmark representation and session preservation

This ports the genuine bookmark identity carried by actual WebContents, and connects it to live/closed-tab serialization, session snapshots and navigation restoration. It does not infer a bookmark association from the current URL, a page title or an independent tab ledger.

The new `aux_bookmark_tab_representation.{h,cc}` is a lower-level base/content module. Root must register it in a target available to browser UI **and** SessionService, without creating a sessions→full-UI dependency. It needs only base and content/public/browser. The three existing source files are exact native276 baselines, unchanged through278. No GN or shared files were modified here.

## Exact supplied behavior

* Getter `4557640` reads SupportsUserData key `ead49a8`, returning optional `{int64 node_id, string host}`. Setter `45576f4` requires real WebContents, nonzero ID and nonempty host. Negative IDs are not filtered by the supplied implementation. Replacement owns a copy of the host. Clearing removes the same key.
* Serializer `4557788` inserts/overwrites only `bookmark_tab_representation_node_id` and `bookmark_tab_representation_host` in an existing extra-data map when representation exists and host is nonempty. ID uses the same decimal conversion as the recovered expansion model. Other entries are preserved.
* Restore `4557a5c` requires both keys, nonempty host, successful StringToInt64 and nonzero parsed ID. Invalid input leaves any existing representation untouched; it does not silently clear or synthesize a binding. Valid data replaces it.
* Original `2b54c88`, call `2b54ce4`, serializes the tab's actual WebContents into BrowserLiveTabContext's extra data. The port adds the same call before the retained Glic contribution.
* Original snapshot `415bd40` calls the serializer at `415bef8`, then emits an add-tab-extra-data command for every resulting pair (`415c000..415c020`, command33). The port appends the same pair commands to the real rebuild-command storage.
* Original restored-tab creation calls NavigationController::Restore at `4569820` and the representation restorer at `456982c`. The port invokes it immediately after the real155 Restore and its existing empty-entries assertion, preserving the order.
* Original region import `4645e90` restores the actual payload into its handle-keyed f98 map. Reconciliation `4646f58` checks the real loaded BookmarkModel, removes nonexistent node bindings and synchronizes current WebContents metadata. Its session persistence helper `464ffb8` writes these same two keys using genuine window/tab SessionIDs. These are pinned to establish the owning consumer; the region/cache/row owner is not yet mounted by this slice.

Aux names apply only to C++ adaptation symbols. Both persisted original key bytes are retained. The module introduces no URL classifier, profile metadata reader, cloud service, new account state or invented tab ownership.

## Remaining component work

The full original BookmarksView remains unmounted. Its coalesced model observer/rebuild, actual handle association projection, native rows, row reuse/animation, hover-card interface and drag lifecycle still require their coherent owner port. The already delivered expansion helper does not replace those behaviors. The current independently added body remains held until genuine Bookmarks and Chats owners are ready. Task/session associations are a different original metadata producer and are being recovered by the Chats lane.

`verify.py` checks the exact original image, bounded instruction/literal pins, public155 API inputs, six counted insertion anchors and disposable five-file patch replay. This is source verification only: no native compile, runtime/profile access, browser launch or parity acceptance occurred.
