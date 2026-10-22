# Encrypted session discovery and historical restoration

This slice implements a new compatible Aux cloud boundary. It does not replace the supplied UI, does not activate itself during staging, and does not establish actual desktop/two-device acceptance by passing fixtures.

## Server integration

Apply migration008 after001–007. Mount `sessionSyncRoutes` after `requireUser` at the API root. Route `/sync/sessions` through the same Next API handler as other private routes. Invoke `cleanRetiredSessionBlobs` from the protected maintenance handler. The root attachment-binding INSERT must take the same owner advisory lock as snapshot writes and refuse blob IDs in `aux_session_snapshots` or `aux_retired_session_blobs`; one SQL statement containing a lock CTE is insufficient because its read snapshot may precede the wait. Use a transaction whose first statement is `SELECT pg_advisory_xact_lock(hashtextextended(userUuid,0))`, then perform the guarded binding write as the second statement.

The server stores only owner UUID, opaque session ID, revision, key generation, private Blob pointer and timestamps. It never parses or decrypts conversation content or restores execution state.

- GET `/sync/sessions?cursor=<last-id>` lists200 records and a nullable nextCursor, including deletion tombstones.
- GET `/sync/sessions/:id` returns a record and ETag.
- PUT `/sync/sessions/:id` takes `{blobId,generation}` with exactly `If-None-Match:*` for creation or `If-Match:"revision"` for replacement. The Blob must be ready, private, owned by the authenticated user and uploaded as application/json. Generation must match the authoritative account row. Concurrent updates permit one winner; stale updates return412. Retired blobs cannot be reattached. A deleted session ID cannot be silently recreated.
- DELETE `/sync/sessions/:id` requires the expected ETag. For a local deletion that was never published, `If-None-Match:*` creates a tombstone only if no cloud record exists. This prevents a later offline device resurrecting the same ID. Stale deletion never erases newer remote work.

Records contain `{id,revision,generation,blobId,sha256,size,updatedAt,deletedAt}`. Content downloads use the existing authenticated `/attachments/:blobId/content` boundary. Uploads reuse the existing private intent → presigned PUT → verified commit flow. The native client uses X-Aux-If-Match / X-Aux-If-None-Match on writes; root serveApi must normalize these to the corresponding standard CAS headers only inside Hono. This avoids Vercel/Next converting a successful conditional PUT into304. Standard GET ETags remain unchanged; deployed HTTP verification remains required.

Replaced/deleted snapshots enter a15-minute retirement queue. Cleanup claims them under the owner lock, marks their attachment state unavailable before Blob deletion, and checks that no session/binding still references the object. The grace exceeds scoped upload-token and bounded download lifetimes. Account deletion also cascades database metadata and must retain its existing private-Blob purge workflow.

## Supplied desktop integration

Compose `cloud-session-adapter.mjs` after the encrypted file-sync and attachment adapters. It count-checks four original-source boundaries: one helper insertion, the exact SessionStore namespace, and the two supplied session-list consumers. No original UI component is rewritten. The original source hash and provenance are those pinned by the companion cloud-sync adapter.

Foreground Store insert/update/message append/archive/unarchive/clear/edit operations debounce cloud persistence. Session listing starts background discovery, so the original list remains responsive. Only active authenticated cloud accounts with sync enabled participate. Incognito and ephemeral sessions are excluded. Local metadata uses the isolated account's sync directory, owner/user/generation scoping and mode0600 files; keys and transcripts are not stored in that index. Local deletion writes a synchronous private intent journal before removing the local session, then retries its cloud tombstone after restart.

Snapshots contain selected display metadata, original `{id,msg,jsonlReadSize}` rows and turn display information. AES-256-GCM uses the actual account CSK and generation with fresh random nonces and AAD `['aux.session.v1',userUuid,cloudSessionId,generation]`. Existing HKDF labels and wrapped-key formats are unchanged. This encrypts content before cloud storage, but the account CSK currently has server-wrapped recovery custody; do not describe it as client-only zero knowledge.

Recovery validates ciphertext hash/size, authenticates user/session/generation and validates original message byte offsets before any local mutation. It reuses the original JSONL writer, original `buildSessionTurnInserts` reducer, `SessionStore.restore`, `restoreTurns` and `adoptMirrorState`. Projection replacement uses the same original SQLite tables in one transaction; it does not clear the old JSONL file before writing a replacement. No server path becomes a filesystem destination. Redirected or orphan session directories are refused.

Imported history uses current-device account/project cwd, freshly derived local permissions and default runtime configuration. Browser bindings, pending approval state, queued/steering commands and remote tool state are cleared. Previously active runs become terminal historical interrupted turns; other-device tools/agents never start automatically. Active or locally changed work is never overwritten. Concurrent divergent backups create a separately encrypted conflict copy rather than overwriting either history.

`auxCloudSessionBindingId(accountId,localId)` exposes the loaded original attachment-session alias for conflict copies. Root must use this optional alias when forming attachment manifest URLs; otherwise conflict-copy attachments do not resolve. Normal chat IDs are unchanged.

## Evidence and remaining limits

Focused local checks cover source-drift refusal; two simulated devices encrypt/decrypt and restore through the actual original JSONL writer and turn reducer; wrong user/generation rejection; local runtime authority rebasing; active-work refusal; and symlink/offset refusal. Service checks cover authentication and CAS metadata rejection. Full TypeScript checking passes. `scripts/check-session-sync-db.ts` is an explicitly gated, root-run real-Neon fixture for ownership, concurrent CAS and tombstones; it must run only against the reviewed Aux development endpoint. It does not claim physical Blob or real browser acceptance.

Still requires integration/observation: applying008 and root mounts/cleanup/binding guards; staging exact daemon bytes and approved local signing if needed; real API/Blob roundtrip and two actual app profiles; parent-before-child restoration ordering; project association repair when project sync arrives later; attachment alias integration; rename reconciliation; and crash recovery across JSONL replacement versus SQLite projection commit. A deleted-versus-newer-remote-work conflict preserves remote history and the local deletion journal pending resolution. Backup payloads over50MB remain local with an explicit failure; no truncation or fabricated cloud success occurs.
