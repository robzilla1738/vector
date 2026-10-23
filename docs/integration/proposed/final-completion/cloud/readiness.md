# CLOUD source/configuration handoff

Baseline `a6b54763f5203f9741f66ca787b4f79740492c93`; all work local. No provider/dashboard requests, environment-file reads, secret access, migration, deployment, provisioning or desktop/UI changes.

Concrete source corrections:

- Runtime CORS now trims configured origin lists, matching the existing build validator. Unknown origins remain denied. A real Hono OPTIONS fixture passed without DB/network access.
- Default payment-free attachment quota errors explain deletion/retry, not an unavailable larger Aux plan. Future explicit payment mode retains the existing copy and quota implementation. Existing paid records are preserved.

Unchanged server boundaries audited: Clerk-signed revocation/deletion and delivery-ID idempotency; deleted-account token denial; attachment owner/state/size/hash/expiry and quota enforcement; public share lookup/revoke; encrypted Drive/session/cookie CAS; generation-pinned sync recovery; default payment/hosted-spend guards. Historical acceptance remains linked in `docs/cloud/implementation-2026-10-22.md` and service evidence. Reading these boundaries does not constitute new runtime acceptance.

## Exact activation preparation

1. Pin the integrated source commit and `services/aux-cloud/src/schema-manifest.json` hashes. Current source has twelve migrations. Preserve an independently recoverable backup before any future schema write. No migration added by this lane.
2. Sole operator verifies the personal Vercel team/project `aux-cloud`, production Neon `ancient-river-76453764`/pooled endpoint in `config/deployment-resources.json`, private Blob `store_UUr9bRkRQm4lu0Z2`, intended Aux production Clerk instance and webhook, and Aux Resend sender. Secret values must stay in matching Production destinations. Existing metadata is not fresh dashboard verification.
3. Build with actual Production configuration through `scripts/check-environment.mjs`. Set `AUX_PAYMENTS_ENABLED=false`, `AUX_HOSTED_AI_ENABLED=false`; no Stripe or Gateway key is a launch requirement. Verify public origins/callbacks exactly `app.getaux.co`, `api.getaux.co`, `share.getaux.co`; keep marketing and Hostinger mail DNS intact. Production app/API currently require separately authorized activation; source/config alone is not deployment.
4. Under concrete deployment approval, deploy exact source, inspect protected readiness/current migration hashes, then activate only the reviewed app/API/share aliases and paired Clerk webhook destination. Compare default no-payment/no-hosted-spend capabilities in the deployed version, not only environment metadata.
5. One bounded disposable production journey covers real sign-in delivery (owner authorizes recipient), exchange/refresh/revocation, two independent sessions' CAS conflict, private attachment/avatar, synthetic share/revoke, and disposable deletion. No inference is needed for these checks. Delete only recorded fixtures; do not resend the previously delivered development sign-in email merely to repeat evidence.
6. Enable the separately reviewed runner and independent health/backup alerts only after provisioning/source-access approvals. See the executable prepared artifacts in `services/aux-cloud/ops/backup-runner/`.

Rollback: keep the prior deployment immutable, remove/repoint only the new app/API/share aliases under approved scope, preserve existing database/wrapping keys and stored ciphertext. Readiness tolerates additive newer migrations; do not blindly downgrade/restore a live database. Restoring/cutting over requires the reviewed isolated restore procedure and source quiescence/accepted RPO, not deployment rollback alone.

## Truthful support/onboarding copy for existing surfaces

“Aux has no payment plan at launch. Connect your own AI-provider key or an eligible ChatGPT/Codex connection. Provider billing, limits and availability remain with that provider. Provider credentials belong in Aux’s protected local provider controls; never send them to support.”

“Cloud account, sync and public sharing are separate from your provider subscription. Shared transcripts are accessible to anyone with their link until revoked. Review what you share. Cloud sync/recovery includes server-wrapped recovery support; do not describe it as ciphertext that Aux’s backend can never decrypt.”

“Hosted speech and unsupported ChatGPT image operations are unavailable unless an accepted provider path is configured; text-model success does not establish voice or image support.”

These are source-supported copy proposals, not new screens, published policies or legal advice. Root owns the marketing-host `/policy/terms`, `/policy/privacy`, `/docs` and `/community` routing/content publication; this lane creates no fabricated legal documents or unrelated cloud pages.
