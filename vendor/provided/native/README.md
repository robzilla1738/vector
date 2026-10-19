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

## Minimal self-contained native carrier

`native-carrier.mm` uses the original globally exported C functions `AsideNativeRun` (`0x49af8`) and `AsideNativeFree` (`0x49bd4`). It contains no replacement signing/installation crypto and requires no external Node. The runtime module load remains gated by `AUX_ENABLE_PROVIDED_NATIVE_CARRIER=1`, exact original binding SHA256, safe regular-file mode, bounded validated JSON stdin and the four allowed browser-authority commands: install-status, install-init, get-public-keys and cdp-sign. It preserves the original JSON, scheme, public-key and signature formats.

Before any original module is loaded, the carrier requires `AuxNativeBoundaryValidate` and compares its actual imported pointers for all five Security functions against the interceptor replacements. An environment variable alone is insufficient. It then derives scope from `realpath(AUX_HOME)` itself. `--verify-boundary` returns `{boundaryActive:true,originalBindingLoaded:false}` and stops without loading the supplied binding or invoking Keychain/Secure Enclave.

Observed boundary-only probe passed with `DYLD_INSERT_LIBRARIES=<absolute libaux-native-boundary.dylib>` and an isolated existing AUX_HOME. The negative no-interposer probe refused. Runtime invocation without acceptance switch refused before dlopen. No original module was loaded. Actual `.node` dynamic loading may still encounter unresolved NAPI imports; that is untested and is not hidden by a substitute implementation.

Root staging can import `buildProvidedNativeBoundary(outputDirectory)` from `vendor/provided/build-native-boundary.mjs`; every compilation in that reusable build path goes through `scripts/native-build.py`. It returns `{carrier,boundary,fixture}`. Packaging/signing and daemon/CLI/native-browser caller wiring remain integrator-owned. Production-ready remains false until reviewed isolated module/crypto execution succeeds.

### Deny-all load-only verification (pending serialized compile)

The next carrier mode is `--verify-load <pinned provided-native.node>`. It verifies actual interposition first, invokes a one-way exported deny-all latch and checks the latched state before dlopen. All four SecItem replacements and key creation return before mapping or OS forwarding while latched. The probe only resolves original `AsideNativeRun`/`AsideNativeFree`, closes the module and reports bounded booleans plus a refused-call count. It never invokes either original native command function. No environment change can disable the latch once set.

Original module initialization was additionally inspected statically: the sole `__init_offsets` entry at `0x517900` points to `__GLOBAL__sub_I_pdfium_bridge.cc` at `0x23e74`. It calls `0x23e48`, which only registers std::mutex destruction with `__cxa_atexit` (stub `0x515220`, mutex destructor pointer `0x724118`). There are no nonlazy Objective-C class/category load-list sections in this pinned image. System dependency constructors remain a separate coverage caveat. This inspection does not execute the module.

The deny-all revision is queued through the native build lock; it has **not** yet compiled or run. Prior boundary-only evidence applies to the earlier carrier revision. Production crypto/Keychain invocation is still prohibited until isolated behavior and full coverage are reviewed.

## Direct CLI launch and build receipt

The proposed cli-launcher.mm must be compiled as aux-cli-launcher and installed as Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli. Rename the adapted original SEA host to its fixed sibling aux-cli-sea. Keep its existing Resources/native/aux-native.cjs, aux-native-guard.node and immutable provided-native.node layout. The launcher locates the fixed canonical bundle root from its own executable; it accepts no executable/library path override and invokes no shell or Node substitute. It exclusively creates a missing AUX_HOME (default HOME/.aux) as0700, requires owned0700 existing homes, rejects original .aside scopes, computes the canonical SHA256 scope, clears inherited DYLD_* and sets only the bundle's native/libaux-native-boundary.dylib insertion. The external runtime-acceptance flag is passed through unchanged; never manufactured. It then execs the original SEA, retaining arguments and inherited streams/working directory. The original CJS guard still independently verifies actual Security function-pointer interposition before loading the pinned binding.

Root packaging must individually ad hoc sign the new launcher, boundary dylib, guard and carrier. The adapted SEA host must retain hardened runtime and its existing entitlements with the explicitly reviewed allow-dyld-environment-variables local delta; otherwise dyld may ignore the insertion and the guard must refuse. Do not deep re-sign the immutable original provided-native.node or runtime/memory payloads. Receipts describe pre-sign build bytes; packaging must verify them before signing, then separately record final signed hashes. Signing does not grant DP shared authority or runtime acceptance.

buildProvidedNativeBoundary now emits native-build-receipt.json only after all five outputs compile successfully through the shared wrapper, source/header hashes still match, and the pure mapping fixture succeeds through that wrapper. Receipt version1 implementation supplied-boundary contains repository-relative source hashes, absolute header pins, exact compiler argument arrays, absolute output paths/hashes, buildExitCode0 and mapFixturePassed true. Fixed artifact basenames are aux-native-carrier, libaux-native-boundary.dylib, aux-native-guard.node, aux-cli-launcher and the nonshipping keychain-query-map-test. Inventory-only manifests remain distinct. Current queued older calls have no receipt code loaded; do not infer current-source provenance or issue a retrospective receipt merely because an output appears. Fresh compilation/receipt generation remains pending behind the full Chromium lock. No new compile was queued for this slice.
