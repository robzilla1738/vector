# Aux

Aux is a Chromium-based browser for Mac with a built-in agent. It needs Apple silicon and macOS 15 or later. The agent runs on local agent CLIs such as Claude Code and Codex, or on your own API keys, and there's no Aux account or plan.

Aux started from the Aside implementation the owner supplied, rebranded. Aux's own source now replaces the supplied parts it can build, with the same behavior.

- Working rules: [AGENTS.md](AGENTS.md)
- Live state of the build: [STATUS](docs/STATUS.md)
- The plan to 1.0: [finish plan](docs/ROADMAP-EXECUTION-GRAPH.md)
- How it fits together: [architecture](docs/ARCHITECTURE.md)
- All docs: [docs/README.md](docs/README.md)

The website, including user docs, is the separate `aux-web` repository.

## Current build

Release builds land in `out/release/1.0.0-<build>/Aux.app`. STATUS names the latest one. Launch it by absolute path:

```sh
/Users/rcourson/Documents/Vibe/Aux/out/release/1.0.0-<build>/Aux.app/Contents/MacOS/Aux --use-mock-keychain
```

Builds aren't public releases yet. The sealed candidate at `out/provided-candidate-completion-20261026-a1/Aux.app` supplies the components each build starts from, and it starts only through its adjacent `Launch Aux.command`.

## Layout

| Path | What it holds |
|---|---|
| `chromium/` | GN flags, the complete Aux Chromium delta (`tree/`) and build notes. The checkout itself is outside the repo. |
| `vendor/aux-extension/` | Aux's own source for extension routes and hooks |
| `vendor/aux-daemon/` | Aux's own daemon source, with parity tests against the supplied daemon |
| `vendor/aux-skills/` | Aux's built-in skills |
| `vendor/provided/` | Adaptations of supplied components: the agent layer (`agent/`), local agent CLIs (`provider-cli/`), UI edits (`polish/`), identity transforms and tests |
| `vendor/aside/` | Shims, patches and entitlements for the supplied binaries |
| `vendor/provided-ui/` | Aux branding assets for the supplied UI |
| `apps/` | Native helpers Aux builds: Computer Use, memory, PDF and macOS utilities |
| `scripts/release/` | `assemble.py` builds a signed app, and `package.py` notarizes it and makes the DMG and appcast |
| `scripts/runtime/` | Rebuilds the bundled Node, Python, `rg` and PDF tools |
| `scripts/candidate/` | Edit preparation, daemon relink and the repair executor for the sealed candidate |
| `scripts/ci/` | The Tartelet runner image and the hermetic test list |
| `scripts/` | Older stage and audit tools, the dev launcher `aux.mjs` and native helpers. Shared code is in `scripts/lib/`. |
| `assets/brand/` | Canonical logo `arch-mark.svg` and every asset derived from it |
| `services/aux-cloud/` | Hosted service on Vercel, with its own package and lockfile |
| `test-inputs/`, `fixtures/` | Synthetic test data |
| `docs/` | STATUS, the finish plan, the contract, source pins, and the receipts the build and tests still read |
| `out/` (ignored) | Builds, the frozen source snapshot and durable live inputs. See below. |

Outside the repo:

- Chromium checkout: `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`, with `depot_tools` beside it.
- Older Chromium trees, worktrees and experiments: `/Users/rcourson/Documents/Aux-archive/`.

## Commands

```sh
pnpm install
pnpm test               # every Node and Python test (needs out/)
pnpm test:ci            # the tests that run without host inputs, as CI does
python3 scripts/verify-candidate.py
```

Use Node 24 or later. Native builds are in [chromium/BUILDING.md](chromium/BUILDING.md), a release is in [docs/source/release.md](docs/source/release.md), and the working loop for UI changes is in [STATUS](docs/STATUS.md).

## `out/`

`out/` is ignored by Git but holds things the build and tests need. Keep:

- `provided-source-snapshot-1.26.1016.1852/` and `provided-source-audit/`: frozen supplied inputs.
- `live-inputs/`: durable copies of current inputs.
- `runtime/`: the rebuilt runtime.
- The sealed candidate and the a38 fallback.
- Older candidates and stages named in tests (`git grep "out/provided-" -- vendor scripts`).

Everything else in `out/` is a disposable build product.

## History

The retired clean-room implementation, older receipts and the full pre-cleanup docs tree are at tag `archive/pre-cleanup-2026-10-27`. Bundles of every ref are in `/Users/rcourson/Documents/Aux-archive/`, and an encrypted copy of the irreplaceable inputs is in iCloud Drive ([docs/backup/2026-10-27.md](docs/backup/2026-10-27.md)).
