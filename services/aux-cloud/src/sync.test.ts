import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { Hono } from 'hono';
import { encryptSyncObject, decryptSyncObject, getPublicShare, syncRoutes } from './sync';

test('sync envelope authenticates bytes, user, path and generation', () => {
  const key = randomBytes(32);
  const context = { userId: 'test-user', path: 'memory/test.md', generation: 0 };
  const plaintext = Buffer.from('private sync data');
  const encrypted = encryptSyncObject(plaintext, key, context);
  assert.deepEqual(Buffer.from(decryptSyncObject(encrypted, key, context)), plaintext);
  for (const change of [{ userId: 'other' }, { path: 'other.md' }, { generation: 1 }]) {
    assert.throws(() => decryptSyncObject(encrypted, key, { ...context, ...change }));
  }
  assert.throws(() => decryptSyncObject(encrypted, randomBytes(32), context));
  const tampered = JSON.parse(Buffer.from(encrypted).toString());
  tampered.ciphertext = Buffer.from('changed ciphertext').toString('base64');
  assert.throws(() => decryptSyncObject(Buffer.from(JSON.stringify(tampered)), key, context));
});

function authenticatedApp() {
  const app = new Hono<{ Variables: { user: { id: string; clerkId: string; email: string; sessionId: string } } }>();
  app.use('*', async (c, next) => {
    c.set('user', { id: '00000000-0000-4000-8000-000000000001', clerkId: 'test', email: 'test@example.invalid', sessionId: 'test-session' });
    await next();
  });
  app.route('/', syncRoutes);
  return app;
}

test('plaintext file and cookie uploads fail before any database access', async () => {
  const bytes = Buffer.from('{"credential":"must remain local"}');
  const hash = createHash('sha256').update(bytes).digest('hex');
  const app = authenticatedApp();
  const object = await app.request(`/sync/agent-files/objects/${hash}`, { method: 'PUT', body: bytes });
  assert.equal(object.status, 403);
  assert.equal((await object.json()).error.code, 'ENCRYPTED_SYNC_REQUIRED');
  const cookies = await app.request('/sync/agent-files/cookies', { method: 'PUT', body: '{}' });
  assert.equal(cookies.status, 403);
});

test('head requires compare-and-set headers and validates logical paths', async () => {
  const app = authenticatedApp();
  const missing = await app.request('/sync/agent-files/head', { method: 'PUT', body: JSON.stringify({ formatVersion: 1, files: [] }) });
  assert.equal(missing.status, 428);
  const invalid = await app.request('/sync/agent-files/head', { method: 'PUT', headers: { 'If-None-Match': '*' }, body: JSON.stringify({ formatVersion: 1, files: [{ path: '../credentials.json', sha256: 'a'.repeat(64), size: 0 }] }) });
  assert.equal(invalid.status, 400);
});

test('private routes refuse a missing authenticated user', async () => {
  assert.equal((await syncRoutes.request('/projects')).status, 401);
});

test('invalid public share identifiers do not touch the database', async () => {
  assert.equal(await getPublicShare('../owner-secret'), null);
});
