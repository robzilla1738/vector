# Service operating acceptance — backups excluded

Preparation only. No deployment, schedule, monitor, recipient, credential, production operation or account was changed. These checks complete the existing service; they do not create another service or reopen the owner-deferred backup workstream.

## Exact operating actions to include in the activation review

1. **Readiness:** privately configure the approved existing monitor to request the exact accepted API deployment's `/api/v1/internal/readiness` with its scoped internal header. Require HTTP200, current source schema digest/count and both spend flags false; check every five minutes, alert after two consecutive failures and send one recovery notification. A public health200 alone is insufficient. The receiver/operator and current monitoring provider/account must be confirmed before configuration; do not invent an email, add a paid provider or reuse a backup monitor.
2. **Maintenance:** inventory the actual Aux project's cron jobs and running invocations. Only its existing source `/api/v1/internal/maintenance`, every five minutes, is proposed. This endpoint can purge expired/deleted data; obtain the exact cron hold/resume and one bounded operating check in the activation approval. Preserve unrelated schedules. After the reviewed current-source deployment, observe one real scheduled success with safe counts and deployment identity. Do not call the endpoint merely to test availability or repeat purges for evidence.
3. **Error alert:** route the existing platform function errors and maintenance failures to the confirmed service operator, using safe error codes and no request bodies, cookies, provider errors, private report content or tokens. Verify one configured test alert and recovery delivery. Do not break production auth/database or introduce a public fault-injection endpoint. Record actual monitor/platform support rather than claim a test-notification button exercises a real service failure.
4. **Rollback:** use `DEPLOYMENT.md`'s nominated compatible previous deployment and exact alias map. Verify one permitted staged/unserved transition and its protected readiness/current client contracts before activation. If no compatible predecessor exists, the owner must select the existing fail-closed disposition. A READY older deployment with incompatible event/routine protocols is not a fallback. Reconcile the cron schedule separately; no database down-migration, generation/key reset or primary restore occurs.
5. **Custody and support:** record the responsible service operator, current provider costs/limits, the intended support route, and approved privacy/retention text. Verify existing secrets are bound to the correct project/environment without revealing or rotating them. Provider account access and actual email delivery are covered by the bounded J5 consent. Public `/docs`, `/community`, `/policy/privacy` and `/policy/terms` must return the reviewed content; drafts and unknown legal/operator facts cannot be presented as approved policies.

## Remaining concrete inputs

- Exact staged deployment and source-compatible rollback ID (or explicit unavailable-service rollback disposition), plus dev-cloud's independently verified intended target.
- Approved synthetic sign-in recipients/accounts and cleanup from J5.
- Existing service monitoring provider/account, service operator and confirmed notification recipient; actual protected-deployment access method.
- Confirmed legal operator/contact, distribution rights, privacy/retention decisions and terms approval for public copy and the prepared ChatGPT eligibility request.

These are new factual/authority gates only where not already covered by an applicable recorded approval. No backup administrator, CIDR, runner, server billing, recovery-key retrieval or backup notification question is included. External completion remains open; local desktop acceptance continues independently.
