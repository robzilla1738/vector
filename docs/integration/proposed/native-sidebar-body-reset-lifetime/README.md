# Genuine sidebar body: retire before collection reset

This fixes a concrete current155 lifetime ordering flaw in the newly mounted supplied sidebar. It is a narrow platform ownership adaptation, not a source UI/policy change.

BrowserView performs a live region ResetTabStrip. The base implementation calls RootTabCollectionNode::Reset, which Deinitialize()s collection children before calling the remove-root-view callback. That child teardown destroys the actual unpinned container and its AgentSessionTabsView. Only afterward did Base ClearTabStripView call the region's OnTabStripViewWillClear→body.Unmount. The body still held rawagent_ and tried to retire/remove that already destroyed child. Existing projection ViewTrackers do not make that separate raw body pointer safe.

The derived region now overrides the existing virtual ResetTabStrip: first unmount the genuine body while its actual children/controllers are alive, then call the unchanged base reset. Body retirement already cancels actors, removes the Agent child, restores the actual pinned/root views to their native parent and clears its owned contents. The later clear hook's Unmount is idempotent. Normal derived-region destructor early unmount remains unchanged.

No upstream RootTabCollectionNode notification timing or generic observer framework changes are made. No GN changes. The immutable two-file patch is pinned against actualv382 source; independent replay passes. This is a source-demonstrated reachable hazard, not a claim that a runtime crash was observed. Native builds, shared writes, target launch and profile/auth/Keychain operations were not performed here. Root owns focused compile and disposable UI observation.
