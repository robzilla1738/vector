# Rebuilding the candidate

2026-10-28. This is the one documented way to rebuild `out/provided-candidate-completion-20261026-a1/Aux.app`. Seal on this date: `b606bf7c` (receipt `combined-ui-polish-e6`).

## Decision: `stage:provided` is not a rebuild path

The candidate is **not** produced by `pnpm stage:provided` / `assemble:provided` / `package:provided`. It is the A38 base plus an ordered chain of receipt-bound repairs, with the browser built from `chromium/tree/`. The fresh staging pipeline is the predecessor: it is kept, not retired, because it still audits the supplied UI (`pnpm check:provided`, `scripts/lib/provided-*.test.mjs`) and its adapters feed repair inputs. It is not brought level with the candidate and is not a way to reproduce it. A fresh default stage stops at its unreviewed Agent revision (`provided-ui.test.mjs` is skipped for that reason), and `check:provided` on the old `out/provided-reuse` reports "Restage". Use staging output for audits only; never seal or ship it.

## Inputs

Everything under `out/` is ignored by Git. The off-machine copy is the encrypted image in [docs/backup/2026-10-27.md](../backup/2026-10-27.md) (`aux-backup-2026-10-27.dmg`).

| Input | Location | Backup |
|---|---|---|
| Frozen supplied inputs (Aside 1.26.1016.1852) | `out/provided-source-snapshot-1.26.1016.1852/` | In the image |
| Extracted supplied JS (`daemon-original.mjs`, `cli-original.mjs`) | `out/provided-source-audit/` | Not in the image; derived from the snapshot's SEA binaries (`scripts/lib/frozen-daemon-code.mjs`) |
| A38 base | `out/provided-candidate-local-completion-20261025-a38/Aux.app` | In the image (`candidate-a38-fallback`) |
| Candidate through seal `e681affc` (`combined-legacy-guard-removal-a2`) | `out/provided-candidate-completion-20261026-a1/Aux.app` | In the image (`candidate-current`) |
| Repair receipts | `out/provided-candidate-completion-20261026-a1/<receipt dir>/receipt.json`, each with its `before-repair.app` | Through `e681affc` in the image (`backup-20261027/receipts`) |
| Repair plans and inputs (Framework builds, daemon resources, extension files, edits) | `out/live-inputs/completion-20261026/<name>/` (plan: `plan.json`) | Through `e681affc` in the image (`live-inputs`) |
| Inputs that receipts cite under `/private/tmp` | `out/live-inputs/tmp-preserved/` (with a hash manifest) | In the image |
| Source selection (the ordered chain, every pin) | `docs/integration/proposed/completion-20261026/integrator/current-source-selection.json` | Git |
| Approved signing review, owner approval, Info.plist amendment | `docs/integration/proposed/completion-20261026/runtime/authority-review/` | Git |
| Repair executor and plan tools | `scripts/candidate/` (`repair_combined.py`, `freeze_plan.py`, `prepare_edits.py`, `relink_daemon.py`) | Git |
| Chromium delta | `chromium/tree/` on Chromium 155.0.8059.85 (`0e66b945`); pinned as `chromiumTreeManifestSha256` in the selection | Git |
| Chromium checkout | `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` | Not backed up; `chromium/tree/` plus an upstream checkout recreates it |
| Signing identity | `Apple Development: Robert Courson (68DV3N28DS)`, team `9F2JXY8TCK`, login Keychain | Owner's Keychain |

**Gap:** the 16 repairs after `e681affc` (`combined-fix-batch-a1` through `combined-ui-polish-e6`) and their `live-inputs` exist only in `out/`. A new encrypted backup is needed before they are safe (owner step: the image password is in 1Password).

`scripts/lib/inputs.json` names the inputs the tests read; a missing one fails its test with a restore hint.

## The chain

`current-source-selection.json` lists it in order. The early entries (`actualMatchingBuild` through `combinedLocalAccountShortcutRepair`) are the A38-derived completion assembly, its first local signing (`authority-review/sign-reviewed.py`, approved review `20572af3…`) and the early repairs; their receipts are pinned but those one-off scripts are records, not tools to rerun. Every later entry is a run of `scripts/candidate/repair_combined.py` on a plan frozen by `freeze_plan.py`. Each plan pins the executor, the previous receipt, every replacement input and its preimage, and each receipt records the whole-app inventory after the repair.

## Procedure

1. **Restore inputs.** Mount the image read-only and copy its folders back under `out/` (see the backup page). Add any newer `live-inputs` and receipts from wherever they are kept.
2. **Check.** `python3 scripts/verify-candidate.py`. It checks every pin in the selection, the Chromium tree pin, and recomputes the whole app inventory. If it passes, the restored candidate is the sealed one and nothing needs rebuilding.
3. **Rebuild missing repairs.** If the candidate is older than the selection (for example restored at `e681affc`), replay each later repair in selection order:
   - Re-freeze the recorded plan against the current predecessor: `python3 scripts/candidate/freeze_plan.py` with the same replacement inputs, removals and source evidence as the recorded `plan.json`, the predecessor's receipt as `--signed-receipt`, and a new `--receipt-directory`.
   - Run it: `python3 scripts/candidate/repair_combined.py --plan <plan> --plan-sha256 <sha>`. The candidate must not be running.
   - A recorded plan cannot be rerun as-is after the first re-signed step: `codesign` output is not byte-identical between runs, so the predecessor's inventory no longer matches the recorded receipt and the executor refuses ("Signed candidate changed"). This refusal is intended.
4. **Native inputs.** If a Framework input is lost, rebuild it: apply `chromium/tree/` to a clean 155.0.8059.85 checkout (`python3 scripts/chromium-tree.py apply <clean-src> chromium/tree`; absolute snapshot links are re-rooted into this repo's `out/`), build `out/AuxFast` with `chromium/flags.aux.gn` through `scripts/native-build.py`, and use that Framework as the plan input. Its bytes will differ from the recorded build, so its plan pin is new; record the tree's `manifestSha256` in the build receipt (see `chromium/tree/README.md`).
5. **Re-pin.** A rebuilt candidate matches the recorded chain in every unsigned leaf, but signed executables and `_CodeSignature` folders differ. Treat it as a new seal: set `signedInventorySha256` (and, if the tree changed, `chromiumTreeManifestSha256`) in the selection to the new receipt, rerun `verify-candidate.py`, then the focused checks and a disposable launch through the adjacent `Launch Aux.command`.

Not yet proven: a clean apply of `chromium/tree/` followed by a full build (Phase 7 item 1), and an end-to-end replay of steps 3–5.
