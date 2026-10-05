# Aux

**Aux is the browser that works with you. Delegate real work, take over whenever
you want, and know what actually happened.**

Start with the [implementation handoff](docs/HANDOFF.md), [roadmap](docs/ROADMAP.md),
and [evidence ledger](docs/EVIDENCE.md). Historical [UI implementation](docs/archive/2026-09-24-b0-reset/ui/COMPONENT-TRANSPLANT.md) and [host proof](docs/archive/2026-09-24-b0-reset/M1-HOST-COMPARISON.md) records are archived.
The current deliverable is a local **Aux inspection build** of Chromium `154.0.8037.58`, at `/Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app`. The frozen native batch compiled, its runtime/helper matched, and focused ownership/permission/acknowledgement controls passed. The app was launched on chat home with a disposable Profile and a synthetic loopback model. See the [current inspection handoff](docs/INSPECTION-BUILD-HANDOFF.md) for exact build identity, completed fixes, evidence and the known preview-launcher wait.

This is not full qualification: resize is user-owned, the five current functional journeys and exhaustive performance/design matrices are deferred, and no external provider or release was qualified. `pnpm dev` opens the scripted shell preview; it does not launch AuxDev. The [native runbook](experiments/chromium-fork/CONTINUATION.md) describes the native workflow. Work remains local to conserve GitHub Actions; no push, signing, notarization or release was performed.

For the Aux runtime, `AUX_*` is the configuration namespace. Process environment overrides
`.env` files. Runtime data uses `Aux Browser/aux-state.sqlite` under the OS data
root. Legacy Vector data directories and databases are left in place untouched —
they are not read, merged, or adopted; select a different directory with
`AUX_DATA_DIR` if one is present in a custom location. The native Chromium app uses its own `Application Support/Aux` product directory. Old Electron data is read only by the offline migration path.

A local agent-first browser with one desktop window, workspace, permission
model, and agent contract. Chromium is the sole web engine — embedded in the
shell, headless in standalone mode, or the user's Chrome attached over CDP.
Connection kind is recorded on every page (`backend`, `routeReason`).

## Private hands-on preview
### Current shell

The [archived September 23 design checkpoint](docs/archive/2026-09-24-b0-reset/ui/design-update-2026-09-23.md) records the earlier
Aside-inspired shell: horizontal tabs by default, optional vertical tabs, native
glass, a persistent expanded sidebar and a separate collapsed edge preview,
chat project folders, inline session actions, and consistent work controls.
It also documents the native input fixes for URL reveal, scrolling and window
dragging. Existing Aux colors and explicit preferences are preserved.




Run `pnpm dev` for the scripted shell preview. For native AuxDev, follow the [local Mac handoff](docs/HANDOFF.md) and [runbook](experiments/chromium-fork/CONTINUATION.md). The [archived first review walkthrough](docs/archive/2026-09-24-b0-reset/AUX-FIRST-REVIEW.md) describes the retired Electron host.

## Quickstart

```bash
pnpm install
pnpm build
pnpm dev            # scripted shell preview
pnpm fixtures       # fixture sites only (http://127.0.0.1:4810–4812)
pnpm test           # unit suite
pnpm bench          # browser-layer timings on the records fixture
python3 chromium/aux-chromium build  # native AuxDev app
```

Configuration is optional — copy `.env.example` to `.env` (in the
repo root you launch from, or in the data dir
`~/Library/Application Support/Aux Browser`) and set `AI_GATEWAY_API_KEY` to
enable agent goals (`runs.start`, `sets.map --goal`). The reviewed roadmap sets `meta/muse-spark-1.3-contributor` as the default
for every agent role and caps cumulative Aux model spend at $50. See the
[model and spend gates](docs/ROADMAP.md) and [recorded usage](docs/EVIDENCE.md). The runtime loads
`<dataDir>/.env` then `<cwd>/.env` at startup; variables already set in the
environment always win. Programs, observations, and saved-operation sets
work with no key. Other agents (Cursor, Codex, Claude) can drive the same
runtime over [MCP](docs/mcp.md) or the [loopback API](docs/api.md).

## Benchmark

`pnpm bench` on the records fixture (`http://127.0.0.1:4810/records`), headless
standalone Chromium, darwin arm64, 10 repeats after 1 warmup, p50. Before is the
2026-09-23 baseline on `main` (`2b323d5a`); after is the `aux-excellence` branch.
Timings were taken on a busy desktop (load ≈ 14), so treat small differences as
noise; bytes are exact. `pnpm bench --check-budgets` gates CI against
`scripts/budgets.json`, and `--transport http` measures the loopback API path.

