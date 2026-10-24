# Paired DOM-storage sync and native patch integration

The native migration drain now waits for an explicit backend **file-data sync** after earlier DB tasks. Prior failed writes remain latched; unsupported backends, in-memory fallback, failed syncs and lost/destroyed callbacks fail. The existing service callers retain their loaded-area and lifetime checks. Original Flush and ordinary write policies stay unchanged. None of this changes the accepted UI or app.

The LevelDB path writes an empty, non-null batch with `sync=true`, including on an empty retry. The actual pinned LevelDB implementation writes the log record and syncs the log for that case. Local and Session Storage delegate to that same implementation. Test failure injection remains a refusal.

The SQLite path requires an already open, idle WAL database. The normal DOM configuration uses WAL/NORMAL; it does **not** enable `no_sync` by default. The helper also handles an existing OFF setting. OFF/NORMAL temporarily become FULL; FULL/EXTRA are not weakened. It syncs the actual open journal/WAL and main VFS handles before checkpointing, performs a truncating checkpoint, syncs the handles again, and restores the original mode even on failure. Busy or partial checkpoint, unsupported file sync and restoration failures do not become success. It never reopens caller-supplied paths, repairs databases or synthesizes persistence.

The explicit VFS calls cover an important empty-retry case: SQLite can skip checkpoint xSync when no page remains to backfill. Changing `synchronous` and accepting checkpoint success alone would not establish unconditional file sync. `source-review.json` pins the actual SQLite, LevelDB, SQL and sandbox VFS sources supporting this finding. The sandbox VFS reaches `File::Flush`, but does not sync parent directories. **Native journal/owner logic must still synchronize directory topology and establish complete cross-store durability.** No power-loss or runtime guarantee follows from compilation.

## Actual source and compilation

`project.py` records 18 exact source/header projections into a private overlay. The first compile rejected an inline virtual method under Chromium's style policy; its producer, edit plan, patch, command and actual failure are retained. Its separately compiled checkpoint-only helper is explicitly unaccepted after the source review above. The corrected method is out of line; compiler policy remains intact.

The actual a2 compile passed all **11 affected native objects**, including the base interface, SQL/VFS method, both LevelDB and SQLite implementations, asynchronous DB owner and both storage services. It pins 866 unique dependency inputs and actual per-object commands/hashes. `actual-compile-a2.json` records this evidence. No browser link, executable signing, native API invocation or database execution occurred.

## Product source registration

`chromium/patches/aux/0106-aux-ui-storage-migration.patch` is now registered in the native series. It combines these changes with the preceding queue/service and extension-preference backends in one **26-file** patch. It also registers the previously compiled five-case extension migration fixture in the existing native unit target. Pending area files 0101–0105 were not changed or implicitly activated.

Actual disposable replay from the pinned native HEAD passed `git apply --check`, application, exact final-byte comparison and reverse checking. None of these paths overlaps the existing registered series. `actual-series-integration-a1.json` pins the full patch and every before/after file. The existing native checkout was not edited, and the latest inactive app does not contain this patch. The source registration is a recipe for a future coherent build; it is not a linked, executed or accepted candidate.

Still required: the authenticated browser importer; complete origin/page and unsaved-editor capture; native owner/epoch association and writer closure; backup/journal, directory sync and interrupted cross-store recovery; startup activation; the coherent full build; and actual disposable acceptance. These gates remain closed. There is no renderer migration endpoint or startup bypass. Signing, release, owner data and OS permissions remain separate.
