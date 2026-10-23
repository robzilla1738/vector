# Renderer/navigation admission participant

Inactive source proposal on exact current native inputs, with five file hashes and eleven count-one edits in `inputs.json`. It adds no UI/view change, GN edit, native checkout apply, state-2 bypass, process termination or runtime activation. The default open behavior retains the original routing. The native close is permanent and process-local; no JS/environment/scope selector can reopen it.

The exported API is `content::aux_migration::CloseRendererNavigationAdmissionForMigration()` plus `InspectRendererNavigationAdmissionForMigration()`, declared in `content/public/browser/aux_renderer_navigation_admission.h`. Its snapshot reports raw component observations, never a global drained/success result:

- Native generation/closed state and active renderer Init scopes.
- Pending launch records, unresolved launch events and callbacks delivered after close.
- Active navigation dispatch scopes and live admitted request records.
- Explicit unresolved navigation cleanup and unsupported cancellation observations.

`RenderProcessHostImpl::Init()` acquires native admission before its early live-process-reuse return. An admitted Init remains counted until it returns, including a reentrant migration close. A new asynchronous launch record is retained before mutable initialization and embedder callbacks. The actual `OnProcessLaunched`/`OnProcessLaunchFailed` callback body retains that record until return; a callback after closure is observed without suppressing original cleanup/notifications. Host destruction without that actual callback becomes unresolved. In-process renderer startup calls a synthetic launch callback before its thread starts, so it explicitly remains unresolved.

`NavigationRequest::BeginNavigation()` and resumed `BeginNavigationImpl()` acquire native generation admission. A refused FrameTreeNode-owned request is aborted through the real `ResetNavigationRequest(kInternalCancellation)` cleanup, followed by an immediate return because that call deletes the request. An unexpectedly different owner is not deleted through the wrong owner: original routing/cleanup is retained and the unsupported route is counted. `OnStartChecksComplete()` reacquires admission at the actual URL-loader-dispatch boundary; closure selects the original `CANCEL_AND_IGNORE` weak-posted failure path rather than replacing its completion behavior.

The request record survives admitted dispatch returns. Destruction removes its live record but increments unresolved cleanup, because destructor entry is not all member/backend teardown or storage durability. Zero live/active counters are therefore not proof of renderer exit or all-writer custody. Reentrant/late callbacks cannot reopen admission.

## Limits and integration

An Init already admitted before closure may finish initialization and asynchronously launch later; it remains a pending/late observation, not a stopped process. This proposal does not cancel ChildProcessLauncher, kill a renderer, stop renderer JavaScript, close storage or claim an OS launch queue was drained. It does not fence infallible `SiteInstanceImpl::GetOrCreateProcess()` callers which reuse without Init, synchronous renderer commits (`CreateForSynchronousRendererCommit` calls StartNavigation directly), already-started navigation continuation/commit, direct renderer IPC, other child services, network/storage writers or other process copies. Those remain real custody boundaries.

Root can register the internal `.cc/.h` in `content/browser/BUILD.gn`'s `browser` sources and the exported header in `content/public/browser/BUILD.gn`'s `browser_sources`. This introduces no content-to-Chrome dependency. The migration-only browser aggregate can consume the public snapshot under its actual UI-thread/lifecycle owner; no ordinary shutdown hook is added. Root owns that shared GN/aggregate/composition work.

`verify.py` checks the exact original and complete successor bytes, safe immediate-return cancellation and ordering before reuse/reentrant callbacks. `compile-check.py`, invoked through `scripts/native-build.py`, uses existing content GN flags and a read-only VFS header overlay to compile only the three changed TUs, then links/runs one captured fixture against the actual new implementation. Until separate compile evidence is recorded, these are prepared checks, not a claimed build or browser runtime result. No browser, renderer, owner data, Security, Keychain, signed factory or OS action is executed by that fixture.

## Corrected actual compile evidence

Session9874 failed the first NavigationRequest TU on Chromium's raw-pointer field rule; later TUs/fixture did not run. That evidence remains in `evidence/first-compile-failure.json`. The narrow address-identity correction uses `uintptr_t` for the never-dereferenced retained key and initializes fixture address sentinels. Corrected session73603 completed exit0: all three real changed TUs compiled under current Chromium flags, and the actual production state source linked into the captured fixture and exited0. `evidence/corrected-compile.json` pins current inputs, source/objects/GN/logs and fixture. One benign missing-libLTO linker warning did not prevent linking. This is not checkout application, a browser link, live renderer/profile behavior or whole-profile custody.
