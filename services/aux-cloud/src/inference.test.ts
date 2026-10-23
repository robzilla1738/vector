import assert from 'node:assert/strict';
import test from 'node:test';
import { boundedBody, imageMimeType, modelAliases, safeTextRequest, inferenceCost, tokenUsage, inferenceRoutes } from './inference';

test('hosted model requests cannot override server routing or retention', () => {
  const body = safeTextRequest({
    input: 'synthetic local fixture', model: 'client/evil', stream: true,
    providerOptions: { gateway: { zeroDataRetention: false, models: ['client/evil'], byok: [{ apiKey: 'fixture' }] } },
    headers: { Authorization: 'fixture' }, baseURL: 'https://invalid.example', store: true,
  }, 'configured/model', 'responses');
  assert.equal(body.model, 'configured/model');
  assert.equal(body.store, false);
  assert.equal(body.headers, undefined);
  assert.equal(body.baseURL, undefined);
  assert.deepEqual(body.providerOptions, { gateway: { zeroDataRetention: true, disallowPromptTraining: true } });
});

test('stateful conversations and hosted tools cannot bypass privacy boundaries', () => {
  assert.throws(() => safeTextRequest({ input: 'x', previous_response_id: 'fixture' }, 'model', 'responses'));
  assert.throws(() => safeTextRequest({ input: 'x', tools: [{ type: 'web_search_preview' }] }, 'model', 'responses'));
  assert.throws(() => safeTextRequest({ messages: [], max_tokens: 999_999 }, 'model', 'messages'));
  const request = safeTextRequest({ messages: [], tools: [{ name: 'local_function', input_schema: { type: 'object' } }] }, 'model', 'messages');
  assert.equal(request.max_tokens, 4096);
});

test('streamed request limit holds without Content-Length', async () => {
  const request = new Request('https://invalid.example', { method: 'POST', body: new ReadableStream({ start(c) { c.enqueue(new Uint8Array(3)); c.enqueue(new Uint8Array(3)); c.close(); } }), duplex: 'half' } as RequestInit);
  await assert.rejects(boundedBody(request, 5), /upload limit/);
  assert.equal((await boundedBody(new Request('https://invalid.example', { method: 'POST', body: 'abc' }), 3)).length, 3);
});

test('model aliases remain visible to supplied native model family filter', () => {
  assert.deepEqual(Object.keys(modelAliases()), ['grok-aux-balanced', 'gpt-aux-fast']);
});

test('returned image MIME is detected from bytes instead of trusting provider labels', () => {
  assert.equal(imageMimeType(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString('base64')), 'image/png');
  assert.equal(imageMimeType(Buffer.from([255, 216, 255, 224]).toString('base64')), 'image/jpeg');
  assert.throws(() => imageMimeType(Buffer.from('not an image').toString('base64')));
});

test('usage preserves Anthropic input and output phases and uses actual model prices', () => {
  assert.deepEqual(tokenUsage({ type: 'message_start', message: { usage: { input_tokens: 120, output_tokens: 1 } } }), { input: 120, output: 1 });
  assert.deepEqual(tokenUsage({ type: 'message_delta', usage: { output_tokens: 30 } }), { output: 30 });
  assert.equal(inferenceCost({ input: '0.0000002', output: '0.0000005' }, 1000, 1000), 840);
  assert.throws(() => inferenceCost(undefined, 1000, 1000));
});

test('actual route rejects unsupported aliases and invalid audio before any provider or wallet call', async () => {
  const previous=process.env.AUX_HOSTED_AI_ENABLED;process.env.AUX_HOSTED_AI_ENABLED='true';
  try {
  const wrongModel = await inferenceRoutes.request('/ai/v1/responses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'external/model', input: 'fixture' }) });
  assert.equal(wrongModel.status, 400);
  const form = new FormData();
  form.set('file', new File(['fixture'], 'fixture.txt', { type: 'text/plain' }));
  const audio = await inferenceRoutes.request('/stt/transcribe', { method: 'POST', body: form });
  assert.equal(audio.status, 415);
  const missing = new FormData();
  missing.set('language', 'en-US');
  assert.equal((await inferenceRoutes.request('/stt/transcribe', { method: 'POST', body: missing })).status, 400);
  } finally { if(previous===undefined)delete process.env.AUX_HOSTED_AI_ENABLED;else process.env.AUX_HOSTED_AI_ENABLED=previous; }
});

test('long-context model prices use the input context tier for input and output', () => {
  const pricing = { input: '0.0000001', output: '0.0000005', input_tiers: [{ cost: '0.0000001', min: 0, max: 272001 }, { cost: '0.0000002', min: 272001 }], output_tiers: [{ cost: '0.0000005', min: 0, max: 272001 }, { cost: '0.00000075', min: 272001 }] };
  assert.equal(inferenceCost(pricing, 300000, 1000), 72900);
});
