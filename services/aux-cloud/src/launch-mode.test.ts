import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { billingRoutes, billingPlansSnapshot } from './billing';
import { inferenceRoutes } from './inference';
import { launchCapabilities } from './launch-mode';

test('launch is provider-only whatever the environment says', () => {
  process.env.AUX_PAYMENTS_ENABLED = 'true';
  process.env.AUX_HOSTED_AI_ENABLED = 'true';
  try {
    assert.deepEqual(launchCapabilities(), { paymentsEnabled: false, hostedAiEnabled: false });
    assert.deepEqual(billingPlansSnapshot().plans.map(plan => plan.slug), ['free']);
  } finally { delete process.env.AUX_PAYMENTS_ENABLED; delete process.env.AUX_HOSTED_AI_ENABLED; }
});

test('billing answers read-only and refuses every purchase route', async () => {
  const app = new Hono<{ Variables: { user: { id: string } } }>();
  app.use('*', async (c, next) => { c.set('user', { id: '00000000-0000-4000-8000-000000000000' }); await next(); });
  app.route('/billing', billingRoutes);
  assert.equal((await app.request('/billing/plans')).status, 200);
  const usage = await app.request('/billing/v2/usage?start=2026-01-01T00:00:00Z&end=2026-02-01T00:00:00Z');
  assert.deepEqual(await usage.json(), { items: [], has_more: false });
  for (const path of ['/billing/checkout', '/billing/portal', '/billing/add-on-checkout', '/billing/auto-reload'])
    assert.equal((await app.request(path, { method: 'POST' })).status, 404);
});

test('hosted AI routes are unavailable and the catalog is empty', async () => {
  assert.deepEqual(await (await inferenceRoutes.request('/ai/models/v2')).json(), { provider: 'aux', models: [], visibleModelIds: [], imageModels: [] });
  assert.equal((await (await inferenceRoutes.request('/speech/config')).json()).transcription.enabled, false);
  for (const path of ['/ai/v1/responses', '/ai/messages', '/stt/transcribe', '/tts/synthesize', '/ai/images/generations'])
    assert.equal((await inferenceRoutes.request(path, { method: 'POST' })).status, 404);
});
