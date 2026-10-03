import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { observeAuxWarmWindow } from './native-aux-warm-observation.mjs';
const decimal = value => {
  assert.match(value ?? '', /^[1-9][0-9]{0,19}$/);
  const number = BigInt(value); assert.ok(number <= 9223372036854775807n); return number;
};
const rank = (values, percentile) => values[Math.ceil(values.length * percentile) - 1];
function verifyIdentity(actual, candidate) {
  assert.deepEqual(actual.runtime, candidate.productIdentity, 'Actual runtime identity changed');
  for (const key of ['sourceCommit', 'buildId', 'manifestHash'])
    assert.equal(actual.native?.[key], candidate.native[key], `Actual native ${key} changed`);
}
/** Each factory creates one original admitted cold process, then one genuine
 * added window. It must retain ownership if partial setup fails. A failed reap
 * stops the cohort: there is no PID signaling, retry or cleanup-debt waiver.
 * This collector preserves producer evidence; compiled input-helper authority
 * and matched Stock instrumentation are separate required admission gates. */
export async function collectAuxWarmWindows({ candidate, openTrial, readPower = () =>
  execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 }),
  signal, trials = 20 }) {
  const report = { schema: 1, producer: 'aux-warm-window-cohort', classification: 'warm-additional-window',
    endpoint: 'original native Cmd+N → first full interactive shell hardware presentation',
    candidate: structuredClone(candidate), attempts: [], samplesUs: [], status: 'running',
    compiledHelperProven: false, nativeQualificationProven: false, relativeComparisonProven: false };
  const processGenerations = new Set(), launches = new Set(), nonces = new Set();
  let previousHardware = 0n;
  try {
    assert.ok(signal instanceof AbortSignal); signal.throwIfAborted();
    assert.ok(Number.isInteger(trials) && trials >= 20 && trials <= 100, '20–100 actual AC trials required');
    assert.ok(typeof openTrial === 'function' && typeof readPower === 'function');
    const identity = candidate?.productIdentity;
    assert.equal(identity?.dirty, false); assert.match(identity?.commit ?? '', /^[a-f0-9]{40}$/);
    assert.match(identity?.tree ?? '', /^[a-f0-9]{40}$/); assert.equal(identity.label, identity.commit);
    assert.equal(candidate.native?.sourceCommit, identity.commit);
    assert.match(candidate.native?.manifestHash ?? '', /^[a-f0-9]{64}$/); assert.ok(candidate.native.buildId);
    for (let index = 0; index < trials; index++) {
      signal.throwIfAborted();
      const attempt = { trial: index + 1, status: 'running' }; report.attempts.push(attempt);
      let owner, primary, observation;
      try {
        attempt.powerBefore = await readPower();
        assert.match(attempt.powerBefore, /Now drawing from 'AC Power'/, 'Actual AC required');
        owner = await openTrial(index, signal); signal.throwIfAborted();
        assert.ok(owner?.startup && owner.ax && typeof owner.readIdentity === 'function');
        attempt.identityBefore = structuredClone(await owner.readIdentity());
        verifyIdentity(attempt.identityBefore, candidate); signal.throwIfAborted();
        observation = await observeAuxWarmWindow({ ...owner, signal });
        attempt.observation = observation;
        const native = observation.record, kernel = observation.cold.record;
        assert.equal(native.producer, 'aux-native-warm-window'); assert.equal(native.status, 'measured');
        assert.equal(native.measured, true); assert.equal(native.earliestPresentationProven, true);
        assert.equal(native.classification, 'warm-additional-window'); assert.equal(native.sampleSequence, '2');
        assert.equal(observation.inputPair.helperPairMatched, true);
        assert.equal(native.browserPid, kernel.browserPid);
        assert.equal(native.browserProcessUuid, kernel.browserImageUuid);
        assert.equal(native.browserProcessStart, kernel.browserStartMachTicks);
        const processKey = `${native.browserPid}:${native.browserProcessUuid}:${native.browserProcessStart}`;
        assert.ok(!processGenerations.has(processKey), 'Repeated original process generation');
        assert.ok(!launches.has(native.launchReceiptSha256), 'Repeated original launch receipt');
        assert.ok(!nonces.has(native.requestNonce), 'Repeated native warm ticket');
        const input = decimal(native.originalInputUs), hardware = decimal(native.presentedUs), elapsed = decimal(native.elapsedUs);
        assert.ok(input > previousHardware, 'Overlapping original input/hardware trials');
        assert.equal(hardware - input, elapsed, 'Raw native interval changed');
        attempt.identityAfter = structuredClone(await owner.readIdentity());
        verifyIdentity(attempt.identityAfter, candidate);
        assert.deepEqual(attempt.identityAfter, attempt.identityBefore, 'Candidate identity drift');
        attempt.powerAfter = await readPower();
        assert.match(attempt.powerAfter, /Now drawing from 'AC Power'/, 'Actual AC required');
        signal.throwIfAborted();
        processGenerations.add(processKey); launches.add(native.launchReceiptSha256); nonces.add(native.requestNonce);
        previousHardware = hardware;
      } catch (error) { primary = error; }
      if (owner) {
        // Stop the original input helper before the launch helper retires its
        // browser; retain all cleanup failures without masking measurement.
        try {
          attempt.inputCleanup = await owner.ax.close();
          if (attempt.inputCleanup.primary) throw attempt.inputCleanup.primary;
          assert.equal(attempt.inputCleanup.helperPid, owner.ax.helperPid);
          assert.equal(attempt.inputCleanup.producer, 'aux-native-input-helper-close');
          assert.equal(attempt.inputCleanup.reaped, true); assert.equal(attempt.inputCleanup.clean, true);
          assert.equal(attempt.inputCleanup.cleanupRequested, true);
          assert.equal(attempt.inputCleanup.code, 0); assert.equal(attempt.inputCleanup.signal, null);
          assert.equal(attempt.inputCleanup.pendingCount, 0); assert.ok(!attempt.inputCleanup.primary);
        } catch (error) { attempt.inputCleanupFailure = error; attempt.inputCleanupError = error.message; primary ??= error; }
        try {
          attempt.browserCleanup = await owner.startup.stop(primary);
          assert.equal(attempt.browserCleanup.cleanupDebt, false, 'Original browser reap is unproved');
          assert.equal(attempt.browserCleanup.nativeSlotRetained, false, 'Original native slot remains quarantined');
          assert.ok(!attempt.browserCleanup.primary && !attempt.browserCleanup.cleanup,
            'Original browser cleanup failed');
        } catch (error) { attempt.browserCleanupFailure = error; attempt.browserCleanupError = error.message; primary ??= error; }
      }
      if (primary) { attempt.status = 'failed'; attempt.primary = primary; attempt.error = primary.message; throw primary; }
      assert.ok(observation); attempt.status = 'observed'; report.samplesUs.push(observation.record.elapsedUs);
    }
    const sorted = report.samplesUs.map(BigInt).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    report.p50Us = rank(sorted, 0.5).toString(); report.p95Us = rank(sorted, 0.95).toString();
    report.maxUs = sorted.at(-1).toString(); report.status = 'observed';
    // Warm has no separate absolute limit in M2. No fabricated pass or relative
    // comparison is possible without independently matched Stock evidence.
    return report;
  } catch (error) {
    report.status = 'failed'; report.primary = error; report.error = error.message;
    const failure = new Error(`Aux warm cohort refused: ${error.message}`, { cause: error });
    failure.report = report; throw failure;
  }
}
