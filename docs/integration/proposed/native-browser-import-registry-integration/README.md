# Installed registry integration after password readers

The registry proposal’s original two-file baselines and outputs are independently replayed and hash-verified. Its identical patch bytes are then applied to actual423, which includes the three lower reader proposals. Applying the original reader proposals after registry instead produces byte-identical migrator, source-crypto and import-service outputs. The new manifest pins the composed before/after hashes and unchanged original patch.

No source profile, application discovery, credential, Keychain or OS operation is executed. Compile/runtime evidence remains separate.
