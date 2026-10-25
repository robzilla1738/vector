# Closed extension preference recovery handoff

This proposal transfers the actual retained extension LOCAL preference writer gate from a restored recovery capture to a freshly captured normal source. It does not release the gate, run queued ordinary work, reinterpret the old fresh target as original source, change the UI, or grant Profile/journal authority.

`BeginMigrationFromRestoredRecovery(oldLease, newNativeRequest, callback)` requires the same live frontend/extension route, a qualified immutable recovery descriptor, an actual restore attempt, synced exact original-source readback, and no pending/queued/tainted work. The controller must independently retain its actual Profile/document/worker/editor custody and verify the JS adoption before calling. The request is correlation data only.

The existing backend queue sentinel captures the real six records while the original gate remains installed. A queued operation or changed owner/source refuses the transition and leaves that original gate held. The new normal state is created only from the actual fresh capture matching the restored original, with fresh target derivation and no target attempt. The frontend stores both the immutable original state and successor custody before returning. Old opaque lease operations then fail the real gate identity check.

`ObserveAuxUiMigrationLease(oldRequest)` reports pending transfer correlation or the retained successful receipt with the exact successor request and same successor lease while held. It never reruns capture. A failed or unknown recapture keeps the original state and attempted handoff correlation; there is no automatic retry, flush or release. A receipt after successor retirement is historical handoff evidence only, not current readiness.

This is one side of a multi-store transition. Local/Session, native/renderer caches and JS owner gates need their matching closed handoff, and the controller must join all stores before any ordinary release. This proposal does not claim those joins or app acceptance. Root owns integration and the focused actual compilation. No native product/helper was run, compiled, signed or changed here.

`source-plan.json` contains exact input hashes and seven count-one anchors. `native.patch` is the review diff; `before/` preserves actual input bytes. `static-check.json` records one fresh-directory static replay only.
