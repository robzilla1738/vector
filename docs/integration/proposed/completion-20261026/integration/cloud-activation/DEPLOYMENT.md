# Exact deployment, schema and rollback proposal

## Run order (summary, 2026-10-27)

**Owner fills first** in `approval-record.pending.json`. The backup fields under `o1` stay deferred and are not needed.
- `serviceOperations.serviceOperator`, `serviceOperations.confirmedNotificationRecipient` and `serviceOperations.monitorProviderAccount`
- `serviceOperations.activationApproved: true`
- either `c1.compatibleRollbackDeploymentId`, or `c1.failClosedRollbackDispositionApproved: true` (no compatible rollback exists today)

**Then, in order** (each step is detailed below):
1. **Metadata:** record team, project, deployments, aliases and cron state, payload-free.
2. **Cron hold:** hold the maintenance cron (every 5 min) and let running invocations finish.
3. **Schema:** read-only comparison of `aux_migrations` against the 12 pinned hashes. If they match, change nothing.
4. **Deploy:** `vercel deploy --prod --skip-domain --cwd services/aux-cloud --scope robzilla1738s-projects` from a clean checkout matching `source-pins.json` (refreshed 2026-10-27; 222 files; local typecheck and 63/63 tests pass). Record the deployment ID.
5. **Readiness:** on the unique URL, expect 401 without the header. With it, expect `aux-cloud`, the current schema, and `paymentsEnabled=false` / `hostedAiEnabled=false`.
6. **Aliases:** move exactly `app.`, `api.` and `share.getaux.co`. Leave `dev-cloud` and everything else as they are.
7. **Resume cron:** resume the maintenance cron.
8. **J5:** run the 11-step hosted test (`J5.md`). It also proves the four public pages that return 404 today.
9. **Operations:** set up the monitor (every 5 min, alert after 2 failures), the error alert and the rollback record (`SERVICE-OPERATIONS.md`).


This sequence is for later explicit approval. None has been executed by this packet. Its source is the pinned service tree in `source-pins.json`, not a redeploy of the older reported deployment.

## Before the first write

Record the current personal team/project, deployment IDs, aliases/environment targets, schema hashes and project cron state through payload-free metadata. Current actual Production deployment dpl_4xeJYrXuU has api/app/share/dev-cloud.getaux.co plus both recorded Vercel-generated aliases. Read-only Edit confirms dev-cloud currently selects **Production**, and Production automatic domain assignment is checked. The development target is not currently identified. The smallest activation preserves dev-cloud exactly on its recorded current Production deployment and treats it as Production. Do not use that hostname as an isolated test environment. Stage with domain promotion skipped, then change only the three explicit app/api/share aliases; do not use a broad promotion operation. A genuine Development/Preview reassignment requires a separately identified target and explicit domain-change approval, but is not needed to accept the three Production service aliases.

Owner/operator verifies existing configuration through the exact destinations; all six previously omitted names are present. Do not restore or replace keys on the superseded incomplete-API inventory claim. The deployment process receives only Aux Production secrets; it must not fall back to `.env.local` or pull Development credentials. Do not run the historical development checks with Production secrets. `check-readiness.mts` now requires an explicit reviewed deployment/environment and only its internal header; the provider-auth and recovery-status deployed scripts remain development-only. Do not remove those guards to reuse their account mutations in Production. `migrate-recovery-production.mjs` deliberately requires a null Production resource profile and is obsolete for the current configured profile. Do not bypass its guard or label it a current migration command.

Approve a **project-specific maintenance-cron hold** while schema/deployment is reconciled. The source cron invokes `/api/v1/internal/maintenance` every five minutes. This can purge expired/deleted data and keep small Neon compute awake. Domain skipping is not proof that cron execution is paused. The actual cron feature checkbox is Enabled but the page shows GetStarted and no job rows; this is not an established job or invocation census. Record existing running invocations and observe them finish; disabling a schedule is not cancellation of work already running. Vercel's [cron management documentation](https://vercel.com/docs/cron-jobs/manage-cron-jobs) also states that an Instant Rollback does not update active cron schedules.

## Conditional schema proposal

Use the exact production pooler and project/branch above. Compare every existing aux_migrations name/hash with the twelve source entries, without emitting connection strings or row contents. Historical production already has all twelve; if they still match, **make no schema change**.

If a required migration is genuinely absent, stop for the exact missing-file/write review. Backups are owner-deferred. Do not start backup preparation or a schema write under this activation scope; report an unexpected schema dependency for a separately scoped decision. The expected no-DDL path continues without a backup workstream. A hash mismatch is not permission to overwrite aux_migrations, drop a table or rerun changed SQL.

