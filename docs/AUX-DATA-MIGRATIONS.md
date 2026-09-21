# Aux runtime database upgrades

The runtime database now uses SQLite `user_version`. Version 1 adopts the legacy
unversioned schema and its existing column additions. Version 2 adds action intents,
their transition history, and legacy-journal import records. Version 3 adds durable
workspaces, tasks, and task revision history. Version 4 adds task evidence and
criterion review history. Version 5 assigns durable window ownership to saved tabs.
Version 6 adds revocable, task/workspace-scoped external-agent connections; only
token digests are stored.
Version 7 adds safe provider-failure metadata to persisted runs. Version 8 adds
first-class conversation title/archive metadata and backfills it from saved turns.
Version 9 merges every saved task's historical runs into one stable task conversation,
retaining run/task records and carrying forward saved conversation context choices.
These transitions cover runtime state; they do not migrate the Chromium profile,
browser cookies, or credential stores.

## Upgrade behavior

- A fresh database is initialized transactionally and stamped version 9.
- An existing unversioned database is backed up before any schema changes. SQLite
  `VACUUM INTO` includes committed WAL contents; copying only the main database
  file would not provide this guarantee.
- Backups live beside the selected database in a uniquely named directory such
  as `vector.sqlite.before-v9-XXXXXX/state.sqlite`. The directory has mode 0700
  and the snapshot mode 0600 on POSIX systems. Backups contain sensitive browsing
  state and remain local. They are not uploaded or automatically deleted.
- Schema changes and the version stamp commit together. A migration error rolls
  back the schema transaction and closes the connection; startup fails visibly.
- If a required backup cannot be created, startup fails before migration.
- A database with a newer version is refused before schema or journal changes.
- Normal restarts at the current version do not repeat migrations or create extra backups.
- Upgrades apply only missing transitions in order through version 9; the
  baseline schema is not reapplied. Existing tasks, revisions and action intents
  are retained. WAL uses synchronous FULL for committed action intent durability.

The runtime remains the single writer. Stop it before maintenance or recovery;
do not run a second runtime against the same data directory. Newer-version
protection applies to Aux builds containing this check, not historical builds
that never checked versions.

## Recovery procedure

1. Stop the desktop and its runtime completely. Preserve the failed database and
   all associated WAL/SHM files together for diagnosis; never discard them while
   another process has the database open.
2. Select the backup from the failed upgrade. Open it read-only to check
   `PRAGMA integrity_check` and confirm the expected state/version. Do not select
   a backup merely because its filename sorts last.
3. Copy the snapshot to a separate private recovery directory using the original
   database filename. Keep the snapshot itself unchanged. Select that directory
   with `AUX_DATA_DIR` for a controlled recovery run of a compatible app build.
4. Verify expected runtime records before choosing a recovered database for
   normal use. Runtime records can reference other files; a SQLite snapshot alone
   is not a full backup of artifacts or the browser profile.

Do not restore state automatically after an uncertain external action: restoring
a database cannot undo a message, deployment, or other service-side effect.
Reconcile those effects before resuming work.

## Evidence and next migrations

`tests/unit/database-migration.test.ts` exercises fresh initialization, each recent
ordered transitions including version 12 → 13 (coordinator leases and criterion
verifications), restart, WAL-backed snapshots and their
permissions, schema-error rollback and repaired retry, and refusal of newer schemas
using synthetic temporary databases.

Future schema changes require a new ordered version transition and tests against
the preceding version. Do not modify version 1 and assume existing version 1
databases will rerun it. Runtime backup/restore UI, retention (keep 3|5|10|20),
and disk-full backup failure are implemented. OS data-root Vector→Aux copy remains
fail-closed on dual roots. Full application/profile migration of cookies, password
stores and credentials remains open and must never silently move secrets.
