# Inactive runtime-cache package successor

This is preparation tooling, not a package or runtime acceptance receipt. No assembly was run in this lane. The a18 full browser receipt and existing source/entry projection are real; the corrected daemon relink and final review pins were pending when prepared.

The original `package/feature_package.py`, `package/prepare_base.py`, and delivery `package/assemble.py` remain unchanged. The wrapper imports those exact pinned files. It replaces only `legacy.runtime_changes` with a three-leaf validator and wraps feature verification with additional review, actual relink, and exact 14-resource checks. All original guard/GN replay, toolchain alias, protected daemon frozen input, native inventory/signature, source pairing, CLI wrapper, addon, feature delta and unrelated-resource comparisons still run.

The three exact runtime leaves are:

- `runtime-bootstrap.cjs`: original final-local baseline hash → independently projected async bootstrap hash.
- `runtime-seed.cjs`: original seed hash → independently projected async seed hash.
- `runtime-text-root.json`: the original reviewed bytes and original `mustBeAbsent: true`, `previousSha256: null` record, unchanged. It cannot overwrite an existing leaf.

These sit under `Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native/`. No runtime archive/executable changes are permitted by this exception. Every old runtime review/evidence pin is still checked by the original validator before constructing the successor records.

## Final review prerequisite

`review.json` intentionally has `relink: null`; no packaging command can pass in this state. After the corrected a2 subtree is frozen, the integrator reviews it and replaces that field with exactly three `{path, sha256}` references named `plan`, `runner`, and `host`, matching the absolute reserved paths already in the review. Commit that exact review before preparing recipes. Do not point these fields at a1 or relabel old evidence. The sourcepair must explicitly say `nativeHostApiChanged: true` and `pairedModuleAbiChanged: false` and bind the actual new successful daemon link plus the exact a18 full browser receipt.

The real a2 object `results.json` is used as compile/link evidence; it is never described as runtime integration evidence. Its successful plan/runner binding, dependencies, stable inputs, unchanged PTY module/import/private-definition boundaries and actual output hashes are mandatory. Missing or failed actual receipts block preparation. Native pending/cold authority flags stay false.

## Integrator command sequence

Run from the repository root after the actual a2 compile/link has passed. All variables below name real existing reviewed inputs. `PAIR` is a freshly bound sourcepair, not the old unchanged-native binder output. The source/entry pair must be the actual async projection (`dc41ce…` / `b6aa101…`) and the projected entry receipt must refer to its own generated entry path. The old protected predecessor remains the top-level daemon composition predecessor.

```sh
TOOL=docs/integration/proposed/browser-feature-expansion/runtime-cache-package/cache_package.py
PROJECTION=/private/tmp/aux-browser-features-async-daemon-20261023-a1
RELINK=/private/tmp/aux-runtime-cache-async-object-20261023-a2
LINK=/private/tmp/aux-runtime-cache-async-link-20261023-a2
BROWSER=/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-browser-features-full-build-20261023-a18/receipt.json
PLAN=docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-relink-a2/plan.json
```

Set `REVIEW_OUTPUT` to a fresh review directory, `PAIR` to the actual new sourcepair, `PTY` to the unchanged paired module, `NATIVE_COMPOSITION` to the exact composition bound in a18 inputs, and `BASELINE_STAGE` / `FEATURE_STAGE` to the completed stage-pair a4 directories. Check the stage pair's real directory names; do not infer completion from directory existence.

```sh
python3 "$TOOL" check-inputs
python3 "$TOOL" prepare-base \
  --link-result "$RELINK/results.json" --relink-plan "$PLAN" \
  --runtime-manifest "$REVIEW_OUTPUT/runtime-integration.json" \
  --baseline-app "$PWD/out/provided-candidate-final-local-completion-20261023/Aux.app" \
  --native-receipt "$BROWSER" --daemon-receipt "$LINK/results.json" \
  --source-pair "$PAIR" \
  --source "$PROJECTION/index.mjs" --source-receipt "$PROJECTION/source-receipt.json" \
  --entry "$PROJECTION/projected-entry/aux-native-entry.mjs" \
  --entry-receipt "$PROJECTION/projected-entry/results.json" \
  --loader "$PROJECTION/projected-entry/aux-owned-native.cjs" --pty "$PTY" \
  --output "$PWD/out/provided-candidate-browser-features-cache-20261023" \
  --recipe "$REVIEW_OUTPUT/base-recipe.json"
python3 "$TOOL" prepare \
  --base-recipe "$REVIEW_OUTPUT/base-recipe.json" \
  --native-composition "$NATIVE_COMPOSITION" \
  --daemon-composition "$PROJECTION/composition.json" \
  --daemon-inputs "$RELINK/daemon-inputs.json" \
  --baseline-stage "$BASELINE_STAGE" --feature-stage "$FEATURE_STAGE" \
  --recipe "$REVIEW_OUTPUT/feature-recipe.json"
python3 "$TOOL" verify "$REVIEW_OUTPUT/feature-recipe.json"
```

Only the integrator, after inspecting all actual deltas, may run:

```sh
python3 "$TOOL" assemble "$REVIEW_OUTPUT/feature-recipe.json"
```

The final fresh app path is `out/provided-candidate-browser-features-cache-20261023/Aux.app`. Assembly retains `testable: false`, `runtimeAuthorityGranted: false`, unsigned product, unexecuted app and unchanged accepted app. The new recipe pins the wrapper and review; runtime metadata pins them again. Existing assembly rechecks inputs after copying and compares every unrelated leaf. Runtime acceptance, mandatory custody, atomic publisher, owner state, signing and release remain separate unresolved boundaries.
