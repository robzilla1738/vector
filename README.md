# Aux

Aux reuses the implementation supplied by the owner, preserving its UI and behavior while changing branding, assets and identifiers to Aux. Read [AGENTS.md](AGENTS.md), the [supplied contract](docs/design/aside-contract.md), the [reuse plan](docs/plans/2026-10-19-supplied-implementation-reuse.md), the [current status](docs/STATUS.md) and the [completion checklist](docs/ROADMAP-EXECUTION-GRAPH.md) first.

## Scope

- Launch without Aux payments: users bring provider API keys (BYOK) or connect an eligible ChatGPT/Codex plan. See the [provider-funded launch plan](docs/plans/2026-10-23-provider-funded-launch.md).
- No built-in password manager or Vault. Users bring their own (for example 1Password) through browser extensions.
- Routines run on the selected device only.
- Initial platform: Apple silicon, macOS 27.
- Deferred: backups, mobile, payments and Aux-funded inference, legacy migration, distribution/notarization/release.

## Current build

- Current candidate: `out/provided-candidate-completion-20261026-a1/Aux.app` (inventory `e0228418`). Start it with the adjacent `Launch Aux.command`.
- Fallback: `out/provided-candidate-local-completion-20261025-a38/Aux.app` with its adjacent `Launch Aux.command` and the **Aux A4 Work** / **Aux A4 Personal** disposable profiles.

Neither is a release. What works and what remains open is in [STATUS](docs/STATUS.md).

## Development

Supplied-component staging and audits:

```sh
pnpm stage:provided --replace
pnpm check:provided
pnpm assemble:provided
```

Staging replaces only a verified generated stage and keeps the previous output as a sibling backup. `node scripts/check-provided.mjs <stage> --source-snapshot out/provided-source-snapshot-1.26.1016.1852` audits against the frozen source snapshot when the installed Aside version has moved. `pnpm check` runs the supplied-component checks and preservation audit; it is not product acceptance. See [staging](docs/source/provided-apps.md) and [assembly](docs/source/provided-assembly.md).

Native Chromium work uses the checkout at `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` (set `AUX_CHROMIUM_SRC` to override). Serialize native builds with `python3 scripts/native-build.py <command>`, which holds `/tmp/aux-build.lock`. Builds require `enable_aux_browser=true`, `enable_aux_shell=false`, `is_component_build=false` and `aux_test_hooks=false`.

Candidate repairs are applied as count-checked, receipt-bound deltas under `docs/integration/proposed/completion-20261026/`. The current exact inputs are listed in `integrator/current-source-selection.json`.

Verification uses disposable profiles and `--use-mock-keychain`. AI checks use only `vercel-ai-gateway/meta/muse-spark-1.3-contributor`; remove the test credential afterward through Settings → Models.

`pnpm typecheck`, `pnpm lint` and `pnpm test` cover the earlier independent workspace packages (`apps/`, `packages/`); those packages are recoverable history, not the shipping implementation. `services/aux-cloud` is the hosted service (Next.js on Vercel).
