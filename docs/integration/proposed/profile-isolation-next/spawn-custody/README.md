# Retained native command spawn and descriptor isolation

Baseline `43914674f`. This is an **inactive exact source successor**, not a new active runtime or claim that profile switching is ready. It preserves the accepted app and UI. Root owns actual Node/archive/addon rebuild, native registration, packaging and startup. No signing, protected runtime, owner profile/credentials, provider call or new OS grant occurs here.

## Actual controlled launch sites

Six pinned replacements in `integration.json` and `source.patch` cover the actual supplied native code:

- Node26.5 `ProcessWrap::Spawn` for asynchronous child processes, before callback-capable options getters/conversions.
- Node26.5 `SyncProcessRunner` for spawnSync/execSync, before `ParseOptions`; this distinct path bypasses ProcessWrap in the original code.
- The actual macOS libuv `posix_spawn` calls, not merely the JavaScript child_process wrapper.
- The existing authenticated node-pty producer, before N-API argument reads and at its actual macOS syscall.
- The actual per-Environment `AuxDevelopmentWorkerHost` registry and retirement counters. The original class/dispatcher/PTY helper header contracts are retained.

`verify.py` checks the pinned six original hashes, applies the unified patch with zero fuzz to disposable copies and requires byte-identical complete successors. Original static inputs remain unchanged. The Node/libuv/PTY legal notices and node-pty license are retained.

## Native owner and root capability lifetime

`AuxNativeExecBeginCurrent` takes no JavaScript arguments. It captures the actual current V8/Node Environment, isolate, event loop, creator thread, native Worker generation and authenticated retained Owner. It reserves a process-lifetime opaque native token before any callback-capable command conversion. Process mismatch is rejected before native locks/V8 APIs. Tombstones prevent Environment/address/token ABA. No JavaScript boolean, owner ID, PID, pathname, descriptor or serialized receipt supplies admission.

`AuxNativeExecCopyDeniedRoots` uses that reservation's exact Owner handle. It captures the signed native private parent, then calls the paired actual native dispatcher `AuxNativeContextCopyBrowserRoot` for finite roles1/2: whole Chromium user-data and external cache. Both owned directory descriptors and a matching nonzero native parent transport generation are required. A missing/refused role cannot degrade to a guessed default, environment path or parent-only launch. The descriptors remain CLOEXEC and retained through actual syscall publication. Native `F_GETPATH`, canonical name and descriptor/named directory identity are checked; each command re-queries both capabilities and compares generation, names and device/inode immediately before every actual syscall. Current authenticated Owner/admission checks bracket these operations; no Worker/registry lock crosses a native dispatcher/parent query. The native root bridge and its retained parent propagation are separate paired source work, not established merely by this consumer compiling.

Root's native `AuxExecSpawnEnvelope` runs **inside this reservation** after conversions and before spawn. It owns copied argv/env and canonical cwd through the syscall and places the supplied existing sandbox/command inside the fixed `/usr/bin/sandbox-exec` denial envelope. It receives only reservation-produced roots. No optional JavaScript wrapper outside the lease substitutes for this boundary. The PTY envelope nests the existing native-authenticated helper and preserves that helper's original cwd/command argv, fresh-slave stdio dup2 and sole reaper. Protected PTY rejects relative cwd and non-macOS routing rather than silently executing an unsupported shape.

## No inherited writable descriptor routing

The protected Node producer accepts exactly three stdio slots. Each must be UV_IGNORE (libuv /dev/null) or UV_CREATE_PIPE with its ordinary readable/writable direction flags and a non-IPC named-pipe object. Inherit-FD, inherit-stream, IPC/additional slots, overlapped flags and uid/gid requests refuse. Actual libuv UV_CREATE_PIPE creates new socketpairs instead of forwarding a stream's existing FD. No arbitrary descriptor becomes stdin/stdout/stderr.

