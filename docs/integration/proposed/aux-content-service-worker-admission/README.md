# Content service-worker migration participant

Source-only proposal: ten exact source pins and twenty-four count-one edits in `inputs.json`. It closes actual content service-worker start/reuse/queued-dispatch routes and observes real stop callbacks for **already-owned** native contexts. It adds no context, StoragePartition, registration, selected policy, UI/view change, GN edit, native apply, owner-state operation or startup bypass. Default open behavior retains original routing; closure is process-wide, native, monotonic generation1→2, and has no reset or JS/environment grant.

## Actual consumers

`ServiceWorkerVersion::StartWorker` tracks the original callback and refuses closed admission through its existing asynchronous `kErrorAbort` completion. `RunAfterStartWorker` is gated too: its running-worker fast path otherwise bypasses StartWorker and immediately publishes success. The callback wrapper retains pending and active-callback observations through original callback execution; a real kOk arriving after closure becomes kErrorAbort before reaching the caller. A dropped callback becomes unresolved rather than success. Nested callback chains retain their actual separate observations.

The asynchronous registration lookup completion and `StartWorkerInternal` recheck closure before subsequent work. Warmed-worker global-scope resume has a paired caller check; stopped-worker restart cannot reopen closure. EmbeddedWorkerInstance rechecks after real starting notifications and immediately before the renderer StartWorker message. Its private SendStartWorker declaration/definition/caller are changed together to report refusal; the caller uses **original OnSetupFailed** process/IPC cleanup and returns immediately because callbacks may destroy the instance. No synthetic success or unchecked null is introduced.

## Already-owned stop and lifetime

Actual ServiceWorkerContextWrapper constructor/destructor hooks maintain the native existing-wrapper registry on the UI thread. `StopAlreadyOwnedServiceWorkerContextsForMigration()` first closes start admission, retains references only to those existing wrappers, then invokes their migration stop path outside every registry lock. No BrowserContext/partition/context getter or factory is used. The new internal wrapper stop method first retains all actual live ServiceWorkerVersion refs from its **existing core** before any StopWorker callback can reenter teardown. It then uses the original per-version StopWorker and BarrierClosure semantics. Ordinary StopAllServiceWorkers remains unchanged.

The real callback's native observation retains the exact context until callback execution or drop. Missing callbacks stay pending while actually retained; dropping the callback becomes unresolved. A missing core is explicitly unavailable, and actual Shutdown/destruction invalidates pending context evidence. OnStoppedInternal's cleanup body has a separate scoped active observation because original stop callbacks run **before** later original request/remote cleanup. Late/reentrant outcomes cannot reopen admission.

A crucial limitation is retained: ServiceWorkerVersion's timeout path can Detach and invoke OnStoppedInternal without an actual renderer worker-stop acknowledgement. Both that direct timeout detach and normal OnDetached are recorded separately. OnStopped is counted as a notification, never renderer/process/storage exit. A stop API callback, zero pending callbacks or an empty live-version list is **not** whole-context durability or whole-profile writer custody.

## Native API and remaining routes

The exported `content/public/browser/aux_service_worker_migration.h` provides:

```cpp
content::aux_migration::CloseServiceWorkerStartAdmissionForMigration();
content::aux_migration::StopAlreadyOwnedServiceWorkerContextsForMigration();
auto raw = content::aux_migration::InspectServiceWorkerMigrationAdmission();
```

Close/stop require the actual UI thread. The snapshot reports native generation, pending/active/lost/late start callbacks, owned wrappers, pending/observed/unresolved stop callbacks, active stop-cleanup bodies, missing cores, detach observations and stopped notifications. It has no all-stopped or ready Boolean. Root owns registration of the two new `.cc` files/internal headers in `content/browser/BUILD.gn`, the new public header in `content/public/browser/BUILD.gn`, and consumption by the genuine migration aggregate. No ordinary-shutdown hook is added.

Already-running worker code, direct events/IPC and infallible request-ID APIs such as StartRequestWithCustomTimeout remain outside start admission; no invalid request ID is injected into those contracts. Registration update jobs, ScheduleUpdate side effects on existing failure paths, service-worker storage/network restrictions, other storage services, independently running processes and escaped descendants remain separate writer/custody boundaries. No renderer, thread or storage backend is declared stopped by this participant.

`verify.py` checks exact original/successor bytes, paired dispatch and non-creating ownership paths. `tests/admission_state.cc` is a prepared captured fixture against the actual state implementation. `compile-check.py` is a prepared five-changed-TU compile plus that one fixture, using actual current content GN flags and a read-only VFS overlay. **Neither compilation nor fixture execution is claimed until a distinct receipt is recorded.** No second compiler request was queued while the prior renderer request9874 waits behind root's native build.
