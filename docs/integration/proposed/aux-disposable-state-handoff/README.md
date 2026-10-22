# Coherent disposable-state handoff preparation

`vendor/provided/aux-disposable-state-handoff.mjs` connects the reviewed provider JSON, native preference, private WAL checkpoint, SQLite provider and durable filesystem transaction helpers. It produces one journaled **prepared** state set. It does not commit automatically, launch Aux or assert application/startup acceptance. No accepted app, native source, owner profile, real credential, Keychain or provider account was touched.

Dependencies include the actual-layout provider JSON helper from commit `d28e1db8d`, preference migration, transaction `8517e5943`, SQLite provider migration `a502c5ca4` and private WAL checkpoint `5bc320aea` (or their reviewed integrated successors). The older virtual provider-envelope helper is not used.

## Scope and inputs

The caller supplies an exact canonical authorized disposable root, a live genuine exclusive stopped-writer capability, a pre-recorded transaction ID, explicit nonoverlapping relative prefixes for Aux home/browser user data and every source buffer with its expected original raw hash. The helper performs no profile/account discovery or fallback to an owner home. Generic transaction safety checks still enforce canonical parent/file identity, no symlinks/hard-link aliases, private ownership/modes and pre-write raw-hash CAS.

Supported JSON descriptors are:

- `provider-json`: an actual-layout `logicalPath` accepted by `classifyAuxProviderJsonPath`, such as `u/1/settings.json`, `u/1/credentials.json`, `u/1/models.json`, `u/1/cache/models.json` or `accounts.json`. The target is under the explicitly supplied Aux-home prefix. Accounts' login-provider/session credentials remain their original values; those are not managed model-provider identifiers.
- `profile-preferences`: an explicit `Default` or `Profile N` directory under the supplied browser-user-data prefix. Native preference values are migrated using the reviewed exact table. Unknown/conflicting state fails; IDs, geometry/state values and unrelated preferences are preserved.
- `local-state`: the exact `Local State` document under that browser prefix.

Native preference input requires valid unambiguous UTF-8 JSON; duplicate members, unknown types/keys and conflicting Aux values refuse. JSON transformations run before any journal preparation, so a conflicting snapshot cannot cause a partial target replacement.

SQLite descriptors explicitly identify a nonnegative numeric account, original main bytes/hash, original **existing** WAL bytes/hash, original **existing** SHM bytes/hash and verified absent rollback journal. Both sidecars require `disposition:"present"` and `replacement:"empty-reviewed"`. Missing/unknown sidecars or unreviewed resets refuse. SHM is accepted only as an explicitly captured transient sidecar with zero or a bounded multiple of32768 bytes; its platform-specific contents are not treated as durable authority.

This cohort intentionally handles an existing main/WAL/SHM triplet. It does not infer what to do when normal shutdown has removed sidecars, create absent state targets, delete files, or pretend absent and unknown mean the same thing. A no-sidecar cohort requires a separately explicit policy/transaction, not fabricating a present-sidecar snapshot here.

## Coherent SQLite preparation

1. Validate original snapshot hashes and the held stopped/exclusive scope.
2. Checkpoint the complete main/WAL input only in a fresh private clone, after full WAL structure/salt/checksum/commit validation and independent committed-page projection. The returned clone is verified in DELETE mode without losing WAL-only rows.
3. Migrate only the reviewed session/routine model-provider fields on a separate in-memory clone using the source-pinned schema and raw JSON token migration. Provider migration does not touch the original main/WAL/SHM.
4. Add **three existing targets to the same generic transaction**: migrated main bytes with the **original main hash**, empty WAL replacement with the **original WAL hash**, and empty SHM replacement with the **original SHM hash**. No intermediate checkpoint hash is substituted for the original target CAS condition.
5. Prepare all JSON/preferences and all SQLite triplets together through `prepareStateMigration`. Its complete private originals/backups, staged outputs and durable journal must succeed before this helper returns.

Empty replacements are reviewed state changes, not deletions. Original main/WAL/SHM bytes remain in private backups. The successor must stay stopped while multiple file renames occur; replacing main first while old WAL still exists is a recognized **unsafe intermediate state**, never a reason to open SQLite or launch Aux. Explicit complete/rollback recovery must finish and pass receipt verification first.

## API

