import test from 'node:test';
import assert from 'node:assert/strict';
import { originalInputHelperClose } from './native-input-helper-close.mjs';
// Pure original-close-event classification controls, never process evidence.
const original = () => ({ helperPid: 12, code: 0, signal: null, cleanupRequested: true,
  primary: undefined, pendingCount: 0, stderr: '' });
test('intentional original EOF and real zero-status close remain immutable', () => {
  const r = originalInputHelperClose(original()); assert.equal(r.clean, true);
  assert.equal(r.reaped, true); assert.equal(r.helperPid, 12); assert.ok(Object.isFrozen(r));
});
for (const [field, value] of [['cleanupRequested', false], ['code', 1], ['code', null],
  ['signal', 'SIGTERM'], ['pendingCount', 1], ['helperPid', undefined]]) {
  test(`original ${field}=${value} cannot be relabeled clean`, () => {
    const v = original(); v[field] = value; const r = originalInputHelperClose(v);
    assert.equal(r.clean, false); assert.ok(r.primary instanceof Error);
    assert.equal(r[field], field === 'helperPid' ? null : value);
  });
}
test('original parser/timeout failure survives otherwise clean close', () => {
  const v = original(); v.primary = new Error('original invalid response');
  const r = originalInputHelperClose(v); assert.equal(r.primary, v.primary); assert.equal(r.clean, false);
});
