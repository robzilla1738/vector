import test from 'node:test';
import assert from 'node:assert/strict';
import { applyProvidedEntitlementPolicy } from './provided-signing.mjs';

test('reviewed boundary exception keeps runtime capability decisions and removes original identity claims', () => {
  const observed = { 'com.apple.security.cs.allow-jit': true, 'keychain-access-groups': ['original.group'] };
  const policy = { preserveKeys: ['com.apple.security.cs.allow-jit'], removeKeys: ['keychain-access-groups'], addDyldEnvironmentForBoundary: true };
  assert.throws(() => applyProvidedEntitlementPolicy(observed, policy), /requires a changed supplied hardened SEA host/);
  assert.deepEqual(applyProvidedEntitlementPolicy(observed, policy, { canAddBoundaryDyld: true }).values, {
    'com.apple.security.cs.allow-jit': true,
    'com.apple.security.cs.allow-dyld-environment-variables': true,
  });
  assert.throws(() => applyProvidedEntitlementPolicy(observed, { ...policy, removeKeys: [] }, { canAddBoundaryDyld: true }), /Exhaustive/);
  assert.throws(() => applyProvidedEntitlementPolicy(observed, { preserveKeys: Object.keys(observed), removeKeys: [] }), /capability booleans only/);
});
