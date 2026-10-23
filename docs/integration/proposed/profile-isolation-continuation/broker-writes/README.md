# Retained broker writer admission successor (inactive)

This source slice preserves the supplied UI and implementation. It adds real current-Environment/native-Owner checks to finite existing daemon routes and synchronous write primitives. It is not activated in the accepted app, and it does not establish full IPC isolation, account authorization, descendant drain or readiness for profile switching.

## Native integration

Replace the prior spawn-custody WorkerHost CC with `source/AuxDevelopmentWorkerHost.cc`, retaining its unchanged public header (SHA in `integration.json`). Add this directory to native include paths for its two included `.inc` files and C header. Replace browser-roots Dispatcher with `source/AuxOwnedCommandDispatcher.swift`. The sole new C export is `AuxNativeContextCopyStorageRoots(owner, transportGeneration*, controlFd*, taskFd*)`; both FDs are owned CLOEXEC directory duplicates obtained through the real captured fresh/resume runtime, with actual native authority checks before and after. No JS path, FD, profile, account or generation selects the Owner.

The actual registered `aux_owned_native` builtin adds own readonly/nonconfigurable functions. `captureStorageRoots()` returns the frozen exact six-field `aux.native.storage-roots.v1` locator required by the task-path lane; the selected control and task directories must be distinct and nonnested. Paths and generations do not themselves grant authorization or filesystem custody.

`withBrokerSync(callback)` retains the actual Worker and Owner and increments native pending custody before invoking a callback. It checks real authority again afterward. A changed authority, unexpected call failure, Promise or incomplete native path permanently records unknown custody. CloseAttempt and environment detach include these counters; shutdown closes new guarded admission, never announces drain. Unknown custody has no JS release API. The existing registry retains uncertain owners.

**This is not a general-purpose JavaScript drain primitive.** Arbitrary callbacks can schedule asynchronous work and return undefined. Only the exact reviewed finite synchronous source call sites below justify known outcomes. Promise detection adds a refusal; it does not prove that a non-Promise callback started no background work.

## Pinned source integration

`applyAuxBrokerWrites(source)` accepts only the final-local v2 daemon SHA or the exact task-path successor SHA. It changes nine count-checked actual seams and returns `{source, prelude, changes}`. Root must insert the returned prelude **after the existing immutable cold-entry refusal**, never before it; it lazily captures only the actual native builtin and has no shim/environment fallback. The adapter remains inactive until the full native graph and protected startup are accepted.

Covered finite writers are the original `atomicWriteFileSync` JSON write/fsync/rename/cleanup body and actual synchronous Node SQLite construction, `exec`, `prepare`, `close`, statement methods and each lazy iterator step. Receiver binding and return values are preserved. Unknown SQLite methods explicitly refuse only this protected successor route. A closed/changed owner cannot close a cached SQLite connection through the new guard; safe native-owned cleanup/checkpoint lifecycle still needs implementation, rather than allowing a late WAL write under another owner.

HTTP protected-request admission retains all original token/origin/host checks. The actual account procedure keeps its real AccountRegistry lookup and errors. Account middleware asserts the native Owner after account resolution. Agent websocket connect/command producers assert native current ownership and mark untracked work before starting the supplied async producer. Detached state-DB migration also marks untracked work. No response, Promise settlement, finalizer, disconnect or callback clears that uncertainty.

## Verification and remaining implementation

`test.mjs` passes five bounded fixture classes, including execution of the actual patched atomic-write body with synthetic filesystem primitives, SQLite receivers/iterator stepping and full transformed syntax. Fake native functions in this source fixture are explicitly not proof of real authority. `evidence/results.json` records one actual changed host object compile and a paired 47-source whole-module Swift v6 typecheck; all frozen inputs remained identical. Initial compile setup failures are retained externally under `/private/tmp/aux-broker-writes-native-20261023*`; none is reported as a pass. No helper, daemon, authentication, protected I/O, owner data or app was executed.

Still missing: complete enumeration and native custody of async session JSONL/messages/files, attachments, file watcher callbacks, provider-token refresh/persistence, extensions/native utilities, account migration/import jobs, routine/background timers and all SQLite deferred cleanup. Native current Owner is a process/generation authority, not a substitute for per-account/session authorization. Installation JWT verification stays unchanged and alone is not a profile ownership receipt. Websocket admission is not a lifetime proof. Descendants retain the existing unknown state. Do not activate this source until these producer/caller/lifetime gaps and private runtime/task layout are closed in the full graph.
