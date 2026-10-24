# Static daemon projection successor v2

This version appends refresh/skill physical cleanup and managed-producer settlement to the actual standard a1 source pair. Old producers, composers, projection output, native build inputs and packages remain untouched. The new producer is prepared for root execution; it executes only fixed static transforms and the original source projector, never generated product code.

## Fixed chain

The committed immutable review freezes 78 existing inputs, including a1 evidence/receipts, every historical intermediate output, inherited transitive inputs, and both new adapters with their helpers/anchors/manifests. Freeze adds this producer's six files and the selected Node executable/version. Every pin is checked before imports and again before final evidence. No caller-selected transform or arbitrary source hook is accepted.

Order is fixed:

1. Preserve the actual a1 six stages and 118 anchors exactly.
2. Append `refresh-and-skill`: 15 count-one edits.
3. Append `managed-producers`: 20 count-one edits.

Each ordinary/dormant leaf has **153 total anchors**, **121 additions since the original research a2 chain**, and **35 additions since a1**. Stage outputs are separately written and pinned. Complete replay begins at the original protected source/entry, rather than accepting a final hash as a substitute for derivation.

The a1 publisher seed/bootstrap are copied byte-identically. Their original input, upstream helper transformations, publisher overlay and counted edits remain recorded; only their new output paths change. Loader bytes remain unchanged. The original `profile-isolation-final/integration/project-entry.mjs` projects the final ordinary source into a separate directory, and the producer requires byte equality with the independently composed dormant leaf.

The prepared combined output hashes are:

- Ordinary: `2e35bf82a24e22a1a76b61fe7211c9a1bdbfb770f3e45ae689131eefae9f75ea`
- Dormant: `ebb32136d280406d02841c5f9fc3b08d2714b4384e70d0d690ca4bdd8bb1c8d7`
- Loader: `ec7ea0405f415d84e4afc695405eec07378d8c7233b926ffd9dd7db2edfed663`

## Root invocation

First integrate the refresh/skill and managed-producer commits at their fixed repository paths, then this producer. Select unused output/pin paths; neither operation overwrites or removes an existing output.

```sh
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v2/freeze.mjs /Users/rcourson/Documents/Vibe/web /private/tmp/aux-standard-daemon-projection-v2-a1-inputs.json /private/tmp/aux-standard-daemon-projection-v2-a1
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v2/produce.mjs /private/tmp/aux-standard-daemon-projection-v2-a1-inputs.json /private/tmp/aux-standard-daemon-projection-v2-a1
```

A failed run retains only its new partial directory for inspection; retry with fresh paths. `projection-evidence.json` is written only after actual independent projection equality and final frozen-input validation. All cold refusal/runtime-authority flags remain false. Final native pairing must include the new fresh descendant observer; the old host is not compatible with the skill marker removal. No build, signing, activation or provider check is implied by source projection.

## Strict package verifier integration

The composition keeps `format: aux.browser-features.daemon-source-composition.v1` and retains `upstreamComposition`, `upstreamCompositionSha256`, `upstreamAdapterInputs`, protected predecessor and old helper ancestry. `upstreamComposition` continues to identify original research a2; it is not silently replaced with a1.

New authenticated-by-pins ancestry fields identify a1:

- `previousStandardProjection` / `previousStandardProjectionSha256`.
- `previousStandardComposition` / `previousStandardCompositionSha256`.
- `previousStandardProjectionInputs` preserves its prior frozen dependency list.

The strict successor verifier should pin both prior documents and require `files[kind].stages[:6]` and `anchors[:118]` to equal a1 verbatim. It must also retain the original a2 three-stage/32-anchor checks. Every subsequent stage still requires exact count-one replay, stage hash and output byte agreement. New stage order is the original six followed by `refresh-and-skill`, then `managed-producers`; do not generalize the stage allowlist.

Per-leaf counts are `addedAnchorCount:121`, `appendedAnchorCount:35`, `previousAnchorCount:118`; global counts are `newAnchorCountPerLeaf:121`, `appendedAnchorCountPerLeaf:35`, `totalAnchorCountPerLeaf:153`. The final evidence format is explicitly `aux.standard-daemon-projection.actual.v2` and includes the three counts, `previousStandardProjectionSha256`, `publisherHelpersUnchanged:true`, and `freshDescendantObserverRequired:true`.

Helpers preserve all previous fields except new `output`; `previousOutput` records the a1 file. Require both output hashes to match, the original helper/publisher edit replay to remain exact, and the loader/source receipt/projector gates to remain intact. The source-pair/package tools must use a new pinned review of this version; the historical 118-anchor verifier should continue to reject it.

## Evidence at delivery

`prepare-review.mjs` composed the two fixed adapters in memory on actual pinned a1 ordinary and dormant bytes, independently replayed all 35 edits, and checked both resulting files with Node syntax-only in disposable temporary files. `review.json` records those measured hashes. Both new producer scripts also passed Node syntax checks.

The new freeze/produce sequence and original projector have not been executed by this worker. Root owns that actual evidence and exact native pairing. No product code, native compiler, provider request, OS grant or signing ran. Prior runtime limitations in both source lanes remain explicit; source composition cannot establish CLEAN or runtime acceptance.
