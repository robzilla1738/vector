# Aux DOM context-event identity and ledger snapshot migration

Prepared source transform and offline ledger copy. No original path, profile,
owner database, credentials, Keychain, native source, UI or provider was opened or
changed. No browser/daemon process was launched. The current accepted app remains
unchanged; root owns staging, startup fencing and transactional integration.

## Actual supplied contract

The exact1852 daemon source SHA is pinned in `source-pins.json`. All15 occurrences
of `aside_dom` are executable producer/schema/query/grouping/status references in
that daemon. There are no such literal consumers in the pinned Agent source or
current cloud service/cloud-adapter source. Browser capture and input signal
receivers add the source on the daemon side; native sources remain `mac_ax` and
`win_uia`. This pass does not alter those identities.

`applyAuxContextLedgerIdentity({text,original})` authenticates the original source,
requires exactly15 remaining old tokens and no already-renamed tokens, and returns
`{text,anchors}`. Apply after existing provider/runtime transforms; their original
input pins and unrelated code remain unchanged. One count-checked anchor changes
only `aside_dom` to `aux_dom`, including the actual event-source enum, both DOM
input schema branches, producer writes, source filters, window/dedup/stay grouping
and last-browser-event status lookup. It does not replace HTML `aside`, CSS,
geometry, artwork, colors, fonts or any general lower-case product text.

The real file path is `u/<accountId>/context-awareness/ledger.db`. Its current
`LEDGER_SCHEMA_VERSION` and `PRAGMA user_version` are1. `aux-context-ledger-schema.mjs`
contains the exact extracted `LEDGER_DDL`, including four tables, original
constraints and indexes. The original loader enables WAL and may drop legacy
`events`, `summaries` and `threads` when upgrading an older version. **This offline
migration never calls that loader, drops tables or executes an upgrade/default
fallback.** Older/newer/custom schemas and unfinished layouts are refused.

## Snapshot preparation API

`prepareContextLedgerIdentity({databaseBytes,expectedSha256,walBytes,rollbackJournalBytes,capability})`
returns `{bytes,receipt}`. It accepts only explicit caller-owned bounded snapshot
buffers, never filenames. `walBytes` must be null or empty; `rollbackJournalBytes`
must be null. SQLite header read/write versions must both be1 (checkpointed DELETE
format). Nonempty WAL, WAL-mode headers, rollback journals and unknown sidecars
are refused. Maximum database64MiB,20,000 rows per table,2MiB target/payload JSON.
These are bounded preparation limits, not a claim to migrate every real ledger.

Capability must have a bounded ID, `disposable:true`, `exclusive:true`,
`rollbackJournalAbsent:true`, and `assertStopped({databaseSha256,walSha256,phase})`
returning true for both `prepare-context-ledger-copy` and
`context-ledger-copy-prepared`. Root's capability must establish actual stopped
exclusive ownership and sidecar lineage; a fixture callback is not such operational
proof. Source expected-hash mismatch and uncertain capability refuse preparation.

The helper deserializes a private in-memory SQLite clone with extension loading
disabled, defensive mode, trusted schema off and temporary data in memory. The
entire schema/version, quick integrity and foreign keys are checked. An authorizer
permits writes only to `context_awareness_events.source`; INSERT, DELETE and any
other column update are denied. Each old row is updated from `aside_dom` to
`aux_dom` with an ID/source compare-and-exchange. IDs, complete target/payload text,
BLOB bytes and every unrelated event field remain unchanged. All other three
tables, complete row sets, schema and user_version are verified before returning.
No SQL schema version bump is needed: the physical schema remains exactly1;
root's versioned identity transaction records the semantic source migration.

The source column is not unique: distinct historical/new DOM rows are preserved.
Their IDs are the actual primary key and never change, so renaming the source does
not create an ID collision. Duplicate-ID/non-PK layouts, triggers, unknown event
sources, malformed target/payload JSON and compare-and-exchange conflicts are
refused; nothing is merged or deduplicated. A no-op returns original bytes exactly.
A capability failure after the memory commit returns no output; original buffers
and files are untouched. Private database/WAL buffer copies are cleared on exit.

Receipt includes source/output hashes, `sourceSchemaSha256`, `ledgerDdlSha256`,
pinned daemon source hash, user version, changed/event row counts and sidecar
disposition. It contains no IDs or captured content. Returned bytes may contain
sensitive evidence: never print, commit or place them in a public journal.

## WAL and transaction boundary

The existing private WAL checkpoint helper currently selects the separate provider
sessions/routines validator; that validator is not compatible with this ledger.
Do not feed a ledger through it and claim support. Root can extend its explicit
`databaseKind` dispatch to choose this pinned validator after the independently
verified private checkpoint, carrying original database/WAL sidecar lineage into
the enclosing receipt. Until that pairing is implemented and tested, this helper
supports only already checkpointed DELETE snapshots and its receipt says so.

Root must quiesce original ledger/cache/observer writers, validate authorized
account ownership, prepare both state and any original sidecar dispositions,
durably commit with rollback/recovery, then reload consumers before activating the
new source filter. No startup write fence, filesystem transaction, live WAL
checkpoint or actual app acceptance is supplied by this module alone. Do not
open or checkpoint an owner's original ledger as an implementation shortcut.

## Focused evidence

`node --experimental-vm-modules --test vendor/provided/aux-context-ledger-identity.test.mjs`
checks exact source/DDL pins and composed provider/runtime ordering; executes the
actual supplied updated input schema; migrates an actual-schema synthetic SQLite
snapshot; verifies historical DOM rows appear under the new filter and new events
are accepted; preserves whitespace-sensitive JSON/BLOBs/unrelated rows; and rejects
schema/ID-layout/trigger/corruption/sidecar/hash/capability failures. No paid model,
cloud, native, permission or real state operation occurs.

Opaque evidence contents, summary prose/citations/model text, other databases and
cryptographic wrapping formats are deliberately preserved. A content string that
mentions an old internal marker is not rewritten as code. This is one coherent
contract migration, not a full no-trace or production-readiness claim.
