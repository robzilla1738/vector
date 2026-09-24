# Task-success benchmark

`pnpm bench:tasks` measures whether an agent finishes fixture tasks, how long
it takes, and what it costs in model calls and tokens. This local suite is a
regression harness. It does not establish real-site reliability or product
superiority; the roadmap requires held-out sites, signed builds, and daily-use
evidence for those claims.

```bash
pnpm bench:tasks --validate                       # offline self-check (no API key); runs in CI
pnpm bench:tasks --suite local --adapter aux,aux-mcp,playwright-mcp
pnpm bench:tasks --suite assistantbench --adapter aux,playwright-mcp --limit 10
pnpm bench:tasks --list-adapters
```

Needs `AI_GATEWAY_API_KEY` in `.env`. Reports: `tests/benchmarks/reports/tasks-*.json`.

## Suites

- `local` — `manifest.json`, 15 tasks across records, forms, and an embedded
  frame. Fixtures start automatically and mutable state resets before every
  attempt. Write and download tasks require both the answer and an independent
  server-side outcome check. Duplicate effects fail. The truth endpoint is not
  linked from the site UI, but these deterministic tasks are not held out.
- `assistantbench` — the 33-task AssistantBench validation split (live web,
  downloaded on first use through the Hugging Face datasets server).

## Adapters (`adapters.json`)

- `aux` — the runtime's own agent loop (`runs.start`).
- `aux-mcp`, `playwright-mcp`, `agent-browser`, `browser-use-mcp`,
  `lightpanda-mcp` — MCP stdio servers driven by one generic tool-calling
  loop in `run.mjs` with the same model. Rows differ only by the browser and
  its tool surface (the methodology Lightpanda used for its published
  comparison). Adapters whose binary is not on PATH report "not measured".

Answer scoring is normalized exact match for text, ±1 % for numbers, set
equality for lists, and key-wise match for objects. Write/download tasks also
check fixture state. No LLM judge. `--validate` checks the scorer, oracle
semantics, manifest minimum, and fixture reachability without an API key.

## Historical baseline (2026-09-15, old 8-task suite)

These results predate the 15-task corpus and independent effect oracles. They
are retained for history and cannot be compared directly with a new run.

| Adapter | Pass | p50 wall | Model calls (mean) | Tokens (mean) |
|---|---:|---:|---:|---:|
| `aux` (runtime loop, Chromium) | 6/8 | 1.5 s | 2.8 | 5.7 k |
| `aux-mcp` (generic loop, Aux tools) | 8/8 | 2.6 s | 5.5 | 32.7 k |
| `playwright-mcp` (generic loop, Playwright tools) | 8/8 | 4.0 s | 5.4 | 36.1 k |

Findings from this run:

- The runtime loop is 2–4x faster and 3–6x cheaper than either MCP loop but
  loses two tasks by returning `done` with the wrong value (a table row
  instead of a count on L07; `null` on L08). Answer extraction from
  `result`, not navigation, is the gap.
- Aux's tool surface beats Playwright MCP under the identical loop on
  latency (2.6 vs 4.0 s p50) and tokens (33 k vs 36 k) at equal accuracy.
