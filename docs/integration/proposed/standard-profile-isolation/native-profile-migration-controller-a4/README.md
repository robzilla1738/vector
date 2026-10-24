# Native profile migration controller — A4 physical DOM seam

This first coherent slice makes the existing actual DOM backend drain reachable from its native browser owner. It changes no UI or normal storage operation. It is not a completed profile importer, writer closure or activation path.

The actual Local and Session Storage implementations already schedule their loaded areas' pending commits and call `AsyncDomStorageDatabase::DrainCommitsForAuxMigration`. That queues behind earlier database work, retains prior failures and invokes the real backend file-data sync. Their privileged Mojo controls had no acknowledged route to those methods. `Flush()` is deliberately unchanged and is not used as an acknowledgment.

## Implemented

- `DrainAuxUiMigration` is appended to each existing privileged Local/Session Storage control interface, preserving earlier method ordinals. These interfaces are browser-to-service only and must not be brokered to renderers.
- Each actual service implementation forwards to its existing loaded-area drain. Unopened, failed, in-memory or incomplete backends continue to refuse without opening, repairing or recreating storage. Lost backend/service callbacks already produce failure.
- `DOMStorageContext::DrainLoadedAreasForAuxUiMigration` defaults to refusal for unsupported implementations. The real wrapper uses only its currently bound native Local and Session controls and joins both real acknowledgments.
- The wrapper retains its own lifetime through the join. A private control-generation counter changes before Local/Session rebind and shutdown, so a reply from the original service cannot become success for a replacement service. Missing/dropped replies default to failure. This counter is an internal lifetime discriminator, not a readiness/admission flag.

The result is narrowly **queued backend file-data acknowledgment for currently loaded areas**. It does not stop future writers, establish complete page/backend inventory, sync parent directories, prepare a target mutation, certify cross-store recovery or admit native startup.

## Inputs and checks

`source-plan.json` contains nine native-relative file paths, exact current input/output SHA-256 values, and twenty sequential count-checked anchors. `native.patch` is the matching complete unified patch; generated sources live under `source/`. The current shared native tree remains unchanged and frozen during root's build.

One exact disposable replay passed all anchors/hashes, patch application, reverse applicability and changed-line whitespace, then verified all original input hashes remained identical. `actual-source-check-a4.json` records only those actual source checks. No native compile, generated Mojo build, backend invocation, app/helper lifecycle, owner-state access, signing or provider operation ran in this lane.

Root must regenerate/compile the paired Mojo interfaces and actual Local/Session implementation objects, plus the DOM wrapper/public interface owner. No new GN source file is required for this seam: the default unsupported method is defined with the existing real wrapper implementation.

## Coordinated native controller contract

Root owns the actual sender-aware API seam: the existing canonical Agent `auxBrowserPreferences.commitCommand` route will recognize only the explicit `prepare-ui-state-upgrade` kind. It supplies actual native `ExtensionFunction::profile()` and `render_frame_host()`, with no caller-selected profile/root/epoch. Root will bind it only after the genuine controller consumes actual producer and transport operations.

The intended public native entry is:

```cpp
void PrepareUiStorageMigration(
    Profile* profile, content::RenderFrameHost* sender,
    base::OnceCallback<void(base::DictValue)> reply);
```

The controller will derive the canonical enabled Agent instance, regular actual Profile, persisted identity, native binding/restore epochs and genuine browser admission. It must inventory actual native frames/documents/partitions/namespaces and worker owners; recheck real `WeakDocumentPtr` and document IDs at every asynchronous reply; and retain originals through refusal/recovery. No renderer field can confer any of that authority.

Navigation owns the supplied codec's finite functions: `auxPrepareDraftMigrationCapture`, `auxValidateDraftMigrationCapture` and `auxReleaseDraftMigrationCapture`. Their bounded UUID/revision/count/capture envelopes are data. Actual source owners freeze/flush their own current state and refuse unknown, composition/upload/send/claim work. They do not close backend, worker or unrelated-page writers. Native code must invoke only the reviewed own-extension producer, hold every required document, validate before/after physical drains and preserve exact original capture bytes. RFH's tests-only JavaScript APIs are prohibited; ordinary RFH JavaScript is restricted to WebUI and cannot be assumed usable in extension pages.

## Work that remains implementation

The native profile/view/epoch controller and its real operation7 capture consumer are next. The current native capture journal remains `captured-unqualified`; a transfer receipt is not capture completeness or target authority.

Actual DOM CAS/capture/readback still requires native-held per-area ownership, ordinary Put/Delete/DeleteAll queueing before Session Storage copy-on-write/fork, cache/area/topology lifetime checks, exact allowed UI raw-record capture, atomic target map batches and actual readback. Browser `Flush`, cached maps, testing accessors or a renderer `closed` field cannot substitute. Extension storage must retain its actual opaque backend capture through the native transaction. Cross-store target intent/recovery and activation remain absent, and must explicitly refuse until implemented.

COLD admission remains inactive in the observed build. This seam neither enables it nor weakens its guards. Actual disposable migration/recovery/runtime/UI acceptance and signing/release remain separate.
