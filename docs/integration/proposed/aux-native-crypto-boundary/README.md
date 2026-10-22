# Native installation crypto: precise integration boundary

The next step is a faithful native authority port with explicit versioned envelope/context selection. Changing JavaScript domains, routing macOS through the generic helper, renaming Keychain queries, or shipping the original addon behind an Aux wrapper cannot complete this boundary. This source-only slice does not load the addon, invoke any native command, touch Keychain/owner state, sign, change native/GN/staging files or change the accepted app/UI.

## Pinned inputs and method

- Original supplied daemon addon SHA-256 `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`, ARM64 Mach-O, frozen1852 source snapshot.
- Extracted daemon JS SHA-256 `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`.
- [static-artifacts.json](static-artifacts.json) pins12 complete per-symbol Apple LLVM disassemblies, their text hashes and actual file-backed code ranges,13 decoded ARM64 BL targets and9 counted JS contract anchors. Disassembly is ordinary Xcode tool evidence, **not** original source or REA pseudocode. Range mapping is checked against the original Mach-O __TEXT segment rather than assuming all virtual addresses are file offsets.
- REA `open_binary` confirmed the original binary identity. Its native decompiler was unavailable: installed Ghidra12.2/JDK21 do not match the wrapper's supported12.1/JDK25 combination; Hopper/IDA/Kuna were unavailable/unconfigured. [The filtered actual session result](rea-session.json) records that limitation. No install, upgrade, system-tool change, large analysis or target execution was attempted. The REA target was closed. Existing source inventory/deep recovery limits remain in [the earlier addon review](../native-addon-identity-recovery/README.md).

`aux-native-crypto-boundary-audit.mjs` is a static-only buffer inspector, not a migration/helper shim. It authenticates both complete inputs, every pinned function/code-range hash, JS anchor count and direct branch target. The focused source test passed with no skip, and rejects altered source bytes/call targets:

```sh
AUX_PINNED_DAEMON_SOURCE=/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs \
AUX_PINNED_NATIVE_ADDON=/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node \
 node --test vendor/provided/aux-native-crypto-boundary-audit.test.mjs
```

## New concrete routing finding

The actual JS routes `unwrapDk()` on macOS to `runMacInstallHelper("dk-unwrap").dk`. That calls the loaded NAPI binding's `run(command,input)` JSON interface. The generic `unwrapDkP256()` path instead calls `ecdh-secret` and performs HKDF/open in JS; macOS does **not** select it.

The retained complete native command-dispatch function at0x48eb4 compares commands and calls parameterless Swift handlers. Its installation branches are:

| Names compared by the native dispatcher | Native handler call | Consequence |
| --- | --- | --- |
| install-init / init-keys |0x4956c → cmdInstallInit0x34df4 | These are aliases to the macOS installation command, not separate generic-key APIs. |
| install-status / keys-status |0x495f0 → cmdInstallStatus0x3a990 | Both return the macOS status contract. |
| install-meta-read |0x4963c → cmdInstallMetaRead0x3b660 | Reads native metadata; it is not a versioned migration operation. |
| dk-unwrap |0x4967c → cmdDkUnwrap0x3bc94 | No caller-provided envelope/domain/version reaches the parameterless handler. |
| cdp-sign |0x496c0 → cmdCdpSign0x40160 | Existing signing authority; not an agreement primitive. |
| get-public-keys / public-keys |0x49744 → cmdGetPublicKeys0x418bc | Public authority only. |
| install-destroy / destroy-keys |0x497c4 → cmdInstallDestroy0x43110 | Destructive command, not a migration fallback. |

The retained full comparison/call sequence contains no raw-ECDH or versioned-envelope command. This is a bounded dispatch analysis, not a claim about every hypothetical hidden capability in all builds. Therefore the existing JS v2 helper's injected `deriveInstallationSharedSecret` callback has **no established matching command in this macOS addon**.

Simply forcing the generic JS path is additionally incompatible: generic keys-status reads `.keysInstalled`, but macOS status uses `.installed`; generic init-keys expects `.sig`/`.kem`, but the actual macOS init wrapper reads `.sig_pub`/`.kem_pub`. Native aliases do not reconcile those response schemas. Do not use install-init/init-keys or installation destruction to make v2 callbacks appear available.

## Exact native recovery boundaries

