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
pnpm test            # unit suite (same as test:unit)
pnpm test:unit       # contracts, refs, rpc, executor, repo, pool, chrome shell
                     # (address vs search, overlay→native-view, stylesheet tokens)
                     # plus agent navigation, offscreen holds, bookmark drop,
                     # stage clearance beside a menu, and toolbar-edge geometry
pnpm test:e2e        # launches real Electron, drives the loopback API
pnpm test:integration # real headless-Chrome runtime + fixtures
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

For the official Chromium `Aux.app`, run the [native app journeys](native-journeys.md). They launch a disposable Profile and use the private runtime bridge and native window capture; the Electron smoke suites below qualify the development preview.

`tests/smoke/*.mjs` are real-Electron acceptance cases (isolated profiles,
serial execution). `tests/smoke/run-suite.mjs` groups them:

```bash
pnpm smoke:release    # the release gate named in the 2026-09-22 handoff §18.1
pnpm smoke:all        # every smoke file, serially
node tests/smoke/run-suite.mjs private-boundary-desktop   # named files
```

The release suite also runs in CI as the `desktop smoke (release suite)` job.
`packaged.mjs` needs `pnpm package:local` first.

## Focused shell design regressions

`pnpm smoke:design` runs these eleven cases serially in their own CI job.
See [CI operations](ci.md) for gates, artifacts and reruns.

Build after typechecking before Electron tests (`pnpm --filter @aux/desktop build`).
Run files serially using fresh isolated fixture profiles. These tests perform
mutations only on disposable fixture chats/tasks; do not point them at a personal
profile. The grouped runner's cleanup can stop running Aux processes, so use
individual commands while preserving an open review app.

| Command (`node tests/smoke/<file>.mjs`) | Coverage |
| --- | --- |
| `tab-groups` | Group creation/rename/collapse, membership, persistence, previews |
| `tab-preview-layout` | Horizontal/vertical preview bounds and unchanged native page geometry |
| `floating-sidebar-design` | Expanded column versus collapsed inset reveal and dismissal |
| `sidebar-sessions` | Chat projects, move/archive/restore/delete, focus and inline disclosure |
| `toolbar-glass-design` | White/dark native pages, URL focus, click/scroll after hide, sidebar dragging |
| `conversation-jump-design` | Arrow-only jump, scrolling and stable composer position |
| `new-chat-design` | Empty-chat geometry, context/attachment controls, draft and narrow layout |
| `projects-design` | Tasks/routines filters and schedule presets |
| `settings-design` | Search, keyboard navigation, responsive controls |
| `text-contrast-design` | Composed representative light/dark text and placeholder contrast |
| `motion-design` | Hover, focus, icon sizing and reduced motion |

Example: `node tests/smoke/toolbar-glass-design.mjs`.
These focused cases are individually runnable and included by `smoke:all`; they
are not all members of `smoke:release`. Screenshots go into ignored
`release/test-artifacts/tabs`. Their presence in a local QA note does not mean
screenshots are shipped with the repository. Native material and real mouse/window
behavior also require a hands-on pass; mock Vite cannot establish those results.

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
