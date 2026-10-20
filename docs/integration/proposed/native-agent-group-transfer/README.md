# Existing-object agent marker retention

The actual Chromium155 collection owns `std::unique_ptr<TabGroup> group_`. `GetTabGroup()` returns that same object. `DetachTabGroupForInsertion` moves the collection into `DetachedTabCollection`; `InsertDetachedTabGroupAt` moves the same collection back. `InsertDetachedTabGroupImpl` registers its existing `GetTabGroup()` before inserting the collection. It does not call the group factory or reconstruct features.

The actual profile-switch implementation takes `DetachTabsAndCollectionsForInsertion` and inserts each genuine grouped collection with `InsertDetachedTabGroupAt`. Therefore its existing native agent marker survives naturally with the group/features object. Adding a title-based restoration step would weaken the real marker semantics and is unnecessary here.

The pinned snapshots are read-only evidence from the current applied source. This finding does not establish disk-session restoration or automatic MultiContentsView AI-tabs takeover. The supplied original `045f4540` is that separate takeover callback (scheduled by `045f4420`), rather than this generic transfer path. No native change, execution, build or owner-state access occurred.

Run `python3 verify.py` for snapshot hash and exact ownership/move-chain checks.
