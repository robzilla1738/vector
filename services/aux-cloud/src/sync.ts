import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { sql } from './db';

type User = { id: string; clerkId: string; email: string; sessionId: string };
export const syncRoutes = new Hono<{ Variables: { user: User } }>();
const MAX_OBJECT = 3_145_728;
const MAX_PLAINTEXT = 2_097_152;
const MAX_JSON = 4_000_000;
const MAX_ACCOUNT_OBJECTS = 1000;
const encryptedObject = z.object({ version: z.literal(1), alg: z.literal('aes-256-gcm'), nonce: z.string().regex(/^[A-Za-z0-9+/]{16}$/), ciphertext: z.string().max(2_796_204).regex(/^[A-Za-z0-9+/]*={0,2}$/), tag: z.string().regex(/^[A-Za-z0-9+/]{22}==$/) }).strict();
type FileEncryptionContext = { userId: string; path: string; generation: number };
function fileAAD(context: FileEncryptionContext) {
  if (!context.userId || !Number.isSafeInteger(context.generation) || context.generation < 0 || !context.path || /[\\\0]/.test(context.path) || context.path.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid sync encryption context');
  return Buffer.from(JSON.stringify(['aux.agent-file.v1', context.userId, context.path, context.generation]));
}
/** Reference adapter: accepts an existing 32-byte sync key; performs no HKDF/domain migration. */
export function encryptSyncObject(plaintext: Uint8Array, key: Uint8Array, context: FileEncryptionContext): Uint8Array {
  if (key.byteLength !== 32) throw new Error('Sync encryption requires a 32-byte key');
  if (plaintext.byteLength > MAX_PLAINTEXT) throw new Error('Plaintext sync object exceeds 2 MiB');
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(fileAAD(context));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const serialized = Buffer.from(JSON.stringify({ version: 1, alg: 'aes-256-gcm', nonce: nonce.toString('base64'), ciphertext: ciphertext.toString('base64'), tag: cipher.getAuthTag().toString('base64') }));
  if (serialized.length > MAX_OBJECT) throw new Error('Encrypted object exceeds the 3 MiB storage limit');
  return serialized;
}
export function decryptSyncObject(serialized: Uint8Array, key: Uint8Array, context: FileEncryptionContext): Uint8Array {
  if (key.byteLength !== 32 || serialized.byteLength > MAX_OBJECT) throw new Error('Invalid encrypted sync object');
  const envelope = encryptedObject.parse(JSON.parse(Buffer.from(serialized).toString('utf8')));
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.nonce, 'base64'));
  decipher.setAAD(fileAAD(context));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]);
}
const iso = z.string().datetime({ offset: true });
const id = z.string().min(1).max(128);
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const path = z.string().min(1).max(1024).refine(value => !value.startsWith('/') && !/[\\\0]/.test(value) && value.split('/').every(part => part !== '' && part !== '.' && part !== '..'), 'Invalid logical path');
const manifest = z.object({ formatVersion: z.literal(1), files: z.array(z.object({ path, sha256: sha, size: z.number().int().min(0).max(MAX_PLAINTEXT), objectSha256: sha, objectSize: z.number().int().min(0).max(MAX_OBJECT), encryption: z.literal('aes-256-gcm'), generation: z.number().int().nonnegative() }).strict()).max(1000) }).strict().refine(value => new Set(value.files.map(file => file.path)).size === value.files.length, 'Duplicate logical path');
const project = z.object({ id, name: z.string().min(1).max(500), icon: z.string().min(1).max(500), color: z.string().min(1).max(100), workspaceKind: z.enum(['managed', 'external']), archivedAt: iso.nullable(), createdAt: iso, updatedAt: iso }).strict();
const routine = z.object({ id, projectId: id.nullable(), name: z.string().min(1).max(500), prompt: z.string().max(100_000), kind: z.enum(['cron', 'heartbeat']), triggerKind: z.enum(['schedule', 'event']), eventFilter: z.unknown().optional(), expiresAt: z.string().max(100).optional(), state: z.enum(['active', 'draft', 'dismissed']), source: z.enum(['manual', 'suggestion']), scheduleKind: z.enum(['once', 'recurring']), rrule: z.string().max(2000), runAt: z.string().max(100).optional(), timezone: z.string().min(1).max(100), model: z.unknown().optional(), permissionMode: z.string().max(100).optional(), runtimeConfig: z.unknown().optional(), pausedAt: iso.optional(), pausedBy: z.enum(['user', 'system']).optional(), pauseReason: z.string().max(2000).optional(), deletedAt: iso.nullable().optional(), suggestionReason: z.string().max(2000).optional(), dismissedAt: iso.optional(), createdAt: iso, updatedAt: iso }).strict();

