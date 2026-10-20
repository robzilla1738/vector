# Pause actual saved-pin model observers across real moves

Ordered after L4 service18588efb6. One exact core file pinned to actual188 (including preview-data65cb), independent of later owner/source-view proposals.

The existing-only factory resolves actual source/cache/target Profile services after caches exist and cold revalidation succeeds. A shared source/cache profile service is paused once, not once per window. Its actual weak pointer and matching uint64 pause token are retained in the synchronous transaction Scope. The real Complete ScopedClosureRunner already exists before the first pause, so all subsequent success/rejection/rollback exits resume matching tokens. No service is created for an otherwise absent profile.

Pause happens before actual custom Begin observers and any detached/inserted ownership effects. Resume is after genuine custom Finish/Abort plus session/vertical End phases, while actual collection/profile ownership has settled. Destroyed services are skipped via their actual WeakPtr; stale/nested tokens remain governed by L4 service's matching-token behavior. No raw service callback survives owner destruction. This does not expand the separately documented unsupported forced-CloseNow scope.

This is the necessary155 lifecycle adaptation for supplied persistent saved entries: real model moves must not be interpreted as user pin/unpin events against the old profile. It preserves the original `pinned_tabs` data/identity and real source/target service graph. It introduces no UI substitute or fake successful transfer.

Root GN: core already uses the ui/tabs source set; expose actual pinned_tab_service.h and factory header target if not public. No new sources beyond the L4 factory/service proposal. The required exact staged header hashes are recorded in manifest. One-file isolated exact-input replay passed; no shared writes, builds, owner data or runtime acceptance.
