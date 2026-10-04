import test from 'node:test';
import assert from 'node:assert/strict';
// Actual original fixed shared source producer, actual disposable HTTP server only.
// No App/helper/native/Security effects or user Profile is accessed.
import { createFixture, readDisposableModelCredentialEndpoint } from './fixture.mjs';
test('fixed endpoint lease is original listening loopback route with exact synthetic catalog', async () => {
  const fixture = await createFixture(); const lease = fixture.claimDisposableModelCredentialEndpoint();
  try {
    const original = readDisposableModelCredentialEndpoint(lease);
    assert.match(original.endpoint, /^http:\/\/127\.0\.0\.1:[1-9][0-9]*\/v1$/); assert.match(original.reservation, /^[a-f0-9]{64}$/);
    assert.throws(() => readDisposableModelCredentialEndpoint({ ...lease }), /Foreign/);
    assert.throws(() => fixture.claimDisposableModelCredentialEndpoint(), /one fixed/);
    const refused = await fetch(original.endpoint + '/models'); assert.equal(refused.status, 403);
    const response = await fetch(original.endpoint + '/models', { headers: { authorization: 'Bearer aux-disposable-loopback-appearance-synthetic-key-v1' } });
    assert.equal(response.status, 200); assert.deepEqual(await response.json(), { object: 'list', data: [{ id: original.model, object: 'model' }] });
    assert.deepEqual(readDisposableModelCredentialEndpoint(lease).observations, [
      { method: 'GET', path: '/v1/models', syntheticAuthorization: false }, { method: 'GET', path: '/v1/models', syntheticAuthorization: true }]);
    lease.dispose(); assert.throws(() => readDisposableModelCredentialEndpoint(lease), /retired/);
  } finally { await fixture.close(); }
});
test('original route replacement is permanent refusal and cannot remove foreign handler', async () => {
  const fixture = await createFixture(); const lease = fixture.claimDisposableModelCredentialEndpoint();
  const endpoint = readDisposableModelCredentialEndpoint(lease).endpoint;
  try {
    fixture.route('/v1/models', 'replacement');
    assert.throws(() => readDisposableModelCredentialEndpoint(lease), /retired/);
    assert.throws(() => lease.dispose(), /debt/);
    assert.equal(await (await fetch(endpoint + '/models')).text(), 'replacement');
  } finally { await fixture.close(); }
});
test('closed original server cannot admit endpoint or resurrect its retained lease', async () => {
  const fixture = await createFixture(); const lease = fixture.claimDisposableModelCredentialEndpoint();
  await fixture.close(); assert.throws(() => readDisposableModelCredentialEndpoint(lease), /retired/);
  assert.throws(() => lease.dispose(), /debt/);
  const next = await createFixture(); try { assert.throws(() => readDisposableModelCredentialEndpoint(lease), /retired/); assert.notEqual(readDisposableModelCredentialEndpoint(next.claimDisposableModelCredentialEndpoint()).reservation, ''); } finally { await next.close(); }
});
test('existing route or selectable argument never acquires fixed endpoint ownership', async () => {
  const fixture = await createFixture(); try {
    assert.throws(() => fixture.claimDisposableModelCredentialEndpoint('/foreign'), /one fixed/);
    fixture.route('/v1/models', 'original'); assert.throws(() => fixture.claimDisposableModelCredentialEndpoint(), /already has an owner/);
    assert.equal(await (await fetch(fixture.url + '/v1/models')).text(), 'original');
  } finally { await fixture.close(); }
});
