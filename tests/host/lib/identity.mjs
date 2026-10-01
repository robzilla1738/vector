import assert from 'node:assert/strict';
import { productIdentity } from '../../../scripts/lib/product-identity.mjs';

export { productIdentity };
export function assertJourneyIdentity(actual, expected) {
  assert.equal(actual.native.sourceCommit, expected.label, 'Journey app has a different native identity');
  assert.deepEqual(actual.runtime, expected, 'Journey app has a different runtime identity');
  assert.match(actual.native.manifestHash, /^[a-f0-9]{64}$/, 'Journey app lacks a native manifest digest');
  return actual;
}
