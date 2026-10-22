# Bounded offline SQLite provider migration

Implemented in `vendor/provided/aux-sqlite-provider-identity.mjs`, with exact target-schema input in `aux-sqlite-provider-identity-schema.mjs`. This is an external migration tool, not an app/runtime adapter. It receives only explicitly supplied database/WAL buffers and a stopped-disposable snapshot capability; it accepts no database path and performs no filesystem, profile, provider, native, Keychain or UI operation.

## Actual inspected source and supported schema

The original1852 daemon source SHA256 is `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. Seven exact source anchors were independently inspected and recorded in `source-audit.json`; the filesystem/loader map is commit `74c0e950d`, `docs/integration/proposed/provider-state-layout-1852/README.md`. No original daemon code was executed.

The actual target is account-local `state.db`, not a JSON state file. `sessions.model` is non-null JSON text containing a model selection. Routines migrate through schema19 to a v2 table with non-null `session_config` JSON text containing an optional `model`; schema20 appends `revision` and `sync_definition`. Sessions gain `transcript_revision` during their earlier migration. The current supplied version is `PRAGMA user_version=20`.

The helper recognizes **only the exact fresh1852 target-table DDL plus those applicable migrations**, including target indexes, column order/types/defaults/key/nullability and SQL text. Its expected SQLite schema is generated from the extracted DDL using the same local SQLite engine, then compared before and after migration. Unknown future/historical DDL variants, extra target indexes/columns, triggers, virtual/generated layouts, wrong user version and an unfinished `routines_v1` table fail closed. This strict support claim is narrower than every historical database the original application may have produced; an additional historical layout needs its own source-pinned review rather than relaxed schema matching.

Other database tables are not renamed or redefined. The helper uses a private in-memory SQLite clone with extension loading disabled, defensive mode, untrusted schema and memory-only temp/journal settings. It performs no filesystem-backed clone or temporary database opening.

## Exact transformation

- Change only `sessions.model` object's direct `provider` from `aside` to `aux`.
- Change only `routines.session_config.model` object's direct `provider` from `aside` to `aux`, when that optional model exists.
- Preserve `modelId`, `thinkingLevel`, `fastMode`, all extra properties, whitespace, property order, string escapes and numeric lexical forms in the original JSON text. A duplicate-aware token parser replaces **only the provider value token**; it never reserializes the rest of the JSON.
- Keep already-Aux/custom-provider selections and routines without a model unchanged. A no-change operation returns byte-identical original database bytes.
- Refuse malformed/duplicate-member JSON, unknown selection shapes or unsupported thinking levels rather than inserting defaults or choosing another model. Stored selection validation follows the pinned source: provider string, nonempty model ID, its seven thinking levels, and optional boolean fastMode.

All replacements run inside one SQLite transaction on the clone, with `WHERE id=? AND <original-json-column>=?` compare-and-exchange. The authorizer denies inserts/deletes and permits updates only to those two exact columns. Target row counts/IDs, every other column's type/value fingerprint and every resulting JSON text are checked afterward; schema and integrity are rechecked before the output is serialized. `updated_at`, routine metadata, queued messages and unrelated rows remain unchanged. Database page/header bytes can change during a real update; the preservation claim concerns unrelated stored values/rows, not byte-identical whole-file pages.

Bounds: at most64MiB input/output database, 20,000 rows per target table, 2MiB per selected JSON field and nesting depth64. Unsupported snapshots fail without changing the caller's source buffers.

## WAL and rollback-journal policy — explicit limitation

This revision **does not import WAL frames**. `walBytes` must explicitly be `null` for a verified-absent WAL or a zero-length `Uint8Array` for a verified-empty WAL. Undefined/missing WAL state and any nonempty WAL fail. Database header read/write versions must both be1; even an empty-WAL database still marked in WAL mode is rejected. The caller's capability must additionally attest that a pending rollback journal is absent.

Do not drop a live WAL or change an original database's header to make it pass. If necessary, checkpoint and leave WAL mode using a separately authorized **private disposable clone with its complete copied sidecars**, then capture and verify that stopped clone. That SQLite sidecar/checkpoint operation is not implemented by this module. Its absence is a real integration prerequisite, not a successful WAL migration claim.

The prepared DB bytes are safe to offer to the generic filesystem transaction only while the same real stopped-writer scope remains held and the verified-absent/empty sidecar disposition remains true. The DB's expected raw hash, sidecar hashes and capability must be revalidated at commit. The generic journal's file list must not omit a nonempty sidecar or claim arbitrary multi-file SQLite sidecars were handled here.

## API and journal handoff

```js
const prepared = await prepareSqliteProviderIdentity({
  databaseBytes: reviewedStoppedDatabaseBuffer,
  expectedSha256: reviewedRawDatabaseSha256,
  walBytes: null, // explicit verified absence; empty bytes allowed separately
  capability: {
    id: reviewedSnapshotScopeId,
    disposable: true,
    exclusive: true,
    rollbackJournalAbsent: true,
    assertStopped: async ({ databaseSha256, walSha256, phase }) =>
      actualStoppedSnapshotStillOwned(databaseSha256, walSha256, phase),
  },
});
// Root's reviewed generic transaction can accept this one prepared target,
// together with its other independently prepared state transformations:
const target = {
  path: reviewedRelativeStateDbPath,
  expectedSha256: prepared.receipt.sourceSha256,
  bytes: prepared.bytes,
};
```

The capability is checked against exact snapshot hashes before opening the memory clone and again before returning output. It is an injected real ownership/stopped check, not self-authorization or a mere UI checkbox. The receipt contains hashes, changed-row counts, schema/version and sidecar disposition, without row IDs, payloads or owner paths. No original file is written and no launcher is activated here.

## Lean evidence and outstanding reference audit

`node --test vendor/provided/aux-sqlite-provider-identity.test.mjs` passes five focused synthetic SQLite fixtures: exact JSON token-only migration plus unrelated row/column preservation; byte-identical no-change behavior; malformed/duplicate/invalid JSON refusal; unknown schema/index/trigger/version/unfinished-routine refusal; and explicit WAL/header/stopped/rollback-journal refusal with verified-empty acceptance. The fixture uses the actual extracted target-table DDL, a minimal referenced `projects` stub and a synthetic unrelated BLOB table. It does not claim full original startup/migration execution.

**Queued/steering messages, transcript JSONL, historical turn bodies, tool state and other nested provider references have not been fully audited or migrated.** Known queued legacy references are intentionally retained in the fixture to make this limit visible. The receipt lists these uncovered domains. Those references may matter to active-work resume and must be resolved in the broader provider migration before claiming complete Aux identity. No actual disposable application database, native UI or integrated restart acceptance was tested by this lane.
