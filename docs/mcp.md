# MCP server

`packages/mcp` is a stdio MCP server that exposes the loopback API to any
MCP-capable agent (Claude, Cursor, etc.). It reads `<dataDir>/runtime.json`
for the port + bearer token — start the desktop app (or a standalone
runtime) first.

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

## Tools (17)

| Tool | Purpose |
|---|---|
| `vector_pages_list` | list open pages |
| `vector_page_open` | open a page (vector tab or adopted chrome tab) |
| `vector_page_observe` | structured observation → element refs |
| `vector_page_execute` | run a typed program on a page |
| `vector_page_capture` | screenshot / artifact |
| `vector_set_create` | define a named set of URLs |
| `vector_set_map` | apply a program or goal across a set (bounded parallel) |
| `vector_set_results` | per-member results |
| `vector_run_start` | start an agent run on a goal |
| `vector_run_get` | run status + steps |
| `vector_run_control` | pause / resume / cancel |
| `vector_run_answer` | answer an agent question |
| `vector_events` | event log (`events.since`) |
| `vector_chrome_attach` | attach the user's Chrome (debug port) |
| `vector_chrome_tabs` | list attachable chrome tabs |
| `vector_chrome_import_cookies` | import Chrome cookies into Vector's session |
| `vector_artifacts` | list run artifacts |
| `vector_artifact_read` | read artifact bytes (base64) |

Typical agent flow: `vector_page_open` → `vector_page_observe` → build a
typed program → `vector_page_execute` → `vector_page_observe` again to
verify. For a batch of similar pages, `vector_set_create` + `vector_set_map`.
