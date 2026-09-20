# External agents with Aux

Aux includes an MCP stdio bridge for Codex and Claude Code. The source build runs
the bridge with Electron in Node mode, so the generated configuration does not
depend on a separate Node installation. Aux must remain running because its local
runtime owns the browser and task records.

## Create a connection

1. Save a task in an Aux workspace and attach only the browser tabs and references
   the client should use.
2. Open Settings → External agents, choose Codex or Claude Code, name the connection,
   and select either one task or one workspace.
3. Choose **Create scoped connection** and copy the configuration while it is shown.
   Merge that entry into the client's existing configuration.
4. Reload the client's MCP configuration and confirm the `aux_*` tools appear.

Aux does not edit client configuration, install or sign into a client, or retrieve
client credentials. The client continues to use its own account, model, approval
controls and spending policy. The generated bearer token is a secret and is shown
once. Aux stores only its SHA-256 digest. Create a replacement if the configuration
is lost; never paste the token into task notes or support reports.

Codex uses an `mcp_servers` entry in `config.toml`. Claude Code accepts an
`mcpServers` entry in a project `.mcp.json` or another supported scope. The setup
screen links to each client's current documentation.

## What the scope permits

A task connection can list its selected workspace and task, read/update that task,
and operate only browser page IDs attached to that task or used by a run of its
current revision. It can record a client-submitted evidence note, capture dated
page text and read the task receipt. Those records require review in Aux; the client
cannot mark criteria accepted or reconcile uncertain actions.

If a saved task has an Aux managed checkout attached as a repository resource, the
connection can also use `aux_development_*` tools to list that checkout, inspect its
baseline changes, list/read bounded text files, propose a replacement, new file,
rename or deletion,
request an exact local command, inspect command records, stop a command and prepare
a local review summary. When the user has explicitly connected GitHub, it can also
request the attached checkout's read-only repository, permission, remote-commit and
commit-status record. It cannot retrieve the token or perform a GitHub write. After
starting a service, it can request one explicitly
approved localhost preview: Aux performs a cookie-free loopback check, opens the tab
only for a successful response, and grants only that connection access to the new
tab for the current runtime session. Every request includes the current task revision. Unrelated
project IDs and stale revisions are rejected before the desktop touches the checkout.
File mutations and command launches require a native Aux approval dialog. Saving
uses expected hashes and recovery copies; rename never replaces a destination,
deletion retains the removed content, and creation never replaces an existing or
ignored path. After an integrity-checked review, a separate tool can propose an
exact local commit with explicit author identity and another native approval. These
tools do not push, publish, create pull requests, expose model credentials or grant
a general terminal/filesystem capability.

A workspace connection can do the same across tasks in that workspace and can
create another task inside it. Neither scope can create a workspace, open an
unattached browser tab, access an unrelated task/page/run, read global history or
sessions, expand its own scope, manage connections, or subscribe to Aux's unfiltered
event stream. Scoped clients cannot add or remove task resources; attach browser
pages and managed checkouts in Aux. Workspace-scoped task creation starts without
resource authority. These checks run at the runtime dispatch boundary on every call.

The generated MCP catalog follows the selected scope. Task connections omit
authority-expanding and global tools; workspace connections additionally show task
creation. Runtime authorization remains the enforced boundary and rechecks every
call, including calls from older or hand-written clients.

## Collaboration loop

1. List the permitted work with `aux_workspaces_list` and `aux_tasks_list`.
2. Read the saved definition and current revision with `aux_task_get`.
3. Inspect an attached tab with `aux_pages_list` and `aux_page_observe`; use browser
   actions only on those returned page IDs.
4. Record a claim with `aux_task_record_evidence`, or capture a page observation
   using `aux_task_capture_evidence`.
5. For an attached managed checkout, use `aux_development_projects` first, then pass
   the returned project ID and the task's current revision to read/inspect tools.
   Aux asks the user before any file write, command launch or new preview tab. After
   a service reports ready, use `aux_development_open_preview`, then inspect the
   returned page with the normal page observation and capture tools. Finish with
   `aux_development_incident_report` when the task needs a durable checkout, command,
   console and network snapshot for diagnosis. Query values are redacted. Use
   `aux_development_review` to create a local, non-publishing handoff, then
   `aux_development_commit` with its patch hash and snapshot tree to propose an
   exact local commit. Aux asks for native approval, requires an explicit author
   identity, and does not run hooks, sign, authenticate, push, publish, or open a
   pull request.
6. Read `aux_task_receipt`, then review the evidence and any uncertain action in
   the Aux desktop interface.

`aux_task_start` starts Aux's configured built-in model runtime and still requires
an Aux model connection. It does not start or bill the calling Codex/Claude session.
External-client costs and non-Aux tool actions are not included in Aux receipts.

## Revocation and older configurations

Removing the MCP entry stops normal client startup. Choose **Revoke** in Aux to
invalidate an issued token immediately, including in an already-running MCP process.
Revocation and last-used time persist across Aux restarts. Quitting Aux stops the
local runtime.

Earlier Aux-generated configurations used `AUX_MCP_TOOL_PREFIX=aux` without a scoped
token. They now fail closed and tell the user to create a new connection in Settings.
Hand-written legacy `vector_*` configurations can still read the broad local runtime
descriptor for compatibility; replace them with a scoped connection. This local
boundary does not defend against another process running as the same OS user that
can already read Aux's data directory.

## Validation boundary

`tests/smoke/scoped-agent-connection-desktop.mjs` launches the real desktop and MCP
bridge in a temporary profile. It creates two unrelated workspaces, tasks and pages
plus an isolated Git checkout;
creates task and workspace connections through the desktop IPC; restarts Aux;
proves each advertised catalog matches its scope and the task client can see only
its one workspace/task/page; observes the allowed page; rejects the
unrelated page/project and authority-expanding calls; records evidence with
external-client provenance; performs approved hash-guarded file changes and a
task-bound command; starts a real checkout service, approves its loopback preview,
observes the rendered page through the connection-only grant, prepares a durable
review; rejects a stale task revision; and
proves an existing process loses access immediately after UI revocation. The
Settings views are captured before and after revocation.

This qualifies local scope, persistence and revocation with synthetic data. Actual
Codex and Claude Code authentication, cancellation, reconnect and long-running
session behavior still require a user-configured client and remain Phase 2 work.
