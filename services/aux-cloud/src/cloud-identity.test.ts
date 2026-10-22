import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { canonicalBillingLookup, canonicalBillingRequestKey } from './billing-identity-transition';
import { app } from './app';
import { inferenceRoutes } from './inference';

test('billing transition reads exactly four historical identities and emits canonical request keys', () => {
  for (const plan of ['pro', 'max']) for (const interval of ['month', 'year']) {
    const historical = `aside_${plan}_${interval}`, current = `aux_${plan}_${interval}`;
    assert.equal(canonicalBillingLookup(historical), current);
    assert.equal(canonicalBillingLookup(current), current);
    const target = 'https://app.getaux.co/settings/billing';
    assert.equal(canonicalBillingRequestKey(JSON.stringify({ lookup: historical, target })), JSON.stringify({ lookup: current, target }));
  }
  for (const value of [null, {}, 'aside_admin_month', 'aside_pro_month_extra', 'other_pro_month']) assert.equal(canonicalBillingLookup(value), value);
  for (const value of ['invalid', 'null', '[]', '{"cents":1000,"success":"return","cancel":"return"}', '{"lookup":"aside_pro_month","target":"return","extra":true}']) assert.equal(canonicalBillingRequestKey(value), value);
});

test('actual checkout acquisition reuses a pending legacy purchase without expiry or new provider work', async () => {
  const source = await readFile(new URL('./billing.ts', import.meta.url), 'utf8');
  const start = source.indexOf('async function checkoutRequest('), end = source.indexOf('\nexport const billingRoutes', start);
  assert.ok(start >= 0 && end > start);
  const signature = "async function checkoutRequest(client: Stripe, userId: string, mode: 'subscription' | 'payment', key: string): Promise<CheckoutRequest>";
  const body = source.slice(start, end).replace(signature, 'async function checkoutRequest(client,userId,mode,key)').replace('rows[0] as CheckoutRequest', 'rows[0]');
  const historical = { request_id: 'same-request', session_id: 'same-session', mode: 'subscription', request_key: JSON.stringify({ lookup: 'aside_pro_month', target: 'https://app.getaux.co/billing' }), expires_at: '2030-01-01T00:00:00Z' };
  const current = JSON.stringify({ lookup: 'aux_pro_month', target: 'https://app.getaux.co/billing' });
  let closes = 0, inserts = 0;
  const context = { canonicalBillingRequestKey, randomUUID: () => 'unused-new-request', sql: async (parts: TemplateStringsArray) => { if (parts.join('').startsWith('INSERT')) { inserts++; return []; } return [historical]; }, closeOwnedCheckout: async () => { closes++; }, checkoutRequest: undefined as undefined | ((client: object, user: string, mode: string, key: string) => Promise<unknown>) };
  runInNewContext(`${body};globalThis.checkoutRequest=checkoutRequest`, context);
  assert.equal(await context.checkoutRequest!({}, 'fixture-owner', 'subscription', current), historical);
  assert.equal(closes, 0); assert.equal(inserts, 1);
});

test('actual CORS preflight admits Aux auth header within existing allowed origin boundary', async () => {
  const response = await app.request('/api/v1/health', { method: 'OPTIONS', headers: { Origin: 'chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'X-Aux-Auth-Protocol' } });
  assert.equal(response.status, 204);
  const allowed = response.headers.get('access-control-allow-headers')!.toLowerCase().split(',');
  assert.ok(allowed.includes('x-aux-auth-protocol')); assert.ok(!allowed.includes('x-aside-auth-protocol'));
});

test('actual hosted model catalog emits Aux provider without a paid request', async () => {
  const original = globalThis.fetch;
  const target = process.env.AUX_AI_MODEL || 'openai/gpt-6-luna', fast = process.env.AUX_AI_FAST_MODEL || 'openai/gpt-6-luna';
  let reads = 0;
  globalThis.fetch = async input => {
    assert.match(String(input), /\/v1\/models$/); reads++;
    return Response.json({ data: [...new Set([target, fast])].map(id => ({ id, type: 'language', zdr: 'all', name: 'Fixture' })) });
  };
  try {
    const response = await inferenceRoutes.request('/ai/catalog/v1');
    assert.equal(response.status, 200);
    const body = await response.json() as { provider: string; models: unknown[] };
    assert.equal(body.provider, 'aux'); assert.equal(body.models.length, 2); assert.ok(reads >= 1 && reads <= 2);
  } finally { globalThis.fetch = original; }
});
