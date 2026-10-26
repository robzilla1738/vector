# Exact deployment, schema and rollback proposal

This sequence is for later explicit approval. None has been executed by this packet. Its source is the pinned service tree in `source-pins.json`, not a redeploy of the older reported deployment.

## Before the first write

Record the current personal team/project, deployment IDs, aliases/environment targets, schema hashes and project cron state through payload-free metadata. Current actual Production deployment dpl_4xeJYrXuU has api/app/share/dev-cloud.getaux.co plus both recorded Vercel-generated aliases. Read-only Edit confirms dev-cloud currently selects **Production**, and Production automatic domain assignment is checked. The development target is not currently identified. Verify it uses the existing development resource profile; do not replace it with a guessed historical deployment. Production promotion waits until dev-cloud is excluded from Production automatic assignment and bound to a verified intended Development/Preview target under the same explicit change approval.

Owner/operator verifies existing configuration through the exact destinations; all six previously omitted names are present. Do not restore or replace keys on the superseded incomplete-API inventory claim. The deployment process receives only Aux Production secrets; it must not fall back to `.env.local` or pull Development credentials. Do not run the historical development checks with Production secrets. `check-readiness.mts`, provider-auth and recovery-status deployed scripts contain development-only host/instance guards. `migrate-recovery-production.mjs` deliberately requires a null Production resource profile and is obsolete for the current configured profile. Do not bypass its guard or label it a current migration command.

Approve a **project-specific maintenance-cron hold** while schema/deployment is reconciled. The source cron invokes `/api/v1/internal/maintenance` every five minutes. This can purge expired/deleted data and keep small Neon compute awake. Domain skipping is not proof that cron execution is paused. The actual cron feature checkbox is Enabled but the page shows GetStarted and no job rows; this is not an established job or invocation census. Record existing running invocations and observe them finish; disabling a schedule is not cancellation of work already running. Vercel's [cron management documentation](https://vercel.com/docs/cron-jobs/manage-cron-jobs) also states that an Instant Rollback does not update active cron schedules.

## Conditional schema proposal

Use the exact production pooler and project/branch above. Compare every existing aux_migrations name/hash with the twelve source entries, without emitting connection strings or row contents. Historical production already has all twelve; if they still match, **make no schema change**.

If a required migration is genuinely absent, stop for the exact missing-file/write review. Preserve an independently recoverable current snapshot and owner-held wrapping/recovery keys before any DDL. Where practical use the single approved O1 capture/output for this prerequisite; do not run a second backup simply to repeat old evidence. A non-fixture production database requires explicit full-content capture authorization. A hash mismatch is not permission to overwrite aux_migrations, drop a table or rerun changed SQL.

The existing current migrator, if a missing migration is approved, is `node scripts/migrate.mjs` from services/aux-cloud, with a securely supplied exact Production process environment. Run the source Production `check-environment.mjs` preflight in that same protected environment first (VERCEL_ENV and VERCEL_TARGET_ENV both production; both launch flags false). Do **not** use `pnpm migrate`, whose package command reads `.env.local`. The migrator applies only missing hash-matched files under its existing advisory lock and per-file transaction. Migration12 is additive, with no key/account reset. Never perform SQL down-migrations or restore the primary database as a deployment rollback.

## Source deployment and activation

Use a clean reviewed checkout/service tree and its pinned pnpm lock. Existing local linking metadata names aux-cloud and the correct team/project; actual read-only UI now confirms empty Root Directory, Node24.x and Next.js with `pnpm build` /`pnpm install --frozen-lockfile` config overrides (desktop/vercel-metadata-a1). The project Git settings explicitly report no connected Git repository; the deployed source label main/6fe912d is deployment metadata, not proof of configured Git tracking. The service root is services/aux-cloud with its existing Next.js/vercel.json, Node>=24 and pnpm11.27.1 contract. No new repository, project or resource is needed. Do not deploy a docs/native worktree's unrelated changes or claim that metadata alone proves uploaded bytes.

After the source/configuration/cron scope is approved, create a new Production-target deployment **without automatic domain promotion**. The official [CLI deploy reference](https://vercel.com/docs/cli/deploy) supports this form:

```sh
vercel deploy --prod --skip-domain --cwd services/aux-cloud --scope robzilla1738s-projects
```

The intended account/team/project and actual root setting must be verified before running it. Do not pass secrets using --env/--build-env/--token, print build environment values, enable --public, or use --yes to bypass a changed recipient prompt. Record the returned real deployment ID/unique URL and the uploaded source/lock/resource inventory. Do not fabricate that ID in advance. A READY result is build evidence only.

Through the exact newly reviewed unique deployment (retaining deployment protection), perform bounded liveness and authenticated readiness checks. The readiness header is built in private request memory, never in argv/logs; send it only to the confirmed Aux deployment. Require 401 without it; require service aux-cloud, ready/current schema, zero mismatches and paymentsEnabled=false/hostedAiEnabled=false with it. Do not use the old development-only readiness script or compare its obsolete exact JSON shape. Inspect the actual deployed event protocol/routine routes and privacy boundaries during J5; readiness alone cannot certify the source contracts.

Promote only after the owner sees the current custom-domain set and the excluded dev-cloud binding. Intended custom Production aliases are exactly app.getaux.co, api.getaux.co, share.getaux.co; Vercel-generated project aliases remain separately recorded. Do not move getaux.co/www, marketing aux-web, Hostinger mail, registrar/nameservers or unrelated DNS. If a promotion would include dev-cloud or another unreviewed hostname, stop at the staged deployment. After the accepted code is serving, resume only the reviewed project maintenance cron and verify its exact target/source, one owned execution and no private log payloads.

The existing Clerk endpoint is reused, not recreated. Verify its five event selections and signing-secret pairing, then use only a new disposable session/user delivery in J5. No real owner webhook history is replayed. Production sign-in account creation, email delivery and fixture deletion require that separate bounded consent.

## Rollback that matches this source

Keep the old deployment immutable and record all before/after mappings. The reported 6fe deployment has not been verified for current event polling, versioned routine records or recovery/client contracts. Do **not** call it a safe rollback merely because it is READY or its readiness ignores additive newer migrations.

Before activation, nominate a source-compatible rollback deployment that has passed the required current wire/schema behavior, or obtain an explicit fail-closed/unavailable-service disposition if no such deployment exists. No validated compatible Production rollback ID is recorded today. This is a concrete unresolved approval field, not a fabricated fallback.

On a failed activation: hold new traffic/writes and stop only the reviewed new project cron as approved; account for already-running jobs. Repoint only reviewed aliases to the verified compatible artifact, or hold the service unavailable under the selected disposition. Preserve every existing database row, wrapping/auth key, ciphertext and backup intent. Do not restore the whole primary database or reset sync generations/credentials to make old code work. An isolated restore/cutover needs actual quiescence, source/target approval and accepted data-loss/recovery boundaries. Runner rollback independently disables timers/stops owned units while retaining exact inode-bound state.
