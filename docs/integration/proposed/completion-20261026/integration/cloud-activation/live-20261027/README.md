# Production activation, 2026-10-27

Owner-approved ("get that live").

1. `AUX_READINESS_SECRET` generated without display, stored in Vercel Production (sensitive) and in 1Password Agents ("Aux cloud readiness secret").
2. Schema: the 12 production `aux_migrations` names and hashes matched the source; migration 013 (additive: terms and purge columns, feedback purpose, lookup indexes) applied in one transaction under the migrator's advisory lock and recorded.
3. Deploy: `vercel deploy --prod --skip-domain` from `services/aux-cloud` → `dpl_3rxb4gkNuPWps6iC9vAo4t2Nk2Ua` (READY; the build's production environment check passed).
4. Aliases: `api.`, `app.` and `share.getaux.co` moved from `aux-cloud-9oc52fmgn` to `aux-cloud-2urdeebuy` (`aliases-before.json`). `dev-cloud.getaux.co` and `aux-cloud.vercel.app` were left on the previous deployment.
5. Readiness on `https://api.getaux.co` passed (`live-readiness.json`): 13 migrations, current schema manifest, payments and hosted AI off; unauthenticated readiness returns 401.
6. Public pages: `/`, `/docs`, `/community`, `/policy/terms`, `/policy/privacy`, `/sign-up` return 200 on `app.getaux.co`; an unknown share returns 404; share pages carry the strict CSP and `noindex`; billing returns the free plan; the AI catalog is empty.

Rollback: re-point the three aliases to `aux-cloud-9oc52fmgn-robzilla1738s-projects.vercel.app`.

Not done here: J5 needs a cloud-enabled desktop build (this candidate is local-only, D1) and email codes to the owner's test inboxes; an external uptime monitor needs an account choice.

## Promotion (owner approved, 2026-10-27)

The `--skip-domain` deploy never registered the maintenance cron (`vercel crons list`: not deployed). A normal `vercel deploy --prod` of the same source produced `dpl_FCyG1B6SzBg4CTUSYpwru7krBxHo` and registered it. All five aliases now point to it, `dev-cloud.getaux.co` and `aux-cloud.vercel.app` included. Readiness passed again (`promoted-readiness.json`). The first scheduled run, at 20:50 Central, returned 200 with `aux.maintenance.completed`, `ok: true` and no failures.

Rollback: re-point the aliases to `aux-cloud-9oc52fmgn-robzilla1738s-projects.vercel.app` (pre-activation) or `aux-cloud-2urdeebuy` (same source, no cron).
