import assert from 'node:assert/strict';
import test from 'node:test';
import { serveApi } from './http';

test('native rewritten URLs reach the same authenticated API as canonical URLs', async () => {
  for (const prefix of ['', '/api/v1']) {
    const response = await serveApi(new Request(`https://dev-cloud.getaux.co${prefix}/auth/me`), { params: Promise.resolve({ path: ['auth', 'me'] }) });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, 'ACCESS_TOKEN_INVALID');
  }
});

test('API routing uses matched params and preserves the POST body', async () => {
  const response = await serveApi(new Request('https://dev-cloud.getaux.co/auth/email/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'fixture@example.com', code: '123' }) }), { params: Promise.resolve({ path: ['auth', 'email', 'verify-code'] }) });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, 'INVALID_REQUEST');
});

test('cloud CAS transport rejects ambiguous or misplaced conditions', async () => {
  for (const [method, headers] of [
    ['GET', { 'X-Aux-If-None-Match': '*' }],
    ['PUT', { 'X-Aux-If-Match': '"1"', 'If-Match': '"2"' }],
  ] as const) {
    const response = await serveApi(new Request('https://dev-cloud.getaux.co/sync/agent-files/head', { method, headers }), { params: Promise.resolve({ path: ['sync', 'agent-files', 'head'] }) });
    assert.equal(response.status, 400);
  }
});

test('optional native provider metadata preserves built-in fallback without a login', async () => {
  const response=await serveApi(new Request('https://dev-cloud.getaux.co/ai/model-catalog/v1/providers/openai'), {params:Promise.resolve({path:['ai','model-catalog','v1','providers','openai']})});
  assert.equal(response.status,404);
  assert.equal((await response.json()).error,'No catalog override.');
});
