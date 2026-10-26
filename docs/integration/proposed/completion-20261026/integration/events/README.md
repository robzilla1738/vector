# Paired Aux invalidation polling and actual1852 routines

This local source batch closes the missing event receiver and routine API mismatch. It does not deploy cloud services or establish actual sync/share/operational acceptance. No owner account, credential, profile, host, grant, signing or hosted resource was accessed.

## Event transport

The actual A51 client opened `/events` WebSocket using `aside-events`; the Aux Hono/Vercel source had no receiver. It subscribed account/billing/devices/settings/Drive/routines, while encrypted session snapshots had no invalidation topic. This was a missing source join, not an unperformed smoke test.

The new authenticated `/api/v1/events/poll` route (also `/events/poll` through the existing Next rewrite idiom) returns `aux-events.poll.v1`, a fixed-size HMAC cursor and at most seven changed topic names. The source is a single owner-filtered current-schema snapshot: account, subscription, signed-in devices, user settings, Drive heads/cookies/projects, routines and session snapshot revisions/tombstones. SQL aggregates hash collection content/identities, so an edit/delete below the maximum timestamp is not lost. No plaintext/private content, credential, user identifier or revision map leaves the endpoint. Cursor ownership is HMAC-bound; cursors grant no authorization. Existing `requireUser` still validates each live session and account before this route. A cursor from another owner cannot select their state.

The endpoint creates no table, migration, event-log service, paid dependency or persistent cursor. It uses existing rate limits (120 requests/hour/owner), a five-second SQL statement bound, strict query/topic/cursor validation and no-store responses. The client polls conservatively every minute with jitter and backs off to a bounded five-minute interval after errors. It permits one token-refresh retry on 401, rejects redirects, bounds read/parse to 8 KiB and validates the exact response protocol/topics/cursor. Offline/malformed/auth failures do not erase credentials, advance a cursor or fabricate a successful notification.

The replacement retains the supplied `EventsClient` subscribe/start/stop/reconnect/onReady surface and existing account-incarnation callback. It uses the existing authenticated account resolver, native broker awaited-read lease and producer stop. Stop aborts and awaits the physically settled request; cached refresh tasks use their own retained native lease without hiding write failures. Original account owners stop their timers and invalidate their incarnation before shutdown waits. The existing supplied scheduler still coalesces and retries cache refreshes. Session invalidation enters the existing serialized `state.queue`/`auxCloudDiscoverSessions` path and skips disabled sync; routine invalidation enters existing read-only `syncRoutines(...,false)` reconciliation.

The cursor acknowledges delivery of an **invalidation**, not success of its subsequent content fetch, decrypt, CAS merge or local persistence. Those consumers keep their own original retry/conflict/error boundaries. No automatic action, capture or agent task is resumed by this transport.

## Routine compatibility correction

A51 expects routine-v2 direct-array GET, GET-by-ID, POST, revision-checked PATCH and device-sync. The server only offered an older routine payload plus PUT/delete. `routines-1852.ts` now matches the actual current fields, model/session configuration, statuses and device IDs. New records carry explicit stored format `aux.routine.v2` in the existing `sync_entities` table; wire responses retain the original current client shape.

Create checks an active owner device, uses the existing per-owner advisory lock, enforces bounded definitions/storage and supports an exact matching retry without overwriting a different existing definition. PATCH checks the expected revision atomically, retains tombstones and cannot revive a deleted routine. Device-sync validates the actual installation public key/fingerprint against the authenticated session, matches only its owned device and revision, and cannot reactivate paused/deleted definitions. Unchanged reports do not continually bump updatedAt/invalidate clients. Mutations lock the live user/device rows where necessary and recheck active ownership, preserving account-deletion/revocation boundaries. No routine code executes in the service or fixtures.

