# Standard-isolation successor: binding and package review

This is an inactive integration review, not a prepared package or passing receipt. Root owns successor packager implementation, receipt freezing, staging, binding and assembly. This lane only read existing source/evidence and wrote these three review files. Accepted app, a21/a4 checkpoint, validators, stages and native inputs stay untouched.

## Evidence and reserved outputs

The actual independent projection at `/private/tmp/aux-standard-daemon-projection-20261024-a1` passed source replay/projection. Ordinary SHA-256 is `00607ee3555eb8c8c8f6d7641d93ac009ca9a3b4e2fc7444dfe898109d9d863c`; dormant is `fe85ca92a82b957f61727729ba61ca732d061df8534f3f64a3afd2a2af5c0400`; unchanged loader is `ec7ea0405f415d84e4afc695405eec07378d8c7233b926ffd9dd7db2edfed663`. This proves source derivation, not executable compatibility.

Six C++ objects were compiled in `/private/tmp/aux-standard-daemon-objects-20261023-a2`. Its aggregate `results.json` remains **passed:false** because the subsequent link failed. Six dependency scans and six exact compilation records each exit zero. Never rewrite that failed aggregate or call it a successful complete build.

The fresh link is reserved at `/private/tmp/aux-standard-daemon-link-20261023-a3/results.json`, using `integration/daemon-link-a3-inputs.json`. Binding waits for real success and verifies current frozen operands. The browser receipt at `/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-standard-profile-browser-build-20261023-a2/receipt.json` was prepared and **passed:false** at inspection. Existence is not success: require the completed full build and stable unsigned inventory.

Root reserved staging `out/standard-profile-stage-pair-20261024-a1/{baseline,desktop-v1}` and fresh app `out/provided-candidate-standard-profile-isolation-20261024/Aux.app`. Neither was run here. `review.json` pins available inputs and exact changed sets; pending evidence has descriptive status, not fake/null success digests. Root freezes actual successful receipts and successor tools in a new review. Changed inputs require fresh review, not relabeled evidence.

## 1. Native receipt and exact closure

The a4 `cache_package.py::verify_link` only accepts `aux.runtime-cache-async-relink.result.v1`, one `newSource`, one compile command and three plan/runner/host references. Introduce a versioned validator for actual `aux.standard-daemon.compile.v1` compile records plus the separate `aux.profile-isolation.continuation.link.v1` success. Do not manufacture the old receipt format.

Require these predicates together:

- Actual compile receipt binds `native-build-a2.json`. Six named compile commands and six dependency scans match reviewed argv and exit zero. Current object hashes match the fresh a3 manifest. Keep failed aggregate link history explicit. Validate dependency closures and all current frozen inputs with the existing compiler/three-link-tool symlink rules.
- Exact native units: main, node-runner, worker-host, observer, parent-bridge, peer-transport. Five object replacements appear in `review.json`; observer.o is one addition. Actual ordered link argv has **13 .o operands and 48 Swift sources**. Root corrected stale object-count metadata 12 before execution. Counts alone are insufficient.
- Five changed Swift operands are exactly composed AuxOwnedCommandDispatcher.swift, AuxNativeFreshStageCoordinator.swift, AuxFreshColdInstallerGuard.swift, AuxDevelopmentOwnerDrain.swift, AuxBrowserFreshRootAdmission.swift. Keep other Swift/object/library operands exact. Require the selected frozen EndpointSecurity dependency; linking does not establish entitlement.
- Every protected `daemon-inputs.json.frozenFiles` entry remains with its original digest. Inspection found no missing/changed old entries. Separately verify ordered selected substitutions: historical old object pins are retained evidence, not proof of which object is linked.
- Fresh link receipt requires passed:true, inputsUnchanged:true, signed:false, policyActivated:false, exact manifest and unchanged link-daemon.py recipe digests, exact argv/output and current executable hash. Bind compile plan, source composition, object hashes and link receipt into the new pair. Keep execution/activation false.
- Module bytes and resolvedModuleImports equal the protected predecessor exactly. Preserve the seven old private definitions and add exactly `_AuxDevelopmentOwnerCleanSettlementStatus`, `_AuxObserveDevelopmentMainLoopReturned`, `_AuxCompleteDevelopmentOwnerBrowserCleanShutdown` in reviewed order. The original checker must prove all ten privately bound. No wildcard, missing symbol, general superset or removal of the old validation.

## 2. Source pair

The a4 research validator expects three stages and final research hashes. The successor has exactly `features → async-runtime-inspection → research-v1 → background-writers → daemon-shutdown → runtime-coordination`. Preserve original protected predecessor paths/hashes, first three stages and their source pins. Independently replay **36 + 35 + 15 = 86** new counted anchors on ordinary and expected dormant entry; verify every intermediate association/hash and adapter/helper pin.

