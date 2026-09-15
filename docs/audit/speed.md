# Vector — Agent Speed Audit

Scope: read-only review of `/agent/workspace/vector` (runtime, browser-driver, contracts, mcp, desktop). Latency figures marked *est.* are engineering estimates from the code paths, not measurements — the repo currently has no runnable benchmark to measure them (see §E).

## Verdict

The architecture has the right shape for speed — typed multi-step programs per LLM turn, ref-based targeting with no vision by default, condition-based waits, zero-model replay of learned programs — and on those axes it matches or leads Playwright-MCP / browser-use / Stagehand. But the implementation leaves the advantage on the table:

1. **Per-turn LLM latency is entirely unmitigated** (no streaming, no speculative execution, nothing overlaps the model call). It dominates every agent run by an order of magnitude over browser work.
2. **External (MCP) agents pay 2 LLM turns per action** because `pages.execute` does not return an observation and `vector_page_observe` returns a 30–60 KB raw JSON dump (with css/xpath/rect per element) instead of the compact rendering the internal planner gets.
3. **Ref resolution tries role+substring-name first**, which is both the slowest Playwright locator and produces spurious `target_ambiguous` failures that trigger the whole re-observe/replan/vision ladder.
4. **The stage lease globally serializes every interactive program in the desktop shell**, so "bounded parallel sets" is effectively concurrency = 1 for anything that clicks or types.
5. **Passive response capture eagerly fetches and synchronously writes to disk the body of every text/JS/CSS/HTML response** on every page load, on the same thread that serves observe/execute.
6. There is **no benchmark** in the tree — `pnpm bench` points at a file that does not exist — and the docs cite measured numbers from files that also do not exist.

---

## A. Traced hot path — one MCP `vector_page_execute` (click) + the observe the agent must do next

1. `packages/mcp/src/main.ts:59-77` — tool handler builds `{program:{pageId,steps}, verify}` and calls `rpc("pages.execute", …)`. (`verify` is silently dropped later; see §F.)
2. `packages/mcp/src/client.ts:12-24` — `readDescriptor()` re-reads `runtime.json` from disk on **every** call (`existsSync`+`readFileSync`), then `fetch` POST to `127.0.0.1:<port>/rpc`, 120 s timeout. *est. 1–2 ms.*
3. `apps/runtime/src/api/server.ts:74-92` — buffers body, `JSON.parse`, checks `method in MethodSchemas`, calls `invoke`.
4. `apps/runtime/src/api/handlers.ts:38-41` — `MethodSchemas[method].parse(rawParams)` (zod `ProgramSchema` → `StepSchema` discriminated union); `:55-58` → `pages.execute(program, {})`. *est. <1 ms.*
5. `apps/runtime/src/services/pages.ts:543-625` — `execute()`:
   - `:545` `withKeys` conflict mutex → `:546` `enqueue` per-page lane (`:154-161`).
   - `:551-552` `persist()` → `repo.upsertPage` + `saveTabs` (`DELETE` + N `INSERT`s) — synchronous SQLite, `store/repo.ts:29-58, 85-92`.
   - `:555-560` `collectSteps`; if any interactive op and native shell: `await native.acquireStage(pageId)` — fork-IPC to Electron main, `apps/desktop/main/index.ts:162-175`, which awaits a **global** `stageLease` promise chain, re-adds the view and `applyStage()`.
   - `:564-570` `tracer.start` + `tracer.incr("actions.proposed")` (SQLite upsert, `services/tracing.ts:96-102`).
6. `apps/runtime/src/execution/executor.ts:217-296` — `executeProgram` → `makeStepRunner().runOne` (`:108-155`) → `runStep` switch (`:40-98`) → `page.click(target)`.
7. `packages/browser-driver/src/playwright-page.ts:307-310` `click` → `resolveLocator` (`:253-303`):
   - `parseTarget` (`ref-registry.ts:42-57`) → `refs.resolve` (in-memory Map) → `SelectorStrategy {role, css, xpath, text}` + frame key.
   - `:274-277` builds attempts **in order role → css → xpath → text**; `:282` `await loc.count()` — one Playwright injected-script round trip; for `getByRole(...,{exact:false})` Playwright computes accessible names across the DOM. If `count>1`: `:286-287` `filter({visible:true}).count()` (second round trip) then throws `target_ambiguous` if still >1.
   - `:309` `loc.click({timeout})` — Playwright actionability loop (attached/visible/stable/enabled, scrollIntoViewIfNeeded, hit-target probe, `Input.dispatchMouseEvent` ×3). *est. 6–10 CDP messages, 30–80 ms on a normal page.*
