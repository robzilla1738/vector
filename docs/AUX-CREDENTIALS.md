# Local model credential storage

Gateway, OpenAI, Anthropic, and Google keys saved through desktop Settings use
Electron OS encryption. Each provider has a separate encrypted secret and model
preferences. Switching providers never transfers a key. Direct requests use
fixed official endpoints, with no cross-provider fallback. Active runs prevent
connection changes. Enter a model ID available to your provider account.
There is no plaintext fallback. If encryption is unavailable, saving fails and
the entered value stays visible in the password field for correction or retry.
Linux's `basic_text` backend is rejected even if Electron reports encryption
available. Standalone runtimes accept an explicitly supplied environment key
but cannot persist a key through Settings without the desktop vault.

The native store writes an encrypted, versioned envelope to a private temporary
file, syncs it, then replaces the destination. Encryption/write failures before
replacement preserve the prior file. Secret names are validated, not sanitized
into potentially colliding paths. Settings awaits storage, serializes concurrent
updates, masks returned keys, and reports vault errors without exposing key data.
Removing a saved key does not unset a separate process environment key; Settings
identifies the active source.

## Existing installations

Legacy plaintext `gateway.key`, database settings, and settings.json credentials
are no longer accepted as model authentication. Old native files without the new
version envelope also require re-entry. Aux does not read a legacy credential to
silently migrate it. The user explicitly enters a replacement or clears the key
in Settings. A successful encrypted save precedes cleanup of active legacy copies.
An unrelated preference edit preserves an existing legacy JSON file unchanged
and records the preference in SQLite instead of copying its secret into a new file.

Old database pages, WAL files, migration snapshots, and external backups can
still contain historical plaintext. Deleting an active setting is not a claim of
secure erasure. No backups or personal credential stores were modified by this
implementation work. Recovery and retention policy remain roadmap requirements.

## Site credential vault

The Aux vault holds website sign-ins for human fill and agent grants on the same
native store: Electron OS encryption, versioned envelope, atomic writes, no
plaintext fallback. Item secrets live under deterministic names derived from the
item id, so restarts and app updates preserve keychain continuity. The vault
locks on an explicit passphrase or unlock TTL; nothing reveals a secret while
locked.

Human fill is main-process only. A page's chosen credential is revealed inside
main after an exact normalized-origin match (subdomain, lookalike host, other
port or a credential-bearing URL is denied and recorded), then filled into the
validated frame. The renderer sees item metadata and fill results, never secret
values. Save offers capture submitted fields inside the page at submit time and
hold them briefly in main memory; the banner confirms save or update, and an
unchanged secret suppresses the offer entirely. Explicit JSON export writes a
user-chosen file with restrictive permissions; import validates and dedupes.

Models and external clients receive opaque credential references only. Grant
fills, human fills, denials, expirations and exports land in vault access
history with details, never secret material.

## Qualification boundary

Tests use an injected authenticated-encryption implementation and synthetic keys
inside temporary directories. They verify encrypted persistence, restart loading,
removal, unavailable/plaintext backend refusal, corrupt data, concurrent saves,
legacy handling, and failure preservation. They never call the OS credential store.

Actual OS unlock/decryption behavior, bundle-identity changes, cross-platform
qualification, provider-specific accounts, cloud credential brokering, and live
model calls still require separate verification. User permission is required
before tests against personal credential stores; missing credentials must be
requested rather than discovered by searching the computer.

Direct-provider adapters were qualified with synthetic SDK responses, including
authentication failure behavior; UI provider switching and separate model settings
are covered in the actual desktop. Real provider authentication and live model
behavior require a user-supplied credential and remain unqualified. Custom/local
OpenAI-compatible endpoints are still roadmap work. No personal credentials were
read or requested by these tests.
