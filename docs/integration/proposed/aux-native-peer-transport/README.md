# Actual native Mach peer transport

Inactive real macOS C++ implementation. No browser/daemon/CLI loader, GN, policy, selected scope, UI, native checkout or startup refusal changed. Compilation and the prepared pure-wire check are pending the root-controlled native build lock. No IPC, Security, signing, owner-state or protected factory operation was executed.

`ParentTransport::BindActualDirectChild` binds only a live direct **waitable** child of this native process. It reads kernel `proc_bsdinfo` PID/PPID/birth time and calls `waitid(WEXITED|WNOHANG|WNOWAIT)` before/after capture, without reaping/signaling. Every real request checks birth identity and direct-child waitability before and after live code validation. A child that was reaped, has an unknown parent, or cannot be observed is refused. The public SDK has no `proc_uniqidentifierinfo` declaration; no invented private-layout syscall is used. The first valid request records the kernel audit PID-version; all later requests must match that version as well. Native launch owns the actual child handle outside this component and must retain its process/custody record. This binder is peer identity, not proof of all descendant/profile writers.

The server owns a receive right. `CopySendRightForNativeHandoff` returns one owned send-right ref for the native launch transport to transfer; it is never a JS integer or environment admission. `ServiceOne` receives a bounded fixed-size request and **kernel Mach audit trailer**, rejects complex/unexpected/versioned/malformed envelopes, validates exact child identity and live native `SecRequirementRef` plus exact expected CDHash using `SecCodeCopyGuestWithAttributes(kSecGuestAttributeAudit)`, `SecCodeCheckValidity`, and `SecCodeCopySigningInformation`. It echoes the fresh child nonce only after another retained-child check and final same-generation close check. The send-once reply right is released on every refused path and consumed once on successful reply, following Chromium's actual message-destroy/send-once ownership pattern.

`AuthenticateActualNativeParent` uses its real `getppid()`/kernel birth observation, creates a fresh 256-bit nonce and private reply receive right, then requests the full kernel audit trailer. It independently validates the actual living parent, native requirement/CDHash, echoed nonce, fixed version and open transport generation. A pathname, PID string, receipt, environment flag, signature policy alone or send-right possession never replaces those live peer checks. A successful response is a raw **authenticated transport exchange**, not an installation, scope, provider or migration grant. No serialized provider ID, native handle, selected home, credentials or ciphertext is accepted by this protocol.

## Closure and custody

Own transport admission is monotonic generation1→2; `CloseAndInspect` stops new receive/handoff admission. Each already-admitted call retains the exact receive-right state, and `active_exchanges` covers parsing, validation, reply and cleanup (not merely the blocking receive). `active_receives` and `active_code_validations` remain distinct. A pending Security call may outlive close and is still counted. After it returns, closed/generation checks prevent success/reply. The final bounded send runs under the close mutex, so close cannot return before that send terminates. State/right destruction occurs only after retained calls exit. Child exit is never promoted to a clean drain; no process is killed. A forked copy returns wrong-process before touching inherited mutexes. Raw counts describe only this transport, never all native writers, running renderers or storage durability.

The transport does not start a background thread or invoke arbitrary callbacks; a trusted native owner schedules `ServiceOne` on its actual owned IPC thread and retains the transport until its real work exits. It must not use object destruction concurrently with method invocation without retaining the object itself. Own pending observations are not a substitute for that thread's actual completion.

## Honest producer boundary

The missing native parent producer must still own actual profile/cohort admission and the actual spawned child before invoking this transport. `ExactCodePolicy::CopyNativePolicy` only copies an immutable native requirement/CDHash; it does not authenticate the source of that policy. A real sealed-policy consumer supplies it; no fabricated authenticated-policy constructor is added. Private-right handoff and loader/preload ordering remain launch integration. Current stock Chromium Mach rendezvous can carry the right, but its environment/feature-dependent enforcement is not reused as protected peer authentication: this new transport independently enforces its live audit checks.

Inside the child, actual fresh prepared-provider construction remains native and separate. The previously implemented `AuxNativeEnvironmentPreload` can consume a shared actual `AuxDevelopmentWorkerHost`, including the new explicit fresh-provider host constructor. This transport must never deserialize a provider ID into that constructor. Genuine fresh terminal/prepared provider and whole-cohort admission remain prerequisites before any protected owner use. Current first native/SEA/Node refusal remains unchanged.

## Focused future check

After root releases the native build freeze, schedule exactly one check:

```
python3 scripts/native-build.py sh docs/integration/proposed/aux-native-peer-transport/check.sh /fresh/check/output
```

It compiles the actual transport object with the local SDK. The executable tests only the actual pure production envelope predicate (valid request; short envelope; complex rights; wrong version/reserved field; short trailer; wrong kind). It never instantiates transport/ports, calls live process/Security APIs, or makes a signing/protected-execution claim. Live authenticated parent/child, closure-race and peer-code negative integration checks remain separate, unexecuted work requiring a genuine future native producer and reviewed disposable fixtures.