Pinned macOS libuv already uses POSIX_SPAWN_CLOEXEC_DEFAULT. Its original ENOSYS fallback to fork/exec could otherwise inherit unrelated non-CLOEXEC private descriptors, so this successor refuses that fallback. All unmapped parent FDs, including held private root capabilities, are excluded at exec by that attribute; only the fresh stdio file actions survive. The existing macOS PTY routine likewise retains CLOEXEC_DEFAULT and duplicates only the fresh PTY slave onto0/1/2. This is a source contract plus compile evidence; no runtime inherited-FD acceptance is claimed. Other platforms are unsupported for this protected route.

## Publish at the syscall, not uv_spawn return

Actual libuv can return an error **after successful posix_spawn** when opening its parent-side stdio streams fails. Therefore the new native UV scope binds one pending reservation to the creator thread, repeats admission at each actual posix_spawn attempt and records the actual successful syscall PID immediately, before libuv cleanup. Node consumes that native creation bit even if uv_spawn subsequently reports an error. Such a child is never cancelled as a false no-child failure. No JavaScript PID is accepted and no second reaper or PID probe is added.

Only paths proven not to have created a child cancel pending ownership. Native libuv exit observation runs before JavaScript callbacks; a matching terminal native wait is required before libuv emits it. Existing ECHILD/lost events stay unresolved, and nonterminal/impossible waits cannot fabricate a successful exit. The PTY path reports its existing sole waitpid return/raw status to both native reservations before JS/TSFN delivery. A failed/nonterminal/mismatched native observation becomes unknown custody.

Worker closure permanently blocks new reservations. Pending/direct/unknown command counts are included in retirement and Environment detachment; callbacks, cleanup or a destroyed host cannot release an unresolved Owner. **Every successful command still marks descendants unknown**, even after a genuine direct-child exit. This source deliberately retains/quarantines that exact Owner instead of certifying full drain. Filesystem/FD exclusion does not prove broker IPC, Mach ports, Keychain/shared-memory mutation isolation or general host bridge safety.

## Integration and remaining limitations

No existing stage hook loads these replacements. A coherent eventual build must rebuild the actual Node objects/archive and PTY addon against this exact host, resolve all eleven new native C ABI symbols and pair root/parent transport, envelope, startup and policy identities together. Do not link a newly declared interface to an old object or reuse a prior generated package receipt. `spawn_sync.h` and its changed TU must be paired. `AuxBrowserRootBridge.h` and root's envelope remain authoritative in their respective lanes; no duplicate producer is invented here.

Full private-parent denial currently also denies runtime/cache/workspaces located underneath it. Trusted runtime/task layout separation or a genuine bounded native broker is required; there is no credential/profile subtree carveout. Plain Node/unregistered environments refuse this protected producer. Custom argv0, inherited stdio/IPC/fork channels, relative PTY cwd and unavailable native roots explicitly refuse. These restrictions are inactive source behavior and are not presented as accepted product parity.

Still required: complete retained native parent/root/Owner graph integration and actual protected startup, trusted runtime/task layout, authenticated fixed helper/broker classification, IPC mutation closure, real descriptor/rename/cancellation/cleanup runtime cases, and a justified rule for excluding descendants from the writer set. Root's synthetic sandbox deny/allow check is independent policy evidence, not actual Aux owner/provenance/custody acceptance. No full link or broad repeated test is performed here.

## Focused checks

`check.py` serializes through `scripts/native-build.py` and compiles the actual changed Node ProcessWrap/SyncProcessRunner, libuv process TU, full retained WorkerHost, actual PTY addon and compile-time descriptor cases. It uses the real original Node build flags, root's actual native envelope header and the paired actual native browser-root header. It discovers exact dependencies, freezes their hashes before object compilation and verifies them afterward. It does not link/load/run any product, addon, helper or sandbox. An initial dependency-discovery attempt was intentionally interrupted as this slice expanded to include PTY; its empty external output is historical, not a passing gate. Final compile receipt follows separately.
