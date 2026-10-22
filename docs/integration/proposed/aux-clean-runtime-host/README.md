# Clean-host preflight → exact runtime authority capture

This narrow inactive native producer composes the actual `AuxCleanHostPreflight` and `AuxRuntimeDataProtectionCapture`/`AuxRuntimeCapturedCommandContext`. It is compile-only protected/runtime source, not an installed host, JS factory, admitted selection or state2 startup path. No actual host inspection, Keychain call, key import, signing, owner state or provider operation runs in this slice.

`AuxCleanRuntimeHostContext.capture(policy:selection:)` performs this fixed sequence:

1. Validate immutable native policy and public selection scope/group pairing, runtime role (`daemon` or `cli`; migration is separate) and all four generated service/account selectors. There is no input path, arbitrary observation, foreign core, success callback or JS selector parameter.
2. Call the actual clean-host inspector: current code/signature/entitlements, reviewed images/import origins and fixed private home/scope. It has no environment acceptance override and rejects the old interposed host path.
3. Invoke the actual minimal runtime capture for exactly metadata/signing/KEM/wrapped-root Data Protection/read-one queries under the generated `.meta/.sig/.kem/.dk` accounts and explicit matching group.
4. Reinspect the same host policy immediately after those reads, **before** private-authority import; refuse mismatched observation fields.
5. Use the actual private runtime-context constructor path: validate each current target hash, metadata scheme, expected public keys and authenticated strict Aux-v2 wrapped root via the recovered implementation. No generic legacy reader, fresh authority factory, reset or fallback is called.
6. Reinspect host policy again after authority import/root validation, then return the privately constructed bound result with `runtime`, before/after host observations, and all admission/provenance flags false. There is no constructor that wraps an arbitrary caller core or captured observation into this result.

The result's `runtime:AuxRuntimeCapturedCommandContext` can feed the separate owned/scoped minimal runtime composition. This source does not attach a Node export, create a mutable process-global context, or import the external selected-journal binder. The input `AuxRuntimeSelection` remains supplied by a separately trusted native selected-manifest producer; validating its contents is not authenticating its origin or admitting a state cohort.

## Exact minimal graph and checks

`source-set.json` pins the **11 actual Swift logical inputs plus one C++ import-address bridge**, and records the separately typechecked current secure-store guard. No migration, old-name reader, fresh factory/journal, external terminal constructor, selection store or external binder is linked. The preflight and existing minimal runtime source files are used directly, without copies, private-access concatenation, source weakening or alternate core implementation.

Run `node docs/integration/proposed/aux-clean-runtime-host/verify.mjs` then `node docs/integration/proposed/aux-clean-runtime-host/check.mjs`.

The check compiles the address-only C++ bridge, the actual minimal clean-runtime library, and a separate public-pairing fixture with real separate source files through `scripts/native-build.py`/`/tmp/aux-build.lock`. The unexecuted library passes a raw case-insensitive reference-product substring absence scan. Seven pure public-pairing checks cover daemon/CLI pairing and mismatched scope/group/role/invalid policy. These use encoding-shaped synthetic public bytes; they make no cryptographic authority claim. The fixture never invokes `capture`, `inspect`, the protected reader or private context validator. Existing runtime/software and clean-host captured-identity fixtures remain separate evidence, not newly repeated here.

The root `646535044` secure-store change replaced its reference-name blacklist with a positive Aux-marker ASCII group guard. Only the stale preflight dependency/evidence hash and its own documentation pins are refreshed for that reviewed source. The current guard is separately typechecked in this composition check, without executing it or adding it to this minimal library. Its real same-scope capability/owned dispatcher composition is a separate lane.

## Explicit remaining boundaries

A real trusted native producer must authenticate the immutable host policy and selected manifest, own all writer/cohort admission, choose the approved clean route and lifetime, and associate each retained runtime/worker instance before this source may run. Exact self-hash policy pins require an independent authenticated producer, not recursive embedding in the same binary. No policy-trust Boolean, unsigned resource loader or native source factory that invents provenance is provided.

The clean preflight is a production-style hardened policy and refuses the existing get-task-allow/disabled-library-validation development route. Neither this compile nor earlier scoped development-signing approval changes that. Current group/entitlement/provisioning compatibility and actual hardware/read behavior remain unexecuted.

Repeated host observations are snapshots, not a race-free lifetime guard or proof of unchanged selected storage. Four independent Keychain reads are not an atomic multi-row snapshot. Genuine custody and state-cohort/source verification must hold through capture, import, context use and retirement; a valid code signature, matching content hashes or private directory does not supply them. The accepted app and native/SEA/CLI state2 refusal remain unchanged. `state2LaunchAuthorized`, `writerCustodyVerified` and `authorityProvenanceVerified` remain false; no startup code consumes this new source. No UI, root packaging or native checkout change occurred.
