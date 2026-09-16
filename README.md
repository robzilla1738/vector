# Vector

A local agent-first browser. One durable execution runtime is shared by a
native human interface (Electron) and structured agent interfaces (loopback
API, MCP, CLI). Pages run on one of two backends:

- **Vector Engine** — Vector's own browser engine in Rust (`engine/`), built
  for agents: the semantic observation, stable refs, batched step execution
  and readiness come from the engine's own trees, with no injected scripts
  and no per-step IPC. V8 runs page scripts; the router falls back to
  Chromium when a document is classified as script-dependent beyond what
  the engine can settle.
- **Chromium** — the Electron `WebContentsView` (or headless Chromium in
  standalone mode), plus the user's own Chrome over CDP. Chromium is the
  fallback for pages the engine classifies as script-dependent.

A router (`apps/runtime/src/services/router.ts`) decides per `pages.open`;
the decision is returned as `routeReason` and a persisted needs-chromium
table (24 h TTL) keeps script-dependent origins off the engine. Routing is
controlled by the `engineMode` setting: `off` (Chromium only),
`auto` (default — engine first, Chromium fallback), `always` (engine only).

## Quickstart

```bash
pnpm install
pnpm build
pnpm dev          # fixtures + Electron shell + runtime
pnpm fixtures     # fixture sites only (http://127.0.0.1:4810–4812)
pnpm test         # unit + integration suites (engine tests skip without the addon)
pnpm test:e2e     # Electron end-to-end
pnpm bench        # benchmark harness, --backend chrome|vector-engine|both
pnpm package:local  # build Vector.app into release/
```

The engine addon (`@vector/engine-native`, `engine/crates/ve-napi`) is not
built by `pnpm build`. Build it once with a stable Rust toolchain:

```bash
cd engine && cargo build -p ve-napi --features napi --release
# or: pnpm --filter @vector/engine-native build   (napi-rs CLI)
```

The runtime loads the addon at startup whenever it is present (set
`VECTOR_ENGINE=0` to skip it) and reports it in `runtime.describe` →
`engine`. Pages route to it when `engineMode` is `auto` (the default) or
`always`. Pin Chromium with `settings.set { engineMode: "off" }` or
`VECTOR_ENGINE_MODE=off`.

Configuration is otherwise optional — copy `.env.example` to `.env` (in the
repo root you launch from, or in the data dir
`~/Library/Application Support/Vector`) and set `AI_GATEWAY_API_KEY` to
enable agent goals (`runs.start`, `sets.map --goal`). The planner defaults
to `alibaba/qwen3.8-27b` through Vercel AI Gateway, pinned to Cerebras
(`VECTOR_GATEWAY_ONLY`, default `cerebras`). The runtime loads
`<dataDir>/.env` then `<cwd>/.env` at startup; variables already set in the
environment always win. Programs, observations, and saved-operation sets
work with no key. Other agents (Cursor, Codex, Claude) can drive the same
runtime over [MCP](docs/mcp.md) or the [loopback API](docs/api.md).

## Benchmark

`pnpm bench --backend both`, records fixture (`http://127.0.0.1:4810/records`),
same harness (`tests/benchmarks/run.mjs`), 10 repeats, p50. Chromium is the
headless standalone driver with `engineMode: off`; Vector Engine is
`engineMode: always`.

| Metric | Chromium | Vector Engine |
|---|---:|---:|
| `pages.open` | 72.8 ms | 2.1 ms |
| `pages.observe` (full) | 13.7 ms | 1.2 ms |
| `pages.observe` (compact) | 10.8 ms | 1.5 ms |
| click by ref (`pages.execute`) | 71.9 ms | 2.3 ms |
| fill by ref (`pages.execute`) | 23.7 ms | 0.8 ms |
| navigate + observe | 56.5 ms | 2.4 ms |
| act + observe (`returnObservation`) | 13.1 ms | 2.0 ms |
| full observation size | 9,499 bytes | 13,148 bytes |

The engine observation is larger because it surfaces more of the page
(elements the Chromium observe script skips). Engine-side numbers for the
static corpus (`cargo run --release -p perf -- --gate m1`) are in
`docs/engine/architecture.md` → Status.

Same fixtures, published competitor numbers (Sep 2026) plus Vector's own
`pnpm bench` / `pnpm bench:tasks` (same model `alibaba/qwen3.8-27b`):