| Boundary | Entry / observation |
| --- | --- |
| Fixed wrapping context | `wrapContext` initializer0x30a60 synthesizes normal/canary prefixes and appends wrap.dk.v1; it stores Foundation Data at0x744e88. The full normal string is assembled by instructions, not a contiguous replaceable ASCII blob. |
| Current selectors/authority group | installBaseQuery0x32b98 loads service global, supplied account, original group literal at0x519630 (`8CPD4K4TBB.at.studio.AsideBrowser.cryptography`), and Data Protection=true. |
| Metadata decode/default | parseInstallMeta0x33830 invokes JSONDecoder; requireInstallMeta0x33a18 is the required read boundary. `InstallMeta` coding keys are scheme and **key_storage**. |
| Actual scheme values | enum raw-value function0x3105c emits p256_v1 (tag0) / pq_v1 (tag1). These select actual different private-authority branches, not just display labels. |
| Actual storage values/default | enum raw-value function0x312dc emits secure_enclave (tag0) / software (tag1). `resolvedKeyStorage`0x31a50 selects tag0 when optional storage is absent (tag2). Missing key_storage therefore means **secure_enclave**, not software. |
| Wrapped P256 fields | coding-key function0x31c3c emits scheme/purpose/ephemeral_public_key/nonce/ciphertext. Existing native envelope has no Aux-v2 format marker. |
| Root unwrap | cmdDkUnwrap0x3bc94 contains the actual scheme/storage decode, private-key import, shared-secret/KEM, authenticated open and error paths. |
| Software P256 agreement |0x3d554 → CryptoKit P256 private sharedSecret stub0x5143e0. |
| Enclave P256 agreement |0x3d614 → SecureEnclave P256 sharedSecret stub0x514260. |
| Enclave PQ | MLKEM768 private key import0x3c3f0 and decapsulation0x3d000 →0x514344. This does not establish a supported JS p256_v2 migration for PQ. |
| P256 derivation | HKDF-SHA256 calls0x3d840/0x3daf4 →0x514218 load sharedInfo from the wrapping-context global, output length32. |
| Cipher authentication | ChaChaPoly opens0x3f32c/0x3f69c/0x3fb00 →0x5141ac pass the same native wrapping-context Data as authentication input. |

These are observations from symbol names, instruction operands and imported API call sites, with the metadata-default and exact string values decoded from the complete small functions. No branch was observed executing. The PQ branch's complete v2 wrapping policy is still unrecovered; do not infer its derivation from the P256 HKDF path or downgrade it to software P256.

## Three independent transitions

1. **Query isolation/identity:** the current reviewed boundary maps logical items into the isolated Aux scope while retaining original logical names and current authority. That does not change any HKDF info, AEAD AAD or ciphertext format. An Aux-only selector migration must preserve existing items, access control, access group/entitlements and enclave/PQ data-representation semantics; it cannot treat inaccessible/partial state as a fresh installation.
2. **Cryptographic format:** new local blobs use an explicit aux.dk.v2 schema/domain; installation envelopes need explicit aux.wrap.dk.v2 selection and native per-scheme readers/writers. The existing native singleton context remains v1. Changing its prefix globally before authenticated old-read/new-write would make old ciphertext unreadable. Adding a JS format field that the current schema strips does not implement this transition.
3. **Delivered addon identity:** even a correct ciphertext migration would not remove original Swift module descriptors/mangled symbols, C exports, install name, group/selectors and native constants from the shipped original addon. [The prior addon identity review](../native-addon-identity-recovery/README.md) pins those separate targets. An Aux-named carrier around unchanged original addon bytes is not no-trace completion.

## Next necessary source port; no invented bridge

Recover/port the exact native installation read/write and per-scheme authority path around requireInstallMeta/installRead, storage-specific key imports, cmdDkUnwrap and cmdInstallInit wrapping serialization. Preserve the existing signing/KEM private authority and root. The narrow **required extension** is native context/envelope version selection at those recovered boundaries, rather than a new generic crypto backend or a raw-secret bridge assumed to exist.

The original v1 reader must remain available only in the external authorized migration tool. Native new writes/selectors use explicit Aux-v2 records; migration prepares an additive wrapper of the **same** DK under the **same** existing public/private KEM authority, verifies it, and journals before selecting it. A record version must select its context explicitly; a process-global v1/v2 string flip cannot support interrupted migration. P256 software, P256 Secure Enclave, PQ and metadata default/ACL/error behavior must be covered individually. Keep original items until durable new-record readback and rollback acceptance. A real Keychain transaction/state machine, entitlement review and authorized disposable native checks remain required; the filesystem journal does not magically transact Keychain rows.

No source-faithful buildable authority bridge is claimed here: the original native source/recovery is still incomplete, raw ECDH is not established in the Mac dispatcher, and generic synthetic JS crypto fixtures do not establish private-authority compatibility. This evidence narrows the next work to the exact installation module and rules out an incorrect generic-helper shortcut. Existing Aux-v2 pure hooks remain useful format fixtures, not a solved authority migration.

All evidence in this directory is external review material with truthful original identifiers. No provider, signing, Keychain, owner-state or runtime approval is implied.
