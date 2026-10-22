# Durable copy-only credential checkpoints

This external disposable migration-tool component connects the reviewed captured credential reducer to actual private filesystem checkpoints. It does not execute Security, query any real credentials, supply writer custody, authorize migration, or activate an application path.

`DurableCapturedAuxCredentialCopy.begin(canonicalDisposableRoot:binding:boundary:)` captures one explicit reviewed source and absent target, persists the draft, and retains a process-local one-shot preparation. `performOneStep()` persists and reads back the intent before its sole Add attempt. `resume(...transactionId:...)` loads actual stored evidence; every resumed draft or intent is observation-only. Matching target readback resolves an uncertain successful Add without replay. Missing or inaccessible source is durably blocked, never inferred empty. Blocked records stay terminal.

No coordinator mutex crosses captured-boundary callbacks. A short in-flight guard refuses reentrant/concurrent operations. Fresh preparation is consumed before filesystem operations: uncertain intent publication cannot re-arm Add in this object. Hash CAS rejects changed heads, but filesystem locks coordinate only callers using this store. They do not exclude browser/native writers or prove all-writer custody. Source/target can change outside this component; real admission and separately reviewed typed selector/entitlement capture remain prerequisites.

`generate.mjs` makes one reviewable logical `PrivateAuxCredentialCopyJournalStore.swift` source from the pinned existing fresh-store FD prefix plus the new credential record/rules and tail. The only prefix adaptations are class/error names, private directory name, and the reducer's canonical lowercase UUID. Records and store are deliberately one logical source file, preserving `fileprivate` access. The coordinator/reducer/fixture compile as separate files.

The reused FD mechanics enforce owned canonical 0700 directories, 0600 one-link regular files, no extended ACL or symlinks, nonblocking special-file refusal, exact-size bounded reads, file identity checks, nonblocking cooperative lock, file/directory fsync, and same-directory HEAD rename. Revision files are immutable O_EXCL entries, originals and partial evidence are retained. A revision orphaned before HEAD publication refuses automatic adoption; resolving such a conflict needs explicit review. This is durable single-head publication, not atomic filesystem-plus-Keychain execution.

Only binding/payload hashes, counts, fixed reasons, UUID and phase/revision metadata are persisted. Secret payload and logical-key text are never serialized. Restart needs fresh explicit source capture. No deletion/reset/overwrite of credential rows exists in the captured interface.

## Focused evidence

`python3 scripts/native-build.py sh docs/integration/proposed/aux-credential-copy-journal/check.sh` compiles actual separate source units and runs a disposable-filesystem fixture. It checks opaque nonUTF8 exact copying, durable verified readback, stale CAS refusal, throw-after-success Add recovery with one Add total, resumed draft no Add, seven retained original/partial revision files, no raw payload on disk, unsafe mode refusal and preserved evidence. No Security method is invoked. The predecessor's callback/reentry successor is pinned; its historical fixtures are not repeated.

Actual runtime Security adapter, authentic capture provenance, entitlement/selector review, original scope exclusion, whole-cohort admission, user-approved activation, and real crash/power-loss durability remain unverified. Successful compilation and captured fixtures do not make this tool ready to migrate owner state or retire the original runtime.
