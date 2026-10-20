# Supplied Arc sidebar-to-bookmark augmentation

Incremental source-only implementation after bookmark-admission f0f525735. It ports original4259984→426b4b0→426d388→426be60 into the actual Chromium source snapshot before destination effects. Root owns shared/GN/build. Required direct url/gurl.h and //url dependency are already provided by root's pending extension-owner/build-dependency batch; no duplicate GN proposal is included.

## Genuine source selection, not every live Arc tab

Original4253e58's source0/Arc branch at4254458..4478 parses the real StorableSidebar.json then appends its derived bookmark entries into the same source vector.4259984 obtains the actual Arc User Data root, takes its parent, and appends StorableSidebar.json. Here the captured selected profile is under Arc/User Data, so its grandparent is the exact source directory; basename is the actual selected sourceProfileId. This does not use an owner account, guessed current browser profile or a live tab inventory.

426b4b0 first accepts the first sidebar.containers record with nonempty typed items/spaces arrays. If none exists it tries sidebarSyncState.items/spaceModels, then firebaseSyncState.syncData.items/spaceModels. Items and spaces are **alternating ID/value arrays**, not ordinary record arrays. Record.value is unwrapped only when it is an actual dictionary.

Spaces are admitted for actual selected profile only: Default plus profile.default=true, otherwise exact profile.custom._0.directoryBasename equality. Pinned container lookup first checks newContainerIDs pairs with a dictionary containing pinned and a string ID, then legacy containerIDs pairs whose first string equals pinned. The first matching modern empty-string ID stays an empty match; it does not invent legacy fallback. The real container's childrenIds are traversed. Spaces with no admitted tree child are omitted. Titles use actual space.title, with missing-only fallback Untitled Space; empty titles are preserved.

426d388 inserts each referenced item ID into a per-space visited set before lookup, preventing cycles and repeated-ID traversal. It resolves first matching ID/value pair only. A data.list dictionary creates a real folder, missing-only title Untitled Folder, with actual childrenIds recursion. Otherwise it requires valid data.tab.savedURL and excludes chrome/chrome-extension/devtools only (bookmarklets accepted). Tab title precedence is top-level title, data.tab.savedTitle, URL spec; augmentation426be60 replaces an empty resulting URL title with URL spec. There is no URL dedup against ordinary Bookmarks rows, and the same item may appear once in separate admitted spaces.

426be60 emits real folder rows including empty folder titles and empty path components, then descendants; URL rows retain that genuine path. Arc entries are not toolbar entries, and get actual current creation time. The internal arcSidebar bit records the source-specific empty-folder/path treatment for the existing mode1 writer; it is not an invented external protocol field or success state. Ordinary Chromium unnamed-folder semantics from f0f525735 stay intact. Both flows land under the same unique Imported from Arc folder established by the parent proposal.

The reader runs even when ordinary Bookmarks is absent or empty. Missing/unreadable/malformed sidebar JSON contributes no Arc rows, matching the source's empty parser result; it does not fabricate data or a successful destination operation. JSON options0/maxdepth200 and source's natural graph visited-set semantics are retained. No arbitrary title/path/row truncation, synthetic source profile or fake bookmark container is introduced.

## Validation and scope

Original whole-image/functions/literals are pinned for the worker gate, file reader, three-version parser, recursive item tree and flattening augmentation including its branch islands. Bounded derived Ghidra procedures are retained; decoded original LLVM/register evidence remains authoritative for unresolved outside-slice calls. REA sessions were closed/snapshotted after static recovery.

`python3 verify.py` passes original pins and four count-one anchors/two-file replay. No native compile, migration/discovery/browser/helper execution, owner profile/Keychain/OS access or signing. Native compile and fixture/runtime observation remain integrator work. This completes the recovered Arc bookmark producer/consumer slice, not universal importer readiness: full extension/autofill and remaining independently documented migration fields stay separately owned.
