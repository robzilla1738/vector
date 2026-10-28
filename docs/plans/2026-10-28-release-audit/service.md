# Aux hosted service: release-readiness audit (read-only, 2026-10-28)

Scope: `services/aux-cloud` at local `main` (HEAD 4794f22d4), the live Vercel project `aux-cloud` (personal team `robzilla1738s-projects`, Pro plan), public URLs. Nothing was deployed, promoted or changed. No secret values were read or printed; env var names only.

## 1. Local checks

| Check | Result |
|---|---|
| `pnpm test` | 64 pass, 0 fail, 0 skip (8.1 s) |
| `pnpm typecheck` (`tsc --noEmit`) | pass |
| Lint | no lint script exists in `package.json`; nothing to run |
| `next build` | skipped: `pnpm build` runs `check-environment.mjs` with `.env.local` (real dev secrets), and Next itself loads `.env.local`. STATUS records a passing local build |
| `pnpm audit --prod` | 1 high: `zod <4.6.6` (GHSA-mrhx-c7xc-m3w5), transitive via `@vercel/blob > @vercel/oidc > @vercel/cli-config > zod`. Direct zod is 4.6.7 |
| `pnpm outdated --prod` | patch updates only: `@clerk/backend` 3.26.3, `@clerk/nextjs` 7.9.21, `hono` 4.13.14, `next` 16.4.3 |

## 2. What is deployed

- All five aliases (`api.`, `app.`, `share.`, `dev-cloud.getaux.co`, `aux-cloud.vercel.app`) plus `aux-cloud-robzilla1738s-projects.vercel.app` serve `dpl_FCyG1B6SzBg4CTUSYpwru7krBxHo` (`aux-cloud-ke3ko8xda`, production, READY, created 2026-10-27 20:45 CDT).
- Source is `cli` upload; metadata says git `main` at `33731fd25` ("Record what the Developer ID copy and the backup still need", 20:43 CDT). CLI uploads the working tree, so the label is not proof of bytes, but it matches.
- Service commits on `main` after `33731fd25`: exactly two, `09c024eba` (`src/sync.ts` users/settings merge + test) and `608f900e3` (`app/icon.png`). Live evidence: `https://app.getaux.co/icon.png` returns 404.
- Two preview builds 4 h ago failed (`dpl_GrjEiFYtVV9ZxxwxycjrQ8KJhsTG` = `eez1hur3i`, and `bbpx4l95e`): build log `Missing configuration: AUX_READINESS_SECRET`. Env listing confirms `AUX_READINESS_SECRET` exists only in Production.
- Rollback: documented in `docs/integration/proposed/completion-20261026/integration/cloud-activation/live-20261027/README.md`: re-point aliases to `aux-cloud-9oc52fmgn` (pre-activation, older source with payments code) or `aux-cloud-2urdeebuy` (`dpl_3rxb4gkNuPWps6iC9vAo4t2Nk2Ua`, same source, no cron). Both still Ready.
- Cron: registered on the live deployment, `*/5 * * * *` (Pro plan supports it). Runtime logs show `aux.maintenance.completed ok:true failures:[]` every 5 minutes through 11:20 UTC today. No runtime errors in the last 24 h; 115 info logs in 12 h.

## 3. Hosted audit items

