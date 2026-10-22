# Captured CSK v2 prepared-byte handoff

This is an external, inactive native migration component. It does not activate Aux, register a runtime method, read Keychain, grant custody, create installation authority, or modify a source row. It complements the unchanged-byte credential-copy implementation; a CSK envelope rewrap is deliberately **not** treated as an opaque unchanged copy.

## Implemented path

`PreparedCapturedCskV2.authenticate` accepts the exact captured old record, the existing JavaScript preparer's exact output bytes, an explicit account/nullable owner, the reviewed historical-Aux selector binding, and a caller-supplied 32-byte root. It independently parses bounded UTF-8 JSON with duplicate-member rejection, validates the source-derived envelope/owner schemas, and opens both envelopes with CryptoKit ChaChaPoly. The old HKDF-SHA256 info and AAD are exactly `aside.dk.csk.v1`; the new info/AAD are exactly `aux.dk.csk.v2`, with empty salt and 32-byte derived keys. It verifies the same 32-byte CSK in a fixed-length comparison and unchanged schemaVersion/accountId/boundUserId/presence/value of syncGeneration. Ownerless original records remain ownerless; they cannot satisfy a supplied owner. It refuses unknown fields/formats, wrong roots/tags/purposes/owners, differing CSKs, unsafe integer accounts and equal source/target hashes.

Those legacy labels exist only in this explicit importer; there is no decrypt-on-failure fallback. The reviewed source pins include the actual JS preparer/runtime and both crypto implementations. Native authentication preserves the exact supplied target bytes; it does not normalize or regenerate a randomized envelope. Metadata values are compared through canonical JSON, while both complete captured byte sequences receive separate SHA-256 and byte-length bindings.

`DurableCapturedCskHandoff.begin` requires captured source bytes and missing exact target, independently authenticates the prepared bytes, then durably publishes a nonsecret draft. `performOneStep` publishes and reads back an intent before the single target Add. The actual returned private-store checkpoint must bind the prepared object's fresh process-local preparation ID, exact selector-binding hash, and different source/target hashes and lengths. The prepared object consumes its locked one shot **before** executor callbacks, reentry or throws. Reconstructing a newly authenticated object does not reproduce the preparation ID and cannot reuse a loaded intent.

The boundary exposes only read-source/read-target/Add-target, with the existing exact reviewed Aux-only physical selectors. No update/delete/fallback/default-group query exists. A source change, target conflict/inaccessibility, explicit duplicate/failure status or unauthenticated readback becomes terminal blocked. A thrown Add retains its durable intent as unresolved. Observed matching target bytes are independently authenticated again before verified is durable. No observation claims which process wrote that row.

## Durable filesystem and restart

The new versioned store uses the exact hash-pinned private-FD prefix from `aux-fresh-installation-journal`, with count-checked class/error/path/UUID-case adaptations. Its CSK-specific schema/tail retain immutable revision files, advisory serialization and expected-head CAS, O_EXCL writes, file/directory fsync and exact head/revision readback. It enforces canonical directories, owned 0700 directories/0600 single-link bounded files with no extended ACL entries, O_NOFOLLOW/O_NONBLOCK/CLOEXEC reads, inode/entry identity and before/after metadata/EOF checks. This lock serializes this journal; it is **not** exclusion of credential/profile writers. Orphan revisions/partial writes are retained and refused rather than adopted to re-arm Add.

`resume` never restores Add capability, even for a draft. It requires fresh explicit source/target captures and a supplied root to authenticate an already present exact target. Missing target remains unresolved; it cannot reconstruct lost randomized prepared ciphertext from a hash-only journal. A restored verified target is reauthenticated; loss or alteration blocks. No automatic regeneration, retry, deletion, cleanup or authority replacement is implemented.

Only format/version, transaction ID, selector-binding digest, source/target SHA-256 and lengths, phase/revision and bounded reason reach this store. Root, CSK, ciphertext, owner identifier and prepared bytes remain out of journal files and receipts. The in-memory caller still owns its captured input lifetime; Swift/Data copy behavior is not claimed to provide guaranteed whole-process erasure. The importer root is a cryptographic input, **not** proof of protected authority, user approval or whole-profile custody. Real exclusive admission, exact source-row ownership/access approval and a reviewed actual Security executor remain missing external prerequisites.

## Focused verification

Run from this separate worktree with the shared compiler lock:

```
python3 scripts/native-build.py sh docs/integration/proposed/aux-csk-prepared-handoff/check.sh
```

The fixture uses the actual existing JavaScript CSK preparer over synthetic keys, pipes its output directly to the separately compiled native program, then exercises real CryptoKit and disposable private filesystem storage. Synthetic roots/CSKs/envelopes are not fixture files. It covers authenticated interoperability, valid-but-different CSK rejection, metadata/root/account/duplicate-JSON rejection, transformed Add/source preservation, reentrancy, private durable readback/CAS, throw-after-success recovery without Add replay, unknown-absent and abandoned-draft refusal, terminal conflicts/duplicates/source drift, fresh-object intent replay refusal, journal material scan and unsafe HEAD mode refusal. It invokes no Security API, original addon, OS action, app/profile, cloud, signing or native checkout build. Historical unchanged-copy 51/16 fixtures/receipts remain unchanged.
