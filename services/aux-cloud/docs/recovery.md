# Encrypted recovery bundles

The local operator tooling is separate from the desktop and deployed API. It does not enable production, import a database, upload recovered files, send email or revive sessions. It is not an automatic backup service.

Actual local acceptance: an exported production PostgreSQL custom archive, a 1 MiB synthetic private file and the wrapping key recovered together after source-file deletion; the archive index and recovered file hash passed. Source fixture data and local sensitive bundles/key/plaintext were removed. Three focused integrity/failure tests passed. See `../evidence/recovery-capture.json`. Separate-database import, independent storage/key custody, scheduling and durable cross-store recovery remain unverified/unconfigured.

## Capture boundary

`scripts/cloud-recovery.mjs capture` is pinned to the newly approved production database `ancient-river-76453764`, its direct compute hostname and the private production Blob hostname. It requires a private, independently generated recovery key, the current `AUX_DATA_ENCRYPTION_KEY`, an explicit total byte budget and `--quiesced`. That flag is an operator assertion: the tool does not stop traffic or maintenance. Do not set it for a running service without first arranging a write/cleanup pause.

The tool holds a read-only repeatable-read transaction, checks the immutable migration hashes and exports its PostgreSQL snapshot to `pg_dump`. The custom archive and the attachment metadata therefore use the same database snapshot. Every ready non-inference private file must be available with its expected size, content type and SHA-256, or the entire capture fails. Streaming limits bound archive and object bytes. Ephemeral inference files and incomplete uploads are deliberately excluded; their transient database metadata must be discarded during any future reviewed restore.

Blob is a separate consistency boundary. The exported database snapshot does not lock Blob objects. Quiescence is required; an absent or mismatched object fails capture rather than publishing an incomplete bundle. Source objects are never deleted or overwritten by the capture tool. PostgreSQL and provider credentials are not put in subprocess arguments or logs. The source wrapping key is included only in the sealed manifest; provider API credentials and the authentication/cron secrets are excluded.

Each archive/object is streamed through AES-256-GCM with a random nonce. A random 32-byte recovery key derives an independent per-entry key through HKDF; bundle ID and entry name bind authenticated data. The encrypted manifest binds resource identity, wrapping key, file names, sizes and hashes. An opaque completion record is written last; failed exports remove only their own new output directory. The directory is 0700 and files 0600. Existing output directories are refused. Keep the recovery key outside the bundle and in independent custody. Copying both to one laptop does not establish disaster recovery.

## Commands

Run from `services/aux-cloud`. Secrets must come from private mode 0600 files or the authorized process environment, never command-line literals. The existing local private bootstrap files are ignored by Git. PostgreSQL 18 client tools are already available on this workstation; set `AUX_PG_DUMP` / `AUX_PG_RESTORE` to reviewed client binaries on another operator machine.

```sh
node scripts/cloud-recovery.mjs init-key /private/key-location/recovery-key

node --env-file=.env.production-bootstrap.local \
  --env-file=.env.production-secrets.local scripts/cloud-recovery.mjs \
  capture /private/bundle-location/unique-bundle /private/key-location/recovery-key \
  --quiesced --max-bytes=1073741824

node scripts/cloud-recovery.mjs unpack \
  /private/bundle-location/unique-bundle /private/key-location/recovery-key \
  --destination=/private/new-staging-directory --max-bytes=1073741824
```

Unpack authenticates all entries and hashes before returning a usable staging directory. It refuses unsafe paths, duplicate entries, a wrong key, incomplete/corrupt files, expired retention metadata, excessive bytes and existing destinations. Any authentication or archive validation failure removes only the newly created staging directory. The plaintext manifest contains wrapping-key material: treat staging as sensitive, remove it promptly after the reviewed recovery, and never commit it. The tool validates the PostgreSQL archive index; this alone does not prove a database restore.

## Before production backup activation

1. Review an independent encrypted backup destination, access scope, cost, seven-day retention and deletion enforcement. The manifest records a seven-day deadline and unpack refuses expired bundles; no scheduler or physical deletion service is configured. Do not silently extend a user's deleted content beyond that retention.
2. Put the recovery key in separately controlled custody, document who can recover it and verify retrieval without displaying it. Do not send it through chat or keep the only copy with the bundles. Keep previous wrapping keys when rotating until their authorized backup retention ends.
3. Restore a bundle into a new isolated empty database and a reviewed private object destination. Check schema, ownership, actual record and content hashes and decryption with the recovered wrapping key. Do not reset the live primary as a drill.
4. Reconcile post-snapshot account deletions, identity revocations, public share revocations and billing events with authoritative providers/current state. Revoke restored sessions/device approvals and discard email challenges, ephemeral inference inputs and incomplete uploads before any activation. Never use an old archive to undo a refund, re-enable a deleted account or revive an agent's execution authority.
5. Review a concrete cutover/rollback and run protected readiness, actual sign-in and private-content checks. Local unpack performs none of these live writes. Choose RPO/RTO only after a timed full drill; no RPO/RTO or production recovery claim exists yet.

Sources: [PostgreSQL 18 pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html), [Vercel Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk), [private consistent reads](https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage).
