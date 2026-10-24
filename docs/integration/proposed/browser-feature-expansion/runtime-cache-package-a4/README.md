# Follow-up browser package: a4 preparation only

This directory prepares a new inactive package for the follow-up browser work. It contains no copied successful source pair, native build receipt, projection receipt, prepared recipe or assembly result. All `runtime-cache-package-a3` files and previous candidates remain untouched.

`bind_pair.py` and `link-tool-aliases.json` remain byte-identical to the **current root a3 implementations**. The a4 wrapper adds only the exact named research resource set and the reviewed final research/intermediate source checks. It retains the original feature/delivery validators, counted three-tool-alias exception, native guard/GN/toolchain checks, protected native inputs, unchanged module/import/private definitions, native CLI wrapper, unsigned product, cold refusal and unrelated-file comparisons. Exactly 16 named feature resource changes and the same three runtime leaves remain required: the previous 12 scripts plus the two research UI scripts, the existing extension manifest change and the existing CLI SEA change. No generic allowlist expansion is introduced.

The runtime leaves remain `runtime-bootstrap.cjs`, `runtime-seed.cjs` and the original `runtime-text-root.json` record with `mustBeAbsent: true`. The two helpers must match the immutable async overlay; the metadata cannot overwrite an existing leaf. No new daemon/host API change is introduced by this browser-only follow-up.

## Freeze conditions

`review.json` deliberately has **null SHA-256 values** for `projection` and `browserReceipt`. Every packaging/binding action resolves these pins and therefore refuses while they are pending. Do not substitute an old digest or copy an old success receipt into either reserved path.

After the actual operations succeed, the root integrator must inspect and freeze:

1. **Browser:** `/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-browser-features-full-build-20261023-a21/receipt.json`. Require a real successful unsigned full build, actual current native input/composition pins, and unchanged activation/refusal conditions. Hash this actual receipt into `inputs.browserReceipt.sha256`.
2. **Source projection:** `../async-daemon-projection-research-v1/actual-projection.json`, recorded from the actual fresh producer run at `/private/tmp/aux-browser-features-async-daemon-20261023-a2`. Require its actual composition/source/entry receipt hashes and current adapter pins, independent entry equality, unchanged loader and ordinary refusal, `productExecuted:false`, `runtimeAuthorityGranted:false` and `packaged:false`. The **final** source/entry hashes must equal the pinned `research-v1/manifest.json` outputs: `2b1db7cebd8a7296b871dafdc4eb63955bbc13b4cee133c3c809c82b465ca02c` and `cd7c8bb549b1187245ad3d6b308f9fd34512f3b7df0a45033126241161876438`. The composition must preserve all three stages (features → async-runtime-inspection → research-v1), including actual immutable async intermediate files with their original `dc41cebe…` / `b6aa1011…` hashes. The wrapper verifies the fixed research manifest, final hashes, intermediate hashes and their stage associations before binding or preparation. Hash the new actual review into `inputs.projection.sha256`.
3. **Native reuse:** retain the exact a3 plan/runner/host references already pinned in this review. The actual object/link results remain `/private/tmp/aux-runtime-cache-async-object-20261023-a3/results.json` and `/private/tmp/aux-runtime-cache-async-link-20261023-a3/results.json`. The unchanged binder revalidates actual successful receipts, current frozen operands and paired-module/import/private-definition boundaries. This is reuse of the real a3 link, not a new link claim. Do not run another relink just to change a receipt label.
4. **Stage pair:** require the completed real `out/browser-feature-stage-pair-20261023-a5` receipt, using its `baseline` and `desktop-v1` directories. Existing development configuration and exact resource gates remain in force. A changed delta count is a review failure, not permission to widen this template.

Commit the reviewed new receipt pins, clear `pendingInputs`, and keep all false acceptance/activation fields. Ensure the intended app destination and new recipe/source-pair output files are absent. An input change after freezing requires fresh review; never edit historical receipts to make a check pass.

## Integrator invocation

`commands.json` contains exact inert argument arrays in this order:

1. `bindPair`: create this directory's fresh `source-pair-final.json` from actual a3 native evidence plus the actual a21 browser and a2 source projection.
2. `prepareBase`: preserve the original final-local baseline app, generate the new exact runtime review and base recipe under this directory's `prepared/`.
3. `prepareFeature`: bind current native composition, new source composition, actual a3 daemon input manifest, and a5 baseline/feature stages.
4. `verify`: run the unchanged wrapper checks against the resulting feature recipe.
5. `assemble`: only after root inspects all actual deltas, assemble the fresh inactive candidate at `out/provided-candidate-browser-features-followup-20261023/Aux.app`.

The binder retains `nativeHostApiChanged:true` to describe the existing async host change relative to the protected predecessor, with `pairedModuleAbiChanged:false`. This does **not** mean this follow-up introduces another host change. Browser API changes are covered by the new browser receipt. The inherited runtime validator diagnostic mentions “a18”; its comparison is against this review's exact `browserReceipt` hash, so the selected a21 receipt is required. Original feature and legacy validator files remain unchanged.

## Validation and remaining boundaries

Worker checks were limited to copied binder/alias byte equality, Python syntax parsing, available unchanged review and a3 plan/runner/host pins, and reading the actual passed supplied-UI composition to compare its 14 changed script names against the exact reviewed set. Neither pending receipt was read as success. No freeze, bind, recipe preparation, full verification, assembly, native execution or product execution occurred in this lane.

A successful later package remains `testable:false`, `runtimeAuthorityGranted:false`, unsigned and unexecuted. Runtime acceptance, pending isolation/authority decisions, owner data, signing and release remain separate. The currently accepted UI/app is unchanged by this preparation.

## Measured resource expansion

The actual passed `/private/tmp/aux-feature-ui-review-20261023-a5/composition.json` lists 14 changed scripts. Their names exactly equal the prior 12 scripts plus `assets/session-composer-Dc0LRfZA.js` and `assets/ask-omnibox-panel-DkxXbN8c.js`. This is a source-composition measurement, not a complete staged resource comparison. `review.json` records that measurement's path/hash and the precise 16 destination names, retaining the existing manifest and CLI SEA destinations.

The wrapper now requires both a count of 16 and exact equality with those named destinations. The original `resource_deltas` implementation still computes and checks all actual baseline/feature resource bytes, modes, manifest restrictions, unchanged native CLI wrapper and unrelated resources. Final context actions were pending when this measurement was read; they are expected to alter the existing tab-search script only. Final a5 staging remains authoritative and must independently produce this exact named set. Extra resources, CSS/assets/addon changes, unexpected deletions or missing entries still fail.
