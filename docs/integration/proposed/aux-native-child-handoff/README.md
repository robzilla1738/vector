# Two-phase private native child handoff and retained live peer

Inactive source successor. No current native checkout, GN, DaemonSupervisor source, startup refusal, selected policy, UI or original runtime changed. No compiler/Node build, Mach/process operation, Security, owner-state or signing operation executed. Source copies retain the reviewed transport ownership fixes; their baseline, unified patch and exact input/output hashes are included.

## Actual producer and consumer

`PreparedParentEndpoint::PrepareBeforeSpawn(native_code_policy)` allocates the actual parent receive right **before** native launch. `CopySendRightForNativeHandoff` produces its owned send-right reference. `BindActualDirectChild(actual_pid)` completes binding only after real spawn, checking direct-child waitability and kernel birth identity; one-time binding and terminal closure share the retained state. An unbound endpoint has no callable authenticated server. The compatibility `ParentTransport::BindActualDirectChild` delegates through the same producer, preserving its original public contract.

`OwnedNativePeerChild` is an actual cold launch primitive using the same `base::LaunchProcess`/`LaunchOptions` APIs as supplied `DaemonSupervisor::Launch`. It prepares the endpoint, places its MOVE_SEND right at fixed native Mach rendezvous key `AUXP`, then serializes its one actual spawn with terminal close. The exact Process, birth time, endpoint and bound transport remain owned together. It does not export a mutable Process or a second reaper. `TakeLaunchedNativeParentEndpoint` consumes that fixed right in the actual child native bootstrap. Stock rendezvous supplies delivery only; independent audit/live-code authentication remains mandatory.

This distinct cold path requires `clear_environment` and rejects legacy interposer/native-carrier/Node preload overrides. It does not silently turn the existing supervisor's historical DYLD-selected path into a fresh clean host. A genuine future native cold coordinator supplies its reviewed command, environment and code policy; existing supplied browser/daemon/CLI code and the default compatibility launch remain unchanged. Root must deliberately replace that cold launch consumer and retain this object, not add a JS/environment acceptance switch. No helper called here starts Node or evaluates supplied entry code.

`AuthenticatedNativeParentConnection::Connect` is the actual private typed peer producer: it performs the full kernel audit/live-code/nonce exchange, then retains the endpoint, immutable policy, actual parent PID-version/birth identity and owning process. Public APIs accept no ParentExchange/status/evidence to construct it. `Revalidate` performs a fresh real handshake against that same living parent with a retained endpoint ref. Close stops subsequent checks and makes an in-flight check refuse late success while its exact native endpoint state remains retained. This object proves a live peer connection, **not** all-writer/cohort or installer custody.

## Swift native bridge

`AuxNativeParentConnectionBridge.h/.cc` provides these real C ABI functions, with process-owned non-reused registry handles:

- `AuxConnectActualNativeParent(owned_endpoint, exact_requirement, cd_hash, length, timeout_ms)` consumes one actual native send-right reference and returns a handle only after the private Connect succeeds.
- `AuxRetainNativeParentConnection(handle)` and `AuxReleaseNativeParentConnection(handle)` validate native registry ownership before access; final release closes outside the registry lock, while an in-flight check retains the actual object.
- `AuxRevalidateNativeParentConnection(handle, timeout_ms)` returns 0 authenticated,1 timeout,-1 refused,-2 closed,-3 wrong process by calling the actual object, never a caller Boolean.

No C function accepts a scope, home, provider ID, authority pointer, status JSON or evidence. Handles route only real retained peer objects; they are not JS exports or custody tokens. The actual signed-policy consumer must supply the immutable code requirement/hash. The fresh guard/service must combine the typed live peer with its genuine sealed role/private-home owner and source-enforced installer/writer entry lifecycle. Peer identity by itself must not initialize keys or authorize existing-state migration.

## Retained process and cleanup boundary

`CloseAndInspect` closes peer/spawn admission without signaling the child or claiming it stopped. `ObserveAndReapExitedChild` acts only on the private actual Process: it checks captured birth time, observes real waitid(WNOWAIT) exit and then its exact waitpid result before recording/reaping exit. Missing/competing reaper results remain `exit_ownership_unknown`; zero from a generic process-wait API is never used as proof. All wait activity must route through this private owner; another supervisor/global reaper would violate that ownership and cannot be repaired by an observation flag.

Destruction retains any live/unknown child, endpoint and process state in a native unresolved registry. `PollRetainedOwnedChildren` retries only those genuine owned states and removes an entry only after its actual observed+reaped exit. No process kill, timeout-as-exit, profile admission, storage drain, readmission or legacy-writer success is inferred. Receive/validation counts remain raw and separate from process exit. Fork namespace/CF caveats from the transport remain; this is fresh exec startup, not broad support for continuing inherited native state.

## FD/flock findings

The local SDK's flock(2) notes explicitly state duplicated/forked descriptors share one lock, and a child unlock can release the parent's lock. fcntl(2) documents that plain duplication clears close-on-exec flags, while F_DUPFD_CLOEXEC sets them. Consequently this handoff deliberately transfers a private Mach right, not an inherited advisory-lock authority. A fresh installer must acquire/retain its own fixed lock from its genuine private-home FD before Node starts and source-gate every admitted writer. A lock alone authenticates no process and excludes no uncooperative writer. Existing profiles/legacy processes are not covered by this fresh isolated path.

Compilation/live exchange/actual spawn remain pending root scheduling. The files are concrete producers but no active launch integration or acceptance claim is made. The genuine Node runner, fresh guard/service, parent source gate and exact signed policy remain distinct paired integration work.
