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
      identityBefore: structuredClone(identity), identityAfter: structuredClone(identity), artifactAfter: structuredClone(identity),
      identityBeforeKind: 'retained-packaged-artifacts', identityAfterKind: 'original-live-runtime', browserCleanup: {cleanupDebt:false,nativeSlotRetained:false},
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

test('actual warm observation retains the identical original cold hardware/launch object instead of only the kernel receipt', async () => {
  const {observeAuxWarmWindow}=await import('./native-aux-warm-observation.mjs');
  const uuid='b'.repeat(32), helperUuid='c'.repeat(32), nonce='d'.repeat(32);
  const helperIdentity={pid:101,imageUuid:helperUuid,processStartMachTicks:'2000',binarySha256:'a'.repeat(64),sourceSha256:'a'.repeat(64)};
  const kernel={record:{browserPid:100,browserImageUuid:uuid,browserStartMachTicks:'1000'}};
  const coldPresentation={record:{browserPid:100},raw:'original cold hardware bytes',cold:kernel,
    originalLaunch:{raw:'original launch bytes',record:{browserPid:100}}};
  const input={producer:'aux-native-warm-window-input',version:1,targetPid:100,helperPid:101,originalWindowNumber:200,
    targetProcessUuid:uuid,targetProcessStartMachTicks:'1000',helperProcessUuid:helperUuid,helperProcessStartMachTicks:'2000',
    cgTimestampNs:'9000000000',postBeforeNs:'9000000000',postReturnedNs:'9000000010',releaseNs:'9020000000',keyCode:45,
    flags:'1048576',sourcePid:'101',sourceState:'-1',autorepeat:false,transport:'cghidEventTap'};
  const native={producer:'aux-native-warm-window',version:1,status:'measured',measured:true,earliestPresentationProven:true,
    inputLineageProven:false,browserProcessUuid:uuid,browserProcessStart:'1000',preparedWindowId:300,
    browserPid:100,requestNonce:nonce,preparedUs:'8999000',originalInputUs:'9000000',inputWindowNumber:200,inputKeyCode:45,
    inputSourcePid:'101',inputSourceState:'-1',inputCgFlags:'1048576',inputModifierFlags:'1048576',originalCgTimestampNs:'9000000000'};
  const ready={record:{producer:'aux-native-warm-window',version:1,status:'ready',requestNonce:nonce,browserPid:100,
    browserProcessUuid:uuid,browserProcessStart:'1000',windowId:300,preparedUs:'8999000'}};
  const order=[];
  const observed=await observeAuxWarmWindow({signal:new AbortController().signal,
    startup:{async presentation(){order.push('cold');return coldPresentation;},async prepareWarmWindow(){order.push('ready');return ready;},
      async completeWarmWindow(){order.push('warm');return {record:native,cold:kernel};},async stop(){throw new Error('unexpected cleanup');}},
    ax:{helperPid:101,targetPid:100,async request(operation){order.push(operation);return input;}},
    readInputHelperIdentity:async()=>helperIdentity});
  assert.equal(observed.coldPresentation,coldPresentation);
  assert.equal(observed.coldPresentation.originalLaunch,coldPresentation.originalLaunch);
  assert.equal(observed.cold,kernel);assert.equal(observed.record,native);
  assert.deepEqual(order,['cold','ready','warmWindowKeyReceipt','warm']);
  assert.equal(observed.cohortProven,false);assert.equal(observed.compiledHelperProven,false);
});
test('distinguishes original pre-launch artifacts from live post-launch identity without relabeling warm observations',()=>{
  const original=fixture();original[0].identityAfter.native.additionalActualField='retained';
  assert.equal(verify(original).count,20);
  for(const mutate of [a=>{a[0].identityBeforeKind='original-live-runtime';},
    a=>{a[0].identityAfterKind='retained-packaged-artifacts';},a=>{a[0].artifactAfter.native.buildId='replacement';}]) {
    const a=fixture();mutate(a);assert.throws(()=>verify(a));
  }
});
