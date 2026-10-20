# Original blocked-password and partial-decryption behavior

Incremental source-only proposal after `native-browser-import-password-stores` (`b63f85c0b`). No source profile, credentials, Keychain, browser or OS operations were performed. Not compiled/runtime accepted. Root may rebase disjoint discovery/API hunks before applying these exact reader/destination changes.

Original password reader 425b128 reads `blacklisted_by_user` at SELECT column9. A blocked entry bypasses password decryption, retains its real blocked state and clears username/password in the resulting PasswordForm (425bda8..425bdf0). Current native drops those rows entirely. This patch keeps them, carries a native-only `blocked` row field and sets actual Chromium155 `StoredCredential::blocked_by_user` before the existing real password-store consumer. No new destination backend or success callback is introduced.

The original reader counts nonempty, nonblocked password blobs and successful decryptions across both stores (425b344..425b374). Individual failed decryptions do not abort the whole import; those rows are omitted. Its final condition is `attempts == 0 || successful_decodes != 0` (425b78c..425b79c). This patch preserves that condition, so one damaged encrypted row does not discard other successfully decoded rows, while an all-failed encrypted source still reports failure. Fatal source-snapshot/query errors remain fatal.

Original shared helper 425cda0 explicitly copies non-v10 input unchanged (425ce4c branch) and uses real AES only for v10. The password reader now preserves that source behavior; empty values and blocked values are not counted as encrypted attempts. The actual key-derived v10 path remains unchanged, as does cookie decryption. Existing text/row/size bounds remain enforced; no secret-bearing data is returned to extension RPC.

## Remaining boundaries

This slice retains the existing source-key authorization prerequisite in `ReadAuthorizedCategory`; original full-owner optional-key/no-key behavior is not yet ported. A denied/unavailable source key can therefore still stop before blocked/plaintext-only password rows reach this corrected reader. This proposal does not bypass that real failure or substitute a zero/default key. Other original form metadata, note handling, full snapshot/copy fallback and migration job lifecycle remain separate source work. No claim of complete encrypted migration or runtime authorization is made.

## Pins and integration

- Reader baseline is exact output of b63f85c0b, recorded in `source-evidence.json` and manifest.
- Destination baseline is actual v419 `import_service.cc`; only the one `blocked_by_user` assignment changes.
- `attempt-and-decode.asm`, `aggregate-result.asm`, `blocked-form.asm`, `password-copy-or-decrypt.asm` pin original operands; the earlier two-store proposal pins the SELECT and dedup field identities.
- Actual `StoredCredential` definition is hashed; it owns the real blocked flag.

Existing importer/migrator targets only; no GN change. Root owns focused compilation. `verify.py --native-root <chromium/src>` replays the patch in a temporary tree, seeding the reader from the explicit preceding proposal output, and checks source hashes only.
