# Background writer lifetime successor (inactive)

This source-only overlay targets the independently paired ordinary and dormant daemon source selected in `manifest.json`. It preserves the supplied UI and protocol behavior. It does not replace the current candidate, execute the product, or claim native process/descendant settlement.

## Integration contract

Import `transformAuxBackgroundWriters` from `source/aux-background-writers.mjs`. It accepts only the two exact input hashes, replays 36 count-one changes and verifies the corresponding reviewed output. Its `{text, changes}` result uses the existing literal count-checked adapter contract. Freeze the adapter, changes JSON, helper and manifest together. Apply independently to ordinary and dormant sources; the original projector must still reproduce the independently adapted dormant result. Subsequent runtime and shutdown adapters must be composed explicitly and their receipts recoupled.

The root shutdown coordinator must call **`await auxStopBackgroundWriters()` before `auxBrokerBoundary().beginShutdown()`**. Close outer HTTP/websocket/refresh/channel/timer producer admission as part of that coordinator, while keeping native broker writes available for admitted cleanup. This overlay deliberately does not alter the shared daemon shutdown anchor or native owner settlement ABI. The old timeout/`process.exit` shutdown is not a clean receipt.

`auxStopBackgroundWriters()` synchronously closes its own admission, invalidates sync producer generations, starts actual watcher closure, closes the session server, requests cancellation on actual dreaming/archive owners, and awaits retained work and cleanup. No timeout or AbortSignal is counted as settlement. A failed cleanup remains unknown. Only the root's native settlement query can prove the remaining exec/PTY/service/browser/descendant work settled.

## Actual changes

| Supplied seam | Lifetime change |
| --- | --- |
| `mergeMigrationEntry`, `markExternalStorageComplete`, `ensureProjectV6SessionAlias` | Remove unconditional unknown inside their existing native synchronous reservation. The reviewed function bodies use synchronous filesystem calls only; original conflict/error/retry behavior remains. |
| `tryMigrateStateDb` reconnect | Await the actual migration, including `using DatabaseSync` destruction; no detached migration. |
| `enqueue` | Track the real queued callback, including the no-runtime branch. Refuse new requests and skip unstarted work after close/generation invalidation. |
| `startWatchers` | Keep the existing native watcher reservation through actual `Chokidar.close`; refuse notification callbacks after subsystem close. Replaced watcher close is already retained by the native watcher wrapper. |
| `runDreaming` | Retain the actual prompt/tools/state/history writes; cancel actual Agents but await their prompt settlement. The taxonomy model-resolution timeout now waits its non-cancellable losing resolver before releasing its lifetime. |
| Memory `session.dispose` | Return the previously detached session-counter write to the hook owner. |
| Background-process `flush` | Retain the ordered delivery tail; its subsequent physical Agent run has a separate reservation. |
| Websocket connect/command | Track request work plus the separate physical Agent run. Early request completion is not run completion. |
| Session server | Close load/run/recovery admission; await loading, resume, recovery, actual runs and deduplicated disposal promises. A removed session entry remains retained through cleanup. A late reload cannot publish into a removed/closed session. |
| Agent disposal | Await hooks, MCP, each tool disposer and browser cleanup; attempt all cleanup even when one fails, and preserve failures. Exec-session synchronous termination alone still does not prove native descendant completion. |
| Skill archive | Keep failed download inside cleanup; abort actual pipeline/tool requests; wait the exec callback **and** child/stdio `close`; await every archive/staging cleanup attempt. Native descendant uncertainty remains explicit. |

## Deliberately remaining unknowns

Literal `auxBrokerBoundary().noteUntracked()` occurrences decrease from 16 to 6. Four are the separate root-owned runtime publication/install functions. The other two are intentionally retained:

- Credential-file directory fsync failure: a returned write promise cannot establish durable success after this failure.
- Skill archive subprocess descendants: waiting the actual `tar`/`unzip` process and stdio close is necessary but does not prove all descendants are gone. A real native supervised subprocess owner/report is required before removing this marker.

Markers called through local `boundary.noteUntracked()` remain unchanged, including arbitrary refresh providers and generic managed interval callbacks. This overlay does not claim that counting literal markers proves complete daemon coverage. Existing native broker failure policy also remains conservative: rejected admitted operations can make the owner unknown. No failure/reset/unknown-clear API is introduced.

Browser CLEAN generation still requires actual closed admission and native daemon/browser/service/descendant settlement, authenticated report validation and durable marker writes. No request return, swallowed original logging error, PID, lost ACK, timeout or this adapter's successful replay is such proof.

## Focused evidence

`node check.mjs` passed on the exact selected ordinary and dormant inputs. It performs count/hash replay and syntax checks only for those complete source files, then exercises the actual inserted helper and changed extraction function with disposable in-memory I/O substitutes:

- cancellation leaves native lifetime retained until the physical operation and nested cleanup finish;
- an archive command error callback does not settle before child close;
- failed download still attempts all three archive/staging cleanups, including when one cleanup fails.

The fixture exposed and corrected a block-shadowing mistake in the moved download pipeline before this overlay was frozen. No real archive tool, product daemon, provider, filesystem profile, native build or app lifecycle was executed. Real paired source projection, compilation/linking, native lifetime integration and disposable active-work shutdown/reopen acceptance remain root integration work.