| System | Navigate+snapshot (warm) | Memory vs Chrome | Task success |
|---|---|---|---|
| Vector Engine | 2.4 ms open+observe | in-process, no Chrome | local suite 6/8 (`vector-engine`) |
| Vector Chromium | 56.5 ms navigate+observe | Electron/headless Chrome | local suite 6/8 (`vector`) |
| agent-browser (raw CDP) | 8 ms warm navigate+snapshot | one Chrome per daemon | not measured here; adapter `agent-browser` |
| Lightpanda (Zig+V8) | 9–11× Chrome (their claim) | 16× less memory (their claim) | 69.7% AssistantBench / 83% GAIA-L1 (published) |

Task-success on the in-tree local suite (`tests/benchmarks/tasks/`, same
model, 2026-09-15):

| Adapter | Pass | p50 wall | Model calls (mean) | Tokens (mean) |
|---|---:|---:|---:|---:|
| `vector` (runtime loop, Chromium) | 6/8 | 1.5 s | 2.8 | 5.7 k |
| `vector-engine` (runtime loop) | 6/8 | 1.0 s | 4.8 | 11.1 k |
| `vector-mcp` | 8/8 | 2.6 s | 5.5 | 32.7 k |
| `playwright-mcp` | 8/8 | 4.0 s | 5.4 | 36.1 k |

`pnpm bench:tasks --adapter agent-browser,lightpanda-mcp` records those
rows when the binaries are on PATH.

## Using the app

The shell (`apps/desktop`, documented in [docs/ui/shell.md](docs/ui/shell.md))
is an Arc-style sidebar (spaces, five pin tiles, tab folders), a command bar
in that sidebar, an inset stage card, and a resizable agent rail. Type is
Inter Variable; icons are Lucide. Dark chrome is `#1f1f1f`.

- `⌘T` new tab · `⌘W` close · `⌘⇧T` reopen · `⌘1–9` switch · `⌃Tab` cycle
- `⌘L` / `⌘E` focus the **command bar** (sidebar field when expanded; top
  toolbar only when the sidebar is hidden): a URL or search navigates
  immediately (no model); a prompt starts an agent run. Prefixes: `/`
  command, `>` force a run, `?` force a search.
- `⌘K` command palette · `⌘⇧A` agent rail · `⌘⇧O` tab overview ·
  `⌘S` collapse the sidebar · `⌘F` find · `⌘R` reload · `⌘=`/`⌘-`/`⌘0` zoom ·
  `⌘[`/`⌘]` back/forward · `⌘Y` history · `⌘⇧J` downloads · `⌘,` settings
- The stage card carries an **engine badge** — Chromium, Your Chrome or
  Vector Engine — with the router's `routeReason` in its hover card.
  Settings → Vector Engine switches `engineMode`.
- Type or click inside an agent-driven page to take it over; the toolbar
  chip (*You're in control · Return*) hands it back. Programs on a
  taken-over page fail with `conflict` until then.
- Run steps in the agent rail carry the exact observation the planner saw;
  results tables sort, filter and export CSV/JSON.
- Engine-backed pages are headless (no native `WebContentsView`).
  `pages.activate` still marks them active; `pages.capture` paints a
  PNG through the software renderer with system fonts.

## Layout

```
apps/desktop     Electron main + React renderer (native WebContentsView tabs)
apps/runtime     the authoritative runtime: pages, router, programs, runs, sets, API
engine/          Vector Engine — Rust cargo workspace (crates/, tools/, fixtures/, conformance/)
engine/crates/ve-napi   @vector/engine-native — napi-rs 3 addon the runtime loads
packages/contracts      zod schemas shared by every surface
packages/browser-driver drivers: vector (Electron/standalone Chromium), chrome (attached), vector-engine
packages/cli            `vector` CLI over the loopback API
packages/mcp            MCP stdio server over the loopback API
fixtures/               deterministic test sites (records, forms, interaction-lab)
tests/                  unit, integration, e2e, benchmarks
scripts/                dev, fixtures, Chromium discovery, packaging
```

## Docs

- [Architecture](docs/architecture.md) · [Engine architecture](docs/engine/architecture.md) · [Engine README](engine/README.md)
- [Local testing](docs/local-testing.md) · [Desktop shell](docs/ui/shell.md)
- [Loopback API](docs/api.md) · [CLI](docs/cli.md) · [MCP](docs/mcp.md)
- [Packaging](docs/packaging.md) · [Troubleshooting](docs/troubleshooting.md)
- [Changelog](CHANGELOG.md)
