# Loopback API

The runtime serves HTTP + WebSocket on `127.0.0.1`. At startup it writes
`<dataDir>/runtime.json`:

```json
{ "port": 58781, "token": "…", "pid": 1234 }
```

Every HTTP request needs `Authorization: Bearer <token>`; `?token=` is
accepted **only** on the WebSocket upgrade (`/ws`), never on `/rpc`.
`GET /health` is the only unauthenticated route. `runtime.json` is written
`0600` inside a `0700` data dir.

## RPC

```
POST /rpc
{ "method": "<name>", "params": { … } }
→ 200 { "result": … }  |  200 { "error": { "code", "message", "detail"? } }
→ 400 bad JSON · 401 missing/bad bearer · 404 unknown method · 413 body > 2 MB
```

## Events

```
GET /ws?token=…        → server-sent JSON event stream: { "event": … }
events.since { sinceSeq, limit } → missed events (durable log)
```

The socket also accepts RPC frames `{ "id", "method", "params" }` and answers
`{ "id", "result" }` or `{ "id", "error" }` — the `id` is always echoed, and
`method` is validated against the same method table as `/rpc`.

## Methods

### Pages

| Method | Params | Notes |
|---|---|---|
| `pages.list` | `backend?, includeDetached?` | all pages, optionally one backend |
| `pages.open` | `url, backend?, background?, activate?, targetId?` | Omit `backend` for policy routing. Explicit `vector` selects embedded Chromium, `vector-engine` forces the engine (no fallback), and `chrome` requires `targetId` of an existing attached tab. The result (`PageTarget`) carries `routeReason` — see [Backends and routing](#backends-and-routing) |
| `pages.close` | `pageId` | borrowed chrome tabs are detached, not closed |
| `pages.activate` / `pages.navigate` / `pages.back` / `pages.forward` / `pages.reload` / `pages.stop` | `pageId` (+`url`) | navigation bumps `documentEpoch`. `pages.activate` on a `vector-engine` page marks it active (no native Chromium view) |
| `pages.observe` | `pageId, scope?, subtreeRef?, maxElements?, maxTextChars?, format?, sinceRevision?` | structured observation: elements+refs, forms, links, tables, frames, text, headings. `format: "compact"` returns `{ observation: { pageId, url, title, documentEpoch, revision, text, refs: [{ ref, role?, name? }] } }` — the rendered text the planner reads plus a minimal ref list, no selectors/rects (5–10× smaller). Every observe is a full snapshot with a `changesSince` diff computed by the runtime against the previous observation. On Chromium `sinceRevision` is accepted and ignored; on `vector-engine` it is forwarded and the engine's own journal-derived `changesSince` lines come back appended as one extra `refs changed: …` entry |
| `pages.execute` | `program, returnObservation?` | run a typed program on one page. `returnObservation: { scope?, subtreeRef?, format?, maxElements?, maxTextChars? }` observes the page after the program and returns it as `observation` alongside the result (act-and-observe in one round trip; best-effort if the page detached). On `vector-engine` a flat `steps` program plus its observation is a single native call. The result is a `ProgramResult`; `fallback` is set when the engine hit `capability_unsupported` mid-program and the page moved to Chromium (below) |
| `pages.extract` | `pageId, fields?` | structured fields from the current observation (`url`/`title`/`text`/`headings`/`formFields`/`tables`/`links`/`dialogs`, or an element ref/name). Objects `{name, selector?, attribute?, all?}` go through the driver's CSS extract. Empty `fields` returns the default observation slice |
| `pages.waitFor` | `pageId, condition` | one `waitFor` program step; `{ok, timedOut, detail, status}` |
| `pages.console` | `pageId, since?, limit?` | captured `console.*` lines (engine observe payload, Playwright `page.on("console")`) |
| `pages.dialog` | `pageId, action?, promptText?` | `action: list` (default) returns pending dialogs; `accept`/`dismiss` runs a `dialog` step |
| `pages.network` | `pageId, since?, urlIncludes?, limit?` | captured HTTP responses (same store as `responses.list`) |
| `pages.capture` | `pageId, fullPage?, format?` | screenshot; `format:"artifact"` stores it. On `vector-engine` this is a software PNG (system fonts via `fontdb`) |
| `pages.find` / `pages.stopFind` | `pageId, text, forward, findNext` | native find-in-page; hidden pages fall back to a DOM count |
| `pages.zoom` | `pageId, level?, delta?, reset?` | per-origin persistent zoom |
| `pages.takeover` / `pages.resume` | `pageId` | human/agent control handoff |
| `pages.openLive` | `pageId` | bring a runtime-owned page into the visible shell |

### Backends and routing

`Backend` (`contracts/ids.ts`, `BackendSchema`) is `"vector" | "chrome" |
"vector-engine"`:

| Backend | What it is |
|---|---|
| `vector` | Vector's own Chromium — the Electron `WebContentsView` in the shell, headless Chromium in standalone mode |
| `chrome` | the user's Chrome attached over CDP (`chrome.attach`); tabs are borrowed |
| `vector-engine` | Vector's Rust engine (`@vector/engine-native`, `engine/`); process-isolated in production |

`settings.engineMode` (`EngineModeSchema`: `"off" | "auto" | "always"`)
decides where an open with no backend lands. `backend: "vector"` explicitly
selects embedded Chromium. The desktop default is `auto`; a stored setting
wins over the env. `VECTOR_ENGINE_PROFILE=production` forces process-isolated
`ve-host`, while `VECTOR_NATIVE_ONLY=1` disables Chromium fallback. In `auto`,
ordinary HTTP(S) origins stay on Chromium. Origins matched by
`settings.engineCohorts` (or `VECTOR_ENGINE_COHORTS`) and safe `about:`/`data:`
documents may use the engine with fallback. The router
(`apps/runtime/src/services/router.ts`) is deterministic and returns the
decision as `PageTarget.routeReason`:

| `routeReason` | Meaning |
|---|---|
| `engine-mode-off` | `engineMode: off` — Chromium |
| `explicit-backend:vector` / `explicit-backend:chrome` / `explicit-backend:vector-engine` | caller named the backend; no fallback |
| `engine-always` | `engineMode: always` (developer profile) — engine, no fallback |
| `native-only` | `VECTOR_NATIVE_ONLY=1` — engine, no Chromium fallback |
| `native-only:engine-unavailable` | production profile and the engine did not connect |
| `hybrid:engine-unavailable` | `auto`, but the addon is not loaded/connected — Chromium |
| `unsupported-scheme:<scheme>` / `unparseable-url` | `auto`, URL the engine cannot open (it opens `http:`, `https:`, `file:`, `data:`, `about:`) — Chromium |
| `needs-chromium-table:<reason>` | `auto`, origin recorded as Chromium-only within the last 24 h — Chromium |
| `hybrid:chromium-default` | `auto` — unqualified origin, opened on embedded Chromium |
| `hybrid:qualified-cohort:<cohort>` | `auto` — origin is explicitly qualified for the Vector Engine |
| `hybrid:engine-safe-scheme:<scheme>` | `auto` — `about:` or `data:` document on the Vector Engine |
| `engine-always(classified:<reason>)` / `explicit-backend:vector-engine(classified:<reason>)` | the document was classified script-dependent but fallback is not allowed, so the page stays on the engine |
| `fallback:<reason>` | `auto`: the engine classified the document as script-dependent (`empty-shell`, `empty-root-container: …`, `empty-viewport: …`, `noscript-requires-js`, `meta-refresh-javascript`, `body-onload`, `form-onsubmit`, `template-heavy`, `unsupported-content: …`) or failed mid-program / open (`mid-program:<op>:<message>`, `backend_unavailable`, `internal`); the page was reopened on Chromium and the origin recorded in the needs-chromium table |

Mid-program fallback: when a step on an engine page fails with
`capability_unsupported`, `backend_unavailable`, or `internal`, the runtime
moves the page to Chromium at its
current URL (same `pageId`, new `targetId`, `documentEpoch` bumped, a
`page.updated` event with the new `routeReason`), records the origin, takes a
fresh observation, and replays remaining read-only steps there. A completed
or pending write stays failed with `repair: true` so it cannot be duplicated. `ProgramResult`
then carries:

```json
"fallback": { "from": "vector-engine", "to": "vector", "reason": "mid-program:hover:…",
              "replayedFrom": 2, "repair": false, "refSteps": [] }
```

`replayedFrom` is the index of the first step run on Chromium. Engine refs
(`r<n>`) are arena indices and mean nothing on Chromium, so when any
remaining step (target, `dragTo.to`, `refReady`) names a ref the program
stays `failed` with `repair: true`, `refSteps` listing them, and an error
starting `REPAIR:` — re-observe and replan. If no Chromium backend is
connected the engine result stands, annotated with `fallback.repair: true`
and `fallback unavailable` in `error`.

`runtime.describe` → `engine` reports `{ available, version, abiVersion,
binaryPath, capabilities, error?, mode, connected, needsChromiumOrigins }`
— `capabilities` is the addon's own `describe()` map (`screenshot`,
`evaluate` (V8), `history`, `isolatedContexts`, `cookies`, `fileUrls`,
`postForms`, `xpath` (false), `dialogs`, `downloads`) — and
`features.routeFallback: true`. Engine sessions appear in `sessions.list`
as `backend: "vector-engine"` (`connected` or `disconnected` with the
loader's diagnostic).

### Programs

`programs.list` · `programs.run { programId, pageId, parameters? }` ·
`programs.save { name, siteKey?, steps? | nodes?, description?, parameters? }` ·
`programs.delete { programId }`.

Programs are typed step arrays (or control-flow `nodes`); `runs` increment
use counts on successful replay. `parameters` are applied by `{{name}}`
substitution inside the saved steps (values are JSON-string-escaped, so a
parameter can never break out of the field it fills); a placeholder with no
value fails with `invalid_params` and `detail.missing`.

### Sets

`sets.create { name, source?, urls?, pageIds?, records?, collectFromPageId?,
linkSelector? }` — members come from `urls`, existing `pageIds`, `records`
(one member per record), or the links collected from `collectFromPageId` ·
`sets.get` · `sets.list` ·
`sets.map { setId, program? | programId? | goal?, concurrency?, memberIds? }`
→ `runId` — `concurrency` caps this map on top of the global worker pool
(`settings.maxWorkers`/`perOrigin`, applied live) ·
`sets.results { setId, status? }`.

Set runs honor `runs.pause` (queued members wait; in-flight members finish),
`runs.resume`, and `runs.cancel` (in-flight member agents are aborted and
unfinished members are marked `skipped`; the run stays `cancelled`).

### Runs

`runs.start { goal, pageId?, pageIds?, setId?, modelId?, chatId?, context?,
maxSteps?, maxModelCalls?, deadlineMs? }` → `runId` — `chatId` groups
runs into durable chat threads (the agent rail scopes history and
follow-up context per thread); `context` (≤ 20 000 chars) is
shown to the planner as "EARLIER IN THIS SESSION"; `deadlineMs` aborts the
run mid-call when it elapses; each model call is capped at 90 s
(`VECTOR_MODEL_CALL_TIMEOUT_MS`) ·
`runs.get { runId }` → `{ run, steps, modelCalls }` · `runs.list { limit? }` ·
`runs.pause` / `runs.resume` / `runs.cancel { runId }` ·
`runs.answer { runId, answer }` — reply to an agent question ·
`runs.events { runId, sinceSeq? }`.

### Artifacts

`artifacts.list { runId? }` · `artifacts.read { artifactId }` → metadata +
base64 data.

### Sessions / Chrome

`sessions.list` · `chrome.attach { port }` · `chrome.detach` ·
`chrome.tabs` · `chrome.openLive { pageId }` — surface an attached tab in the
desktop shell.

`chrome.importCookies { source?: "auto" | "attached" | "profile" }` →
`{ imported, skipped, domains, source, detail }` — bring Chrome's session
cookies into Vector's profile partition so signed-in sites just work.
`auto` prefers an attached Chrome (`Storage.getCookies` — decrypted by Chrome
itself, covers app-bound cookies); `profile` reads Chrome's on-disk Cookies
DB and decrypts v10/v11 values with the "Chrome Safe Storage" keychain entry
(macOS prompts for permission). Cookie values are injected into the profile
session and never logged or returned.

### Workspace & misc

`workspace.get` → `{ pages, sets, members, runs, sessions, activePageId,
lastSeq }` (renderer sync snapshot; settings come from `settings.get`) ·
`settings.get` / `settings.set { gatewayApiKey?, plannerModel?,
recoveryModel?, visionModel?, searchEngine?, maxWorkers?, perOrigin?,
maxModelCalls?, theme?, zoomFactor?, engineMode? }` — `plannerModel`
defaults to `alibaba/qwen3.8-27b` (also `openai/gpt-5.6-luna-fast`);
`maxModelCalls` is `0` for no cap; `visionModel`
is unset unless configured; `engineMode` is `"off" | "auto" | "always"` and
takes effect on the next `pages.open` ·
`models.list` / `models.probe` ·
`history.list` / `history.clear` · `bookmarks.list|add|remove` — add/remove
emit `bookmarks.changed` with the updated list so live clients stay in sync ·
`bench.run { task?, repeats? }` → `{ reportPath, summary }` — `task` is the
URL to observe (default the records fixture), always on the `vector`
backend; report JSON lands in `<dataDir>/benchmarks/`. The checked-in
end-to-end harness is `pnpm bench` (`tests/benchmarks/run.mjs`):
`--backend chrome|vector-engine|both` (default `both`) runs the same
iterations against a runtime with `engineMode: off` and one with
`engineMode: always` and prints them side by side; `--repeats`, `--warmup`,
`--label`, `--runtime <dist/index.js>`, `--out <dir>`; reports land in
`tests/benchmarks/reports/`. A backend that cannot start is reported as
skipped, not faked.
`runtime.describe` → capability surface: `engine` (see [Backends and
routing](#backends-and-routing)), `methods`, `backends` in use, `limits`,
and `features` (`checkpointResume` is `false`: runs are crash-safe, not
resumable; `programCheckpoints` covers `checkpoint`/`resumeFrom`;
`routeFallback: true`).

## Typed programs

```json
{ "pageId": "p_…", "steps": [
  { "id": "go",   "op": "navigate", "url": "http://…/records" },
  { "id": "filt", "op": "select",   "target": "r7", "value": "open" },
  { "id": "go2",  "op": "click",    "target": "r9" },
  { "id": "wait", "op": "waitFor",  "condition": { "selector": "table", "state": "visible" } },
  { "id": "out",  "op": "extract",  "fields": [{ "name": "n", "selector": "p.muted" }] }
]}
```

`target` is a string: an observation `ref` (`r1`…) — on Chromium resolved
against the current `documentEpoch`, by its unique css/xpath path first and
by role/text only when the path no longer matches; on `vector-engine` the
ref *is* the DOM arena index and resolves by one lookup — or a portable
locator (`css:#save`, `text:Save`, `role=button[name=Save]`,
`xpath://button[1]`). `xpath:` targets fail with `capability_unsupported`
on the engine. A ref whose document is gone fails with `target_detached`.
Steps run in order and the program stops at the first failed step; an
optional step (`"optional": true`) still records a `failed` outcome but the
program continues. Steps only reached after a cancel record `skipped`.

Ops: `navigate` `back` `forward` `reload` `stop` `click` `dblclick` `hover`
`fill` `type` `press` `check` `uncheck` `select` `scroll` `dragTo` `clickPoint`
`upload` `waitFor` `extract` `screenshot` `expectDownload` `dialog`
`collectScroll` `evaluate`.

On `vector-engine` (V8 scripting on by default) `evaluate`, `dialog`,
`expectDownload`, `javascript:` URLs, HTML5 `dragTo`, and
`waitFor` `{ downloadCompleted | expression }` run in-engine.
`xpath:` targets still fail with `capability_unsupported` (the auto-mode
fallback probe). With `engineMode: "auto"` a remaining
`capability_unsupported` triggers the Chromium fallback described above.
Everything else in the op list — including `back`/`forward`, `hover`,
`dblclick`, `clickPoint`, `upload`, multi-value `select`, POST forms and
`waitFor response` — runs in the engine.

Conditions (`waitFor { condition }` and a step's `expect: [...]`):
`textVisible { text }` · `selector { selector, state? }` · `refReady { ref }` ·
`urlMatches { pattern }` (substring or `/regex/`) · `navigationSettled` (load
events) · `settled` — quiescence: two animation frames, no in-flight
fetch/XHR, and no DOM mutation for ~100 ms, bounded (`timeoutMs`, default
2 s; fails with `condition_timeout` when the page never goes quiet) ·
`downloadCompleted` · `response { urlIncludes, status? }` · `expression`.
`navigate`/`back`/`forward`/`reload` already apply the `settled` signal with a
500 ms bound after `domcontentloaded`, so the next observe sees a rendered
page without a fixed sleep.

- `evaluate` (and the `expression` wait condition, and `{eval:}` in node
  programs) run page JS and are available only to trusted program sources —
  `pages.execute`, `programs.run`, CLI/MCP-authored programs. The planner's
  own schema excludes them, so a model-authored plan can never contain them.

- `expectDownload` arms the waiter, then runs the *next* step as the trigger —
  write it as `{ expectDownload, saveAs? }` immediately before the `click`.
- `collectScroll` accumulates rows across a scrollable region, deduped by a
  stable key — for virtualized and infinite lists where the DOM only shows a
  window: `{ "op": "collectScroll", "item": ".row", "container": "#list",
  "key": "data-id", "fields": […], "limit": 500, "as": "rows" }`. Stops at
  `limit` or at the scroller's end once nothing new appears there. Scroll
  passes that add no keys while the position is still advancing are not
  treated as the end (a loaded batch can span several viewports). Waits are
  condition-based — a mutation observer resolves as soon as the list grows
  or re-renders; `settleMs` is only the cap per pass (`maxScrolls` bounds
  the loop).
