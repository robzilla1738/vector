# Outbound MCP host boundary

The runtime accepts MCP source definitions only after an Aux approval. `createMcpTransportProvider` verifies the saved source digest before constructing a transport. An agent can invoke a tool only through an active grant bound to its connection's Space and, for task grants, the current task revision. Server and grant management remain in Aux.

## Local stdio

`native.prepareMcpStdioLaunch({ server })` returns a `McpStdioLaunchPermit`. The host must canonicalize and validate the approved command or bundle and working directory, derive an effective default-deny profile from host-owned policy, and issue a unique, single-use capability. The launcher must atomically consume that capability **before** starting the MCP server. It must reject replay, expiry, source-digest mismatch, and a changed bundle. The current permit contract requires no network access and no writable roots. Content-readable roots must be explicit; literal `/` metadata traversal is not a content-readable root.

The runtime checks the permit identity, source digest, expiry (at most 60 seconds), absolute launcher/cwd, and bounded profile. It starts only the host-issued launcher with the capability ID as the final argument. It supplies an empty environment and suppresses server stderr from the runtime log. The untrusted source command never reaches Node's process launcher directly. If the host cannot issue a permit, the tool fails closed.

## Remote HTTPS and OAuth

The runtime uses the MCP SDK Streamable HTTP transport for an approved HTTPS origin. It rejects URL credentials, IP-literal/localhost targets, cross-origin requests, and redirects. OAuth endpoints use `native.mcpOAuthToken({ server })`; the host must bind consent and token refresh to the exact server ID, source digest, and origin. The runtime validates the returned identity and expiry on every request, keeps the token in memory only for that request, and never saves it to SQLite or logs. Without a host token method, an OAuth server fails closed. Revoking a grant aborts in-flight HTTP work; an already-dispatched call remains uncertain until reviewed.

The runtime has no fallback that launches an unsandboxed local command or invents an OAuth token when the native host methods are unavailable.