function fail(status: 400 | 403 | 404 | 409 | 412 | 413 | 428 | 503, code: string, message: string): never {
  throw new HTTPException(status, { res: Response.json({ error: { code, message } }, { status }) });
}
async function readBytes(request: Request, limit: number) {
  if (Number(request.headers.get('content-length')) > limit) fail(413, 'PAYLOAD_TOO_LARGE', 'Request exceeds the supported size.');
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Buffer[] = [];
  let length = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.byteLength;
      if (length > limit) { await reader.cancel(); fail(413, 'PAYLOAD_TOO_LARGE', 'Request exceeds the supported size.'); }
      chunks.push(Buffer.from(next.value));
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
async function json<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  let value: unknown;
  try { value = JSON.parse((await readBytes(request, MAX_JSON)).toString('utf8')); }
  catch (error) { if (error instanceof HTTPException) throw error; fail(400, 'INVALID_JSON', 'Request must contain JSON.'); }
  const parsed = schema.safeParse(value);
  if (!parsed.success) fail(400, 'INVALID_INPUT', parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ').slice(0, 2000));
  return parsed.data;
}
function etag(revision: unknown) { return `"${revision}"`; }
syncRoutes.use('*', async (c, next) => {
  if (!c.get('user')?.id) throw new HTTPException(401);
  c.header('Cache-Control', 'no-store');
  await next();
});
syncRoutes.get('/sync/agent-files/head', async c => {
  const [row] = await sql`SELECT revision, manifest FROM sync_heads WHERE user_id = ${c.get('user').id}`;
  if (!row) fail(404, 'NOT_FOUND', 'No sync head exists.');
  const tag = etag(row.revision);
  c.header('ETag', tag);
  if (c.req.header('If-None-Match')?.split(',').map(value => value.trim()).includes(tag)) return c.body(null, 304);
  return c.json(row.manifest);
});
syncRoutes.put('/sync/agent-files/head', async c => {
  const body = await json(c.req.raw, manifest);
  const match = c.req.header('If-Match');
  const first = c.req.header('If-None-Match') === '*';
  if ((!match && !first) || (match && first)) fail(428, 'PRECONDITION_REQUIRED', 'Supply exactly one If-Match ETag or If-None-Match: *.');
  const user = c.get('user').id;
  const [account] = await sql`SELECT sync_generation FROM aux_users WHERE id = ${user}`;
  if (!account || body.files.some(file => file.generation !== account.sync_generation)) fail(409, 'SYNC_GENERATION_MISMATCH', 'Refresh account authentication before syncing another key generation.');
  if (body.files.length) {
    const rows = await sql`SELECT sha256, octet_length(content) AS size FROM sync_objects WHERE user_id = ${user} AND sha256 = ANY(${body.files.map(file => file.objectSha256)}::text[])`;
    const sizes = new Map(rows.map(row => [row.sha256, Number(row.size)]));
    if (body.files.some(file => sizes.get(file.objectSha256) !== file.objectSize)) fail(409, 'OBJECT_MISSING', 'Upload every referenced object with the correct size before updating the head.');
  }
  const encoded = JSON.stringify(body);
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${user}, 0))`,
    // Give objects leaving the live manifest a full grace period for in-flight readers.
    sql`UPDATE sync_objects SET last_referenced_at = now() WHERE user_id = ${user} AND sha256 IN (SELECT f->>'objectSha256' FROM sync_heads h CROSS JOIN LATERAL jsonb_array_elements(h.manifest->'files') f WHERE h.user_id = ${user})`,
    first
      ? sql`INSERT INTO sync_heads (user_id, manifest) SELECT ${user}, ${encoded}::jsonb WHERE EXISTS (SELECT 1 FROM aux_users WHERE id = ${user} AND sync_generation = ${account.sync_generation}) AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(${encoded}::jsonb->'files') f WHERE NOT EXISTS (SELECT 1 FROM sync_objects o WHERE o.user_id = ${user} AND o.sha256 = f->>'objectSha256' AND octet_length(o.content) = (f->>'objectSize')::integer)) ON CONFLICT (user_id) DO NOTHING RETURNING revision, manifest`
      : sql`UPDATE sync_heads SET manifest = ${encoded}::jsonb, revision = revision + 1, updated_at = now() WHERE user_id = ${user} AND ('"' || revision::text || '"') = ${match!} AND EXISTS (SELECT 1 FROM aux_users WHERE id = ${user} AND sync_generation = ${account.sync_generation}) AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(${encoded}::jsonb->'files') f WHERE NOT EXISTS (SELECT 1 FROM sync_objects o WHERE o.user_id = ${user} AND o.sha256 = f->>'objectSha256' AND octet_length(o.content) = (f->>'objectSize')::integer)) RETURNING revision, manifest`,
    sql`UPDATE sync_objects SET last_referenced_at = now() WHERE user_id = ${user} AND sha256 IN (SELECT f->>'objectSha256' FROM sync_heads h CROSS JOIN LATERAL jsonb_array_elements(h.manifest->'files') f WHERE h.user_id = ${user})`,
  ]);
  const row = results[2]?.[0];
  if (!row) fail(412, 'PRECONDITION_FAILED', 'The sync head changed; fetch and merge the current head.');
  c.header('ETag', etag(row.revision));
  return c.json(row.manifest);
});
syncRoutes.put('/sync/agent-files/objects/:hash', async c => {
  const hash = sha.safeParse(c.req.param('hash'));
  if (!hash.success) fail(400, 'INVALID_HASH', 'Object ID must be a SHA-256 hex digest.');
  const bytes = await readBytes(c.req.raw, MAX_OBJECT);
  if (createHash('sha256').update(bytes).digest('hex') !== hash.data) fail(400, 'HASH_MISMATCH', 'Object bytes do not match their SHA-256 ID.');
  let envelope: unknown;
  try { envelope = JSON.parse(bytes.toString('utf8')); } catch { envelope = null; }
  if (!encryptedObject.safeParse(envelope).success) fail(403, 'ENCRYPTED_SYNC_REQUIRED', 'Sync object uploads require the Aux AES-GCM envelope adapter; plaintext files and provider credentials are not accepted.');
  const user = c.get('user').id;
  // A single owner-scoped advisory lock bounds concurrent object uploads and quota checks.
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${user}, 0))`,
    sql`INSERT INTO sync_objects (user_id, sha256, content) SELECT ${user}, ${hash.data}, decode(${bytes.toString('base64')}, 'base64') WHERE EXISTS (SELECT 1 FROM sync_objects WHERE user_id = ${user} AND sha256 = ${hash.data}) OR ((SELECT count(*) FROM sync_objects WHERE user_id = ${user}) < ${MAX_ACCOUNT_OBJECTS} AND (SELECT coalesce(sum(octet_length(content)), 0) FROM sync_objects WHERE user_id = ${user}) + ${bytes.length} <= (SELECT CASE WHEN plan = 'max' AND status IN ('active','trialing') THEN 21474836480::bigint WHEN plan = 'pro' AND status IN ('active','trialing') THEN 5368709120::bigint ELSE 104857600::bigint END FROM (SELECT (SELECT plan FROM aux_subscriptions WHERE user_id = ${user}) AS plan, (SELECT status FROM aux_subscriptions WHERE user_id = ${user}) AS status) subscription)) ON CONFLICT (user_id, sha256) DO UPDATE SET sha256 = EXCLUDED.sha256 RETURNING sha256`,
  ]);
  if (!results[1]?.length) fail(413, 'STORAGE_QUOTA', 'Sync object quota reached.');
  return c.json({ ok: true });
});
syncRoutes.get('/sync/agent-files/objects/:hash', async c => {
  if (!sha.safeParse(c.req.param('hash')).success) fail(400, 'INVALID_HASH', 'Invalid object hash.');
  const [row] = await sql`SELECT encode(content, 'base64') AS data FROM sync_objects WHERE user_id = ${c.get('user').id} AND sha256 = ${c.req.param('hash')}`;
  if (!row) fail(404, 'NOT_FOUND', 'Object not found.');
  c.header('Content-Type', 'application/octet-stream');
  c.header('X-Content-Type-Options', 'nosniff');
  return c.body(new Uint8Array(Buffer.from(row.data, 'base64')));
});
syncRoutes.put('/sync/agent-files/cookies', c => c.json({ error: { code: 'ENCRYPTED_SYNC_REQUIRED', message: 'Cookie sync is disabled until the desktop supplies an authenticated encrypted envelope.' } }, 403));
syncRoutes.delete('/sync/agent-files/cookies', c => c.json({ ok: true }));

