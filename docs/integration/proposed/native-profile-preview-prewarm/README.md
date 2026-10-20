# Supplied asynchronous preview prewarm

Apply after owner3213a5883. This ports the actual request at4654f30..4655058 and weak callback468074c. Its callee7ac69b4 is ProfileManager::LoadProfileByPath, not an image service: exact missing-profile diagnostic and CreateProfileAsync call match current155 `ProfileManager::LoadProfileByPath(path,false,callback)`.

A real per-owner set deduplicates pending paths. The actual native loader is called once for an unloaded target, with the genuine owner WeakPtr, genuine ProfileManager WeakPtr and copied target path. The current155 manager's existing WeakPtrFactory is exposed through one narrow public getter; no raw manager authority, synthetic backend or replacement loader is introduced. Missing/unavailable profile requests keep actual failure semantics.

Callback removes pending path, verifies actual manager/owner and loaded original-profile path, respects the recovered other-normal-window exclusion before GetOrCreate(false), refreshes only an already existing per-path page, and reapplies real current progress only while that page remains the active noncommitting target. It does not recreate deleted pages, select another target, activate a browser, or report a successful switch. A real profile load already dispatched is not canceled merely because a gesture ended; weak destruction makes its UI callback inert, matching the source lifetime.

Inactive cached pages get genuine updated metadata without becoming active. Active fallback can transition to its actual live target workspace after readiness. Existing real commit semantics remain unchanged: non-live immediate actual dispatch, live generation/frame handoff, core result before completion. No target or owner state was accessed during static work.

The original captured-image cache producer is still not connected, and no screenshot substitute is added. Source input/animation and original header/search owners remain separate work. This is a working prewarm/page lifecycle port, not full end-to-end preview acceptance.

Three existing outputs are source-hashed and independently replayed in a disposable directory. Existing owner files baseline321; ProfileManager header baseline actual189. No shared source writes or builds. Root owns actual compile and GN; the public getter adds no new target or dependency.
