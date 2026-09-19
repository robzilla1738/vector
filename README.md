# Vector

A local agent-first browser. The product UI is the native `ve-shell` (no
Electron, no Chromium). Structured agent interfaces (loopback API, MCP, CLI)
share the Vector Engine. Chromium remains a labeled hybrid for comparison
(`pnpm dev:electron`, `pnpm package:electron`).

- **Vector Engine** — Vector's own browser engine in Rust (`engine/`), built
  for agents: the semantic observation, stable refs, batched step execution
  and readiness come from the engine's own trees. V8 runs page scripts.
- **Chromium (hybrid only)** — Electron `WebContentsView` or headless Chrome,
  used for M3 comparison and `engineMode: auto` fallback in the hybrid shell.

A router (`apps/runtime/src/services/router.ts`) decides per `pages.open` in
the hybrid runtime. `engineMode`: `off` (Chromium only), `auto` (engine first,
Chromium fallback), `always` (engine only). Native `ve-shell` is always engine.

## Quickstart

```bash
pnpm install
pnpm build
pnpm dev            # fixtures + ve-shell --gui (native product)
pnpm dev:electron   # hybrid Electron desktop
pnpm fixtures       # fixture sites only (http://127.0.0.1:4810–4812)
pnpm test           # unit + integration suites (engine tests skip without the addon)
pnpm test:e2e       # Electron hybrid end-to-end
pnpm bench          # writes held-out p95 vs Chromium when --backend both
pnpm package:local  # native ve-shell into release/
```

The engine addon (`@vector/engine-native`, `engine/crates/ve-napi`) is not
built by `pnpm build`. Build it once with Rust 1.88:

```bash
cd engine && cargo build -p ve-napi --features napi --release
# or: pnpm --filter @vector/engine-native build   (napi-rs CLI)
```

The product GUI is `pnpm dev` / `cargo run -p ve-shell --features product -- --gui`.
Electron is `pnpm dev:electron`. Evidence:
[docs/engine/evidence](docs/engine/evidence/README.md). Merge-blocking
`testharness.txt` is 114 files. Official `html/dom/partial-updates` on pin
`7c204383` is 28 PASS / 2 FAIL of 30. Combined Mac tree-family run is
142 PASS / 2 FAIL of 144 (`wpt-partial-updates-latest.json`). Keep
`sanitize-template-element` and `template-for-empty` FAIL. Full official
`html/dom` tree numbers stay in `wpt-tree-latest.json` and are not the
entire web. Harness: `cargo run --release -p wpt-harness --features v8 -- --http`
and `cargo run --release -p wpt-runner` (geometry; `--use-reftest-fonts` loads Ahem).

The runtime loads the addon at startup whenever it is present (set
`VECTOR_ENGINE=0` to skip it) and reports it in `runtime.describe` →
`engine`. `pnpm dev` and the desktop shell set `VECTOR_ENGINE_MODE=always`.
A stored `settings.engineMode` wins. Without that env or setting the
fallback is `auto`. Pin Chromium with `settings.set { engineMode: "off" }` or
`VECTOR_ENGINE_MODE=off`. Packaged desktop sets `VECTOR_ENGINE_PROFILE=production`
(process-isolated `ve-host`). Unpackaged stays developer unless that env is set.

Configuration is otherwise optional — copy `.env.example` to `.env` (in the
repo root you launch from, or in the data dir
`~/Library/Application Support/Vector`) and set `AI_GATEWAY_API_KEY` to
enable agent goals (`runs.start`, `sets.map --goal`). The planner defaults
to `alibaba/qwen3.8-27b` through Vercel AI Gateway; Settings also offers
`openai/gpt-5.6-luna-fast`. The runtime loads
`<dataDir>/.env` then `<cwd>/.env` at startup; variables already set in the
environment always win. Programs, observations, and saved-operation sets
work with no key. Other agents (Cursor, Codex, Claude) can drive the same
runtime over [MCP](docs/mcp.md) or the [loopback API](docs/api.md).

## Benchmark

`pnpm bench --backend both`, records fixture (`http://127.0.0.1:4810/records`),
same harness (`tests/benchmarks/run.mjs`), 5 repeats after 1 warmup, p50 on
darwin arm64 (2026-09-16). Chromium is the headless standalone driver with
`engineMode: off`; Vector Engine is `engineMode: always` (process isolation).
Held-out mock 5.32× / 8.35× tokens is retired (`MockModelClient`, n=1). Live
GPT 5.6 Luna rows (5 trials, competitor included) are in `docs/BENCHMARKS.md`
and `docs/engine/evidence/held-out-latest.json`.

| Metric | Chromium | Vector Engine |
|---|---:|---:|
| `pages.open` | 103.9 ms | 7.8 ms |
| `pages.observe` (full) | 14.3 ms | 1.5 ms |
| `pages.observe` (compact) | 2.0 ms | 1.3 ms |
| click by ref (`pages.execute`) | 76.0 ms | 2.0 ms |
| fill by ref (`pages.execute`) | 25.0 ms | 1.2 ms |
| navigate + observe | 60.4 ms | 3.8 ms |
| act + observe (`returnObservation`) | 11.9 ms | 2.0 ms |
| full observation size | 9,580 bytes | 5,917 bytes |

Engine-side numbers for the static corpus (`cargo run --release -p perf --
--gate m1`) are in `docs/engine/architecture.md` → Status. Official
Speedometer 3.0 / JetStream / MotionMark GPU: `cargo run --release -p
browserbench --features v8,gpu`.

Same fixtures, published competitor numbers (Sep 2026) plus Vector's own
`pnpm bench` / `pnpm bench:tasks` (same model `alibaba/qwen3.8-27b`):

| System | Navigate+snapshot (warm) | Memory vs Chrome | Task success |
|---|---|---|---|
| Vector Engine | 3.8 ms navigate+observe | in-process / `ve-host`, no Chrome | local suite 6/8 (`vector-engine`) |
| Vector Chromium | 60.4 ms navigate+observe | Electron/headless Chrome | local suite 6/8 (`vector`) |
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
- Type or click inside an agent-driven page (when the agent is not
  mid-program) to take it over; the run pauses and the toolbar chip
  (*You're in control · Return*) hands it back. Agent clicks on the
  page you are watching are not a takeover.
- Run steps in the agent rail carry the exact observation the planner saw;
  results tables sort, filter and export CSV/JSON.
- Visible auto-mode tabs open on Chromium. Background/CLI engine pages have
  no `WebContentsView`; the stage paints `pages.capture` (software PNG)
  and maps click/wheel through `pages.execute`.

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
- [Engine roadmap](Vector_Engine_Roadmap.md) · [Engine evidence VEC-001–025](docs/engine/evidence/README.md) · [Containment](docs/engine/containment.md)
- [Local testing](docs/local-testing.md) · [Desktop shell](docs/ui/shell.md)
- [Loopback API](docs/api.md) · [CLI](docs/cli.md) · [MCP](docs/mcp.md)
- [Packaging](docs/packaging.md) · [Troubleshooting](docs/troubleshooting.md)
- [Changelog](CHANGELOG.md)
