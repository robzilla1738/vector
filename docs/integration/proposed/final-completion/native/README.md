# Native feasibility and implementation — 2026-10-23

Baseline a6b54763f5203f9741f66ca787b4f79740492c93; accepted UI/app unchanged. This lane does not activate the inactive provider-native candidate or weaken ordinary state2 refusal.

## Feasibility result and supported alternative

No current complete all-writer closure mechanism exists. kqueue NOTE_TRACK/NOTE_CHILD are explicitly unsupported in the installed event.h. macOS27 ES descendants clients cover the recursive subtree, including existing descendants, but notification scope is not a complete initial census or event-delivery completion barrier. Missing final notifications, muting, dropped events and already inherited writable handles prevent promoting an empty event cache to drain. POSIX groups do not contain descendants that detach. An EndpointSecurity entitlement is necessary to try that observer, but does not resolve these semantics by itself.

The supported architectural alternative is to reduce the private-state writer set by enforcement, not by claiming omniscient process observation. Reuse the supplied generation-admitted supervisor, account contexts and runtime/session leases. All arbitrary tool processes must inherit mandatory filesystem denial of the genuine Aux private-state roots, have no inherited writable private descriptors, and use brokered owner/generation-bound APIs for any allowed private-state mutation. Detached sandboxed descendants then remain work processes rather than private-state writers. Keep browser/storage/privileged brokers as explicit finite owned writers; ordinary per-profile work can retain its original scope instead of a fictitious global stop at every switch. Never-opened fresh generations can be prepared before any writer starts. Crash resume and legacy migration still need stopped-source custody or transactional broker export; raw live SQLite/LevelDB copying is not a safe substitute.

The supplied Seatbelt builder already uses inherited fork/exec policy, parameterized literal/subpath deniedPaths and ancestor-unlink denial. Its current wrapSandboxCommand permits sandboxEnabled=false and a passthrough fallback. The source therefore offers a real reuse seam but currently does not enforce private-state exclusion. New PTY posix_spawn uses CLOEXEC_DEFAULT and only duplicates the PTY slave onto stdio; non-PTY/MCP/helper descriptor paths and in-process user-code workers require their own coverage. Native signed policy already knows the private installation parent; actual browser profile-root provenance is a separate producer that must not be guessed from HOME, command-line strings or user-supplied deniedPaths.

## Writer coverage

| Writer | Existing real ownership/admission | Terminal evidence / remaining gap |
| --- | --- | --- |
| Browser main/profile services | Earliest state2 refusal; partial profile lifecycle gates | Normal service destruction/flush is not complete backend closure; actual profile roots must be captured before opening |
| Renderer/navigation | Native per-participant admission/retirement source | Current-generation shutdown/storage acceptance missing; profile storage broker/export needed |
| Extension/service workers | Native service-worker start gates | Stop notifications alone are not final storage acknowledgement |
| Daemon main/Node Environments | Native private owner, prepared provider, actual cleanup hook | Same-candidate protected startup/readmission missing |
| Node Workers/in-process user code | Environment bootstrap/owner registry | Arbitrary filesystem async work is not bounded by command counter alone; isolate user code or broker private IO |
| CLI | Actual pre-home marker refusal is now implemented | This closes the historical pre-mkdir gap only; no authority for old/foreign callers |
| Direct native daemon child | Actual launched waitable child, birth identity, authenticated peer | PEER successor below fixes retention/reap loss; direct child is not descendants |
| PTY direct child | Native pending reservation, fixed authenticated helper, sole real waitpid | Descendants remain unknown; current helper has no mandatory private-root sandbox |
| Non-PTY/sandboxed tool commands | Supplied process handle, real close/runtime lease | Sandbox optional; private-root denial and no-private-FD rule must be mandatory |
| MCP/other runtime children | Supplied host/session ownership varies by launch route | All launch callsites need owner-bound confinement; detached descendants cannot be inferred stopped |
| PDF/utilities | Explicit native image lifetimes and OS job custody | Partial/unknown callbacks retain Owner; actual protected callback/drain checks pending |
| Legacy/foreign/owner processes | No source scope authorizes adopting them | No reset, name-based kill, owner-profile read or live-file migration; explicit migration access/export required |

This matrix describes implementation gaps, not merely testing gaps. New signatures, an advisory lock or a compiled observer do not accept these outcomes. macOS27 is required by current packaged leaves and the optional descendant API; this analysis does not establish a fundamental27 requirement for the containment alternative.

## PEER correction implemented

peer/source is an exact successor of the current applied e6793f89 owned-child implementation. It registers the actual State strongly before any child launch; registry allocation therefore happens before the new child can exist. Teardown does not allocate a late retention record, and polling no longer copies an allocating vector snapshot. Actual terminal/no-child evidence can remove retention only if ownership never became unknown. A later successful reap cannot erase earlier sticky uncertainty. Real waitpid status must identify the expected child and be terminal; non-consuming EINTR stays pending rather than becoming fabricated exit. Process registry identity is captured at image initialization, not lazily after fork.

Chromium compiles this boundary with -fno-exceptions. No unsupported catch blocks or claim of recoverable allocation/LaunchProcess aborts was added. The sole reaper remains the native owner; no signal-by-PID, child acknowledgement or second reaper was introduced. Polling is bounded by its initial retained-record count and returns the actual remaining count, including live native owners; it is not an all-writer census.

Actual serialized check12745 passed the complete changed peer TU and seven compile-time real wait-decoder cases with the original target flags/module inputs. Inputs stayed unchanged; no link or execution occurred. The proposal-path compile does not substitute for actual-native-path unsafe-buffer diagnostics after root composes it. peer/integration.json/native.patch provide the exact two-file shared proposal; no public header/GN/Chromium/startup source was changed. Runtime fork/reap/race behavior remains unaccepted.
