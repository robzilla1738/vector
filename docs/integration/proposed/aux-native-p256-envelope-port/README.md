# Bounded native P256 envelope source port

This is a concrete Swift/CryptoKit port of the recovered **existing-key import, agreement and envelope** boundary. It adds explicit Aux-v2 wrapping and same-root verification without a replacement JS backend or installation authority factory. It is external proposed source, not an activated addon or accepted app. No Keychain, original addon, owner state, signing or Secure Enclave/PQ operation was executed.

## What is implemented

| Source | Behavior |
| --- | --- |
| `EnvelopeRecords.swift` | Bounded duplicate-aware metadata/envelope parsing, exact fields and canonical base64. Metadata scheme and key_storage are separate from envelope version. Missing key_storage selects Secure Enclave, as the original native default does. |
| `RecoveredP256Authority.swift` | Imports an **existing** software P256 rawRepresentation or Secure Enclave P256 dataRepresentation with nil authenticationContext; derives its public KEM and compares it with the caller's expected existing public key. Uses the original P256 agreement + HKDF-SHA256(empty salt, context,32) + ChaChaPoly open sequence. |
| `AuxNativeEnvelopeV2.swift` | Explicit aux.wrap.dk.v2 / p256_v2 reader/writer; the domain is both HKDF sharedInfo and AEAD AAD. Creates only a per-envelope ephemeral agreement key and a nonce, never installation/root/signing keys. |
| `LegacyNativeEnvelopeReader.swift` | **External migration tool only.** Requires a known legacy record and explicit normal/canary channel, authenticates the original wrapping context, rewraps the same32-byte DK to the same existing KEM, verifies the result through that same handle and returns an additive candidate/fingerprint. Performs no persistence. |

The source files expose no Keychain/query, process, filesystem, installation init/reset/delete, signing or provider API. They are internal Swift source components, not a new generic command dispatcher or a claim that the original macOS addon exposes raw ECDH. Root still owns any actual module/ABI integration.

The metadata/record parser rejects duplicate decoded keys (including escaped aliases), unknown fields/formats, incompatible purpose/scheme, malformed/canonical-base64 errors and invalid lengths. It limits records to16KiB/32 nesting levels/1,000 nodes. A malformed or authentication-failing v2 record never retries under a legacy context. Legacy context selection is explicit and cannot be triggered by a v2 authentication failure. These strict guards are new migration/integration defenses, not a claim that every error string/decoder tolerance matches the original implementation.

## Native observations versus reconstruction

[The preceding native boundary audit](../aux-native-crypto-boundary/README.md) pins the original daemon addon SHA-256 `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`, complete key-import/agreement/HKDF/open functions and original JS-to-native routing. This port is reconstructed source; it is **not** recovered original source or decompiler output.

| Exact original evidence | Port consequence |
| --- | --- |
| software private import at0x3c534 uses P256.PrivateKey(rawRepresentation:) | Existing software bytes are imported, not generated or converted into another authority. |
| enclave private import at0x3c7d8 uses SecureEnclave.P256.PrivateKey(dataRepresentation:authenticationContext:) | Existing opaque enclave data is preserved as opaque data; original nil context is retained. The branch compiles but has not executed. |
| agreement at0x3d554/0x3d614 and HKDF at0x3d840/0x3daf4 | Uses original CryptoKit agreement and32-byte SHA256 HKDF with empty salt/context; no software substitute for enclave agreement. |
| native wrapContext initializer and authenticated opens | Uses the same original normal/canary v1 context only in the external reader. New writes use explicit aux.wrap.dk.v2, not a global prefix flip. |
| coding keys / raw-value enums / resolvedKeyStorage | Preserves p256_v1 authority selection and software/secure_enclave metadata semantics independently of new p256_v2 envelope format. Missing storage defaults to enclave. |

The caller must supply an independently authorized, genuine original metadata/key-representation/public-key snapshot. Matching a caller-supplied public key is a useful same-handle consistency check, **not** proof by itself that the caller selected the original installation authority. No signing-key continuity claim is made from a KEM fingerprint alone. Swift Data.resetBytes is best-effort cleanup of owned temporary buffers, not a proof of all compiler/CryptoKit copies being zeroized.

