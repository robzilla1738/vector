# Online consistent recovery capture (inactive operator successor)

This extends the actual local `cloud-recovery.mjs` tool. It does not mount an API, change deployment/DB schema, pause traffic, schedule a job, upload a backup, delete provider data or activate production. No credentials or provider resources were read during preparation.

## Consistency model

A successful bundle contains one exported PostgreSQL repeatable-read snapshot and a fully copied immutable object for every durable Blob reference selected from that same snapshot. Uploads use unique UUID paths and disallow overwrite. Later head changes or object deletion cannot change an already copied byte stream. If deletion happens before/during a read, a missing stream, short stream, wrong owner path/store/MIME, size mismatch or attachment hash mismatch aborts the entire new bundle. There is no claim that capture always succeeds under active cleanup, that writes are paused, or that a PG lock can stop delayed provider operations. No application deletion semantics changed.

`source/cloud-recovery-online.mjs` retains the actual direct production endpoint/Blob store binding, migration-hash check, `pg_export_snapshot`→`pg_dump --snapshot`, custom archive index validation, explicit total byte budget, per-entry AES-GCM encryption and last-written opaque completion record. It rejects `--quiesced` rather than treating an operator Boolean as exclusion. The source transaction closes inside the entry generator, before the encrypted manifest/completion publication; an error there also removes the incomplete output through the actual existing bundle writer.

The new inventory includes ready non-inference attachments **and private avatars referenced by aux_users**. Avatars were absent from the original capture. Attachments retain their reserved size/hash commitments. Avatar writes use unique UUID paths and the installed Blob SDK's default `allowOverwrite:false`; their DB rows store only path/MIME. The capture enforces the actual 2 MiB upload limit and binds its measured full hash/size in the sealed manifest, without inventing an existing DB commitment. `avatar-immutability.patch` makes the existing SDK default explicit at the one avatar writer; it is prepared, not applied. SDK declarations and actual source are pinned. Excluded inference/incomplete uploads remain transient and must be discarded during reviewed restoration.

## Concrete integration

Review `capture.patch` against the frozen original. Place the two new source files together under `services/aux-cloud/scripts/`, beside the unchanged `recovery-bundle.mjs`; the CLI retains its existing `../src/schema-manifest.json` import. Do not run the proposal source directly from its review folder. There are no new dependencies. The old quiesced tool/drill and evidence remain historical, unchanged.

The prepared command is `node scripts/cloud-recovery-online.mjs capture NEW_PRIVATE_DIRECTORY PRIVATE_KEY_FILE --max-bytes=N`, with secrets supplied through the existing private environment boundary, never argv. Nothing here authorizes running it against production. The current full schema manifest must match the actual source database; old production drill evidence with 11 migrations is not verification of today's 12-migration schema. The total object limit (100,000), existing 8 MiB sealed-manifest limit, archive/tool timeouts and conservative 2 MiB reservation per avatar remain bounded capture limits; they are not a real-user scale/RPO guarantee.

## Focused actual evidence

One offline fixture executed all 12 real DDL files (only the unavailable PGlite pgcrypto extension-install statement was omitted, as in the existing cloud fixture), selected attachment/avatar rows through the actual inventory SQL, excluded an inference row, and used real private-filesystem encrypted bundle write/unpack. It proved that later DB reference changes and deletion after verified copying do not alter the retained snapshot objects; deletion before the next copy and truncation leave no output/completion directory. `pg_dump` archive bytes and Blob delivery were explicitly synthetic. This is not a real production capture, provider restore, concurrent PostgreSQL server test or paid operation.

The first fixture run exposed an eager composed-stream error before the bundle pipeline attached its handlers. The new helper now reads lazily through an async generator with cancellation; the same focused fixture then passed. Historical failure and final source-bound evidence are recorded separately. No unchanged crypto/DB suite was repeated.

## Still external / requiring owner decisions

- A durable destination independent of the source database/Blob credentials, with verified upload-before-completion publication and separate access control. Local encrypted files alone are not disaster recovery.
- Independent recovery-key custody and a restore procedure for the sealed server wrapping key. Keeping key and bundle together defeats that separation.
- Agreed RPO/retention and real retention deletion. The existing 7-day manifest deadline refuses old unpacking; it does not erase files, remote copies or keys.
- Scheduler, bounded retry/backoff on concurrent deletion, and alerts for missing/stale completed backups or failed independent uploads. No scheduler or success Boolean was fabricated.
- A reviewed isolated real restore using the current complete schema, both object families, transient-row cleanup and session revocation, with observed RTO and deletion/privacy handling. No automatic cutover exists here.
