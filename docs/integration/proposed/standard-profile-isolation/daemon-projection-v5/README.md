# Daemon projection v5: native credential lock and owned Meta lifetime

New source-only producer. Existing v4/a4 source, entry, loader, helper receipts, package and native inputs remain unchanged. No generated product module is imported. Root alone runs preparation, freezes exact inputs and invokes the original entry projector after reviewing the committed source adapters.

The fixed predecessor is the successful actual a4/182-anchor chain. Append exactly:

1. `native-credential-lock-a1`: one daemon capability adapter.
2. `meta-connection-lifetime-a1`: fourteen owned-context/connection lifetime adaptations.

Both ordinary source and independently transformed dormant entry preserve every prior anchor/stage and cold refusal. Planned result: **197 total anchors, 165 new anchors, 14 stages** per leaf. The original entry projector must independently produce byte-identical dormant entry and unchanged native loader. The runtime seed/bootstrap publisher helpers are copied only after their original derivations replay unchanged.

The ChatGPT shim is a separate artifact: retain the original four-anchor `chatgpt-login` derivation and append exactly five native credential-lock edits. Replay all nine from the original vendor input. The shim is never executed; its native host pair remains required.

## Fixed artifacts and checks

`contract.mjs` names the only accepted predecessor, stage modules/exports, committed overlay digests, complete source dependency lists and shim derivation. No arbitrary adapter path or stage allow-list is accepted.

`prepare-review.mjs` verifies the actual previous evidence, composition, source/entry/loader/helper and shim receipts. It pins every historical input and each new overlay dependency, replays each lane's isolated reviewed a4 transform, then measures the ordered combined transforms. It syntax-checks the new source, entry and shim as text in disposable temporary files. It creates immutable preparation/review files only in this new producer subtree. It does not run the product or entry projector.

`freeze.mjs` pins preparation, producer, original projector dependencies and the exact Node binary to a fresh direct `/private/tmp` output. `produce.mjs` replays the entire original source chain, appends only reviewed stages and requires every measured hash/count. It copies predecessor evidence, emits new receipts and invokes the original static projector. All input pins are rechecked before and after projection. Cold enablement, runtime authority, product execution and packaging remain false.

## Root invocation

After both source overlays and these tools are committed to root:

```sh
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v5/prepare-review.mjs
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v5/freeze.mjs /Users/rcourson/Documents/Vibe/web /private/tmp/aux-standard-daemon-v5-inputs.json /private/tmp/aux-standard-daemon-projection-20261024-a5
node docs/integration/proposed/standard-profile-isolation/daemon-projection-v5/produce.mjs /private/tmp/aux-standard-daemon-v5-inputs.json /private/tmp/aux-standard-daemon-projection-20261024-a5
```

Use fresh paths; preparation and freeze refuse overwrite. Root records the actual resulting evidence rather than treating this source proposal as execution evidence.

## Receipt contract for the package successor

- Formats advance only for this producer: immutable/inputs/actual `.v5`.
- `previousProviderProjection`, `previousProviderComposition` and corresponding SHA/input/stage/artifact fields bind actual a4. Earlier `previousInteractive`, `previousManaged`, `previousStandard`, original async/research and 32-anchor ancestry remain unchanged.
- `files[*]` retains exactly 182 previous anchors and adds 15; `previousAnchorCount=182`, `appendedAnchorCount=15`, `addedAnchorCount=165`. The new stage names are exactly `native-credential-lock` then `meta-connection-lifetime`.
- `artifacts` contains one `chatgpt-shim`, original input plus nine full anchors, with two explicit derivation stages and `previousArtifact` copied from a4. `previousAnchorCount=4`, `appendedAnchorCount=5`. `chatgpt-shim-receipt.json` is `aux.standard-chatgpt-shim.derivation.v2` and binds prior receipt, full nine-anchor hash and appended five-anchor hash.
- Final source/actual evidence includes `nativeCredentialLockRequired=true`, `ownedMetaContextRequired=true`, `freshDescendantObserverRequired=true`, `nativePairingPending=true`. They identify required paired native work, not proof it was compiled or accepted.
- Package integration must verify the matching new native host and browser/protocol tuple separately. It must not replace source into the older package and retain its old native receipt.

Worker validation is syntax of the producer tools only. Root preparation, original projector, native pairing, package assembly and real app/provider behavior are separate unrun gates here.
