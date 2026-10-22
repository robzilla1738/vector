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
- Migrations001–010 applied to the actual development database: identities/sessions, encrypted sync, billing pools, private attachment intents/bindings, refresh retry cache and conservative sync GC.
- `aux-private-dev` connected only to Development/Preview, with OIDC plus a private server read/write token.
- Restricted key `Aux cloud development` created in Stripe sandbox `acct_1UTDA5GzjaZQfViz`. Two Aux products, four sandbox prices and one customer portal configuration created. No live payments or changes to existing resources.
- Auth/encryption/cron secrets generated privately for Development/Preview. No credentials in source/evidence documents.

## Current evidence

- Focused service tests cover malformed/unauthenticated requests, OTP/device/refresh cryptography, encryption binding, upload ranges and metering.
- Actual disposable PostgreSQL execution covers financial migration/functions and production reservation/refund SQL, including annual monthly grants and idempotency.
- Next production build passes before final runtime integration; repeat after final integration edits.
- Source-pinned opt-in adapters pass focused count/hash/crypto checks. They are not yet staged into the actual browser.
- Gateway catalog confirms GPT-6 Luna has ZDR endpoints on Azure/OpenAI. Actual request refused with403 because the team has promotional credits only; the $5 promotional balance is not paid-tier access. No inference spend incurred by these rejected requests. The one-time $10 top-up ($11.58 checkout total, approved up to $12) remains unsubmitted pending the checkout’s explicit AI Product Terms consent; auto-reload stays off.
- Both in-process and deployed real database/API/private-upload fixtures passed and removed their disposable records. Synthetic signed sessions do not substitute for actual email sign-in acceptance.

## Remaining acceptance, without narrowing the goal

1. Finish real DB/API/Blob fixture and cleanup; fix observed failures.
2. Deploy the separate protected cloud preview and create an Aux development hostname. Register and verify actual Clerk/Stripe webhooks. Run sandbox checkout/portal/cancellation/reconciliation.
3. Verify real email sign-in, refresh/retry/revoke, device approval and account lifecycle using disposable Aux state. Complete account portal plan selection and embedded checkout.
4. Enable paid Gateway access within owner-approved spending or obtain approval if minimum top-up exceeds $5. Verify text and synthetic dictation with actual ZDR routing metadata.
5. Integrate cloud origins, encryption, large-share and attachment recovery into the supplied stack, preserving UI/crypto contracts. Add safe encrypted chat/session discovery and restoration; do not restore another machine's execution authority.
6. Verify actual desktop sign-in, inference/dictation, two-device sync/conflict/recovery, sharing/revocation and attachment recovery. Preserve the existing UI and run only focused changed-boundary checks.
7. Production isolation: separate database/storage/secrets, webhook configuration, recovery/backups, monitoring and account/usage limits. Do not repurpose old projects or live Joyflow Stripe data. A live Aux payments business/account may require owner-only legal/identity steps.
8. Update STATUS and acceptance evidence; provide the built desktop for owner testing. No public desktop release or distribution.

## Deployed development acceptance — later 2026-10-22

- `dev-cloud.getaux.co` is verified and points to a Preview deployment. First Vercel deployment was automatically assigned Production despite the requested Preview target; its app/api/share domain aliases were removed. No existing marketing domain was changed. Provider/desktop acceptance remains development-only.
- Deployed API checks passed: real signed session/database identity, encrypted file objects, ETag reads/304, stale CAS/412, cross-account denial, public share publication/revocation, actual private Blob upload/hash/range/read/delete, free billing snapshot and session revocation. All generated database/Blob fixtures were removed. Evidence: `services/aux-cloud/evidence/deployed-boundaries.json`.
- Real Vercel routing exposed two platform issues and drove narrow fixes: normalize Next rewrite paths from matched params; carry conditional write headers as `X-Aux-If-Match` / `X-Aux-If-None-Match` until inside Hono, preserving server CAS checks while avoiding edge-generated304 on successful PUT.
- Actual Clerk/Svix signed `user.deleted` example appeared in the provider’s Succeeded filter and its receipt persisted in Aux. Both Clerk and Stripe reject unsigned requests. Actual Stripe sandbox subscription-created and canceled events reconciled through the deployed webhook without a payment method/charge. That disposable Stripe customer and local fixture rows were removed. Checkout payment/portal remains unverified. See provider-connections and stripe-lifecycle evidence.
- Encrypted session snapshots/restore, conflict/deletion handling, crash checkpoint/rollback and late parent/project association are implemented in source. Actual Neon ownership/CAS/tombstone/binding-isolation fixture passed and cleaned itself; original JSONL/turn reducers were exercised by focused fixtures. Actual desktop/two-device integration is still outstanding.
- Actual shipped1852 source audit found its `/drive` formatVersion2 contract differs from the newer extracted daemon’s `/sync/agent-files` contract. The newer adapters remain inactive. A separate exact-source1852 drive/session composition is being completed before any desktop cloud activation. Aux symbols in shipped code are branded (`fetchAuxAPI*`), so original-symbol fixture success is insufficient acceptance.
- Actual shipped auth, billing, catalog, Responses/SSE, image and dictation shapes match the backend; source follow-ups add the mandatory no-body profile metadata refresh and optional unauthenticated provider-catalog404 fallback. Large image/audio transport still needs adaptation beyond Vercel’s request-body boundary. Conditional legacy recovery has no stored recovery material and must not fabricate success; email sign-in is the implemented route, Google is not enabled.
- The existing desktop app, UI, owner profiles and signing are unchanged. Provider credential transfer files were removed after private environment configuration; a source scan against actual new credentials found no matches.

Actual1852 follow-up: `/drive` formatVersion2 per-file CAS and encrypted cookie capture/upload/delete adapters are implemented; migrations009–010 applied. Both real-Neon fixtures passed ownership, ciphertext validation, concurrent CAS, stale deletion and cookie tombstone ordering, with generated records removed. Complete actual shipped daemon composition now count-checks21 anchors, replays exactly and passes Node syntax checking; a replacement-string `$&` expansion defect found by that whole-artifact check was corrected. Default composition remains byte-identical local behavior. This is an uninstalled static review candidate, not actual desktop/cloud acceptance. The supplied1852 implementation has no cookie restore/import consumer; cross-device cookie restoration remains a distinct integration gap.