| Item | State | Evidence | What's left |
|---|---|---|---|
| Middleware scoping (recovery 16 KiB / 30-per-min / device rule) | DONE | `src/sync-recovery.ts` scopes `bodyLimit`, `requireUser`, `rateLimit` to `/sync/recovery/v2/*`; no `use('*')` outside app-level and per-router auth guards | none |
| Full-app route composition test | DONE | `src/app-composition.test.ts` "route middleware stays inside its own mount" (20 KiB PUT `/users/settings` not 413, no `RECOVERY_` code) | none |
| Account deletion completeness (Clerk user, all tables, blobs) | DONE in source | `src/auth.ts` `purgeDeletedUserData`: attachment blobs (`purgeUserAttachments`), avatar prefix, refresh tokens, sessions, 22 `userDataTables`, email challenges, `clerk().users.deleteUser`, tombstone row with freed email | live step: J5 step 10 (owner clicks Delete account) and its cleanup check are still open; maintenance shows `purged:0` so far |
| Deletion test | PARTIAL | test checks `userDataTables` against every `user_id` column in the migrated schema | no test executes `purgeDeletedUserData` end-to-end (rows gone, blob `del` and Clerk `deleteUser` called, tombstone fields). Agent-doable with pglite + stubs |
| Device-bound sessions on `/sync/key`, `/drive`, `/sync/agent-files`, `/sync/sessions` | DONE | `src/app.ts` applies `requireInstallation` to `/sync/key/*`, `/sync/recovery/*`, `/sync/agent-files/*`, `/sync/sessions`, `/sync/sessions/*`, `/drive/*`; test "installation-only routes refuse web sign-in sessions" | none |
| Maintenance cron fault isolation | DONE | `src/maintenance.ts` `step()` per step, per-account try/catch, oldest-attempt-first ordering, JSON summary, 500 on any failure | nothing alerts on the 500 (see Ops) |
| Share quotas / rate limit | DONE | `src/sync.ts` 500 shares, 100 MB, 60/hour; test "share publishing enforces the count, storage and hourly limits" | none |
| Share report link | DONE | `app/s/[id]/page.tsx` mailto `hello@getaux.co` with share id | none |
| Operator revoke script | DONE, with a gap | `scripts/operator.mts share revoke <id>` clears messages and title | a revoked share can be republished by its owner (upsert sets `revoked_at=NULL` and a new id); no "blocked by operator" flag. Agent-doable |
| Consent version at signup | PARTIAL | migration 013 adds `terms_version`, `terms_accepted_at`; `mapUser` writes `TERMS_VERSION` on insert; web sign-up shows "at least 13 (16 in EU) and agree to Terms/Privacy" text | age is not recorded; consent is recorded even on the desktop email-code path, which never shows the terms in this service; the web text is browsewrap, not a checkbox. Owner/legal decides whether that is enough |
| Email-code bot protection | OPEN | `/auth/email/start` has per-IP 15/h, per-email 5/h, resend 1/min | no CAPTCHA/Turnstile/Clerk bot protection on this path (it creates Clerk users directly) |
| Email global send budget | DONE | `OTP_SENDS_PER_HOUR = 300` global bucket | note: anyone can exhaust the 300/h budget and block every sign-in for that hour (see new findings) |
| Firewall rate rules | OPEN | Vercel firewall config API: "config not found" (no custom rules) | owner: add rate rules for `/api/v1/auth/*`, `/auth/*`, `/s/*` |
| Readiness token separate from CRON_SECRET | DONE | `src/internal-auth.ts` `isReadinessRequest` uses `AUX_READINESS_SECRET`; live readiness/maintenance return 401 unauthenticated | none |
| DB check in `/health` | OPEN (by design) | `/api/v1/health` returns static JSON; DB check lives in authenticated `/internal/readiness` | acceptable if the monitor targets readiness; otherwise add a cheap `SELECT 1`. Decide which |
| Structured logs with request id | PARTIAL | `src/app.ts` sets `X-Request-Id` from `x-vercel-id`, `aux_request_failed` JSON includes `requestId`; maintenance logs JSON | `authRoutes.onError` logs a non-JSON line without request id (`src/auth.ts:173`); `syncRecoveryRoutes.onError` logs nothing. Agent-doable |
| Alerts | OPEN | no log drains (`list_drains` empty), no monitor recorded | owner: monitor account + recipient |
| Migration 013 | DONE, applied live | `migrations/013-account-lifecycle.sql`; activation README records it applied; readiness reports 13 migrations current | none |
| Avatar blob cleanup | DONE | `/me/avatar` deletes previous blob; purge clears `avatars/<id>/` | none |
| Share-import blob cleanup | DONE | `attachments/:id/commit` `finally` deletes the blob and marks row deleted; expired intents cleaned by maintenance | none |
| Deleted-Clerk-user webhook 503 loop | DONE | `user.updated` treats Clerk 404 as null and still marks the delivery | none |
| Billing / Stripe / hosted AI removal | DONE in code | `src/billing.ts`, `src/inference.ts` read-only stubs; no stripe in `package.json` | stale env vars remain in Preview/Development: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `STRIPE_PORTAL_CONFIGURATION_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `AUX_AI_MODEL`, `AUX_AI_FAST_MODEL`, plus `AUX_PAYMENTS_ENABLED`/`AUX_HOSTED_AI_ENABLED` in Production and Preview (owner removes). Old `evidence/stripe-*.json`, `gateway-*.json` remain as history |
| Cache Clerk verification | OPEN (minor) | `clerkIdentity` calls `sessions.getSession` + `users.getUser` on every web-session request | only affects the web portal path |
| Write `aux_users` only on change | DONE | `mapUser` upsert `WHERE ... email IS DISTINCT FROM` | none |

## 4. Ops

| Item | State | Evidence | What's left |
|---|---|---|---|
| Uptime monitor | OPEN | STATUS and live README: "an external uptime monitor needs an account choice"; `OPERATIONS.md` proposes Healthchecks, IDs unrecorded | owner picks account; point it at authenticated `/api/v1/internal/readiness` |
| Alert recipient | OPEN | `cloud-activation/OPERATIONS.md`: proposed recipient "confirmation and actual delivery remain pending" | owner confirms |
| Rollback deployment id | DONE (documented) | `live-20261027/README.md` names `aux-cloud-9oc52fmgn` / `aux-cloud-2urdeebuy` | after deploying the two pending commits, `ke3ko8xda` becomes the natural rollback; record it |
| Neon backups / PITR | UNVERIFIED this run | `services/aux-cloud/docs/operations.md` says "seven-day restore history"; DB is Neon `us-east-1` (`config/deployment-resources.json`). The Neon MCP account here doesn't hold this project (Vercel-managed integration), so retention couldn't be read | owner confirms retention in the Neon/Vercel console; independent backups are owner-deferred (D11 covers the repo, not the DB) |
| Vercel plan / cron frequency | DONE | team billing `plan: pro, status: active`; 5-minute cron registered and running | none |
| Log drains | OPEN | none configured | owner decides (Vercel Pro runtime logs are short-lived) |
| Firewall | OPEN | no custom rules | owner |
| Deployment protection | OK | SSO protection `all_except_custom_domains` | none |

## 5. Public pages

| URL | Live | Notes |
|---|---|---|
| `https://app.getaux.co/` | 200 | says "Aux cloud is being prepared for private testing" |
| `/policy/privacy` | 200 | final text, no TODO/TBD/lorem/brackets. States processors "in the United States" (Neon us-east-1 and Vercel iad1 match; Blob store region and Clerk/Resend regions not verified here). Discloses that the operator can decrypt synced content (D3) |
| `/policy/terms` | 200 | governing law reads "the laws of the state in which Courson Digital LLC is organized": the state is not named. Owner-only fill |
| `/docs` | 200 | clean |
| `/community` | 200 | titled "Feedback and support"; this is the support page |
| `/support` | 404 | no such route. Nothing in the shipped candidate links it |
| `https://getaux.co/{policy/terms,policy/privacy,docs,community}` | 308 to www, then 404 | `vendor/provided/aux-product-links.mjs` maps Aside links to these apex URLs. The sealed candidate's greppable bytes only contain `app.getaux.co/...`, so this may not ship, but compressed bundles weren't checked |
| `https://api.getaux.co/api/v1/health` | 200 | `{"service":"aux-cloud","status":"ok","version":1}` |

