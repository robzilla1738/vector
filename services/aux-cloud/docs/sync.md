# Compatible sync and public sharing boundary

`syncRoutes` mounts at the API root after authentication. Root middleware must set a verified `{id,clerkId,email,sessionId}` user. Every private query scopes by the internal UUID. Public reads use only `getPublicShare`; revoked/unknown IDs return null. Set no-store on public rendered responses too, so revocation is not hidden by CDN caching.

Migration002 expects `aux_users(id uuid)` from migration001. Private objects are initially stored in Postgres bytea, limited to3MiB encrypted bytes each (2MiB plaintext) and1000 objects per user, with100MiB free/5GiB Pro/20GiB Max byte quotas. These sync allocations are separate from attachment quotas. cleanOrphanSyncObjects implements bounded conservative collection: head CAS, uploads and GC take the same owner advisory lock, old/new head references receive a fresh timestamp, and only unreferenced objects older than24hours are removed. Migration007 adds last_referenced_at. Protected scheduling and real database concurrency verification remain required before runtime acceptance. No migration is automatically applied by importing this module.

## Agent file protocol

GET/PUT `/sync/agent-files/head` preserves the supplied formatVersion1 manifest. GET returns ETag and honors If-None-Match; missing heads return404. PUT requires exactly If-Match or If-None-Match:* and uses an atomic PostgreSQL compare-and-set. Stale writes return412. Every referenced object must already exist for the same owner with the matching size. Object IDs remain SHA-256 of stored bytes. GET/PUT `/sync/agent-files/objects/:hash` is private, hash-verified and immutable.

The supplied client uploads raw credentials.json and plaintext cookies. This implementation intentionally requires an encrypted desktop adapter before accepting object uploads: serialized JSON `{version:1,alg:"aes-256-gcm",nonce,ciphertext,tag}`, with base64 nonce12bytes/tag16bytes. Wire head entries retain plaintext sha256/size for the supplied merge engine and add objectSha256/objectSize/encryption/generation for encrypted storage. Object URL hashes describe the serialized encrypted envelope; backend checks referenced ciphertext size and generation. The adapter must bind authenticated encryption to logical path, account and key generation using AAD, retain local plaintext merge hashes separately and decrypt before the supplied merge/apply functions. The count-checked, inactive daemon adapter is vendor/provided/cloud-sync-adapter.mjs. It preserves the supplied merge engine, converts encrypted wire metadata and uses the actual account sync key/generation. Integration into daemon staging, signed-byte approval and real two-device behavior still remain. Non-envelope uploads fail with ENCRYPTED_SYNC_REQUIRED before their bytes reach storage. An encrypted credentials.json object may then be referenced like other encrypted files. Cookie PUT always refuses until an encrypted cookie adapter exists; DELETE is idempotent because no cookies are stored.

Projects/routines retain the exact supplied JSON fields, timestamps and direct-array GET response; updates never overwrite newer timestamps. Settings use owner-scoped JSONB. These metadata endpoints currently store plaintext on the server; do not describe all sync as end-to-end encrypted.

## Browser sync key custody

`AUX_DATA_ENCRYPTION_KEY` is exactly32 random bytes, canonical padded base64, supplied only server-side. Sync keys are32random bytes wrapped with AES-256-GCM, per-user/generation AAD, random nonce and authentication tag. Race-safe resolve returns the existing key; enrollment never replaces an existing key. Private temporary buffers are cleared where possible; JavaScript strings cannot be reliably erased.

This is **server-wrapped custody**, not a cloud KMS and not client-only wrapping. Status returns the supplied nullable `custody:null` plus explicit `custodyMode:"server_wrapped"`; it never falsely claims `kms` or `client_wrapped`. Operators must manage wrapping-key backup/rotation outside the database. Actual managed KMS rotation, generation reset and recovery/device-required flows remain integration work; existing keys cannot be overwritten through enrollment. Do not deploy encrypted browser-sync consumers without a documented recovery and rotation policy.

## Public sharing

Authenticated publish/get-by-source/delete preserve the supplied routes and response `{id,title,createdAt}`. Publish uses random144-bit IDs. Republishing a revoked source generates a new link; the old link remains inaccessible. Revocation clears stored message content. Public renderer must escape text, sanitize Markdown, use restrictive CSP, and avoid executing tool/HTML output. Only PNG/JPEG/GIF/WebP inline images are accepted; SVG is rejected.

The supplied transcript limits are retained per field, but this endpoint enforces a4,000,000-byte total JSON body to stay below Vercel's4.5MB request limit. The attachments module adds an authenticated private-Blob upload-and-commit extension supporting50MB JSON imports; the supplied desktop publisher still needs to adopt this extension for oversized transcripts. No cloud attachment recovery contract is implemented: supplied session attachments remain local files, and need an explicit manifest/restore adapter before private Blob storage can restore them faithfully.

## Focused verification still required

Run typecheck against the actual dependency versions, apply migrations only to the approved Aux database, then verify two-user isolation, simultaneous ETag writes, missing/hash-mismatched objects, encrypted-envelope refusal, key stability/decryption after restart, and publish/revoke/republish. These files alone are not deployed/runtime acceptance evidence.
