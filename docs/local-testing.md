# Local testing

## Fixtures

Three deterministic `node:http` sites, no dependencies:

```
pnpm fixtures
```

| App | Port | Contents |
|---|---|---|
| records-app | 4810 | `/records` list + filter (`#status`/`#apply-filter`), `/records/:id`, `/records/new`, `p.muted` count, attachments |
| forms-app | 4811 | form fields, validation states, submissions |
| interaction-lab | 4812 | dialogs, uploads, downloads, dynamic DOM, frames |

`startFixturesIfNeeded()` in `scripts/fixtures.mjs` is used by tests — it
skips ports that are already listening.

## Test suites

```bash
pnpm test            # unit + integration (vitest run tests/unit tests/integration)
pnpm test:unit       # contracts, refs, rpc, executor, repo, pool, chrome shell
                     # (address vs search, overlay→native-view, stylesheet tokens)
                     # plus agent navigation, offscreen holds, bookmark drop,
                     # stage clearance beside a menu, and toolbar-edge geometry
pnpm test:e2e        # launches real Electron, drives the loopback API
pnpm exec vitest run tests/integration   # real headless-Chrome runtime + fixtures
```

Integration tests need a headless Chromium: system Chrome (used headless via
playwright-core), or `AUX_BROWSER_PATH`, or a Playwright download
(`pnpm exec playwright install chromium-headless-shell`) that
`scripts/chromium.mjs` finds automatically. The attached-Chrome test is
skipped when no Chrome is attachable.

## Manual smoke

```bash
pnpm fixtures &
AUX_DATA_DIR=/tmp/vt node apps/runtime/dist/main.js &   # standalone runtime
node packages/cli/dist/main.js open http://127.0.0.1:4810/records
node packages/cli/dist/main.js pages
node packages/cli/dist/main.js observe <pageId>
```

Run the product with `pnpm dev` (fixtures + desktop shell). Drive it with the CLI or MCP. Chrome-only
UI work: `pnpm -C apps/desktop dev:mock` serves the renderer at
`http://127.0.0.1:5197` (see `docs/ui/shell.md` → Mock mode).

## Desktop smoke suites

`tests/smoke/*.mjs` are real-Electron acceptance cases (isolated profiles,
serial execution). `tests/smoke/run-suite.mjs` groups them:

```bash
pnpm smoke:release    # the release gate named in the 2026-09-22 handoff §18.1
pnpm smoke:all        # every smoke file, serially
node tests/smoke/run-suite.mjs private-boundary-desktop   # named files
```

The release suite also runs in CI as the `desktop smoke (release suite)` job.
`packaged.mjs` needs `pnpm package:local` first.

## Benchmarks

```bash
pnpm bench                              # --repeats 10 --warmup 1 --label name --runtime <dist/index.js>
```

Starts the fixtures if needed, times open / observe (full, compact, bytes) /
click and fill by ref / navigate+observe / act+observe against the records
fixture, prints p50/mean/p95, and writes
`tests/benchmarks/reports/<timestamp>[-label].json`. The in-runtime
`bench.run` RPC is a separate micro-harness that writes to
`<dataDir>/benchmarks/`.
