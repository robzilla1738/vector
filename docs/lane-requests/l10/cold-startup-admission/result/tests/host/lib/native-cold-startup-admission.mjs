import assert from 'node:assert/strict';
import { parseStartupLaunchReceipt } from './startup-launch-receipt.mjs';
import { parseStartupColdReceipt } from './startup-cold-receipt.mjs';
import { validateStartupPresentation } from './native-startup-protocol.mjs';

/** Reconstruct retained originals, never cached decoded clones. The supplied
 * artifact pins still require external actual build/helper lease admission.
 * This endpoint proves first eligible interactive hardware, not first paint
 * or a navigation presentation. No launch/input/cleanup capability is called. */
export function verifyColdStartupCohort(attempts, { candidate, helper, browser }) {
  assert.ok(Array.isArray(attempts) && attempts.length >= 20 && attempts.length <= 100,
    'Keep every original 20–100 AC attempt, including refusals');
  assert.equal(candidate?.productIdentity?.dirty, false);
  assert.match(candidate.productIdentity.commit, /^[a-f0-9]{40}$/);
  assert.match(candidate.productIdentity.tree, /^[a-f0-9]{40}$/);
  assert.equal(candidate.productIdentity.label, candidate.productIdentity.commit);
  assert.equal(candidate.native?.sourceCommit, candidate.productIdentity.commit);
  assert.ok(candidate.native.buildId); assert.match(candidate.native.manifestHash, /^[a-f0-9]{64}$/);
  const generations = new Set(), launches = new Set(), nativeNonces = new Set(), trialIds = new Set();
  const samples = [];
  let previousObserved = 0n;
  for (const attempt of attempts) {
    assert.equal(attempt.status, 'observed', 'Refused/incomplete cold attempts cannot be dropped');
    for (const value of [attempt.powerBefore, attempt.powerAfter])
      assert.match(value, /Now drawing from 'AC Power'/, 'Actual original AC brackets required');
    for (const value of [attempt.identityBefore, attempt.identityAfter]) {
      assert.deepEqual(value?.runtime, candidate.productIdentity);
      for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(value.native?.[key], candidate.native[key]);
    }
    assert.deepEqual(attempt.identityBefore, attempt.identityAfter, 'Original identity bracket drift');
    const original = attempt.originalCold;
    assert.ok(original, 'Original launch/kernel/hardware bytes were not retained');
    const launch = parseStartupLaunchReceipt(original.launchRaw, {
      kind: 'aux', trial: original.trial, launcherPid: original.launcherPid,
      helperBinarySha256: helper.binarySha256, helperSourceSha256: helper.sourceSha256,
    });
    const cold = parseStartupColdReceipt(original.kernelRaw, launch.record, browser);
    const hardware = validateStartupPresentation(original.presentationRaw, launch, { helperImageUuid: helper.imageUuid });
    const generation = `${cold.record.browserPid}:${cold.record.browserImageUuid}:${cold.record.browserStartMachTicks}`;
    for (const [set, value] of [[generations, generation], [launches, launch.receiptSha256],
      [nativeNonces, hardware.record.requestNonce], [trialIds, launch.record.trial]]) {
      assert.ok(!set.has(value), 'Repeated original cold trial authority'); set.add(value);
    }
    assert.ok(BigInt(hardware.record.launchUs) > previousObserved, 'Overlapping original cold trials');
    previousObserved = BigInt(hardware.record.observedUs);
    assert.equal(attempt.browserCleanup?.cleanupDebt, false, 'Original browser cleanup debt');
    assert.equal(attempt.browserCleanup.nativeSlotRetained, false, 'Original native slot retained');
    assert.ok(!attempt.browserCleanup.primary && !attempt.browserCleanup.cleanup && !attempt.browserCleanupFailure);
    samples.push(Object.freeze({ launch, cold, hardware, interactiveUs: hardware.elapsedUs,
      runtimeHelloUs: hardware.runtimeHelloElapsedUs }));
  }
  return Object.freeze({ endpoint: 'original OS launch → first eligible full interactive shell hardware',
    samples: Object.freeze(samples), count: samples.length, originalAttempts: attempts,
    firstFrameProven: false, ordinaryNavigationTimingProven: false,
    artifactAdmissionProven: false, nativeQualificationProven: false, relativeComparisonProven: false });
}
