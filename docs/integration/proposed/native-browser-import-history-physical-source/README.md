# Original mode1 Chromium History owner

Incremental one-file proposal on the integrator-announced applied449 baseline (`0598c729c3bc63dcb9cf8b01536cce3951d9e444f63b06a43e6cdef1c01b05b6`). Three counted anchors add a private original History owner and route Chromium History to it. No shared native file or GN file is changed by this proposal.

## Positive original call chain

The actual mode1 category worker is `4253e58`. Its History branch `4254500..4684` appends `History`, tests existence, creates the default `scoped_dir` temporary directory, appends `History` within it and calls CopyFile. Only successful copying changes the selected path. Temporary-directory/copy failure retains the source path. It constructs the SQL database through `300f948` with exact `Test` tag, then calls its ordinary Open (`1561684`). This is the same constructor/Open/copy lifecycle already recovered for cookies/passwords and implemented by the actual449 `ChromiumSourceSnapshot` class. This proposal reuses that class, not a parallel snapshot abstraction.

The native SQL defaults are not replaced with read-only, NOFOLLOW, defensive/trusted-schema or shared-locking policies. The separately pinned `native-browser-import-physical-options-proof` establishes actual exclusive-locking, read-write/create and non-WAL defaults for this exact constructor/Open route; actual155 owns those typed defaults. Only the primary database is copied; no source WAL/SHM/journal merge or memory backup is invented. Statement destruction precedes database close, which precedes removal of the one owned temp directory.

At `4254634..4648`, the original prepares exactly:

```sql
SELECT url, title, visit_count, typed_count, last_visit_time, hidden FROM urls
```

There is no row limit. `4254660..4678` checks a valid statement then steps; a row (`100`) enters `4254fc4`. Every loop iteration returns through `4255024..5030` to Step, and any non-row result goes straight to statement destruction. Thus missing file, failed Open or invalid query yields no rows; a terminal Step error retains rows already decoded. There is no Succeeded-based all-or-nothing discard or synthetic error added by the port. These are original source semantics, not a claim that a failed read imported data successfully.

The row island constructs the actual GURL from native column0, skips invalid URLs and exactly chrome/chrome-extension/devtools, copies its canonical URL into the actual history URLRow, and obtains the title from native column1 through UTF8→UTF16. Columns2/3 are signed int counts,4 is the signed64 Windows-epoch time and5 is bool. The port uses actual sql::Statement ColumnString / ColumnString16 / ColumnInt / ColumnInt64 / ColumnBool, preserving native length-aware text and conversion. The JSON projection keeps the existing destination URLRow contract; the actual destination batch writer remains unchanged.

## Inherited policies retired only on this proven path

Chromium mode1 History no longer passes through the independent in-memory SQLite backup, 256 MiB/page/retry limits, 200000-row SQL/loop limit, 64 MiB decoded-row budget or 8 KiB Text helper. All source rows/text admitted by the actual SQL/GURL owners remain available. Firefox History/bookmarks/cookies still use their existing separate reader and are not declared faithful by this proof. The old shared reader remains reachable for those paths only; its limits are not broadened from unrelated evidence.

## Integration and verification

No new GN dependency is needed: actual449 already registers `//sql`, base scoped temp/copy, string conversion and direct GURL dependencies. Root should compile the existing migrator object after integration. The same-file root work below/above these three anchors can be independently rebased; the manifest pins captured449 parent and output hashes.

`verify.py` passes original thin-binary/listing/literal hashes, retained155 SQL source hashes, all three counted anchors and exact one-file patch replay. No SQLite database, source profile, browser, Keychain, OS operation or native build was executed. Runtime migration acceptance remains root-owned.
