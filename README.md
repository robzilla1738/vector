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

Configuration is optional — copy `.env.example` to `.env` and set
`AI_GATEWAY_API_KEY` to enable agent goals (`runs.start`, `sets.map --goal`).
Programs, observations, and saved-operation sets work with no key.

## Using the app

- `⌘T` new tab · `⌘W` close tab · `⌘⇧T` reopen closed tab · `⌘1–9` switch tabs
- The address field lives in the **sidebar** — `⌘L` focuses it (opening the
  sidebar if collapsed). Type a URL, a search, or `> task` / `⇥` to send the
  agent. A new tab shows an ask card with pinned sites.
- `⌘K` command palette — sets, Chrome attach, observation inspector, split
  view, bookmarks
- `⌘F` find in page · `⌘R` reload · `⌘=`/`⌘-`/`⌘0` zoom · `⌥←`/`⌥→` back/forward
- `⌘⇧A` tab overview · `⌘Y` history · `⌘⇧J` downloads · `⌘,` settings ·
  `⌘S` toggle sidebar
- Both panels are **drag-resizable** (double-click the edge to reset) and
  collapse/expand fluidly; widths persist across restarts.
- The agent rail keeps **chat threads** — `+` starts a new conversation, the
  history button lists past threads, and follow-ups stay scoped to the thread.
- Type or click inside an agent-driven page to take it over; the toolbar chip
  shows who controls the page and hands control back with one click.
- Results table: sort columns, filter, export CSV/JSON, click a source URL to
  reopen its page.
- Run steps carry a ◉ button — inspect the exact observation the planner saw
  when it produced that step (marked historical; it doesn't rewind the page).
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
