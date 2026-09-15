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
pnpm test:e2e        # launches real Electron, drives the loopback API
pnpm exec vitest run tests/integration   # real headless-Chrome runtime + fixtures
```

Integration tests need a headless Chromium: system Chrome (used headless via
playwright-core), or `VECTOR_BROWSER_PATH`, or a Playwright download
(`pnpm exec playwright install chromium-headless-shell`) that
`scripts/chromium.mjs` finds automatically. The attached-Chrome test is
skipped when no Chrome is attachable.

`tests/integration/vector-engine.test.ts` exercises the Vector Engine
backend (`engineMode: always` open/observe/execute in one native call, and
the `auto` mid-program fallback to Chromium). It is skipped with the
loader's diagnostic until the addon is built:
`cd engine && cargo build -p ve-napi --features napi --release`. Engine
unit tests are `cargo test` in `engine/` (see `engine/README.md`).

## Manual smoke

```bash
pnpm fixtures &
VECTOR_DATA_DIR=/tmp/vt node apps/runtime/dist/main.js &   # standalone runtime
node packages/cli/dist/main.js open http://127.0.0.1:4810/records
node packages/cli/dist/main.js pages
node packages/cli/dist/main.js observe <pageId>
```

Or run the whole shell: `pnpm dev` (fixtures + Electron + runtime) and drive
it with the CLI or MCP.

## Benchmarks

```bash
pnpm bench                              # both backends side by side (Chromium engineMode off vs engine always)
pnpm bench -- --backend chrome          # or vector-engine; --repeats 10 --warmup 1 --label name --runtime <dist/index.js>
```

Starts the fixtures if needed, times open / observe (full, compact, bytes) /
click and fill by ref / navigate+observe / act+observe against the records
fixture, prints p50/mean/p95 per backend with the ratio, and writes
`tests/benchmarks/reports/<timestamp>[-label].json`. A backend that cannot
start (no Chromium, no engine addon) is reported as skipped. The in-runtime
`bench.run` RPC is a separate, Chromium-only micro-harness that writes to
`<dataDir>/benchmarks/`.
