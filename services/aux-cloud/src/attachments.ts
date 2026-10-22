import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { del, get, issueSignedToken, presignUrl } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { sql } from './db';
import type { AuthVariables } from './auth';
import { publishShareForUser } from './sync';

export const attachmentRoutes = new Hono<{ Variables: AuthVariables }>();
/** Mount outside session auth: the SDK validates Vercel's signed callback before running our handler. */
export const blobCallbackRoutes = new Hono();
const MAX_FILE = 100 * 1024 * 1024;
const MAX_SHARE = 50_000_000;
const types = ['application/octet-stream', 'application/pdf', 'application/json', 'text/plain', 'text/markdown', 'text/csv', 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/webm'] as const;
const intentSchema = z.object({ name: z.string().min(1).max(255).refine(v => !/[\r\n\0]/.test(v)), contentType: z.enum(types), size: z.number().int().min(0).max(MAX_FILE), sha256: z.string().regex(/^[a-f0-9]{64}$/), purpose: z.enum(['attachment', 'share']).default('attachment') }).strict();
const uuid = z.string().uuid();
type Attachment = { id: string; user_id: string; pathname: string; name: string; content_type: string; expected_size: number | string; expected_sha256: string; purpose: string; state: string; expires_at: string };
function reject(status: 400 | 403 | 404 | 409 | 413 | 416 | 503, code: string, message: string): never { throw new HTTPException(status, { res: Response.json({ error: { code, message } }, { status }) }); }
function blobReady() { if (!process.env.BLOB_READ_WRITE_TOKEN) reject(503, 'STORAGE_UNAVAILABLE', 'Private attachment storage is not configured.'); }
async function smallJson(request: Request) {
  if (Number(request.headers.get('content-length')) > 16_384) reject(413, 'PAYLOAD_TOO_LARGE', 'Upload control messages must fit in 16 KiB.');
  const reader = request.body?.getReader(), chunks: Buffer[] = [];
  let size = 0;
  try {
    if (reader) for (;;) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 16_384) { await reader.cancel(); reject(413, 'PAYLOAD_TOO_LARGE', 'Upload control messages must fit in 16 KiB.'); }
      chunks.push(Buffer.from(next.value));
    }
  } finally { reader?.releaseLock(); }
  const text = Buffer.concat(chunks).toString('utf8');
  try { return JSON.parse(text); } catch { reject(400, 'INVALID_JSON', 'Expected JSON.'); }
}
async function owned(userId: string, attachmentId: string): Promise<Attachment> {
  if (!uuid.safeParse(attachmentId).success) reject(404, 'NOT_FOUND', 'Attachment not found.');
  const [row] = await sql`SELECT * FROM aux_attachments WHERE id = ${attachmentId} AND user_id = ${userId} AND state <> 'deleted'`;
  if (!row) reject(404, 'NOT_FOUND', 'Attachment not found.');
  return row as Attachment;
}
function metadata(row: Attachment) { return { id: row.id, name: row.name, mimeType: row.content_type, size: Number(row.expected_size), sha256: row.expected_sha256, purpose: row.purpose, state: row.state, contentUrl: `/attachments/${row.id}/content` }; }
async function verifiedBytes(row: Attachment) {
  blobReady();
  const blob = await get(row.pathname, { access: 'private', useCache: false, abortSignal: AbortSignal.timeout(120_000) });
  if (!blob || blob.statusCode !== 200) reject(409, 'UPLOAD_INCOMPLETE', 'The private upload is not available yet.');
  const maximum = Number(row.expected_size);
  if (blob.blob.size !== maximum || blob.blob.contentType.split(';')[0] !== row.content_type) { await blob.stream.cancel(); reject(409, 'UPLOAD_MISMATCH', 'Upload size or MIME type does not match its reservation.'); }
  const reader = blob.stream.getReader(), hash = createHash('sha256'), chunks: Buffer[] = [];
  let size = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > maximum) { await reader.cancel(); reject(413, 'UPLOAD_MISMATCH', 'Uploaded content exceeds its reservation.'); }
      hash.update(next.value);
      // Only share imports need buffered JSON; attachments are verified as a bounded stream.
      if (row.purpose === 'share') chunks.push(Buffer.from(next.value));
    }
  } finally { reader.releaseLock(); }
  if (size !== maximum || hash.digest('hex') !== row.expected_sha256) reject(409, 'HASH_MISMATCH', 'Uploaded content failed integrity verification.');
  return row.purpose === 'share' ? Buffer.concat(chunks) : null;
}
async function complete(row: Attachment) {
  if (row.state === 'ready') return;
  if (row.state !== 'issued' || new Date(row.expires_at).getTime() <= Date.now()) {
    await del(row.pathname);
    reject(409, 'UPLOAD_EXPIRED', 'Upload reservation expired or was canceled.');
  }
  await verifiedBytes(row);
  const rows = await sql`UPDATE aux_attachments SET state = 'ready', verified_at = now() WHERE id = ${row.id} AND user_id = ${row.user_id} AND state = 'issued' AND expires_at > now() RETURNING id`;
  if (!rows.length) { await del(row.pathname); reject(409, 'UPLOAD_EXPIRED', 'Upload was canceled during verification.'); }
}
attachmentRoutes.use('*', async (c, next) => { if (!c.get('user')?.id) throw new HTTPException(401); c.header('Cache-Control', 'no-store'); await next(); });
attachmentRoutes.post('/attachments/intents', async c => {
  blobReady();
  const parsed = intentSchema.safeParse(await smallJson(c.req.raw));
  if (!parsed.success) reject(400, 'INVALID_INPUT', 'Provide name, permitted MIME type, size and SHA-256.');
  const value = parsed.data, user = c.get('user').id, attachmentId = randomUUID();
  if (value.purpose === 'share' && (value.size > MAX_SHARE || value.contentType !== 'application/json')) reject(400, 'INVALID_SHARE_UPLOAD', 'Shared transcript imports must be application/json and no larger than 50 MB.');
  const pathname = `aux/${user}/${attachmentId}/content`;
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${user}, 0))`,
    sql`INSERT INTO aux_attachments (id, user_id, pathname, name, content_type, expected_size, expected_sha256, purpose, expires_at) SELECT ${attachmentId}, ${user}, ${pathname}, ${value.name}, ${value.contentType}, ${value.size}, ${value.sha256}, ${value.purpose}, now() + interval '15 minutes' WHERE (SELECT coalesce(sum(expected_size), 0) FROM aux_attachments WHERE user_id = ${user} AND (state = 'ready' OR (state IN ('pending','issued') AND expires_at > now()))) + ${value.size} <= (SELECT CASE WHEN plan = 'max' AND status IN ('active','trialing') THEN 21474836480::bigint WHEN plan = 'pro' AND status IN ('active','trialing') THEN 5368709120::bigint ELSE 104857600::bigint END FROM (SELECT (SELECT plan FROM aux_subscriptions WHERE user_id = ${user}) AS plan, (SELECT status FROM aux_subscriptions WHERE user_id = ${user}) AS status) subscription) AND (SELECT count(*) FROM aux_attachments WHERE user_id = ${user} AND (state = 'ready' OR (state IN ('pending','issued') AND expires_at > now()))) < 10000 RETURNING *`,
  ]);
  const row = results[1]?.[0] as Attachment | undefined;
  if (!row) reject(413, 'STORAGE_QUOTA', 'Attachment quota reached. Delete files or choose a larger plan.');
  return c.json({ ...metadata(row), pathname, access: 'private', uploadUrl: '/attachments/upload', expiresAt: row.expires_at, clientPayload: JSON.stringify({ intentId: row.id }) }, 201);
});
attachmentRoutes.post('/attachments/upload', async c => {
  blobReady();
  const body = await smallJson(c.req.raw) as HandleUploadBody;
  if (body.type !== 'blob.generate-client-token') reject(400, 'INVALID_UPLOAD_EVENT', 'Use the signed callback endpoint for completion events.');
  const user = c.get('user').id;
  const response = await handleUpload({ body, request: c.req.raw, onBeforeGenerateToken: async (pathname, clientPayload) => {
    let payload: unknown;
    try { payload = JSON.parse(clientPayload ?? ''); } catch { reject(400, 'INVALID_UPLOAD_INTENT', 'Upload intent is required.'); }
    const parsed = z.object({ intentId: uuid }).strict().safeParse(payload);
    if (!parsed.success) reject(400, 'INVALID_UPLOAD_INTENT', 'Upload intent is required.');
    const row = await owned(user, parsed.data.intentId);
    if (row.pathname !== pathname || pathname !== `aux/${user}/${row.id}/content`) reject(403, 'INVALID_UPLOAD_PATH', 'Upload path must match the reserved owner and intent.');
    const claimed = await sql`UPDATE aux_attachments SET state = 'issued' WHERE id = ${row.id} AND user_id = ${user} AND state = 'pending' AND expires_at > now() RETURNING id`;
    if (!claimed.length) reject(409, 'INTENT_ALREADY_USED', 'Create a fresh upload intent; this one was consumed or expired.');
    const origin = process.env.AUX_API_ORIGIN;
    if (!origin || new URL(origin).protocol !== 'https:') reject(503, 'STORAGE_UNAVAILABLE', 'An HTTPS callback origin must be configured.');
    return { allowedContentTypes: [row.content_type], maximumSizeInBytes: Number(row.expected_size), addRandomSuffix: false, allowOverwrite: false, validUntil: Date.now() + 10 * 60_000, tokenPayload: JSON.stringify({ intentId: row.id, userId: user }), callbackUrl: new URL('/attachments/callback', origin).toString() };
  }, onUploadCompleted: async () => { throw new Error('Completion callback must use the signed callback route'); } });
  return c.json(response);
});
/** Native daemon transport: no Blob SDK or store credential is needed in the desktop. */
attachmentRoutes.post('/attachments/:id/upload-url', async c => {
  blobReady();
  const row = await owned(c.get('user').id, c.req.param('id'));
  const claimed = await sql`UPDATE aux_attachments SET state = 'issued' WHERE id = ${row.id} AND user_id = ${row.user_id} AND state = 'pending' AND expires_at > now() RETURNING id`;
  if (!claimed.length) reject(409, 'INTENT_ALREADY_USED', 'Create a fresh upload intent; this one was consumed or expired.');
  const validUntil = Date.now() + 10 * 60_000;
  const token = await issueSignedToken({ pathname: row.pathname, operations: ['put'], validUntil, allowedContentTypes: [row.content_type], maximumSizeInBytes: Number(row.expected_size) });
  const signed = await presignUrl(token, { operation: 'put', pathname: row.pathname, access: 'private', validUntil, allowedContentTypes: [row.content_type], maximumSizeInBytes: Number(row.expected_size), addRandomSuffix: false, allowOverwrite: false });
  return c.json({ url: signed.presignedUrl, method: 'PUT', headers: { 'Content-Type': row.content_type }, expiresAt: new Date(validUntil).toISOString() });
});
blobCallbackRoutes.post('/attachments/callback', async c => {
  blobReady();
  const body = await smallJson(c.req.raw) as HandleUploadBody;
  if (body.type !== 'blob.upload-completed') reject(400, 'INVALID_UPLOAD_EVENT', 'Expected a signed upload completion.');
  const response = await handleUpload({ body, request: c.req.raw, onBeforeGenerateToken: async () => { throw new Error('Token generation is not allowed on the callback endpoint'); }, onUploadCompleted: async ({ blob, tokenPayload }) => {
    const payload = z.object({ intentId: uuid, userId: uuid }).strict().parse(JSON.parse(tokenPayload ?? ''));
    const [raw] = await sql`SELECT * FROM aux_attachments WHERE id = ${payload.intentId} AND user_id = ${payload.userId}`;
    if (!raw) reject(404, 'NOT_FOUND', 'Upload intent not found.');
    const row = raw as Attachment;
    if (blob.pathname !== row.pathname) reject(403, 'INVALID_UPLOAD_PATH', 'Callback does not match the reserved path.');
    await complete(row);
  } });
  return c.json(response);
});
attachmentRoutes.post('/attachments/:id/commit', async c => {
  const row = await owned(c.get('user').id, c.req.param('id'));
  await complete(row);
  if (row.purpose === 'share') {
    const bytes = await verifiedBytes({ ...row, state: 'ready' });
    let payload: unknown;
    try { payload = JSON.parse(bytes!.toString('utf8')); } catch { reject(400, 'INVALID_SHARE_UPLOAD', 'Shared transcript must contain valid JSON.'); }
    return c.json({ ...metadata({ ...row, state: 'ready' }), share: await publishShareForUser(row.user_id, payload) });
  }
  return c.json(metadata({ ...row, state: 'ready' }));
});
attachmentRoutes.get('/attachments/:id', async c => c.json(metadata(await owned(c.get('user').id, c.req.param('id')))));

const bindingPath = z.string().min(1).max(1024).regex(/^attachments\/[^/\\\0]+$/).refine(value => !['.', '..'].includes(value.slice('attachments/'.length)));
const bindingSchema = z.object({ localPath: bindingPath, attachmentId: z.string().min(1).max(128), blobId: uuid }).strict();
attachmentRoutes.put('/attachment-sessions/:sessionId/files', async c => {
  const session = z.string().min(1).max(128).safeParse(c.req.param('sessionId'));
  const body = bindingSchema.safeParse(await smallJson(c.req.raw));
  if (!session.success || !body.success) reject(400, 'INVALID_ATTACHMENT_BINDING', 'A session, stored attachment path and verified blob are required.');
  const row = await owned(c.get('user').id, body.data.blobId);
  if (row.state !== 'ready' || row.purpose !== 'attachment') reject(409, 'UPLOAD_INCOMPLETE', 'Only verified private attachments may be bound to a session.');
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${row.user_id},0))`,
    sql`INSERT INTO aux_attachment_bindings(user_id,session_id,local_path,attachment_id,blob_id)
    SELECT a.user_id,${session.data},${body.data.localPath},${body.data.attachmentId},a.id FROM aux_attachments a
    WHERE a.id=${row.id} AND a.user_id=${row.user_id} AND a.state='ready' AND a.purpose='attachment'
      AND NOT EXISTS(SELECT 1 FROM aux_session_snapshots s WHERE s.user_id=a.user_id AND s.blob_id=a.id)
      AND NOT EXISTS(SELECT 1 FROM aux_retired_session_blobs r WHERE r.user_id=a.user_id AND r.blob_id=a.id)
    ON CONFLICT(user_id,session_id,local_path) DO UPDATE SET attachment_id=excluded.attachment_id,blob_id=excluded.blob_id,updated_at=now()
    RETURNING blob_id`,
  ]);
  if (!results[1]?.length) reject(409, 'UPLOAD_INCOMPLETE', 'This private upload is no longer available as an attachment.');
  return c.json({ ...metadata(row), localPath: body.data.localPath, attachmentId: body.data.attachmentId });
});
attachmentRoutes.get('/attachment-sessions/:sessionId/files', async c => {
  const localPath = bindingPath.safeParse(c.req.query('path'));
  if (!localPath.success || !z.string().min(1).max(128).safeParse(c.req.param('sessionId')).success) reject(400, 'INVALID_ATTACHMENT_BINDING', 'A stored attachment path and session are required.');
  const [row] = await sql`SELECT a.*,b.local_path,b.attachment_id FROM aux_attachment_bindings b JOIN aux_attachments a ON a.id=b.blob_id AND a.user_id=b.user_id WHERE b.user_id=${c.get('user').id} AND b.session_id=${c.req.param('sessionId')} AND b.local_path=${localPath.data} AND a.state='ready'`;
  if (!row) reject(404, 'NOT_FOUND', 'No private backup exists for this attachment.');
  return c.json({ ...metadata(row as Attachment), localPath: row.local_path, attachmentId: row.attachment_id });
});
attachmentRoutes.delete('/attachment-sessions/:sessionId/files', async c => {
  const localPath = bindingPath.safeParse(c.req.query('path'));
  if (!localPath.success) reject(400, 'INVALID_ATTACHMENT_BINDING', 'A stored attachment path is required.');
  await sql`DELETE FROM aux_attachment_bindings WHERE user_id=${c.get('user').id} AND session_id=${c.req.param('sessionId')} AND local_path=${localPath.data}`;
  return c.json({ ok: true });
});

