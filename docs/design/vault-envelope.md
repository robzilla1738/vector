# Aux local Vault format, version 1

This is an independently designed format for `docs/spec/daemon/services.md` (Vault and password security) and `docs/spec/ui/vault.md`. It is not compatible with another application's ciphertext. Status: implemented local crypto/storage and API first slice; native biometric/passkey/credential-exchange features and visual parity remain outstanding.

## Cryptographic construction

The public npm dependency `libsodium-wrappers-sumo` 0.8.4 provides Argon2id v1.3 and XChaCha20-Poly1305-IETF. Passwords derive a 32-byte wrapping key using a fresh 16-byte salt, three operations and 67,108,864 bytes of memory. These parameters are fixed and validated for v1 rather than accepting arbitrary values from an untrusted file. They are an Aux desktop tradeoff, not a claim about another product's parameters.

Setup creates an independent uniformly random 32-byte data key. The password-derived key wraps it using authenticated encryption. A second uniformly random 32-byte recovery key independently wraps the same data key. The recovery key is displayed as `AUXR1-` followed by canonical unpadded base64url; this carries 256 bits of entropy and is not a mnemonic word format. Recovery rewraps the data key under a newly derived password key and a new recovery key, atomically invalidating the old wrappers in the current file. Password change verifies the current password and replaces its wrapper; it preserves the current recovery wrapper.

Every authenticated encryption uses a fresh random 24-byte nonce. Associated data is UTF-8 `Aux Vault v1`, NUL, decimal account identity, NUL and a purpose. Master wrappers use `master/password` and `master/recovery`. Records use `vault/<id>/<revision>` or `item/<id>/<revision>`. Authenticated record plaintext repeats its identity and revision; reads verify both and the dictionary key. A copied record cannot authenticate as another account, record kind, identity or revision.

Construction guidance: [libsodium password hashing](https://doc.libsodium.org/password_hashing/default_phf), [XChaCha20-Poly1305](https://doc.libsodium.org/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction), and [associated-data use](https://doc.libsodium.org/secret-key_cryptography/encrypted-messages). Upstream package notices remain in the dependency distribution.

## Stored envelope

`u/<account>/vault-state.json` has format `aux.vault`, version 1, accountId, global revision, fixed KDF metadata, password/recovery wrappers and dictionaries of encrypted vaults/items/history. A sealed value contains canonical base64 nonce and ciphertext with its authentication tag. Each record exposes only its opaque ID and revision. Titles, categories, usernames, passwords, URLs, tags, notes, additional fields, policies and import fingerprints are inside ciphertext. History retains up to 1,000 prior encrypted revisions per item. Deletes remove current/history records from the current file; filesystem backups may retain older encrypted data.

The owner-only file is replaced using a fresh exclusive temporary file, file fsync, atomic rename and directory fsync. The existing account storage boundary rejects symbolic links. Plain item updates use explicit patch schemas without creation defaults, preventing a title edit from resetting secret fields. Item revisions and the cipher transport's global baseRevision reject stale mutations. Cipher clients can read/write authenticated ciphertext while locked. A locked cipher-vault deletion with any items is conservatively rejected until the plaintext owner can check membership.

The data key stays in daemon process memory only while the account is unlocked. Lock, account deletion and shutdown call libsodium memzero on retained key arrays and drop them. Plaintext buffers used for record serialization/decryption are wiped. JavaScript strings, IPC responses and engine/browser memory cannot be guaranteed to be zeroized; callers must clear secret UI state when locking. Argon2 currently executes synchronously in libsodium's local runtime and can briefly block the event loop.

## Authorization and local import

All routes use the daemon's authenticated/account-scoped procedure. Secret-bearing setup, unlock, recovery, password change, generator and import requests are POST mutations. Plaintext responses require `Cache-Control: no-store` at the daemon transport boundary.

The agent autofill payload route is restricted to the password-extension actuator. It checks the owning task's account and browser binding, unlocked state, active item, agent policy, and matching full HTTP(S) origin. It requires an exact persisted allow response for operation `{kind:'vault-autofill',itemId,targetUrl,profileId,browserMode}` and consumes that response durably before releasing minimal username/password fields. The actuator must independently recheck the live document and selected target. Credentials must never be returned through a model's tool transcript. Per-item reprompt enrollment is explicitly unavailable in this version; enabling it is rejected rather than weakening that promise.

Local import supports unencrypted Bitwarden JSON and explicit generic/Apple/1Password/LastPass/Dashlane/Proton CSV files chosen by the user. CSV decoding uses the independent `csv-parse` package, strict columns and bounded input/row sizes. Invalid rows have row-number errors. Additional fields are retained as encrypted sections. Preview returns titles/categories/counts/errors only; commit requires `accepted:true`. A SHA-256 fingerprint of canonical source row data is stored only inside the encrypted item and prevents retry duplication. Native manager database decoding, encrypted export formats, 1PUX archives and Apple credential exchange are not implemented by these CSV paths.

## Verification and limits

Focused disposable-home tests cover wrong passwords remaining locked; absence of plaintext metadata/secrets in stored current/history bytes; history and stale revision protection; ciphertext tampering; cross-account associated-data rejection; recovery preserving items; old recovery/password invalidation; and password change. TypeScript and source lint run separately.

This format authenticates ciphertext, not the owner's filesystem history. A full rollback to an older authentic file cannot be detected without an independent trusted monotonic counter or backup authority. It also does not protect a running unlocked daemon from an already authorized local client, OS administrator, debugger or process-memory compromise. Touch ID uses an optional private helper adapter with password verification before enrollment, authenticated-record proof before accepting a returned key, and lock-generation cancellation of pending operations. Clear/account deletion remove the OS-held key. Actual device enrollment/unlock, passkeys, encrypted provider exports, native credential exchange, clipboard expiry and full UI acceptance remain separate acceptance work.
