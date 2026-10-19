# Daemon core, authentication and bridge

Status: **ready** for the behavior and Aux adaptations described below. Evidence: SP1-E1/E2 in the provenance ledger. These are static observations; runtime comparison remains an acceptance step. No implementation excerpts appear here.

## Local server and readiness

Bind loopback only, port 21520 by default. State root is `AUX_HOME`, default `~/.aux`; bridge listener may use 21522, secure browser CDP uses 45203. Support isolated test homes/ports for coexistence.

`GET /` and `/health` return identical JSON: `service` (`aux-daemon`), `version`, positive `pid`, `host`, `port`, boolean `ready`, `status` (`idle` or `running`), ISO `startedAt`, nonnegative `runningSessionCount`, and concurrency summary `semaphore`. Running means one or more active agent runs. Ordinary routes return 503 `SERVICE_UNAVAILABLE` during initialization; health, shutdown and authentication remain available.

Authenticated `POST /shutdown` responds with status `shutting_down`, stops admitting work, ends listeners/helpers, flushes storage and exits. Supervisors verify PID/executable identity before signals; unrelated listeners are never killed.

Errors contain `error.code` and original user-facing `error.message`. Validation: 400 `BAD_REQUEST`; missing/invalid credential: 401 `UNAUTHORIZED`; forbidden host/origin/scope: 403 `FORBIDDEN`; absent record: 404 `NOT_FOUND`. Never expose secrets, tokens or stack traces in public errors.

## Installation authentication

Generate Aux-owned installation signing keys. Owner-only private-key access; browser/CLI sign challenges and daemon verifies the corresponding public key. Ready baseline is P-256/SHA-256. A post-quantum scheme was observed but native provisioning is not yet specified; do not claim its compatibility.

1. `GET /auth/daemon/challenge?clientKind=…` accepts `chromium`, `agent-manager-extension`, `password-manager-extension`, `internal-web`, or `cli`. Return fresh UUID `challengeId` and base64 `challenge` containing 32 random bytes.
2. Expire challenges after 30 seconds; hold at most 1024, pruning expired and then evicting oldest when full.
3. Sign UTF-8 `Aux Daemon Auth v1`, a NUL byte, then decoded challenge bytes. P-256 uses SHA-256 and DER signature encoding.
4. `POST /auth/daemon/session` accepts `challengeId` and base64 `signedChallenge`. Consume before verification, even on failure. Missing/expired/replayed/invalid signatures return 401.
5. Success returns `access_token`, `expiresInSeconds` (86400), `token_type` (`AuxDaemonSessionToken`). Daemon-signed HS256 JWT: issuer `aux-daemon`, audience `aux-daemon-localhost`, client-kind subject and expiry. Keep token-signing secret private and distinct from installation signing key.
6. HTTP uses `Authorization: AuxDaemonSessionToken <token>`; WebSockets may use a protocol entry `aux.daemon.auth.<token>`. Verify signature, issuer, audience and expiry. Malformed/expired credentials fail.
7. Protected `GET /auth/daemon/verify` returns `ok:true` after validation.

Independently validate Host: only `localhost`, `127.0.0.1`, `[::1]`, with no port or actual configured daemon port. Reject external hosts even on public health/challenge routes. CORS allows only generated Aux extension origins and explicit local development origins. OPTIONS never authorizes mutations. Aux adaptation: authenticate native sidebar mutations and private reads, even where the reference relies on loopback alone.

## tRPC and account scope

Mount `/trpc`; use typed queries for reads and POST mutations. Validate external inputs with Zod. Every domain operation is scoped to a nonnegative integer `accountId`. Resolve profile context explicitly; never infer ownership from another account's session ID. Account-registry operations remain transport-authenticated even if callable without account selection.

Auto-mint one local account. Record: `id`, `name`, `provider`, `mode` (`local`), `authStatus`, epoch-ms `createdAt`, optional profile image URL/onboarding timestamp. Registry version 1 contains `currentAccountId`, accounts, local bootstrap state and profile bindings. Profile context: nonempty `profileId`, optional `profilePath`, optional nonnegative `profileIndex`, optional bound account identity. Stable profile mapping must survive restarts without reusing deleted account identity.

