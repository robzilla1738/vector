# Cloud operations — current completion scope

The service has been live since 2026-10-27: every alias (`api.`, `app.`, `share.`, `dev-cloud.getaux.co` and `aux-cloud.vercel.app`) serves the Production deployment. `dev-cloud.getaux.co` is not an isolated Preview; it reaches the production database and Clerk, and production CORS refuses its origin. Current deploy state is in [docs/STATUS.md](../../../docs/STATUS.md). Existing Aux Production Neon/Blob resources and Clerk/Resend configuration are retained; do not provision duplicates or replace secrets based on older missing-variable reports.

The current activation procedure is [DEPLOYMENT.md](../../../docs/integration/proposed/completion-20261026/integration/cloud-activation/DEPLOYMENT.md), with one [J5 journey](../../../docs/integration/proposed/completion-20261026/integration/cloud-activation/J5.md). Local desktop completion is independent. Backups and their setup are owner-deferred; historical recovery notes below are not a work order or completion gate for this task.

## Deployment checks

`pnpm build` checks the target database hostname, app/API origins, provider modes, allowed web origins and auth/encryption/cron key formats. Aux takes no payments and funds no AI, so the service has no payment or hosted-AI code and no Stripe or Gateway settings; readiness always reports both launch flags false. Environment presence does not establish secret pairing, real delivery or live behavior.

Source has fourteen immutable migrations. 013 (account lifecycle) was applied to Production on 2026-10-27. 014 (`014-consent-and-share-blocks.sql`, additive: `aux_users.age_confirmed_at`, `shared_sessions.blocked_at`) was applied to Production on 2026-10-28 before the new code was deployed. The exact migration hash and both nullable timestamp columns were verified in Neon; all five aliases then reported `schema: current` with fourteen migrations. Receipt: [owner-ops-20261028](../evidence/owner-ops-20261028/summary.json). A genuine missing or mismatched migration needs a separate exact review, never a reset or a rerun of altered applied SQL.

`check-environment` requires `AUX_READINESS_SECRET` only for Production builds (`VERCEL_ENV` or `VERCEL_TARGET_ENV` = `production`), so Preview builds no longer need a copy of it. When the secret is set it must be at least 32 characters. `RESEND_FROM` must be a getaux.co sender, bare or with a display name; subdomains are allowed (the current value is `Aux <hello@notify.getaux.co>`).

Production-filtered dashboard evidence supersedes the older truncated inventory: all six previously omitted configuration names are present. Public app/API origins and false launch flags were observed; other public values and secret-recipient pairing remain unverified. `scripts/check-production-configuration.mjs` is a metadata aid, not proof of provider ownership or production readiness. Do not recreate fields from an incomplete API listing or reveal secret values into logs.

The remote Root Directory is empty, Node is24.x, and Git is disconnected. Upload only the reviewed `services/aux-cloud` tree with its lockfile/config; a reported Git label does not prove the deployed bytes. Keep the `.vercelignore` inclusion for `.pnpmfile.cjs`: the frozen lockfile records its checksum, and an upload without the hook fails installation. The live 2026-10-28 deployment is `dpl_DEH7Lvy3FXWXfTiznh2eXgDNEGxw` (`aux-cloud-qoue3815y`), built from the reviewed service tree in `4961b99d6` plus that upload inclusion; application source and lockfile are unchanged from the tested handoff. Preserve marketing and Hostinger mail DNS. Correct dev-cloud's actual environment/alias assignment within the explicit activation review before promoting Production.

## Read-only readiness acceptance

`GET /api/v1/health` is liveness. Authenticated `GET /api/v1/internal/readiness` reads migration metadata only and reports the expected schema count/digest, actual schema compatibility and both launch flags. It makes no provider calls or writes. Compatible later additive migrations remain allowed; this does not certify an old deployment's protocol compatibility.

The corrected `scripts/check-readiness.mts` requires an explicit target review and a new output path. It no longer guesses that dev-cloud is Development, loads `.env.local`, requires all provider secrets, or compares the obsolete response shape. A review records `format: aux.readiness-target.v1`, the existing project/team IDs, `environment: development|production`, exact HTTPS `origin`, actual `deploymentId`, and `assignmentVerifiedAt`. The operator must verify those facts against the intended deployment first. Only the matching API alias or the Aux project's unique deployment hostname is accepted; the target review is evidence, not authorization.

Readiness accepts only `AUX_READINESS_SECRET`, never `CRON_SECRET`, so the monitor cannot invoke maintenance. Supply it through a private process environment, with `AUX_READINESS_SECRET_ENVIRONMENT` matching the reviewed environment. Never place its value in argv, a URL, Git or evidence. Then, from the service directory:

```sh
pnpm exec tsx scripts/check-readiness.mts --target-review /absolute/review.json --output /absolute/new-readiness-receipt.json
```

The probe performs exactly three GETs: public health, unauthenticated readiness denial, authenticated readiness. Redirects are refused, responses are bounded, errors omit provider text and credentials, and receipts never overwrite old evidence. Maintenance is never invoked. Deployment protection must already permit this exact approved request path; do not disable it to make the probe pass. Missing access remains a concrete prerequisite.

