# Aux MCP server

`packages/mcp` is a stdio MCP server that exposes the loopback API to any
MCP-capable agent (Cursor, Codex, Claude, and others). It reads
`<dataDir>/runtime.json` for the port + bearer token — start the desktop app
(or a standalone runtime) first. Tools drive the same pages the human sees.

```bash
node packages/mcp/dist/main.js          # stdio transport
```

Create a scoped connection in Aux Settings → External agents. Aux generates the command, scoped `AUX_MCP_TOKEN`, scope, and `aux_*` catalog — a generated token is always required and the server fails closed without one. Do not copy credentials between clients.

```json
{ "mcpServers": { "aux": {
    "command": "node",
    "args": ["/path/to/web/packages/mcp/dist/main.js"],
    "env": {
      "AUX_DATA_DIR": "~/Library/Application Support/Aux Browser",
      "AUX_MCP_TOKEN": "<generated scoped token>"
    }
} } }
```

## Scoped Aux catalog

Connections created in Aux Settings use the canonical `aux_*` catalog. Alongside
task, browser and local-development tools, cloud-capable task scopes expose:

| Tool | Purpose |
|---|---|
| `aux_cloud_environments` | list only the authorized task's durable environments |
| `aux_cloud_command_history` | reconcile and read bounded command history |
| `aux_cloud_run_command` | propose an exact command; Aux must be open and the user must approve the native review before dispatch |
| `aux_cloud_start_service` | propose an exact time-bounded service with the same native review |
| `aux_cloud_refresh_command` | refresh provider status and bounded logs without dispatching work |
| `aux_cloud_stop_command` | stop one running task-owned command or service without stopping or deleting the environment |
| `aux_cloud_files` | list a bounded directory rooted in the task's remote workspace |
| `aux_cloud_read_file` | read one bounded UTF-8 remote-workspace file |
| `aux_cloud_task_result` | validate the detached worker result against the exact task revision and uploaded source tree |

Cloud resource creation/deletion, environment stop/resume, terminal and preview
access, exports, account inventory and orphan cleanup remain desktop-only. If Aux is
closed, proposals that need native review fail explicitly. A transport failure after
dispatch is recorded as uncertain and is never retried automatically.

## Legacy direct catalog

| Tool | Purpose |
|---|---|
| `aux_pages_list` | list open pages |
| `aux_page_open` | open a page. Omit `backend` for the embedded Chromium session; `aux` selects it explicitly, `chrome` adopts an attached Chrome tab. `background` opens without activation. The result's `routeReason` says where it landed and why (`docs/api.md` → Backends) |
| `aux_page_observe` | observation → element refs. `format` `compact` (default) returns the rendered text view (one line per ref, ~5–10× smaller than `full` JSON); `scope` (`full`/`forms`/`links`/`tables`/`subtree` + `subtreeRef`), `maxElements`, `maxTextChars` |
| `aux_page_execute` | run a typed program on a page. `steps` use string targets (`"r3"`, `"css:#save"`); `documentEpoch` fails fast on a navigated page; `returnObservation { scope?, subtreeRef?, format? }` appends the post-action observation to the result so act + observe is one tool call. A trusted source: `evaluate` is allowed here |
| `aux_page_capture` | screenshot as MCP image content (default), data URL, or stored artifact |
| `aux_set_create` | define a named set (`urls`, `pageIds`, `records`, or links collected from a page) |
| `aux_set_map` | apply a program or goal across a set (bounded parallel; `concurrency` honored) |
| `aux_set_results` | per-member results |
| `aux_run_start` | start an agent run on a goal (`context`, `deadlineMs`, `maxModelCalls` supported) |
| `aux_run_get` | run status + steps + `modelCalls` |
| `aux_run_control` | pause / resume / cancel — also gates and aborts set runs |
| `aux_run_answer` | answer an agent question |
| `aux_events` | event log (`events.since`) |
| `aux_chrome_attach` | attach the user's Chrome (debug port) |
| `aux_chrome_tabs` | list attachable chrome tabs |
| `aux_chrome_import_cookies` | import Chrome cookies into Aux's session |
| `aux_artifacts` | list run artifacts |
| `aux_artifact_read` | read artifact bytes (base64) |
| `aux_state_query` | query the state index (responses, records, controls, datasets, artifacts, operations) |
| `aux_responses_list` | captured HTTP responses on a page (metadata) |
| `aux_response_body` | body of a captured response (base64) |
| `aux_operations_list` | registered operations and their implementations |
| `aux_operation_invoke` | invoke an operation with zero model involvement |
| `aux_operation_explain` | which implementation an invoke would pick, and why |
| `aux_operation_save_program` | register a proven program as a named operation |
| `aux_operation_compile` | compile an operation candidate from a run's step trace |
| `aux_program_validate` | validate a program without executing it |
| `aux_program_run` | replay a saved program; `parameters` fill `{{name}}` placeholders (missing → `invalid_params`) |
| `aux_traces` | structured execution spans |
| `aux_extract` | structured fields from the current observation (`pages.extract`) |
| `aux_wait_for` | wait until a condition holds (`pages.waitFor`) |
| `aux_console` | page console lines (`pages.console`) |
| `aux_dialog` | list or accept/dismiss a page dialog (`pages.dialog`) |
| `aux_network` | captured HTTP responses (`pages.network`) |

`aux_page_execute` step shape (the same `StepSchema` the API validates):

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

Typical agent flow: `aux_page_open` → `aux_page_observe` → build a
typed program → `aux_page_execute` with `returnObservation` — the result
already carries the new page state, so a separate observe is only needed to
change scope. For a batch of similar pages, `aux_set_create` +
`aux_set_map`.

The server reads `runtime.json` once and re-reads it only when a call fails
to connect (the runtime restarted on a new port).

Things an MCP client should expect:

- Step `target` is a **string**: an observation ref (`r3`) or a portable
  locator (`css:#save`, `text:Save`, `role=button[name=Save]`) — not an
  object.
- A ref whose document navigated away fails with `target_detached` (there
  is no `stale_ref` code); re-observe and retry with fresh refs.
- If the human clicks or types in an agent-driven page *between* programs,
  that page's `controller` becomes `human`, live runs on it pause, and
  further programs fail with `conflict` until `pages.resume`. Agent
  Playwright input during `pages.execute` is not a takeover.
- `aux_run_control cancel` on a set run aborts in-flight member agents
  and marks unfinished members `skipped`; the run stays `cancelled`.
- Runs are crash-safe but not resumable across a runtime restart
  (`runtime.describe` → `checkpointResume: false`).
Scoped Aux connections expose `aux://page/observation`, `aux://page/console`, and `aux://page/network`.
