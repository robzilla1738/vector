# Vector Runtime vNext — Repository Audit (R0.1)

Date: 2026-09-15. Auditor: coding agent on the live repository (`/Users/robert/Code/web`).
Status: this document records the *actual* state of the code, not the roadmap's assumptions.

## What the repository already is

A pnpm monorepo:

```text
apps/
  desktop/     Electron shell + React renderer (native WebContentsView pages)
  runtime/     Node runtime — API server, coordinator, executor, services, SQLite
packages/
  contracts/   zod schemas shared by every surface
  browser-driver/  DriverPage abstraction + Playwright/CDP implementation
  cli/         `vector` CLI — talks to the loopback API
  mcp/         MCP stdio server — thin adapter over the same API
fixtures/      records-app (4810), forms-app (4811), interaction-lab (4812), shared/
tests/         unit, integration, e2e, benchmarks/run.mjs
```

Single-writer SQLite (`node:sqlite`) with these tables: `sessions`, `pages`
(includes `controller`, `epoch`, `revision`, `view_status`), `tabs`,
`page_sets`, `set_members`, `runs`, `steps`, `results`, `observations`,
`programs`, `artifacts`, `model_calls`, `events` (monotonic `seq`), `history`,
`bookmarks`, `downloads`, `kv`.

## Roadmap items that already exist (verified in code)

| Roadmap requirement | Existing implementation |
|---|---|
| Per-page ordered input lane (12.3) | `PageService.enqueue(pageId)` serializes every driver command per page — `apps/runtime/src/services/pages.ts` |
| Human/agent/external page controller + takeover (12.4) | `pages.controller` column; `pages.takeover`/`pages.resume`; execute refuses `controller === "human"` |
| Reactive waiting / arm-before-dispatch (7.5) | `expectDownload` arms the waiter then runs the trigger step — `executor.ts`; `waitFor` supports text/selector/url/response/expression conditions, no fixed sleeps |
| Worker pool + per-origin limits (12.2) | `scheduler/pool.ts` — `WorkerPool` with maxWorkers + perOrigin, used by `set-runner.ts` |
| Page sets + parallel member mapping | `sets.map` over pooled worker pages; completed members retained on sibling failure |
| Saved programs | `programs` table + `programs.save/run/list/delete`; `translateSteps` rewrites run-scoped refs (r3) into portable selectors so a learned program replays on sibling pages — `set-runner.ts` |
| Persisted observations w/ epoch+revision | `observations` table + `pages.observe` scopes (full/forms/links/tables/subtree) |
| Event ledger with resume | `events` table, `events.since(seq)` — subscribers can resume after a gap |
| Model-call telemetry | `model_calls` table records role/model/duration/tokens per call |
| Local benchmark harness | `services/bench.ts` + `tests/benchmarks/run.mjs` measure observation + dispatch latency and write versioned JSON reports |
| Records fixture w/ truth + faults | `fixtures/records-app/serve.ts` — `/api/state` oracle, `/api/faults` (delay, renamed control, timeout-after-save, removed record), `/api/reset` |
| MCP + CLI over the same API | `packages/mcp`, `packages/cli` — no second browser connection |
| Agent convergence guards | coordinator: plan-repeat detection, no-progress detection, model-error ladder, vision fallback, forced final-answer call |
| Shadow-DOM-aware observation/extract | `observe-script.ts` + `playwright-page.ts` (open shadow roots for elements + text) |
| Human-facing chat surface | optional agent inspector (closed by default): user bubbles, agent cards, queued messages, needs-input answers, retry, structured results |

## Actual gaps vs. the roadmap (the work items)

| Gap | Roadmap | Where it lands |
|---|---|---|
| Programs are flat step lists — no `let/if/forEach/until/assert/emit/checkpoint/return/call` | 7.1, R1.3 | `contracts/program.ts` + new `execution/interpreter.ts` |
| No passive response capture (metadata or bodies) | 9.1–9.2, R2.4 | `services/responses.ts` + `response_metadata`/`response_bodies` tables |
| No dataset handles / local transforms | 7.6, R2.3 | `services/datasets.ts` + `datasets` table |
| No `state.query` cross-entity query | 8.4–8.5, R2.5 | `services/state-index.ts` + `state.*` RPC |
| `programs` are reusable scripts, not operations with implementations/guards/versions | 10.2, R3 | `services/operations.ts` + `operations`/`operation_implementations` tables |
| No session-request execution route | 9.4, R4.2 | `execution/request-impl.ts` (in-page fetch via driver) |
| No implementation selection / explain | 11, R4.4 | `services/route-select.ts` |
| No span-level tracing (events exist; durations/categories missing) | 6.1–6.3, R0.2 | `services/tracing.ts` + JSONL export |
| Conflict keys beyond the page lane | 12.3, R5.2 | keyed mutex map in `pages.execute` / invoke path |
| Controller epoch for stale-queue rejection | 12.4, R5.4 | `pages.controller_epoch` column + epoch check per step |
| No `runtime.describe`, `programs.validate`, `operations.*`, `state.*` RPCs | 16.2, R7.4 | `api/handlers.ts` |
| UI lacks implementation badges / model-call counts on cards | 15.3 | renderer `Rail.tsx` |
| Benchmarks measure latency only; no task-level success matrix | 19 | `benchmarks/manifests/task-manifest.json` + extended runner |

## Suspected-bottleneck checklist (4.1)

- **Global serialization** — none found: per-page queues, worker pool, no global mutex.
- **Model-per-action loop** — present by design (planner emits step chunks); mitigated by control-flow programs + operation reuse (this roadmap).
- **Fixed waiting** — none: all waits are condition-based; `expectDownload` arms first.
- **Excess observation** — full obs each planner iteration; mitigated by scopes + text budget + collapse (added) — further gains from R2 datasets.
- **Repeated context** — bounded: last 24 outcomes, trimmed fields; operation schemas load on demand (to add with registry).
- **Main-thread blocking** — body parsing/extraction runs in page (evaluate) or Node; large work acceptable at this scale; flagged for body-capture budgets.
- **Fragile references** — refs die on navigation by design (documentEpoch); `translateSteps` produces portable selectors for saved programs.
- **Retry amplification** — SDK `maxRetries: 0`; app owns one retry owner; model-error budget exists.
- **UI-driven execution** — runs live in the runtime process; view unmount doesn't stop work.
- **Browser leakage** — pooled worker pages closed on settle; listeners cleaned on page close; watch: response-capture listeners must detach on target destroy.
- **False completion** — verified: expect conditions, readback rule in prompt, final-answer gate, `partially_completed` vs `completed`.

## Baseline posture

`pnpm bench` produces observation/dispatch latency with recorded versions. Task-level
success/duration baselines come from the task manifest added under `benchmarks/manifests/`
— first runs recorded in `docs/runtime-vnext/progress.md` and `benchmarks/reports/`.
