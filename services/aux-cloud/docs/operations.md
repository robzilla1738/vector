# Cloud operations — current completion scope

The October 26 metadata review found all six aliases, including `dev-cloud.getaux.co`, assigned to the existing Production deployment. Do not treat that hostname as an isolated Preview. The current source has not been activated or accepted there. Existing Aux Production Neon/Blob resources and Clerk/Resend configuration are retained; do not provision duplicates or replace secrets based on older missing-variable reports.

The current activation procedure is [DEPLOYMENT.md](../../../docs/integration/proposed/completion-20261026/integration/cloud-activation/DEPLOYMENT.md), with one [J5 journey](../../../docs/integration/proposed/completion-20261026/integration/cloud-activation/J5.md). Local desktop completion is independent. Backups and their setup are owner-deferred; historical recovery notes below are not a work order or completion gate for this task.

## Deployment checks

`pnpm build` checks the target database hostname, app/API origins, provider modes, allowed web origins and auth/encryption/cron key formats. Aux takes no payments and funds no AI, so the service has no payment or hosted-AI code and no Stripe or Gateway settings; readiness always reports both launch flags false. Environment presence does not establish secret pairing, real delivery or live behavior.

Source has twelve immutable migrations. Historical Production evidence records all twelve applied. Compare their exact hashes before activation; no DDL is expected. A genuine missing or mismatched migration needs a separate exact review, never a reset or a rerun of altered applied SQL.

Production-filtered dashboard evidence supersedes the older truncated inventory: all six previously omitted configuration names are present. Public app/API origins and false launch flags were observed; other public values and secret-recipient pairing remain unverified. `scripts/check-production-configuration.mjs` is a metadata aid, not proof of provider ownership or production readiness. Do not recreate fields from an incomplete API listing or reveal secret values into logs.

The remote Root Directory is empty, Node is24.x, and Git is disconnected. Upload only the reviewed `services/aux-cloud` tree with its lockfile/config; a reported Git label does not prove the deployed bytes. Preserve marketing and Hostinger mail DNS. Correct dev-cloud's actual environment/alias assignment within the explicit activation review before promoting Production.

## Read-only readiness acceptance

`GET /api/v1/health` is liveness. Authenticated `GET /api/v1/internal/readiness` reads migration metadata only and reports the expected schema count/digest, actual schema compatibility and both launch flags. It makes no provider calls or writes. Compatible later additive migrations remain allowed; this does not certify an old deployment's protocol compatibility.

The corrected `scripts/check-readiness.mts` requires an explicit target review and a new output path. It no longer guesses that dev-cloud is Development, loads `.env.local`, requires all provider secrets, or compares the obsolete response shape. A review records `format: aux.readiness-target.v1`, the existing project/team IDs, `environment: development|production`, exact HTTPS `origin`, actual `deploymentId`, and `assignmentVerifiedAt`. The operator must verify those facts against the intended deployment first. Only the matching API alias or the Aux project's unique deployment hostname is accepted; the target review is evidence, not authorization.

Readiness accepts only `AUX_READINESS_SECRET`, never `CRON_SECRET`, so the monitor cannot invoke maintenance. Supply it through a private process environment, with `AUX_READINESS_SECRET_ENVIRONMENT` matching the reviewed environment. Never place its value in argv, a URL, Git or evidence. Then, from the service directory:

```sh
pnpm exec tsx scripts/check-readiness.mts --target-review /absolute/review.json --output /absolute/new-readiness-receipt.json
```

The probe performs exactly three GETs: public health, unauthenticated readiness denial, authenticated readiness. Redirects are refused, responses are bounded, errors omit provider text and credentials, and receipts never overwrite old evidence. Maintenance is never invoked. Deployment protection must already permit this exact approved request path; do not disable it to make the probe pass. Missing access remains a concrete prerequisite.

## Service operations

See [SERVICE-OPERATIONS.md](../../../docs/integration/proposed/completion-20261026/integration/cloud-activation/SERVICE-OPERATIONS.md) for the non-backup operational acceptance. The existing `/api/v1/internal/maintenance` endpoint performs bounded cleanup and must not be used as a health probe. The source five-minute cron and dashboard Enabled checkbox do not establish a scheduled job or successful execution.

Readiness does not prove email delivery, private Blob access, account/provider pairing, current desktop sync/routine contracts, feedback readback or alert delivery. Those remain actual J5/operating acceptance. No current production, secret, monitor, billing, backup or deployment action was performed by this local source update.

## Recovery before real users

The new production Neon has seven-day restore history, fixed0.25 CU and a usage-based budget target. Its synthetic earlier-marker branch restore and migration hashes passed; both test branches were removed (see the production resource receipt). Never overwrite the live branch to test recovery. Check schema hashes and ownership boundaries again for a real cutover. Keep `AUX_DATA_ENCRYPTION_KEY` and signing/session secrets in controlled provider secret storage: a database restore alone cannot recover wrapped data after its wrapping key is lost. Key retention/rotation must be part of the recovery procedure.

Database recovery alone does not restore deleted private Blob objects. The current twelve-schema hosted drill now verifies encrypted snapshot recovery together with durable attachment and private avatar readback in a separate private Blob store. Independent backup storage, key custody, retention deletion, scheduling and alerts remain unconfigured; this drill does not establish operating disaster recovery. Existing cleanup and account-deletion semantics must remain explicit; do not silently retain deleted user content in an unbounded backup.

Local encrypted capture/unpack tooling is documented in [recovery.md](recovery.md). It exports one database snapshot plus verified referenced private files and seals the wrapping key with an independent recovery key. The local operator runner now implements authenticated delivery retries and explicit per-job expiry cleanup. Its real read-only current12-schema capture/delivery/unpack check passed with29 empty application tables; see `../evidence/backup-job-empty-production.json`. That check did not import a database or restore files. The later current-schema hosted restore is recorded below. Remote R2 transport is implemented with local protocol evidence, but actual provider acceptance, independent key custody, scheduling, alerts and operational cutover remain unfinished.

The historical eleven-schema drill is recorded in `../evidence/isolated-recovery-restore.json`. The later [current twelve-schema hosted drill](../../../docs/integration/proposed/aux-cloud-hosted-restore-12/evidence.json) passed the full online capture and isolated restore CLIs: actual exported PostgreSQL snapshot and Neon archive import, all twelve migration hashes, separate private Blob attachment/avatar readback, quarantine, preserved recovery/key/generation state and original CSK decryption. All generated source and target fixtures, the temporary branch and private local material were removed. This verifies current-schema hosted cross-store restoration; it does not establish independent backup operations, post-snapshot external-state reconciliation or service cutover.

For an application rollback, choose a previously verified deployment with compatible additive schema, then repeat protected readiness and a disposable auth/sync check. Do not use a rollback to undo account revocations, refunds or schema migrations. The completed isolated cross-store drill does not establish production traffic cutover, rollback, external alert delivery or production promotion.
