import assert from 'node:assert/strict';
import { dismissFreshSetup } from './dismiss-fresh-setup.mjs';

/** The reader is supplied by the runner's owned native producer, never a journey label or launch flag. */
export async function dismissObservedSetup(t, observeWindow) {
  if (!observeWindow) return dismissFreshSetup(t);
  let kind;
  await t.step('observe current native fixture window kind', { kind: 'rpc', features: [] }, async () => {
    const pid = t.app.pid;
    assert.ok(Number.isInteger(pid) && pid > 0 && t.ax.pid === pid, 'Setup requires its original app/helper owner');
    const inventory = async () => {
      const rows = (await t.ax.windows()).filter(row => row.layer === 0 && row.width > 0 && row.height > 0);
      assert.equal(t.app.pid, pid, 'Setup app owner changed'); assert.equal(t.ax.pid, pid, 'Setup helper owner changed');
      assert.equal(rows.length, 1, 'Setup requires one original normal-layer window');
      assert.ok(Number.isInteger(rows[0].id) && rows[0].id > 0, 'Setup window identity missing');
      return rows[0];
    };
    const original = await inventory();
    const receipt = await observeWindow(original.id);
    const current = await inventory();
    assert.deepEqual(current, original, 'Setup helper window changed during native admission');
    for (const side of ['before', 'after']) {
      assert.equal(receipt[side].window.pid, pid, 'Setup native PID mismatch');
      assert.equal(receipt[side].window.windowId, original.id, 'Setup native window mismatch');
    }
    kind = receipt.after.window.windowKind;
    assert.equal(receipt.before.window.windowKind, kind, 'Setup native kind changed');
    assert.ok(['normal', 'private', 'quick-ask', 'little'].includes(kind), 'Unknown setup native kind');
    t.diagnostic('setup-window-kind', receipt);
    if (kind === 'private') {
      const controls = await t.ax.query({ role: 'AXButton', name: 'Finish later', match: 'exact', scope: 'shell', index: 0 });
      assert.equal(controls.length, 0, 'Private setup exclusion must match actual UI');
    }
    return { ax: await t.ax.dump(), native: receipt };
  });
  if (kind !== 'private') return dismissFreshSetup(t);
}
