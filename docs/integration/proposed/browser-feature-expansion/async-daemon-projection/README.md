# Actual feature-plus-async-inspection daemon projection

`compose.mjs` produces new ordinary daemon source and a dormant native entry in a fresh `/private/tmp` directory. It reads the exact current a4 feature composition, receipts, source/entry and the approved async-inspection transformation; it never executes product modules or native bindings.

The utility actually reruns the original `integration/compose-daemon.mjs` into `feature-base/` and requires its source and independent entry to equal the current a4 outputs. It then replays the new async-inspection edits independently on ordinary source and the actual a4 projected entry. Final source/entry hashes must also equal the async lane's independently prepared outputs. The final composition records both stages and their original evidence, while its two top-level leaves retain the protected-startup source-pair input paths/hashes required by the package verifier. All feature and async anchors are actually replayed from those protected predecessors before writing success.

The 147 original feature adapter pins are retained verbatim and checked against current files, with root-relative async producer/helper/projection inputs added. Additional absolute staging inputs are pinned separately. The paired prepared seed/bootstrap outputs are verified and copied into the fresh `native/` directory; no installed or staged app is changed. The reviewed loader, ordinary cold refusal and dormant-entry refusal remain unchanged.

A new honest source receipt binds the final composition. The original `profile-isolation-final/integration/project-entry.mjs` then projects that actual new source. Its generated entry must match the independently adapted entry byte for byte, and its actual loader must match the protected predecessor. The original projector creates a new successful entry receipt rather than reusing or relabeling an old one.

## Actual run

Output: `/private/tmp/aux-browser-features-async-daemon-20261023-a1`.

`execution.json`, `actual-projection.json`, `actual-source-receipt.json` and `actual-entry-receipt.json` record the real successful composition/projection and hashes. Source hash: `dc41cebe8ad7dc4cac162226b1267b0ae7602727d05a781c59ff593afd537ef3`. Entry hash: `b6aa10117346544e02e636d4b45ebb0049b421f7c40210775afdd661c1309de9`. Loader hash remains `ec7ea0405f415d84e4afc695405eec07378d8c7233b926ffd9dd7db2edfed663`.

This successor requires the new async-inspection native method. Receipts truthfully mark `nativeAbiChanged:true` and `nativePairingPending:true`; the old unchanged-native-ABI binder must not substitute the old daemon link. Root must bind its actual new native link tuple, matching seed/bootstrap, source/entry and app build/package receipts. Cold activation and runtime authority remain false. No native build/link, signing, app launch, owner data, network, resource mutation or runtime payload execution occurred here. Syntax checks and the static original projector are the actual verification performed.

To reproduce, run `node compose.mjs /private/tmp/<fresh-name>` from this subtree. All recorded input hashes must still match; existing output directories are refused. Historical source, receipts and accepted app remain intact.
