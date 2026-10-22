# Private SQLite WAL checkpoint preparation

`vendor/provided/aux-sqlite-wal-copy.mjs` extends the offline provider-migration lane with a private-clone checkpoint step. It accepts bounded, complete caller-supplied database/WAL buffers and exact expected hashes. It never accepts or opens an owner/original database path. It creates only a fresh private `mkdtemp` directory, writes copies there, checkpoints those copies, switches that clone to DELETE mode and returns prepared main-database bytes.

No app, UI, native checkout, owner profile, real credentials, provider service or signing operation was touched. This helper is not integrated into the launcher or shipped product.

## WAL validation before any clone is opened

SQLite can silently ignore corrupt WAL data and return the base database. An ordinary successful open/quick-check therefore does not prove complete recovery. This helper first implements the WAL format/checksum rules from the pinned local SQLite primary source, `third_party/sqlite/src/src/wal.c`; its exact source hash and reviewed regions are recorded in `source-audit.json`. SQLite's source carries its original public-domain dedication; the snapshot inventory remains truthful.

The helper checks:

- SQLite database magic, page-aligned bounded main bytes and supported read/write header versions.
- WAL magic, version3007000, matching power-of-two page size and exact complete frame boundaries.
- Header checksum and **every frame's** salt pair, bounded nonzero page number and rolling checksum. Both little- and big-endian checksum formats are supported as specified by WAL magic; stored checksum words are big-endian.
- Explicit commit markers, bounded resulting database size and a final committed frame. Torn, checksum-invalid, stale-salt or checksum-valid uncommitted tails are refused in full. No valid-prefix trimming or no-WAL retry occurs.

WAL files can legitimately retain stale or uncommitted tails after some crashes/reuse. This conservative revision does not recover those layouts; it preserves/refuses the input and requires a separate reviewed recovery decision. It never labels discarded tail bytes as successfully migrated state.

The full main and WAL inputs are each limited to64MiB, as is the projected/output database. Rollback-journal input is unsupported: `rollbackJournalBytes` must explicitly be `null`, and the live scope capability must attest verified absence. SHM is transient WAL-index data; SQLite reconstructs it only in the new private clone. No original SHM is read, copied, changed or treated as durable authority.

## Independent no-loss check

Before opening SQLite, the helper independently overlays all validated committed WAL page images on the copied main image and truncates to the final commit's page count. This produces a complete expected checkpoint image, including WAL-only committed pages.

On the private clone, SQLite extension loading is disabled and defensive mode/untrusted schema are enabled. A FULL checkpoint must report no busy reader and acknowledge the exact validated frame count. The resulting main file must be **byte-for-byte equal** to the independently projected committed image. A base-database fallback therefore fails even if SQLite itself reports success.

Only after that equality check does the clone switch to `journal_mode=DELETE`. The final file must have DELETE-mode header bytes, unchanged length and identical bytes after the first100-byte SQLite header. Schema validation is then reused from `prepareSqliteProviderIdentity`: exact source-derived fresh1852/v20 target schema/indexes, no unknown target triggers/layout and valid selected model JSON. Its temporary in-memory provider-migrated output is discarded and wiped. The returned checkpoint bytes still contain the original logical provider values; provider migration remains the separate next step.

Private main/WAL files are exclusively created with0600 mode under an owned0700 directory, fsynced, and closed/cleaned before the result returns. Generated temporary-directory identity is checked before cleanup. No arbitrary caller path, directory discovery or broad cleanup is supported. As with the generic tool, hostile same-UID directory substitution is outside the injected exclusive-scope trust model.

## API

```js
const checkpointed = await checkpointPrivateSqliteSnapshot({
  databaseBytes: reviewedMainSnapshot,
  expectedSha256: reviewedMainSha256,
  walBytes: reviewedWalSnapshot, // null only for independently verified absence
  expectedWalSha256: reviewedWalSha256, // null iff WAL was verified absent
  rollbackJournalBytes: null,
  capability: {
    id: reviewedStoppedSnapshotId,
    disposable: true,
    exclusive: true,
    rollbackJournalAbsent: true,
    assertStopped: async ({ databaseSha256, walSha256, phase }) =>
      actualExclusiveSnapshotStillHeld(databaseSha256, walSha256, phase),
  },
});
const migrated = await prepareSqliteProviderIdentity({
  databaseBytes: checkpointed.bytes,
  expectedSha256: checkpointed.receipt.outputSha256,
  walBytes: null,
  capability: reviewedCapabilityForDerivedPrivateSnapshot,
});
```

The original snapshot capability is rechecked at validation, clone creation, checkpoint, schema validation and return. A derived-copy capability must be bound by the integrator to that still-held original scope and the verified derived hash; it is not permission to operate on another database. Caller-owned input buffers are cloned and never mutated. The receipt records source/output hashes, frame/commit/page counts, schema hash and explicit no-provider-change status without row IDs or payloads.

## Journal handoff remains explicit

Do **not** install the new DELETE-mode main file beside an unchanged original nonempty WAL. In the generic multi-file stopped-state transaction, the database target's expected hash is the **original main snapshot hash**, not the intermediate checkpoint hash. Any existing WAL must be handled under the same held scope and pinned original WAL hash; original SHM disposition also needs a separately reviewed exact action. The generic transaction must retain originals and its journal through verified completion and keep the successor stopped during intermediate states.

This module returns only the prepared checkpointed main bytes and lineage receipt. It does not mutate sidecars in a supplied directory, create missing journal targets, authorize deletion of original WAL/SHM, acquire the real startup fence or launch the browser. Root owns that remaining integration and its copied-state acceptance.

## Focused evidence

`node --test vendor/provided/aux-sqlite-wal-copy.test.mjs` passes five actual temporary-SQLite fixtures:

- A committed session and routine exist **only in WAL**, are absent from base main, survive the independent-projection checkpoint, and feed the provider migration. Both source buffers and original synthetic fixture files remain unchanged.
- Damaged header/page size/salt/checksum and torn tail refuse, without a base-only result.
- Missing/mismatched snapshot hashes, rollback journal and lost stopped capability refuse.
- Both checksum byte orders work; a correctly checksummed additional uncommitted frame is refused specifically as an uncommitted tail.
- A valid WAL carrying an unknown committed target trigger still fails the strict schema gate after private checkpointing.

The tests use new synthetic temporary files and fixed fixture IDs, not an actual application profile. Power-loss behavior, real stopped-writer ownership, original sidecar transaction/restart behavior and complete provider reference coverage remain separate acceptance gaps. Queued/steering/transcript and other nested provider references remain explicitly unaudited by this lane.
