# Preserve the original genuinely optional password source key

Source-only incremental patch after `native-browser-import-blocked-partial` (`be8a0db48`). No Keychain, profile, credentials, OS, browser, native build or shared-source operation was performed. Not compiled/runtime accepted.

Original 4259898..4259918 moves the actual optional key into its worker call and does not turn an absent key into an upfront migration error. Original shared password decoder 425cda0 recognizes empty/non-v10 values before inspecting key presence; only v10 needs the optional's present flag at key+0x10 (425ce00). Missing key therefore rejects actual encrypted rows, while blocked/empty/plaintext rows can proceed. The aggregate all-encrypted-failed condition remains the one pinned in the preceding proposal.

Current `ReadAuthorizedCategory` stops immediately on key lookup failure, preventing even source rows that need no decryption from being read. The patch keeps that real failed lookup as an absent optional, privately passes a nullable `SourceKey*` into the password reader and calls the genuine AES decryptor only when a real key exists. No zero/default key, alternate authority, credential creation, mock success or auth-gate change is added. All-v10 failure still returns failure; partial valid rows follow the source-defined policy. Cookie authorization is unchanged and still stops on missing key.

The public existing `ReadEncryptedCategory(..., const SourceKey&)` API remains intact, forwarding the caller's real key to the same implementation. No new public API, GN dependency or target. Root should compile the existing migrator object after applying the ordered parent patches. L4 discovery hunks are disjoint; root must preserve them while rebasing the reader delta.

`source-evidence.json` pins original full image/raw bounded ranges and exact preceding reader hash. `verify.py` seeds only the explicit preceding reader output and replays the one-file change in a disposable tree. It does not invoke any import or key operation.