| Metric | Before | After |
|---|---:|---:|
| click by ref, submits a form (`click.nav`) | 158 ms | 7–17 ms |
| click by ref, no navigation (`click.nonav`) | 66 ms | 9–15 ms |
| fill by ref | 8 ms | 5 ms |
| navigate + observe | 51 ms | 44–60 ms |
| full observation size | 9,593 bytes | 4,117 bytes |
| observation as MCP sends it (full) | 16,280 bytes | 6,760 bytes |
| MCP `tools/list` (default scope) | 98.7 KB | 20.4 KB |
| renderer startup JS | 883 KB | 446 KB |
| packaged app | 357 MB | 252 MB |

Clicks and fills dispatch straight over CDP from an isolated world the page cannot
reach; observations keep stable refs across calls and `sinceRevision` returns only
what changed. See [docs/BENCHMARKS.md](docs/BENCHMARKS.md) for every published number.

Task success on the in-tree suite (`pnpm bench:tasks`, `--trials 3` by default,
fixture state reset before every task) is recorded per run in
`tests/benchmarks/reports/`. The last published run (2026-09-15, one trial,
`alibaba/qwen3.8-27b`) predates the planner-memory, grounding and MCP changes:

| Adapter | Pass | p50 wall | Model calls (mean) | Tokens (mean) |
|---|---:|---:|---:|---:|
| `aux` (runtime loop, Chromium) | 6/8 | 1.5 s | 2.8 | 5.7 k |
| `aux-mcp` | 8/8 | 2.6 s | 5.5 | 32.7 k |
| `playwright-mcp` | 8/8 | 4.0 s | 5.4 | 36.1 k |

## Using the app

The shell (`apps/shell`, documented in [docs/ui/shell.md](docs/ui/shell.md))
retains the [archived visual direction](docs/archive/2026-09-24-b0-reset/AUX-DESIGN-DIRECTION.md) where consistent with the reviewed roadmap, including
Aux branding and capabilities. It uses Geist/Geist Mono, Central Icons, native
macOS material, a fully hidden sidebar that grows back as the same glass
column, and a resizable agent panel. The [old parity audit](docs/archive/2026-09-24-b0-reset/ASIDE-PARITY.md) is historical; current gates are in the [roadmap](docs/ROADMAP.md).

- `⌘T` new tab · `⌘W` close · `⌘⇧T` reopen · `⌘1–9` switch · `⌃Tab` cycle
- `⌘L` / `⌘E` focus the **command bar** (new-tab hero or top toolbar).
  On a loaded page the address row stays out of the layout until the pointer
  reaches the top or the field is focused. The row fades out by its own
  bottom edge and stays clickable. A URL or search navigates
  immediately (no model); a prompt starts an agent run. Prefixes: `/`
  command, `>` force a run, `?` force a search.
- A conversation with a web tab shows a live preview of that page beside the
  messages. The chat itself is opaque, so the open tab does not show through
  the transcript. Click the preview to open the page in the tab, or in split
  view when another tab in the Space can share the stage. Drop a web tab on
  Bookmarks to save it. A tab menu leaves the loaded page visible. With the
  sidebar hidden, the chat title sits clear of the window buttons.
- `⌘K` command palette · `⌘⇧A` agent rail · `⌘⇧O` tab overview ·
  `⌘S` collapse the sidebar · `⌘F` find · `⌘R` reload · `⌘=`/`⌘-`/`⌘0` zoom ·
  `⌘[`/`⌘]` back/forward · `⌘Y` history · `⌘⇧J` downloads · `⌘,` settings
- Type or click inside an agent-driven page (when the agent is not
  mid-program) to take it over; the run pauses and the toolbar chip
  (*You're in control · Return*) hands it back. Agent clicks on the
  page you are watching are not a takeover.
- Run steps in the agent rail carry the exact observation the planner saw;
  results tables sort, filter and export CSV/JSON.

## Layout

```
apps/shell       React WebUI over native Chromium tabs
apps/runtime     the authoritative runtime: pages, programs, runs, sets, API
packages/contracts      zod schemas shared by every surface
packages/chromium-driver  `BrowserDriver`/`DriverPage` — the Chromium/CDP drivers
packages/cli            `auxctl` CLI over the loopback API
packages/mcp            MCP stdio server over the loopback API
packages/sdk            typed client for the loopback API
fixtures/               deterministic test sites (records, forms, interaction-lab)
tests/                  unit, integration, native journeys, benchmarks
scripts/                dev, fixtures, Chromium discovery, packaging
```

## Docs

- [Product architecture](docs/PRODUCT-ARCHITECTURE.md) · [Architecture](docs/architecture.md)
- [Local testing](docs/local-testing.md) · [Desktop shell](docs/ui/shell.md)
- [Loopback API](docs/api.md) · [CLI](docs/cli.md) · [MCP](docs/mcp.md)
- [Packaging](docs/packaging.md) · [Troubleshooting](docs/troubleshooting.md)
- [Changelog](CHANGELOG.md)

CI gates, artifacts, reruns and workflow maintenance: [CI operations](docs/ci.md).
