# Fresh feature + async source producer (a2)

Prepare-only successor to `async-daemon-projection`; historical inputs and receipts remain unchanged. Run **after** the integrator finishes the Ask/Remix adapters and updates the current `providedStageInputs` inventory. The freeze captures current feature inputs (including navigation, composition and agent revisions) rather than requiring their historical a1 hashes. Immutable async transforms, helper bytes, projector dependencies and expected source/entry hashes retain their reviewed values.

From the root repository after committing the new adapters:

```sh
node docs/integration/proposed/browser-feature-expansion/async-daemon-projection-a2/freeze.mjs \
  /Users/rcourson/Documents/Vibe/web \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2.inputs.json \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2
node docs/integration/proposed/browser-feature-expansion/async-daemon-projection-a2/compose.mjs \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2.inputs.json \
  /private/tmp/aux-browser-features-async-daemon-20261023-a2
```

Both destinations must be fresh. Review the freeze before running compose; any subsequent pinned change refuses execution. The producer:

1. Actually invokes the existing `integration/compose-daemon.mjs` into a fresh `feature-base`. Requires its exact current adapter inventory to equal the freeze and its two generated leaves to match the immutable async overlay's input hashes (`4e5c2710…` source / `aba6ebad…` entry).
2. Independently applies the unchanged async transform to both fresh leaves. Requires count-checked edits and exact reviewed output hashes (`dc41cebe…` / `b6aa1011…`). Replays the complete protected-predecessor → feature → async anchor chain, retaining the original protected pair as the final composition's top-level predecessor.
3. Uses **the fresh base** adapter inventory plus the new producer and immutable helper inputs for final provenance. Copies only the exactly pinned async helpers. Syntax-checks prepared source, entry and helpers without evaluating product code.
4. Writes an honest new ordinary-source receipt, invokes the original dormant-entry projector on that actual new source, and requires byte equality with the independently adapted entry, unchanged loader, matching source-receipt association and the original refusal/dormant flags.

No native compile, linking, app assembly, app execution, signing or authority acceptance is performed here. Output retains `nativeAbiChanged:true` (the async host seam still requires its native implementation), `nativePairingPending:true`, `coldFeatureEnabled:false`, `runtimeAuthorityGranted:false`, `productExecuted:false` and `packaged:false`. Reusing the actual successful a3 daemon link is a separate integrator decision requiring verification that every frozen native operand and private ABI remains unchanged; this producer does not assert a successful pairing or fabricate a new link receipt.

Worker delivery validation: source inspection and `node --check` for these two producer scripts only. Neither freeze nor projection has been run by this lane, and no generated success evidence is included.
