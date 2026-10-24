# Content child applied-policy acknowledgment, v1

Inactive source successor against the exact selected a4 native inputs pinned in `manifest.json`. Thirteen files (ten modified, three new), 44 count-one adaptations. No existing native tree, GN file, frozen source/stage/package, product process, signing or owner state changed. `verify.py` performed one static exact replay and policy-input pin check; no native compilation or runtime acceptance is claimed.

## Implemented path

1. The actual sandboxed content launcher obtains a retained native launch binding through `ContentBrowserClient::CaptureAuxSandboxLaunchBinding`. Default/nonprotected/non-Mac embedders return unavailable. The Chrome implementation uses actual admitted generation, held browser roots and fixed native helper selection; no renderer supplies a path, process, generation or proof.
2. Binding capture refuses a subprocess override, inherited/explicit DYLD loader injection, stale/closed admission, invalid roots and a helper without a valid static code signature. It pins the actual selected canonical executable, held file identity and its exact code-directory identity. This does not sign anything or permit unsigned code as trusted. Package identity/signing authorization remains a separate gate.
3. The parent creates a dedicated CLOEXEC receipt pipe, a random per-launch challenge and generation envelope. Only the child's write endpoint is explicitly inherited. The original policy pipe carries the envelope after its original policy payload. The channel belongs to this launch, never a caller-selected PID or shared registry lookup.
4. `SeatbeltExecServer::InitializeSandbox` reads that envelope, closes the input channel, applies the actual serialized policy, and only on success echoes the envelope and the **exact applied policy bytes**. This is stronger than merely echoing a policy name/hash supplied separately. It closes its receipt endpoint before returning to the existing helper main, which has not yet loaded the browser framework.
5. A native ThreadPool reader retains the channel, native binding and original launch record. It performs bounded nonblocking receipt reads; missing/failed/oversized/late receipt stays unqualified. Limits bound receipt availability only, never declare a writer settled. The worker closes its resources on physical return, including when posting fails. No browser UI pointer is retained across the read.
6. Under the original launch record's sole-reaper mutex, the retained binding verifies exact native PID birth, canonical executing path and live code identity against its captured fixed helper, then rechecks native generation/roots. This prevents ordinary PID reuse while validating: the original wait/reap cannot run concurrently under that same mutex. The private inherited endpoint plus challenge and this native identity check authenticate the reply; a PID or child-reported success alone does not.

## Finite renderer descendant qualification

The native launcher marks only the actual `sandbox::mojom::Sandbox::kRenderer` path as eligible. `policy-inputs.json` pins `GetSandboxProfile`, the common policy, renderer suffix and parameter setup. Their native construction uses deny-default, no process-fork allowance and no process-right grant extension; renderer parameters add no custom policy suffix. No policy is weakened or rebuilt for this feature. The receipt must match precisely the bytes that this launcher actually serialized/sent, including a cached policy's actual bytes.

An eligible authenticated receipt records `descendants_denied` for **that launch only**. Its counter is discharged only in `ReleaseLocked` after the existing sole reaper's matched physical terminal evidence. Inherited/later descriptors held only by that process close on its reap; they are not a reason to invent unknown descendants. Re-exec remains within that original process lifetime and the installed sandbox. Missing receipt, failed signature/native identity, closed generation, uncertain birth/reap, policy bypass and all other sandbox classes keep their existing uncertainty. No arbitrary callback, timeout or send result can decrement the cohort counter.

`all_writer_coverage` stays false. The receipt does not settle browser-side broker requests or actual delegated admitted-root writes. Those remain their existing participants. Ordinary OS cache activity is not added as a new drain obligation. Renderer policy has no read-write Metal cache-extension issue rule; this slice does not infer an admitted-root write gap from unrelated font/CVMS system activity. GPU/network/WebNN/native-host policy qualification remains separate and unchanged.

## Root integration request

Apply the ordered `anchors.json` to their exact baseline inputs, add the three new files from `source/`, and compare every output hash. `source.patch` is the equivalent unified patch. Do not apply this to an earlier same-name source version.

Root owns shared GN/registration:

- Add `chrome/browser/aux/AuxContentPolicyBinding.{h,cc}` to the existing Mac native browser platform target that already owns `AuxSelectedStateHome` and `AuxBrowserPrivateRoots`. That target needs existing `//base`, content public headers, CoreFoundation/Security framework linkage and libproc (system); reuse existing target dependencies rather than create a second owner.
- Expose `content/public/browser/aux_sandbox_launch_binding.h` through the existing content public browser target/header inventory. No C/JS/NAPI endpoint or generated API schema is introduced.
- Existing `sandbox/mac/seatbelt_exec.{h,cc}` remain in their existing seatbelt target and use only C++/Darwin system APIs; no added crypto/shared-library dependency. The fixed helper already calls `InitializeSandbox` before loading the framework, so its unchanged main is a pinned integration precondition.
- Rebuild the actual browser, seatbelt component and applicable fixed helper executables together. Updating only the parent or only the helper cannot supply a qualifying receipt. Preserve native-generation/cold/profile authority gates.

Suggested serialized focused compilation: affected seatbelt object, content launcher/lifetime consumers, content/browser client, Chrome browser client and new native binding object; then root's existing complete browser/helper build. Use `scripts/native-build.py`; worker ran no compiler. Exact targets/object paths must come from the current root GN graph, not a guessed build directory.

## Acceptance and remaining limits

Static exact replay/pins passed. Still required: compile/link; receipt arriving before framework work; exact-policy/challenge/generation mismatch refusal; missing ACK and bypass remain unknown; helper signature/identity validation for the eventual approved package; original renderer reap clears exactly its own qualified cohort; other cohorts stay unknown. One bounded native fixture and real disposable shutdown/reopen check should cover these boundaries after the source is integrated and lifecycle execution is authorized.

The current unsigned package cannot be declared trusted merely because these source checks exist. Valid code identity from the reviewed package is a capability requirement, not a request or permission to sign. No unsigned-path fallback or new developer identity was added.

Other policy classes and native messaging remain unqualified. Their remaining checks are finite: actual no-fork policy eligibility where applicable, real launch identity/receipt, and separate completion of any concrete admitted-root authority delegated out of the process. The renderer's actual broker work remains with existing browser owners; this implementation neither manufactures its completion nor expands the drain to unrelated shared OS state.
