# Fixed research-v1 successor projection — preparation only

This is a separate optional successor to `async-daemon-projection-a2`, which remains unchanged. The integrator selects this producer only after reviewing and landing the explicit research implementation and current stage adapter inventory. It does not accept a caller-selected transform module.

The fixed contract is:

- `docs/integration/proposed/browser-feature-expansion/research-v1/source/aux-research-daemon.mjs` exports `transformAuxResearchDaemon(text) -> {text, changes:[{find,replace,count:1}]}`. All modifications, including helper insertion, must be covered by nonempty count-one anchors. The module reads only its fixed sibling `source/research-runtime.js` in addition to Node builtins; that runtime source is separately pinned and appended into the product bytes, with no new external product module dependency.
- `docs/integration/proposed/browser-feature-expansion/research-v1/manifest.json` has exactly two `daemonInputs` records, each `{kind:'source'|'entry',inputSha256,outputSha256}`. Inputs must be the immutable async source (`dc41cebe8ad7dc4cac162226b1267b0ae7602727d05a781c59ff593afd537ef3`) and dormant entry (`b6aa10117346544e02e636d4b45ebb0049b421f7c40210775afdd661c1309de9`). Outputs must be real reviewed deterministic research results, not placeholders or old receipts.

The freeze pins this fixed module, runtime sibling and manifest, the new producer scripts, all current feature adapters, original projection dependencies and immutable async inputs. Missing, malformed or placeholder research hashes refuse freezing. The composer subsequently checks every frozen file before and after producing artifacts.

## Integrator sequence

After all research/Ask/Remix adapter edits and `providedStageInputs` updates are complete, run from the root repository:

```sh
node docs/integration/proposed/browser-feature-expansion/async-daemon-projection-research-v1/freeze.mjs \
  /Users/rcourson/Documents/Vibe/web \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2.inputs.json \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2
node docs/integration/proposed/browser-feature-expansion/async-daemon-projection-research-v1/compose.mjs \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2.inputs.json \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2
```

Both destinations must be fresh; do not overwrite a prior a2 run. If a2 has already been produced, choose fresh absolute `/private/tmp` paths, then update the pending package review before running anything. Review the actual frozen inputs between commands.

Composition runs the actual existing feature producer first and requires its ordinary and independent dormant output hashes to remain `4e5c2710…` and `aba6ebad…`. It then applies the unchanged async transform and requires the exact immutable `dc41cebe…` / `b6aa1011…` outputs. Only then does it apply the fixed reviewed research transform separately to both leaves. Its edits are replayed and compared to the module result and reviewed final hashes.

`async-index.mjs` and `async-native-entry.mjs` retain the exact intermediate async leaves. Final `index.mjs` and independently expected `aux-native-entry.mjs` are research successors. The final composition records all three stages and replays their complete anchors from the exact original protected predecessor. Current base adapter provenance is captured anew; historical adapter hashes and receipts are never relabeled.

The original dormant-entry projector then runs on the final ordinary source. Its actual generated entry must exactly match the independently transformed final entry, with the original loader and cold-refusal association preserved. Final source/entry receipts and projection evidence are written only by the real producer run. Syntax checks do not evaluate product code.

## Native and package boundaries

No native compile, link, product execution, signing or packaging is performed by these tools. The already successful native host/daemon a3 link may be reused only after the integrator independently verifies all frozen native operands and paired ABI. Output still records `nativePairingPending:true`, `coldFeatureEnabled:false`, `runtimeAuthorityGranted:false`, `productExecuted:false` and `packaged:false`.

A research-aware package review must bind the new actual final source/entry receipts; it must not keep instructions asserting that the **final** leaves are the old async intermediate hashes. Those hashes remain mandatory intermediate checks here. Runtime helper hashes, loader, native module/import checks and existing package guard policies do not change.

This lane prepares tooling only. No freeze, composition, projection, native build or app operation has run, and no success receipt is included. Validation is limited to producer source inspection and syntax checking.