Use actual source receipt and original projector's `projected-entry/results.json`, associating receipt hashes to composition/source. Require independent entry equality, cold refusal, no execution, unchanged loader and paired module. Only a new bound pair after genuine new daemon/browser success may set nativePairingPending:false; keep source-only evidence intact. Record nativeHostApiChanged:true, nativeAbiChanged:true, pairedModuleAbiChanged:false using the actual new daemon. The binder hardcodes the old feature composition path; select/pin the standard browser composition explicitly without weakening predecessor/receipt checks.

## 3. Exactly three runtime leaves

Keep precisely three package leaves: runtime-bootstrap.cjs replacement, runtime-seed.cjs replacement, and original runtime-text-root.json added only where absent in the original baseline. Projected publisher outputs are:

- Bootstrap `da30c2b0445af81b3d3ff53fc82f7c93f589e34c3a7756e9f92ef38fab34c5e4` from immutable async `13657bf3…`.
- Seed `4b202aa8a73843502fa19dd22df2c326c5bf1890fa955b9e3b815028f58d8e2f` from immutable async `54bd9cf6…`.

Verify old async edits then the exact publisher overlay, projected helper paths/hashes, matching native-composition helper bytes and paired native APIs. Preserve original baseline previousSha256, mode 0644 and metadata mustBeAbsent:true. New C++ includes do not add package resources. Adapt old async helper-output validation only to this exact reviewed successor.

Retain original text-root metadata hash `225e0eb0faad6e021a6ed181d6b07a262e6ec43a053a6103c804b3aae2d27be6`. Its root names `provided-candidate-final-local-completion-20261023/Aux.app/.../agent-runtime`, matching unchanged copied runtime text bytes. It is a source-text relocation descriptor, not the new app destination. Do not replace it with new finalApp. New stages supply only Agent and CLI deltas, never runtime/addon/native trees.

## 4. Browser and guards

Require completed full standard browser receipt, exact nativeInputPinsPath/hash/contents and `integration/browser-composition-a2.json` bound by featureCompositionSha256. All 220 feature pins and full frozen map must match actual selected sources. Also bind standard source composition and original feature lineage: a2 composition's files lists only its final one-file compile repair, not all 25 projected browser files.

The standard source composition has 26 entries: **25 browser files plus daemon/AuxNativeParentConnectionBridge.cc**. The latter enters the daemon object, not Chromium. Exactly three prior feature pins change: chrome/browser/ui/BUILD.gn, aux_owned_browser_quiesce.cc and .h. Preserve other feature pins and require exact reviewed before/after chains for browser drain/session/messaging/child-lifetime sources and GN registrations, never arbitrary overrides.

The old custody barrier set has no intersection with these changes. Keep verify_guarded_native, the original three-file AuxSelectedStateHome/aux BUILD.gn transition replay, original GN inverses and toolchain/defense checks unchanged. No broad guard exception is needed.

## 5. Stage, resources and assembly

Run existing stage_pair.py once on the pinned static snapshot with **exact new finalApp for both stages** and development cloud configuration. This is local configuration, not activation. Require identical current stager/adapter/brand inputs, cloud policy, finalApp values and actual inventories; pin completed stage receipt only after success.

Diff against **original final-local baseline app**, not a4 (which already contains metadata). Require the same exact named **16 resource deltas**: 14 supplied Agent scripts, version-only Agent manifest, CLI SEA. Keep unchanged CSS/assets/addons, extension identity/permissions, native CLI wrapper and unrelated files/modes. A new delta is a stopped review, not permission to widen the set. Fresh staging has not established these deltas yet.

Create new base/feature recipes with pinned wrapper/review references; leave a4 immutable. Keep assembler source-pair, unsigned Mach-O/inventory, metadata absence, module ABI/import and frozen-input gates. Verify then assemble into absent fresh output; check actual final hashes against recipes. Packaging remains testable:false, runtimeAuthorityGranted:false, coldFeatureEnabled:false, unsigned and unexecuted. It does not establish entitlement/runtime acceptance.

## Commands and root handoff

commands.json gives inert argument arrays for the reserved paths. Only stagePair references an existing tool. Other arrays specify required interfaces for root's **not-yet-implemented standard-profile-isolation/package-successor tools**, not runnable commands today. Native validation takes separate --compile-result, --compile-plan, --link-inputs and --link-result; never treat the failed compile aggregate as successful link evidence.

Root sequence: implement/pin narrow successor adapters; freeze actual successful browser/link receipts; stage; inspect real deltas; bind pair; prepare base; prepare feature; verify; assemble. Create prepared/ parent before preparation; all recipe/app outputs must be absent. No signing, grants, launch, cloud or owner-data operation belongs here.
