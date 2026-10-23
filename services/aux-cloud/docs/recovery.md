# Encrypted recovery bundles

The local operator tooling is separate from the desktop and deployed API. It does not enable production, import a database, upload recovered files, send email or revive sessions. It is not an automatic backup service.

Actual acceptance: an exported production PostgreSQL custom archive, a 1 MiB synthetic private file and the wrapping key recovered together after source-file deletion. The archive was then imported into a new empty database on a separate 0.25 CU, one-hour Neon branch. All 11 migration hashes, the original synthetic owner and attachment metadata matched. The recovered wrapping key decrypted the original fixture CSK, and the restored private file matched its hash through a fresh provider read. The restored database, file, branch, source fixture records and local sensitive bundles/key/plaintext were removed. Evidence: `../evidence/recovery-capture.json` and `../evidence/isolated-recovery-restore.json`. Independent storage/key custody, scheduling, retention deletion and operational cutover remain unconfigured; this disposable drill does not prove recovery at real-user scale or a production RPO/RTO.

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

## Isolated drill

`scripts/check-recovery-capture.mjs` requires an explicitly authorized bootstrap check and an empty, inactive production source. It generates only its own synthetic owner, file and server-wrapped CSK, then removes those source records after capture. The associated fixture metadata and recovered manifest are private local files, not configuration for normal operation.

`scripts/check-recovery-restore.mjs` is pinned to the completed temporary branch `br-dawn-pond-b8ycf4rt`, its exact compute and a new test database. It refuses an existing database, verifies the synthetic source is gone, imports the authenticated PostgreSQL archive and checks the schema/owner/file and recovered-key decryption. It refuses overwriting an existing Blob object, restores only the fixture's exact path, and removes the restored database/file. The branch itself was deleted through the provider UI. Its ID cannot be reused for a future drill: prepare and review that new target explicitly. This runner is not a general production restore command and performs no application cutover.

Sources: [PostgreSQL 18 pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html), [Vercel Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk), [private consistent reads](https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage).

## Online consistent capture command

`pnpm backup:capture:online NEW_PRIVATE_DIRECTORY PRIVATE_KEY_FILE --max-bytes=N` selects the new operator tool. It uses the actual exported repeatable-read PostgreSQL snapshot and copies every ready durable attachment and private account avatar referenced by that snapshot. Immutable unique object paths and complete byte verification make a successful archive consistent; a concurrent missing/truncated/mismatched object aborts without a completed bundle. It does not pause application writes or require a `--quiesced` assertion. Temporary inference/incomplete uploads are excluded and need cleanup during reviewed restoration.

The actual source/SDK object-immutability contract and focused offline encrypted-bundle fixture using all 12 migrations are recorded under `docs/integration/proposed/aux-cloud-online-capture/`. Both operator scripts are byte-identical to those reviewed sources. The old offline/quiesced command and historical drill using 11 migrations remain available as historical tools; neither proves a current production capture. No new capture, production read, upload, deployment or scheduler was executed when this command was integrated.

Independent remote storage, recovery-key custody, retention deletion, scheduler/retry/alerts and a current-schema real cross-store restore remain required before disaster-recovery acceptance. The 7-day archive deadline refuses old unpacking; it does not delete copies or keys. Keep recovery keys separate from encrypted bundles. Production use must follow an explicitly reviewed target/environment and byte budget; never pass secrets in command arguments.

## Isolated restore of the current online format

The current operator restore command is `node scripts/cloud-recovery-restore.mjs SEALED_BUNDLE SEPARATE_KEY_FILE TARGET_REVIEW_JSON FRESH_REPORT_DIRECTORY --max-bytes=N`. Supply only the reviewed target's `AUX_RESTORE_DATABASE_URL`, `AUX_RESTORE_BLOB_READ_WRITE_TOKEN` and exact recovered `AUX_RESTORE_DATA_ENCRYPTION_KEY` through a private environment. It never selects the default source credentials. The target must remain unserved and isolated throughout import and review; a target description or empty-database count does not establish that custody.

The command authenticates/unpacks the bundle, imports the archive into the empty target, verifies all twelve migration hashes and the exact durable object inventory, revokes restored Aux sessions/challenges and public shares, marks temporary/incomplete uploads unavailable, then copies and reads back both private avatars and durable attachments with overwrite disabled. It preserves wrapped keys, sync generations, recovery state, financial data and metadata relationships. A failed or uncertain operation retains partial targets and private progress for review; it does not automatically reset or retry them.

Before any later cutover, preserve the original **AUX_DATA_ENCRYPTION_KEY** separately and configure a **new AUX_AUTH_SECRET**. They serve different purposes: changing the data key would lose CSK access, while keeping the old auth secret could revive stateless avatar capabilities despite database session revocation. Reconcile external identity/billing state and post-snapshot deletions separately.

The focused offline check used the actual twelve migration DDL files and encrypted bundle/filesystem path; no real PostgreSQL archive import, provider restore or activation has run. Exact usage, target-review format, evidence and limits: [isolated restore review](../../../docs/integration/proposed/aux-cloud-isolated-restore/README.md).