export function parseByteRange(value: string | undefined, size: number) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2]) || size === 0) reject(416, 'INVALID_RANGE', 'A single valid byte range is required.');
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) reject(416, 'INVALID_RANGE', 'Byte range is outside the attachment.');
  return { start, end };
}
export function rangeStream(source: ReadableStream<Uint8Array>, start: number, end: number) {
  const reader = source.getReader();
  let position = 0;
  return new ReadableStream<Uint8Array>({ async pull(controller) {
    try {
      for (;;) {
        const next = await reader.read();
        if (next.done) { if (position <= end) throw new Error('Attachment stream ended before the expected range'); controller.close(); return; }
        const previous = position;
        position += next.value.length;
        if (position <= start) continue;
        const chunk = next.value.subarray(Math.max(0, start - previous), Math.min(next.value.length, end + 1 - previous));
        if (chunk.length) controller.enqueue(chunk);
        if (position > end) { controller.close(); await reader.cancel(); }
        return;
      }
    } catch (error) { controller.error(error); await reader.cancel().catch(() => {}); }
  }, async cancel(reason) { await reader.cancel(reason); } });
}
attachmentRoutes.get('/attachments/:id/content', async c => {
  const row = await owned(c.get('user').id, c.req.param('id'));
  if (row.state !== 'ready') reject(409, 'UPLOAD_INCOMPLETE', 'Commit the verified upload before reading it.');
  const size = Number(row.expected_size), range = parseByteRange(c.req.header('Range'), size);
  blobReady();
  const blob = await get(row.pathname, { access: 'private', useCache: false, abortSignal: AbortSignal.timeout(120_000) });
  if (!blob || blob.statusCode !== 200) reject(404, 'NOT_FOUND', 'Attachment content not found.');
  if (blob.blob.size !== size) { await blob.stream.cancel(); reject(409, 'UPLOAD_MISMATCH', 'Stored attachment changed.'); }
  c.header('Content-Type', row.content_type);
  c.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`);
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Content-Security-Policy', "default-src 'none'; sandbox");
  c.header('Accept-Ranges', 'bytes');
  c.header('Content-Length', String(range ? range.end - range.start + 1 : size));
  if (range) { c.header('Content-Range', `bytes ${range.start}-${range.end}/${size}`); return c.body(rangeStream(blob.stream, range.start, range.end), 206); }
  return c.body(blob.stream);
});
attachmentRoutes.delete('/attachments/:id', async c => {
  blobReady();
  const row = await owned(c.get('user').id, c.req.param('id'));
  await del(row.pathname);
  await sql`UPDATE aux_attachments SET state = 'deleted' WHERE id = ${row.id} AND user_id = ${row.user_id}`;
  return c.json({ ok: true });
});

/** Call from the protected scheduled maintenance route; never accepts caller-supplied paths. */
export async function cleanExpiredAttachmentUploads(limit = 50) {
  blobReady();
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error('Cleanup limit must be between 1 and 100');
  const rows = await sql`SELECT id, pathname FROM aux_attachments WHERE state IN ('pending','issued','failed') AND expires_at < now() ORDER BY expires_at LIMIT ${limit}`;
  let cleaned = 0;
  for (const row of rows) {
    await del(row.pathname);
    await sql`UPDATE aux_attachments SET state = 'deleted' WHERE id = ${row.id} AND state IN ('pending','issued','failed') AND expires_at < now()`;
    cleaned += 1;
  }
  return { cleaned };
}

/** Account deletion must finish these batches before cascading away the owner metadata. */
export async function purgeUserAttachments(userId: string, limit = 100) {
  blobReady();
  uuid.parse(userId);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error('Purge limit must be between 1 and 100');
  const rows = await sql`SELECT id, pathname FROM aux_attachments WHERE user_id = ${userId} AND state <> 'deleted' ORDER BY created_at LIMIT ${limit}`;
  for (const row of rows) {
    await del(row.pathname);
    await sql`UPDATE aux_attachments SET state = 'deleted' WHERE id = ${row.id} AND user_id = ${userId}`;
  }
  const [remaining] = await sql`SELECT count(*) FILTER (WHERE state <> 'deleted') AS count, max(expires_at) FILTER (WHERE expires_at > now()) AS safe_after FROM aux_attachments WHERE user_id = ${userId}`;
  // Keep metadata until every potential upload token has expired: a late signed callback
  // must still resolve a canceled intent and delete any just-uploaded bytes.
  return { deleted: rows.length, remaining: Number(remaining.count), safeToDeleteAccountAfter: remaining.safe_after ?? null };
}
