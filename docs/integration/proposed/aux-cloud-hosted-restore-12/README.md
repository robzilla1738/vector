# Current12 hosted recovery drill

Actual session61967 passed against the reviewed temporary Neon endpoint and existing separate Aux private Blob stores; cleanup47621 also passed. `evidence.json` records exact exercised source hashes and sanitized results. The temporary branch is deleted, so the fixed review is historical and must not be reused. The runner uses the actual online capture and full isolated restore CLIs. It reuses synthetic data shapes from the real local PostgreSQL18 fixture, including both private object families, server-wrapped generation3 CSK, recovery material, deleted user, sessions/challenges, snapshot, share and excluded transient uploads.

Run from the repository root after reviewing the exact one-hour 0.25 CU branch and both existing Aux stores:

```
node docs/integration/proposed/aux-cloud-hosted-restore-12/drill.mjs NEW_PRIVATE_DIRECTORY REVIEW_JSON
```

The three existing service environment files must be owned regular mode0600 files: `.env.production-bootstrap.local`, `.env.production-secrets.local`, `.env.local`. Only explicit production capture values and development Blob token enter the respective child environments. The target URL is derived privately from the existing production direct connection by substituting only the exact reviewed temporary endpoint/database; the inherited role/password are unchanged. No connection string or token enters argv, evidence or logs. Never print these files.

Review JSON fields:

```
{
  "format": "aux.hosted-restore-12.review.v1",
  "sourceProject": "ancient-river-76453764",
  "sourceHost": "ep-red-snow-b8ctxcyx.c-14.us-east-1.aws.neon.tech",
  "sourceBlob": "uur9brkrqm4lu0z2.private.blob.vercel-storage.com",
  "targetBranch": "ACTUAL_REVIEWED_BRANCH",
  "targetHost": "ACTUAL_REVIEWED_DIRECT_HOST.neon.tech",
  "targetDatabase": "aux_recovery_12_20261023",
  "targetBlob": "6koqauoahm1ivxeq.private.blob.vercel-storage.com",
  "targetComputeCu": 0.25,
  "targetExpiryHours": 1,
  "targetUnserved": true
}
```

The review records external isolation/expiry; it does not prove them. Root must inspect actual provider settings. The runner requires all29 current application tables empty and all12 source migration hashes exact before fixture writes. It creates a fresh empty database on the reviewed non-primary endpoint, refuses preexisting source/target object paths, uses random UUID paths and create-only writes, and caps the real encrypted capture/restore at10MiB. It performs no provisioning, deployment, account sign-in or traffic switch.

After successful actual capture, only generated source objects and records are deleted and all29 source tables must again be empty. The full restore CLI imports/quarantines the target; the runner checks hashes, recovered CSK decryption, generation/recovery/deletion/snapshot preservation and session/challenge/share/transient quarantine. Real private attachment/avatar reads must match fixture bytes.

Success retains the isolated target and private bundle/key/progress for explicit reviewed cleanup. Failure also retains partial targets and records generated source IDs/object paths for review, without resetting, adopting or deleting unknown destinations. Subprocess errors after spawn remain owned until actual exit; the wrapper never times out or kills the CLI while its importer might own staging. No retry is automatic.

After retaining sanitized proof, root must remove exactly the two generated target object paths, verify absence, drop only the newly generated target database, delete only the reviewed temporary branch and remove private local key/bundle/plaintext. Independent backup custody, scheduling, production cutover and real-user scale remain outside this drill.

## Actual execution and cleanup — 2026-10-23

The actual source had all29 application tables empty. The drill added only generated fixtures, ran the real snapshot capture CLI, removed those fixtures and verified all29 tables empty again. The full restore CLI imported all12 schema hashes into the empty temporary Neon database, applied quarantine, and restored both object families to the separate existing Aux development private store. Actual readback matched, the recovered wrapping key decrypted the original synthetic CSK, and generation/recovery/deleted-owner/snapshot state was preserved.

Root verified both target objects against their exact restore-progress hashes before deleting either, verified their absence, dropped only the generated database, and deleted the named one-hour branch. The actual Neon table then showed one branch, main only. The owned private local root, encrypted bundle and recovery key were removed after sanitized evidence was retained. No existing user data, provider credentials, deployment, desktop UI or production traffic changed. This does not establish independent backup custody, scheduling, cutover, identity/billing reconciliation or native recovery acceptance.
