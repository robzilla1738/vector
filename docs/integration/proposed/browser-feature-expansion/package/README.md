# Inactive desktop feature package recipe

This tooling prepares and assembles a **new inactive candidate** after the native full build succeeds. It does not build, sign, launch, shut down, restart, install, replace an accepted app, activate protected startup, or establish runtime acceptance. The final receipt always records `testable:false` and `runtimeAuthorityGranted:false`.

## Inputs still required

- A successful fresh **full native app** receipt in `aux.chromium.unsigned-full-build.v1` format. Object-only feature compile receipts cannot substitute. Its `nativeInputPinsPath` and matching hashes must bind the exact current feature composition and every feature input; the complete app inventory, unsigned Mach-O evidence and original shared-link checks remain required.
- The current paired feature daemon source and dormant entry, genuine source/entry projection receipts, exact native daemon/link receipt and frozen native inputs, source-pair tuple, unchanged loader and PTY, and runtime integration manifest/evidence. A syntax-only feature source composition is insufficient. Reuse of the successful protected-startup native daemon link is valid when all actual frozen native inputs remain identical; no new link evidence is invented.
- Two newly staged supplied trees from the **same current pinned inputs**, one `baseline` and one `desktop-v1`, with Aux identity version 2, cloud disabled, and the exact future app path. Baseline is a controlled comparison, not a predecessor copied from an older stager revision.
- The original `final-local-completion` app named by the protected-startup package recipe. The newer protected-startup output cannot substitute because the original runtime integration requires absent metadata before adding it. The selected daemon tuple supplies the protected-startup successor.

The current historical stage ledger may reject changed non-feature inputs. Resolve that through the existing exact staging review; do not bypass it. If a changed module's current baseline bytes differ from the existing packaged predecessor, feature preparation refuses and requires a separately reviewed baseline integration. These tools never reinterpret that mismatch as an approved feature delta.

## Concrete sequence

Run from the repository after the required inputs exist. All paths below are explicit parameters; angle-bracket values are placeholders, not fabricated receipts.

1. `python3 docs/integration/proposed/browser-feature-expansion/package/stage_pair.py --node <absolute-node-tool> --source-snapshot <pinned-static-snapshot> --output <fresh-stage-pair-directory> --final-app <fresh-package-directory>/Aux.app`

   This invokes the existing stager twice without `--replace`, records commands and inventories, and runs no product. It does not read owner profiles or fall back to their locations.

2. Run `prepare_base.py` with the existing delivery preparer's complete arguments. Use the protected-startup `integration/package-command.json` as the argument template, replacing the native receipt, source pair, source/source receipt, entry/entry receipt, loader, daemon receipt, output and recipe with their real current values. Retain the template's original baseline app and exact runtime integration inputs. `python3 .../package/prepare_base.py --help` lists every required argument.

   `prepare_base.py` preserves the old preparer's entire logic except its import and explicit successor frozen-native validator. It never fabricates projection/link receipts. The new base recipe remains subject to all five exact paired leaves, the two exact runtime leaves, refusal semantics and source-pair checks.

3. `python3 docs/integration/proposed/browser-feature-expansion/package/feature_package.py prepare --base-recipe <prepared-base-recipe.json> --native-composition <current-integration-composition.json> --daemon-composition <actual-feature-daemon-composition.json> --daemon-inputs <actual-linked-native-inputs.json> --baseline-stage <stage-pair>/baseline --feature-stage <stage-pair>/desktop-v1 --recipe <fresh-feature-recipe.json>`

4. Review the resulting exact recipe, then run `python3 docs/integration/proposed/browser-feature-expansion/package/feature_package.py assemble <feature-recipe.json>`.

   The existing assembler performs the original full native copy and protected resource integration. The feature wrapper then replaces only same-mode existing Agent `.js`/`.mjs` leaves, the stager-ledger-approved Agent manifest revision, and the staged CLI **SEA** at `aux-cli-sea`. The Agent manifest may change only its revision; identity, permissions, entrypoints and all other properties must match the packaged predecessor and both stages. The native pre-home `aux-cli` wrapper is never replaced. Addons, helper/runtime binaries, CSS, images, other resources and native app leaves are compared exactly. The original base assembly receipt is retained as `base-assembly-receipt.json`; the final receipt inventories the actual feature candidate. Any overlay failure records `feature-failure.json` and leaves no successful final receipt.

For a sparse worker invoking these scripts against the integrator's repository, set `AUX_FEATURE_PACKAGE_REPOSITORY` explicitly. That absolute repository identity is included in the recipe and must match again during assembly. Normal integration uses the script's repository automatically.

## Narrow native guard successor

`guard-transition.json` and `guard-transition.patch` pin exactly three reviewed source transitions: the feature-drain additions to `AuxSelectedStateHome.cc/.h` and two new participant registrations in `chrome/browser/aux/BUILD.gn`. The validator replays the exact patch in a temporary directory, checks original barrier hashes, requires every other original barrier/messaging hash unchanged, and independently verifies the Aux GN file differs only by the two source lines. It also verifies the full build's actual frozen input manifest and current feature composition. Source drift refuses preparation until the exact review is updated.

The historical assembler file remains untouched. During this feature assembly only, its frozen-native validator is replaced with this explicit successor validator; all other original checks still execute. This is not a generic allowlist bypass and does not close known startup/custody/hardlink/race or runtime-acceptance gaps.

## Verification performed

`check.py` uses inert temporary text files to accept two intended feature deltas, reject a CSS mutation, reject the wrong CLI predecessor and reject an object-only build receipt. It also checks that `prepare_base.py` retains the original preparation logic exactly except the documented import/validator hook. No actual stage, full build, package assembly, app launch or signing was performed in this lane. Source/syntax checks do not transfer historical UI acceptance to the successor.
