# Combined standard-isolation daemon source review

This inactive composer applies the exact selected research ordinary and independently projected dormant source through these reviewed transforms, in order:

1. `background-writers` — 36 count-one edits.
2. `daemon-shutdown` — 35 count-one edits.
3. `runtime-coordination` — 15 count-one edits.

Both compositions passed independent literal edit replay and full-source syntax checks. **No interaction/count conflicts were found.** No anchor counts or predecessor pins were weakened. Runtime coordination's original research-only evidence remains historical; `review.json` records this new combined chain separately.

Final source SHA-256: `00607ee3555eb8c8c8f6d7641d93ac009ca9a3b4e2fc7444dfe898109d9d863c`.
Final dormant entry SHA-256: `fe85ca92a82b957f61727729ba61ca732d061df8534f3f64a3afd2a2af5c0400`.
Original loader SHA-256: `ec7ea0405f415d84e4afc695405eec07378d8c7233b926ffd9dd7db2edfed663`, unchanged.

## Integrator interface

`composeAuxDaemonPair({workspace})` in `compose.mjs` returns `{outputs:{source,entry,loader},receipt}` in memory. Workspace defaults to the pinned root checkout; all fixed transform modules and their transitive JSON/helper inputs are hash-checked before import and again after composition. No arbitrary transform hook is accepted. Each returned adapter edit is independently replayed literally with exactly one occurrence; a transform that changes replacement semantics, disagrees with replay or changes any pinned input fails.

`checkAuxDaemonComposition({workspace})` additionally syntax-checks both outputs using disposable temporary files, removes those files and returns the review receipt. It never imports or executes either product module.

CLI review only:

```sh
node docs/integration/proposed/standard-profile-isolation/daemon-composition/compose.mjs \
  --receipt /absolute/new-review.json
```

The receipt is created exclusively (`wx`), so the earlier review cannot be overwritten. The CLI never writes a source stage, loader, package or native tree.

`inputs.json` pins the selected research source/entry, original loader, upstream composition, source receipt, original entry receipt and projection evidence. `review.json` preserves these as upstream evidence, followed by each actual intermediate hash/count and final output hash. None of the prior stages or receipts is relabeled as proof of the successor.

## Still required at root integration

- Run the original source-to-dormant projector on the newly composed ordinary source and require exact equality with the independently composed dormant output. This check has **not** been run by this worker; the receipt explicitly says so.
- Couple new source/entry receipts to the freshly composed native host, publisher/runtime coordination, restart recovery and browser drain ABI. The previous native host cannot serve as this source's pairing evidence.
- Preserve the unchanged loader bytes and produce a fresh final source pair/package receipt. Do not replace existing a21/a4 stages or old projection receipts in place.
- Real native compilation/linking and disposable lifecycle acceptance remain separate. The actual unknown descendant/provider/event-writer boundaries documented by the component overlays are not solved by successful composition or syntax.

No product execution, provider call, owner data, browser lifecycle, native build, signing or release operation occurred.
