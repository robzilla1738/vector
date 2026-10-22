# Existing installation signing authority: source port

The original installation scheme affects signing as well as KEM selection. `p256_v1` signs using P256 ECDSA; `pq_v1` selects Secure Enclave MLDSA65 on macOS 26+, before testing the storage field. Changing the KEM branch while treating every signing key as P256 would lose authority compatibility.

This external source port imports supplied **existing** representations and compares supplied expected public bytes. It has no authority factory, Keychain executor, command dispatcher, installation initialization, or app/UI integration. P256 software was checked using a fixed public synthetic test scalar; both Secure Enclave branches remain compile-only. No original addon or owner state was accessed at runtime.

## Original input and signature semantics

`cmdCdpSign` parses JSON member `challenge` as a string and calls Foundation base64 decoding with options zero (`0x40738..0x407e8`). The resulting `Data` is passed to the per-scheme signing API. The native handler adds no application domain, context, or explicit hash. The pinned JS macOS caller forwards challenge bytes as base64 and decodes JSON member `signature`. The CDP-specific JS caller requires 32 challenge bytes; other shared installation-auth callers can supply other signing-input lengths. The proposed authority method therefore accepts `Data` rather than inventing a universal 32-byte restriction or a new challenge format. Input-JSON/stdin dispatch is not ported here.

| Scheme/storage | Existing private import | Signing call | Output |
| --- | --- | --- | --- |
| P256/software | `rawRepresentation` at `0x40f58` | `signature(for: DataProtocol)` at `0x40fc0` | DER representation `0x41028`, base64 `0x41040` |
| P256/enclave (also missing storage default) | `dataRepresentation`, nil auth context at `0x4133c` | `signature(for: DataProtocol)` at `0x4142c` | DER `0x4163c`, base64 `0x41654` |
| PQ | MLDSA65 `dataRepresentation`, nil auth context at `0x40e9c` | `signature(for: DataProtocol)`, no context parameter at `0x40ec0` | Returned signature `Data` directly base64 at `0x414cc` |

All responses use `{"signature":"<base64>"}`. P256 uses the **DataProtocol** overload, not the Digest overload. The source port preserves that exact API. Software interoperability demonstrates ECDSA/SHA-256 over the supplied challenge: Node verifies the Swift DER signature with `sha256`, rejects an extra hash and SHA-384, and Swift verifies Node's DER/SHA-256 signature. Do not prehash the input, convert DER to P1363, or infer P256 hashing behavior for MLDSA. MLDSA's implementation-internal hashing remains CryptoKit's responsibility; no PQ runtime behavior is claimed.

The original scheme comparison precedes storage comparison (`0x40e08..0x40ef0`). PQ selects the MLDSA path regardless of the optional storage field; this is observed branch ordering, not evidence that PQ/software authority creation is supported. The separate PQ port follows the scheme branch and never downgrades to P256 or creates a software PQ key.

## Public serialization and existing storage

`get-public-keys` requires metadata (`0x418f4`), reads the original signing row (`0x41b20`) and KEM row (`0x41d7c`), then imports the representations using the same scheme/storage split. For P256, software and enclave signing public keys serialize `x963Representation` (`0x429ac` / `0x42cd8`); PQ serializes MLDSA65 `rawRepresentation` (`0x42698`). KEM public keys similarly use P256 X9.63 or MLKEM raw bytes. Each is base64-encoded with options zero.

The public command response uses `scheme`, `sig`, and `kem`; the internal `publicKeysResponse` used by initialization uses `scheme`, `sig_pub`, and `kem_pub`. These differing keys are existing contracts, not interchangeable responses. This slice exposes only the signing public bytes/base64 and signature reply; it does not fabricate a KEM field or full public-command response from an unchecked caller value.

Signing representations remain generic-password payloads from the recovered installation signing account: raw P256 software bytes, or opaque enclave data representations. Their actual selection, entitlement/ACL binding and retained identity must be established by the future coordinator. Expected-public equality here checks consistency, not provenance or authorization.

## Durable evidence and focused checks

Frozen daemon addon SHA-256: `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`. Frozen JS: `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. `signing-evidence.json` pins three complete Apple LLVM function disassemblies, instruction ranges, import/branch/register/encoding anchors, decoded BL targets, JS contract counts and new port source hashes. This is disassembly evidence, not original Swift or decompiler output.

```sh
python3 docs/integration/proposed/aux-native-signing-port/verify-signing.py --addon /explicit/frozen/daemon/aside-native.node --daemon-js /explicit/frozen/daemon-original.mjs
xcrun swiftc -typecheck -target arm64-apple-macos13.0 docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift docs/integration/proposed/aux-native-signing-port/source/*.swift
node docs/integration/proposed/aux-native-signing-port/check.mjs
```

All passed: eight software assertions plus bidirectional Node/Swift interoperability and wrong-hash rejection. Runtime harness deliberately excludes the PQ source. No Keychain, enclave, PQ, original addon, hosted request, or real installation challenge ran. Nothing activates these files in the delivered app.

Remaining: source-backed coordinator/import selection under reviewed Aux-only selectors, entitlement/authority binding, whole command/public response integration with recovered KEM authority, separately authorized native signature acceptance and restart/rollback, and rebuilding all original-identity native artifacts. This slice does not claim the app is ready or a signing-identity migration has occurred.
