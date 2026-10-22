# Separate Aux production resources

Prepared2026-10-22; owner approved and bootstrap executed2026-10-22. Exact requested bootstrap: [plan.json](plan.json). Nonsecret execution receipt: [execution.json](execution.json). This bootstrap does not activate production, change the accepted desktop or represent production readiness.

## Executed bootstrap

Created separate Neon `aux-cloud-prod` (`ancient-river-76453764`, Vercel `store_mK6YWm9VwmXhdUDF`) and private Blob `aux-private-prod` (`store_UUr9bRkRQm4lu0Z2`). Both connections are only to `aux-cloud` Production. Neon is Postgres18/us-east-1/Launch, fixed0.25 CU with five-minute autosuspend, seven-day history, Auth and Realtime off. Neon initially provisioned its1 CU default; this was corrected before migrations or synthetic checks. New branch compute defaults are also fixed0.25 CU.

Verified the database was empty before applying001–011; all11 applied hashes match the immutable manifest. Generated independent production authentication, data-encryption and cron secrets and stored them as Vercel Secrets, Production only. Existing production Clerk/Resend secrets were not pulled or used; their exact recipient bindings still need revalidation before production use.

The1MiB private Blob upload/read/hash/delete passed, with no fixture remaining. The first historical-branch probe returned the later marker and was rejected. A corrected earlier-minute branch returned the earlier marker and all11 exact migration hashes. Both disposable branches used0.25 CU with one-hour expiry and were deleted after checks; the primary synthetic table was dropped. This verifies a narrow database point-in-time branch recovery, not Blob recovery or full disaster recovery.

`config/deployment-resources.json.production` stays null. No production deployment, alias, live payment change, funded AI request, desktop signing or desktop UI change occurred. Current local private bootstrap material is ignored by Git and mode0600; a durable wrapping-key recovery arrangement remains outstanding.

## Proposed action

Create `aux-cloud-prod` as a new Neon Launch project/database, Postgres18 in AWS us-east-1, fixed0.25 CU min/max and five-minute autosuspend. Turn off bundled Neon Auth/Realtime because Aux uses Clerk and its own compatible service. Set a seven-day instant-restore history window if the existing Marketplace Launch subscription supports the published setting without an additional plan upgrade. Do not clone development or owner data. Create private Vercel Blob `aux-private-prod` in iad1.

Connect only these new resources to `aux-cloud` Production. Keep Development/Preview connected to their current resources. Store the new connection credentials privately and generate separate production `AUX_AUTH_SECRET`, `AUX_DATA_ENCRYPTION_KEY` and `CRON_SECRET`; never copy the development secrets. Existing Aux production Clerk/Resend credentials remain assigned to their current Production environment. Their exact Aux instance/domain bindings must be reverified before use; unrelated keys remain untouched.

Before creating anything, check the actual account/team/project and resource inventory for an existing matching Aux production resource. Reuse a verified exact intended resource rather than creating a duplicate. If an operation returns an unknown outcome, inspect its authoritative state before retrying. Actual assigned resource IDs/hostnames must replace placeholders in a later connection receipt; never invent them or fill the production build profile from the development profile.

## Costs and limits

Initial incremental database/private-storage target: **$25/month**, not a hard provider cap. At the currently published Launch rate of$0.106/CU-hour, a continuously awake0.25 CU compute costs$19.716 in a31-day month. Database storage is$0.35/GB-month; retained history is separately$0.20/GB-month of retained changes. Seven days of history is not a flat-price backup package. These figures exclude traffic growth, taxes, future scaling, extra branches and other services. The existing Vercel Pro subscription and separate approved AI test budget are outside this target. [Neon prices](https://neon.com/pricing), [history window](https://neon.com/docs/postgres/backup-restore/history-window).

Vercel Blob is usage-based against the team's available Pro credit, then on demand: the currently shown iad1 pricing includes$0.023/GB-month storage,$0.40/million simple operations,$5/million advanced operations and$0.05/GB Blob transfer; additional CDN/function/transfer charges can apply. Creation is itself one advanced operation. Do not present the monthly target or storage quotas as a guarantee against all billable traffic. [Blob prices](https://vercel.com/docs/vercel-blob/usage-and-pricing).

Fixed0.25 CU is an intentionally small initial environment, not demonstrated capacity for arbitrary real-user traffic. Later capacity changes need actual load evidence and a revised budget. Current five-minute production maintenance would tend to keep a five-minute-autosuspend compute awake; cost estimates therefore include the continuously awake case. Avoid adding frequent DB-backed monitors under the assumption that autosuspend makes their cost zero. Do not change team-wide pause controls, because they can affect the existing marketing site and unrelated projects.

## Bounded setup evidence

1. Apply the current immutable migrations only to the new empty database. Compare every applied migration hash with the source manifest.
2. Seed only synthetic recovery markers. Restore a new short-lived branch from an earlier synthetic point, check expected schema/marker state and preserve the primary branch. The restore branch must expire within one hour and stay at0.25 CU. Delete only the generated markers/branch after retaining nonsecret proof. If the provider cannot perform the expected isolated restore within this scope, report the gap; never reset the primary branch.
3. Upload/read/hash/delete at most10MiB of generated synthetic bytes in the new private Blob store. Verify that its store is separate from development and bound only to Aux Production. Do not make it public.
4. Record actual resource IDs, settings, bindings and successful fixture cleanup, without connection strings/tokens. Keep production build configuration null until its exact origins/resources/credentials and remaining dependencies are reviewed. No production deployment/domain alias is part of this bootstrap.

Database restore does not restore removed Blob content or recover a lost wrapping key. A durable cross-store backup/retention design, key recovery procedure and actual restore drill remain required before a production-ready claim. The above synthetic branch/storage checks are narrower acceptance and must be labeled accordingly.

## Steps that remain after this bootstrap

- Owner creates/selects an Aux-specific live Stripe business account and completes legal/KYC/banking directly. Existing Joyflow live billing stays untouched. Then add Aux-only live products/prices/portal and signed webhook credentials through a separate concrete setup, before enabling `AUX_LIVE_BILLING=true`.
- Verify real OTP delivery through the actual Resend/native flow with owner participation. Clerk reserved test-code acceptance is already recorded and does not establish inbox delivery.
- Complete the separately pending Gateway AI Product Terms consent/purchase and bounded funded ZDR checks; the test cap remains$5. Production model traffic/budgets must be deliberately configured before real users.
- Execute the exact local cloud signing plan only after its pending scoped approval, then verify actual native cloud sign-in, AI/speech, sync/recovery, sharing and attachments with disposable state. Preserve current UI. Cookie restoration remains a distinct implementation gap.
- Complete private-object recovery, external alert delivery and the final production configuration review. Stage/verify the production backend only after those inputs are concrete; final desktop release remains excluded.

The new recurring-resource budget and Production credential connections need explicit approval because earlier storage approval covered Development/Preview only. No skill or automatic approval rejection is imposing an additional approval: this is a new paid environment and new credential recipient scope.
