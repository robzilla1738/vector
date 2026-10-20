# Original Chromium encrypted-source snapshot owner

Immutable one-file proposal after003e5c3a8 (private byte wrapper). This replaces only the cookie/password reader's inherited in-memory Snapshot() route with the positively recovered supplied physical-copy owner. Firefox/history/shared JSON helpers remain unchanged, pending their separate source proof.

## Actual lifecycle

Original cookie425a544..425a6b4 and password425b3f0..425b524 create a unique temporary directory using default `scoped_dir`, derive selectedDB.BaseName(), and use base::CopyFile(source,temp/BaseName()). Only a successful copy changes the path passed to sql::Database::Open; failed directory creation OR failed copy falls back to opening the source path. Failure to open that selected path remains a real import failure. There is no second source fallback after a successful copy subsequently fails to open.

The Chromium loops copy only the database itself. They do not copy or merge `-wal`, `-shm`, or `-journal`; the separately recovered Firefox reader has different sidecar handling and is not used as evidence for Chromium. A copied WAL-mode file is opened under the native SQL owner's real behavior, without silently adding newer source WAL rows via the independent backup API. Source-path fallback likewise uses actual native SQL behavior against that path.

The port reuses actual155 base::ScopedTempDir/CreateUniqueTempDir, base::CopyFile, sql::Database and sql::Statement. The original `Test` database tag is retained (actual155 accepts it). Native DB default options, initialization, locking, error handling and query admission belong to that real class; there is no new SQLite-CAPI facade, read-only override or custom PRAGMA policy. Statement::ColumnString/ColumnBlobAsString preserve the source byte lengths; Step/Succeeded retain actual native completion semantics. Existing row/secret/partial-decode behavior and real source-key gate remain unchanged.

Statement lifetime ends before database lifetime, which ends before ScopedTempDir cleanup on success, failure or early return. Member declaration order enforces DB-before-directory destruction. Only that owned unique directory is retired; no source or unrelated temporary directory is deleted.

## Removed independent narrowing in this path

The old shared Snapshot() still exists for other readers. It is no longer used by these two positive original callsites, so its256MiB file/page budget,4096-backup-step budget, arbitrary backup retry budget, NOFOLLOW/link pre-admission and WAL-merging memory backup no longer redefine Chromium cookie/password import. Actual upstream CopyFile/SQL/path behavior supplies original native admission instead. This does not blindly broaden every importer or claim the independent helper was identical.

## Integration and evidence

Root GN: add `//sql` to `source_set("migrator").deps`. Existing base dependency supplies ScopedTempDir/CopyFile; no new source or target is registered. Focus existing migrator.cc object, then usual root composition/full build. No GN/shared-native mutation or compilation was performed in this lane.

Original bounded callsite/copy/temp/cleanup ranges, `scoped_dir`/`Test` literals and current155 helper/SQL implementation files are pinned. verify.py checks those pins and replays the one-file patch against captured003e output in a disposable tree. This is source proof only: no source profile/database, temp-directory native helper, SQL reader, credential/Keychain/OS operation or browser was executed. Public API, authority/caller selection and source failure reporting are preserved; actual import acceptance remains unverified.
