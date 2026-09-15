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

Integration tests need a system Chrome at
`/Applications/Google Chrome.app` (used headless via playwright-core). The
attached-Chrome test is skipped automatically when Chrome is absent.

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
pnpm bench           # observe + dispatch timings vs records fixture
```

Writes `benchmarks/bench-<ts>.json` and prints mean/p95/min/max.
