import { createHmac } from 'node:crypto';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { sql } from './db';
import { rateLimit, type AuthVariables } from './auth';

export const eventTopics = ['account', 'billing', 'devices', 'user-settings', 'drive', 'routines', 'sessions'] as const;
type Topic = typeof eventTopics[number];
const topic = z.enum(eventTopics);
const cursor = z.string().regex(/^aux-ev1\.[a-f0-9]{64}$/);
export const eventsRoutes = new Hono<{ Variables: AuthVariables }>();

// Existing owner-scoped state is the invalidation source. No event log, secret
// payload, wall-clock high-water mark or new table is required. Full digests
// detect deletes and edits that leave a collection's maximum timestamp intact.
export const eventSnapshotSQL = `SELECT jsonb_build_object(
 'account', (SELECT md5(row(u.updated_at,u.sync_generation,u.name,u.profile_url)::text) FROM aux_users u WHERE u.id=$1 AND u.deleted_at IS NULL),
 'billing', (SELECT md5(coalesce(string_agg(s::text,',' ORDER BY s.user_id),'')) FROM aux_subscriptions s WHERE s.user_id=$1),
 'devices', (SELECT md5(coalesce(string_agg(row(s.id,s.device_name,s.app_version,s.revoked_at)::text,',' ORDER BY s.id),'')) FROM aux_sessions s WHERE s.user_id=$1),
 'user-settings', (SELECT md5(coalesce(string_agg(e.entity_id||':'||e.payload::text,',' ORDER BY e.entity_id),'')) FROM sync_entities e WHERE e.user_id=$1 AND e.kind='settings'),
 'drive', (SELECT md5(coalesce((SELECT revision::text FROM aux_drive_heads WHERE user_id=$1),'')||':'||coalesce((SELECT revision::text FROM sync_heads WHERE user_id=$1),'')||':'||coalesce((SELECT revision::text FROM aux_drive_cookies WHERE user_id=$1),'')||':'||coalesce((SELECT string_agg(e.entity_id||':'||e.payload::text,',' ORDER BY e.entity_id) FROM sync_entities e WHERE e.user_id=$1 AND e.kind='project'),''))),
 'routines', (SELECT md5(coalesce(string_agg(e.entity_id||':'||e.payload::text,',' ORDER BY e.entity_id),'')) FROM sync_entities e WHERE e.user_id=$1 AND e.kind='routine'),
 'sessions', (SELECT md5(coalesce(string_agg(row(s.session_id,s.revision,s.generation,s.deleted_at)::text,',' ORDER BY s.session_id),'')) FROM aux_session_snapshots s WHERE s.user_id=$1)
) AS snapshot`;

export function eventPollReply(userId: string, topics: Topic[], previous: string | undefined, snapshot: Record<string, string>, secret: string) {
  if (secret.length < 32) throw Error('Aux event cursor key is not configured.');
  const current = 'aux-ev1.' + createHmac('sha256', secret).update(JSON.stringify([1, userId, topics.map(name => [name, snapshot[name]])])).digest('hex');
  return { protocol: 'aux-events.poll.v1' as const, cursor: current, changed: previous === current ? [] : topics, retryAfterMs: 60_000 };
}

eventsRoutes.get('/events/poll', async c => {
  const user = c.get('user');
  if (!user?.id) throw new HTTPException(401);
  const query = z.object({ topics: z.string().min(1).max(128), cursor: cursor.optional() }).strict().parse(c.req.query());
  const topics = z.array(topic).min(1).max(eventTopics.length).parse(query.topics.split(','));
  if (new Set(topics).size !== topics.length) throw new HTTPException(400, { message: 'Duplicate event topics.' });
  topics.sort();
  if (!await rateLimit(`events:${user.id}`, 120, 3600)) return c.json({ error: { code: 'RATE_LIMITED', message: 'Poll no more than once per minute.' } }, 429);
  const results = await sql.transaction([sql`SET LOCAL statement_timeout = '5s'`, sql.query(eventSnapshotSQL, [user.id])]);
  const snapshot = results[1][0]?.snapshot as Record<string, string> | undefined;
  if (!snapshot?.account) throw new HTTPException(401);
  c.header('Cache-Control', 'no-store');
  return c.json(eventPollReply(user.id, topics, query.cursor, snapshot, process.env.AUX_AUTH_SECRET ?? ''));
});
