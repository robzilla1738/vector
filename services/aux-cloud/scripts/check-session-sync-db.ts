/** Root-run disposable real-Neon CAS/ownership fixture. Does not claim Blob/native acceptance. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import type { AuthVariables } from '../src/auth';
if (process.env.AUX_ALLOW_DISPOSABLE_DB_CHECK !== '1' || process.env.VERCEL_ENV === 'production') throw new Error('Explicit development-only disposable DB permission is required');
const hostname = new URL(process.env.DATABASE_URL || '').hostname;
if (!/^ep-spring-darkness-b824br4r(?:-pooler)?\./.test(hostname)) throw new Error('Only the reviewed Aux development database is allowed');
const originalFetch = globalThis.fetch, apiHost = hostname.replace(/^[^.]+\./, 'api.');
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url), headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  let target = ''; try { target = new URL(headers.get('Neon-Connection-String') || '').hostname; } catch {}
  if (url.protocol !== 'https:' || url.hostname !== apiHost || url.pathname !== '/sql' || target !== hostname) throw new Error('Unexpected network request blocked');
  return originalFetch(input, init);
};
const { sql } = await import('../src/db');
const { sessionSyncRoutes } = await import('../src/session-sync');
const users = [randomUUID(), randomUUID()], blobs = [randomUUID(), randomUUID(), randomUUID()];
const apps = users.map(id => { const app = new Hono<{ Variables: AuthVariables }>(); app.use('*', async (c, next) => { c.set('user', { id, clerkId: `fixture_${id}`, email: `${id}@example.invalid`, sessionId: 'fixture' }); await next(); }); app.route('/', sessionSyncRoutes); return app; });
const checks: string[] = [];
let cleaned = false;
try {
  for (const user of users) await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${user},${`fixture_${user}`},${`${user}@example.invalid`},'Disposable session fixture')`;
  for (const blob of blobs) await sql`INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at) VALUES(${blob},${users[0]},${`fixture/${users[0]}/${blob}`},'encrypted-session.json','application/json',0,${'a'.repeat(64)},'attachment','ready',now()+interval '15 minutes')`;
  const put = (app: typeof apps[number], blobId: string, match?: string) => app.request('/sync/sessions/disposable-session', { method: 'PUT', headers: match ? { 'If-Match': match } : { 'If-None-Match': '*' }, body: JSON.stringify({ blobId, generation: 0 }) });
  const first = await put(apps[0], blobs[0]); assert.equal(first.status, 200); assert.equal((await first.json()).revision, 1); checks.push('owner creates opaque snapshot');
  assert.equal((await apps[1].request('/sync/sessions/disposable-session')).status, 404);
  assert.equal((await put(apps[1], blobs[0])).status, 409); checks.push('cross-user reads and blob references denied');
  const race = await Promise.all([put(apps[0], blobs[1], '"1"'), put(apps[0], blobs[2], '"1"')]);
  assert.deepEqual(race.map(r => r.status).sort(), [200, 412]); checks.push('two devices cannot overwrite the same revision');
  const latest = await (await apps[0].request('/sync/sessions/disposable-session')).json(); assert.equal(latest.revision, 2);
  const staleDelete = await apps[0].request('/sync/sessions/disposable-session', { method: 'DELETE', headers: { 'If-Match': '"1"' } }); assert.equal(staleDelete.status, 412);
  const removed = await apps[0].request('/sync/sessions/disposable-session', { method: 'DELETE', headers: { 'If-Match': '"2"' } }); assert.equal(removed.status, 200); assert.ok((await removed.json()).deletedAt);
  assert.equal((await put(apps[0], blobs[0])).status, 412); checks.push('tombstones prevent offline resurrection and stale deletion');
  const retired = await sql`SELECT count(*) AS count FROM aux_retired_session_blobs WHERE user_id=${users[0]}`; assert.equal(Number(retired[0].count), 2); checks.push('replaced/deleted blobs enter delayed retirement');
} catch (error) {
  const value = error as { code?: unknown; constraint?: unknown; table?: unknown };
  console.error(JSON.stringify({ success: false, errorType: error instanceof Error ? error.name : 'Unknown', code: value.code, constraint: value.constraint, table: value.table }));
  process.exitCode = 1;
} finally {
  try { for (const user of users) await sql`DELETE FROM aux_users WHERE id=${user} AND clerk_id=${`fixture_${user}`}`; const rows = await sql`SELECT count(*) AS count FROM aux_users WHERE id=ANY(${users}::uuid[])`; cleaned = Number(rows[0].count) === 0; }
  finally { globalThis.fetch = originalFetch; }
  console.log(JSON.stringify({ success: !process.exitCode, checks, cleaned, providerAcceptance: false }));
  if (!cleaned) process.exitCode = 1;
}
