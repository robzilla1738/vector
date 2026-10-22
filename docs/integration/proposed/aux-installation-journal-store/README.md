# Private durable installation journal store

`PrivateInstallationJournalStore` is a concrete external Swift filesystem caller for the captured-result installation transaction. It persists/reloads exact checkpoints and supplies their actual stored digest to the reducer. It performs **no Security, Keychain, enclave, profile, selector-selection or authority operation** and is not activated in Aux.

The store adopts the reviewed offline transaction's safety semantics (canonical private disposable root, no-follow owned objects, bounded stable reads, exclusive writes, hash CAS and file/directory fsync), but binds directly to the Swift `AdditiveInstallationJournal` parser rather than introducing a generic file transaction. The original audited JavaScript helper remains unchanged and is pinned as design lineage.

## Storage contract

- Caller explicitly supplies an existing **canonical disposable root** and canonical uppercase transaction UUID. The root and transaction directory must be owned by the current UID, exactly mode 0700 and nonsymlink. Root pathname/inode and the descriptor-relative transaction directory entry are rechecked. Existing permissions are never repaired automatically.
- Files must be owned, regular, nonsymlink, one link, exactly 0600 and at most 16 KiB. Reads check descriptor/path identity plus size, modification and change timestamps before/after. Extended ACL entries are refused; Darwin's no-ACL `ENOENT` result on a valid fd is accepted, other ACL inspection failures refuse.
- Revisions are create-once `revision-<number>-<sha256>.json` records. Existing exact staged bytes can be reused only after validation and another file/directory fsync. Partial or changed records refuse and remain preserved. This is immutability **by the API**, not an OS immutable flag or protection against a hostile same-UID process.
- `HEAD.json` selects one exact canonical checkpoint, whose bytes must pass the original bounded, duplicate-aware journal parser and match the recorded hash/revision/transaction. Publishing uses an exclusively created private same-directory head temporary, file fsync, rename and directory fsync. No prior revision, orphan checkpoint or interrupted head temporary is deleted.
- The permanent private `LOCK` inode uses nonblocking `flock` to serialize **cooperating store callers**. A stale expected head is refused under that lock. It is not an atomic filesystem compare-and-swap against arbitrary noncooperating same-UID writes, and it proves nothing about browser or Keychain writers.
- Successors retain candidate, selectors, original/target hashes and ordered progress, advance exactly one revision and cannot reopen blocked/abandoned state. Initial blocked preparation failures can be stored without first fabricating a successful draft. Only explicit abandonment may follow blocked state.

## Minimal caller flow and interrupted publication

`commit(journal, expectedHead:)` stages a revision then publishes it with an independently rechecked expected head. It returns `StoredInstallationCheckpoint`; its `acknowledgement` carries the digest of bytes that were written, fsynced and selected. The store does not interpret that acknowledgement as permission to touch an authority.

The explicit `stage` / `publish` split supports recovery. After staging and before publication, a reload still selects the previous checkpoint; the new revision is an orphan evidence record. A fresh caller can publish that exact staged record only if the expected head still matches. A concurrent winning publisher causes stale refusal; evidence remains. If rename completed but final fsync/readback failed, treat the outcome as uncertain and reload/reconcile—never assume the old head or automatically repeat a Security add.

Persist the reducer's intent **before** obtaining/executing an add request. On restart, load the head and obtain truthful fresh original/target captures through a separately approved caller, then use the reducer's explicit reconciliation. This store does not capture Keychain state, prove when an external add happened, resurrect a blocked journal, clean up partial target rows or switch active selectors. A caller ignoring the current head and replaying an older in-memory journal is still incorrect; the durable CAS must be used at every revision.

## Focused verification

`node docs/integration/proposed/aux-installation-journal-store/check.mjs` passed **20 actual disposable-filesystem assertions**. These cover intent save/reload, exact checkpoint parsing, interruption after revision fsync before head publication, stale and two-caller publication conflicts, active lock refusal, canonical/symlink and directory/file mode refusal, preserved prior/orphan records, initial blocked persistence and refusal to revive it. The fixture prepares its candidate with fixed synthetic software keys; no hardware or Security operation runs. It is a deterministic interruption simulation, not a process-kill or power-failure test.

`verify-store.py` checks source/fixture/dependency pins and required no-follow/CAS/fsync/retention boundaries. The composed SDK typecheck passed. No claim is made of physical-drive power-loss durability beyond successful POSIX fsync calls; no owner data was used.

## Remaining native integration

The store is now real filesystem implementation, while the Security executor remains unexecuted source. Still missing: reviewed effective legacy/Aux access-group bindings for current scoped artifacts; genuine stopped/exclusive disposable authority capture; trusted public continuity expectations; an approved caller linking capture, durable intent, actual create-only status and readback; authenticated target authority/root acceptance; and durable active selection/restart/rollback. File locking cannot provide those authority guarantees. No signing, entitlements, runtime approval or app integration is added here.