for (const [plural, kind, schema] of [['projects', 'project', project], ['routines', 'routine', routine]] as const) {
  syncRoutes.get(`/${plural}`, async c => {
    const rows = await sql`SELECT payload FROM sync_entities WHERE user_id = ${c.get('user').id} AND kind = ${kind} ORDER BY entity_id`;
    return c.json(rows.map(row => row.payload));
  });
  syncRoutes.put(`/${plural}/:id`, async c => {
    const payload = await json(c.req.raw, schema);
    if (payload.id !== c.req.param('id')) fail(400, 'ID_MISMATCH', 'Body and route IDs must match.');
    await sql`INSERT INTO sync_entities (user_id, kind, entity_id, payload) VALUES (${c.get('user').id}, ${kind}, ${payload.id}, ${JSON.stringify(payload)}::jsonb) ON CONFLICT (user_id, kind, entity_id) DO UPDATE SET payload = EXCLUDED.payload WHERE (sync_entities.payload->>'updatedAt')::timestamptz <= (EXCLUDED.payload->>'updatedAt')::timestamptz`;
    return c.json({ ok: true });
  });
  syncRoutes.delete(`/${plural}/:id`, async c => {
    await sql`DELETE FROM sync_entities WHERE user_id = ${c.get('user').id} AND kind = ${kind} AND entity_id = ${c.req.param('id')}`;
    return c.json({ ok: true });
  });
}
syncRoutes.put('/users/settings', async c => {
  const payload = await json(c.req.raw, z.record(z.string(), z.unknown()));
  await sql`INSERT INTO sync_entities (user_id, kind, entity_id, payload) VALUES (${c.get('user').id}, 'settings', 'settings', ${JSON.stringify(payload)}::jsonb) ON CONFLICT (user_id, kind, entity_id) DO UPDATE SET payload = EXCLUDED.payload`;
  return c.json({ ok: true });
});
syncRoutes.get('/users/settings', async c => {
  const [row] = await sql`SELECT payload FROM sync_entities WHERE user_id = ${c.get('user').id} AND kind = 'settings' AND entity_id = 'settings'`;
  return c.json(row?.payload ?? {});
});

