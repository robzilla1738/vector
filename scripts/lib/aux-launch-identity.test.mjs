import test from 'node:test';
import assert from 'node:assert/strict';
import {assertAuxLaunchIdentity} from './aux-launch-identity.mjs';
test('launch generation is evaluated before state creation and never implies migration acceptance', () => {
 const base = {version: 1, implementation: 'supplied'};
 assert.equal(assertAuxLaunchIdentity(base).service, 'aside-daemon');
 assert.equal(assertAuxLaunchIdentity({...base, identityProfile: 'aux-v1', stateIdentityVersion: 1}).service, 'aux-daemon');
 assert.throws(() => assertAuxLaunchIdentity({...base, identityProfile: 'aux-v1', stateIdentityVersion: 2}), /Transactional state migration/);
 for (const value of [{}, {...base, stateIdentityVersion: 3}, {...base, identityProfile: 'unknown'}, {...base, stateIdentityVersion: 2}]) assert.throws(() => assertAuxLaunchIdentity(value));
});
