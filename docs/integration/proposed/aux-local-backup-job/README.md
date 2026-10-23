# Local backup job producer

This operator runner connects the actual online capture command to a reviewed **local** private delivery root. It is not an independent/remote backup, scheduler, alert service or custody proof. No provider operation, real capture, account setup, secret read, email or scheduler activation was performed for this implementation.

From `services/aux-cloud`, with existing dependencies and capture credentials privately configured:

```sh
node scripts/cloud-backup-job.mjs capture \
  /canonical/private/jobs /canonical/reviewed/mounted-delivery \
  /separate/custody/recovery.key --max-bytes=1073741824

node scripts/cloud-backup-job.mjs deliver \
  /canonical/private/jobs EXPLICIT_JOB_UUID /separate/custody/recovery.key

node scripts/cloud-backup-job.mjs expire \
  /canonical/private/jobs EXPLICIT_JOB_UUID /separate/custody/recovery.key
```

Both roots must already exist, canonical, owned mode0700 and disjoint. A mount path is configuration only: the runner does not certify a separate device, durability, independence, remote replication or control of other processes. The key stays outside both roots. The existing encrypted bundle format is reused; only ciphertext and the opaque completion marker enter delivery. No plaintext or key file is copied there. Capture authentication uses a temporary private plaintext verification directory inside the job and removes that directory afterward.

## Concrete lifecycle

- Create a unique job and target directory without overwrite, retain their device/inode identities in an HMAC-authenticated binding, and durably record capture intent before spawning the fixed `cloud-recovery-online.mjs` command. The CLI has no injectable capture implementation or arbitrary command option.
- Execute capture once. Failures/stop requests/uncertain outcomes preserve the job and refuse automatic recapture. After fifteen minutes the runner attempts to durably record a stop request, then sends SIGTERM; it does not claim a hard exit deadline. If SIGTERM is ignored, the real child and runner lock remain pending until actual exit, with no success or recapture. A failed status write cannot establish a durable stop receipt. Delivery requires an already authenticated inventory; missing inventory is operator review, not a signal to generate another backup. A crash-held lock is never cleared based on PID assertions.
- Authenticate the real bundle with its separate key, require a bounded authenticated expiry (at most seven days), and freeze its exact encrypted file inventory/hashes. Binding, inventory and append-only status records use the separate key under the `aux.backup.job.v1` HMAC domain. They contain no wrapping/recovery key, owner content or provider credentials.
- Delivery preflights the entire frozen source and target final/pending set before any cleanup mutation; unknown entries, invalid pending files and corrupt final files refuse while preserving even otherwise-valid pending files. A durable delivery intent precedes cleanup. Each missing ciphertext is copied to an exclusive private `.pending` file, fsynced, fully hash-read back and published by a no-overwrite hard link, then the temporary link is removed and the directory fsynced. Existing completed files must match; they are never rewritten. The original format's `bundle.json` completion marker is published **last**. A retry can discard only an exact inventory-owned, private single-link pending filename; unsafe/unknown/modified final files refuse.
- The CLI makes at most three delivery attempts per invocation, never three captures. Durable failure records remain private. Further explicit `deliver` calls observe the same inventory; there is no automatic existing-object adoption outside it. A hard-link publication interrupted before removing its second link refuses for manual review, rather than guessing that filesystem state is safe.
- Explicit `expire` accepts only one named authenticated job after its authenticated deadline. It verifies the entire remaining source and destination final/pending set before any unlink, records durable deletion intent, removes completion markers first, then unlinks only inventory-listed ciphertext whose current bytes still match. Modified/unknown files refuse, missing files permit continuation of an interrupted expiry, and original binding/inventory/status metadata remain for review. It never scans other jobs, follows a symlink, recursively deletes a delivery tree, extends retention or deletes an unlisted file. Expiry is not yet scheduled.

The single-run directory lock coordinates this runner on one private job root; it is not an all-process writer fence, provider lock, authority grant or crash-recovery certificate. An unresolved stale lock, replaced directory, unsafe file or ambiguous completed publication requires operator review. Directory identity checks and private namespace ownership do not protect against a hostile process with the same UID concurrently replacing entries.

## Focused evidence and remaining operations

`node docs/integration/proposed/aux-local-backup-job/check.mjs` passed one offline actual-encrypted-bundle fixture. It exercised exclusive local locking; unsafe symlink delivery failure without a completion marker or outside-file mutation; retry from a partial ciphertext; full delivered byte equality and actual bundle decrypt/readback; pre-deadline and wrong-key refusal; unknown-file refusal before expiry deletion; and removal of only authenticated expired ciphertext while retaining status/inventory. Network was denied. The test created its synthetic bundle directly; production capture injection is not exposed. No real database/Blob capture or remote mount was used. The focused follow-up adds pending-plus-unknown delivery refusal and pending-plus-unknown/corrupt-final expiry refusal, proving all involved files remain unchanged. The copy write loop explicitly rejects zero, negative, noninteger or oversized write progress rather than looping on a stalled mount. Source pins and execution summary are in `source-pins.json`.

Still external: reviewed independent destination and key custody, real mounted-filesystem durability/support, scheduling, bounded job selection/alert transport, credential rotation/retention custody, deletion reconciliation, current-schema real restore rehearsal and cutover. This runner does not configure those accounts/services or claim production backup readiness. Existing capture and restore evidence remains historical and unchanged.
