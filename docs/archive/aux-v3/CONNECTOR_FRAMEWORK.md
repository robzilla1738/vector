# Reviewed connectors

`connectors.catalog` is the Aux Settings review surface for the current Space and, optionally, one current task revision. It presents built-in Calendar and GitHub integrations beside approved outbound MCP servers. The catalog is a projection of their existing authorities; it cannot create or extend a grant. External connections cannot enumerate the catalog.

| Entry | Connection review | Task authority | Runtime dispatch |
| --- | --- | --- | --- |
| Google Calendar | OAuth account and read-only scope in secure desktop storage | Explicit `calendar_task_grants` row for the current task revision | Sealed `aux.connector.google-calendar/events.list` operation |
| GitHub | Token saved in Aux Settings; account shown after a successful probe | A read or write local project resource attached to the current task revision | Sealed `aux.connector.github/repository.status` operation |
| MCP | Server source digest approved in Aux Settings | An active tool grant scoped to the Space or current task revision | Outbound MCP service with host-supervised transport |

Calendar account reads for the human in Settings retain their direct account route. Task and agent reads use the sealed operation and recheck the Calendar grant before and after the provider call. Revoking a grant aborts an active Calendar read.

GitHub status checks use the task-attached project and the saved Settings credential. The operation journal stores task, revision, project ID, route, and outcome; it never stores the token or returned repository content. The runtime checks task authority and credential generation after native project lookup, the provider read, and native status recording. A revoked project or replaced credential suppresses the result. The native host must continue deriving the project identity from its own project registry and validating the project ID when recording status.

The desktop renderer can use `connectors.catalog` to show the authority source for each task. Calendar account linking, Calendar task grants, GitHub credential save/probe, and MCP server and tool reviews retain their existing management methods. A connector entry alone is never an agent capability.
