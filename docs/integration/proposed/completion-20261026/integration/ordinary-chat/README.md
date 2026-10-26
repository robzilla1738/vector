# Ordinary chat: lazy privileged tool construction and visible startup refusal

The owner-authorized A38 Contributor-only provider journey failed locally before inference. `safe-diagnosis.json` records payload-free evidence from the specifically approved launch16 log and exact A51 source. No credential/state file, raw error body/header, provider request or UI operation was read/performed by this worker.

## Proven failure and call order

The approved log stack reaches `auxRequireSupervisedTasks → createDesktopRepl → createCoreToolset → harness.createTools → AgentSessionServer.startRun`. The exact disabled-capability diagnostic is present. The source call order is:

1. `sessions.createAndPrompt` creates a stored session and awaits `startRun` before returning the session for UI navigation.
2. `startRun` first awaits `#h`; the actual run callback has not started.
3. `#h` constructs `AgentSession`. Its static create resolves model metadata/credential binding and defines the future `streamFn` closure, then invokes the constructor.
4. That constructor eagerly builds the desktop toolset; its REPL constructor immediately rejects the deliberately disabled supervised-task capability.
5. The callback that invokes prompt/runAgentLoop/modelRuntime.streamSimple is never reached for this failed initialization. Existing run-error handling starts after `#h`, so this failure also escaped its normal task-status/error path.

Catalog/key entry and model selection are separate observations. This evidence proves no completed inference and no executed model stream for this submission. It is not a provider billing receipt, and no spend amount is guessed.

## Bounded correction

`transformAuxOrdinaryChatStartup({text,source})` in `vendor/provided/aux-ordinary-chat-startup.mjs` changes two exact current-source joins and appends two finite helpers (three ledger anchors):

- `createCoreToolset` retains its original tools and options but creates only a lazy desktop REPL facade. Ordinary session construction never opens this privileged runtime. The first actual REPL run constructs the **original** `createDesktopRepl`, whose immutable `auxRequireSupervisedTasks` execution guard remains byte-identical. A disabled invocation still fails honestly. No native property/flag, permission, exec path, addon, sandbox, endpoint or tool policy is made permissive.
- Disposal never constructs an unused runtime, retains the exact existing disposal promise, runs it once, and rejects execution after disposal.
- An initial `startRun` construction failure updates only the original account incarnation's existing idle task to the existing `errored` status. It then returns a payload-free `PRECONDITION_FAILED` through the supplied mutation error/toast path. Running/suspended tasks and reused account IDs are not overwritten. No raw underlying error/body/key is included. The original draft-clearing path is not invoked by a failed mutation.

This fixes ordinary chat admission without counting disabled privileged tools as complete. Existing later run failures retain their supplied `agent_error` path. Actual corrected-app navigation, streamed inference and rendered error state still require the root operator; source success cannot prove them.

## Integration and focused evidence

The transform accepts exact A51 and the reviewed cloud-transfer/final-runtime/events successors. Root may pass the pinned pre-settings-migration source separately as `source`; all two actual anchors must still match the current composed text. Apply to both complete daemon leaves and include generator/pins in cumulative provenance. Source check/output hashes are in `source-check.json`. The accepted app is untouched.

Four focused cases pass: actual core-toolset construction without entering the guarded REPL; first-run refusal and disposal protection; unused/initialized exact-resource disposal; original-account-only error propagation; and both full cloud/identity/events/startup successor modules parsing with the original execution guard retained. No provider request, native build, credential entry or signing was performed. Root owns any package/approved execution review and the next single bounded Contributor request under the existing total budget.
