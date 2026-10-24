# Standard isolation package v3 — exact snapshot-race successor

Prepared tools only. No actual review, source pair, binding, build, assembly, product run or signing is included. Package-v2 and all historical artifacts remain unchanged.

The native review found that a reserved child could bind and be reaped after the registry snapshot but before its copied entry was inspected. The old cohort count could then incorrectly remain zero. `browser-descendant-snapshot-race-a1` rereads the monotonic cohort count and sticky accounting uncertainty under the registry lock after scanning entries, while preserving the original admission observation. It does not clear uncertainty or infer descendant completion from a direct child exit.

This version copies v2's wrapper, binder, link aliases and root actual-result freeze helper (`26b9d950b`) byte-for-byte. Source projection and native daemon link validation are unchanged: the actual 153-anchor source checkpoint remains valid; six compiled native units, 13 objects, 48 Swift operands, original 50 imports/module, exact private definitions and frozen dependencies still pass through their existing validators. The exact16 resource, publisher helper, metadata, guard/GN and unsigned/no-runtime requirements remain intact.

The only validator change is in browser source replay:

1. Reconstruct the original 26-file source, GN transitions and compiler correction as before.
2. Replay the exact six-file/fourteen-edit descendant-uncertainty correction and require the actual a3 composition to equal a2 plus those six changes.
3. Replay only `browser-descendant-snapshot-race-a1`: exactly two named headers, two count-one edits, explicit before/after hashes and the reviewed patch hash. The starting bytes must match a3.
4. Require the final a4 composition to name the actual a3 predecessor, contain exactly those two source rows, and have exactly the same 220 input pins with only the two reviewed replacements. The real full-build receipt must reference that exact final composition/input manifest. No arbitrary extra layer is allowed.

## Root freeze and execution

Use the full package-v2 freeze procedure with the v3 tools and templates. Do not copy v2 success or review pins into a new receipt. Create a new root-owned `standard-review.json` and `review.json` only from actual final evidence. Update the final browser composition/full-input manifest and successful a4 receipt; retain the historical `browser.sourceComposition` and source changes used for original replay. The source projection and runtime helper output remain `/private/tmp/aux-standard-daemon-projection-20261024-a2`.

The new pinned references are `standardNativeDescendantComposition` (actual a3), `browserSnapshotRaceManifest` and `browserSnapshotRaceReplacements`. Existing `standardNativePredecessorComposition` must remain a2. The final `standardNativeComposition` and `browser.composition` must both reference a4. Templates contain null hashes for root to freeze; no executable `review.json` is supplied. The reserved a4 receipt path in the template is not a claim that this build has completed.

`freeze-review.py` refuses until the actual browser receipt passes, the source projection passes and all reserved outputs are fresh; it has not been run here. `commands.json` begins with that root-owned freeze step and then contains the unchanged command interface and sequence, redirected only to package-v3 and final browser a4. The historical wrapper/binder `--link-result` argument remains the compile aggregate; the strict validator separately authenticates the successful native daemon a3 link. Existing stages and the absent reserved app path may be reused only after the original complete staging/delta/relocation checks pass. Root exclusively executes the commands.

Checks in this lane were limited to Python syntax, unchanged source/link-validator ASTs, byte-identical copied tools, and literal replay of the two reviewed header edits against their pinned baselines. No native module, app, provider or lifecycle operation was executed. Runtime authority, testability and full drain proof remain false.
