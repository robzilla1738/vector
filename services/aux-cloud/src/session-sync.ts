import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { del } from '@vercel/blob';
import { z } from 'zod';
import { sql } from './db';
import type { AuthVariables } from './auth';

export const sessionSyncRoutes = new Hono<{ Variables: AuthVariables }>();
const sessionId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const snapshot = z.object({ blobId: z.string().uuid(), generation: z.number().int().nonnegative() }).strict();
function failure(status: 400 | 404 | 409 | 412 | 413 | 428, code: string, message: string): never {
  throw new HTTPException(status, { res: Response.json({ error: { code, message } }, { status }) });
}
function identifier(value: string) { if (!sessionId.safeParse(value).success) failure(400, 'INVALID_SESSION_ID', 'Invalid session identifier.'); return value; }
function record(row: Record<string, any>) {
  return { id: row.session_id, revision: Number(row.revision), generation: row.generation, blobId: row.blob_id, sha256: row.expected_sha256 ?? null, size: row.expected_size == null ? null : Number(row.expected_size), updatedAt: new Date(row.updated_at).toISOString(), deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null };
}
async function smallBody(request: Request) {
  const reader = request.body?.getReader(), parts: Uint8Array[] = [];
  let size = 0;
  try {
    if (reader) for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 4096) { await reader.cancel(); failure(413, 'PAYLOAD_TOO_LARGE', 'Snapshot metadata must fit in 4 KiB.'); }
      parts.push(chunk.value);
    }
  } finally { reader?.releaseLock(); }
  try { return snapshot.parse(JSON.parse(Buffer.concat(parts).toString('utf8'))); }
  catch { failure(400, 'INVALID_INPUT', 'Provide a verified encrypted blob ID and sync generation.'); }
}
sessionSyncRoutes.use('*', async (c, next) => { if (!c.get('user')?.id) throw new HTTPException(401); c.header('Cache-Control', 'no-store'); await next(); });
sessionSyncRoutes.get('/sync/sessions', async c => {
  const cursor = c.req.query('cursor') ?? '';
  if (cursor) identifier(cursor);
  const rows = await sql`SELECT s.*,a.expected_sha256,a.expected_size FROM aux_session_snapshots s LEFT JOIN aux_attachments a ON a.id=s.blob_id AND a.user_id=s.user_id WHERE s.user_id=${c.get('user').id} AND s.session_id>${cursor} ORDER BY s.session_id LIMIT 201`;
  return c.json({ items: rows.slice(0, 200).map(record), nextCursor: rows.length > 200 ? rows[199].session_id : null });
});
sessionSyncRoutes.get('/sync/sessions/:id', async c => {
  const [row] = await sql`SELECT s.*,a.expected_sha256,a.expected_size FROM aux_session_snapshots s LEFT JOIN aux_attachments a ON a.id=s.blob_id AND a.user_id=s.user_id WHERE s.user_id=${c.get('user').id} AND s.session_id=${identifier(c.req.param('id'))}`;
  if (!row) failure(404, 'NOT_FOUND', 'Session backup not found.');
  c.header('ETag', `"${row.revision}"`);
  return c.json(record(row));
});
sessionSyncRoutes.put('/sync/sessions/:id', async c => {
  const body = await smallBody(c.req.raw), id = identifier(c.req.param('id')), user = c.get('user').id;
  const first = c.req.header('If-None-Match') === '*', match = c.req.header('If-Match');
  if ((!first && !match) || (first && match) || (match && !/^"[1-9][0-9]*"$/.test(match))) failure(428, 'PRECONDITION_REQUIRED', 'Supply exactly If-None-Match:* or an If-Match revision ETag.');
  const [attachment] = await sql`SELECT a.id FROM aux_attachments a JOIN aux_users u ON u.id=a.user_id WHERE a.id=${body.blobId} AND a.user_id=${user} AND a.state='ready' AND NOT EXISTS(SELECT 1 FROM aux_retired_session_blobs r WHERE r.blob_id=a.id) AND a.purpose='attachment' AND a.content_type='application/json' AND a.expected_size<=100*1024*1024 AND u.sync_generation=${body.generation} AND u.deleted_at IS NULL`;
  if (!attachment) failure(409, 'SNAPSHOT_UNAVAILABLE', 'Use a verified private JSON upload owned by this account and its current sync generation.');
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${user},0))`,
    first
      ? sql`INSERT INTO aux_session_snapshots(user_id,session_id,generation,blob_id) SELECT ${user},${id},${body.generation},${body.blobId} WHERE (SELECT count(*) FROM aux_session_snapshots WHERE user_id=${user})<10000 AND EXISTS(SELECT 1 FROM aux_attachments a JOIN aux_users u ON u.id=a.user_id WHERE a.id=${body.blobId} AND a.user_id=${user} AND a.state='ready' AND NOT EXISTS(SELECT 1 FROM aux_retired_session_blobs r WHERE r.blob_id=a.id) AND u.sync_generation=${body.generation} AND u.deleted_at IS NULL) ON CONFLICT(user_id,session_id) DO NOTHING RETURNING *`
      : sql`WITH previous AS(SELECT * FROM aux_session_snapshots WHERE user_id=${user} AND session_id=${id} AND ('"'||revision::text||'"')=${match!} AND deleted_at IS NULL FOR UPDATE), changed AS(UPDATE aux_session_snapshots s SET generation=${body.generation},blob_id=${body.blobId},revision=s.revision+1,updated_at=now() FROM previous p WHERE s.user_id=p.user_id AND s.session_id=p.session_id AND EXISTS(SELECT 1 FROM aux_attachments a JOIN aux_users u ON u.id=a.user_id WHERE a.id=${body.blobId} AND a.user_id=${user} AND a.state='ready' AND NOT EXISTS(SELECT 1 FROM aux_retired_session_blobs r WHERE r.blob_id=a.id) AND u.sync_generation=${body.generation} AND u.deleted_at IS NULL) RETURNING s.*,p.blob_id AS old_blob_id), retired AS(INSERT INTO aux_retired_session_blobs(blob_id,user_id) SELECT old_blob_id,user_id FROM changed WHERE old_blob_id IS NOT NULL AND old_blob_id<>${body.blobId} ON CONFLICT(blob_id) DO UPDATE SET delete_after=now()+interval '15 minutes' RETURNING blob_id) SELECT * FROM changed`,
  ]);
  const row = results[1]?.[0];
  if (!row) failure(412, 'PRECONDITION_FAILED', 'The backup changed or was deleted. Preserve local work and publish a conflict copy instead of overwriting it.');
  const [blob] = await sql`SELECT expected_sha256,expected_size FROM aux_attachments WHERE id=${body.blobId} AND user_id=${user}`;
  c.header('ETag', `"${row.revision}"`);
  return c.json(record({ ...row, ...blob }));
});
sessionSyncRoutes.delete('/sync/sessions/:id', async c => {
  const user = c.get('user').id, id = identifier(c.req.param('id')), match = c.req.header('If-Match');
  const first = c.req.header('If-None-Match') === '*';
  if ((!first && !match) || (first && match) || (match && !/^"[1-9][0-9]*"$/.test(match))) failure(428, 'PRECONDITION_REQUIRED', 'Supply an If-Match revision ETag or If-None-Match:* for a never-published deletion.');
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${user},0))`,
    first
      ? sql`INSERT INTO aux_session_snapshots(user_id,session_id,generation,deleted_at) SELECT ${user},${id},sync_generation,now() FROM aux_users WHERE id=${user} AND deleted_at IS NULL AND (SELECT count(*) FROM aux_session_snapshots WHERE user_id=${user})<10000 ON CONFLICT(user_id,session_id) DO NOTHING RETURNING *`
      : sql`WITH previous AS(SELECT * FROM aux_session_snapshots WHERE user_id=${user} AND session_id=${id} AND ('"'||revision::text||'"')=${match!} FOR UPDATE), changed AS(UPDATE aux_session_snapshots s SET blob_id=NULL,deleted_at=coalesce(s.deleted_at,now()),updated_at=now(),revision=s.revision+1 FROM previous p WHERE s.user_id=p.user_id AND s.session_id=p.session_id RETURNING s.*,p.blob_id AS old_blob_id), retired AS(INSERT INTO aux_retired_session_blobs(blob_id,user_id) SELECT old_blob_id,user_id FROM changed WHERE old_blob_id IS NOT NULL ON CONFLICT(blob_id) DO UPDATE SET delete_after=now()+interval '15 minutes' RETURNING blob_id) SELECT * FROM changed`,
  ]);
  const row = results[1]?.[0];
  if (!row) failure(412, 'PRECONDITION_FAILED', 'Another device changed this session. Its newer work has been preserved.');
  return c.json(record(row));
});

