import assert from 'node:assert/strict';
import { readDisposableCredentialApp } from './app.mjs';
import { readDisposableModelCredentialEndpoint } from './fixture.mjs';
/** Invoke only after original App.start has awaited initializeCredentials and
 * before mounting Models/discovery/probe. No key read/store or model request. */
export async function configureOriginalDisposableCredentialModel({ app, pair, endpointLease, rpc }) {
  const endpoint = readDisposableModelCredentialEndpoint(endpointLease);
  const original = readDisposableCredentialApp(app, pair, endpointLease);
  assert.equal(original.endpoint, endpoint.endpoint); assert.equal(original.reservation, endpoint.reservation);
  assert.ok(original.owner.guardian.records.some(row => row.status === 'SAVED-RETAINED'));
  assert.deepEqual(endpoint.observations, [], 'Provider use preceded original endpoint configuration');
  const current = () => {
    const now = readDisposableCredentialApp(app, pair, endpointLease);
    const lease = readDisposableModelCredentialEndpoint(endpointLease);
    assert.equal(now.pid, original.pid); assert.equal(now.generation, original.generation);
    assert.deepEqual(now.process, original.process); assert.equal(lease.reservation, endpoint.reservation); assert.equal(lease.endpoint, endpoint.endpoint);
    assert.deepEqual(lease.observations, [], 'Provider use preceded original endpoint configuration');
  };
  const owned = async operation => { current(); const result = await operation(); current(); return result; };
  assert.deepEqual(await owned(() => rpc('runs.list')), []);
  const initial = await owned(() => rpc('settings.get'));
  assert.equal(initial.modelProvider, 'gateway'); assert.equal(initial.gatewayCredentialSource, 'none'); assert.equal(initial.modelConfigured, false);
  assert.equal(initial.modelConnections.find(row => row.provider === 'openai-compatible')?.credentialSource, 'saved');
  await owned(() => rpc('settings.set', { modelProvider: 'openai-compatible', compatibleEndpoint: endpoint.endpoint, plannerModel: endpoint.model }));
  const configured = await owned(() => rpc('settings.get'));
  assert.equal(configured.modelProvider, 'openai-compatible'); assert.equal(configured.compatibleEndpoint, endpoint.endpoint); assert.equal(configured.plannerModel, endpoint.model);
  assert.equal(configured.modelApiKey, '••••••••'); assert.equal(configured.modelCredentialSource, 'saved'); assert.equal(configured.modelConfigured, true);
  return Object.freeze({ endpoint: endpoint.endpoint, model: endpoint.model, reservation: endpoint.reservation,
    originalPid: original.pid, originalGeneration: original.generation, nativeAccepted: false });
}
