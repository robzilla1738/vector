# One reviewed deployed recovery fixture — not executed by this lane

`services/aux-cloud/scripts/check-sync-recovery-deployed.mts` is the single-run development fixture. Root must confirm the reviewed Preview is READY and `dev-cloud.getaux.co` aliases it before execution. This script was only statically typechecked here; this lane did not read `.env.local`, call the database or contact the deployment.

Execution, **from the root service after review**, uses its existing private environment (never copy an env file into a worktree):

```sh
AUX_CHECK_DISPOSABLE=1 node --env-file=.env.local --import tsx scripts/check-sync-recovery-deployed.mts
```

The script requires `checkEnvironment(...).profile === 'development'`, refuses production and fixes every HTTP call to `https://dev-cloud.getaux.co`, with redirects rejected and 25-second request limits. No user-provided target origin is accepted. Protected readiness runs once before fixture writes and requires the current schema; migration 012 must be present locally. A public status/receipt is not a substitute for root's actual Preview/alias verification.

It creates exactly one newly marked synthetic Aux user, a synthetic macOS session with an actual generated P256 public key, a valid Aux HS256 JWT/access hash, and its own random server-wrapped CSK. It performs challenge/enroll/exact replay, encrypted material read/open, removes **only its own exact initially inserted key row** to exercise ordinary missing-key resolve/enroll refusal, then performs authenticated same-CSK restoration/exact replay and confirms the restored wrapped key. There is no Clerk identity/sign-in, email, paid AI, native addon, browser profile or original data access.

Cleanup removes only that successfully created marked fixture's key, challenges, encrypted recovery history, rate-limit key, exact session and user, in FK order. On cleanup failure, only its non-secret fixture UUIDs are reported for exact follow-up; no tokens, keys, entropy, response bodies, provider errors or connection strings are printed. No blanket cleanup scans are used. Evidence is written only after all checks and cleanup succeed, to `services/aux-cloud/evidence/sync-recovery-deployed.json`. Its conclusion is deployed backend recovery with synthetic Aux-authenticated state, **not** real provider sign-in or desktop/native recovery acceptance.
