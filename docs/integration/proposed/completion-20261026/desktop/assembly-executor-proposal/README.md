# Reviewed static assembly executor proposal

`assemble.py` is source for the root integrator to review and run after the actual final build, resource/UI receipts and policy packet are frozen. It has **not** been executed. Python compilation and source structure were checked; no synthetic package/receipt or fixture assembly was created.

```
python3 docs/integration/proposed/completion-20261026/desktop/assembly-executor-proposal/assemble.py \
  --repository /Users/rcourson/Documents/Vibe/web \
  --plan <actual verified assembly-plan.json> \
  --plan-sha256 <reviewed actual plan SHA256> \
  --browser-inventory docs/integration/proposed/completion-20261026/integrator/browser-inventory-a7.json
```

The executor uses `inventory`, `digest`, `ref` and the paired `sha` implementation from the existing runtime-package-a1 module. The exact actual A18 receipt is pinned to `9d8514ca917fcf8f0b4a0c54bb2089894385fd13862686679f1d8ebf05837ba5`, its 11,201-leaf inventory to `03542e0336ecd93ee2f0b790905219d454288292f6ceeb236dc211e2b7852bab`. The actual frozen a7 whole-browser inventory is separately required (`1e0ecaac4cb75bf08f7961db76faeab15b2cb47584e283546b8689f2d5416d58`) and joined to its actual successful build receipt. Both original trees must match their complete inventories before copying and remain identical afterward.

The supplied plan is replayed through the current authoritative `integration/successor-assembly/prepare-assembly-plan.py` using its actual receipt pins and declared bootstrap/optional CU policy. The resulting complete plan must equal the reviewed input. Resource/UI receipt names and replacement counts come from that plan; no earlier a5/a6 source or fixed UI asset count is selected by the executor.

It creates one fresh temporary sibling under out/, clones the raw frozen browser then the exact accepted Aux subtree, verifies both copies, and applies only unique confined regular-file replacements. Replacement source hashes, lengths and modes and every existing target preimage are checked. Only the copied daemon/CLI `_CodeSignature/CodeResources` leaves are removed, against their exact A18 hashes/modes. It never strips another signature, runs codesign, launches an app, reads a profile/state home or initializes an installation.

The original memory policy remains only when its exact policy and helper bytes/length remain unchanged. Optional CU policy absence is retained explicitly as `CUlaunchPolicyPending:true` / `CUtestable:false`; no signed digest or native acceptance is synthesized. Existing signature requirements remain actual post-assembly gates.

Active bundle rows are updated against the actual staged leaves (hash, bytes, type, mode), including any newly delivered policy and the two historically unlisted native carrier leaves already present in the accepted inventory. Every original source/projection/receipt field remains historical and unchanged. `finalApp` and a new current completion section identify current inputs, plan, active manifest and false acceptance/production flags. The external full inventory covers bundle.json itself without a self-hash cycle.

Before atomic publication, every unchanged Aux leaf outside the exact replacement/seal/marker delta must equal A38, every browser leaf outside Aux must equal the frozen native inventory, every manifest row must equal the actual file/link, and every input must still match its pin. A complete external receipt is written before the temporary sibling is renamed to exactly `out/provided-candidate-completion-20261026-a1`. Failures retain their staging folder and failure receipt. Existing output and the original A38 are never overwritten.

A successful static receipt remains `testable:false`, `signed:false`, `executed:false`, `runtimeAccepted:false`, `productionReady:false` and `fullIdentityComplete:false`. It is not signing, launch or runtime approval.
