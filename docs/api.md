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
| `pages.list` | — | all pages |
| `pages.open` | `url, backend, background?, activate?, targetId?` | `backend: "vector"\|"chrome"`; chrome requires `targetId` of an existing tab |
| `pages.close` | `pageId` | borrowed chrome tabs are detached, not closed |
| `pages.activate` / `pages.navigate` / `pages.back` / `pages.forward` / `pages.reload` / `pages.stop` | `pageId` (+`url`) | navigation bumps `documentEpoch` |
| `pages.observe` | `pageId, scope?, subtreeRef?, maxElements?, maxTextChars?, format?` | structured observation: elements+refs, forms, links, tables, frames, text, headings. `format: "compact"` returns `{ observation: { pageId, url, title, documentEpoch, revision, text, refs: [{ ref, role?, name? }] } }` — the rendered text the planner reads plus a minimal ref list, no selectors/rects (5–10× smaller). `sinceRevision` is accepted for forward compatibility but not yet acted on — every observe is a full snapshot with a `changesSince` diff |
| `pages.execute` | `program, returnObservation?` | run a typed program on one page. `returnObservation: { scope?, subtreeRef?, format?, maxElements?, maxTextChars? }` observes the page after the program and returns it as `observation` alongside the result (act-and-observe in one round trip; best-effort if the page detached) |
| `pages.capture` | `pageId, format?` | screenshot; `format:"artifact"` stores it |
| `pages.find` / `pages.stopFind` | `pageId, text, forward, findNext` | native find-in-page; hidden pages fall back to a DOM count |
| `pages.zoom` | `pageId, level?, delta?, reset?` | per-origin persistent zoom |
| `pages.takeover` / `pages.resume` | `pageId` | human/agent control handoff |
| `pages.openLive` | `pageId` | bring a runtime-owned page into the visible shell |

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
runs into durable chat threads (the optional agent inspector scopes
history and follow-up context per thread); `context` (≤ 20 000 chars) is
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
`settings.get` / `settings.set` · `models.list` / `models.probe` ·
`history.list` / `history.clear` · `bookmarks.list|add|remove` — add/remove
emit `bookmarks.changed` with the updated list so live clients stay in sync ·
`bench.run { task?, repeats? }` → `{ reportPath, summary }` — `task` is the
URL to observe (default the records fixture), report JSON lands in
`<dataDir>/benchmarks/`. The checked-in end-to-end harness is `pnpm bench`
(`tests/benchmarks/run.mjs`).
`runtime.describe` → capability surface (`features.checkpointResume` is
`false`: runs are crash-safe, not resumable; `programCheckpoints` covers
`checkpoint`/`resumeFrom`).

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

`target` is a string: an observation `ref` (`r1`…) — resolved against the
current `documentEpoch`, by its unique css/xpath path first and by role/text
only when the path no longer matches — or a portable locator (`css:#save`,
`text:Save`, `role=button[name=Save]`, `xpath://button[1]`). A ref whose
document is gone fails with `target_detached`.
Steps run in order and the program stops at the first failed step; an
optional step (`"optional": true`) still records a `failed` outcome but the
program continues. Steps only reached after a cancel record `skipped`.

Ops: `navigate` `back` `forward` `reload` `stop` `click` `dblclick` `hover`
`fill` `type` `press` `check` `uncheck` `select` `scroll` `dragTo` `clickPoint`
`upload` `waitFor` `extract` `screenshot` `expectDownload` `dialog`
`collectScroll` `evaluate`.

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
