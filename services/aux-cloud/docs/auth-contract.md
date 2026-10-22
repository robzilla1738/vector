# Supplied desktop authentication compatibility

`authRoutes` mounts under `/auth`; `requireUser` also protects billing, sync and hosted inference. Authenticated context is `{id: internalUUID, clerkId, email, sessionId}`. The UUID is stable and mapped to the separate Aux Clerk app. No owner data or existing provider projects are imported.

## Identity proof

The supplied email-code UI calls `/email/start` then `/email/verify-code`. The current [Clerk JavaScript Backend email-address API](https://clerk.com/docs/reference/backend/email-addresses/create-email-address) exposes create/get/update/delete, not the frontend `prepareVerification`/`attemptVerification` methods. Aux therefore sends a purpose-bound six-digit OTP through its domain-restricted Resend key. Only an atomically consumed, delivered, unexpired code with at most five attempts permits a Clerk user creation/mapping. Codes are HMAC hashed using the private `AUX_AUTH_SECRET` and never stored/logged in plaintext. Email/IP/send-frequency buckets are atomic SQL updates. Resend failures never mark a challenge delivered. Existing Clerk MFA, locked or banned accounts cannot use this bridge; they must use the hosted Clerk flow.

The compatibility field `supabaseAccessToken` in `/token/exchange` now contains a real Clerk session JWT. It is verified using Clerk's [official verifier](https://clerk.com/docs/reference/backend/verify-token), an explicit authorized-party allowlist, a currently active matching session, a usable account and a verified email. No identity is accepted from an email address or decoded JWT alone.

## Sessions and devices

Access tokens are 15-minute HS256 JWTs with issuer `https://api.getaux.co`, audience `aux-desktop`, internal user UUID `sub`, session UUID `sid`, random `jti` and numeric `sg` (browser sync generation). Only their SHA-256 digests are stored. Requests also query session revocation, account soft-deletion and current sync generation; a valid signature alone does not grant access.

Refresh tokens are random 256-bit opaque values, stored only as SHA-256 hashes. Rotation consumes the old token and replaces the access digest atomically. Reuse revokes the entire token family. Families expire after 30 days and refresh checks current Clerk account availability. Installation public-key fingerprints are recomputed from exact P-256/ML-DSA-65 bytes and bound to the session. This preserves the supplied fingerprint-binding contract; the supplied client does not sign each hosted request, so this is not a claim of hardware-backed proof of possession for every request.

The device-code flow supports the original CLI start/poll/cancel shapes and browser pending/lookup/decide shapes. Codes bind to the intended signed-in email and account UUID; only code+request-ID proof allows approval. Poll redemption and OTP consumption are one-use operations. A code alone cannot approve another account.

Avatar objects remain private in Blob. A short-lived capability is scoped to one avatar object and user. Uploads permit bounded PNG/JPEG/WebP bytes; SVG/HTML are rejected. Account deletion soft-deletes only the current Aux record and revokes its sessions; it does not permanently delete the external Clerk user or unrelated data.

## Environment / dependencies

Required: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_AUTHORIZED_PARTIES` (comma-separated allowed frontend origins), `AUX_AUTH_SECRET` (at least 32 high-entropy characters), `RESEND_API_KEY`, `RESEND_FROM`. Avatar upload additionally requires private Blob credentials (`BLOB_READ_WRITE_TOKEN` or supported Vercel OIDC binding). `AUX_API_ORIGIN` controls returned avatar URLs. Dependencies: Hono, Zod, Jose, Clerk Backend, Neon serverless, Vercel Blob.

Apply migration `001-auth.sql`, then the billing migration supplying `aux_subscriptions(user_id,plan,status)`. No default subscription is manufactured. Onboarding remains null until the actual completion endpoint is called.

## Evidence boundary

Source implementation and focused local tests do not prove a production auth journey. Required deployment checks are actual email delivery/code redemption with a disposable Aux account, refresh rotation/reuse rejection, device approval, revocation, Clerk hosted token exchange, account-isolation checks and the supplied desktop sign-in flow. No test should expose raw tokens/codes or use owner profiles.

## Clerk lifecycle webhook

`authWebhooks` mounts publicly at `/webhooks/clerk`; the official `@clerk/backend/webhooks` verifier validates the raw body and Svix headers using `CLERK_WEBHOOK_SIGNING_SECRET`. Configure `user.updated`, `user.deleted`, `session.revoked`, `session.ended` and `session.removed`. Only successful idempotent effects mark a delivery processed. User deletion soft-deletes the matching Aux UUID and revokes its sessions. Bans/locks revoke sessions; current profile state is fetched to avoid applying out-of-order email changes. Existing Aux UUIDs are preserved. Clerk-linked desktop sessions record their parent Clerk session and are revoked when it ends; refresh also checks that parent session remains active. OTP-created native sessions remain independent until the Aux user/account is revoked.

A protected daily maintenance job should call `pruneAuthState()` to remove expired OTP/rate/device artifacts and session families after their full expiry plus seven days. No cloud credentials, emails or provider mutations were used in focused local tests.

Self-deletion also revokes public shares immediately, clears encrypted sync objects/keys and shared message payloads, and runs bounded private-attachment/avatar deletion. `purgeDeletedUserData(userId)` returns `{complete,remaining,safeToDeleteAccountAfter}`; the maintenance job must retry all soft-deleted users whose `data_purged_at` remains null. Pending upload metadata is retained until signed tokens expire, so late upload callbacks can still remove their bytes. Self-deletion first calls the ownership-checked billing cancellation helper, scheduling the current paid subscription to stop at period end. If cancellation cannot be verified/completed, account access is preserved and deletion fails safely. Only then are Aux identity/session/share access revoked; external Clerk users are not permanently deleted.

Local validation: service TypeScript compilation passed and six focused auth tests passed. These tests make no outbound email/provider/database calls; production/desktop acceptance remains explicit above.

## Lost-response refresh recovery

The supplied daemon makes up to three refresh attempts using the same token with 1s/3s delays. Migration `006-auth-refresh.sql` adds a ten-second idempotency window: the old token stores only an AES-256-GCM encrypted reply authenticated to that old token hash, session UUID and HMAC request-context digest. The key is derived from `AUX_AUTH_SECRET` under a separate purpose. Exact device fingerprints and user-agent context must match; untrusted forwarding/IP headers are not used to make a security decision. Concurrent identical retries re-read the first committed result. Reuse outside the window, with a different context, or after a superseding rotation revokes the family. A different device is rejected before considering the cached reply. Maintenance clears expired ciphertext; no plaintext refresh or access token is stored.

Real-database fixture prepared: `scripts/check-auth-db.ts`. It requires an explicit opt-in and the exact approved development Neon endpoint, creates only synthetic UUID-owned rows, runs the actual auth router/SQL, mocks only Clerk availability, and cleans its own rows. Root must run it with privately loaded development credentials; preparation/typecheck alone is not a successful database check.

## Actual development database evidence — 2026-10-22

The focused auth fixture passed against the approved Aux development Neon database: signed-session DB ownership, cross-account device revocation denial, sync-generation stale-claim rejection, lost-response refresh recovery with encrypted stored reply, concurrent refresh producing one successor, different-device refusal, and post-grace refresh reuse revoking current family access. Three synthetic Clerk availability calls were mocked; no real Clerk identity, email delivery or owner profile was used. Fixture cleanup returned `cleaned:true`; a separate strict synthetic-row check found zero remaining fixture users. Service typecheck passed afterward.

The initial fixture failure was the fixture network allowlist: Neon HTTP replaces the endpoint hostname label with the regional `api.` label. The corrected allowlist permits only that exact regional `/sql` endpoint and additionally checks that the private Neon connection header still names the reviewed development endpoint. The failure occurred before any fixture insert reached Neon. No applied migration changed.
