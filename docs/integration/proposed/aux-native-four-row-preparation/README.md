# External four-row existing-installation preparation

This boundary connects the recovered storage result types, metadata parser, signing authorities, KEM authorities and versioned envelope preparers. It accepts **four explicitly captured in-memory results**; it does not discover profiles, read Keychain, select a query group, initialize an installation or write any row.

`source/CapturedInstallation.swift` is external migration-tool source, not a delivered runtime dependency. Its legacy readers remain external. Existing source ports and their pinned evidence are unchanged.

## Inspection and failure behavior

Call `inspectCapturedInstallation` with metadata, signing representation, KEM representation and wrapped-root results using `CapturedInstallRead`. Do not convert a failed OSStatus to nil first.

| Result | Meaning |
| --- | --- |
| `allAbsent` | All four captures explicitly report item-not-found. This is an observation, never authority to initialize. |
| `blocked` | At least one captured Security failure. The exact role and OSStatus remain available; blocked takes precedence over other incomplete/invalid observations. |
| `invalid` | An invalid success result, empty/oversized row, or complete cohort with unsupported/invalid metadata or envelope/version. |
| `partial` | Some explicitly missing rows, with no captured access failure or invalid result/row size. No repair/replacement is attempted. Metadata/envelope parsing waits for a complete cohort. |
| `complete` | Four bounded nonempty payloads, supported authority metadata and matching **legacy-v1** envelope kind. This is not proof of authority provenance or cryptographic acceptance. |

Rows are limited to 16 KiB each. The complete snapshot can be constructed only by inspection. Already-v2, unknown, duplicate-member or scheme-mismatched envelopes refuse rather than being reinterpreted. The reused metadata parser is intentionally narrower than arbitrary original Codable input; unsupported variants are invalid, not resettable. PQ/software is not a supported preparation lane.

## Explicit preparation lanes

`prepareSoftwareP256Installation` accepts only explicit P256/software metadata. `prepareEnclaveP256Installation` is a separate, **unexecuted** hardware lane. `preparePqInstallation` is a separate macOS-26+ **unexecuted** enclave/PQ lane. Changing metadata cannot cause the tested software entry point to enter a hardware path. These source functions contain hardware import/sign/agreement operations but have no caller or dispatcher here; compiling them is not authorization to call them on real representations.

Each lane requires an explicit normal/canary legacy channel, both expected public keys, and nonempty bounded verification-challenge bytes. It:

1. Imports the supplied existing signing and KEM representations, checking each against its supplied expected public bytes. There is no installation-private-key factory, fallback, replacement or generic secret callback.
2. Signs and locally verifies the caller's continuity challenge with that existing signing authority, preserving recovered per-scheme signature formats.
3. Authenticates the legacy wrapped root using the explicit channel, prepares an additive `aux.wrap.dk.v2` envelope under the same KEM authority, reopens it and compares the root before producing a candidate.
4. Returns the original metadata, signing and KEM payloads **byte-for-byte**, the new wrapper, hashes of all four original payloads, both public keys and continuity booleans. The plaintext root is never exposed in the result; the reused rewrap functions clear their owned temporary root buffers as before. Swift/Foundation does not provide a blanket guarantee of zeroing all runtime copies.

Authority metadata remains unchanged because it describes the existing authority algorithm/storage (`p256_v1` / `pq_v1`), not the envelope version. The new envelope independently carries explicit `format:aux.wrap.dk.v2` and `p256_v2` / `pq_v2`. The candidate carries review format `aux.install.prepared.v2`. A future receiver must explicitly select/validate the envelope format; a global string flip or metadata-only reinterpretation is insufficient.

The candidate provides the two recovered public shapes separately: `publicCommandReply` uses `scheme/sig/kem`; `initializationPublicReply` uses `scheme/sig_pub/kem_pub`. These are public projections of the imported, checked keys. No unchecked caller-supplied KEM public field is fabricated.

The candidate always reports `persistencePerformed=false`, `authorityProvenanceVerified=false`, and `commitAuthorized=false`. Public equality and a local challenge prove internal consistency with supplied expectations, not the trustworthiness of those expectations, query capture, signing entitlement or installation ownership. Original row hashes bind bytes only; they are not Keychain CAS tokens or a durable transaction receipt.

## Focused checks completed

```sh
xcrun swiftc -typecheck -target arm64-apple-macos13.0 docs/integration/proposed/aux-native-p256-envelope-port/source/*.swift docs/integration/proposed/aux-native-pq-continuation/source/*.swift docs/integration/proposed/aux-native-signing-port/source/*.swift docs/integration/proposed/aux-native-install-storage-port/source/*.swift docs/integration/proposed/aux-native-four-row-preparation/source/*.swift
node docs/integration/proposed/aux-native-four-row-preparation/check.mjs
python3 docs/integration/proposed/aux-native-four-row-preparation/verify-preparation.py
```

All passed. The fixture uses distinct fixed synthetic software signing/KEM scalars and a synthetic Aux continuity challenge. Seventeen assertions cover all-absent/partial/blocked/invalid states, unchanged representation bytes, both public continuity checks, reply shape separation, wrong-channel/key/empty-challenge refusal, software refusal of enclave metadata, and both legacy channels. Node independently authenticates both resulting Aux wrappers to the original synthetic root and checks all original payload hashes. Hardware source is compiled but no enclave/PQ function is invoked. No original addon, Keychain, provider, owner data, persistence or signing-identity operation ran.

`preparation-evidence.json` pins every composed source file, fixture and dependency evidence manifest. The static checker validates these hashes and absence of an I/O/Keychain/installation-factory executor in the new boundary. Historical function evidence remains in the separate recovery proposals.

## Remaining real coordination

No selector remapping, Keychain migration commit, original-row deletion, atomicity, restart, rollback, durable marker or startup acceptance is implemented here. Root integration must establish truthful captured OSStatus, reviewed Aux-only selector/entitlement binding and trusted expected-public continuity; prepare additive target rows without replacing original authorities; verify actual target readback and authenticated root/signing acceptance; and retain originals through durable restart/rollback verification. The original delete-before-add helper is unsuitable for that transition. Hardware import/sign/wrapping and actual native acceptance remain unverified.