function wrappingKey() {
  const raw = process.env.AUX_DATA_ENCRYPTION_KEY;
  if (!raw || !/^[A-Za-z0-9+/]{43}=$/.test(raw)) fail(503, 'SYNC_KEY_UNAVAILABLE', 'Sync key storage is not configured.');
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) fail(503, 'SYNC_KEY_UNAVAILABLE', 'Sync key storage is not configured.');
  return key;
}
function wrap(value: Buffer, user: string, generation: number) {
  const key = wrappingKey();
  try {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from(`aux.sync-key.v1:${user}:${generation}`));
    return { v: 1, mode: 'server_wrapped', iv: iv.toString('base64'), ct: Buffer.concat([cipher.update(value), cipher.final()]).toString('base64'), tag: cipher.getAuthTag().toString('base64') };
  } finally { key.fill(0); }
}
function unwrap(envelope: { iv: string; ct: string; tag: string }, user: string, generation: number) {
  const key = wrappingKey();
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
    decipher.setAAD(Buffer.from(`aux.sync-key.v1:${user}:${generation}`));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(envelope.ct, 'base64')), decipher.final()]);
  } finally { key.fill(0); }
}
syncRoutes.get('/sync/key/status', async c => {
  wrappingKey().fill(0);
  const [row] = await sql`SELECT u.sync_generation, k.generation, k.revision FROM aux_users u LEFT JOIN sync_keys k ON k.user_id = u.id WHERE u.id = ${c.get('user').id}`;
  if (!row) fail(404, 'NOT_FOUND', 'Account not found.');
  return c.json({ state: row.generation == null ? 'provisioning' : row.generation === row.sync_generation ? 'ready' : 'device_required', syncGeneration: row.sync_generation, revision: row.revision ?? 0, custody: null, custodyMode: 'server_wrapped' });
});
syncRoutes.post('/sync/key/resolve', async c => {
  const user = c.get('user').id;
  const [account] = await sql`SELECT sync_generation FROM aux_users WHERE id = ${user}`;
  if (!account) fail(404, 'NOT_FOUND', 'Account not found.');
  const value = randomBytes(32);
  try {
    const envelope = wrap(value, user, account.sync_generation);
    const [row] = await sql`INSERT INTO sync_keys (user_id, generation, wrapped_key) SELECT ${user}, ${account.sync_generation}, ${JSON.stringify(envelope)}::jsonb WHERE EXISTS (SELECT 1 FROM aux_users WHERE id = ${user} AND sync_generation = ${account.sync_generation}) ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id RETURNING wrapped_key, generation, revision`;
    if (!row || row.generation !== account.sync_generation) fail(409, 'SYNC_KEY_DEVICE_REQUIRED', 'Sync generation changed; recover encrypted browser data before enrolling a new key.');
    const resolved = unwrap(row.wrapped_key, user, row.generation);
    try { return c.json({ cskB64: resolved.toString('base64'), syncGeneration: row.generation, revision: row.revision }); }
    finally { resolved.fill(0); }
  } finally { value.fill(0); }
});
syncRoutes.post('/sync/key/enroll', async c => {
  const payload = await json(c.req.raw, z.object({ cskB64: z.string().regex(/^[A-Za-z0-9+/]{43}=$/) }).strict());
  const user = c.get('user').id;
  const [account] = await sql`SELECT sync_generation FROM aux_users WHERE id = ${user}`;
  if (!account) fail(404, 'NOT_FOUND', 'Account not found.');
  const value = Buffer.from(payload.cskB64, 'base64');
  try {
    const [row] = await sql`INSERT INTO sync_keys (user_id, generation, wrapped_key) SELECT ${user}, ${account.sync_generation}, ${JSON.stringify(wrap(value, user, account.sync_generation))}::jsonb WHERE EXISTS (SELECT 1 FROM aux_users WHERE id = ${user} AND sync_generation = ${account.sync_generation}) ON CONFLICT (user_id) DO NOTHING RETURNING generation, revision`;
    if (!row) fail(409, 'KEY_ALREADY_ENROLLED', 'A sync key already exists; resolve it instead of replacing existing encrypted data authority.');
    return c.json({ state: 'ready', syncGeneration: row.generation, revision: row.revision });
  } finally { value.fill(0); }
});

