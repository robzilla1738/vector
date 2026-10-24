# Canonical Agent extension backend writer gate — A6

This slice implements actual native closure around StorageFrontend's canonical Agent LOCAL backend route. It preserves the UI and ordinary storage behavior whenever no native lease is held. The new API is native-only; no extension schema, renderer identity argument, filesystem path, caller readiness flag or automatic activation is introduced.

## Actual owner and operations

`BeginAuxUiMigrationLease` requires the genuine enabled canonical Agent instance and the actual regular frontend route. It closes the frontend route on its UI sequence **before** posting the raw capture sentinel to the existing real backend sequence. Previously submitted ordinary operations therefore run first. The existing LevelDB capture reads only its six supported raw records, refuses unopened/unsupported/corrupt/conflicting storage without repair, and constructs the opaque backend token.

The private-constructible lease retains its actual frontend weak lifetime, actual Extension instance, opaque capture, exact source bytes and computed target bytes. Target bytes follow the existing backend token's three adjacent old/new pairs; no JSON value is rewritten, including explicit false or prompt whitespace.

While held, ordinary canonical LOCAL `RunWithStorage` operations and native `DeleteStorageSoon` retain their **original callbacks and ordering** in the actual frontend. They do not execute against the captured store. Attempted new work taints qualification. Reads are also held because ordinary reads can invoke existing corruption recovery; the private native capture/readback route remains non-repairing. Other extensions and storage namespaces retain their ordinary paths.

`ValidateAuxUiMigrationLease` reports only actual held frontend/extension/queue facts. It is not profile authority or whole-browser writer closure. Source worker/page producers must pause before closing this gate, and native Profile/document/epoch admission still belongs to the controller.

`CommitAuxUiMigrationLease` consumes the original opaque capture exactly once, marks target attempt before submission, and retains the gate throughout the existing real backend CAS and single synchronous WriteBatch. The backend compares all six original raw values again; stale/foreign capture refuses. Failure or a lost route remains unknown and cannot authorize a new blind attempt.

`ReadbackAuxUiMigrationLease` queues through the same actual backend owner and reports exact six-record bytes, whether they match the retained source or computed target, the actual last commit file-data result and whether ordinary work was queued. These are scoped backend observations, not a renderer or native `ready` input. A lost/error readback clears any matching-target observation.

`ReleaseAuxUiMigrationLease` takes the actual opaque lease, not a success Boolean. Before target attempt it can abort the hold and replay ordinary work. After target attempt it refuses unless the same route has an actual successful file-data result, exact matching target readback and no queued/tainted old work. Refusal retains the gate and callbacks. Destroying or dropping the lease does **not** reopen the frontend or manufacture a successful abort/commit; the actual frontend retains the unresolved state until explicit recovery or real context teardown.

## Integration and scope

Root owns registration/build/API integration. The native controller must consume this lease instead of its earlier raw extension token, prepare all real page and MV3 worker producers first, close the actual DOM gates, then call the coordinated read-only producer Seal before final snapshots/qualification. Root/navigation's finite worker EventRouter request/reply must bind the genuine worker identity/version/process/partition and preserve physical tickets; worker payloads remain data.

This gate does not close DOM Storage, session copy-on-write, namespace cloning, other browser services or unknown writer paths. It does not sync LevelDB directory topology, journal cross-store intent, roll back an attempted target, or activate UI resources. Failed/tainted target recovery deliberately stays closed: a complete native controller still needs actual original-source/target readback and versioned recovery before it can release old queued work. No source queues, credentials, keys or profiles were reset/deleted.

## Exact inputs and verification

`source-plan.json` records the two actual current native before/after files and eleven sequential counted anchors. It also pins the real backend runner, synchronous LocalValueStoreCache callback implementation and actual LevelDB CAS/pair-order/sync anchors. The generated overlay changes no other native file; root's frozen native source remains identical.

One exact disposable patch replay passed all hashes/anchors, application, reverse applicability and changed-line whitespace. `actual-source-check-a6.json` is static source evidence, not execution of storage or a native fixture. Root must compile the actual StorageFrontend owner and then the composed controller consumer. No native build, product/helper lifecycle, owner-state operation, provider call, signing or OS grant occurred in this lane. Full writer/capture/migration/runtime readiness is not claimed.
