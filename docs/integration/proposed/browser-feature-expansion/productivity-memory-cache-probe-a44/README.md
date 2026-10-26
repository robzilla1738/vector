# Remove the obsolete pre-factory subprocess in ordinary fixed memory mode

The demonstrated A38 indexing error occurs before `MemoryProcess.#f` reaches the native factory. Packaged mode leaves `LOCAL_MEMORY_EXECUTABLE` unset, so `ensureMemoryAssets` acquires the verified bundled runtime cache. `ModelDownload.ensure` then runs `execFile('/usr/bin/xattr', ['-p','com.apple.quarantine', originalCachedExecutable])`. The ordinary main owner correctly refuses that generic subprocess with `spawn EPERM`.

This exact paired-source adaptation changes only that probe's condition. It skips the unused original cached executable probe when the genuine existing native binding has BOTH an immutable data property `supervisedTasksEnabled:false` and an immutable data property `createAccountMemoryProcess` whose value is a function. No accessor, mutable/configurable descriptor, missing factory or supervised mode qualifies. The predicate captures the existing native binding once locally. It does not mint authority or change the native factory.

The probe body and full-mode behavior remain unchanged. All preceding runtime-cache hash/size/manifest/readback checks remain byte-identical. No quarantine attribute is removed. The actual distinct fixed signed helper still passes its native sealed resource, identity, byte hash, roots, account, sandbox, suspended child publication and physical lifetime checks. Generic exec/PTY/tools remain refused.

`prepare.py` pins the exact current packaged A38 source and paired entry, applies one count-checked anchor per leaf, reverse-replays to prove there are no collateral changes and emits fresh files under `/private/tmp`. `source-plan.json` holds the exact selected output paths/hashes for root's paired source/sealed-entry packaging. Only the script, plan, evidence and this explanation are committed; large app/source artifacts are not copied into Git.

Both actual generated leaves passed `node --check`. No source evaluation, app/helper invocation, native build, credentials, OS operation or signing was performed. Actual indexing/search/close still requires the approved root integration and runtime check.
