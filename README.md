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

`pnpm bench`, records fixture (`http://127.0.0.1:4810/records`),
same harness (`tests/benchmarks/run.mjs`), 5 repeats after 1 warmup, p50 on
darwin arm64 — headless standalone Chromium driver. A chrome-only run after
navigation returned at DOMContentLoaded is recorded in `docs/BENCHMARKS.md`
(observe 15.5 ms p50, navigate+observe 13.2 ms p50, n=5).

| Metric | Chromium |
|---|---:|
| `pages.open` | 103.9 ms |
| `pages.observe` (full) | 14.3 ms |
| `pages.observe` (compact) | 2.0 ms |
| click by ref (`pages.execute`) | 76.0 ms |
| fill by ref (`pages.execute`) | 25.0 ms |
| navigate + observe | 60.4 ms |
| act + observe (`returnObservation`) | 11.9 ms |
| full observation size | 9,580 bytes |

Published competitor numbers (Sep 2026) plus Aux's own
`pnpm bench` / `pnpm bench:tasks` (same model `alibaba/qwen3.8-27b`):

| System | Navigate+snapshot (warm) | Memory vs Chrome | Task success |
|---|---|---|---|
| Aux (embedded Chromium) | 60.4 ms navigate+observe | Electron/headless Chrome | local suite 6/8 (`aux`) |
| agent-browser (raw CDP) | 8 ms warm navigate+snapshot | one Chrome per daemon | not measured here; adapter `agent-browser` |
| Lightpanda (Zig+V8) | 9–11× Chrome (their claim) | 16× less memory (their claim) | 69.7% AssistantBench / 83% GAIA-L1 (published) |

Task-success on the in-tree local suite (`tests/benchmarks/tasks/`, same
model, 2026-09-15):

| Adapter | Pass | p50 wall | Model calls (mean) | Tokens (mean) |
|---|---:|---:|---:|---:|
| `aux` (runtime loop, Chromium) | 6/8 | 1.5 s | 2.8 | 5.7 k |
| `aux-mcp` | 8/8 | 2.6 s | 5.5 | 32.7 k |
| `playwright-mcp` | 8/8 | 4.0 s | 5.4 | 36.1 k |

`pnpm bench:tasks --adapter agent-browser,lightpanda-mcp` records those
rows when the binaries are on PATH.

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
