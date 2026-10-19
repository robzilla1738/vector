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

## Browser, run and task tools

Every scoped connection gets the browser, run and task tools below. Tool results are
compact: `aux_page_execute` returns one line per step (`s3 click FAILED ref_stale: …`)
plus the optional post-action observation, and error codes (`ref_stale`,
`target_detached`, `permission_denied`, …) reach the client unchanged. Every tool
declares `readOnlyHint`/`destructiveHint`/`idempotentHint` annotations.

| Tool | Purpose |
|---|---|
| `aux_pages_list` | pages attached to the authorized task |
| `aux_page_observe` | observation → element refs; `format` `compact` (default) or `full`; `scope` (`full`/`forms`/`links`/`tables`/`subtree` + `subtreeRef`), `maxElements`, `maxTextChars` |
| `aux_page_execute` | run planner steps on a page (flat step schema, validated against the planner vocabulary; no page script); `returnObservation` makes act + observe one call |
| `aux_page_capture` | screenshot as MCP image content |
| `aux_page_takeover` / `aux_page_resume` | hand a page to the human and back |
| `aux_extract`, `aux_wait_for`, `aux_console`, `aux_dialog`, `aux_network` | read fields, wait for a condition, read console/network, answer a dialog |
| `aux_run_get`, `aux_run_control`, `aux_run_answer` | inspect, pause/resume/cancel, answer a run in scope |
| `aux_workspaces_list`, `aux_tasks_list`, `aux_task_get`, `aux_task_create`, `aux_task_update`, `aux_task_archive`, `aux_task_start` | task lifecycle inside the connection's scope |
| `aux_calendar_task_grants`, `aux_calendar_task_events` | list accounts the Aux user granted to a saved task revision, then read a bounded page of events from one grant; no account management or tokens |
| `aux_task_record_evidence`, `aux_task_capture_evidence`, `aux_task_receipt`, `aux_task_verify_criterion`, `aux_task_replace_agent` | evidence and verification |

`aux_development_*` and `aux_cloud_*` tools are listed only when the connection can use
them: a workspace scope, or a task with a repository or environment resource. Aux sets
`AUX_MCP_PROJECT_TOOLS=1` in the generated configuration in that case; without it the
default catalog is ~20 KB of tool schema instead of ~46 KB.

Pages cannot be opened, and `pages.execute` cannot run page script, through a scoped
connection: attach pages to the task in Aux. The owner bearer token (CLI, SDK) keeps
the full loopback API documented in [api.md](api.md).