## PQ: explicit refusal, with narrower recovered evidence

`ExistingP256Authority` rejects pq_v1 **before importing any key**. It does not generate a P256 substitute, reinterpret PQ bytes, downgrade storage or claim native PQ support. This refusal is intentional even on a macOS version with the API available.

New static evidence pins:

- native scheme-tag1 runtime availability guard checks macOS26.0 at0x3c368..0x3c374;
- original PQ private import uses SecureEnclave.MLKEM768.PrivateKey(dataRepresentation:authenticationContext:nil) at0x3c3f0;
- `WrappedDkPq` coding keys include **encapsulated_key**, not ephemeral_public_key;
- decapsulate at0x3d000 returns a CryptoKit SymmetricKey; its success branch at0x3d008 reaches0x3d318.

That call/branch evidence does not establish the complete subsequent key/container/AAD flow for a faithful v2 implementation. The P256 HKDF path is therefore **not copied into PQ by inference**. Full PQ continuation, original initialization/encapsulation, serialization, versioned wrapping and same-DK acceptance remain a separate recovery task. The local SDK interface corroborates API availability only; neither SDK declarations nor successful compilation prove the original PQ branch's behavior.

## Focused verification

The proposed source typechecks for `arm64-apple-macos13.0` with the current Apple Swift6.4 toolchain. This checks both P256 import branches syntactically and against local SDK APIs; it does not initialize enclave handles.

```sh
xcrun swiftc -typecheck -target arm64-apple-macos13.0 \
 docs/integration/proposed/aux-native-p256-envelope-port/source/*.swift
node docs/integration/proposed/aux-native-p256-envelope-port/check.mjs
AUX_PINNED_NATIVE_ADDON=/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node \
 node docs/integration/proposed/aux-native-p256-envelope-port/verify-evidence.mjs
```

The software-only harness runs proposed Swift source through the existing Apple interpreter against fixed, explicitly synthetic software authority/root bytes in a fresh private temporary directory. It does not load the original addon or run enclave/PQ import code. Twelve assertions pass: original normal/canary synthetic envelope opens, Node-produced Aux-v2 opens in Swift, verified same-root rewrap, wrong-version/channel/tag refusal, duplicate/unknown-format refusal, wrong-authority refusal, original missing-storage default and explicit PQ-not-recovered refusal. Node also opens the Swift-produced Aux-v2 candidate with the same synthetic authority, establishing bidirectional container/primitives interoperability. It prints only a success summary; temporary synthetic inputs/outputs/cache are removed.

`verify-evidence.mjs` independently checks the complete frozen binary, five newly pinned code ranges, prior boundary manifest, PQ coding-key disassembly and source's absence of state/installation-key factory APIs. [source-evidence.json](source-evidence.json) records the exact pin/SDK/compiler/evidence and separates tested/compiled/unimplemented coverage. These are narrow copied-format checks, not native installation acceptance.

## Remaining integration, without shortcuts

1. Faithfully recover/port actual Keychain item reads/writes, DP/access-group/ACL/error/partial-state behavior and same-authority binding. The code accepts representations; it does not read or migrate them. Importing an existing enclave representation may require authority/interaction and must not be invoked without the separate authorized scope.
2. Recover and implement PQ's full original wrapping/serialization path, preserving its private authority. Keep refusal until that is supported and separately accepted.
3. Add durable **Keychain-aware** additive migration/selection/readback/rollback state machine. The proposed function returns a candidate and never marks an installation migrated. Filesystem receipts do not transact Keychain rows.
4. Integrate all explicit versioned schemas/readers/writers and native caller/receiver/ABI changes. The current copied immutable addon still has its old singleton context, symbols/selectors/group and original module identity; this proposed source does not remove that no-trace gap.
5. Only then seek authorized disposable actual software/enclave/PQ checks and accept a complete successor. Leave owner data and the accepted app/UI intact. Signing, release, cloud generations and real startup acceptance are not performed or proven here.