8. `executor.ts:114-119` — `step.expect` conditions → `playwright-page.ts:469-514` `waitFor` (locator `waitFor` / `waitForURL`; `navigationSettled` also waits for `load` up to 10 s).
9. `pages.ts:589-604` `onStep` — `tracer.incr` ×2–3 (SQLite each), `recordStep` → `repo.saveStep` (SQLite), then `ctx.onStep` → in agent runs `events.emit(StepFinished)` → `events.ts:11-22` `repo.appendEvent` (SQLite) + WS broadcast (`server.ts:58-61`) + fork-IPC notify (`main.ts:234`).
10. `pages.ts:610-622` — `releaseStage` IPC, `persist()` again (SQLite ×(1+N tabs)), `span.end` (SQLite `INSERT` + `appendFileSync spans.jsonl`, `tracing.ts:40-74`), `tracer.incr`.
11. `handlers.ts` → `server.ts:88` `JSON.stringify({result})` → MCP `client.ts:20` `res.json()` → `main.ts:14` `JSON.stringify(v, null, 2)` onto stdio.
12. The agent now needs the new state, so a second tool call: `main.ts:44-57` `vector_page_observe` (schema accepts **only** `pageId`; no scope/limits) → steps 2–4 again → `pages.ts:469-517` `observe()`:
   - `enqueue` → `playwright-page.ts:544-649` `observe()`: `assignFrameKeys`; **serial** `for` over frames: `sameOriginOf` (possible bounded `evaluate`) then `frame.evaluate(collectObservation, …)` (bounded 10 s).
   - `observe-script.ts:33-409` runs on the renderer main thread: `querySelectorAll(INTERACTIVE)` + `querySelectorAll("*")` per shadow container (`:255-269`); per interactive element `getComputedStyle`+`getBoundingClientRect` (`:87-92`), `innerText` (`:129, :319` — forces layout), `cssPath` (`:138-186`, walks up to 12 ancestors filtering `children`), `xpathOf` (`:188-210`); form-field pass **recomputes `cssPath`** for each of ≤60 fields and linear-scans elements (`:341`); tables; `mainEl.innerText`; shadow text walk over `querySelectorAll("*")` again (`:387-396`).
   - `:626` `refs.register`; `:630` `await this.title()` — an **extra** CDP round trip although `part.title` was already returned by the script.
   - back in `pages.ts:483-508`: `diffObservations` (O(lines²) `includes`), `repo.saveObservation` (`INSERT` + `DELETE … NOT IN (subselect)`), `persist()`, `events.emit(Observation)`.
   - Full `Observation` JSON (every element with `selector.css`, `selector.xpath`, `rect`, `text`, …) returned and pretty-printed to the MCP client.

## A2. Agent goal loop (`apps/runtime/src/agent/coordinator.ts:247-658`)

Per iteration:
- `:366` `pages.observe(activePageId, obsReq)` — full scope unless the previous plan asked otherwise. No "has the DOM changed" check; always re-runs the script.
- `:384` `saveObservation` → `services/runs.ts:72-79` `artifacts.save` → `mkdirSync` + `writeFileSync` (30–100 KB JSON) + SQLite + event (SQLite + WS + IPC).
- `:387-408` no-progress signature; `:410` `setStatus("planning")` → `getRun` SELECT + `saveRun` + 2 events.
- `:412-419` `buildPlannerPrompt` (`planner.ts:247-275`): GOAL, PAGES, REPAIR note, `renderObservation` (`planner.ts:4-70`: header, headings, form fields, one line per element `r12 role "name" value=…`, tables ≤6×12 rows, text ≤6000 chars with repetitive-line collapse, `changesSince`), last 24 outcomes with extracted values trimmed to 500 chars. Static `PLANNER_SYSTEM` (`planner.ts:72-103`).
- `:420-427` `generateStructured` (`gateway-client.ts:42-116`): `generateObject`, `maxRetries:0`, `maxOutputTokens: 8192`, gateway `sort:"ttft"`, `caching:"auto"`, `openai.reasoningEffort:"minimal"`. **Not streamed.** On any failure: JSON-in-text fallback (`:79-86`) and possibly a second retry at 2× tokens (`:94-101`) — up to three network calls counted as one `modelCalls++` (`coordinator.ts:428`).
- `:442-470` vision fallback (screenshot via `pages.capture` → Playwright PNG + extra `evaluate` for viewport meta → `generateText` with image) when `visionPending` or `thinObs` (0 elements and <80 chars text).
- `:580-593` `pages.execute({pageId, documentEpoch, steps})` — up to 24 steps (schema), prompt asks for 1–8.
- Actions → elements: refs `rN` → `RefRegistry` per pageId (`ref-registry.ts:7-35`; cleared on main-frame `framenavigated`, `playwright-page.ts:71-78`) → `SelectorStrategy` → `resolveLocator` (role first).

