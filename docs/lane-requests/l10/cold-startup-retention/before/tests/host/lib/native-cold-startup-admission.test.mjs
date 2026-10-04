import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { verifyColdStartupCohort } from './native-cold-startup-admission.mjs';
// Synthetic decoder falsification only; these records are not native evidence.
const helper = { binarySha256: '4'.repeat(64), sourceSha256: '5'.repeat(64), imageUuid: '6'.repeat(32) };
const browser = { sha256: '7'.repeat(64), imageUuid: '8'.repeat(32), device: '1', inode: '2' };
const productIdentity = { dirty: false, commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40) };
const candidate = { productIdentity, native: { sourceCommit: productIdentity.commit, buildId: 'original-build', manifestHash: 'c'.repeat(64) } };
const canonical = record => JSON.stringify(Object.fromEntries(Object.keys(record).sort().map(key => [key, record[key]])));
function fixture() {
  return Array.from({ length: 20 }, (_, i) => {
    const n = i + 1, trial = n.toString(16).padStart(32, '0'), pid = 200 + n, base = BigInt(n * 10000);
    const stamp = offset => String(base + BigInt(offset));
    const launch = { producer: 'aux-native-startup-launch', version: 1, kind: 'aux', trial, launcherPid: 100,
      browserPid: pid, launchMachTicks: stamp(10), spawnReturnedMachTicks: stamp(20),
      helperBinarySha256: helper.binarySha256, helperSourceSha256: helper.sourceSha256,
      nonce: `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`, sequence: '1' };
    const bytes = canonical(launch), receiptSha = createHash('sha256').update(bytes).digest('hex');
    const kernel = { producer: 'aux-native-startup-cold', version: 1, kind: 'aux', trial, launcherPid: 100,
      browserPid: pid, browserBinarySha256: browser.sha256, browserImageUuid: browser.imageUuid,
      browserDevice: browser.device, browserInode: browser.inode, browserStartMachTicks: stamp(15),
      inventoryStartedMachTicks: stamp(1), inventoryFinishedMachTicks: stamp(5),
      launchMachTicks: launch.launchMachTicks, spawnReturnedMachTicks: launch.spawnReturnedMachTicks, childObservedMachTicks: stamp(25) };
    const sink = { clientId: 1, sinkId: 2 };
    const hardware = { producer: 'aux-native-startup-presentation', version: 1, status: 'measured',
      reason: 'first_full_interactive_shell_hardware', measured: true, earliestPresentationProven: true,
      trial, launchReceiptNonce: launch.nonce, launchReceiptSha256: receiptSha, launcherPid: 100, browserPid: pid,
      helperBinarySha256: helper.binarySha256, helperSourceSha256: helper.sourceSha256,
      helperProcessUuid: helper.imageUuid, helperProcessStart: '1', launchMachTicks: launch.launchMachTicks,
      spawnReturnedMachTicks: launch.spawnReturnedMachTicks, nativeDisplayGeneration: '1', requestNonce: trial,
      sampleSequence: '1', windowId: 1, rendererPid: 400 + n, widgetRoutingId: 2,
      nativeDocumentGeneration: '1', shellSink: sink, displaySink: {clientId: 1, sinkId: 3},
      composerInstance: 'composer-1', elapsedUs: '70', shellFrameToken: 1, feedbackFlags: 4,
      launchUs: stamp(30), hardwareRegisteredUs: stamp(40), typeableObservedUs: stamp(50), commitUs: stamp(60),
      submittedUs: stamp(70), drawUs: stamp(80), swapStartUs: stamp(90), swapEndUs: stamp(95), presentedUs: stamp(100), observedUs: stamp(110),
      runtimeHelloUs: stamp(50), runtimePeerConfirmedUs: stamp(105), observationStartedUs: stamp(35),
      observationDeadlineUs: String(base + 5000035n), runtimeHelloElapsedUs: '20', runtimeConnectionGeneration: '1',
      runtimePid: 500 + n, runtimePidVersion: 1, runtimeAuditToken: [1,2,3,4,5,6,7,8],
      drawn: [{surface: {frameSink: sink, parentSequenceNumber: 1, childSequenceNumber: 1, embedToken: 'd'.repeat(32)},
        token: 1, surfaceSize: {width: 800,height: 600}, visibleBounds: {x: 0,y: 0,width: 800,height: 600}}] };
    const identity = {runtime: productIdentity, native: candidate.native};
    return {status: 'observed', powerBefore: "Now drawing from 'AC Power'", powerAfter: "Now drawing from 'AC Power'",
      identityBefore: structuredClone(identity), identityAfter: structuredClone(identity), browserCleanup: {cleanupDebt:false,nativeSlotRetained:false},
      originalCold: {trial, launcherPid: 100, launchRaw: `AUX_STARTUP_LAUNCH_V1 ${bytes}\n`,
        kernelRaw: `AUX_STARTUP_COLD_V1 ${canonical(kernel)}\n`, presentationRaw: `AUX_NATIVE_STARTUP_V1 ${JSON.stringify(hardware)}\n`} };
  });
}
const verify = attempts => verifyColdStartupCohort(attempts, {candidate,helper,browser});
test('reconstructs all twenty original byte chains without claiming first paint, navigation or qualified performance', () => {
  const attempts = fixture(), result = verify(attempts);
  assert.equal(result.count,20); assert.equal(result.originalAttempts,attempts);
  assert.equal(result.samples[0].hardware.raw,attempts[0].originalCold.presentationRaw);
  assert.equal(result.samples[0].interactiveUs,'70'); assert.equal(result.samples[0].runtimeHelloUs,'20');
  for(const key of ['firstFrameProven','ordinaryNavigationTimingProven','artifactAdmissionProven','nativeQualificationProven','relativeComparisonProven']) assert.equal(result[key],false);
});
test('does not trust decoded timing clones or AX/ACK substitutions', () => {
  const attempts=fixture(); attempts[0].decoded={elapsedUs:'1'};
  assert.equal(verify(attempts).samples[0].interactiveUs,'70');
  for(const key of ['launchRaw','kernelRaw','presentationRaw']) {
    const missing=fixture(); missing[0].originalCold[key]='{"ack":true,"axVisible":true}'; assert.throws(()=>verify(missing));
  }
});
test('refuses dropped trial, refusal, repeated generation, battery bracket and cleanup debt', () => {
  assert.throws(()=>verify(fixture().slice(1)));
  for(const mutate of [a=>{a[0].status='refused';},a=>{a[1].originalCold=a[0].originalCold;},
    a=>{a[0].powerAfter="Now drawing from 'Battery Power'";},a=>{a[0].browserCleanup.cleanupDebt=true;},
    a=>{a[0].identityAfter.native.buildId='replacement';}]) { const a=fixture();mutate(a);assert.throws(()=>verify(a)); }
});
test('refuses missing HW completion, foreign composer document and altered retained original kernel bytes', () => {
  const foreign=fixture(), kernel=JSON.parse(foreign[0].originalCold.kernelRaw.slice('AUX_STARTUP_COLD_V1 '.length));
  kernel.browserBinarySha256='f'.repeat(64);foreign[0].originalCold.kernelRaw=`AUX_STARTUP_COLD_V1 ${canonical(kernel)}\n`;assert.throws(()=>verify(foreign));
  for(const mutate of [r=>{r.feedbackFlags=0;},r=>{r.nativeDocumentGeneration='2';},r=>{r.launchReceiptSha256='f'.repeat(64);}]) {
    const a=fixture(), r=JSON.parse(a[0].originalCold.presentationRaw.slice('AUX_NATIVE_STARTUP_V1 '.length));
    mutate(r);a[0].originalCold.presentationRaw=`AUX_NATIVE_STARTUP_V1 ${JSON.stringify(r)}\n`;assert.throws(()=>verify(a));
  }
});
