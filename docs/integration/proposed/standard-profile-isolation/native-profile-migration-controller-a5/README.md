# Actual native profile/document capture consumer — A5

This slice adds the real native `ui_storage_migration_controller.{h,cc}` and consumes the finite renderer, extension backend, acknowledged DOM and operation7 interfaces. It preserves the accepted UI and introduces no automatic startup call. It is **preliminary capture and physical capture-journal recovery**, not completed migration or activation.

## Native public seam

```cpp
void PrepareUiStorageMigration(
    Profile*, content::RenderFrameHost*,
    base::OnceCallback<void(base::DictValue)>);
bool IsUiStorageMigrationPending(Profile*);
base::CallbackListSubscription ObserveUiStorageMigrationSettled(
    Profile*, base::RepeatingClosure);
```

Root owns the actual canonical Agent `auxBrowserPreferences.commitCommand` entry with kind `prepare-ui-state-upgrade`. That entry supplies its real native Profile and RenderFrameHost; it accepts no renderer profile, path, root, epoch or readiness arguments. Root must register/compile this implementation with the full UI owner, which already owns the real UI admission and browser/extension types, rather than introducing a dependency from the lower-level profile identity target back into UI.

The controller owns one in-memory operation per actual regular Profile. Observation attaches only that native in-memory owner; it does not generate identity, mutate prefs or grant admission. New operations refuse other existing native feature writers before becoming pending. Current/resume checks do **not** call the global feature-pending predicate after their own operation is pending. The pending query and real completion subscription let root's existing account/profile gates wait and wake correctly; no callback implies persistence or migration success.

## Implemented actual flow

1. Derive the genuine loaded canonical Agent instance and regular Profile from the real native sender. Reject a foreign origin, off-record context, empty actual persisted ID, cookie restore, missing native admission or changed binding/restore epoch. `GetProfileId` remains read-only.
2. Cross-check the canonical Agent's actual ProcessManager frame registry against actual RenderProcessHosts' committed Agent documents. Hold native WeakDocumentPtr, frame/document IDs, WebContents lifetime, actual StoragePartition configuration and actual session namespace for every supported document. No renderer-supplied inventory is accepted.
3. Invoke only the finite reviewed own-extension codec exports through the real ScriptExecutor, `SPECIFIED_FRAMES`, main world, awaited Promise and exact native document-result checks. No tests-only JavaScript, new permissions, generic script input or arbitrary module path is accepted. The codec's capture lease is data, not native authority.
4. Prepare every actual required document with a distinct native-generated UUID correlation marker. Preserve the exact JSON-stringified response bytes; only bounded actual Aux draft/settings/pending families are admitted to the capture. Lost preparation results use the read-only retained-lease exporter and must match the original request UUID. Preparation/flush is not repeated on ambiguity.
5. Capture the genuine opaque six-record extension backend token through StorageFrontend, then consume the actual new DOMStorageContext acknowledged Local+Session loaded-area drains for each actual partition. Future writer closure is not inferred from these replies.
6. Validate all actual retained producer leases before and after physical drain, between transport steps and after journal readback. The currently preliminary producer cohort is not treated as a final shared-store snapshot.
7. Construct the explicit `aux.ui-storage.capture-input.v1` data from the native profile/document/namespace facts and actual captures. The payload explicitly records `qualified:false`, `backendWriterClosure:false`, `targetImportAvailable:false` and `activationAuthorized:false`.
8. Use actual operation7 Begin/Append/Persist, then Load and bounded Read to verify native source/current generations, SHA-256, exact receipt and every original payload byte. One bounded IPC frame executes per actual UI-owner task; tasks yield between frames. No arbitrary worker receives native authority and no multi-megabyte IPC loop monopolizes the UI sequence.
9. Retain the exact unfinished next frame, upload UUID, offset and native operation state. Re-entry observes the same retained authority nonce/frame; it never starts a replacement upload after an unknown physical result. Original source leases remain retained across unfinished/unknown native work. Matching actual source/lease revalidation is required before continuation.
10. Release only exact known producer leases after complete/refused preparation. Ambiguous release stays pending; repeated native requests observe the same retained lease and release only an exact matching request/lease in the same document. Actual old-document destruction establishes loss of its in-memory lease only, never backend or native I/O completion.

Successful backup/readback still returns an unqualified result with `success:false` for upgrade readiness. No target store is mutated and no new-key UI activation is authorized.

## Deliberate remaining implementation

The real Agent is MV3. This slice conservatively refuses live service workers and non-active/BFCache/prerender documents because their relevant writers are not yet covered. Consequently it cannot claim normal-app capture acceptance until genuine canonical worker/backend closure exists. It does not stop workers, evict pages, reload legacy UI, fabricate empty captures or weaken admission to make a button appear functional.

Navigation's coordinated producer contract now includes read-only `auxSealDraftMigrationCapture(leaseId,revision)`. Preparing all frames may legitimately change shared stores; prepare/read therefore remain preliminary `sealed:false`. The native owner may call Seal only **after** genuine DOM and extension backend writer gates are held, then retain final shared-store bytes and validate them strictly. This slice deliberately does not call Seal without those real gates. It also does not equate a renderer `closed` field with backend closure.

Physical DOM/extension ordinary-writer closure, source/target CAS, actual target batches, cross-store durable intent/readback/recovery and activation remain implementation work. Interrupted process restart must discover/requalify retained journals; the existing journal is explicitly `captured-unqualified`, so equality of a digest, pointer, generation or receipt cannot grant migration authority. Live legacy state-v1 bootstrap, missing/ambiguous persisted profile identity, renderer process-crash cleanup and unsupported document coverage remain separate unresolved cases.

COLD admission is still inactive in the observed build. All native admission checks remain intact. No product/helper, provider, owner state, signing, release or OS permission operation was executed.

## Pins and lean checks

`source-plan.json` pins both new native outputs, 43 actual native dependency inputs and ten exact consumed-API anchors. It records the current root-projected DOM acknowledged interface as an actual prerequisite. `native.patch` creates the two new native files; it does not replace existing native bytes or root registration/API files.

One exact disposable new-file replay verified every actual dependency/API pin, final source hashes, reverse applicability and changed-line whitespace. `actual-source-check-a5.json` records static source evidence only. Rechecks followed actual source corrections; no broad suite or native build ran. Root still needs to register/compile the actual consumer, pair the reviewed finite producer source and bind the genuine native private API and pending/settled flow before any disposable app observation. This is not runtime, UI fidelity, migration-completeness or readiness acceptance.