Unrecognized old routine records are preserved with `ROUTINE_FORMAT_UNSUPPORTED`; they are never silently parsed as v2, filtered out, overwritten or deleted. Old PUT/delete calls refuse with a version/revision error. The old unmounted routine schema is removed; projects retain their existing route. Fresh absent user settings now return `{sync:false}`, matching the actual client's required field without enabling cloud sync or writing state.

Cloud routine execution has no real server executor and explicitly returns `CLOUD_ROUTINE_UNAVAILABLE`. Device routines use the existing local scheduler; this is not a launch exclusion approval for advertised cloud execution. Remaining capability disposition needs the owner and actual-app evidence. The format marker is new-record-only, not a migration of existing cloud/owner data.

## Source integration

Apply `transformAuxEventPolling({text,source})` from `vendor/provided/aux-event-poll-integration.mjs` to **both** complete daemon leaves. It accepts the pinned A51, cloud-transfer or final-runtime identity source, validates seven exact count-one joins and appends finite helpers (eight ledger anchors). The root's experimental-settings migration may run between identity and events: pass the pinned pre-migration source as `source` while all event anchors still must match the current composed text. No edit touches experimental-setting/context atoms.

`source-check.json` pins the complete cloud-transfer + final-runtime + polling outputs and their private generated directory. Include generator/helper/pins in cumulative provenance. The exact source-order tests parse both complete leaves. Root owns native compilation, resource projection, packaging and actual app operation; the accepted A38 app remains unchanged.

Cloud activation must use matching `app.ts`, `events.ts`, `routines-1852.ts`, `auth.ts` schema export, `sync.ts` and Next rewrites. No schema migration is added; retain the current twelve-migration manifest. Current deployed older source does not support this transport merely because health succeeds.

## Focused evidence

Service TypeScript checking passes. Three server cases use actual current DDL and private in-memory PostgreSQL plus the real handlers/Neon query transport: owner-isolated event snapshots detect changed/deleted non-max rows and session/settings updates; invalid/unauthenticated poll requests stop before storage; complete routine create/retry/CAS/stale/foreign-device/foreign-owner/device-sync/legacy/tombstone journeys preserve data and never run work. Initial failures were a fixture's wrong Neon batch envelope and a real strict-schema idempotent-create error; both were corrected and retained focused results now pass.

Three daemon cases execute the actual replacement class with synthetic network/timers: normal cursor/interval behavior, one authenticated refresh, late account replacement, physical cancel settlement, oversized/malformed/offline responses and bounded retries; both actual full daemon successors compose and parse. There is no live provider/cloud request or native build in these checks. `client-tests.txt`, `server-tests.txt` and `routine-tests.txt` record the focused results.

## Finite J5 after concrete activation/account consent

1. Pin the integrated source/deployment and unchanged migration manifest. Activate only reviewed Aux destinations; production secrets/backup/DNS/webhook work remains root/operator-owned.
2. Sign in two disposable independent sessions for the same approved synthetic account. Verify `/events/poll` requires live authentication, returns an initial bounded cursor, returns no invalidation when unchanged, and invalidates only the owner after an accepted settings/project/Drive/session change. A second account must stay unchanged. Revoke one session; its next poll must fail authentication without credential leakage.
3. In the matching packaged app, observe the invalidation actually reaching successful encrypted content retrieval/merge and persisted original session data. Exercise one real conflict and offline/reconnect; cursor delivery alone does not pass sync. Confirm disabled sync remains disabled. Quit during a poll and verify real request/refresh/native settlement; repeat only a demonstrated failed portion.
4. Create one explicitly paused disposable device routine. Observe list/edit CAS/stale refusal and matching-device applied revision, then tombstone it. No scheduled inference/action is needed. If cloud routines remain advertised, require a real executor or an approved explicit scope decision.
5. Complete the existing private attachment/share/revoke/delete journey on that exact deployment. Public sharing still uses its real no-store route; this transport adds no false promise of content synchronization or link revocation. Scheduled backup, alert, independent key and restore acceptance remain separate O1 work.
