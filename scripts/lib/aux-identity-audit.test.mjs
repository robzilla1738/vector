import assert from 'node:assert/strict';
import test from 'node:test';
import { countIdentityReferences } from '../audit-aux-identity.mjs';

test('identity inventory distinguishes compatibility, ciphertext and product endpoint references', () => {
  const counts = countIdentityReferences('AsideDaemonSessionToken Aside.getTabs aside.dk.wrapped aside.install.sig https://api.aside.com');
  assert.equal(counts.protocol, 2);
  assert.equal(counts.persistedCrypto, 2);
  assert.equal(counts.endpoint, 1);
  assert.ok(counts.product > 0);
});
test('HTML semantics and generic upstream prose are not product identity', () => {
  assert.deepEqual(countIdentityReferences('<aside class="panel">put this aside</aside>'), { protocol: 0, persistedCrypto: 0, endpoint: 0, product: 0 });
  assert.deepEqual(countIdentityReferences('AuxDaemonSessionToken Aux.getTabs aux.dk.wrapped https://api.getaux.co'), { protocol: 0, persistedCrypto: 0, endpoint: 0, product: 0 });
});
