# Native direct carrier custody proposal

This implements one missing browser-owned writer boundary. It does **not** provide whole-profile admission or authorize state2 startup, migration, protected imports or module initialization. No accepted app/UI/native checkout is modified.

The current native `installation_auth.cc` launches an installation carrier independently of `DaemonSupervisor`. Its timeout previously handed the owned process to `EnsureProcessTerminated`, which gives the browser coordinator no observable completion. The direct daemon's verified exit therefore cannot prove this carrier stopped.

`source/installation_carrier_custody.h` is the actual proposed production component, also compiled by the fixture. Its mutex serializes admission close against the actual launch callback. A call admitted before closure cannot start a child afterward. Closure is terminal for this browser process. Call custody persists throughout the synchronous operation and is explicitly captured by timeout cleanup. Only actual successful process wait marks exit. Lost cleanup, rejected posting or failed wait leaves an unresolved-child blocker forever; destruction never silently manufactures completion. There is no reopen or success receipt setter.

`prepare.py` hash-checks the three current native inputs and exact-counts every anchor before producing four source copies in a NEW directory. It adds the component header, actual RunCarrier lifetime/launch/reaper integration and native closure consumers in BrowserPlatform's direct-daemon quiesce and Shutdown. It never edits the native checkout. `CloseInstallationCarrierAdmission()` and `InspectInstallationCarrierCustody()` return direct-carrier snapshots separately from the existing direct-daemon result. **The existing direct-daemon callback remains direct-daemon-only**, even if carrier cleanup is pending. A future coordinator must consume both actual results rather than treat that callback as all-writer readiness.

Root integration: copy reviewed generated sources into Chromium, register the new header in root-owned GN source lists, compile the changed native translation units through `scripts/native-build.py`. The production Chromium translation units have NOT been compiled by this lane. The standard-library production component compiles with C++20 strict warnings; five focused fixtures cover prelaunch closure, unresolved destruction, retained late callback, an actual owned disposable child/reaper, and failed launch/no retry. No carrier/Keychain/owner profile/AppKit action executes.

## Remaining prerequisites for actual whole-profile admission

- `RenderProcessHostCreationObserver` is too late to prevent launch. It can fire on requested/already-launched processes; the same host can relaunch after crashes. A real prelaunch rejection path plus actual exit callbacks is required. Observer enumeration or one-time shutdown is not authority. `RenderProcessHostImpl::Init()` has a live relaunch path; `RenderProcessHostImpl` constructor's BrowserContext shutdown CHECK alone does not gate every existing host reinit.
- Browser-side preferences, extension workers, storage partitions, IndexedDB/LevelDB tasks and session restore must reach their actual terminal callbacks while new work remains closed. `BrowserContext::ShutdownStoragePartitions()` is not an all-storage completion receipt. Pref flush alone cannot substitute.
- Independent CLI, agent/runtime provisioners, shell/MCP and detached descendants are outside browser-owned child custody. They need actual cooperative admission under surviving native/OS custody or remain blockers; PID census/process group heuristics cannot establish this.
- New owned NAPI/OS custody covers only its real attached instances. PDF can execute in independent Node processes and cannot be assumed drained because the native browser or carrier exited. The current signed owner factory requires real caller-held writer admission; process-local worker registration supplies none.
- Admission must survive the entire journal prepare/commit/recovery/exact-target-verification interval and crash recovery. Existing cold state2 refusal prevents new unaccepted entry but neither shuts accepted writers nor transfers custody across crashes. A surviving trusted coordinator is still missing. No Boolean, environment variable, user-written receipt or standalone `require()` may bridge this gap.

Source evidence: current `browser_platform.cc` native direct-daemon gate, `daemon_supervisor.cc` pending-launch collector; `installation_auth.cc` independent launch; `content/public/browser/render_process_host_creation_observer.h`, `render_process_host_observer.h`, `content/browser/renderer_host/render_process_host_impl.cc`, `content/public/browser/browser_context.h`; existing `aux-cold-entry-admission`, `aux-owned-writer-admission`, and native direct-daemon proposals. Original API/public-wire/crypto/UI behavior remains unchanged; only shutdown admission and timeout ownership differ.

## Reviewed successor composition and actual Chromium fixture

The next preparation adds a reusable native test target without rebuilding or executing it. Run:

```
python3 docs/integration/proposed/aux-native-carrier-custody/prepare-composition.py \
  --artifact-root /Users/rcourson/Documents/Vibe/web \
  --output /absolute/fresh/review-output
```

It pins the applied `out/native-reuse-composition-aux-lifecycle-callbacks` manifest, its successful `out/aux-lifecycle-native-build.json` receipt, the existing extender implementation, current GN bytes and actual framework hash. The existing extender verifies all769 parent source records and23 canonical artwork records, applies/replays the incremental patch only on temporary copies, and produces a771-source successor. Six changed paths are the four carrier source copies, `chrome/browser/aux/BUILD.gn` and the new native fixture. `review-before` and `review-after` contain exact bytes plus a per-path backup map; newly added paths have null before hashes. The checkout remains untouched. No UI source/artwork/CSS/geometry is changed.

The prepared output is `out/native-reuse-composition-aux-carrier-custody-review`; `composition-review.json` records its manifest hash and exact backup map. Root can review/apply the generated combined patch using the existing native application path, then build changed native TUs and `//chrome/browser/aux:installation_carrier_lifecycle_tests` through the shared native build serializer. Neither source compilation nor fixture execution has occurred for this successor.

`internal::WaitForInstallationCarrierExit` now contains the actual production cleanup body and is used by RunCarrier's retained timeout callback. The Chromium fixture uses the production admission object, `base::LaunchProcess` for a disposable `/bin/sh -c 'exit 23'` child, queued ThreadPool cleanup and this exact production reaper. It asserts pending custody until the wait callback runs, then observed drain; a second test refuses a call whose admission closed before launch. This verifies the common native launch/reaper boundary when run; it deliberately does not execute the real carrier/auth/Keychain body or claim whole-profile readiness. A synchronous unbounded wait executes on a MayBlock cleanup task, never UI. Cancellation is still not completion, and shutdown does not falsely report that pending cleanup drained.

The earlier `evidence.json` is historical for commit c96470f6a and its five standard-library fixtures. The pure component did not change in this follow-up; those fixtures were not repeated. The updated prepare/reaper and new Chromium fixture remain compile/run pending with root.
