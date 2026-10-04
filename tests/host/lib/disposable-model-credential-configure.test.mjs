import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const body = readFileSync(new URL('./disposable-model-credential-configure.mjs', import.meta.url), 'utf8').replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '');
function fixture() {
  const app = {}, pair = {}, endpointLease = {}, endpoint = { endpoint: 'http://127.0.0.1:3210/v1', reservation: 'c'.repeat(64), model: 'aux-disposable-credential-appearance', observations: [] };
  const owner = { pid: 555, generation: 1, process: { pid: 555, generation: 1 }, endpoint: endpoint.endpoint, reservation: endpoint.reservation, owner: { guardian: { records: [{ status: 'SAVED-RETAINED' }] } } };
  const calls = []; let current = true, hook = () => {}, snapshot = { modelProvider: 'gateway', gatewayCredentialSource: 'none', modelConfigured: false, modelConnections: [{ provider: 'openai-compatible', credentialSource: 'saved' }] };
  const configure = new Function('assert', 'readDisposableCredentialApp', 'readDisposableModelCredentialEndpoint', body + '\nreturn configureOriginalDisposableCredentialModel;')
    (assert, (a, p, lease) => { assert.equal(a, app); assert.equal(p, pair); assert.equal(lease, endpointLease); assert.ok(current); return structuredClone(owner); }, lease => { assert.equal(lease, endpointLease); assert.ok(current); return structuredClone(endpoint); });
  return { owner, endpoint, calls, retire() { current = false; }, hook(fn) { hook = fn; }, configure: () => configure({ app, pair, endpointLease, async rpc(method, params) {
    calls.push({ method, params }); await hook(method); if (method === 'runs.list') return []; if (method === 'settings.get') return structuredClone(snapshot);
    assert.equal(method, 'settings.set'); snapshot = { ...snapshot, ...params, modelConfigured: true, modelApiKey: '••••••••', modelCredentialSource: 'saved' }; return snapshot;
  } }) };
}
test('actual caller configures exact retained local endpoint before any model/catalog/probe use', async () => {
  const f = fixture(); const result = await f.configure(); assert.equal(result.nativeAccepted, false);
  assert.deepEqual(f.calls.map(row => row.method), ['runs.list', 'settings.get', 'settings.set', 'settings.get']);
  assert.deepEqual(f.calls[2].params, { modelProvider: 'openai-compatible', compatibleEndpoint: f.endpoint.endpoint, plannerModel: f.endpoint.model });
  assert.equal(f.calls.some(row => /probe|Models|start|Secret/.test(row.method)), false);
});
test('prior provider use and missing actual saved ACK refuse before configuration', async () => {
  for (const fault of ['use', 'ack']) {
    const f = fixture(); if (fault === 'use') f.endpoint.observations.push({ method: 'GET' }); else f.owner.owner.guardian.records = [];
    await assert.rejects(f.configure()); assert.deepEqual(f.calls, []);
  }
});
test('original owner retirement or endpoint replacement during ACK prevents subsequent provider use', async () => {
  for (const fault of ['retire', 'replace']) {
    const f = fixture(); f.hook(method => { if (method === 'settings.set') { if (fault === 'retire') f.retire(); else f.endpoint.reservation = 'd'.repeat(64); } });
    await assert.rejects(f.configure()); assert.equal(f.calls.at(-1).method, 'settings.set');
  }
});