## Sign-in abuse

The service limits sign-in mail itself (`OTP_SEND_LIMITS` in `src/auth.ts`, fixed windows in `aux_rate_limits`):

| Limit | Key | Cap |
|---|---|---|
| Client address | IPv4 address, IPv6 /64 | 15 per hour, 40 per day |
| Client network | IPv4 /24, IPv6 /48 | 60 per hour |
| Recipient cooldown | email | 1 per minute |
| Recipient | email | 5 per hour, 10 per day |
| Code checks (`/email/verify-code`) | address / network | 30 / 120 per 10 minutes, plus 5 attempts per code |

Checks stop at the first refusal (address, network, then recipient), so a client already over its own limit cannot use up a real person's recipient budget. Refusals return 429 `RATE_LIMITED` with `Retry-After` and log `aux.auth.rate_limited` with the limit's name (never the email or IP). There is no global send cap any more: the old 300-per-hour cap let a distributed attack block every sign-in. Every 1,000 sends in an hour logs `aux.auth.otp_volume_alert` at error level; alert on that event in the log drain or Vercel log alerts.

Vercel BotID does not fit here: it needs its client script on the page that makes the request, and desktop sign-in calls the API from the Aux extension, not from a getaux.co page. Clients cannot solve a challenge either, so the Firewall answers 429, never a challenge.

### Vercel Firewall rules (owner)

Project `aux-cloud`, team `robzilla1738s-projects`. The API answers both the canonical path and the rewritten short path (`next.config.ts` rewrites `/auth/*` to `/api/v1/auth/*`), and the Firewall matches the incoming path, so each rule matches both. Published 2026-10-28, replacing the earlier rules that matched only the canonical path (5 per 600 s and 20 per 600 s):

| Rule | Match (method POST, path equals) | Window | Requests per IP | Over the limit |
|---|---|---|---|---|
| `Sign-in code send` | `/api/v1/auth/email/start` or `/auth/email/start` | 60 s fixed | 10 | 429 for the rest of the window |
| `Sign-in code check` | `/api/v1/auth/email/verify-code` or `/auth/email/verify-code` | 60 s fixed | 20 | 429 for the rest of the window |

The response is the plain rate limit (429), not deny with a duration: a timed deny becomes a persistent action that blocks the IP from every path on the host (health, sync and the rest) for its duration, which would lock out everyone behind a shared address. The service limits stay the precise per-email and per-network control; these rules only stop floods before they reach a function. The same rules with the CLI (personal account), then `vercel firewall publish`:

```sh
vercel firewall rules add "Sign-in code send" \
  --condition '{"type":"method","op":"eq","value":"POST"}' --condition '{"type":"path","op":"eq","value":"/api/v1/auth/email/start"}' --or \
  --condition '{"type":"method","op":"eq","value":"POST"}' --condition '{"type":"path","op":"eq","value":"/auth/email/start"}' \
  --action rate_limit --rate-limit-algo fixed_window --rate-limit-window 60 --rate-limit-requests 10 --rate-limit-keys ip --rate-limit-action rate_limit --yes
vercel firewall rules add "Sign-in code check" \
  --condition '{"type":"method","op":"eq","value":"POST"}' --condition '{"type":"path","op":"eq","value":"/api/v1/auth/email/verify-code"}' --or \
  --condition '{"type":"method","op":"eq","value":"POST"}' --condition '{"type":"path","op":"eq","value":"/auth/email/verify-code"}' \
  --action rate_limit --rate-limit-algo fixed_window --rate-limit-window 60 --rate-limit-requests 20 --rate-limit-keys ip --rate-limit-action rate_limit --yes
```

## Monitoring and logs

Better Stack monitor `5147281` is active under the personal Aux account `robert@getaux.co`: every 180 seconds, a 180-second confirmation period, and SSL-expiry alerts at fourteen days. Incident mail is copied to `robertcourson96@gmail.com` through a narrow Hostinger sender/monitor-subject filter; originals stay in the account inbox. A fresh test sent at 10:28:57 CDT reached Gmail Inbox at 10:29:05 after a sender-and-monitor-subject Gmail filter prevented spam placement. The monitor uses `GET https://api.getaux.co/api/v1/internal/readiness` with header `Authorization: Bearer <AUX_READINESS_SECRET>`, expecting 200 and `"status":"ready"`. It checks the database and schema without side effects. Never point a monitor at `/internal/maintenance` or give it `CRON_SECRET`. `/api/v1/health` stays a static liveness answer; it does no database work, so an unauthenticated caller cannot use it to load the database.

The Production Vercel log drain `drn_Q2LOKOXkKqUO98tz` (`logtail_aux_cloud_2814891`) sends function, edge-function and build logs to Better Stack source `2814891` (`aux-cloud`), with three-day log retention. Receipt and search were verified with a real Production readiness HTTP 200 record carrying the live deployment ID, plus a separately labeled synthetic ingestion check. Vercel charges $0.50/GB under the owner-approved normal usage billing; Better Stack remains on its free plan. The integration-created analytics and trace drains are paused. Tokens are in the Agents vault, never this repository.

