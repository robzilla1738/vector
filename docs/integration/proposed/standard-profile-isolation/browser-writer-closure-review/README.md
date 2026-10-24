# Browser writer closure: bounded native feasibility review

Source-only review, 2026-10-24. This changes no implementation, package, frozen recipe, permissions or accepted UI. No process, provider, compiler or runtime check was run. `inputs.json` pins the selected native and existing authority-contract inputs read for this review. Line references describe those bytes, not a future projection.

## Result

The existing direct-child registries and irreversible descendant-uncertainty tombstones are truthful. They cannot yet certify ordinary browser shutdown as clean after an unproved child launch. The smallest plausible content-child successor is a genuine early-helper acknowledgment of the exact installed no-fork sandbox, coupled to the existing launch/reap record. Native messaging needs a separate complete write-authority boundary or browser-wide descendant custody. Neither is established by a successful spawn, policy-send, pipe close, direct-child reap, or shutdown phase number.

The owner's standard isolation decision excludes unrelated same-UID applications; it does not exclude Aux's own descendants or delegated writes. Do not remove the current unknown bits until the relevant native authority is implemented and accepted.

## Actual objects and policies

| Object / write path | Selected implementation | Closure consequence |
| --- | --- | --- |
| Whole browser user-data and native default Chromium cache | `AuxChromiumBrowserRootProducer.cc:22–28,49–75`; `AuxBrowserPrivateRoots.h/.cc` retain two finite roles, held directory identities and CLOEXEC descriptors | These are the authenticated browser roots. They are not an arbitrary filesystem/root list. |
| Daemon control, task/runtime roots | `AuxFreshBootstrapPolicy.swift:95–111` and `AuxStorageRootsBridge.h` describe separate native-selected control/task roots, disjoint from browser data/cache | Native messaging's two-root denial is not a complete Aux root envelope. Browser-owned authority must be joined with the actual admitted daemon Owner without trusting renderer paths. |
| Profile network storage / HTTP cache | `profile_network_context_service.cc:1383–1419`; `chrome_content_browser_client.cc:5982–6004,7454–7478` | The sandbox allow-list includes default and pref-selected cache parents, but **the strict cold-entry build already refuses final context paths outside the held pair**. `StoragePartitionImpl:3572` calls that final gate. `AuxBrowserNetworkPaths.cc` validates all six path slots and the held roots. Preserve this gate; do not report cache override support or an admitted override leak merely from the wider sandbox allow-list. |
| Chromium shader caches | `chrome_content_browser_client.cc:5271–5289` maps ShaderCache, GrShaderCache and GraphiteDawnCache under user-data | These remain admitted-root writes, including browser-side cache service/background work. They are different from Apple's Metal caches. |
| OS-selected GPU cache/temp | `sandbox_parameters_mac.mm:63–83,170–197`; `gpu.sb:113–139` | OS `confstr` directories and helper bundle ID determine these paths. They are not automatically the admitted Chromium cache role. GPU direct writes and inherited/brokered objects must be accounted for through actual lifetime/authority. |
| Delegated Metal cache outputs | `common.sb:71–103`; `on_device_model_execution.sb` | The policy can issue read-write sandbox extensions to helper-specific `com.apple.metalfe` / `com.apple.gpuarchiver` paths. A launchd service receiving such authority is not necessarily a browser descendant. No-fork or an ES descendant census alone cannot prove those jobs finished or extensions revoked. |
| WebNN compiled models | `webnn_model_compilation.sb`; `gpu.sb`; `webnn_browser_host_impl.cc:334–403` | Compiler temp writes, CoreML helper cache outputs, and browser ThreadPool copy/cleanup are different owners. Existing compiler denial of `webnn_gpu_protected` protects the destination from that compiler; it does not settle the browser copy task or external compiler service. Preserve the actual copy reply and browser ThreadPool shutdown accounting. |
| Native-host inherited resources | `launch_context_posix.cc:100–155`; `base/process/launch_mac.cc:270–306` | Stdin/stdout are pipes; CLOEXEC-default closes unlisted FDs, but stderr is inherited unless replaced. A writable browser log FD, explicit remap, Mach capability or sandbox extension is not revoked by denying pathname roots. |

A canonical, launch-bound comparison must distinguish (a) writes to admitted profile/task/cache objects, (b) Aux-owned additional output objects requiring an explicit owner/lifetime contract, and (c) unrelated shared OS activity. Category (c) is outside standard isolation. Category (b) cannot silently be relabeled (c), and a lexical path prefix cannot classify aliases or already-open descriptors. No owner filesystem contents were read here.

## Content children: smallest enforceable successor

Existing hooks:

- `content/browser/child_process_launcher_helper_mac.cc:100–179` chooses the real sandbox type and serializes the common policy plus suffix and actual parameters. `--no-sandbox` and unsandboxed types bypass it. Cached policy must be checked as its exact serialized bytes, not only its type name.
- `:181–217` reserves the actual `AuxChildLifetime`, spawns, binds real PID/creation, and sends policy. `SendPolicy`'s result is ignored; it is not an application receipt.
- `sandbox/mac/seatbelt_exec.cc:101–115,174–180` implements a one-way policy pipe and applies the serialized policy in the child.
- `chrome/app/chrome_exe_main_mac.cc:165–176` applies the policy before framework loading. This is the appropriate trusted acknowledgment location, before untrusted browser content/extension code.
- `common.sb` denies by default and permits process-exec only for the executable path. The selected sandbox suffix inventory has no process-fork allowance. That is source evidence for a no-fork design, not proof that a particular running child received it.
- `content/browser/aux_child_lifetime.h` reserves before spawn and retains the sole native reaper's matched terminal result. Its successful-launch tombstone must remain unless a stronger native certificate is bound to that same launch.

