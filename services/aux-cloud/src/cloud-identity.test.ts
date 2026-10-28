import assert from 'node:assert/strict';
import test from 'node:test';
import { app } from './app';
import { inferenceRoutes } from './inference';

test('actual CORS preflight admits Aux auth header within existing allowed origin boundary', async () => {
  const response = await app.request('/api/v1/health', { method: 'OPTIONS', headers: { Origin: 'chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'X-Aux-Auth-Protocol' } });
  assert.equal(response.status, 204);
  const allowed = response.headers.get('access-control-allow-headers')!.toLowerCase().split(',');
  assert.ok(allowed.includes('x-aux-auth-protocol')); assert.ok(!allowed.includes('x-aside-auth-protocol'));
});

test('hosted model catalog is empty and makes no request while Aux-funded inference is off', async () => {
  // BYOK scope: no Aux-hosted credits, so the catalog must not reach the provider.
  const original = globalThis.fetch;
  let reads = 0;
  globalThis.fetch = async () => { reads++; return Response.json({ data: [] }); };
  try {
    const response = await inferenceRoutes.request('/ai/catalog/v1');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { provider: 'aux', models: [], visibleModelIds: [], imageModels: [] });
    assert.equal(reads, 0);
  } finally { globalThis.fetch = original; }
});
