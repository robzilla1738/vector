# Aux

Aux is a Chromium-based macOS browser with a built-in agent. It reuses the Aside implementation the owner supplied and rebrands it as Aux, keeping its UI and behavior. Rules for working here are in [AGENTS.md](AGENTS.md); the live state of the build is in [STATUS](docs/STATUS.md).

## Current build

- Candidate: `out/provided-candidate-completion-20261026-a1/Aux.app`. Start it with the adjacent `Launch Aux.command`.
- Fallback: `out/provided-candidate-local-completion-20261025-a38/Aux.app`, the last broadly accepted build, with its own `Launch Aux.command`.

Neither is a release. `python3 scripts/verify-candidate.py` checks that the candidate still matches its recorded repair chain (every pinned input and the whole app inventory). A fresh `stage:provided` from the frozen snapshot is the predecessor pipeline: the candidate is the A38 base plus the ordered, receipt-bound repairs in `current-source-selection.json`, and the browser source is `chromium/tree/`. `~/Applications/Aux.app` is an older launcher for the retired independent build, not either of these.

## Layout

| Path | What it holds |
|---|---|
| `scripts/` | Stage, assemble, package and audit the supplied implementation (`stage-provided`, `assemble-provided`, `package-provided`, `check-provided`), the dev launcher `aux.mjs`, native helpers (`native-build.py`, `compose-provided-native.py`), and the candidate tools in `scripts/candidate/` (edit preparation, daemon relink, plan freeze and the repair executor). Shared code is in `scripts/lib/`. |
| `vendor/provided/` | Aux adaptations of supplied components: branding/identity transforms, adapters and their tests. |
| `vendor/aside/` | Shims, patches and entitlements applied to the supplied binaries. |
| `vendor/provided-ui/` | Aux branding assets for the supplied UI. |
| `chromium/` | GN flags, the Chromium patch series and build notes. The Chromium checkout itself lives outside the repo. |
| `assets/brand/` | Canonical logo `arch-mark.svg` and every asset derived from it. |
| `services/aux-cloud/` | Hosted service (Next.js on Vercel), with its own package and lockfile. |
| `test-inputs/` | Synthetic fixtures for native-messaging checks. |
| `docs/` | `STATUS.md`, the product contract, plans, source pins (`docs/source/`) and the integration receipts the build and tests still read (`docs/integration/proposed/`). See [docs/README.md](docs/README.md). |
| `out/` (ignored) | Builds, stages, the frozen source snapshot and durable live inputs. See below. |

Outside the repo:

- Chromium checkout: `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`, with `depot_tools` beside it.
- Older Chromium trees, worktrees and experiments: `/Users/rcourson/Documents/Aux-archive/`.

## Commands

```sh
pnpm install            # only dependency is ws
pnpm test               # every Node and Python test
pnpm stage:provided --output <dir> --source-snapshot out/provided-source-snapshot-1.26.1016.1852 ...
pnpm check:provided <dir> --source-snapshot out/provided-source-snapshot-1.26.1016.1852
pnpm assemble:provided
pnpm package:provided
```

Pass `--source-snapshot` whenever the installed Aside has moved past `1.26.1016.1852`, which it has. Staging is documented in [docs/source/provided-apps.md](docs/source/provided-apps.md) and [docs/source/provided-assembly.md](docs/source/provided-assembly.md). Native builds are in [chromium/BUILDING.md](chromium/BUILDING.md). Repairs to the current candidate are applied as count-checked, receipt-bound deltas under `docs/integration/proposed/completion-20261026/`; the exact inputs are in its `integrator/current-source-selection.json`.

## `out/`

`out/` is ignored by Git but holds things the build and tests need. Keep:

- `provided-source-snapshot-1.26.1016.1852/` and `provided-source-audit/`: frozen supplied inputs.
- `live-inputs/`: durable copies of current inputs that once lived in `/private/tmp`.
- The current candidate and the a38 fallback.
- Older candidates and stages named in tests (`git grep "out/provided-" -- vendor scripts`).

Everything else in `out/` is a disposable build product.

## History

The retired clean-room implementation (`apps/`, `packages/`), older receipts and the full pre-cleanup docs tree are at tag `archive/pre-cleanup-2026-10-27`. A bundle of every ref is in `/Users/rcourson/Documents/Aux-archive/aux-all-refs-2026-10-27.bundle`.
