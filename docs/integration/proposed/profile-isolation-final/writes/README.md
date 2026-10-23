# Finite awaited writers and concrete resource shutdown (inactive)

This successor preserves the UI and original supplied implementation. It extends the prior synchronous broker guard to a bounded, reviewed subset of asynchronous writers and actual SQLite/logger resource lifetimes. It does not establish that all background work is tracked, and must not enable the protected successor app by itself.

## Actual integration

`transform.mjs` accepts only the exact prior task-plus-broker composed source (hash in `evidence/source.json`). Its ten replacements are count-checked. The old broker prelude is replaced in place, after the immutable cold-entry refusal; no refusal is removed. Root composes this source with its separate startup policy/entry changes. The returned output hash covers the complete modified bundle. The standalone source fixture executes no daemon imports, auth, owner data, helpers, cloud or provider requests.

Replace the prior broker WorkerHost `.cc` with `source/AuxDevelopmentWorkerHost.cc`, include the prior broker and spawn-custody include directories plus this `source` directory. No Dispatcher/C ABI changes are introduced. `withBrokerAwaited` is one additional readonly native builtin, bound through the same actual current Worker/Environment/Owner capture as existing synchronous writes. Its native pending counter is reserved **before** calling the reviewed producer and holds real shared Worker/Owner references. No caller-provided token, path, account or generation picks an Owner.

The observer uses V8's intrinsic Promise `Then`, not an overridable JavaScript `.then` property. Two handle conversions are copied exactly from pinned Node 26.5's `src/js_native_api_v8.h` (source hash in `integration.json`) with the same representation-size assertion; no private Node environment implementation is imported. The callback, finalizer and completion path refuse inherited child-process operations before touching parent locks. Missing observers, failed observer setup, rejected producer/cleanup, finalization before settlement or changed native authority retain unknown custody. They never authorize replacement or claim drain. Closing admission does not cancel an already-admitted filesystem operation; real completion is still required.

**This is not a universal promise-completion proof.** An arbitrary callback may detach work and fulfill early. Only the pinned exact producers below justify successful completion, and the source remains inactive while other producer paths remain untracked.

## Covered lifetimes

- Actual async tool `atomicWriteFile`: stat/open/chmod/write/fsync/close/rename are awaited. Rejected cleanup retains unknown even though the supplied error-handling body suppresses some cleanup errors. Success occurs after actual file-close and rename promises complete.
- Actual `writeCredentialsFileAtomic`: atomic credential-file operations remain unchanged. Its originally swallowed optional directory fsync/close failure now marks native unknown custody; it is not silently treated as a known clean resource outcome.
- Actual `appendMemoryHistoryEntry`: directory creation, mutex acquisition and JSONL append are awaited; lock disposal remains in the supplied body. This is memory-history JSONL, **not** proof that all chat/session message writers are covered.
- Actual `openStateDatabase` construction now retains a native resource reservation before opening SQLite. The proxy retains original receiver/method behavior, and resolution occurs only after original synchronous `DatabaseSync.close()` returns, including its WAL cleanup. Close failure rejects/retains unknown. Statement methods still use prior finite sync guards. No finalizer closes SQLite under a new owner.
- Actual file logger: its directory creation is guarded synchronously. Each original write stream retains native custody through its `close` event, including rotated old streams. `finish` alone never releases custody. An error is remembered and rejects the resource lifetime after close. The original file logger still swallows logging failures; shutdown reports resource failure, and native custody stays unknown.

Shutdown first refuses new guarded producers, then awaits active finite writes, closes all tracked SQLite connections, ends all tracked log streams and waits for resource-close results, then closes native broker admission. A nested guarded call attempted by an in-flight operation after shutdown starts may fail safely; it is not allowed to restart admission. Resource lifetime failures are propagated even if their resources closed before shutdown began. Successful settled resource promises are removed from the set to avoid retaining every historic log rotation/DB forever.

The supplied outer 4/5-second shutdown timeout is preserved. It can still terminate before this sequence completes. Such timeout/exit is **not** a drain receipt; pending or unknown native custody remains. No cancellation race, HTTP response, abort signal, disconnect or finalizer clears work.

## Evidence and gaps

Focused source fixtures cover shutdown ordering, refusal of new writes, actual async atomic-body close-before-rename, log-close failure, complete transformed syntax and exact input refusal. Their native binding is explicitly synthetic, not native authority verification. `evidence/native.json` records the actual WorkerHost object compile; earlier failed compile attempts are retained as evidence. Root still must pair this object with the new startup/native graph and produce an unsigned coherent link.

Still open: session message/attachment streams outside these helpers, runtime/download pipelines, provider refresh producers beyond the atomic writer, file watchers, routines/timers, imports/migrations, native utility and extension lifetimes, account/session authorization and descendant closure. Prior websocket/migration unknown markers remain. There is no claim of complete asynchronous writer enumeration, profile-switch readiness or integrated app acceptance. No UI/app substitution, signing, credential/Keychain access, owner-profile access or release occurred.
