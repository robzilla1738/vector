# Progress — Runtime vNext

Updated continuously. "Done" means code landed + tests pass; measured numbers are cited where taken.

## R0 — Audit, instrumentation, baseline
- [x] R0.1 repository map → `audit.md`, `implementation-map.md`, `decisions.md`
- [x] Version + machine manifests → `benchmarks/manifests/`
- [x] R0.2 span instrumentation (`services/tracing.ts`, `spans` table, JSONL export, wired into coordinator/executor/model calls)
- [x] R0.3 fixtures — records/forms/interaction-lab already have seed/reset + fault switches + truth APIs
- [x] R0.4 baseline — `pnpm bench` (observation/dispatch latency, versioned report)

## R1 — Shared executor + identity
- [x] Identity: pageId/targetId/documentEpoch, controller, revisions (pre-existing)
- [x] Control-flow nodes: let/if/forEach/until/observe/assert/emit/checkpoint/return/call (`ProgramNodeSchema`, `interpreter.ts`)
- [x] Bounded loops, budgets, cancellation; per-node outcomes recorded as steps
- [x] Expression/predicate grammar (input/variable/literal refs + comparisons + boolean ops)
- [x] `call` resolves registered operations → zero-model reuse path
- [x] `PlanChunk.program` optional control-flow plan
- [x] Takeover epoch: `pages.controller_epoch`; stale-epoch dispatch rejected mid-program

## R2 — State index + acquisition avoidance
- [x] Passive response capture (metadata + bounded JSON/text bodies → artifacts)
- [x] `state.query` — controls/records/responses/artifacts/operations/datasets entities, where-filters, cursor pagination, explain
- [x] Dataset handles + all local transforms (project/filter/sort/dedup/group/join/limit/export) — local + deterministic
- [x] `datasets`/`response_metadata` tables; bodies stored as artifacts