| Procedure | Input | Result / effect |
| --- | --- | --- |
| `accounts.list` | none | registry without credentials/cloud-token secrets |
| `accounts.summary` | none | current ID, accounts, session-presence booleans, bindings |
| `accounts.get` | accountId | account or absent result |
| `accounts.current` | none | accountId |
| `accounts.add` | name, provider, mode | bootstrapped local account |
| `accounts.update` | accountId, optional name/profile image | updated account |
| `accounts.setCurrent` | accountId | selected ID; reconcile ambient services |
| `accounts.ensureProfileAccount`, `resolveProfileAccount`, `resolveProfileAccountByProfile` | profile context | stable account; create local account only when unmatched |
| `accounts.bindProfile` | profileId, local user identity, optional accountId/profileIndex/profilePath | persisted binding |
| `accounts.removeProfileBinding` | profileId or profilePath | removed binding; retire orphaned artifacts only under explicit account deletion policy |
| `accounts.completeOnboarding` | accountId | persist completion time |
| `accounts.deleteAccount` | accountId | stop work, erase local state/bindings, select remaining account |

Cloud authentication, sync-key recovery, device management and cloud access-token procedures return typed local unsupported errors; do not manufacture successful credentials.

## Settings

`settings.get({accountId,key})` returns stored/default value. `getAll` returns effective map. `set({accountId,key,value})` validates setting type, persists and returns resulting value. Publish invalidation; enabling context awareness reconciles capture permissions; sidebar recent-limit changes refresh its projection.

`readContextFile` accepts an allowlisted account context filename, returns `content` (empty if absent). `writeContextFile` replaces text, returns `success:true`. Reject escaping paths. `getCompletionSound` returns configuration; `setCompletionSound` takes filename (1–255 chars), MIME type and nonempty base64 audio, validates and stores privately; reset deletes custom sound while preserving enabled state. Exact audio-size constraints remain draft.

## Extension bridge

Connect to `/extension-bridge/extension` (or `/extension` on bridge listener). `GET /extension-bridge` status returns `connected`, `connectionCount`, optionally filtered by accountId/profileId/browserMode. Browser mode is `default` or `incognito`.

First client message: method `register`, nonempty `connectionId`, route with accountId/profileId/browserMode. Acknowledge method `registered` plus connectionId. Second registration on a socket is a policy error. A newer same-account/profile/mode registration replaces the older context; old close callbacks must not erase the new connection. Different profiles coexist.

Server command envelope: numeric `id`, method `runCommand`, `command` with method-specific params, resolved route. Reply: same id, result or error string. Cancellation: method `cancelCommand`, id. Replies cannot resolve another connection's request. Default timeout 30 seconds; download wait timeout is requested timeout plus 1 second (default request 30 seconds). Disconnect rejects pending work.

Application `ping` every 5 seconds requires `pong`; retire after 15 seconds without liveness. Connection acquisition waits at most 8 seconds. Reconnect with backoff/fresh auth as needed. Commands dispatch only allowlisted extension APIs, page operations and CDP methods; arbitrary strings cannot invoke arbitrary Chrome APIs. Mutations remain subject to agent action policy. Full native command inventory is owned by SP3.

## Storage

Root stores installation identity and account registry; account data is under `u/<account>/`: `state.db` (SQLite), `credentials.json`, `models.json`, settings storage, `projects/`, `sessions/`, `skills/user/`, `memory/`, `context-awareness/ledger.db`, private caches. Atomic JSON replacement and SQLite transactions protect accepted updates. Credentials/private keys use owner-only permissions. File APIs reject traversal and symlink escape.

Session metadata, turns, transcript rows, tool events, routines, projects, inbox and audit records are durable/account-scoped. Incrementing transcript revisions distinguish new events from stale cursors. Physical schema is independently designed, not a parity requirement. Crash recovery retains accepted messages and prevents duplicate routine execution.

## Acceptance

Disposable home: boot; sign/consume challenge; verify token; reject replay/expiry/foreign Host; account-scoped metadata call; register mock extension; execute one command/reply; authenticated shutdown. Accounts/settings survive restart without exposing secrets. This proves core smoke only, not full parity.
