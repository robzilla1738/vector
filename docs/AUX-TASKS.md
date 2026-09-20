# Persistent tasks and workspaces

The runtime owns workspaces and tasks in SQLite schema version 4. A task contains
an objective, explicit acceptance criteria, resource references, workspace, and
revision. Every edit/archive/restore produces an immutable revision snapshot;
edits require the expected current revision and reject stale clients. Active
runs must be stopped before revision or a competing task run.

The desktop Tasks drawer supports workspace creation, task creation/editing,
criteria, run-on-current-tab, history, archive/restore, current-tab attachment,
evidence capture, human review, and uncertain-action reconciliation. New criteria entered
in this initial editor use manual verification. The typed API supports different
verification methods per criterion and typed resource references. Resource
locators are not read automatically and do not grant access.

## API

- `workspaces.create { name }`, `workspaces.list {}`
- `tasks.create { workspaceId, title, objective, criteria, resources? }`
- `tasks.list { workspaceId?, includeArchived?, limit? }`
- `tasks.get { taskId }`: current task, immutable revisions, and associated runs
  labeled by whether they belong to the current revision.
- `tasks.update { taskId, expectedRevision, title?, objective?, criteria?, resources? }`
- `tasks.archive { taskId, expectedRevision, archived }`
- `tasks.start { taskId, expectedRevision, pageId?|pageIds?, modelId?, ...runOptions }`

A criterion has `criterionId`, `description`, and `verification` (manual, browser,
service, test, or artifact). Resource references have `resourceId`, `kind`,
`locator`, and `label`. Limits and uniqueness checks are part of shared contracts.

Task-aware starts use the stored objective and criteria, saving task ID/revision
in the run before its execution loop begins. An unresolved effect from any prior
run of that task prevents another task start, even after the objective is revised.
Ordinary legacy `runs.start` remains available; complete all-route task authority
is not established by this feature alone.

Run success is not task verification. The current task state is open/archived,
and criteria are not automatically checked off. Results from older revisions
remain available with their revision association, but are not current evidence.

## Evidence, review, and receipts

`tasks.recordEvidence` records a note with server-assigned provenance. External
API notes are client-submitted claims. `tasks.captureEvidence` records a dated
page observation only from a current task resource or run. Snapshots store title
and up to 20,000 characters of page text locally; they can contain sensitive page
content. They are historical evidence, not a live guarantee or independent
business-outcome verification.

`tasks.receipt` joins current criteria, evidence, latest human reviews, unresolved
actions, run history, and known model cost. Unknown or estimated model costs stay
explicit. Costs cover model calls only, not cloud/infrastructure charges. Task
revision changes and subsequent runs invalidate earlier evidence for current
acceptance. Known page changes/unavailability make captures stale; this is not
continuous monitoring of the page or an external service. New evidence requires
another review. Historical evidence/reviews remain stored across revisions.

`tasks.reviewCriterion` and `tasks.reconcileAction` require the desktop shell IPC
context; HTTP/WS and ordinary runtime callers cannot claim human authority in
parameters. Desktop main verifies the shell WebContents, main frame, and exact
shell document before assigning that context. This is an application trust
boundary, not isolation against a compromised operating-system account.

Review requires selected current evidence and a reason, with task runs stopped.
“Accepted by you” is human attestation, never automatic verification. Unresolved
actions keep the receipt uncertain regardless of accepted criteria. Reconciliation
records a human decision and evidence reference in the action journal; it does
not retry an action. Check independent records before choosing applied/not applied.

## Validation and remaining work

Service tests cover restart, immutable revisions, preserved resources, stale-edit
conflicts, active-run conflicts, archive/restore, historical result invalidation,
and unresolved effects across task runs. Handler tests validate shared response
schemas and task/run association before dispatch. Migration tests retain version
2 action intents when adding version 3 tables.

`node tests/smoke/tasks-desktop.mjs` exercises the real Electron drawer using an
isolated temporary profile/data directory, no inherited model credentials,
`AUX_LOAD_DOTENV=0`, and a mock keychain. It browses a local fixture, bookmarks it, creates and revises a task, attaches
the tab, captures its order text, reviews both criteria, reopens, archives, and
restores the task. Pass `--packaged` to use the private macOS arm64 application. The screenshot is written under ignored
`release/test-artifacts/tasks.png`. It does not perform a model-backed task run.

Remaining: independent automated outcome verification, richer/exportable receipts,
task-level logical action allocation, durable coordinator leases/fencing, agent replacement,
CLI/MCP task ergonomics, resource editing/access controls, draft recovery, task
search, multiple windows, richer history and editing, integration of existing tab
spaces with runtime workspaces, and cloud task synchronization. Full keyboard and
VoiceOver qualification and founder design review remain separate gates.
