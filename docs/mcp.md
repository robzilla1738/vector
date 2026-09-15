# MCP server

`packages/mcp` is a stdio MCP server that exposes the loopback API to any
MCP-capable agent (Cursor, Codex, Claude, and others). It reads
`<dataDir>/runtime.json` for the port + bearer token — start the desktop app
(or a standalone runtime) first. Tools drive the same pages the human sees.

```bash
node packages/mcp/dist/main.js          # stdio transport
```

Register it in your MCP client config:

```json
{ "mcpServers": { "vector": {
    "command": "node",
    "args": ["/path/to/web/packages/mcp/dist/main.js"],
    "env": { "VECTOR_DATA_DIR": "~/Library/Application Support/Vector" }
} } }
```

## Tools (29)

| Tool | Purpose |
|---|---|
| `vector_pages_list` | list open pages |
| `vector_page_open` | open a page. `backend`: `vector` (default, *routable* — with `engineMode: auto` the runtime may place it on the Vector Engine and fall back to Chromium), `chrome` (adopt an attached Chrome tab), `vector-engine` (force the in-process engine, no fallback); `background`. The result's `routeReason` says where it landed and why (`docs/api.md` → Backends and routing) |
| `vector_page_observe` | observation → element refs. `format` `compact` (default) returns the rendered text view (one line per ref, ~5–10× smaller than `full` JSON); `scope` (`full`/`forms`/`links`/`tables`/`subtree` + `subtreeRef`), `maxElements`, `maxTextChars` |
| `vector_page_execute` | run a typed program on a page. `steps` use string targets (`"r3"`, `"css:#save"`); `documentEpoch` fails fast on a navigated page; `returnObservation { scope?, subtreeRef?, format? }` appends the post-action observation to the result so act + observe is one tool call. A trusted source: `evaluate` is allowed here |
| `vector_page_capture` | screenshot / artifact |
| `vector_set_create` | define a named set (`urls`, `pageIds`, `records`, or links collected from a page) |
| `vector_set_map` | apply a program or goal across a set (bounded parallel; `concurrency` honored) |
| `vector_set_results` | per-member results |
| `vector_run_start` | start an agent run on a goal (`context`, `deadlineMs`, `maxModelCalls` supported) |
| `vector_run_get` | run status + steps + `modelCalls` |
| `vector_run_control` | pause / resume / cancel — also gates and aborts set runs |
| `vector_run_answer` | answer an agent question |
| `vector_events` | event log (`events.since`) |
| `vector_chrome_attach` | attach the user's Chrome (debug port) |
| `vector_chrome_tabs` | list attachable chrome tabs |
| `vector_chrome_import_cookies` | import Chrome cookies into Vector's session |
| `vector_artifacts` | list run artifacts |
| `vector_artifact_read` | read artifact bytes (base64) |
| `vector_state_query` | query the state index (responses, records, controls, datasets, artifacts, operations) |
| `vector_responses_list` | captured HTTP responses on a page (metadata) |
| `vector_response_body` | body of a captured response (base64) |
| `vector_operations_list` | registered operations and their implementations |
| `vector_operation_invoke` | invoke an operation with zero model involvement |
| `vector_operation_explain` | which implementation an invoke would pick, and why |
| `vector_operation_save_program` | register a proven program as a named operation |
| `vector_operation_compile` | compile an operation candidate from a run's step trace |
| `vector_program_validate` | validate a program without executing it |
| `vector_program_run` | replay a saved program; `parameters` fill `{{name}}` placeholders (missing → `invalid_params`) |
| `vector_traces` | structured execution spans |

`vector_page_execute` step shape (the same `StepSchema` the API validates):

```json
{ "pageId": "p_…", "documentEpoch": 3,
  "steps": [
    { "id": "s1", "op": "fill",  "target": "r4", "value": "hello" },
    { "id": "s2", "op": "press", "key": "Enter", "target": "r4",
      "expect": [{ "kind": "textVisible", "text": "Results" }] }
  ],
  "returnObservation": { "format": "compact" } }
```

Ops: `navigate` `back` `forward` `reload` `stop` `click` `dblclick` `hover`
`fill` `type` `press` `check` `uncheck` `select` `scroll` `dragTo` `clickPoint`
`upload` `waitFor` `extract` `screenshot` `expectDownload` `dialog`
`collectScroll` `evaluate`. Conditions for `waitFor`/`expect`: `textVisible`,
`selector`, `refReady`, `urlMatches`, `navigationSettled`, `settled`,
`downloadCompleted`, `response`, `expression` (see `docs/api.md`).

Typical agent flow: `vector_page_open` → `vector_page_observe` → build a
typed program → `vector_page_execute` with `returnObservation` — the result
already carries the new page state, so a separate observe is only needed to
change scope. For a batch of similar pages, `vector_set_create` +
`vector_set_map`.

The server reads `runtime.json` once and re-reads it only when a call fails
to connect (the runtime restarted on a new port).

Things an MCP client should expect:

- Step `target` is a **string**: an observation ref (`r3`) or a portable
  locator (`css:#save`, `text:Save`, `role=button[name=Save]`) — not an
  object.
- A ref whose document navigated away fails with `target_detached` (there
  is no `stale_ref` code); re-observe and retry with fresh refs.
- If the human clicks or types in an agent-driven page, programs on it fail
  with `conflict` until `pages.resume` — the run is not paused by a takeover.
- `vector_run_control cancel` on a set run aborts in-flight member agents
  and marks unfinished members `skipped`; the run stays `cancelled`.
- Runs are crash-safe but not resumable across a runtime restart
  (`runtime.describe` → `checkpointResume: false`).
- A page may be served by the **Vector Engine** (`backend: "vector-engine"`
  on the page, `routeReason` on the open result). Its refs work the same
  way, but in M1 the engine runs no JavaScript: `evaluate`, `dialog`,
  `expectDownload`, `xpath:` targets, `javascript:` URLs and
  `vector_page_capture` fail with `capability_unsupported` (`dragTo` sends
  pointer events only). With `engineMode: auto` the runtime moves
  the page to Chromium and replays the rest; the `vector_page_execute`
  result then carries `fallback { from, to, reason, replayedFrom, repair,
  refSteps }`. `repair: true` means ref-targeted steps could not be replayed
  — re-observe and retry with fresh refs.
