# Native PQ wrapping continuation: recovered, not activated

The supplied macOS 26 PQ branch passes CryptoKit's KEM `SymmetricKey` directly to ChaChaPoly and supplies the installation wrapping context as authenticated data. It does not traverse either application-level P256 HKDF call in the original writer or reader. This is a different algorithm from the recovered P256 path; no P256 derivation has been inferred for PQ.

This slice adds a **compile-only** source port for importing an existing Secure Enclave MLKEM768 authority and preparing an explicitly versioned Aux envelope. It does not activate a dispatcher, generate an installation authority, query Keychain, or modify the accepted app or UI. The existing P256 entry point continues to refuse PQ.

## Pinned evidence

The frozen daemon addon is SHA-256 `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`. `flow-evidence.json` pins complete retained disassembly artifacts, original instruction bytes, call targets, register anchors, and reachable-address sets. `evidence/install-init.asm` is Apple LLVM disassembly, not original Swift source or decompiler output. The reader artifact remains in the preceding `aux-native-crypto-boundary` proposal.

| Original reader | Observed boundary |
| --- | --- |
| `0x3cfec` → `0x3d000` | Indirect result slot `x27` receives `decapsulate`'s `SymmetricKey`. |
| `0x3d318` → `0x3d320` | Successful continuation stores that pointer in frame slot `+0xc8`. |
| `0x3d32c`, `0x3d6f8` | Decode nonce, construct CryptoKit nonce. |
| `0x3dd9c`, `0x3e504`, `0x3e528` | Decode combined ciphertext; split ciphertext and the final 16-byte tag. |
| `0x3f5d0` | Construct sealed box. |
| `0x3f678` / `0x3f67c` | Load wrapping context at `0x744e88` as AAD. |
| `0x3f690` → `0x3f69c` | Reload the same key pointer into `open(using:)` argument `x2`. |

| Original initialization writer | Observed boundary |
| --- | --- |
| `0x36c74` → `0x36c88` | Obtain authority public key and encapsulate. |
| `0x3821c` → `0x382a4` | Successful continuation obtains `EncapsulationResult.sharedSecret` into result slot `x25`. |
| `0x38330` / `0x38334` | Load the same wrapping context as AAD. |
| `0x38344` → `0x3835c` | Pass `x25` directly as the ChaChaPoly sealing key. |
| `0x38be4`, `0x38bf8`, `0x38c68` | Obtain ciphertext and tag, append tag. |
| `0x38c90` → `0x38c98` | Reload the original encapsulation result handle and obtain its `encapsulated` bytes for serialization. |

The bounded instruction CFG follows both conditional successors and assumes returning indirect calls; it is not an execution or semantic-feasibility proof. Reader success entry `0x3d318` reaches 1,398 instructions and excludes P256 HKDF sites `0x3d840` / `0x3daf4`. Writer success entry `0x3821c` reaches 1,161 instructions and excludes sites `0x36050` / `0x37988`. Cleanup/error paths overapproximate feasible execution. The validator checks the sole explicit overlapping reader frame-slot write, not arbitrary opaque-callee aliasing. These observations establish no post-KEM application HKDF; they make no claim about KEM-internal derivation.

## Proposed source boundary

- `source/RecoveredPqAuthority.swift` imports supplied existing private representation with `authenticationContext:nil`, matching the recovered import boundary, and verifies the supplied expected public key. Public-key equality does not prove provenance, access-group isolation, or runtime authorization.
- `source/PqEnvelopeRecords.swift` preserves the legacy `pq_v1` container with `encapsulated_key`, nonce, and ciphertext-plus-tag. The proposed successor explicitly uses format `aux.wrap.dk.v2`, scheme `pq_v2`, and AAD `aux.wrap.dk.v2`; it does not silently reinterpret an old record. This new PQ container is not claimed compatible with the separate P256-only JavaScript helper.
- `source/LegacyNativePqEnvelopeReader.swift` is an external migration tool source only. Its prepared candidate keeps the same supplied authority, unwraps the old root, prepares an Aux-v2 envelope, and compares the reopened root. **That runtime path has not been executed.** It performs no persistence and is not intended to ship as an original-brand reader in the final product.
- The small preceding P256 edits expose its unchanged strict JSON parser for reuse and correct a comment about per-scheme call routing. Its explicit PQ refusal remains intact.

## Focused checks completed

```sh
python3 docs/integration/proposed/aux-native-pq-continuation/verify-continuation.py --addon /explicit/frozen/daemon/aside-native.node
xcrun swiftc -typecheck -target arm64-apple-macos13.0 docs/integration/proposed/aux-native-p256-envelope-port/source/*.swift docs/integration/proposed/aux-native-pq-continuation/source/*.swift
```

Both passed against the pinned original binary and installed Apple SDK. No addon, KEM, Secure Enclave, Keychain, private-authority factory, or PQ wrapping code ran. No synthetic runtime success fixture is fabricated in place of missing coverage.

## Remaining integration boundary

The native coordinator still needs faithful authority reads, access-group and ACL/signing isolation, explicit metadata/envelope version selection, durable same-authority wrapping migration, rollback/restart handling, and reviewed caller/receiver ABI integration. Actual same-root PQ execution and restart acceptance remain unverified. Shipping the original addon still leaves original product identity behind; this source proposal alone does not solve that gap. Root integration owns the native build, packaging, startup fence, and any separately authorized runtime checks.
