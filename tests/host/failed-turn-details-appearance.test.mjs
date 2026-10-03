import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createRequire } from 'node:module';
import { createFixture } from './lib/fixture.mjs';
import { captureFailedTurnDetailsAppearance, installFailedTurnHttpRoute } from './lib/failed-turn-details-appearance.mjs';
const question = 'Explain the owned loopback provider availability without reading or opening a page.';

test('fixed owned route really returns HTTP503 JSON and records original request', async () => {
  const fixture = await createFixture();
  const http = installFailedTurnHttpRoute(fixture);
  try {
    const payload = { messages: [{ role: 'user', content: question }] };
    const response = await fetch(`${http.endpoint}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, 'aux_owned_503');
    assert.deepEqual(http.receipts[0].request, payload);
    http.remove();
    assert.equal((await fetch(`${http.endpoint}/chat/completions`, { method: 'POST' })).status, 404);
  } finally { await fixture.close(); }
});
test('installed compatible-provider SDK preserves the original question on real HTTP503 transport', async () => {
  const runtimeRequire = createRequire(new URL('../../apps/runtime/package.json', import.meta.url));
  const { createOpenAI } = await import(runtimeRequire.resolve('@ai-sdk/openai'));
  const { generateText, streamText } = await import(runtimeRequire.resolve('ai'));
  const fixture = await createFixture();
  const http = installFailedTurnHttpRoute(fixture);
  try {
    const provider = createOpenAI({ apiKey: 'synthetic-loopback-only', baseURL: http.endpoint, name: 'openai-compatible' });
    for (const content of [question, [{ type: 'text', text: question }], `Task: ${question}`]) {
      const request = { model: provider.chat('fixture-model'), messages: [{ role: 'user', content }], maxRetries: 0 };
      await assert.rejects(generateText(request), error => error.statusCode === 503);
      const stream = streamText({ ...request, onError: () => {} });
      let failure;
      for await (const part of stream.fullStream) if (part.type === 'error') failure = part.error;
      assert.equal(failure?.statusCode, 503);
    }
    assert.equal(http.receipts.length, 6);
    for (const receipt of http.receipts) {
      assert.equal(receipt.method, 'POST');
      assert.equal(receipt.path, '/appearance-provider-failure/v1/chat/completions');
      assert.equal(receipt.status, 503);
      assert.equal(receipt.request.messages.length, 1);
      const message = receipt.request.messages[0];
      assert.equal(message.role, 'user');
      assert.equal(typeof message.content, 'string');
      assert.ok(message.content === question || message.content === `Task: ${question}`);
      assert.ok(message.content.includes(question));
    }
  } finally { http.remove(); await fixture.close(); }
});
test('ordinary journey never adds a failed turn or changes model settings', async () => {
  assert.deepEqual(await captureFailedTurnDetailsAppearance({ appearanceEnabled: false }), { status: 'not-requested' });
});
function context() {
  let handler, currentSettings = { modelProvider: 'openai-compatible', compatibleEndpoint: 'http://127.0.0.1/original/v1', plannerModel: 'original-model', modelConfigured: true };
  const originalSettings = structuredClone(currentSettings);
  const previous = { runId: 'previous', status: 'completed', goal: 'Existing successful turn' };
  const failed = { run: { runId: 'failed', goal: question, status: 'failed', pageIds: [], failure: { category: 'provider', message: 'The provider is unavailable.', retryable: true, action: 'retry' } }, transcript: { runId: 'failed', items: [{ kind: 'error', category: 'provider', message: 'The provider is unavailable.' }] } };
  let submitted = false, draft = 'Original unsent reply', expanded = false, focused = 'Reply to conversation';
  const captures = [], settingsWrites = [];
  const t = { appearanceEnabled: true, app: { pid: 787 },
    fixture: { url: 'http://127.0.0.1:9876', route(_path, callback) { handler = callback; return () => { handler = null; }; } },
    rpc: async (method, payload) => {
      if (method === 'settings.get') return structuredClone(currentSettings);
      if (method === 'settings.set') { settingsWrites.push(structuredClone(payload)); Object.assign(currentSettings, payload); return structuredClone(currentSettings); }
      if (method === 'pages.list') return [{ pageId: 'existing-page' }];
      if (method === 'workspace.get') return { activePageId: 'existing-page' };
      if (method === 'runs.list') return submitted ? [failed.run, previous] : [previous];
      if (method === 'runs.get') return structuredClone(failed);
      throw new Error(method);
    },
    until: async (_name, callback) => { const result = await callback(); assert.ok(result); return result; },
    capture: async (name, options) => { captures.push({ name, options }); },
    ax: { pid: 787, windows: async () => [{ id: 28, layer: 0, width: 800, height: 700 }],
      query: async selector => selector.name === 'Reply to conversation' ? [{ value: draft, focused: focused === selector.name }] : selector.name === 'Error details' ? [{ focused: focused === selector.name }] : selector.name === 'Provider error' ? expanded ? [{}] : [] : [{}],
      focus: async selector => { focused = selector.name; }, key: async key => { if (key === 'backspace') draft = ''; if (key === 'space') expanded = !expanded; },
      type: async text => { draft = text; }, waitFor: async (selector, state) => { if (selector.name === 'Provider error') assert.equal(expanded, state !== 'absent'); },
      press: async () => { submitted = true; draft = ''; const request = Readable.from([JSON.stringify({ messages: [{ role: 'user', content: question }] })]); request.method = 'POST'; request.url = '/appearance-provider-failure/v1/chat/completions'; await handler(request); },
      dump: async () => ({ expanded }),
    },
  };
  return { t, captures, failed, originalSettings, settingsWrites, read: () => ({ settings: currentSettings, draft, focused, handler }) };
}
test('source protocol captures actual collapsed/expanded state and restores original settings/draft', async () => {
  const { t, captures, failed, read, originalSettings } = context();
  const result = await captureFailedTurnDetailsAppearance(t);
  assert.deepEqual(result.failed, failed);
  assert.deepEqual(captures.map(row => row.options), [
    { windowId: 28, state: 'failed-turn-error-details-collapsed' },
    { windowId: 28, state: 'failed-turn-error-details-expanded-focused' },
    { windowId: 28, state: 'failed-turn-error-details-collapsed-focused' },
  ]);
  assert.deepEqual(read().settings, originalSettings); assert.equal(read().draft, 'Original unsent reply'); assert.equal(read().focused, 'Reply to conversation'); assert.equal(read().handler, null);
});
test('lost original owner preserves primary failure and explicit restoration debt', async () => {
  const { t, read } = context();
  const primary = new Error('Capture failed');
  t.capture = async () => { t.app = { pid: 787 }; throw primary; };
  await assert.rejects(captureFailedTurnDetailsAppearance(t), error => error instanceof AggregateError && error.errors[0] === primary && error.errors.length === 3);
  assert.equal(read().handler, null);
});
test('settings restoration failure cannot turn completed captures into success', async () => {
  const { t } = context(); const rpc = t.rpc; let writes = 0;
  t.rpc = async (method, payload) => { if (method === 'settings.set' && ++writes === 2) throw new Error('Original settings restore refused'); return rpc(method, payload); };
  await assert.rejects(captureFailedTurnDetailsAppearance(t), error => error instanceof AggregateError && error.errors.some(item => item.message === 'Original settings restore refused'));
});

test('unfinished original turn is stopped by its exact ID before state restoration, with primary retained', async () => {
  const { t, failed, read, originalSettings } = context(); const rpc = t.rpc; const stops = [];
  failed.run.status = 'running';
  t.rpc = async (method, payload) => { if (method === 'runs.stop') { stops.push(payload); failed.run.status = 'cancelled'; return failed.run; } return rpc(method, payload); };
  await assert.rejects(captureFailedTurnDetailsAppearance(t), error => error.code === 'ERR_ASSERTION');
  assert.deepEqual(stops, [{ runId: 'failed' }]);
  assert.deepEqual(read().settings, originalSettings); assert.equal(read().draft, 'Original unsent reply'); assert.equal(read().handler, null);
});

test('a newer reply after capture is retained instead of overwritten during cleanup', async () => {
  const { t } = context(); const query = t.ax.query, type = t.ax.type; const typed = [];
  t.ax.type = async (...args) => { typed.push(args[0]); return type(...args); };
  t.capture = async () => { t.ax.query = async selector => selector.name === 'Reply to conversation' ? [{ value: 'Newer person draft', focused: true }] : query(selector); };
  await assert.rejects(captureFailedTurnDetailsAppearance(t), error => error instanceof AggregateError && error.errors.some(item => /newer person draft/.test(item.message)));
  assert.deepEqual(typed, [question, 'Original unsent reply']);
  assert.equal((await t.ax.query({ name: 'Reply to conversation' }))[0].value, 'Newer person draft');
});