The existing current migrator, if a missing migration is approved, is `node scripts/migrate.mjs` from services/aux-cloud, with a securely supplied exact Production process environment. Run the source Production `check-environment.mjs` preflight in that same protected environment first (VERCEL_ENV and VERCEL_TARGET_ENV both production; both launch flags false). Do **not** use `pnpm migrate`, whose package command reads `.env.local`. The migrator applies only missing hash-matched files under its existing advisory lock and per-file transaction. Migration12 is additive, with no key/account reset. Never perform SQL down-migrations or restore the primary database as a deployment rollback.

## Source deployment and activation

Use a clean reviewed checkout/service tree and its pinned pnpm lock. Existing local linking metadata names aux-cloud and the correct team/project; actual read-only UI now confirms empty Root Directory, Node24.x and Next.js with `pnpm build` /`pnpm install --frozen-lockfile` config overrides (desktop/vercel-metadata-a1). The project Git settings explicitly report no connected Git repository; the deployed source label main/6fe912d is deployment metadata, not proof of configured Git tracking. The service root is services/aux-cloud with its existing Next.js/vercel.json, Node>=24 and pnpm11.27.1 contract. No new repository, project or resource is needed. Do not deploy a docs/native worktree's unrelated changes or claim that metadata alone proves uploaded bytes.

After the source/configuration/cron scope is approved, create a new Production-target deployment **without automatic domain promotion**. The official [CLI deploy reference](https://vercel.com/docs/cli/deploy) supports this form:

```sh
vercel deploy --prod --skip-domain --cwd services/aux-cloud --scope robzilla1738s-projects
```

The intended account/team/project and actual root setting must be verified before running it. Do not pass secrets using --env/--build-env/--token, print build environment values, enable --public, or use --yes to bypass a changed recipient prompt. Record the returned real deployment ID/unique URL and the uploaded source/lock/resource inventory. Do not fabricate that ID in advance. A READY result is build evidence only.

Through the exact newly reviewed unique deployment (retaining deployment protection), perform bounded liveness and authenticated readiness checks. The readiness header is built in private request memory, never in argv/logs; send it only to the confirmed Aux deployment. Require 401 without it; require service aux-cloud, ready/current schema, zero mismatches and paymentsEnabled=false/hostedAiEnabled=false with it. Use the corrected scoped `check-readiness.mts` procedure in `services/aux-cloud/docs/operations.md`; it requires the verified deployment/environment review and emits a new bounded receipt. Its schema count/digest must match this source. No production credential is needed for local fixtures; later actual probing still needs the scoped private header and protected-deployment access. Inspect the actual deployed event protocol/routine routes and privacy boundaries during J5; readiness alone cannot certify the source contracts.

Apply the three explicitly approved alias changes only after the owner sees their exact before/after deployment IDs and the preserved dev-cloud binding. Intended custom Production aliases are exactly app.getaux.co, api.getaux.co, share.getaux.co; Vercel-generated project aliases remain separately recorded. Do not move getaux.co/www, marketing aux-web, Hostinger mail, registrar/nameservers or unrelated DNS. A broad project promotion or automatic assignment change is outside this narrower proposal. If the available operation would also move dev-cloud or a Vercel-generated/unreviewed alias, stop at the staged deployment. After the accepted code is serving, resume only the reviewed project maintenance cron and verify its exact target/source, one owned execution and no private log payloads.

The existing Clerk endpoint is reused, not recreated. Verify its five event selections and signing-secret pairing, then use only a new disposable session/user delivery in J5. No real owner webhook history is replayed. Production sign-in account creation, email delivery and fixture deletion require that separate bounded consent.

## Rollback that matches this source

Keep the old deployment immutable and record all before/after mappings. The reported 6fe deployment has not been verified for current event polling, versioned routine records or recovery/client contracts. Do **not** call it a safe rollback merely because it is READY or its readiness ignores additive newer migrations.

Before activation, nominate a source-compatible rollback deployment that has passed the required current wire/schema behavior, or obtain an explicit fail-closed/unavailable-service disposition if no such deployment exists. No validated compatible Production rollback ID is recorded today. This is a concrete unresolved approval field, not a fabricated fallback.

On a failed activation: hold new traffic/writes and stop only the reviewed new project cron as approved; account for already-running jobs. Repoint only reviewed aliases to the verified compatible artifact, or hold the service unavailable under the selected disposition. Preserve every existing database row, wrapping/auth key, ciphertext and backup intent. Do not restore the whole primary database or reset sync generations/credentials to make old code work. An isolated restore/cutover needs actual quiescence, source/target approval and accepted data-loss/recovery boundaries. Backups and runner operations remain deferred and untouched.
