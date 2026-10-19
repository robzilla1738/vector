# Aux Password Importer v1

Independent native helper implementing the authorized export/import boundaries in `docs/spec/daemon/services.md` and `docs/spec/native/adblock-import.md`. It uses the original private NDJSON/Native Messaging framing implemented in `apps/computer-use/Sources/Protocol.swift`, with the same daemon-owned authorization token. Build `dist/Aux Password Importer.app` with `python3 scripts/build.py`; it is ad hoc signed locally and has the fresh bundle identifier `dev.aux.password-importer`.

No source profile discovery or automatic password-manager access occurs. The user must choose or explicitly authorize a particular export file. Password values stay in the private native process until review is accepted. The public review only exposes titles, usernames, URLs, category and whether a password exists. Prepared items live in memory for ten minutes, with at most eight reviews. No decrypted export copies, credentials, passwords or keys are logged or written to importer-owned caches. Swift/Foundation immutable copies cannot promise secure erasure.

| Method | Input | Output |
| --- | --- | --- |
| `ping` / `capabilities` | none | actual service and supported format inventory |
| `import.pickFile` | none | native owner-operated Open panel; cancelled flag and selected path/null |
| `import.prepare` | path, format, authorized=true | jobId, total count, redacted preview page, per-row errors, nextCursor |
| `import.review` | jobId, optional cursor/limit | redacted preview page; default 100, maximum 200 |
| `import.commit` | jobId, accepted=true, optional cursor/limit | private plaintext batch for the unlocked vault service, count, total, nextCursor; final page consumes the review |
| `import.cancel` | jobId | drops the in-memory review; absent is harmless |

The daemon exposes `createPasswordImporterAdapter(client)` with `pickFile`, `prepare`, `review`, `readAcceptedBatches` and `cancel`. Batch items have id/title/category(login or note)/username/password/urls/notes/totp/source, plus original createdAt where available. The source records export format, filename, row number and available upstream identity. The vault service must encrypt accepted batches immediately and return counts/errors to its public caller; these private plaintext batches must never be exposed through a public HTTP response. Accepted source IDs and imported item IDs should be retained to reconcile partial imports without blindly duplicating records.

Supported formats:

- UTF-8 RFC4180-style CSV including quoted commas, escaped quotes and multiline notes. Header aliases cover Apple/Chromium/1Password/Bitwarden/LastPass-style login exports. Unsupported/malformed columns are reported, not guessed. TOTP strings are retained when present. This is login-data import, not complete category/passkey parity for every manager.
- Unencrypted Bitwarden JSON login and secure-note items. Explicitly encrypted exports fail with a source-decryption requirement. Cards and identities are reported as unsupported categories rather than silently discarded.
- Public 1Password 1PUX ZIP or its `export.data` JSON. The parser follows the documented account/vault/item/loginFields structure and retains source vault+item identity. ZIP processing reads only the exact `export.data` member into a bounded buffer; it never extracts arbitrary archive paths. Attachments, documents, non-login category schemas and passkeys are not implemented and are not claimed imported.
- Disposable Chromium `logins` SQLite fixtures, opened read-only. The canonical source must be under a temporary directory and have an adjacent `.aux-fixture.json` marker `{format:chromium-login-fixture,version:1}`. Original Chromium microseconds-since-1601 creation times are converted to epoch milliseconds. Plaintext fixture rows work; v10/v11/v20 encrypted rows return `SOURCE_KEY_REQUIRED` without being imported. Real browser databases/Safe Storage decryption remain unavailable and require a separate explicitly authorized implementation.

Files are bounded to 32 MiB, decoded 1PUX JSON to 16 MiB, and parsed items to 10,000. Reviews and secret batches are paged to keep private transport replies bounded. No command strings or code are executed from export fields. CSV/JSON content is always data. Tests use only synthetic temporary CSV/1PUX/SQLite sources, verify redacted review before accepted secret access, preserve original dates, reject encrypted categories and prove unrelated ZIP members are not extracted.

Primary public format documentation: [1Password 1PUX](https://support.1password.com/1pux-format/), [Bitwarden exports](https://bitwarden.com/help/export-your-data/). Parsers are independently authored; no source-manager application code or profiles were inspected.

## Daemon encrypted acceptance adapter

`createNativeImportRouter(services, vault, importer)` (daemon helpers export) mounts an
account-scoped review lifecycle. `importer` comes from
`createPasswordImporterAdapter(new HelperClient(importerExecutable, privateArtifactDirectory))`.
`vault` is structurally compatible with the independent `VaultService`; its unlocked
`snapshot` validates the destination and `createItems` encrypts each accepted batch.
The router exposes `pickFile({accountId})`,
`prepare({accountId,vaultId,path,format,authorized:true})`,
`review({accountId,jobId,cursor?})`, `cancel({accountId,jobId})` and
`commit({accountId,jobId,accepted:true})`. Prepare/review return only native redacted
previews; commit returns `{created,skipped,revision}`. No regular RPC exposes native
plaintext commit batches. Jobs expire after nine minutes, bind account and destination,
are consumed once, serialize commit, and cancel on account deletion. Interrupted imports
report encrypted-write counts; a new review safely deduplicates previously committed
content using encrypted SHA256 provenance. Notes map to `secure-note`; imported items
start active with `while-unlocked` agent policy and no password reprompt.

Private plaintext batches live transiently in process memory, then only encrypted Vault
records persist. JavaScript immutable strings cannot guarantee explicit memory wiping;
the adapter never logs them, sends them to models, or returns them through commit RPC.