Errors are single JSON lines with the platform request id (`requestId`, the `x-vercel-id` the client also gets back as `X-Request-Id`) and the route, never bodies, tokens, emails or IPs: `aux_request_failed`, `aux.auth.request_failed`, `aux.auth.email_send_failed`, `aux.auth.rate_limited`, `aux.auth.otp_volume_alert`, `aux.auth.consent_missing`, `aux.recovery.failed`, `aux.recovery.denied`, `aux.recovery.rejected`, plus the maintenance summary.

## Shares

`pnpm exec tsx scripts/operator.mts share revoke <share id>` takes a share down: it clears the title and messages and sets `blocked_at`, and the owner then gets 403 `SHARE_BLOCKED` if they try to publish that conversation again. A user's own unshare clears the title and messages and can be reshared. There is no unblock command; clear `blocked_at` by hand only after review.

## Service operations

See [SERVICE-OPERATIONS.md](../../../docs/integration/proposed/completion-20261026/integration/cloud-activation/SERVICE-OPERATIONS.md) for the non-backup operational acceptance. The existing `/api/v1/internal/maintenance` endpoint performs bounded cleanup and must not be used as a health probe. The source five-minute cron and dashboard Enabled checkbox do not establish a scheduled job or successful execution.

Readiness does not prove private Blob access, account/provider pairing, current desktop sync/routine contracts or feedback readback; those remain actual J5/operating acceptance. On 2026-10-28 a real production sign-in code reached Gmail Inbox with `Reply-To: hello@getaux.co`, signing domain `notify.getaux.co` and TLS. Resend shows the sending domain verified, including SPF and DKIM. Authoritative root DMARC is `v=DMARC1; p=none; rua=mailto:hello@getaux.co`; resolver caches may retain the earlier value for its TTL. See the owner-operations receipt for deployment, email, monitor and drain verification.

## Recovery before real users

The new production Neon has seven-day restore history, fixed0.25 CU and a usage-based budget target. Its synthetic earlier-marker branch restore and migration hashes passed; both test branches were removed (see the production resource receipt). Never overwrite the live branch to test recovery. Check schema hashes and ownership boundaries again for a real cutover. Keep `AUX_DATA_ENCRYPTION_KEY` and signing/session secrets in controlled provider secret storage: a database restore alone cannot recover wrapped data after its wrapping key is lost. Key retention/rotation must be part of the recovery procedure.

Database recovery alone does not restore deleted private Blob objects. The current twelve-schema hosted drill now verifies encrypted snapshot recovery together with durable attachment and private avatar readback in a separate private Blob store. Independent backup storage, key custody, retention deletion, scheduling and alerts remain unconfigured; this drill does not establish operating disaster recovery. Existing cleanup and account-deletion semantics must remain explicit; do not silently retain deleted user content in an unbounded backup.

Local encrypted capture/unpack tooling is documented in [recovery.md](recovery.md). It exports one database snapshot plus verified referenced private files and seals the wrapping key with an independent recovery key. The local operator runner now implements authenticated delivery retries and explicit per-job expiry cleanup. Its real read-only current12-schema capture/delivery/unpack check passed with29 empty application tables; see `../evidence/backup-job-empty-production.json`. That check did not import a database or restore files. The later current-schema hosted restore is recorded below. Remote R2 transport is implemented with local protocol evidence, but actual provider acceptance, independent key custody, scheduling, alerts and operational cutover remain unfinished.

The historical eleven-schema drill is recorded in `../evidence/isolated-recovery-restore.json`. The later [current twelve-schema hosted drill](../../../docs/integration/proposed/aux-cloud-hosted-restore-12/evidence.json) passed the full online capture and isolated restore CLIs: actual exported PostgreSQL snapshot and Neon archive import, all twelve migration hashes, separate private Blob attachment/avatar readback, quarantine, preserved recovery/key/generation state and original CSK decryption. All generated source and target fixtures, the temporary branch and private local material were removed. This verifies current-schema hosted cross-store restoration; it does not establish independent backup operations, post-snapshot external-state reconciliation or service cutover.

For an application rollback, choose a previously verified deployment with compatible additive schema, then repeat protected readiness and a disposable auth/sync check. The deployment live before the 2026-10-28 promotion (`aux-cloud-ke3ko8xda`, `dpl_FCyG1B6SzBg4CTUSYpwru7krBxHo`) is the rollback target for the current deployment `dpl_DEH7Lvy3FXWXfTiznh2eXgDNEGxw`. Migration 014 stays applied on rollback: older code ignores its columns, and readiness on older code counts only the migrations it knows. A rollback brings back the global 300-per-hour sign-in cap and the old consent behavior until the change is redeployed. Do not use a rollback to undo account revocations or schema migrations. The completed isolated cross-store drill does not establish production traffic cutover, rollback, external alert delivery or production promotion.
