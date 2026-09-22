# Aux runtime database schema

The runtime database is `aux-state.sqlite` and carries a single consolidated
schema: `user_version` 1 with an `aux_meta` marker row (`schema = aux`). The
schema is declared as one unit with explicit foreign keys; it includes durable
task/workspace tables, the action-intent journal with transition history,
scoped agent connections, routines, vault grants, coordinator leases, and
criterion verifications. WAL mode with `synchronous = FULL` provides committed
durability for recorded action intents.

Legacy development databases — including any `vector.sqlite` and any earlier
incremental `user_version` — are not adopted. They are preserved untouched and
the runtime fails closed with a recoverable message. These transitions cover
runtime state only; they never touch the Chromium profile, browser cookies,
or credential stores.

## Startup behavior

- A fresh database is initialized transactionally and stamped version 1.
- An unversioned database that already contains tables is refused as a
  pre-versioning development database; the file is never modified.
- A versioned database without the `aux_meta` marker is a legacy development
  database; it is refused unchanged with instructions to move it aside or
  select another `AUX_DATA_DIR`.
- A database with a newer version or an Aux marker beyond the supported
  version is refused before any write. It is never reset.
- Schema creation and the version stamp commit together; a creation error
  rolls the transaction back and startup fails visibly.
- Normal restarts at the current version never re-run creation or create
  backups.

## Future upgrades

After external beta begins, schema changes use ordered `user_version`
transitions: `MIGRATIONS[N]` upgrades version N to N+1 inside one transaction
per step. Before the first step the live database is snapshotted with
`VACUUM INTO` into a private backup directory (mode 0700, snapshot 0600 on
POSIX); `VACUUM INTO` includes committed WAL contents, which a plain file copy
would miss. A missing transition or a migration error fails startup without
modifying the database. Every new transition requires a test proving existing
data survives.

## Recovery procedure

1. Stop the desktop and its runtime completely. Preserve the failed database
   and all associated WAL/SHM files together for diagnosis; never discard them
   while another process has the database open.
2. If a migration backup was created, open it read-only to check
   `PRAGMA integrity_check` and confirm the expected version. Do not select a
   backup merely because its filename sorts last.
3. Copy the snapshot to a separate private recovery directory under the
   original database filename. Keep the snapshot itself unchanged. Select that
   directory with `AUX_DATA_DIR` for a controlled recovery run of a compatible
   app build.
4. Verify expected runtime records before choosing a recovered database for
   normal use. Runtime records can reference other files; a SQLite snapshot
   alone is not a full backup of artifacts or the browser profile.

Do not restore state automatically after an uncertain external action:
restoring a database cannot undo a message, deployment, or other service-side
effect. Reconcile those effects before resuming work.

## Evidence

`tests/unit/database-migration.test.ts` exercises fresh initialization with
all tables and indexes, foreign-key enforcement, refusal and preservation of
pre-versioning and legacy versioned databases, refusal of newer Aux schemas,
and atomic upgrade steps that retain data — all on synthetic temporary
databases.

Runtime backup/restore UI, retention (keep 3|5|10|20), disk-full backup
failure, and interrupt-before-manifest skip are implemented and validated
against the schema marker and `user_version`. Chromium Cookies, Login Data,
Web Data and similar stores are classified refuse and never copied.