/** Protected maintenance; grace exceeds all signed upload and bounded download lifetimes. */
export async function cleanRetiredSessionBlobs(limit = 50) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error('Cleanup limit must be between1 and100');
  const rows = await sql`SELECT r.*,a.pathname FROM aux_retired_session_blobs r JOIN aux_attachments a ON a.id=r.blob_id AND a.user_id=r.user_id WHERE r.delete_after<now() AND NOT EXISTS(SELECT 1 FROM aux_session_snapshots s WHERE s.blob_id=r.blob_id) AND NOT EXISTS(SELECT 1 FROM aux_attachment_bindings b WHERE b.blob_id=r.blob_id) ORDER BY r.delete_after LIMIT ${limit}`;
  let cleaned = 0;
  for (const row of rows) {
    const claimed = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${row.user_id},0))`,
      sql`UPDATE aux_attachments a SET state='failed' WHERE a.id=${row.blob_id} AND a.user_id=${row.user_id} AND a.state IN ('ready','failed') AND NOT EXISTS(SELECT 1 FROM aux_session_snapshots s WHERE s.blob_id=a.id) AND NOT EXISTS(SELECT 1 FROM aux_attachment_bindings b WHERE b.blob_id=a.id) RETURNING id`,
    ]);
    if (!claimed[1].length) continue;
    await del(row.pathname);
    await sql.transaction([sql`UPDATE aux_attachments SET state='deleted' WHERE id=${row.blob_id} AND user_id=${row.user_id}`, sql`DELETE FROM aux_retired_session_blobs WHERE blob_id=${row.blob_id} AND user_id=${row.user_id}`]);
    cleaned += 1;
  }
  return { cleaned };
}
