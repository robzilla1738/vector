# Cloud operations

The active service is Development/Preview at `https://dev-cloud.getaux.co`. Production resources are not configured. The accepted local desktop is unchanged; an unsigned cloud package is a separate candidate.

## Deployment checks

`pnpm build` checks environment configuration before compiling. It pins the database hostname and app/API origins, checks provider test/live mode, rejects unrelated allowed web origins and validates auth/encryption/cron key formats. `VERCEL_ENV=production` or `VERCEL_TARGET_ENV=production` refuses to build while `config/deployment-resources.json` has no production entry. Once separate Aux production resources exist, record their actual reviewed database/origins there; never copy the development entry. This is a configuration safeguard, not proof that provider credentials belong to the intended account or that backup/recovery is configured.

Applied migrations are immutable. The checked-in `src/schema-manifest.json` pins every current SQL migration. After adding and reviewing a new migration, regenerate the manifest from `migrationInventory()` in `scripts/check-environment.mjs`, apply the migration in the intended environment, and deploy. The build refuses a stale manifest; never edit an applied SQL file to repair a deployed migration.

## Monitoring

- `GET /api/v1/health` is public liveness only; it does not test any dependency.
- `GET /api/v1/internal/readiness` requires `Authorization: Bearer <CRON_SECRET>`. It reads only `aux_migrations`, compares every required name/hash, and returns200 when the database/schema match or503 on mismatch/unavailability. It changes no records and makes no paid provider calls. It accepts later additive migrations so an older compatible build can be rolled back.
- `GET /api/v1/internal/maintenance` uses the same authentication and performs bounded cleanup. Existing Preview checks invoke it explicitly; platform cron runs only for Production. Keep the secret in the monitor's private header configuration, never in a URL or public client.

Readiness does not prove Clerk/email delivery, Stripe reconciliation, Blob availability, Gateway access, retention, backup coverage or desktop behavior. Monitor provider delivery failures and Vercel function errors separately; do not log request bodies, tokens or raw provider/database errors. No external monitor or paid log drain is configured yet.

## Recovery before real users

Configure and verify the separate production Neon's restore window and resource budget, then perform a restore into a new isolated branch with synthetic data. Never overwrite the live branch to test recovery. Check the restored schema hashes and ownership boundaries before a cutover. Keep `AUX_DATA_ENCRYPTION_KEY` and signing/session secrets in controlled provider secret storage: a database restore alone cannot recover wrapped data after its wrapping key is lost. Key retention/rotation must be part of the recovery procedure.

Database recovery does not restore deleted private Blob objects. Configure a separately reviewed object-retention/backup strategy and exercise a synthetic encrypted snapshot/attachment recovery spanning both stores before claiming disaster recovery. Existing cleanup and account-deletion semantics must remain explicit; do not silently retain deleted user content in an unbounded backup.

For an application rollback, choose a previously verified deployment with compatible additive schema, then repeat protected readiness and a disposable auth/sync check. Do not use a rollback to undo account revocations, refunds or schema migrations. No production recovery drill, external alert delivery or production promotion is claimed by these source changes.
