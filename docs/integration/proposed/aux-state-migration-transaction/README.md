# Durable disposable-state migration transaction

Implemented as an external offline tool in `vendor/provided/aux-state-migration-transaction.mjs`. It is not imported by staging, packaging or the app. No owner profile, provider account, Keychain, native helper, UI file or accepted app was touched. The only filesystem execution so far used newly created synthetic temporary directories, removed by their tests.

This helper commits caller-prepared bytes for a bounded, exact list of **existing** files under one explicitly authorized canonical disposable root. Preference/provider transformations stay in their separate pure helpers. It never discovers profiles, scans credential directories, interprets payloads, generates authority, chooses a home directory or sends network requests. Newly absent files require a separate explicit migration design; they are not silently created as state targets.

## API

```js
import {
  createStateMigrationId, prepareStateMigration, commitStateMigration,
  recoverStateMigration, verifyStateMigration,
} from './vendor/provided/aux-state-migration-transaction.mjs';

// The caller obtains this root/capability from its reviewed disposable scope.
// assertStopped must check real exclusive ownership, not merely return a flag.
const capability = {
  root: authorizedCanonicalDisposableRoot,
  id: reviewedStoppedScopeId,
  disposable: true,
  exclusive: true,
  assertStopped: async ({ root, phase, transactionId }) =>
    actualStoppedWriterScopeStillHeld(root, phase, transactionId),
};
const transactionId = createStateMigrationId();
// Durably retain root + transactionId in the caller's private operation record
// BEFORE prepare: a killed prepare cannot return its handle.
const context = { root: authorizedCanonicalDisposableRoot, capability, transactionId };
await prepareStateMigration({
  ...context,
  files: reviewedPreparedFiles, // [{path, expectedSha256, bytes: Uint8Array}]
});
const receipt = await commitStateMigration(context);
const verified = await verifyStateMigration({
  ...context, expectedReceiptSha256: receipt.receiptSha256,
});
// Only a verified terminal result may be offered to the successor launcher.
```

On interruption, reacquire a genuine stopped/exclusive capability with the same reviewed scope ID, read the caller's saved transaction ID, and choose **explicitly**:

```js
const receipt = await recoverStateMigration({ ...context, action: 'complete' });
// Or: action: 'rollback'. Never infer this choice from an arbitrary mixed state.
await verifyStateMigration({ ...context, expectedReceiptSha256: receipt.receiptSha256 });
```

The receipt contains only format/status, transaction/scope IDs, a root-path fingerprint and exact relative filenames/before/after hashes. It contains no payload bytes or credential values. Treat journal paths, hashes, originals and prepared outputs as private operation data; the helper does not log them.

## Enforced scope and file checks

- POSIX platform with `O_NOFOLLOW`; exact canonical absolute root required. Root and every target parent must be owned by the current UID, nonsymlink directories with no group/other permissions or special bits. Parent/root device/inode/UID/mode identities are pinned and rechecked.
- Exact ASCII relative target paths only. No absolute paths, traversal, empty segments, backslashes, trailing dot/space aliases or tool-reserved names. Case-folded duplicate names and duplicate device/inode targets are rejected. Existing targets must be owned regular files, private/nonexecutable, with link count one; hard links and final symlinks are refused.
- Sources are read with `O_NOFOLLOW`, checked before/after reading, and compared to the caller's exact raw SHA256 before any journal/output write. No parse/serialize fingerprint substitutes for the expected raw source hash.
- At most 128 existing targets, each at most 64 MiB, with at most 128 MiB total original/prepared payload in one operation. No hidden profile scan or wildcard targets.
- The caller's live stopped-disposable capability is checked at entry, preparation checkpoints, each commit/rollback step, immediately before rename, finalization and verification. All targets are rechecked before every replacement. Changed hashes, ownership, paths, modes or known file identities refuse continuation.

## Durable sequence and retained originals

