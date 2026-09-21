# Durable action journal

Agent and set execution now share the runtime SQLite journal. Every consequential
program reserves a pending intent and records a transition in one transaction
before dispatch. An insertion failure rolls back both. The runtime enables WAL
and synchronous FULL; a failed read or write never substitutes an empty journal.

Pending and uncertain intents block additional consequential dispatches on the
same run/page, including different repaired plans, element references, observation
revisions, and document epochs. Reads remain available for reconciliation.
Execution errors remain uncertain: an error response cannot establish that a
remote write did not happen. Destructive operations are journaled too.

A duplicate suppression is not successful execution. Member/set execution now
returns a blocked/error result rather than fabricated successful output. Streaming
execution uses its actual per-dispatch results instead of inserting another intent
for the combined plan. The coordinator records unresolved intent IDs in its
checkpoint and refuses completion while any remain, reporting an interrupted run
with an uncertain-outcome message.

## Identity, evidence, and compatibility

Explicit logical action IDs are supported and remain stable across pages and
observations. Existing planner calls still use observation-bound identities plus
the unresolved-effect barrier; full task-level action allocation is not finished.
Step fingerprints include every parameter and use canonical object ordering and
SHA-256 instead of delimiter-concatenated values. Fingerprints are not stored as
raw input values.

The `confirmed` journal status means the execution interface acknowledged success,
not independent verification of the user's business outcome. Trusted reconciliation
can record applied/not-applied with evidence and retains transition history. It is
an internal API, not an agent-accessible permission to clear uncertain actions.
A not-applied finding does not reuse the old action key; a subsequent authorized
attempt requires a new action identity.

Legacy JSON is validated and imported transactionally once, leaving the original
file unchanged. Malformed/unreadable journals stop startup. Legacy keys cannot be
reliably matched after replanning, so all imported entries conservatively require
reconciliation. The historical path-based constructor uses a sibling SQLite file;
production uses the runtime database and its versioned migrations.

## Evidence and remaining gates

Synthetic tests cover actual SIGKILL after a fixture server accepts a POST,
reopening the database, changed-observation retry suppression, live multiple
database connections, storage-error rollback, corrupt legacy imports, explicit
logical IDs, transition history, and completion refusal. A previous test labeled
kill-9 only reopened an object; its name was corrected and actual process-kill
coverage was added separately.

Not yet complete: provider idempotency, OS-level power-loss qualification, and
cross-process fencing outside this runtime (in-process SQLite leases exist).
These tests do not prove universal exactly-once execution. Human address-bar
navigation is not journaled. CLI `pages.execute`, operation invoke, BiDi-backed
programs, dialog accept/dismiss, and saved-operation writes share the durable
write ledger. Criterion-specific verification is an honest local check, not
business-outcome proof. Reconciliation remains a desktop-user adapter with
evidence, never an agent permission.
