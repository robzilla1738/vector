# Encrypted recovery bundles

The local operator tooling is separate from the desktop and deployed API. It does not enable production, import a database, upload recovered files, send email or revive sessions. It is not an automatic backup service.

Historical11-schema acceptance: an exported production PostgreSQL custom archive, a 1 MiB synthetic private file and the wrapping key recovered together after source-file deletion. The archive was then imported into a new empty database on a separate 0.25 CU, one-hour Neon branch. All 11 migration hashes, the original synthetic owner and attachment metadata matched. The recovered wrapping key decrypted the original fixture CSK, and the restored private file matched its hash through a fresh provider read. The restored database, file, branch, source fixture records and local sensitive bundles/key/plaintext were removed. Evidence: `../evidence/recovery-capture.json` and `../evidence/isolated-recovery-restore.json`. Independent storage/key custody, scheduling, retention deletion and operational cutover remain unconfigured; this disposable drill does not prove recovery at real-user scale or a production RPO/RTO.

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

Independent remote storage/key custody, scheduled retention deletion and alerts remain required before disaster-recovery acceptance. The later current12-schema hosted drill passed actual full capture/restore CLI execution against Neon and a separate private Blob store; see `docs/integration/proposed/aux-cloud-hosted-restore-12/`. The 7-day archive deadline refuses old unpacking; it does not delete copies or keys. Keep recovery keys separate from encrypted bundles. Production use must follow an explicitly reviewed target/environment and byte budget; never pass secrets in command arguments.

## Isolated restore of the current online format

The current operator restore command is `node scripts/cloud-recovery-restore.mjs SEALED_BUNDLE SEPARATE_KEY_FILE TARGET_REVIEW_JSON FRESH_REPORT_DIRECTORY --max-bytes=N`. Supply only the reviewed target's `AUX_RESTORE_DATABASE_URL`, `AUX_RESTORE_BLOB_READ_WRITE_TOKEN` and exact recovered `AUX_RESTORE_DATA_ENCRYPTION_KEY` through a private environment. It never selects the default source credentials. The target must remain unserved and isolated throughout import and review; a target description or empty-database count does not establish that custody.

The command authenticates/unpacks the bundle, imports the archive into the empty target, verifies all twelve migration hashes and the exact durable object inventory, revokes restored Aux sessions/challenges and public shares, marks temporary/incomplete uploads unavailable, then copies and reads back both private avatars and durable attachments with overwrite disabled. It preserves wrapped keys, sync generations, recovery state, financial data and metadata relationships. A failed or uncertain operation retains partial targets and private progress for review; it does not automatically reset or retry them.

Before any later cutover, preserve the original **AUX_DATA_ENCRYPTION_KEY** separately and configure a **new AUX_AUTH_SECRET**. They serve different purposes: changing the data key would lose CSK access, while keeping the old auth secret could revive stateless avatar capabilities despite database session revocation. Reconcile external identity/billing state and post-snapshot deletions separately.

The original offline check used the actual twelve migration DDL files and encrypted bundle/filesystem path. A later [real local PostgreSQL18 drill](../../../docs/integration/proposed/aux-cloud-local-pg18-restore/README.md) passed actual current-schema custom-archive import, quarantine, key/generation preservation and original CSK decryption, plus attachment/avatar readback through an explicitly local memory adapter. It used the current capture/restore process helpers and stopped/removed its private Unix-socket-only cluster. Hosted Neon/Blob restoration, full provider CLI admission and activation remain unverified. Exact usage, target-review format, evidence and limits: [isolated restore review](../../../docs/integration/proposed/aux-cloud-isolated-restore/README.md).


## Local operator delivery and explicit expiry

`node scripts/cloud-backup-job.mjs capture JOB_ROOT TARGET_ROOT KEY_FILE --max-bytes=N` invokes the fixed online capture command and delivers its authenticated ciphertext into an explicitly selected private local directory. Both roots must already exist, be owned mode0700 canonical directories and be disjoint; the private recovery key must be outside both. Use the same private production environment files as online capture. `deliver JOB_ROOT JOB_UUID KEY_FILE` retries delivery of that recorded job without repeating capture; `expire JOB_ROOT JOB_UUID KEY_FILE` removes only that authenticated job's listed ciphertext after its deadline. Expiry is explicit, not scheduled.

The runner preserves uncertain captures, retains its lock until the actual child exits, verifies every existing destination entry before mutation, verifies copied ciphertext before publishing completion, and records authenticated status. Local delivery retries and explicit expiry are implemented; remote transport, independent storage/key custody, scheduling and alerts remain unconfigured. See [operator review](../../../docs/integration/proposed/aux-local-backup-job/README.md) for exact boundaries and refusal behavior.

The [actual empty-production check](../evidence/backup-job-empty-production.json) passed read-only capture and local delivery against all12 migration hashes and29 empty application tables. The delivered three-file encrypted bundle authenticated, its71532-byte PostgreSQL archive passed index validation, the wrapping key recovered correctly, and all four status MACs verified. Temporary bundles, key and plaintext were removed. There were no attachment/avatar objects, source writes, provider object uploads/deletes, database import, scheduler or production activation. This verifies the real capture/delivery/unpack path, and predates the later successful current12-schema hosted cross-store/full-CLI drill.

## Remote transport implemented, provider not connected

The explicit operator commands are:

```sh
node scripts/cloud-backup-remote.mjs deliver JOB_ROOT JOB_ID KEY_FILE REVIEW_JSON
node scripts/cloud-backup-remote.mjs verify JOB_ROOT JOB_ID KEY_FILE REVIEW_JSON
node scripts/cloud-backup-remote.mjs expire JOB_ROOT JOB_ID KEY_FILE REVIEW_JSON
node scripts/cloud-backup-fetch.mjs FETCH_REVIEW_JSON NEW_DESTINATION NEW_SCRATCH KEY_FILE
```

Delivery uses the authenticated local inventory and an exact R2 account/bucket/prefix/job review, conditional create-only writes, full bounded readback and completion-last publication. Expiry first checks the authenticated deadline and complete existing remote set; unknown or changed objects refuse deletion. It removes the completion marker first, then the exact owned ciphertext. Fetch can recover after losing local job state; it downloads only the reviewed finite prefix into a fresh private directory, authenticates all encryption/manifest membership and retention, removes plaintext scratch and publishes only authenticated ciphertext. It performs no provider writes.

R2 access must come only from private `AUX_BACKUP_R2_ACCESS_KEY_ID` and `AUX_BACKUP_R2_SECRET_ACCESS_KEY` variables. No ambient AWS credential chain or endpoint override is accepted. Never include credentials or the recovery key in argv/review JSON. A transfer timeout remains an unknown remote outcome; retain the job and retry only its exact ciphertext. No command creates resources, installs a schedule, sends alerts, activates production or establishes independent custody. See [local evidence](../../../docs/integration/proposed/aux-backup-r2-transport/evidence.json) and [unexecuted setup review](../../../docs/cloud/backup-operations-review/README.md).
