import assert from 'node:assert/strict';
import test from 'node:test';
import { billingRoutes, billingWebhooks, billingPlansSnapshot } from './billing';
import { inferenceRoutes } from './inference';
import { ensureWallet, reserveUsage } from './usage';
import { launchCapabilities } from './launch-mode';

test('provider-only launch ignores saved keys, creates no grants and blocks payment and hosted AI boundaries', async () => {
  const keys = ['AUX_PAYMENTS_ENABLED', 'AUX_HOSTED_AI_ENABLED', 'AUX_LIVE_BILLING', 'STRIPE_SECRET_KEY', 'AI_GATEWAY_API_KEY'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const fetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw Error('Unexpected provider access'); };
  try {
    delete process.env.AUX_PAYMENTS_ENABLED;
    delete process.env.AUX_HOSTED_AI_ENABLED;
    process.env.AUX_LIVE_BILLING = 'true';
    process.env.STRIPE_SECRET_KEY = 'rk_live_synthetic';
    process.env.AI_GATEWAY_API_KEY = 'synthetic';
    assert.deepEqual(launchCapabilities(), { paymentsEnabled: false, hostedAiEnabled: false });
    const catalog = billingPlansSnapshot();
    assert.deepEqual(catalog.plans.map(plan => plan.slug), ['free']);
    assert.ok(catalog.plans[0]!.features.every(feature => !feature.includes('allowance')));
    // Default mode must not initialize/refresh a DB wallet, even for a valid identifier.
    await ensureWallet('00000000-0000-4000-8000-000000000001');
    await assert.rejects(reserveUsage('00000000-0000-4000-8000-000000000001', 'tokens', 1), /Aux-hosted AI is disabled/);
    for (const path of ['/checkout', '/checkout/cancel', '/portal', '/add-on-checkout', '/auto-reload'])
      assert.equal((await billingRoutes.request(path, { method: 'POST', body: '{}' })).status, 503, path);
    assert.equal((await billingWebhooks.request('/stripe', { method: 'POST', body: '{}' })).status, 503);
    for (const path of ['/ai/v1/responses', '/ai/messages', '/ai/v1/messages', '/ai/v1/chat/completions', '/ai/images/generations', '/stt/transcribe', '/tts/synthesize'])
      assert.equal((await inferenceRoutes.request(path, { method: 'POST', body: '{}' })).status, 503, path);
    for (const path of ['/ai/catalog/v1', '/ai/models/v2']) {
      const response = await inferenceRoutes.request(path);
      assert.equal(response.status, 200);
      assert.deepEqual((await response.json() as { models: unknown[] }).models, []);
    }
    const speech = await (await inferenceRoutes.request('/speech/config')).json() as { transcription: {enabled: boolean}; speech: {enabled: boolean} };
    assert.equal(speech.transcription.enabled, false);
    assert.equal(speech.speech.enabled, false);
    assert.equal(calls, 0);
    process.env.AUX_PAYMENTS_ENABLED = 'true';
    assert.equal(billingPlansSnapshot().plans.length, 3);
    assert.equal(launchCapabilities().hostedAiEnabled, false);
  } finally {
    globalThis.fetch = fetch;
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
