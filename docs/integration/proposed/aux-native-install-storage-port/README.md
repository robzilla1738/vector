# Installation storage: recovered selectors and failure boundary

The supplied implementation calls this writer **`installSave`**, not `installWrite`. It is a delete-then-add replacement helper, not an additive or transactional migration primitive. Its reader collapses missing, inaccessible, and malformed-result cases to optional `nil`. A faithful Aux migration must retain the actual authority and distinguish these outcomes before deciding what to do; the old helpers cannot establish an empty installation safely.

This proposal contains static evidence and a compile-only, pure Swift port of query descriptions and captured-result classification. It has no Keychain executor, installation generator, deletion/reset operation, authority adapter, dispatcher, or UI/build integration. No Security, Secure Enclave, PQ, or addon operation ran.

## Exact selectors and attributes

The complete initializer artifacts show normal-channel prefix `aside.` and canary prefix `aside-canary.`. They append these suffixes:

| Purpose | Suffix | Normal logical value |
| --- | --- | --- |
| Service for all four generic-password items | `install` | `aside.install` |
| Metadata account | `install.meta` | `aside.install.meta` |
| Signing representation account | `install.sig` | `aside.install.sig` |
| KEM representation account | `install.kem` | `aside.install.kem` |
| Wrapped-root account | `dk` | `aside.dk` |

`installBaseQuery` at `0x32b98` constructs exactly five attributes: generic-password class, the service global, the supplied account, fixed access group `8CPD4K4TBB.at.studio.AsideBrowser.cryptography`, and `kSecUseDataProtectionKeychain=true`. It supplies no synchronization, authentication context, authentication-UI policy, explicit Keychain handle, accessibility, or item ACL attribute. Original logical names, selector isolation, access-group entitlement, and cryptographic domain are distinct boundaries.

The port accepts service/account/group explicitly and invents no replacement selector or default-group fallback. Original names are retained here only as truthful external recovery evidence. Choosing Aux-only successors and proving they select the same authority is still an integration decision; concatenating an Aux prefix cannot prove it.

## Original read and error semantics

`installRead` (`0x331cc..0x33614`) adds `kSecReturnData=true` and `kSecMatchLimitOne`, then calls `SecItemCopyMatching` at `0x333c0`.

| Result | Original behavior |
| --- | --- |
| Success plus result bridgeable to `Data` | Return the data; zero-length data is not treated as absence. |
| `errSecItemNotFound` (`-25300`, compare at `0x333d4`) | Return nil without the failure log. |
| Any other OSStatus | Obtain Security error text, log status/message to stderr, return nil. |
| Success but missing/unbridgeable result | Enter the same failure-log path (including status zero), return nil. |

No failure throws from this helper. `CapturedInstallRead.classify` preserves these distinctions without reading anything; `originalOptionalProjection` documents the lossy original behavior. That projection is unsuitable as authorization to initialize or replace an authority.

`requireInstallMeta` at `0x33a18` reads the metadata account through this lossy helper. Nil becomes an NSError with code `-1` and description `not installed`; present bytes go through `JSONDecoder`, with decode errors propagated. Metadata contains typed scheme `p256_v1` / `pq_v1` and optional `key_storage`; the original missing-storage default is Secure Enclave. The earlier external envelope preparer deliberately accepts a narrower metadata JSON shape; it is not claimed a byte-for-byte replacement for every Codable variant.

## Original writer, ACL and partial state

`installSave` (`0x32dc4..0x331cc`) performs:

1. Build the original base query and call `SecItemDelete` at `0x32e6c`.
2. Discard the deletion status, rebuild the base query, and add `kSecValueData` plus `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`.
3. Call `SecItemAdd` at `0x32ff8`; log on failure and return **only** whether the add status is zero (`0x331a0..0x331a4`).