```js
const prepared = await prepareAuxDisposableStateHandoff({
  root: reviewedCanonicalDisposableRoot,
  capability: genuineStoppedExclusiveRootCapability,
  transactionId: previouslyRecordedTransactionId,
  paths: { auxHome: 'home', browserUserData: 'browser' },
  jsonSnapshots: [
    { kind: 'provider-json', logicalPath: 'u/1/settings.json', bytes, expectedSha256 },
    { kind: 'profile-preferences', profileDirectory: 'Default', bytes: prefBytes, expectedSha256: prefHash },
  ],
  sqliteSnapshots: [{
    accountId: 1,
    database: { bytes: originalMain, expectedSha256: originalMainHash },
    wal: { bytes: originalWal, expectedSha256: originalWalHash,
      disposition: 'present', replacement: 'empty-reviewed' },
    shm: { bytes: originalShm, expectedSha256: originalShmHash,
      disposition: 'present', replacement: 'empty-reviewed' },
    rollbackJournal: 'absent',
  }],
});
// Same genuine scope remains held; generic APIs do not infer app shutdown.
const receipt = await commitStateMigration({ root, capability, transactionId });
await verifyStateMigration({ root, capability, transactionId,
  expectedReceiptSha256: receipt.receiptSha256 });
```

The capability has the generic tool's exact root, stable scope ID, `disposable:true`, `exclusive:true`, `rollbackJournalAbsent:true` and real `assertStopped` callback. Preparation forwards the complete snapshot hash ledger on scope checks. That ledger documents original lineage; the callback must maintain exclusive stopped ownership through subsequent commit/recovery, while the generic transaction itself checks the appropriate original/prepared hashes as state changes. It must not mistake tool-owned committed replacements for an external writer or merely return a hard-coded success in a real run.

Caller-known transaction ID must be privately recorded before preparation so even interrupted preparation is recoverable. On interruption, use the generic `recoverStateMigration({action:"complete"|"rollback", ...})` explicitly and verify the returned terminal receipt. The durable generic journal contains all original/output hashes and retained originals needed for that recovery; the returned handoff receipt is a lineage/preparation report, **not** a blanket migrated marker or replacement for the terminal journal receipt.

The handoff receipt lists exact target hashes, transformation evidence and remaining gaps without credential values or payload bytes. It always says `prepared-not-committed` and `startupVerified:false`. Copies of input/derived buffers owned by the preparation helper are wiped after the durable journal takes ownership of its private staged artifacts. Caller buffers are not mutated. There are at most128 explicit target files and128MiB combined source snapshot bytes; the generic transaction's separate original/prepared payload limits also apply.

## Focused evidence

`node --test vendor/provided/aux-disposable-state-handoff.test.mjs` passes three actual temporary-filesystem/SQLite fixtures:

- A complete synthetic source snapshot has a row committed only in WAL. Settings/provider credentials/native Preferences/Local State and the SQLite triplet enter one seven-target journal. A simulated crash occurs immediately after new main replaces old main while original WAL/SHM remain. Recovery completes; its exact receipt and all original backups verify **before any final fixture database open**. The row then has Aux provider with the same model/thinking/fastMode; native profile ID, false expansion state, collapsed/hover values and window placement remain. Actual SQLite integrity and subsequent WAL-mode writing work with the reviewed empty sidecars.
- Rollback after the same boundary restores every original main/WAL/SHM and JSON file byte-for-byte. A later fixture-only open reads the original legacy-provider WAL-only row and passes integrity, with private backups still retained.
- Unknown/absent sidecar dispositions, unreviewed reset and lost writer scope refuse without changing any target.

The synthetic fixture exclusively controls its producer and stopped copy; it does **not** simulate or prove a real Aux browser/daemon startup fence. Queued/steering JSON retains an explicit legacy provider in the fixture so that the remaining audit gap cannot be mistaken for complete migration.

## Remaining real integration

Root must implement/verify the real process-owned startup/write fence, bind the exact reviewed disposable scope, acknowledge account-qualified renderer storage, finish queued/transcript/nested provider references, reload consumers and observe the actual app's profile switching/session restore/UI. No launch may occur during a mixed journal state. Cloud reconciliation, native cryptographic authority migration, signing and owner-state access remain outside this preparation. Successful fixture recovery is not a claim that Aux's actual startup is already integrated or production-ready.
