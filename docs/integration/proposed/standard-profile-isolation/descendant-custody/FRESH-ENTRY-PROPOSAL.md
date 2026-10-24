# Fresh native descendant observation proposal

This source successor replaces the unsupported late-attachment approach described in README.md. It is not activated, compiled, signed or runtime-verified. The accepted app, original PTY module and current native build inputs are untouched.

## Actual entry and producer seams

`AuxNativeDaemonMain.cc` is the source recorded by the selected frozen `0.o` dependency file `/private/tmp/aux-native-worker-close-main-20261023/0.d`. Its new first operational call, immediately after fixed argument validation, initializes observation before native bootstrap, sealed image preparation, Node initialization, worker/factory creation or supplied JavaScript. This is a fixed fresh executable entry, not a boolean authorizing late attachment. Every actual Exec/Pty reservation now requires the initialized observer and repeats admission at its existing final native producer check.

The no-earlier-user-task invariant is established by that entry ordering and the native producer guard. It relies on the fixed trusted executable/library startup closure: no user extension/module, injected image or arbitrary constructor may execute before main. A successor that introduces such startup code needs a separate fresh minimal supervisor; it cannot reuse this initial-empty assumption. Current dynamic supplied module preparation remains after the new barrier. Ordinary entry points or manually attached WorkerHosts that do not run the barrier cannot spawn tasks.

The hook is process-wide, before any profile task exists. There is no claim to recover a pre-existing task population. A genuinely fresh dedicated supervisor would still be necessary if integration cannot preserve this fixed startup closure.

## Stream and cohort lifetime

- Create the macOS 27 descendant-only ES client, remove path muting, subscribe to FORK/EXEC/EXIT/DUP, and inspect the exact resulting subscriptions. Missing API, entitlement, client or subscription refuses startup before user code.
- Capture this process's kernel audit token through `TASK_AUDIT_TOKEN`. Observe a native DUP of a retained read-only `/dev/null` descriptor and complete `es_sync_client` before opening admission. This provides an actual global sequence baseline without assuming the initial counter value. It is not a child census. A self-signal is deliberately not used: the SDK excludes self-signals from ES signal events.
- Retain native cohort tickets from the original Worker/Owner generation before the original spawn. Bind only the actual native spawn result to a unique kernel-observed root birth within its reservation/publication interval. Birth tombstones cover exit-before-publication; ambiguity remains unknown.
- Track kernel pid/pidversion identities across recursive fork and exec, including the SDK's old/new exec identities. A first EXEC birth uses its kernel parent audit identity and a native reservation, not a PID lookup. All descendants remain counted across process-group/session changes.
- Require actual ES exit events and each task's original sole native direct-child reap. Neither a JS exit callback, PID disappearance nor a process-group snapshot is a settlement input. There is no second reaper or child kill implementation.
- Preserve unknown on global-sequence discontinuity, overflow, foreign/untracked ancestry, ambiguous root birth, allocation failure or failed fence. Never clear unknown or reinitialize the client to reset a lost history.
- Settlement is deliberately conservative: all current observed descendants must be gone, every native publication resolved and every successful direct child reaped before a new DUP and queue fence. Admission/cohort epoch changes invalidate that fence. The exact native callbacks then settle each RuntimeScope cohort once. Concurrent unrelated tasks in this same daemon can delay a finished task's lease release; this trades throughput for a simpler complete-cohort proof.
- Closing task admission requires a final fence even if no task was launched. Sync callback loss stays pending; client lifetime is retained to process exit, and there is no `es_delete_client` path that could manufacture completion callbacks on destruction.

No user commands, paths, argv, environment values, credentials or owner data are logged by this observer. `/dev/null` is a fixed read-only pulse source. Exec/PTY stdio, terminal setup and original status/reaper paths remain intact.

## Runtime coordination and integration order

The WorkerHost and `AuxRuntimeCoordination.inc` baselines are the runtime-coordination lane's `1af2df7e9` source proposal. Root should replay the exact counted modifications onto its composed successor, preserving its separate clean-query/background-write changes; do not overwrite a newer host wholesale.

Healthy observed children increment pending descendant counts. `RuntimeChildCreatedLocked` retains the existing runtime lease as pending instead of immediately labeling it unknown. Only the observer's private exact-once callback invokes `RuntimeChildCohortSettled`; direct wait and JS release do not. Existing unknown conditions remain. WorkerHost close also inspects the process-wide stream, so an uncertain event history cannot be hidden by otherwise-finished worker counters.

Root must add the new observer `.cc` to the exact daemon link, compile it with Blocks support (`-fblocks`) against the macOS 27 SDK, and link EndpointSecurity (plus the already-used audit-token support). The selected deployment target remains macOS 13.5 in the exact prepared compile recipe; this proposal does not raise it. The restricted entitlement is absent from the selected product. Guarded availability has not yet been compiled here, and execution without macOS 27 or the entitlement deliberately refuses this successor. Do not replace the current app with this source-only proposal before the separate capability review and real acceptance.

The parent-facing authenticated drain path remains the existing native Worker/Owner authority query and browser transport. There is no new caller-provided JSON or PID proof, and no unauthenticated receipt endpoint.

## Separate activation prerequisites and required acceptance

Apple's restricted Endpoint Security entitlement and authorized provisioning/signing are required later. No request for those actions is made now. The macOS 27 descendant API does not require root or Full Disk Access; the older conventional ES client has different requirements and is not used as a silent fallback.

Root's next focused checks should compile the exact integrated native tuple, then—only after capability authorization—verify ordinary exec and PTY, rapid exit before publication, nested fork/exec, double-fork/session escape, cancellation with a surviving descendant, and injected event-loss/fence refusal. The source's initial-entry and real ES ordering assumptions need that exact candidate acceptance. Existing profile/startup gates are not relabeled as passed.

## Verification performed here

Ordered replacement counts, unified-patch replay and exact resulting bytes were checked for the three modified files. SDK declarations, audit identity fields, availability and callback constraints were inspected directly. No C++ compilation, executable fixture, product launch, ES client, signing, OS grant or owner-state access occurred. The manifest distinguishes three modified inputs from the two added observer sources.

`compile-command.json` pins the actual compiler, SDK declarations and added source/header and specifies a fresh object/dependency output directory. Root owns serialized execution and final link composition. The command is prepared, not evidence of compilation.
