# Ordered daemon shutdown successor (inactive)

Apply this overlay **after** the exact `background-writers` outputs. It changes source only; it does not modify the accepted candidate, activate the product, or grant clean-start authority. `manifest.json` pins both predecessors and outputs. `transformAuxDaemonShutdown(text)` returns the existing `{text, changes}` interface with 35 count-one edits. Freeze its imported manifest and changes JSON, helper, adapter and producer together. Apply independently to ordinary and dormant source, then rerun the original entry projector and exact pairing checks in the root's coupled producer.

## Actual shutdown sequence

The original authenticated `/shutdown` route is unchanged. Its `requestShutdown` callback still returns immediately; it does not await browser phase 6. This avoids the native browser/daemon shutdown dependency cycle.

The callback synchronously closes readiness and productive HTTP/WebSocket, timer, refresh, channel, session and background-work admission. HTTP fetches already admitted are retained; their actual AbortSignals request cancellation. The shutdown response is exempt from this cancellation. HTTP close waits its real server callback, including active response bodies; idle connections are closed. Websocket termination is a cancellation request, and the real client close events plus server close callback are awaited.

The actual original interval, refresh, productivity, channel/outbox, Computer Use, coder/process/workflow and session cleanup is started before broker closure. `auxStopBackgroundWriters()` therefore runs while admitted cleanup can still make native-backed writes. The actual bootstrap Promise is retained too; an interrupted startup cannot republish readiness or start a later bootstrap after shutdown.

After those operations and real transports settle, telemetry shutdown is awaited, then `auxBrokerBoundary().beginShutdown()` closes remaining native-backed resources. Only after successful JS settlement does the original `process.exit(0)` entry allow Node/NativeRun to return to the retained native host. The host still must perform its real native owner/browser/descendant settlement checks. This exit does not mark storage CLEAN.

There is no 4-second completion race or 5-second forced shutdown exit. A retained interval keeps the owner alive if an operation/callback never settles or if cleanup fails. That interval is not a timeout or clean receipt. The fatal-error and bootstrap-rejection handlers also cannot force exit around an already-running retained shutdown. There is no new PID, lock, elapsed-time, ACK-loss or caller-supplied success interpretation.

## Concrete producer corrections

- Global coder shutdown now includes original background workflow cancellation and its `done` promises, in addition to background processes.
- Computer Use shutdown attempts termination after preparation settles even if preparation failed; failures are no longer silently treated as success. Its existing platform helper command timeout remains cancellation/error, never proof that its supervised service or descendants have exited.
- Channel initialization, inbound callbacks, start/reconnect work, removed connection stop records and late-created handles retain their actual Promise lifetimes. Channel admission closes before stopping. Late initialization cannot publish a runtime after removal. Shutdown awaits the initializer and actual platform/gateway shutdown rather than racing a 4-second timer; cleanup failure is retained.
- Original channel outbox progress/uploads/snapshot/recovery work is retained through its actual function completion. Recovery returns its previously detached promises. Retry timers cannot restart after shutdown. Original `PushStream` instances are closed, and their actual streaming transport promises are awaited.
- HTTP fetch handling and server response closure are separate lifetimes. A returned `Response` alone is not counted as complete transport shutdown. A non-cooperative active response can keep shutdown pending; this overlay does not force completion.

## Remaining uncertainty, reconciled against actual source

No remaining `noteUntracked` marker is removed in this overlay.

| Marker / actual seam | Status |
| --- | --- |
| Credential-directory fsync failure | Legitimate failed durability outcome. Remains unknown; no repair/reset or fabricated success. |
| Skill extraction `tar`/`unzip` descendants | Actual pipeline, callback, child close and cleanup now settle, but complete descendant custody requires native support. A process/group census or ordinary child exit is insufficient. |
| `auxManagedInterval` routine scheduler | Actual outer tick is awaited; `runDueRoutine` performs native-backed SQLite work and enters `runRoutine`, which emits lifecycle events and starts a separate Agent run. The run is now retained, but all indirect event subscribers are not proven closed by the outer tick. Marker remains an unimplemented closure boundary, not evidence of a prior failed write. |
| `auxManagedInterval` session lifecycle tick | Actual purge/idle-tab promises are awaited, but existing remote tab-control/disposal failures are caught and discarded inside those bodies. A remote command result/timeout cannot prove native browser work settled. Native browser drain remains required; marker retained. |
| `auxRefreshProducer` | Actual selected list contains lazy Meta Muse, Anthropic, GitHub Copilot and OpenAI Codex OAuth implementations plus Claude Code, xAI and Kimi providers. The linked abort signal and returned refresh Promise are retained, but this scope does not establish every lazy provider's callback/server/subprocess/reader lifetime. The marker stays; no provider call was made. |
| Cleanup/transport failure | Real rejected operations remain unknown. A late initializer refused during shutdown can conservatively leave shutdown incomplete after its handle is closed; no error-based unknown-clear path is added. |
| Native exec/PTY/service descendants | Root's actual native owner/peer report still controls this. JS process termination or the shutdown HTTP response does not supply that proof. |

The source now closes and waits the concrete producer owners above. This is not a claim that every provider, event subscriber, browser or child-process writer is qualified for a clean receipt. Existing native cold/refusal/unknown gates remain intact.

## Focused evidence

`node check.mjs` passed exact paired replay and full ordinary/dormant syntax. One focused fixture exercises the actual inserted shutdown owner with deferred producer, HTTP and WebSocket close callbacks: broker closure and exit occur only after all settle, new requests get 503, and the initial shutdown response remains immediate. A second case executes the actual adapted `ChannelManager` against an in-memory delayed handle: shutdown waits for its real forceShutdown completion and never publishes it after closing.

No product daemon, network/provider, real channel account, app lifecycle, native compiler/linker or signing was run. The fixture does not establish macOS descendant custody or real SDK/transport behavior. Root still owns the source projection, native host clean-query integration, compilation/linking, packaging and eventual disposable active-work shutdown/reopen observation.
