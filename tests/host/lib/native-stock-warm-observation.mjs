import assert from 'node:assert/strict';
import { pairWarmWindowInput } from './native-warm-window-input.mjs';

/** Actual fixed caller ordering. No selector/chord is accepted: the original
 * client invokes the one-shot helper operation after original native Ready.
 * Independent source/compiler/kernel attestation and AC/cohort admission are
 * still required; this observation deliberately cannot qualify a trial. */
export async function observeStockWarmWindow({ startup, ax, readInputHelperIdentity, signal }) {
  assert.ok(signal instanceof AbortSignal); signal.throwIfAborted();
  assert.ok(startup && typeof startup.presentation === 'function' && typeof startup.prepareWarmWindow === 'function' &&
    typeof startup.completeWarmWindow === 'function' && typeof startup.stop === 'function');
  assert.ok(ax && typeof ax.request === 'function' && typeof readInputHelperIdentity === 'function');
  try {
    const before = structuredClone(await readInputHelperIdentity()); signal.throwIfAborted();
    assert.equal(ax.helperPid, before.pid); assert.ok(Number.isSafeInteger(ax.targetPid) && ax.targetPid > 0);
    const cold = await startup.presentation(); signal.throwIfAborted();
    assert.equal(ax.targetPid, cold.record.browserPid);
    const ready = await startup.prepareWarmWindow(); signal.throwIfAborted();
    assert.equal(ready.record.browserPid, ax.targetPid);
    const originalInput = await ax.request('warmWindowKeyReceipt'); signal.throwIfAborted();
    const measured = await startup.completeWarmWindow(); signal.throwIfAborted();
    const after = structuredClone(await readInputHelperIdentity()); signal.throwIfAborted();
    assert.deepEqual(after, before, 'Original input helper artifact or process generation changed');
    assert.equal(ax.helperPid, before.pid); assert.equal(ax.targetPid, measured.record.browserPid);
    const inputPair = pairWarmWindowInput(originalInput, measured.record, ready.record,
      { kind: 'stock', inputHelper: before, coldKernel: measured.cold.record });
    return Object.freeze({ ...measured, inputPair, originalHelperBefore: Object.freeze(before),
      originalHelperAfter: Object.freeze(after), observationOnly: true, compiledHelperProven: false,
      acPowerProven: false, cohortProven: false, relativeComparisonProven: false });
  } catch (primary) {
    // Preserve original cleanup debt and retained slot. Never signal a browser
    // PID or replace the original helper's cancellation/reap ownership.
    try { primary.cleanup = await startup.stop(primary); }
    catch (cleanup) { primary.cleanupFailure = cleanup; }
    throw primary;
  }
}
