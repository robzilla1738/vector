# Task-success benchmark

`pnpm bench:tasks` measures whether an agent finishes a task, how long it
takes, and what it costs in model calls and tokens. It is the number that
matters for "best agentic browser"; `pnpm bench` measures the browser layer
only.

```bash
pnpm bench:tasks --suite local --adapter vector,vector-engine,vector-mcp,playwright-mcp
pnpm bench:tasks --suite assistantbench --adapter vector,playwright-mcp --limit 10
pnpm bench:tasks --list-adapters
```

Needs `AI_GATEWAY_API_KEY` in `.env`. Reports: `tests/benchmarks/reports/tasks-*.json`.

## Suites

- `local` — `manifest.json`, 8 tasks against the deterministic fixture sites
  (started automatically, state reset before each adapter). Gold answers
  follow from the seed in `fixtures/records-app/serve.ts`.
- `assistantbench` — the 33-task AssistantBench validation split (live web,
  downloaded on first use through the Hugging Face datasets server).

## Adapters (`adapters.json`)

- `vector`, `vector-engine`, `vector-auto` — the runtime's own agent loop
  (`runs.start`) with `engineMode` off / always / auto.
- `vector-mcp`, `playwright-mcp`, `agent-browser`, `browser-use-mcp`,
  `lightpanda-mcp` — MCP stdio servers driven by one generic tool-calling
  loop in `run.mjs` with the same model. Rows differ only by the browser and
  its tool surface (the methodology Lightpanda used for its published
  comparison). Adapters whose binary is not on PATH report "not measured".

Scoring is strict: normalized exact match for text, ±1 % for numbers, set
equality for lists, key-wise match for objects. No LLM judge.

## Baseline (2026-09-15, `alibaba/qwen3.8-27b` on Cerebras, local suite)

| Adapter | Pass | p50 wall | Model calls (mean) | Tokens (mean) |
|---|---:|---:|---:|---:|
| `vector` (runtime loop, Chromium) | 6/8 | 1.5 s | 2.8 | 5.7 k |
| `vector-engine` (runtime loop, Vector Engine) | 6/8 | 1.0 s | 4.8 | 11.1 k |
| `vector-mcp` (generic loop, Vector tools) | 8/8 | 2.6 s | 5.5 | 32.7 k |
| `playwright-mcp` (generic loop, Playwright tools) | 8/8 | 4.0 s | 5.4 | 36.1 k |

Findings from this run:

- The runtime loop is 2–4x faster and 3–6x cheaper than either MCP loop but
  loses two tasks by returning `done` with the wrong value (a table row
  instead of a count on L07; `null` on L08). Answer extraction from
  `result`, not navigation, is the gap.
- Vector's tool surface beats Playwright MCP under the identical loop on
  latency (2.6 vs 4.0 s p50) and tokens (33 k vs 36 k) at equal accuracy.
- The engine backend failed the write task (L06, 21 calls): the status
  `<select>` on the edit form was not actionable through the engine's
  observation. Tracked under plan A10/A18.
