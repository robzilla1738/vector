# Supplied native binding boundary — staged, not enabled

This boundary preserves the supplied `.node` implementation rather than replacing its KEM, wrapped data key, biometric storage or PDF implementation. No original native command has been executed. The interceptor is compiled but has not been injected into a daemon or CLI. It must not be injected into Chromium or another owner process.

## Exact static input

`AsideDaemon/mac-arm64/1.26.1016.1852/Aside Daemon.app/Contents/Resources/native/aside-native.node`, SHA256 `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`.

Observed static bytes:

| Value | Bytes | File offset |
| --- | ---: | --- |
| `8CPD4K4TBB.at.studio.AsideBrowser.cryptography` | 46 | `0x519630` |
| `ASIDE_PRODUCT_VARIANT` | 21 | `0x51a3e0` |
| `Aside_Password_Manager_biometric` prefix | 32 | `0x519660`, `0x519710` |
| `aside_password_manager_master_key` prefix | 33 | `0x519690`, `0x519740` |
| `Aside_Password_Manager_session` prefix | 30 | `0x5196c0`, `0x519a60` |
| `aside_password_manager_session_key` prefix | 34 | `0x5196e0`, `0x519a80` |

`asideKeychainId` at `0x24010` embeds `aside.` and `aside-canary.` as ARM64 small-string immediates. `ASIDE_PRODUCT_VARIANT` selects only the `canary` variant; it is not an arbitrary namespace argument. `installService` is `aside.install`; installation accounts initialize as `aside.install.meta`, `aside.install.sig`, `aside.install.kem` and `aside.dk`. Some legacy labels have suffixes. This is a bounded static observation, not proof of every path.

`installBaseQuery` (`0x32b98`) and `secureStorageBaseQuery` (`0x2ec84`) embed the original access group as Swift large-string data with length 46. Shortening ASCII without updating its Swift representation is unsafe. Rewriting just the apparent ASCII group or changing app plist does not isolate the embedded prefix immediates, legacy labels or team entitlement.

## Actual crypto and imports

The original binding directly imports `SecItemAdd`, `SecItemCopyMatching`, `SecItemDelete`, `SecAccessControlCreateWithFlags`, Keychain interaction getters/setters and `LAContext`. It does not directly import `SecItemUpdate` or `SecKeyCreateRandomKey`; the interceptor covers those as well because framework-internal use is a separate boundary.

Original `cmdInstallInit`/`cmdDkUnwrap` call CryptoKit P256/PQ KEM, HKDF-SHA256 and ChaChaPoly. Its types include WrappedDkP256 and WrappedDkPq. `freshInstallationPlan` tests SecureEnclave availability and macOS 26; it has software P256, enclave P256 and PQ paths. These are static observations/inferences from the branches and symbols. They do not prove this host's selected scheme or that unsigned execution succeeds. The current independent native P256-only verifier must not be assumed to accept an original PQ installation.

REA/Ghidra evidence:

- Original group string: `ev_657123794d40c14e556d8a900c69ac303d2f207a2d8e06f7040d2e2c17fa5460`.
- installBaseQuery: `ev_9201c03285e1eb9bfe2246fc246a4cbf02805aced6a7c07f5ac89fb1332e6a1b`.
- secureStorageBaseQuery: `ev_03560e1d21a4b8e497578968c6de1cfc3aafed9238119f1aadf4c5cd1309919c`.
- Canary selector: `ev_083b94f7c58bee47f428bb7882415a2128e7b2c299fdb1051900e49a96c28161`.
- Fresh installation plan: `ev_07af752cbd0c5df43a88f1068eef8e29c7f94410ef47f55fedb9646b4fbf0833`.
- Install/unwrap composed analyses: `ev_af91295b5e3a4c1ec525eef56e09b2810c1ecc156d2b6ce6457248929630b131`, `ev_6e212dad3daa0143d44a83ce37af33e2353ce1049fc44250747f929c8b0bd252`.

Ghidra pseudocode is derived, not source. Large function high-pcode is truncated and computed callees remain unknown; selected complete call inventories and static imports are not whole-runtime coverage. No Keychain calls were observed because none were executed.

## Mapper contract

`AuxMapKeychainQuery` and `AuxMapKeychainUpdate` are pure dictionary transforms. Scope is exactly SHA256(canonical absolute AUX_HOME), 64 lower-case hexadecimal digits. The loader must compute/validate it from the actual isolated home rather than accept arbitrary untrusted UI input.

- Map service/account/application tag/label into `aux.<scope>.<original logical name>`; preserve distinct current/legacy suffixes.
- Remove only the exact original supplied access group; any other group is refused.
- Refuse queries lacking a classified selector; refuse opaque item refs/persistent refs/search-list/explicit keychain handles that could bypass mapped identity.
- Recurse bounded nested public/private key attributes. Preserve ciphertext/key data, accessibility, access-control and UI flags unchanged.
- Already mapped current-scope selectors remain unchanged, so framework re-entry does not double-map.

`keychain-interpose.mm` supplies actual DYLD interpose entries for the complete SecItem add/copy/delete/update family and SecKeyCreateRandomKey. Unknown queries and unscoped key creation fail closed. There is no permissive fallback to owner queries.

## Checks performed

Compile the pure mapper and fixture executable with `xcrun clang++ -std=c++20 -fobjc-arc -framework Foundation -framework Security keychain-query-map.mm keychain-query-map-test.mm`. Run only that executable. It tests original/legacy selector isolation, account distinction, owner/unknown/opaque refusal, scope separation, idempotence and byte/flag preservation. It contains zero SecItem or Secure Enclave invocations. The actual interposer separately compiles as `-dynamiclib` with the same frameworks. Compilation does not load it into the supplied process.

## Remaining integration and acceptance

1. Review complete CryptoKit/Secure Enclave query coverage. Unclassified framework queries currently fail; do not loosen them based on convenience. A declared fresh key creation path may require special treatment after its actual selector/permanence semantics are known.
2. Pin the original binding and load it only through a self-contained, daemon/CLI-only native carrier that guarantees the interceptor is active. Packaging an env variable alone is not proof that DYLD interposition occurred. Preserve original PDF entrypoints.
3. Make browser authentication call the same actual native install/public/sign authority and scheme. Do not override only the signature key while retaining another original KEM authority. The test PEM bridge remains test-only.
4. Use a freshly created disposable Keychain for any later authorized runtime exercise. Do not use the owner's login Keychain or grant OS permissions. Preserve truthful failures for unsupported enclave/biometric/accessibility behavior; mock Chromium Keychain is not evidence of custom helper isolation.
5. Prove actual interposition and untouched owner state before enabling product use. No production-ready claim is made by these compile/fixture checks.