const image = z.object({ data: z.string().max(2_000_000).regex(/^[A-Za-z0-9+/]*={0,2}$/), mimeType: z.enum(['image/png', 'image/jpeg', 'image/gif', 'image/webp']) }).strict();
const tool = z.object({ name: z.string().min(1).max(200), input: z.unknown(), output: z.string().max(100_000), details: z.unknown().optional(), images: z.array(image).max(20).default([]), isError: z.boolean() }).strict();
const message = z.discriminatedUnion('role', [
  z.object({ role: z.literal('user'), content: z.string().min(1).max(100_000), timestamp: z.number().int().nonnegative() }).strict(),
  z.object({ role: z.literal('assistant'), content: z.string().max(100_000), tools: z.array(tool).max(500), runItems: z.array(z.discriminatedUnion('type', [z.object({ type: z.literal('text'), content: z.string().min(1).max(100_000) }).strict(), z.object({ type: z.literal('tool'), tool }).strict()])).max(1000).optional(), timestamp: z.number().int().nonnegative(), elapsedMs: z.number().int().nonnegative() }).strict(),
]);
const share = z.object({ sourceSessionId: id, title: z.string().trim().min(1).max(200), messages: z.array(message).max(2000) }).strict().refine(body => body.messages.every(entry => entry.role === 'user' || entry.content.length > 0 || entry.tools.length > 0), 'Assistant messages require content or tools');
export async function publishShareForUser(userId: string, value: unknown) {
  const payload = share.parse(value);
  if (JSON.stringify(payload).length > 50_000_000) fail(413, 'PAYLOAD_TOO_LARGE', 'Shared transcript exceeds 50 million characters.');
  const [row] = await sql`INSERT INTO shared_sessions (id, user_id, source_session_id, title, messages) VALUES (${randomBytes(18).toString('base64url')}, ${userId}, ${payload.sourceSessionId}, ${payload.title}, ${JSON.stringify(payload.messages)}::jsonb) ON CONFLICT (user_id, source_session_id) DO UPDATE SET title = EXCLUDED.title, messages = EXCLUDED.messages, revoked_at = NULL, id = CASE WHEN shared_sessions.revoked_at IS NOT NULL THEN EXCLUDED.id ELSE shared_sessions.id END, created_at = CASE WHEN shared_sessions.revoked_at IS NOT NULL THEN now() ELSE shared_sessions.created_at END RETURNING id, title, created_at`;
  return { id: row.id, title: row.title, createdAt: new Date(row.created_at).toISOString() };
}
syncRoutes.post('/shared-sessions', async c => c.json(await publishShareForUser(c.get('user').id, await json(c.req.raw, share))));
syncRoutes.get('/shared-sessions/source/:id', async c => {
  const [row] = await sql`SELECT id, title, created_at FROM shared_sessions WHERE user_id = ${c.get('user').id} AND source_session_id = ${c.req.param('id')} AND revoked_at IS NULL`;
  return c.json(row ? { id: row.id, title: row.title, createdAt: new Date(row.created_at).toISOString() } : null);
});
syncRoutes.delete('/shared-sessions/source/:id', async c => {
  await sql`UPDATE shared_sessions SET revoked_at = now(), messages = '[]'::jsonb WHERE user_id = ${c.get('user').id} AND source_session_id = ${c.req.param('id')} AND revoked_at IS NULL`;
  return c.json({ ok: true });
});
export async function getPublicShare(shareId: string) {
  if (!/^[A-Za-z0-9_-]{12,32}$/.test(shareId)) return null;
  const [row] = await sql`SELECT id, title, messages, created_at FROM shared_sessions WHERE id = ${shareId} AND revoked_at IS NULL`;
  return row ? { id: row.id, title: row.title, messages: row.messages, createdAt: new Date(row.created_at).toISOString() } : null;
}

