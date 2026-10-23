# Isolated current-schema restore

This adds a usable operator CLI for the complete online capture format, without changing UI, deployment, database schema or the capture tool. It imports into an explicitly reviewed empty, unserved Neon target, verifies the actual twelve migration hashes and durable DB-to-object references, quarantines restored credentials/transients, then creates and fully reads back both private attachment and avatar objects in a separate Blob store. It never provisions resources, switches traffic, overwrites existing objects, resets CSKs, deletes source data or grants cutover authority.

## Invocation after separate operator review

From `services/aux-cloud`, with installed dependencies and a compatible `pg_restore`:

```sh
node scripts/cloud-recovery-restore.mjs \
  /private/recovery/sealed-bundle /private/custody/bundle.key \
  /private/review/target.json /private/reports/new-restore \
  --max-bytes=1073741824
```

The command requires separately supplied `AUX_RESTORE_DATABASE_URL` (direct Neon connection), `AUX_RESTORE_BLOB_READ_WRITE_TOKEN` and `AUX_RESTORE_DATA_ENCRYPTION_KEY`. It does not use default source DB/Blob credentials. The last value must exactly match the authenticated bundle's original wrapping key before connecting to the target; it is only a candidate configuration check, not secret installation or proof of the deployed environment. The target review has exactly these public fields:

```json
{
  "format": "aux.isolated-restore-target.v1",
  "databaseHost": "<reviewed-direct-target>.neon.tech",
  "databaseName": "<reviewed_database_name>",
  "blobHostname": "<reviewed-target-store-id>.private.blob.vercel-storage.com"
}
```

The review describes destinations; it is not permission, offline custody or exclusion proof. An empty-target query is likewise not a lock on external writers. The operator must keep the new DB/store unserved and isolated throughout restore and review. The known source host/store and the authenticated capture's store are rejected. Any existing object or partial database refuses: inspect retained progress/targets rather than rerunning, deleting, adopting or resetting them automatically.

## Preserved and invalidated state

The transactional sanitizer first matches the imported durable attachment/avatar inventory to the authenticated manifest exactly. It then revokes Aux sessions, expires their access, clears refresh replies, email/device/recovery challenges and rate-limit state, marks inference/nonready uploads unavailable, and revokes public shares conservatively while retaining their content. Existing deletion flags, sync generations, wrapped CSKs, encrypted recovery revisions, financial data, installation public records and attachment metadata/FKs remain unchanged.

`sync.ts` and `sync-recovery-server-key.ts` use **AUX_DATA_ENCRYPTION_KEY** independently for AES-256-GCM `aux.sync-key.v1:<user>:<generation>` server-wrapped CSKs. Preserve that exact original key through independent custody; rotating it alongside **AUX_AUTH_SECRET** would lose access to those records. `auth.ts` uses AUX_AUTH_SECRET for Aux JWT/HMAC capability authentication. Avatar JWTs have no session-row lookup, so database session revocation is insufficient: configure a NEW independent AUX_AUTH_SECRET before any cutover. The tool neither changes nor claims to validate that future deployment step. External Clerk sessions, billing state and post-snapshot deletions require separate reconciliation.

## Evidence and remaining work

One offline fixture used all twelve hash-checked migration DDL files in PGlite (only the unavailable pgcrypto extension install statement omitted), actual encrypted bundle write/unpack and private disposable filesystem. It proved exact DB/manifest mismatch rollback, both object-family byte/hash preservation, auth/transient quarantine, unchanged key/generation/recovery state, preserved metadata FKs and refusal of existing target objects. Network access was denied. The database archive was synthetic: actual `pg_restore`, Neon, Vercel Blob, deployed auth and a live restore/cutover were **not executed**. The added wrapping-key guard separately accepted the exact synthetic key and refused changed/missing values; the unchanged DDL fixture was not repeated.

Independent backup destination/key custody, scheduled capture, retention/deletion reconciliation, alerting, restore rehearsal against actual providers and reviewed cutover remain required. Append-only private progress records report intents/verified objects; a failed/unknown write remains partial for operator review and is not a resumable adoption mechanism. The source sealed bundle remains untouched; only the command's own temporary plaintext staging is removed.