Whole app layout is `robots: noindex`, so the legal pages are not indexable. HSTS and `X-Frame-Options: DENY` are present; only `/s/*` has a CSP.

Mail: `getaux.co` MX is Hostinger (hello@ mailbox plausible), Resend DKIM/SPF on `notify.getaux.co` present, DMARC `p=none`.

## 6. Security quick pass

- CORS: allowlist from `AUX_ALLOWED_ORIGINS` plus the fixed extension id `chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm`. Live: `app.getaux.co` allowed; `evil.example`, `dev-cloud.getaux.co`, `localhost:3000` refused.
- Auth: every route after `app.use('*',requireUser)` needs a bearer. Public routes before it: `/health`, `/auth/*` (email start/verify, token exchange/refresh, device-code start/poll/cancel, avatar via signed capability), `/webhooks/clerk` (Svix-verified), `/attachments/callback` (Vercel Blob `handleUpload` signature), `/internal/*` (bearer), `/billing/plans` and AI catalog stubs (static). Live: `/users/settings`, readiness and maintenance return 401 without auth.
- Rate limits: DB-backed fixed windows on OTP, verify, exchange, refresh, device-code, avatar, events, shares, recovery. No edge/firewall limits.
- Secrets in repo: pattern grep of tracked service and cloud-activation files matched only synthetic fixtures (`src/operations.test.ts`, `src/routines-1852.test.ts`, `src/test-database.ts`). `.env.local`, `.env.production-bootstrap.local`, `.env.production-secrets.local`, `.env.provider-pull` exist locally, are gitignored and untracked.
- Dependencies: one high (transitive zod), see section 1.

## New findings

1. **Two service commits not deployed** (`09c024eba`, `608f900e3`): the users/settings merge fix and the site icon. Production deploy is owner-only.
2. **Preview environment can't build**: `AUX_READINESS_SECRET` is Production-only, so no pre-production check of a change is possible. Fix is either an owner env add for Preview (its own value) or a code change so `check-environment` only requires it in production. Pick one.
3. **`dev-cloud.getaux.co` is an alias of production**, on production DB and Clerk, while production CORS refuses its origin. Old dev-cloud clients now talk to production. Owner decides: remove the alias or keep it as a compatibility host.
4. **Global OTP budget is a sign-in DoS lever**: 300 sends/hour shared by everyone with no CAPTCHA. Spreading requests over many IPs and addresses (15/IP, 5/email) uses up the budget and blocks real sign-ins for up to an hour. Add bot protection (Turnstile or Clerk's own flow) and/or a firewall rate rule; keep the global cap as a backstop.
5. **Operator takedowns are reversible by the owner of the share** (republish upsert). Add an operator-blocked state that publish respects.
6. **User unshare leaves the title** in `shared_sessions` (messages cleared, title kept until account purge). Minor privacy; clear the title too.
7. **Database credentials are stored as plain (non-sensitive) env vars** in Production (`DATABASE_URL`, `PGPASSWORD`, `POSTGRES_PASSWORD`, `POSTGRES_URL*`, also `BLOB_READ_WRITE_TOKEN`): integration-managed "Config" type, visible to anyone with project access. Owner can mark them sensitive or accept it.
8. **Stale docs**: `services/aux-cloud/docs/operations.md` still says twelve migrations and mentions refunds; STATUS says both 63/63 and 64 tests (actual 64). Agent-doable.
9. **No lint**: no lint script or config in the service. Agent-doable if wanted (oxlint is used elsewhere).
10. **Apex links 404**: `getaux.co/policy/*`, `/docs`, `/community` 404 on the marketing site. Either add redirects on www to app., or repoint `vendor/provided/aux-product-links.mjs` to `app.getaux.co`.
