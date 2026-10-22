# Cached final-assistant identity preparation

This prepares snapshot bytes in a private in-memory SQLite connection. It performs no file discovery, owner-state access, native/UI changes, signing, provider calls or app startup. It does not declare Aux ready.

## Pinned actual shape

The supplied 1.26.1016.1852 daemon SHA-256 is `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. [source-audit.json](source-audit.json) records five exact counted anchors: the fresh `session_runs` DDL, migration14, migration18, projection extractor and reader normalization. The schema module derives only the relevant run-table/index statements plus the exact migration14 rename/add-column/index steps and migration18 trailing-message column. The target database version is20, matching the existing provider-state migration. Migration14's `turn_id` remains nullable in actual DDL despite the newer ORM requiring it; this helper preserves that layout rather than inventing a fresh table.

`session_turns.id` is an auto-increment integer primary key. It has unique `(session_id,turn_id)` and `(session_id,jsonl_read_offset)` indexes. `final_assistant_message` is nullable JSON TEXT. The actual `extractFinalAssistantMessage` returns `[ {...assistant, content:[lastNonemptyTextBlock]} ]`, or `[ {...assistant,content:[]} ]` for an error with no text, otherwise null. The reader normalizes non-null non-array cached data to null. This tool refuses unsupported non-null variants rather than silently dropping or interpreting them.

## API and limits

```js
const {bytes,receipt} = await prepareSessionTurnCacheIdentity({
  databaseBytes, expectedSha256, walBytes: null,
  capability: {
    id: 'reviewed-disposable-scope', disposable: true, exclusive: true,
    rollbackJournalAbsent: true,
    assertStopped: async context => genuineStoppedProof(context)
  }
});
```

The helper requires an absent/empty WAL and a checkpointed DELETE-header main, version20 and exact `session_turns` table/index/column schema. It rejects old `session_runs`, extra target indexes, triggers, virtual tables, unknown cache shapes and malformed/duplicate JSON members. Unsupported variants are not treated as empty caches. Null rows are skipped unchanged. Bounds:64MiB DB,20,000 rows per table,128 tables,100,000 rows/128MiB fingerprint input across all tables,2MiB cached JSON. All ordinary table snapshots are fingerprinted; the authorizer permits only updates to `session_turns.final_assistant_message`, and each update compares the integer PK plus exact old cache text. Every other column, row and table value, schema/version and integrity are rechecked.

Only the cached single assistant's direct `provider` (`aside`→`aux`) and `api` (`aside-provider`→`aux-provider`, `aside-images`→`aux-images`) string tokens change. Content, signatures, model IDs, usage, timestamps, row IDs, body/revision metadata and JSON formatting remain unchanged. The existing bounded duplicate-aware transcript token helper is reused: the one object's actual LF whitespace is temporarily framed as one parseable JSONL record, then restored byte-for-byte. Replacement padding stays outside the JSON string token, so original JSON byte length and all line positions remain equal. Escaped old values and pretty JSON are covered. Opaque nested tool arguments are never rewritten.

## Coherent handoff integration

For provider DB cohorts the handoff now chains:

`original main + WAL → private verified checkpoint → session/routine model migration → cached assistant migration → prepared main`

The same transaction replaces the original main/WAL/SHM using their **original raw snapshot hashes**. The cache's input hash must equal provider migration output hash. The final lineage records provider-output/cache-source/final prepared hash, and cache evidence is exposed as `cacheMigration`. Context-ledger behavior remains independent and unchanged. No partial helper output is applied to a real file. All original backups remain retained.

The provider handoff now requires this actual pinned cache table to exist. Earlier minimal synthetic fixtures containing only sessions/routines must include the source-derived cache DDL; absent cache tables are not silently considered migrated. The handoff fixture has been updated accordingly. This change is intentionally strict, not an implicit schema upgrade.

## Focused evidence and remaining gaps

Eight combined checks passed with no skips:

```sh
AUX_PINNED_DAEMON_SOURCE=/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs \
  node --test vendor/provided/aux-session-turn-cache-identity.test.mjs \
    vendor/provided/aux-disposable-state-handoff.test.mjs
```

Synthetic checks cover escaped/pretty cached JSON, exact token-only changes, null skip, custom opaque user payload/BLOB retention, idempotence, malformed/duplicate/unsupported values, unknown index, nonempty WAL and lost stopped proof. The source-backed check validates the full daemon hash/all five anchors, reconstructs the schema module from the pinned statements and executes only the actual pure extractor on synthetic messages in a VM.

The actual SQLite WAL-only handoff fixture now includes the cached assistant row together with its JSONL. A crash after main replacement leaves original sidecars and transcript; explicit completion and receipt verification precede final reads. The final cached assistant equals the migrated transcript's final text projection, signatures and byte offsets remain, and main lineage pins the original snapshot and the two identity preparation stages. Rollback restores all original bytes and private backups remain.

This resolves only this cached column through this paired flow. Opaque queued/steering content, typed historical executable tool arguments/model overrides, other projection columns, renderer acknowledgement, cloud reconciliation and the real startup/write fence remain outside this helper. `startupVerified` remains false. Do not launch a consumer while the durable journal is mixed or before its terminal receipt verifies.
