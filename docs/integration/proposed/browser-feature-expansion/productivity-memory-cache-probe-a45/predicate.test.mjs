import assert from 'node:assert/strict';
import {test} from 'node:test';
import {usesFixedAccountMemoryFactory} from './predicate.mjs';
const fixed = supervised => Object.defineProperties({}, {
 supervisedTasksEnabled: {value: supervised},
 createAccountMemoryProcess: {value() { throw Error('Factory must not be invoked'); }}
});
test('binding absent keeps the original probe', () => {
 assert.equal(usesFixedAccountMemoryFactory(() => {throw Error('No linked binding');}), false);
});
test('supervised mode keeps the original probe', () => {
 assert.equal(usesFixedAccountMemoryFactory(() => fixed(true)), false);
});
test('immutable ordinary flag and immutable factory skip only the original probe', () => {
 assert.equal(usesFixedAccountMemoryFactory(() => fixed(false)), true);
});
test('mutable fake factory keeps the original probe', () => {
 const binding = Object.defineProperties({}, {
  supervisedTasksEnabled: {value: false},
  createAccountMemoryProcess: {value() {}, writable: true, configurable: true}
 });
 assert.equal(usesFixedAccountMemoryFactory(() => binding), false);
});