Proposed narrow files: `seatbelt_exec.{h,cc}`, `child_process_launcher_helper.{h,cc}` plus `_mac.cc` as actually needed, `chrome_exe_main_mac.cc`, `aux_child_lifetime.h`, public child-drain snapshot and existing report evaluator. No JavaScript proof API.

Required native record: fixed verified helper identity; original reservation and process birth identity; unpredictable per-launch challenge; exact serialized policy digest and sandbox type; admitted-root/native-owner generation; acknowledgment from the inherited private channel only after successful policy application. Consume/close that channel before framework execution. A reply from arbitrary child code, a command-line nonce alone, or an inferred PID is insufficient. No timeout, failed send, stale receipt, alternative executable, sandbox bypass or unknown policy may convert to covered. Keep the sole original reap as the direct-process completion event.

A positive receipt can certify only a policy whose no-fork semantics and launch invariants are established. It does not close delegated service work, broker requests, writable FDs or browser-side asynchronous tasks. Retain those participant fences separately. Re-exec semantics and the current SDK/OS sandbox enforcement require focused native acceptance before claiming this path works; no blanket `all_writer_coverage=true` is appropriate.

## Native messaging: authority revocation or supervision

`AuxSelectedStateHome.cc:315–386` currently wraps the original host argv with fixed `/usr/bin/sandbox-exec`, allow-default, denies writes/linking under only the held browser data/cache pair, and denies ancestor unlinking. Native host lifetime sees only actual launch/birth/reap; there is no applied-policy acknowledgment. This preserves compatibility but is not complete descendant or write-authority custody.

The smallest write-revocation design must join the actual browser roles with actual admitted daemon control/task/runtime capabilities, validate complete physical-root identities, and deny write authority before third-party host code runs. Inventory inherited descriptors, aliases/hardlinks, mapped files, sandbox extensions and Mach/broker authority; route stderr to a retained safe pipe or another explicitly owned sink instead of silently inheriting a writable profile log. A complete native broker must reject new write grants and settle prior writes before clean. FD closure in the parent alone does not revoke descendant copies. If the platform sandbox cannot revoke a retained writable object for this policy, that launch still needs real cohort custody.

A fixed reviewed native launcher can apply and acknowledge the policy before exec of the original host. `sandbox-exec` returning/spawning successfully cannot supply that receipt. Proposed hooks: `AuxSelectedStateHome.cc`, `launch_context_posix.cc`, `launch_context.{h,cc}`, `aux_native_messaging_lifetime.h`, and a small fixed native launcher/receipt protocol integrated with the existing parent transport. Parent owns registration/build/identity review. Preserve host arguments, stdin/stdout framing and existing password-manager integration. A blanket fork prohibition on third-party hosts would change supported behavior; it is not an accepted substitute for compatibility verification.

## Alternative: browser-wide native descendant supervision

Reuse the existing `AuxTaskDescendantObserver` model, not its daemon instance: fresh native initialization before any browser child launch, one retained observer stream, native launch tickets, actual birth/audit identities, all unbound births tainting the stream, and actual matched original reaps. Integrate both content and native-message launch families; enumerate remaining browser-owned launch families before a whole-browser claim. Keep it alive through the existing authenticated phase-6 report/ACK/reaper lifetime, and close productive admission before waiting.

The current interface is explicitly `InitializeAtFreshDaemonEntry`; it cannot be reused by late-attaching to a running browser or observing sibling processes from the daemon. A separate actual browser-entry integration and complete process launch coverage are required. Existing source feasibility evidence records macOS 27 `es_new_descendants_client` requiring the restricted Endpoint Security entitlement; older ES clients additionally require root/FDA. This review grants none of those capabilities, establishes no entitlement availability, and performs no observer execution. ES still does not cover arbitrary launchd-delegated service work solely because it originated from a browser request.

## Recommended implementation order and honest gates

1. Implement the content early-helper receipt and conditional per-launch no-fork coverage. Preserve unknown for every bypass/unproved child. Reuse native generation, reservation, report and reaper owners.
2. Add a finite, actual root/FD/grant inventory to native-host launch; choose complete authority revocation where supported, otherwise browser-wide descendant custody. Do not silently disable password managers or widen root claims.
3. Tie delegated Metal/WebNN output authorities and actual browser cache tasks to their physical completion/irrevocable revocation, or preserve unknown for those exact reachable writes. Unrelated OS activity is not a drain requirement; Aux's own outstanding service request is.
4. Only then evaluate all existing participants together. Compilation, true policy application, allowed/denied operations, helper identity, native-host compatibility and actual shutdown/reopen remain acceptance work. The current packaged candidate and its authority flags remain unchanged.

No new callable source or claim of completed browser drain is delivered by this review.