## R3 — Verified operation library
- [x] `operations` + `operation_implementations` + `operation_invocations` tables (+ `request_key` column/migration)
- [x] Compile path: `saveProgram` → candidate `browser-program` impl — **steps translated to stable role/css selectors** (rN refs can't replay)
- [x] **§10.3 trace-derived compile** — `operations.compile` rebuilds a replayable candidate from a run's persisted step ledger (ok outcomes, stable selectors, `trace` evidence). Unified step ledger: `recordStep` now wired for ALL executions (was agent-only — program runs recorded nothing)
- [x] Guards: `controls` checked against a FRESH observation per invoke — missing control = drift = ineligible
- [x] Postcondition verify: `guards.verify` predicate over `{result,extracted}` → "verified"/"unverified" effect outcome
- [x] Promotion: candidate → validated automatically after 3 distinct successful input sets; unverified run demotes validated→candidate
- [x] `operations.list/get/invoke/explain/setImplState/disable/forget` RPCs
- [x] `saveProgram`/`saveRequest` accept `guards` — controls matchers + verify predicate

## R4 — Request implementations + route selection
- [x] `session-request` impl kind — `{input:name}` substitution; **runs in-page via `evaluate` when a same-host live page exists (real session cookies, same-origin)**; runtime fetch only as cross-origin fallback
- [x] Route selection: eligibility (state, siteKey host, control guards) → validated-over-candidate → cheapest-kind → explain string + `ranked` ladder
- [x] **§11.5 fallback continuity** — a failed route tries the next eligible impl ONLY when safe: reads always may; writes only on provably pre-dispatch errors (invalid_params/backend_unavailable/not_found/target_detached/unsupported_op). A possibly-dispatched mutation is never blindly re-issued — verified by test
- [x] **§13.3** — invocation intent persisted `running`+`unknown` BEFORE dispatch; startup reconciles stale `running`→`interrupted` (§17.3)
- [x] **§16.4** — `requestKey` idempotency: a repeated key returns the stored invocation, no second dispatch — verified by test
- [x] **§9.6** — a landed write marks page datasets stale + emits `page.invalidated`
- [x] Route explain recorded on invocation + run.config.routeReason → UI badge
- [x] Explicit impl override bypasses selection
- [x] Zero-model invoke verified live: session-request 5ms p95=8.5ms (bench)

## R5 — Scheduling + ownership
- [x] Per-page lane (pre-existing `enqueue`), controller epoch rejects stale dispatch
- [x] **Lane reentrancy** — AsyncLocalStorage-scoped: a `call`→impl running steps on the SAME page runs inline instead of deadlocking on its own queue (found via a real hang)
- [x] `forEach` `concurrency` honored — bounded parallel batches (≤8), isolated var scope per item
- [x] Conflict keys — sorted multi-key mutex on invoke/program dispatch
- [x] WorkerPool w/ per-origin limits (pre-existing); disposable worker recycling (pre-existing)

## R7 — Inference efficiency + external clients
- [x] Model roles (primary/recovery/vision) configurable via settings
- [x] `runtime.describe` — capability surface (78 methods, entities, node kinds, impl kinds/states, effect classes, **backends, limits, feature flags incl. checkpointResume/invocationIdempotency/routeFallback/webmcpTools:false**)
- [x] `programs.validate` RPC
- [x] MCP tools: `vector_state_query`, `vector_operations_*` (list/invoke/explain/save/**compile**), `vector_program_run`, `vector_responses`, `vector_traces`, `vector_program_validate`
- [x] CLI parity: `ops`/`op-invoke`/`op-explain`/`op-compile`/`state`/`responses`/`datasets`/`traces`/`validate`/`describe` + generic `get`

## R8 — Human experience
- [x] Agent card: implementation badge (route kind + reason on hover), "0-model" badge when a run used zero model calls, live call counter while working
- [x] Rail header: active count + queued count
- [x] `runs.get` returns `modelCalls`; `run.config.modelCalls` stamped at finish so badges show without expanding steps
- [x] Fixed latent bug: `model.call` events render (payload was mis-extracted — `e.payload.call` vs `e.payload`)
- [x] Fixed latent bug: `runs` upsert dropped `config` on conflict — every post-creation config write (modelCalls stamp, invoke-time routeReason) was silently lost

## R6/R9 — Recovery matrix + evaluation
- [x] Fault suite covers renamed control, timeout-after-save, removed record, delayed responses (fixture switches + recovery tests)
- [x] §8.5 — observation deltas carry `deltaFrom` (prior observationId)
- [x] §7.7 — `checkpoint` nodes persist env (kv); `program.resumeFrom` restores vars/emitted and skips to the named top-level checkpoint (position restore, not remote rewind)
- [x] §6.2 — `actions.proposed/dispatched/completed/failed/verified` counters
- [x] `benchmarks/manifests/tasks.json` — 8 tasks: observe+dispatch, program-nodes, operation-invoke, state-query, steps-edit, **T03-extract-records, T05-paginate, T-compile** (§19.2 catalog-aligned)
- [x] Runner: per-task verify + timing rows → `benchmarks/reports/vnext-<ts>.json`
- [x] Measured (latest): operation-invoke 5ms · state-query 0.2ms · T03 22.7ms · T05 60.3ms · T-compile 104ms · steps-edit 147ms
- [x] **R9.5 packaged build + smoke** — `pnpm package:local` builds `release/mac-arm64/Vector.app`; `tests/smoke/packaged.mjs` (`pnpm smoke:packaged`) boots the bundled runtime standalone → API auth → real page open+observe → op persistence across restart (migrations idempotent) → zero-model invoke. Passing.
- [ ] Competitive adapters (Browser Use / Stagehand / Playwright) — **Not measured** (not installed; marked in baseline-configs.json)

## Known limitations (honest)
- `observed-data` impl kind declared but read-query reuse flows through `state.query`, not a compiled impl.
- `site-published tools` (WebMCP) — not in Electron 43 Chromium; capability-gated off.
- Promotion gate: 3 distinct successful input sets (auto, per-impl stats) — lighter than the roadmap's held-out-set bar.
- Control guards observe once per invoke (not per impl) — correct since they check page state, not impl state.
- `session-request` cross-origin invokes use runtime fetch (no session state); same-host invokes run in-page with real cookies. `guards.session` opt-in flag still not implemented.
- `evaluate` step now binds its return into `extracted[as]` — full JSON value (the 300-char detail preview was lossy for session-request use).
- Speculative prefetch and adaptive capacity feedback not implemented (§12.6 optional).
- Competitive evaluation: adapter harness + manifest exist; Browser Use/Stagehand/Playwright not installed → explicitly "not measured", not claimed.
- Checkpoint resume is top-level only (checkpoints inside loops can't be addressed linearly — documented).