---

## B. Findings (ranked)

### P0

**P0-1. Model turn latency is the critical path and nothing overlaps it.**
Evidence: `coordinator.ts:420-427` awaits the complete `generateObject`; `gateway-client.ts:52-67` uses `generateObject`, not `streamObject`; `pages.execute` starts only after the whole plan validates (`coordinator.ts:581`). A PlanChunk with 6–8 steps (ids, ops, targets, values, `expect` conditions, message) is ~300–600 output tokens.
Impact (*est.*): 3–8 s per iteration at typical 60–120 tok/s output, i.e. ≥80 % of wall time of every iteration; browser work per iteration is ~100–400 ms.
Fix: switch to `streamObject`/partial-JSON streaming and dispatch step *k* as soon as it is complete and valid (steps are already executed sequentially, so semantics are unchanged); keep the existing convergence guards on the completed plan. Secondary: shrink output — drop `id` (assign server-side), make `message` optional on `continue`, default `expect` to server-inferred readiness. Expected saving: most of output-token time, 2–5 s per iteration.

**P0-2. External agents need two LLM turns per action; the observe payload is 5–10× too large.**
Evidence: `pages.execute` returns only `ProgramResult` (`handlers.ts:55-58`, `contracts/api.ts:320`); MCP `vector_page_observe` accepts only `pageId` (`mcp/main.ts:48`) and returns `JSON.stringify(obs, null, 2)` of the full `Observation` (`mcp/main.ts:14`) including `selector.css`, `selector.xpath`, `rect` for up to 120 elements (`observe-script.ts:297-303`) plus 6000 chars of text. `renderObservation` (`planner.ts:4-70`) — the compact form the internal planner gets — is not reachable via the API.
Impact (*est.*): 30–60 KB (~8–15k tokens) per observe into the external model vs ~2–5k for a Playwright-MCP snapshot; plus one extra LLM turn (2–6 s) per action just to request the observation. For an external agent this alone doubles per-action latency.
Fix: (a) add `returnObservation?: {scope, compact:true}` to `pages.execute` and return `{result, observation}` in one round trip (Playwright-MCP semantics); (b) add a `format: "compact"` option to `pages.observe` that returns `renderObservation()` text plus a minimal element list without selectors/xpath/rect (keep them server-side in `RefRegistry`); (c) expose `scope/maxElements/maxTextChars` on the MCP tool; (d) have the MCP client cache `runtime.json` and use a keep-alive agent.

