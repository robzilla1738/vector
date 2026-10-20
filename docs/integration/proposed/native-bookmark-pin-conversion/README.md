# Original bookmark to saved-pin conversion

Port the real effect of region462d5e0, separated only to compile against155 while the genuine region/Bookmarks owner is being connected. Required inputs are the real BrowserWindowInterface, original saved-entry view, genuine dragged BookmarkNode and its actual associated TabHandle. No URL-based tab association or replacement model is introduced.

If the exact represented live tab is unpinned, pin it first. Commit the source URL/title through the actual saved-entry insertion. If conversion fails, re-find the same live handle (indices can change) and restore its unpinned state. After successful insertion only, resolve the real profile BookmarkModel and remove the actual dragged node with original edit source0/kUser when loaded and parented. Missing/unloaded model skips removal while preserving the successfully saved pin. The region separately owns cleanup, preview and layout.

155 adaptation: actual preference/model callbacks may reenter or switch profiles. Snapshot URL/title/node identity, check real browser/profile/model and leaf lifetime after notifications, and reacquire the same node ID+UUID before removal. This prevents stale pointers from crossing a profile rebind. It does not fabricate success or perform owner/profile operations during development. Runtime calls require the genuine region action; this helper is not mounted yet.

Original source evidence is the pinned region range462d5e0..462d8a4 in native-cross-section-drag-preview/evidence/region-callbacks.asm and original-framework SHA64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c. Existing native-pinned-tab-entry-drop pins the actual writer/insertion semantics. GN also registers the exact typed drag contract header.
