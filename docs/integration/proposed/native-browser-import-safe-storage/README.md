# Supplied importer Safe Storage families and exact selectors

Source-only proposal on the actual v416 importer file; no profile, Keychain, OS permission or credential operation was performed. Not compiled or runtime accepted. Apply after the explicit-dataKinds proposal (the files are disjoint).

The supplied importer 426abd0 supplies both service and account to the real `crypto::apple::KeychainV2::FindGenericPassword` implementation. Its six branches are Arc/Arc Safe Storage, Brave/Brave Safe Storage, Chrome/Chrome Safe Storage, Comet/Comet Safe Storage, Dia/Dia Safe Storage and Helium/Helium Storage Key. The first name is the exact account, not a display-name inference. The literal table and the immediate account-string construction are pinned. Unknown enums return an empty optional; no generic service search fallback is present.

The current independent importer recognizes only Chrome, Brave and Edge, and its query omits the account. This patch reuses Chromium 155's actual KeychainV2 for the six proven original families. Its existing `FindGenericPassword` builds generic-password/service/account/one-match/data+attributes, performs the real Security framework query and returns the password bytes. There is no credential creation, installation-key reuse, fake decryption or alternate importer backend. The historical Edge path remains unchanged because its source mapping is not established by the recovered original helper.

Arc, Comet, Dia and Helium consequently enter the already-existing native encrypted-password/cookie worker path instead of being excluded from discovered categories. Existing installed-application checks, source selection, cancellation, source snapshot handling and destination writes remain unchanged. These facts establish routing, not full importer fidelity: this patch does not complete Firefox encrypted categories, Atlas, Safari/Arc metadata or the original full migrator owner.

Both original password and cookie derivation sites use `saltysalt`, 1003 iterations and 16-byte output. The shared original v10 decryptor strips the three-byte prefix and passes the fixed 16-space IV to its native cipher helper. The current corresponding PBKDF2/v10 implementation is retained. The newly reused password vector is cleansed after derivation and before invalid-length rejection. No errors expose credential bytes.

## Evidence

- `selectors.asm`: 426abd0..426b0e8, exact service/account branches and vtable+0x58 call.
- `key-caller.asm`: 425957c..4259690, original source eligibility/encrypted-database presence conditions before the helper. The bounded 4259690 helper checks Login Data, Login Data For Account, Cookies and Network/Cookies; the full-owner eligibility/copy lifecycle is not claimed ported by this selector slice.
- `query.asm`, `read.asm`: actual original KeychainV2 query and read/result path. Original query constructor is 8918fdc; virtual read is 8919474. Compare pinned current Chromium `crypto/apple/keychain_v2.mm` `MakeGenericPasswordQuery` / `FindGenericPassword`; exact same service/account query shape.
- `password-derivation.asm`, `cookie-derivation.asm`, `v10.asm`: shared derivation/decryption constants and branches; no family-specific replacement format is invented.
- `source-evidence.json`: full original arm64 hash, every bounded raw byte hash, current helper/API and discovery source hashes.

## Integration

One file: `chrome/browser/extensions/api/aux_browser_import/source_crypto_mac.mm`. The existing `:migrator` target already depends on `//crypto`; no new source/GN target is required. Root should focus-compile this existing Objective-C++ object. No owner-data fixtures, live importer runs or Keychain operations are part of this delivery. Runtime validation requires separately authorized disposable source credentials/profile data; current native authentication unavailability is not bypassed.

Run `python3 verify.py --native-root <chromium/src>` for pinned source evidence and a disposable one-file patch replay only.
