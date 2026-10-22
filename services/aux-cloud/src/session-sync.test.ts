import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { sessionSyncRoutes, cleanRetiredSessionBlobs } from './session-sync';
import type { AuthVariables } from './auth';

test('session backups require authenticated owners', async () => {
  assert.equal((await sessionSyncRoutes.request('/sync/sessions')).status, 401);
});
test('session write metadata and CAS prerequisites fail before database access', async () => {
  const app = new Hono<{ Variables: AuthVariables }>();
  app.use('*', async (c, next) => { c.set('user', { id: '00000000-0000-4000-8000-000000000001', clerkId: 'fixture', email: 'fixture@example.invalid', sessionId: 'fixture' }); await next(); });
  app.route('/', sessionSyncRoutes);
  const missing = await app.request('/sync/sessions/session-one', { method: 'PUT', body: JSON.stringify({ blobId: '00000000-0000-4000-8000-000000000002', generation: 0 }) });
  assert.equal(missing.status, 428);
  const invalid = await app.request('/sync/sessions/session-one', { method: 'PUT', body: JSON.stringify({ plaintext: 'must never be accepted' }) });
  assert.equal(invalid.status, 400);
  const noDeleteVersion = await app.request('/sync/sessions/session-one', { method: 'DELETE' });
  assert.equal(noDeleteVersion.status, 428);
});
test('session cleanup bounds work without accessing storage', async () => {
  await assert.rejects(cleanRetiredSessionBlobs(1000), /Cleanup limit/);
});
