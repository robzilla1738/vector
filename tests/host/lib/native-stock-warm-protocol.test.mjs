import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeStockWarmReady,decodeStockWarmPresentation} from './native-stock-warm-protocol.mjs';
// Synthetic serialization/refusal fixtures only. No launch/native/HW evidence.
const token='a'.repeat(32),kernelUuid='b'.repeat(32),launcherUuid='c'.repeat(32),hash='d'.repeat(64);
const prefix='AUX_NATIVE_FIXTURE_REPLY_V1 ';
function fixture() {
  const launch={record:{kind:'stock',trial:token,nonce:'11111111-1111-1111-1111-111111111111',browserPid:100,launcherPid:99,
    helperBinarySha256:hash,helperSourceSha256:hash,launchMachTicks:'8000000000',spawnReturnedMachTicks:'8000100000'},receiptSha256:hash};
  const cold={record:{producer:'aux-native-stock-startup-presentation',status:'measured',measured:true,earliestPresentationProven:true,
    browserPid:100,launchReceiptSha256:hash,trial:token,browserWindowId:300,observedUs:'8990000'}};
  const kernel={browserPid:100,browserImageUuid:kernelUuid,browserStartMachTicks:'1000'};
  const ready={producer:'aux-native-stock-warm-ready',version:1,status:'ready',nonce:token,preparedUs:'8999000',browserPid:100,
    browserProcessUuid:kernelUuid,browserProcessStart:'1000',originalBrowserWindowId:300,trial:token,
    launchReceiptNonce:launch.record.nonce,launchReceiptSha256:hash,helperBinarySha256:hash,helperSourceSha256:hash};
  const measured={producer:'aux-native-stock-warm-presentation',version:1,status:'measured',reason:'first_full_interactive_stock_added_window_root_hardware',
    measured:true,earliestPresentationProven:true,inputLineageProven:false,originalBrowserProcessUuid:kernelUuid,originalBrowserProcessStart:'1000',
    originalBrowserWindowId:300,trial:token,launchReceiptNonce:launch.record.nonce,launchReceiptSha256:hash,launcherPid:99,browserPid:100,
    helperBinarySha256:hash,helperSourceSha256:hash,helperProcessUuid:launcherUuid,helperProcessStart:'500',
    launchMachTicks:'8000000000',spawnReturnedMachTicks:'8000100000',originalLaunchedUs:'8000000',originalEventSeconds:'9',
    originalCgTimestampNs:'9000000000',inputWindowNumber:200,inputSourcePid:'101',inputSourceState:'-1',inputKeyCode:45,
    inputCgFlags:'1048576',inputModifierFlags:'1048576',spawnReturnedUs:'8000100',deadlineUs:'14000000',browserWindowId:301,
    displayGeneration:'1',documentReceipt:token,measurementNonce:token,sampleSequence:'1',rootSurface:{frameSink:{clientId:1,sinkId:2},parentSequenceNumber:1,childSequenceNumber:2,embedToken:token},
    rootFrameToken:1,rootBounds:[0,0,1500,900],feedbackFlags:4,alphaReadbackAttempted:false,elapsedUs:'300',preparedUs:'8999000',nativeInputUs:'9000000',
    registeredUs:'9000100',typeableObservedUs:'9000150',commitUs:'9000200',submittedUs:'9000230',drawUs:'9000250',
    swapStartUs:'9000260',swapEndUs:'9000280',presentedUs:'9000300',observedUs:'9000350'};
  const outer=record=>({producer:'aux-native-fixture-reply',version:1,pid:100,windowId:300,sequence:record===ready?'1':'2',operation:record===ready?'prepareStockWarmWindow':'completeStockWarmWindow',record});
  const raw=record=>prefix+JSON.stringify(outer(record))+'\n';
  return {launch,cold,kernel,ready,measured,raw};
}
function decode(f,raw=f.raw(f.measured)) {
  const ready=decodeStockWarmReady(f.raw(f.ready),f.launch,f.cold,f.kernel,'1');
  return decodeStockWarmPresentation(raw,f.launch,ready,{expectedSequence:'2',launcherImageUuid:launcherUuid});
}
test('pairs strict original warm bytes but leaves physical qualification unknown',()=>{
  const result=decode(fixture());assert.equal(result.elapsedUs,'300');assert.equal(result.inputPairProven,false);
  assert.equal(result.cohortProven,false);assert.equal(result.relativeComparisonProven,false);assert.ok(Object.isFrozen(result.record.rootSurface));
});
for(const [name,mutate] of [
  ['reused original window',f=>{f.measured.browserWindowId=300;}],['foreign browser generation',f=>{f.ready.browserProcessStart='1001';}],
  ['foreign launcher helper',f=>{f.measured.helperProcessUuid='e'.repeat(32);}],['stale nonce',f=>{f.measured.measurementNonce='f'.repeat(32);}],
  ['reversed submission',f=>{f.measured.submittedUs='9000100';}],['expired original deadline',f=>{f.measured.observedUs='14000001';}],
  ['software feedback',f=>{f.measured.feedbackFlags=0;}],['failure feedback',f=>{f.measured.feedbackFlags=20;}],
  ['partial client footprint',f=>{f.measured.rootBounds[0]=1;}],['abbreviated SurfaceId',f=>{f.measured.rootSurface='1:2';}],
  ['missing root embed nonce',f=>{delete f.measured.rootSurface.embedToken;}],['different input modifiers',f=>{f.measured.inputModifierFlags='1179648';}],
  ['fake elapsed subtraction',f=>{f.measured.elapsedUs='1';}],['unknown source label',f=>{f.measured.requestedTheme='dark';}],
])test(`refuses ${name}`,()=>{const f=fixture();mutate(f);assert.throws(()=>decode(f));});
test('refuses duplicate identity keys in original envelope',()=>{
 const f=fixture(),raw=f.raw(f.measured).replace('"pid":100','"pid":1,"pid":100');assert.throws(()=>decode(f,raw));
});
test('refuses nested root identity duplicates',()=>{
 const f=fixture(),raw=f.raw(f.measured).replace('"clientId":1','"clientId":9,"clientId":1');assert.throws(()=>decode(f,raw));
});
test('refuses noncanonical original whitespace and numeric spellings',()=>{
 const f=fixture();assert.throws(()=>decode(f,f.raw(f.measured).replace('"version":1','"version":1.0')));
 assert.throws(()=>decode(f,f.raw(f.measured).replace('{','{ ')));
});
test('retains honest scope-less native refusal as failure, never a measured sample',()=>{
 const f=fixture();f.measured={producer:'aux-native-stock-warm-presentation',version:1,status:'refused',reason:'no_native_input',
   measured:false,earliestPresentationProven:false,inputLineageProven:false};assert.throws(()=>decode(f),/no_native_input/);
});
test('refuses wrong actual mailbox sequence',()=>{
 const f=fixture();assert.throws(()=>decode(f,f.raw(f.measured).replace('"sequence":"2"','"sequence":"1"')));
});