It does not use update, compare-and-swap, readback, backup, rollback, or cross-row transaction. A failed add after successful delete can remove a previous row. The original initialization writer saves signing and KEM representations separately (for example software calls `0x356b0` / `0x35704`, SE P256 calls `0x3688c` / `0x368f4`, PQ calls `0x36b50` / `0x36bb4`) and branches on failures. These are separate writes, not proof of an all-or-nothing installation.

`createInstallAccessControl` is separate: `0x3364c` loads **AfterFirstUnlockThisDeviceOnly**, `0x3365c` sets flags **`0x40000000`**, and `0x33660` calls `SecAccessControlCreateWithFlags` with nil allocator. The pinned local Security SDK identifies that bit as `.privateKeyUsage`, without user-presence/biometry bits. Failure throws code `-1` using the underlying CFError's localized description or `failed to create access control`. The original helper's error-domain name does not establish a biometric requirement. This ACL is passed into original CryptoKit authority creation; it is **not** placed on the generic-password add payload. Authority creation remains unported and unexecuted here.

The pure Swift file exposes only the add dictionary, explicitly **not** a replacement implementation of `installSave`. It never executes deletion or creation and should not be wired to an ad hoc write caller.

## Existing-state checks do not prove authority acceptance

- `existingInstallationInitResponse` (`0x34840`) reads metadata; nil returns no existing response. Present metadata is decoded, then wrapped DK (`0x34934`), signing representation (`0x349ec`), and KEM representation (`0x34b54`) must be present, followed by `publicKeysResponse` (`0x34cbc`). A malformed metadata record or missing row is an error, not a recovered installation.
- `hasAnyInstallArtifacts` (`0x33904`) short-circuits across signing, KEM, and wrapped-DK reads; it does not include metadata. Because reads are lossy, false does not prove absent rows or absence of an inaccessible authority.
- `cmdInstallInit` first asks for the existing response (`0x34e28`). When no response is found it uses `hasAnyInstallArtifacts` (`0x351b4`) and refuses metadata-missing/artifacts-present state. These guards still cannot distinguish an all-inaccessible installation from an empty one.
- `cmdInstallStatus` reads metadata (`0x3aa14`), refuses metadata-missing/artifacts-present state (`0x3aa24`), rejects invalid metadata, and checks required representation/root rows. Its installed status is not an authenticated DK unwrap, signing test, or migration/readback receipt.

The inspected worktree baseline mapper (`vendor/provided/native/keychain-query-map.mm`) prefixes known selectors with `aux.<scope>.`, **retains the entire old logical suffix**, and removes only the exact original group. Its paired interposer forces authentication UI failure. Those are deliberate adaptations, not equivalent original query bytes. A new direct port retaining the original group would select a different entitlement boundary from that mapped scope; removing a group does not prove the default/shared group is correct. This audit makes no assertion about the root integrator's newer mapper or current runtime binding.

## Focused verification

`storage-evidence.json` pins complete original function artifacts, original Mach-O instruction ranges, exact call/status/register anchors, source hashes and the installed SDK header. `verify-storage.py` checks every retained instruction against the frozen binary through its actual `__TEXT` mapping and verifies branch targets. Evidence is Apple LLVM disassembly, not original Swift or REA decompiler output.

```sh
python3 docs/integration/proposed/aux-native-install-storage-port/verify-storage.py --addon /explicit/frozen/daemon/aside-native.node --sdk-header /explicit/SDK/Security.framework/Headers/SecAccessControl.h
xcrun swiftc -typecheck -target arm64-apple-macos13.0 docs/integration/proposed/aux-native-install-storage-port/source/RecoveredInstallStorageQueries.swift
```

Both passed. No runtime fixture was substituted for native Keychain acceptance.

Remaining: reviewed Aux-only selector/version mapping, explicit entitlement and signing-group binding, retained full OSStatus outcomes, coherent additive four-row migration with authenticated same-authority/root readback, interruption/restart/rollback acceptance, and a real coordinator that never interprets inaccessible/partial state as fresh. The filesystem journal cannot transact Keychain rows. Original items and accepted app remain untouched.
