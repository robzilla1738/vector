import test from 'node:test';
import assert from 'node:assert/strict';
import { pairWarmWindowInput } from './native-warm-window-input.mjs';
// Synthetic protocol controls ONLY: no native execution or qualification.
const h = 'a'.repeat(64), uuid = 'b'.repeat(32), helperUuid = 'c'.repeat(32), nonce = 'd'.repeat(32);
function fixture(kind = 'stock') {
  const input = { producer:'aux-native-warm-window-input',version:1,targetPid:100,helperPid:101,originalWindowNumber:200,
    targetProcessUuid:uuid,targetProcessStartMachTicks:'1000',helperProcessUuid:helperUuid,helperProcessStartMachTicks:'2000',
    cgTimestampNs:'9000000000',postBeforeNs:'9000000000',postReturnedNs:'9000000010',releaseNs:'9020000000',keyCode:45,
    flags:'1048576',sourcePid:'101',sourceState:'-1',autorepeat:false,transport:'cghidEventTap' };
  const native = { producer:'aux-native-stock-warm-presentation',version:1,status:'measured',measured:true,earliestPresentationProven:true,
    inputLineageProven:false,originalBrowserProcessUuid:uuid,originalBrowserProcessStart:'1000',originalBrowserWindowId:300,
    browserPid:100,measurementNonce:nonce,preparedUs:'8999000',nativeInputUs:'9000000',inputWindowNumber:200,inputKeyCode:45,
    inputSourcePid:'101',inputSourceState:'-1',inputCgFlags:'1048576',inputModifierFlags:'1048576',originalCgTimestampNs:'9000000000' };
  const ready = { producer:'aux-native-stock-warm-ready',version:1,status:'ready',nonce,browserPid:100,browserProcessUuid:uuid,
    browserProcessStart:'1000',originalBrowserWindowId:300,preparedUs:'8999000' };
  const pins = { inputHelper:{pid:101,imageUuid:helperUuid,processStartMachTicks:'2000',binarySha256:h,sourceSha256:h},
    kind:'stock',coldKernel:{browserPid:100,browserImageUuid:uuid,browserStartMachTicks:'1000'} };
  pins.kind = kind;
  if (kind === 'aux') {
    native.producer = 'aux-native-warm-window';
    native.browserProcessUuid = native.originalBrowserProcessUuid; delete native.originalBrowserProcessUuid;
    native.browserProcessStart = native.originalBrowserProcessStart; delete native.originalBrowserProcessStart;
    native.preparedWindowId = native.originalBrowserWindowId; delete native.originalBrowserWindowId;
    native.requestNonce = native.measurementNonce; delete native.measurementNonce;
    native.originalInputUs = native.nativeInputUs; delete native.nativeInputUs;
    ready.producer = 'aux-native-warm-window'; ready.requestNonce = ready.nonce; delete ready.nonce;
    ready.windowId = ready.originalBrowserWindowId; delete ready.originalBrowserWindowId;
  }
  return {input,native,ready,pins};
}
test('matches original input scopes without manufacturing qualification flags', () => {
  const f=fixture(), result=pairWarmWindowInput(f.input,f.native,f.ready,f.pins);
  assert.equal(result.helperPairMatched,true); assert.equal(result.compiledHelperProven,false);
  assert.equal(result.cohortProven,false); assert.equal(f.native.inputLineageProven,false);
});
for (const [name, mutate] of [
  ['foreign helper',f=>{f.input.helperPid=102;}],['reused process PID generation',f=>{f.input.targetProcessStartMachTicks='1001';}],
  ['different window',f=>{f.native.inputWindowNumber=201;}],['foreign input stamp',f=>{f.native.originalCgTimestampNs='9000000001';}],
  ['stale Ready',f=>{f.ready.nonce='e'.repeat(32);}],['preparation after input',f=>{f.ready.preparedUs=f.native.preparedUs='9000001';}],
  ['autorepeat',f=>{f.input.autorepeat=true;}],['different key',f=>{f.input.keyCode=46;}],['different native modifiers',f=>{f.native.inputModifierFlags='1179648';}],
  ['different native CG flags',f=>{f.native.inputCgFlags='0';}],
  ['extra clock selector',f=>{f.input.requestedTimestamp='9000000000';}],['reversed posting',f=>{f.input.postReturnedNs='8999999999';}],
  ['different CG/AppKit clock',f=>{f.native.nativeInputUs='8999998';}],['borrowed launch helper',f=>{f.pins.inputHelper.pid=1;}],
]) test(`refuses ${name}`,()=>{const f=fixture();mutate(f);assert.throws(()=>pairWarmWindowInput(f.input,f.native,f.ready,f.pins));});

for (const kind of ['aux', 'stock']) test(`pairs the closed ${kind} producer and refuses foreign identity/input`, () => {
  const f = fixture(kind); assert.equal(pairWarmWindowInput(f.input, f.native, f.ready, f.pins).helperPairMatched, true);
  f.native.originalCgTimestampNs = '1'; assert.throws(() => pairWarmWindowInput(f.input, f.native, f.ready, f.pins));
  const foreign = fixture(kind); foreign.pins.kind = kind === 'aux' ? 'stock' : 'aux';
  assert.throws(() => pairWarmWindowInput(foreign.input, foreign.native, foreign.ready, foreign.pins));
});
test('unknown kind cannot borrow a valid closed producer', () => {
  const f = fixture(); f.pins.kind = 'private'; assert.throws(() => pairWarmWindowInput(f.input, f.native, f.ready, f.pins));
});
