# Subagent tracking-cache identity preparation

The source-pinned tracking model is unambiguous. This external helper migrates it without touching owner state, native code, UI, app startup or provider services.

## Actual stored contract

The supplied 1.26.1016.1852 daemon hash is `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. [source-audit.json](source-audit.json) pins10 exact unique anchors: SQL column, default state, producer, persisted update, tracked/done/unawaited updates, selection schema, thinking levels and pending-work consumer.

`SessionTable.toolState` maps to non-null JSON TEXT `sessions.tool_state`. Default state includes `subagent:{subagents:[]}`. `spawnSubagent` writes each tracking record as:

```js
{sessionId:child.id, description, model:child.model,
 isRunning:true, isBackground:parentTracking.isBackground}
```

The two reviewed spawn callers supply explicit boolean isBackground. Later status updates set isRunning; the coder resume path can add unawaited=true, and completion clears unawaited. No reviewed writer adds arbitrary record fields. Model is the child session's selection (`provider`, `modelId`, `thinkingLevel`, optional/defaulted `fastMode`). The source's thinking levels are off/minimal/low/medium/high/xhigh/max.

This is a tracking cache, not the authoritative execution selection. Pending-work checks inspect isRunning; approval/background paths inspect status flags. Actual child execution/result lookup reads the child's session model. Those authoritative selections are separately migrated by the existing provider-state helper. This helper does not respawn, resume, complete or mark work read.

## APIs and strict scope

`prepareSubagentTrackingJson({bytes,expectedSha256})` is pure and changes only:

`toolState.subagent.subagents[i].model.provider` where the exact value is the legacy provider.

It uses the shared duplicate-aware fixed-offset token parser and outside-token JSON padding. Model ID, thinking/fast settings, descriptions, child IDs, flags, ordering, arbitrary unrelated tool-state branches and every other JSON byte stay unchanged. An absent subagent branch is a valid no-op; an empty array is valid. A present branch must contain only subagents. Records require the exact known fields plus optional boolean unawaited, unique valid child IDs, known selection shape and booleans. Unknown shapes, duplicate keys/IDs, extra fields or unsupported model selections refuse rather than silently reset/skip them. The strict subset may reject older/custom state; it never invents a conversion for it. Bounds are2MiB JSON and1,000 tracked entries.

`prepareSqliteSubagentTrackingIdentity({databaseBytes,expectedSha256,walBytes,capability})` operates only on caller buffers in a private in-memory SQLite connection. It requires a checkpointed DELETE-header DB, absent/empty WAL, version20, the source-derived exact sessions schema/indexes, and genuine stopped/exclusive/disposable scope with rollback-journal absence. It rejects triggers/virtual tables and unknown schema. PK+old-text compare-and-exchange and a SQLite authorizer allow updates only to sessions.tool_state. Every other session column, every row in every other ordinary table, schema/version and integrity are verified unchanged. Bounds match the cached-assistant tool:64MiB DB,128 tables,20,000 rows/table,100,000 total rows/128MiB fingerprint input. Caller input buffers remain unchanged.

## Coherent handoff

The provider main chain is now:

`original main/WAL → verified private checkpoint → session/routine model identity → cached assistant metadata → tracking cache → prepared main`

Each adjacent stage's input/output hashes must agree. `subagentTrackingMigration` carries the evidence; lineage records cache output = tracking input and final prepared main = tracking output. The durable journal still compares and backs up the **original** main/WAL/SHM snapshots, not intermediate hashes. No extra target or unreviewed sidecar reset is added. All copied preparers finish successfully before journal preparation, and a real writer/startup fence remains required. Context-ledger and transcript cohorts retain their independent typed operations.

## Evidence and explicit gaps

Nine focused checks passed, without skips:

```sh
AUX_PINNED_DAEMON_SOURCE=/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs \
 node --test vendor/provided/aux-subagent-tracking-identity.test.mjs \
   vendor/provided/aux-disposable-state-handoff.test.mjs
```

Tests verify token-only pretty-JSON changes, every selection/status flag, unrelated branches, duplicate/unknown refusal, strict private SQLite updates, other-column/BLOB preservation, WAL rejection, stopped-scope rejection and all10 source anchors/hash. The actual temporary SQLite WAL-only handoff fixture contains a tracked child, cached final assistant, authoritative model and JSONL with unsigned spawn; crash/complete and rollback retain their original cohort and backups. Final reads happen after the terminal journal receipt verifies. Only the tracking model provider changes; opaque state still contains its original values.

Signed historical tool arguments remain refused by the separate unsigned-only preparer. Unknown/custom tracking layouts, opaque tool results/details/prose, other cached fields, cloud reconciliation, real startup fencing and actual app acceptance remain outside this preparation. The current accepted app and UI are unchanged; startupVerified remains false.
