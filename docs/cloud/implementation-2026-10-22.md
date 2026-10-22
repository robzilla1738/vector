# Aux cloud implementation and acceptance

Owner objective: complete sign-in, subscriptions, sync, sharing, hosted AI/speech and production preparation; preserve the existing desktop UI and existing provider data. No final desktop release, notarization or distribution. Work remains active until actual service and desktop behavior is verified.

## Product decisions

- Separate `services/aux-cloud` Next.js/Hono service; existing marketing site and desktop implementation remain intact.
- Clerk identities map to stable internal UUIDs. Compatible email-code and rotating desktop sessions preserve the supplied UI. Website sign-in does not silently sign in a browser profile.
- Neon relational data, private Blob attachments, explicit public publication/revocation. Sync content is encrypted before upload. Key custody is accurately `server_wrapped`, not an E2EE or KMS claim.
- Configurable Free/Pro/Max allowances; initial sandbox prices $20/$60 monthly and $200/$600 yearly, with $5/$20 monthly service credits. No unlimited hosted inference. Free includes a one-time $0.25 introductory allowance; BYOK remains available.
- Automatic off-session billing is disabled. Purchases require explicit checkout. Existing supplied auto-reload API returns an honest unavailable response.
- AI Gateway with server-held OIDC credentials and mandatory per-request ZDR. Owner selected GPT-6 Luna for bounded checks, at most $5 total. Default model is configurable `openai/gpt-6-luna`. A project-scoped $5, non-refreshing Gateway budget is set; provider budgets allow the final crossing request, so request/output limits also bound checks.
- Local-only adapters remain the default. Cloud origin/encryption/attachment adapters are count-checked opt-ins; releases/installers remain disabled.

## Actual completed configuration

- New Aux-only Clerk and Resend keys are stored in matching Vercel environments; old keys/projects unchanged.
- `aux-cloud-dev` is connected only to Development/Preview, 0.25 CU min/max with five-minute autosuspend.
- Migrations001–007 applied to the actual development database: identities/sessions, encrypted sync, billing pools, private attachment intents/bindings, refresh retry cache and conservative sync GC.
- `aux-private-dev` connected only to Development/Preview, with OIDC plus a private server read/write token.
- Restricted key `Aux cloud development` created in Stripe sandbox `acct_1UTDA5GzjaZQfViz`. Two Aux products, four sandbox prices and one customer portal configuration created. No live payments or changes to existing resources.
- Auth/encryption/cron secrets generated privately for Development/Preview. No credentials in source/evidence documents.

## Current evidence

- Focused service tests cover malformed/unauthenticated requests, OTP/device/refresh cryptography, encryption binding, upload ranges and metering.
- Actual disposable PostgreSQL execution covers financial migration/functions and production reservation/refund SQL, including annual monthly grants and idempotency.
- Next production build passes before final runtime integration; repeat after final integration edits.
- Source-pinned opt-in adapters pass focused count/hash/crypto checks. They are not yet staged into the actual browser.
- Gateway catalog confirms GPT-6 Luna has ZDR endpoints on Azure/OpenAI. Actual request refused with403 because the team has promotional credits only; the $5 promotional balance is not paid-tier access. No inference spend incurred by these rejected requests. Paid-credit minimum/top-up remains to be checked.
- Real database/API/private-upload fixture is in progress; do not substitute its synthetic sessions for actual email sign-in acceptance.

## Remaining acceptance, without narrowing the goal

1. Finish real DB/API/Blob fixture and cleanup; fix observed failures.
2. Deploy the separate protected cloud preview and create an Aux development hostname. Register and verify actual Clerk/Stripe webhooks. Run sandbox checkout/portal/cancellation/reconciliation.
3. Verify real email sign-in, refresh/retry/revoke, device approval and account lifecycle using disposable Aux state. Complete account portal plan selection and embedded checkout.
4. Enable paid Gateway access within owner-approved spending or obtain approval if minimum top-up exceeds $5. Verify text and synthetic dictation with actual ZDR routing metadata.
5. Integrate cloud origins, encryption, large-share and attachment recovery into the supplied stack, preserving UI/crypto contracts. Add safe encrypted chat/session discovery and restoration; do not restore another machine's execution authority.
6. Verify actual desktop sign-in, inference/dictation, two-device sync/conflict/recovery, sharing/revocation and attachment recovery. Preserve the existing UI and run only focused changed-boundary checks.
7. Production isolation: separate database/storage/secrets, webhook configuration, recovery/backups, monitoring and account/usage limits. Do not repurpose old projects or live Joyflow Stripe data. A live Aux payments business/account may require owner-only legal/identity steps.
8. Update STATUS and acceptance evidence; provide the built desktop for owner testing. No public desktop release or distribution.
