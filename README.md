# Aux

**Aux is the browser that works with you. Delegate real work, take over whenever
you want, and know what actually happened.**

The full product roadmap and implementation evidence are maintained in
[Aux roadmap](docs/ROADMAP.md) and [progress](docs/progress/2026-09.md).
Remaining founder-Mac work is in
[local handoff](docs/HANDOFF.md).
The private Aux development build is ready for founder review; legacy names below
describe existing compatibility interfaces, not separate products. Unsigned local
packages are available for review; this is not a signed or external release.

`AUX_*` is the only runtime configuration namespace. Process environment overrides
`.env` files. Runtime data uses `Aux Browser/aux-state.sqlite` under the OS data
root. Legacy Vector data directories and databases are left in place untouched —
they are not read, merged, or adopted; select a different directory with
`AUX_DATA_DIR` if one is present in a custom location. The browser's separate
Chromium profile lives under `Aux Browser Profile`/`Aux Browser Development Profile`.

A local agent-first browser with one desktop window, workspace, permission
model, and agent contract. Chromium is the sole web engine — embedded in the
shell, headless in standalone mode, or the user's Chrome attached over CDP.
Connection kind is recorded on every page (`backend`, `routeReason`).

## Private hands-on preview
### Current shell

The [design checkpoint](docs/ui/design-update-2026-09-23.md) records the current
Aside-inspired shell: horizontal tabs by default, optional vertical tabs, native
glass, a persistent expanded sidebar and a separate collapsed edge preview,
chat project folders, inline session actions, and consistent work controls.
It also documents the native input fixes for URL reveal, scrolling and window
dragging. Existing Aux colors and explicit preferences are preserved.




Run `AUX_LOAD_DOTENV=0 pnpm dev` for the current private development build. `pnpm preview` opens a
separate persistent Aux Preview profile. Follow the [local Mac handoff](docs/HANDOFF.md),
[private build handoff](docs/AUX-PRIVATE-BUILD.md)
and [first review walkthrough](docs/AUX-FIRST-REVIEW.md) for browsing, tasks,
development, cloud setup and the known compatibility limits. Founder-device work
that remains is B1–B7 in the local handoff. Founder feedback now
defines the next roadmap.

## Quickstart

```bash
pnpm install
pnpm build
pnpm dev            # desktop product (fixtures + Electron shell)
pnpm fixtures       # fixture sites only (http://127.0.0.1:4810–4812)
pnpm test           # unit + integration suites
pnpm test:e2e       # Electron end-to-end
pnpm bench          # browser-layer timings on the records fixture
pnpm package:local  # desktop application
```

Configuration is optional — copy `.env.example` to `.env` (in the
repo root you launch from, or in the data dir
`~/Library/Application Support/Aux Browser`) and set `AI_GATEWAY_API_KEY` to
enable agent goals (`runs.start`, `sets.map --goal`). The planner defaults
to `alibaba/qwen3.8-27b` through Vercel AI Gateway; Settings also offers
`openai/gpt-5.6-luna-fast`. The runtime loads
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

The shell (`apps/desktop`, documented in [docs/ui/shell.md](docs/ui/shell.md))
follows [Aside-inspired visual direction](docs/AUX-DESIGN-DIRECTION.md), retaining
Aux branding and capabilities. It uses Geist/Geist Mono, Central Icons, native
macOS material, a fully hidden sidebar that grows back as the same glass
column, and a resizable agent panel. See the [parity audit](docs/ASIDE-PARITY.md)
for remaining verification.

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
apps/desktop     Electron main + React renderer (native WebContentsView tabs)
apps/runtime     the authoritative runtime: pages, programs, runs, sets, API
packages/contracts      zod schemas shared by every surface
packages/chromium-driver  `BrowserDriver`/`DriverPage` — the Chromium/CDP drivers
packages/cli            `auxctl` CLI over the loopback API
packages/mcp            MCP stdio server over the loopback API
packages/sdk            typed client for the loopback API
fixtures/               deterministic test sites (records, forms, interaction-lab)
tests/                  unit, integration, e2e, benchmarks
scripts/                dev, fixtures, Chromium discovery, packaging
```

## Docs

- [Product architecture](docs/PRODUCT-ARCHITECTURE.md) · [Architecture](docs/architecture.md)
- [Local testing](docs/local-testing.md) · [Desktop shell](docs/ui/shell.md)
- [Loopback API](docs/api.md) · [CLI](docs/cli.md) · [MCP](docs/mcp.md)
- [Packaging](docs/packaging.md) · [Troubleshooting](docs/troubleshooting.md)
- [Changelog](CHANGELOG.md)
