# Native owned-direct-daemon quiesce proposal

This four-file proposal adds a typed, terminal migration quiesce operation to `DaemonSupervisor` and `BrowserPlatform`. It is source-pinned to the actual shared Chromium checkout at preparation time. The checkout, native registration/GN files, root staging, accepted app and UI remain untouched. `manifest.json` records baseline/output hashes; `quiesce.patch` applies exactly to the four saved baselines.

## Contract and integration

The UI-sequence entry point is `BrowserPlatform::QuiesceDirectDaemonForMigration(DirectDaemonQuiesceCallback)`, forwarded to the existing supervisor. The callback receives `DirectDaemonQuiesceResult`:

- Scope is always `kOwnedDirectDaemonOnly`.
- Outcome is `kNoOwnedProcess`, `kExited`, or `kDrainFailed`.
- `exit_code` is present only when an actual wait supplied an exit code.

A successful result does **not** authorize state mutation by itself. It says nothing about descendant runtimes, other daemon installations, extensions, CLI processes, workers, SQLite handles/WAL writers, or other browser windows' writers. The larger migration coordinator must establish those fences independently. No PID/name-based takeover or port-based process discovery is added. This API cannot resume; browser restart is required after closing admission. A failed drain must block migration.

## Lifecycle changes

`DaemonSupervisor` closes its admission boolean synchronously before any callback or asynchronous drain. A shared launch-admission object has a lock, open bit and monotonically changing generation. `Start()` refuses admission when closed or already pending. The blocking launch task performs its filesystem preflight first, then holds that shared lock across its final generation/open check and actual `LaunchProcess`. Quiesce takes the same lock to close and invalidate generation. Thus a queued task cannot pass spawn admission after closure; an already admitted spawn completes before closure linearizes.

A launch reply remains live after quiesce: it must collect any process handle created before closure. A stale generation or closed admission never enters health/auth readiness; the reply stores the owned handle and drains it. The supervisor is retained through completion. Quiesce stops timers/network loaders, clears public cached authorization synchronously and makes outstanding health/challenge/sign/session callbacks inert. An already captured authorization value is available only to the existing private `/shutdown` request, not the public cache.

Blocking drain receives `process_.Duplicate()` while the original owned handle stays in the UI owner. It first waits three seconds. The existing termination ownership conditions remain: actual executable under this resource root, actual parent is this browser, non-null matching creation time, and the already owned process object. Only then can it terminate and wait another two seconds. Failure returns `kDrainFailed` and retains the original handle; no creation-time/PID mismatch is adopted as proof of successful exit. Success closes the original handle and reports the wait's exit code. Waiters coalesce and always complete by posted task; repeated terminal requests receive the cached typed result.

The legacy `Shutdown(OnceClosure)` wrapper remains source-compatible, but its closure is not a migration receipt. BrowserPlatform's shutdown now retains the supervisor after failed drain instead of discarding its owned handle. BrowserPlatform also closes its own `Start()` gate and checks it after the nested component-read loop, so startup cannot construct a new supervisor after a reentrant quiesce. No geometry, CSS, rendering or profile state code is touched.

## Validation completed

`node docs/integration/proposed/native-direct-daemon-quiesce/check-source.mjs` verifies four baseline/output hashes, patch hash, critical lock/generation ordering, explicit result scope, pending-child collection, retained-handle drain and late-callback guards. `git apply --check --directory=docs/integration/proposed/native-direct-daemon-quiesce/baseline docs/integration/proposed/native-direct-daemon-quiesce/quiesce.patch` passes. Actual Chromium header inspection confirms `Process::Duplicate()` and const `WaitForExitWithTimeout` APIs used by this proposal.

These are source checks, not a compilation or runtime proof. No native build or process operation was run in this lane.

## Lean integrator validation

1. Confirm all four actual checkout baseline hashes still match the manifest before applying the patch or composing it with another native proposal. Fail closed on changed baselines; preserve owner changes.
2. Compile only the affected daemon_supervisor/browser_platform translation units through the existing serialized native build wrapper; a new shared registration/GN entry is unnecessary. Then perform the one required successor native build.
3. Use a focused fake launch/barrier test for (a) launch queued before close but not admitted, (b) launch admitted before close with reply pending, (c) retry timer racing with close, and (d) reentrant BrowserPlatform component startup. Assert no launch after the shared gate closes, no successful receipt before the pending owned handle drains, and posted typed callbacks.
4. Use a disposable owned fake child for successful exit, unverified termination ownership and bounded drain failure. Verify failed drain retains the handle and reports failure; never use an owner daemon or infer all-writer closure from this result. This targeted behavioral acceptance is still pending.

The shared admission lock can briefly block the UI sequence while an already admitted `LaunchProcess` syscall returns. Filesystem preflight is deliberately outside the lock. This is the tradeoff required to synchronously linearize spawn admission; there is no claim of a hard wall-clock quiesce bound while an OS launch or thread-pool task is pending.
