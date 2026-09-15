# Loopback API

The runtime serves HTTP + WebSocket on `127.0.0.1`. At startup it writes
`<dataDir>/runtime.json`:

```json
{ "port": 58781, "token": "…", "pid": 1234 }
```

Every request needs `Authorization: Bearer <token>` (or `?token=` on the WS
URL). `GET /health` is the only unauthenticated route.

## RPC

```
POST /rpc
{ "method": "<name>", "params": { … } }
→ 200 { "result": … }  |  { "error": { "code", "message" } }
```

## Events

```
GET /ws?token=…        → server-sent JSON event stream
events.since { sinceSeq, limit } → missed events (durable log)
```

## Methods

### Pages

| Method | Params | Notes |
|---|---|---|
| `pages.list` | — | all pages |
| `pages.open` | `url, backend, background?, activate?, targetId?` | `backend: "vector"\|"chrome"`; chrome requires `targetId` of an existing tab |
| `pages.close` | `pageId` | borrowed chrome tabs are detached, not closed |
| `pages.activate` / `pages.navigate` / `pages.back` / `pages.forward` / `pages.reload` / `pages.stop` | `pageId` (+`url`) | navigation bumps `documentEpoch` |
| `pages.observe` | `pageId, scope?, maxElements?, maxTextChars?, sinceRevision?` | structured observation: elements+refs, forms, links, tables, frames, text, headings |
| `pages.execute` | `program` | run a typed program on one page |
| `pages.capture` | `pageId, format?` | screenshot; `format:"artifact"` stores it |
| `pages.find` / `pages.stopFind` | `pageId, text, forward, findNext` | native find-in-page; hidden pages fall back to a DOM count |
| `pages.zoom` | `pageId, level?, delta?, reset?` | per-origin persistent zoom |
| `pages.takeover` / `pages.resume` | `pageId` | human/agent control handoff |
| `pages.openLive` | `pageId` | bring a runtime-owned page into the visible shell |

### Programs

`programs.list` · `programs.run { programId, pageId, parameters? }` ·
`programs.save { name, siteKey?, steps, description?, parameters? }` ·
`programs.delete { programId }`.

Programs are typed step arrays; `runs` increment use counts on successful
replay.

### Sets

`sets.create { name, members: [{url}] }` · `sets.get` · `sets.list` ·
`sets.map { setId, programId? | goal?, concurrency? }` → `runId` ·
`sets.results { setId, status? }`.

### Runs

`runs.start { goal, pageId?, pageIds?, setId?, modelId?, chatId?,
maxSteps?, maxModelCalls?, deadlineMs? }` → `runId` — `chatId` groups
runs into durable chat threads (the optional agent inspector scopes
history and follow-up context per thread) ·
`runs.get { runId }` · `runs.list { limit? }` ·
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

`workspace.get` → `{ pages, sessions, runs, settings, … }` (renderer sync
snapshot) · `settings.get` / `settings.set` · `models.list` / `models.probe` ·
`history.list` / `history.clear` · `bookmarks.list|add|remove` — add/remove
emit `bookmarks.changed` with the updated list so live clients stay in sync ·
`bench.run { url, repeats }`.

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

Steps reference observation `ref`s (`r1`…) — resolved against the current
`documentEpoch` — or portable locators (`selector`, `role`+`name`, `text`).
Optional steps (`"optional": true`) record `skipped` instead of failing.

Ops: `navigate` `back` `forward` `reload` `stop` `click` `dblclick` `hover`
`fill` `type` `press` `check` `uncheck` `select` `scroll` `drag` `clickPoint`
`upload` `waitFor` `extract` `screenshot` `expectDownload` `dialog`
`collectScroll` `evaluate`.

- `expectDownload` arms the waiter, then runs the *next* step as the trigger —
  write it as `{ expectDownload, saveAs? }` immediately before the `click`.
- `collectScroll` accumulates rows across a scrollable region, deduped by a
  stable key — for virtualized and infinite lists where the DOM only shows a
  window: `{ "op": "collectScroll", "item": ".row", "container": "#list",
  "key": "data-id", "fields": […], "limit": 500, "as": "rows" }`. Stops at
  `limit`, at the scroller's end after confirmation, or after repeated
  no-new-items passes (`maxScrolls`, `settleMs` tune the loop).