**P0-3. Ref resolution goes role+substring first → slow and spuriously ambiguous, and each false failure costs a full recovery cycle.**
Evidence: `playwright-page.ts:274-277` pushes `getByRole(role,{name, exact:false})` before `css`; `:282-291` a name such as "Save" that also occurs in "Save draft" yields `count>1`, then a second `count()`, then `target_ambiguous` — even though the observation already computed a unique `cssPath`/`xpath` for exactly this element (`observe-script.ts:301`). Failure → `coordinator.ts:600-606` sets `visionPending` → next iteration re-observes, screenshots, calls the vision model, replans.
Impact (*est.*): +20–100 ms per action on large DOMs for the accessible-name computation (Playwright computes names for all role matches); each spurious ambiguity burns one full iteration (observe + screenshot + vision LLM + planner LLM ≈ 5–15 s).
Fix: resolve refs by the unique path first (`css` → `xpath`), fall back to role/text only when the path matches 0 elements; better, capture a CDP `backendNodeId` per element during observe (`DOM.describeNode` is unnecessary — use a `DOMSnapshot`/`Runtime.evaluate` returning object handles, or Playwright's `aria-ref`-style live registry) so a ref resolves in one hop with no search.

### P1

**P1-1. Stage lease is a global mutex over all interactive programs.**
Evidence: `apps/desktop/main/index.ts:38-40, 162-175` one `stageLease` promise chain for the whole app; `pages.ts:555-560` every program with any of `INTERACTIVE_OPS` acquires it for the program's entire duration (including its `waitFor`/`extract` steps). `docs/architecture.md:113-122` describes this as by design; `docs/runtime-vnext/audit.md:69` claims "Global serialization — none found".
Impact: `sets.map` with `maxWorkers=4` (`settings.ts:96-101`) runs interactive members strictly one at a time in the desktop shell; a human browsing while an agent runs also flips the visible view every program. Throughput ceiling = 1 interactive program at a time.
Fix: keep background views *visible but offscreen/1×1* (Chromium still lays them out, so Playwright actionability and `Input.dispatch*` work) instead of `setVisible(false)`; or use DOM-level dispatch (`el.click()`, value+`input`/`change` events) as the default for `fill/select/check/click` and escalate to trusted input only when a step's `expect` fails. Either removes the mutex for the common case.

**P1-2. Passive response capture does heavy synchronous work on the runtime thread during every page load.**
Evidence: `playwright-page.ts:31-33, 99-103, 114-150` — for every response whose content-type matches `/json|text\/|xml|javascript|…|html/` it awaits `response.body()` (full body over CDP, *then* truncates at 256 KB); `services/responses.ts:37-62` → `artifacts.save` (`artifacts.ts:26-32`: `mkdirSync` + `writeFileSync` per response) + `repo.saveResponse` + `events.emit(ArtifactAdded)` (SQLite + WS broadcast + fork-IPC to shell → renderer). Default **on** (`VECTOR_CAPTURE_RESPONSES !== "0"`).
Impact (*est.*): 50–150 responses per real page load → 50–150 sync file writes, 300+ SQLite autocommits, 150 IPC frames, and CDP `Network.getResponseBody` traffic for every script/CSS file — 100–500 ms of runtime-thread stall exactly when `observe`/`execute` are queued behind `page.goto`.
Fix: capture bodies only for `resourceType in {xhr, fetch}` with JSON/text content types; skip `script/stylesheet/document/font`; write bodies with `fs.promises` in a batched queue; batch metadata inserts in one transaction per 50 ms; do not emit a bus event per response.

**P1-3. `pages.open` / worker-page lifecycle is expensive and not pooled.**
Evidence: `pages.ts:179-243` opens `about:blank`, awaits native `createPage` IPC, then `driver.attach` which loops (`cdp-driver.ts:104-140`) calling `identityOfPage` (a bounded `page.evaluate` per **every** open page, serially, `:76-81`) and on every 150 ms iteration also runs `attachDirect` — for the vector driver that `connectOverCDP`s a **new** websocket to **every** target from `/json/list`, evaluates the marker, and closes it (`vector-electron.ts:22-53`). Then a second navigation to the real URL awaiting `domcontentloaded` (`pages.ts:238-240`), then `activate` IPC. `set-runner.ts:209-214` closes the worker after every member, so each member pays all of this again.
Impact (*est.*): 300–1500 ms per page open on a warm shell, more with many tabs; per set member.
Fix: register the marker→page mapping from the `context.on("page")` event instead of scanning; only call `attachDirect` after the scan loop times out; navigate directly to the URL once listeners are wired at creation (they can be wired before `loadURL` by attaching on the `page` event); keep a warm pool of worker pages per origin instead of open/close per member.

**P1-4. `sets.map` learns the replay program too late for parallel members.**
Evidence: `set-runner.ts:88-132` starts all jobs concurrently (`Promise.all`); `learned` is only assigned after the first member finishes (`:111-121`), so the first `concurrency` members (default 4) all run the model-driven `runMemberAgent` (`member-agent.ts`, up to 6 model calls each).
Impact: for a 20-member set, ~4× the model calls and wall time of a pilot-then-fan-out strategy for the first wave.
Fix: run one pilot member, compile its program, then fan out the remainder with replay-first/agent-on-divergence.

**P1-5. Observation is taken with no readiness signal after navigation, and a thin observation triggers a vision call.**
Evidence: `navigate` returns at `domcontentloaded` (`playwright-page.ts:193-195`); the next iteration observes immediately (`coordinator.ts:366`); `thinObs` (`:442`) on an SPA that has not rendered yet sends the run down the screenshot+vision path (`:446-461`), consuming the once-per-run vision budget.
Impact (*est.*): 3–10 s wasted per false-thin observation; stale observations cause action failures that cost a repair iteration.
Fix: before observing, wait bounded (≤500 ms) for a quiescence signal: two `requestAnimationFrame`s plus no in-flight fetch/XHR (hook via `addInitScript`) plus no DOM mutations for ~100 ms; expose it as `waitFor {kind:"settled"}` and use it as the implicit post-`navigate` condition. This is a readiness signal, not a fixed sleep.

### P2

**P2-1. Per-step and per-observe synchronous persistence overhead.** `tracing.ts:96-102` `incr` is a SQLite upsert called 3–4× per step (`pages.ts:570, 591-593, 621`); `saveStep` (`pages.ts:594`), `appendEvent` per bus event (`events.ts:12`), `persist()` twice per program each doing `upsertPage` + `saveTabs` (`DELETE` + N `INSERT`, `repo.ts:85-92`), `saveObservation` `INSERT`+`DELETE` with subselect (`repo.ts:267-277`), artifact `writeFileSync` of the observation JSON per iteration (`runs.ts:72-79`), `appendFileSync` per span (`tracing.ts:57-70`). `db.ts:9` sets WAL but not `synchronous=NORMAL`, so every autocommit fsyncs. *est.* 0.3–2 ms each, 8–15 per step, 10–20 per observe → 10–60 ms per action, more on slow disks. Fix: `PRAGMA synchronous=NORMAL`, in-memory counters flushed on a timer, one transaction per program for step/span rows, async artifact writes, stop calling `saveTabs` from `persist()` on non-tab changes.

**P2-2. Observe script cost on the renderer main thread.** `observe-script.ts`: `innerText` on every interactive element (`:129, :319`) and on `main` (`:365`) forces style/layout; `cssPath` recomputed for form fields (`:341`) and `result.elements.find` per field (O(120×60)); `querySelectorAll("*")` twice (`:263, :388`); `xpathOf` computed for every element though only used as a third fallback. *est.* 20–80 ms typical, 200 ms+ on heavy pages, serial per frame (`playwright-page.ts:585-624`), plus the redundant `title()` round trip (`:630`). Fix: use `textContent` where possible, compute `cssPath` once and map by element, drop `xpath` or compute lazily, run frames with `Promise.all`, use `part.title`. Longer term: CDP `DOMSnapshot.captureSnapshot` (one round trip, native layout data) as the primary source.

**P2-3. No observation caching/dirty tracking.** `pages.observe` always re-runs the full script (`pages.ts:473-475`) even if nothing changed; `diffObservations` (`:519-539`) diffs text lines but the full content is still serialized, persisted and sent to the model. Fix: install a `MutationObserver` counter via init script; if unchanged since last observe (same epoch, counter, scroll, viewport) return the cached observation and skip persistence; send only `changesSince` to the model on unchanged elements.

**P2-4. `extract` does 2 round trips per field.** `playwright-page.ts:667-780`: `first.count()` then `first.evaluate()` (or `getAttribute`) per field, serial. Fix: one `page.evaluate` that resolves all selectors and returns all fields.

**P2-5. Zero-model `operations.invoke` still takes a full observation.** `operations.ts:241-249` runs `pages.observe(pageId, {})` (full script + persistence + event) to check control guards. *est.* 30–150 ms on a path advertised as "5 ms". Fix: check guards with a single `evaluate` of the required role/css selectors.

**P2-6. Structured-output fallback multiplies latency silently.** `gateway-client.ts:75-115`: any `generateObject` error (including transient network errors) triggers a second and possibly third model call at 2× tokens; only one `modelCalls++` is recorded (`coordinator.ts:428`). Fix: distinguish provider "unsupported" from transient errors; count every call; cache the capability per model id.

**P2-7. Fixed sleeps that do exist.** `collectScroll` `settleMs` default 180 ms with repeated settles (`playwright-page.ts:441-463`); attach poll 150 ms (`cdp-driver.ts:134`); `setCookies` poll 120 ms (`:232`); `waitIfPaused` 120 ms poll (`coordinator.ts:231`). Only `collectScroll` is on the action path (*est.* 0.2–1 s per collect). Replace with a `MutationObserver`/scroll-height-change wait.

**P2-8. `typeText` default 20 ms per keystroke** (`playwright-page.ts:323`) — 100 chars = 2 s. The prompt steers to `fill`; keep `type` only for autocomplete widgets and default `delayMs` to 0.

**P2-9. `navigationSettled` waits for `load`** (`playwright-page.ts:490-493`, up to 10 s) — third-party resources gate the agent. Prefer the quiescence signal from P1-5.

---

## C. State-of-the-art comparison

| Capability | State of the art | Vector | Verdict |
|---|---|---|---|
| Structured snapshot with stable refs | Playwright-MCP aria snapshot (`e12` refs from the a11y tree); browser-use indexed DOM | Custom in-page DOM walk (`observe-script.ts`), refs `r1…`, forms with validity, tables, shadow DOM, viewport-first ordering | Match; leads on forms/tables/shadow, lags on a11y fidelity (heuristic names) and cost (JS on main thread vs native tree) |
| Ref → element resolution | PW-MCP `aria-ref` engine resolves directly to the node (1 hop) | Role+substring-name search first, then css/xpath (`playwright-page.ts:274-303`) | **Lag** (P0-3) |
| Multi-action plan per LLM turn | browser-use multi-action; PW-MCP one tool call per turn | 1–8 typed steps + `expect` conditions per turn (`plan.ts:16`) | **Lead** |
| Act + observe in one round trip | PW-MCP returns snapshot with every action result | `pages.execute` returns outcomes only; separate observe call | **Lag** (P0-2) |
| Observation diffing | Rare in the field | `changesSince` lines appended, but full observation still sent and persisted | Partial lead, unfinished (P2-3) |
| Compact observation for external agents | PW-MCP YAML-ish snapshot ~2–5k tokens | Full JSON incl. selectors/xpath/rect via MCP | **Lag** (P0-2) |
| Deterministic structured extraction | Stagehand `extract` uses an LLM | `extract`/`collectScroll` with no model | **Lead** |
| Cached programs replayed without a model | Stagehand action cache; Skyvern workflows | `programs`, `operations` w/ guards + promotion, `sets.map` learned replay | **Lead** (but P1-4 blunts it) |
| Raw CDP vs Playwright | PW-MCP/Stagehand on Playwright; a few tools raw CDP | Playwright-core over CDP for everything | Match; raw-CDP (`DOMSnapshot`, `Input.dispatch*`) would cut per-action round trips 3–5× |
| Streaming plan → speculative execution | Not common yet; clear frontier | None (`generateObject`) | **Lag** (P0-1) |
| Concurrent tabs / parallel work | Headless tools: trivially parallel | `WorkerPool` 4/2-per-origin, but stage lease serializes interactive work in the shell | Match headless, **lag** in desktop (P1-1) |
| Vision | Computer Use always; Stagehand optional | Fallback only, once per run | Lead on speed |
| Readiness signals vs load events | Mixed; most wait `load`/network-idle | `domcontentloaded` + condition waits; no quiescence signal; `navigationSettled` waits `load` | Match, could lead (P1-5) |

## D. Top 5 changes for per-action latency

1. **Stream the plan and execute steps as they arrive** (`gateway-client.ts` → `streamObject`; `coordinator.ts:420-593`). Removes most output-token wait from each iteration (*est.* −2–5 s/iteration).
2. **Return a compact observation from `pages.execute`, and add a compact/scoped observe to the API and MCP tool** (`handlers.ts:55`, `mcp/main.ts:44-77`, reuse `planner.ts:renderObservation`). Halves LLM turns for external agents and cuts observe payload 5–10×.
3. **Resolve refs by unique path / node handle first; role/text only as fallback** (`playwright-page.ts:274-277`). Eliminates spurious `target_ambiguous` recovery cycles and 20–100 ms of name computation per action.
4. **Remove the global stage lease from the common path** (offscreen-visible views or DOM-level dispatch with trusted-input escalation; `index.ts:162-185`, `pages.ts:555-560`). Restores real parallelism for sets and stops view flipping.
5. **Make persistence and response capture asynchronous and filtered** (`playwright-page.ts:114-150`, `responses.ts`, `artifacts.ts:26-32`, `tracing.ts`, `events.ts`, `db.ts` `synchronous=NORMAL`). Removes 100–500 ms stalls during page loads and 10–60 ms of fsync'd writes per action.

## E. Benchmarks — what exists and what does not

- `package.json:20` `"bench": "node tests/benchmarks/run.mjs"` — **`tests/benchmarks/` does not exist** (verified by `find`). `pnpm bench` fails.
- `apps/runtime/src/services/bench.ts` (reachable via RPC `bench.run`) opens one background page on the records fixture and times `pages.observe` and a single `hover` dispatch, N repeats, mean/p95/min/max, writes JSON to `<dataDir>/benchmarks/`. It measures the browser layer only: no model calls, no end-to-end task time, no `pages.open` cost, no click/fill (hover skips most actionability checks), no ref-resolution failures, no multi-frame or heavy real-world pages, no MCP path.
- `docs/runtime-vnext/progress.md:74-76` cites `benchmarks/manifests/tasks.json`, `benchmarks/reports/vnext-<ts>.json`, and measured numbers ("operation-invoke 5ms · T03 22.7ms · T05 60.3ms …"); `audit.md:42,83-85` and `implementation-map.md:22` cite the same files. **None exist in the repository.** These claims are unverifiable.
- Tests (`tests/unit`, `tests/integration`, `tests/e2e`) contain **no latency assertions** (grep for `toBeLessThan`/`p95`/`latency` finds only a pool-size bound and a fixture edit count). Nothing would catch a regression such as P0-3, P1-2, or a doubled observe time.
- Recommended minimum: a checked-in harness that, against the fixtures, records per-stage spans (open, observe, resolve, dispatch, expect, persist, model) for a scripted 10-step program and a mocked-model agent run, with thresholds gated in CI; plus an MCP-path variant that measures payload bytes/tokens per observe and calls per action.

## F. Docs vs code contradictions

| Doc claim | Code |
|---|---|
| `mcp.md:22` "Tools (17)" | 29 tools registered in `packages/mcp/src/main.ts` |
| `mcp/main.ts:66` tool description: steps like `{op:'click', target:{ref:'r3'}}`; `:63` ops "wait/keyboard" | `StepSchema` `target` is a **string** (`program.ts:49-52`); ops are `waitFor`, `press`, `type` — no `wait`/`keyboard`. Wrong examples cost external agents an `invalid_params` round trip |
| `mcp/main.ts:67, 72` `vector_page_execute` accepts `verify` | `PagesExecuteParams = z.object({program})` (`api.ts:43`) strips it; `verify` is never read |
| `architecture.md:69-70` ops "navigate/click/fill/select/wait/extract/keyboard"; `api.md:116-119` lists `drag` | Ops are `waitFor`, `press`, `type`, `dragTo` (`program.ts:62-176`) |
| `audit.md:71` "Fixed waiting — none: all waits are condition-based" | `collectScroll` `settleMs` sleeps (`playwright-page.ts:441-463`), attach poll (`cdp-driver.ts:134`), cookie poll (`:232`), pause poll (`coordinator.ts:231`), `navigationSettled` waits `load` (`playwright-page.ts:492`) |
| `audit.md:69` "Global serialization — none found" | Global `stageLease` serializes all interactive programs (`index.ts:38-40, 162-175`) |
| `audit.md:20,42`, `implementation-map.md:22`, `local-testing.md:50`, `progress.md:10,74-76`: `tests/benchmarks/run.mjs`, `benchmarks/manifests/*`, `benchmarks/reports/*`, measured timings | None of these files exist; `pnpm bench` points at a missing file |
| `progress.md:87` "Speculative prefetch … not implemented (§12.6 optional)" | Accurate — but it is the single largest lever (P0-1), not optional for the speed goal |
| `settings.ts:102-104` `maxModelCalls` default 2 exposed in settings | Never passed to runs; coordinator uses `DEFAULT_MAX_MODEL_CALLS = 40` (`coordinator.ts:60`, `runs.ts:137-186`) — dead setting |
| `architecture.md:74-79` "structured output … reasoning models get extra output-token headroom" | `reasoningEffort:"minimal"` is set only under the `openai` provider key (`gateway-client.ts:65`); the 2× headroom applies only in the text fallback's second retry (`:99`) |
| `api.md:38` `pages.observe … sinceRevision?` | Accepted by schema (`observation.ts:118`) but never read; no delta-since-revision behaviour exists (`pages.ts:469-517`) |