1. Validate the complete target set and prepared bytes, preserving source identity/mode and exact raw hashes. Clone prepared bytes; the caller's input buffers are not changed.
2. Create a unique private `.aux-state-migration-<id>` directory under the authorized root. Fsync its parent and persist/fsync a `preparing` journal via private temporary-file rename and directory fsync.
3. Exclusively create and fsync each `index.original` backup in the journal directory. Exclusively create/fsync the prepared replacement in the **target's own parent directory**, preserving its private mode; fsync that parent. Persist the staged file identity and backup identity in the journal. No target is replaced during preparation.
4. Recheck the complete source set and capability, then durably mark `prepared`. Commit verifies every backup and staged output, durably marks `committing`, and performs each hash/identity-checked same-directory rename followed by directory fsync. Journal writes occur after each replacement, but recovery does not rely on that progress write having happened.
5. After every target is verified as the known prepared file, persist terminal `committed` state and a fsynced receipt. A crash between terminal journal and receipt creation is recoverable by explicit `complete`; no returned receipt exists until its durable write succeeds.
6. Verification requires the exact caller-retained receipt hash, terminal journal, matching receipt body, every target's known final hash/identity, and all recorded original backups. Missing originals prevent verification. The helper provides **no deletion/purge API**; backups/journals remain, including after verification, for separately authorized retention/cleanup.

Same-directory rename avoids cross-filesystem replacement. Fsync is used for backup/output/journal/receipt files and affected directories. This is normal OS durability acknowledgement, not a guarantee against storage/controller failure.

## Recovery semantics

`complete` recognizes only exact known original or prepared identities/hashes. Already committed files remain untouched; remaining originals are replaced from their recorded staged files. Missing/modified staged outputs or original backups fail. An incomplete preparation with unavailable artifacts must be rolled back, not fabricated from missing new bytes.

`rollback` preflights the entire target set before any restoration. It restores only known committed outputs from verified original backups, using a new fsynced same-directory temporary file. The rollback file identity is journaled **before** rename, so interruption immediately after rename is recognizable on retry. Still-original targets are untouched. Partially prepared transactions never replaced their targets and can return to verified original state even if not all backups had yet been created. Unknown/concurrently changed state is refused in either direction; it is never overwritten with an older backup for convenience.

The optional `onCheckpoint({stage,index})` hook supports bounded progress reporting and synthetic interruption testing; it receives no data. An exception intentionally leaves the durable journal/artifacts for explicit recovery. Neither errors nor interruption automatically launch the app or choose a recovery direction.

## Essential concurrency limit

Multiple file renames are **not atomic**. The successor must remain stopped until a complete or rollback receipt has passed verification. This helper neither stops browsers nor treats a filesystem/advisory lock as proof that other processes cannot write. The integrator must supply a real, exclusive stopped-writer/disposable-copy scope, keep it held through verification and control the subsequent launch.

The module detects observed concurrent changes and pins/revalidates paths and file identities. Node's pathname-based rename does not provide a kernel atomic compare-and-swap/openat transaction against a hostile same-UID process swapping parent directories between checks. Therefore it must not be used on a running/shared/untrusted tree or passed a capability whose callback merely asserts success. That stronger adversarial use requires a reviewed descriptor-relative native transaction owner. The current API deliberately does not claim it solves that problem or authorizes real owner-state access.

## Lean evidence and integration gap

`node --test vendor/provided/aux-state-migration-transaction.test.mjs` passes nine actual temporary-filesystem fixtures: durable commit/private retained backups/receipt verification; concurrent source refusal; mid-commit complete; mid-commit rollback; unknown mixed-state recovery refusal; symlink/traversal/case-alias/hard-link/mode refusal; capability loss/root-alias refusal; interrupted preparation rollback; and missing-original verification refusal.

The fixtures inject exceptions at the same durable boundaries that a process exit could interrupt, including after a target rename and before the next journal progress write. They do not simulate power loss, a malicious kernel, actual browser process ownership, real provider credentials or an integrated successor launch. Root must connect its reviewed native-preference/provider transforms and real stopped-disposable capability, then perform one bounded copied-state acceptance. No runtime integration or production-ready claim is made here.
