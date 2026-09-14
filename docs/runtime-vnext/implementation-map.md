# Implementation map — roadmap component → repository module

Adapted to the existing layout; no parallel runtime is introduced.

| Roadmap component | Module | Status |
|---|---|---|
| runtime/contracts | `packages/contracts/src` | exists — extended with program nodes, operations, state query |
| runtime/targets | `services/pages.ts` + `browser-driver` identity (`pageId`/`targetId`/`documentEpoch`) | exists |
| runtime/observe | `pages.observe` + `browser-driver/observe-script.ts` | exists — scopes, refs, shadow DOM, revisions, persisted obs |
| runtime/data | new `services/responses.ts` (passive capture) + `services/datasets.ts` (handles/transforms) | **new** |
| runtime/query | new `services/state-index.ts` (`state.query`) | **new** |
| runtime/programs | `contracts/program.ts` + `execution/executor.ts` + new `execution/interpreter.ts` | exists → extended with control flow |
| runtime/operations | new `services/operations.ts` + tables; compiles from `saveProgram` + `translateSteps` | **new** |
| runtime/scheduler | `scheduler/pool.ts` + `set-runner.ts` + per-page `enqueue` | exists — conflict keys added |
| runtime/verify | `expect` conditions + coordinator readback rules + `services/operations.ts` postconditions | partial → extended |
| runtime/recovery | coordinator repair ladder + vision fallback + final-answer | exists |
| runtime/models | `agent/gateway-client.ts` + settings model roles | exists |
| runtime/api | `api/handlers.ts` (JSON-RPC), `packages/cli`, `packages/mcp` | exists — new methods added |
| runtime/telemetry | `services/tracing.ts` (**new**) + `model_calls` + `events` | **new** |
| ui/execution | renderer `Rail.tsx`, `Overview.tsx`, `Table.tsx` | exists — badges/shelf refined |
| fixtures | `fixtures/records-app`, `forms-app`, `interaction-lab` | exists |
| benchmarks | `services/bench.ts`, `tests/benchmarks/run.mjs`, `benchmarks/manifests` | exists — manifests added |

## Deliberate deviations from the roadmap text

- **No new packages.** The roadmap's `runtime/*` modules map into `apps/runtime/src` — one runtime already owns execution truth.
- **Program nodes extend, not replace.** `Program.steps` stays valid; `Program.nodes` adds control flow. Old saved programs keep working.
- **Operations wrap programs.** `operations` are the registry/metadata layer; a `browser-program` implementation stores portable steps produced by `translateSteps`. `programs` table remains for raw saved scripts.
- **Session requests run inside the live page context** (`page.evaluate(fetch)`), not Node fetch — session/cookie fidelity by construction (9.4).
- **SQLite stays the store.** `response_metadata`, `response_bodies`, `datasets`, `operations`, `operation_implementations`, `spans` are new tables via the existing idempotent-migration pattern.
