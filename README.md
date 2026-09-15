# Vector

A local agent-first desktop browser. One durable execution runtime is shared by
a native human interface (Electron) and structured agent interfaces (loopback
API, MCP, CLI) — the same tool-driven flow works identically in local and cloud
environments.

## Quickstart

```bash
pnpm install
pnpm build
pnpm dev          # fixtures + Electron shell + runtime
pnpm fixtures     # fixture sites only (http://127.0.0.1:4810–4812)
pnpm test         # unit + integration suites
pnpm test:e2e     # Electron end-to-end
pnpm bench        # benchmark harness
pnpm package:local  # build Vector.app into release/
```

Configuration is optional — copy `.env.example` to `.env` (in the repo root
you launch from, or in the data dir `~/Library/Application Support/Vector`)
and set `AI_GATEWAY_API_KEY` to enable agent goals (`runs.start`,
`sets.map --goal`). The runtime loads `<dataDir>/.env` then `<cwd>/.env` at
startup; variables already set in the environment always win. Programs,
observations, and saved-operation sets work with no key.

## Using the app

The window is a compact macOS browser: traffic lights in a `hiddenInset`
titlebar, a ~52px toolbar, tabs/sets in a collapsible left rail, and the page
occupying most of the stage. The agent inspector is closed until you open it.

- `⌘T` new tab · `⌘W` close tab · `⌘⇧T` reopen closed tab · `⌘1–9` switch tabs
- Address field is in the **toolbar** — `⌘L` focuses it. Type a URL or a search
  and it navigates immediately (no model). A new tab explains that and focuses
  the field; favorites sit underneath if you have bookmarks.
- `⌘K` command palette — commands, URL/search, agent tasks, sets, Chrome
  attach, observation inspector, split view, bookmarks
- `⌘F` find in page · `⌘R` reload · `⌘=`/`⌘-`/`⌘0` zoom · `⌥←`/`⌥→` back/forward
- Toolbar: Focus / Overview / Table · `⌘⇧A` overview · `⌘Y` history ·
  `⌘⇧J` downloads · `⌘,` settings · `⌘S` toggle the tab rail
- The tab rail and agent inspector are **drag-resizable** (double-click the
  edge to reset); widths persist. The activity shelf at the bottom of the
  stage is collapsed by default and shows complete / active / queued / files
  — never an invented percentage.
- Open the **agent inspector** from the toolbar when you want chat. Threads
  stay scoped; `+` starts a new conversation.
- The toolbar labels **Vector** vs **Chrome**. Type or click inside an
  agent-driven page to take it over; the chip hands control back with one
  click. Attached Chrome tabs stay in Chrome — use Open live in Chrome.
- Command palette, settings, history, and the observation inspector hide the
  native page so they are not covered by `WebContentsView`. Find and downloads
  shrink the stage instead.
- Results table: sort, filter, export CSV/JSON, click a source URL to reopen
  its page.
- Run steps carry an inspect control — the exact observation the planner saw
  (marked historical; it doesn't rewind the page).
- `collectScroll` program steps accumulate virtualized/infinite lists by
  stable key — see docs/api.md.

## Layout

```
apps/desktop     Electron main + React renderer (native WebContentsView tabs)
apps/runtime     the authoritative runtime: pages, programs, runs, sets, API
packages/contracts      zod schemas shared by every surface
packages/browser-driver CDP/Playwright drivers (vector, standalone, attached Chrome)
packages/cli            `vector` CLI over the loopback API
packages/mcp            MCP stdio server over the loopback API
fixtures/               deterministic test sites (records, forms, interaction-lab)
tests/                  unit, integration, e2e, benchmarks
scripts/                dev, fixtures, packaging
```

## Docs

- [Architecture](docs/architecture.md)
- [Local testing](docs/local-testing.md)
- [Loopback API](docs/api.md) · [CLI](docs/cli.md) · [MCP](docs/mcp.md)
- [Packaging](docs/packaging.md) · [Troubleshooting](docs/troubleshooting.md)
