import assert from 'node:assert/strict';
/** Original App-owned child lifetime only. The caller retains spawn, native slot
 * and artifact cleanup ownership; this guard neither launches nor admits a pair. */
export function createPrivateObservationOwner({ child, generation, pair, stream }) {
  assert.ok(Number.isInteger(child?.pid) && child.pid > 0 && Number.isInteger(generation) && generation > 0);
  const pid = child.pid, native = Object.freeze({ ...pair.native });
  let retired, closeReceipt, resolveClose;
  const closed = new Promise(resolve => { resolveClose = resolve; });
  function retire(error) {
    if (retired) return;
    retired = error; stream.dispose();
  }
  function failed(error) { retire(error); }
  function close(code, signal) {
    closeReceipt = Object.freeze({ pid, generation, code, signal });
    retire(new Error('Original private child closed'));
    child.off('error', failed); child.off('close', close);
    resolveClose(closeReceipt);
  }
  child.once('error', failed); child.once('close', close);
  function assertChild() {
    if (retired) throw retired;
    assert.equal(child.pid, pid, 'Original private child identity changed');
    assert.equal(child.exitCode, null, 'Original private child exited before receipt delivery');
    assert.equal(child.signalCode, null, 'Original private child signaled before receipt delivery');
  }
  function assertLive() {
    assertChild(); pair.validate(); assertChild();
    assert.deepEqual(pair.native, native, 'Original compiled identity changed');
  }
  async function observe(selection) {
    assertLive();
    const receipt = await (selection === undefined ? stream.discover() : stream.observe(selection));
    assertLive();
    assert.equal(receipt.window.pid, pid, 'Foreign private receipt child');
    assert.equal(receipt.window.windowKind, 'private');
    assert.equal(receipt.runtimeStatus, 'inactive-private');
    assert.deepEqual(receipt.native, native, 'Private native receipt differs from original pair');
    const freeze = value => {
      if (value && typeof value === 'object') { for (const item of Object.values(value)) freeze(item); Object.freeze(value); }
      return value;
    };
    return freeze(structuredClone(receipt));
  }
  try { assertLive(); }
  catch (error) { retire(error); child.off('error', failed); child.off('close', close); throw error; }
  return Object.freeze({ pid, generation, native, closed, assertLive,
    discover() { assert.equal(arguments.length, 0, 'Private discovery has no selectors'); return observe(); },
    observe, retire,
    get closeReceipt() { return closeReceipt; },
  });
}