/** Protected maintenance only. Owner locks serialize GC against head CAS and uploads. */
export async function cleanOrphanSyncObjects(limit = 100) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw new Error('Sync GC limit must be between 1 and 1000');
  const owners = await sql`SELECT DISTINCT o.user_id FROM sync_objects o WHERE o.last_referenced_at < now() - interval '24 hours' AND NOT EXISTS (SELECT 1 FROM sync_heads h CROSS JOIN LATERAL jsonb_array_elements(h.manifest->'files') f WHERE h.user_id = o.user_id AND f->>'objectSha256' = o.sha256) ORDER BY o.user_id LIMIT 20`;
  let deleted = 0;
  for (const owner of owners) {
    if (deleted >= limit) break;
    const result = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${owner.user_id}, 0))`,
      sql`WITH candidates AS (SELECT o.sha256 FROM sync_objects o WHERE o.user_id = ${owner.user_id} AND o.last_referenced_at < now() - interval '24 hours' AND NOT EXISTS (SELECT 1 FROM sync_heads h CROSS JOIN LATERAL jsonb_array_elements(h.manifest->'files') f WHERE h.user_id = o.user_id AND f->>'objectSha256' = o.sha256) ORDER BY o.last_referenced_at LIMIT ${limit - deleted}) DELETE FROM sync_objects o USING candidates c WHERE o.user_id = ${owner.user_id} AND o.sha256 = c.sha256 RETURNING o.sha256`,
    ]);
    deleted += result[1].length;
  }
  return { deleted };
}
