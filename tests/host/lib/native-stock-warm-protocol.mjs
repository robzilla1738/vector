import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const prefix = 'AUX_NATIVE_FIXTURE_REPLY_V1 ';
const token = v => typeof v === 'string' && /^[a-f0-9]{32}$/i.test(v) && !/^0+$/.test(v);
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v) && !/^0+$/.test(v);
const uint = v => Number.isInteger(v) && v > 0 && v <= 0xffffffff;
const exact = (v, keys) => assert.deepEqual(Object.keys(v ?? {}).sort(), [...keys].sort());
const decimal = v => { assert.ok(typeof v === 'string' && /^[1-9][0-9]{0,19}$/.test(v));const n=BigInt(v);assert.ok(n<=9223372036854775807n);return n; };
function immutable(v) { if(v&&typeof v==='object'){for(const child of Object.values(v))immutable(child);Object.freeze(v);}return v; }
function envelope(raw, operation, launch, expectedSequence) {
  assert.ok(typeof raw==='string'&&Buffer.byteLength(raw)<=16384&&raw.startsWith(prefix)&&raw.endsWith('\n')&&!raw.slice(0,-1).includes('\n'));
  const v=JSON.parse(raw.slice(prefix.length,-1));assert.equal(raw,`${prefix}${JSON.stringify(v)}\n`,'Noncanonical or duplicate native fields');
  exact(v,['producer','version','pid','windowId','sequence','operation','record']);
  assert.equal(v.producer,'aux-native-fixture-reply');assert.equal(v.version,1);assert.equal(v.operation,operation);
  assert.ok(launch?.record&&hash(launch.receiptSha256));assert.equal(launch.record.kind,'stock');
  assert.equal(v.pid,launch.record.browserPid);assert.ok(uint(v.pid)&&uint(v.windowId));
  decimal(v.sequence);decimal(expectedSequence);assert.equal(v.sequence,expectedSequence);
  return v;
}
function refusal(v) {
  if(v.status==='refused'){
    assert.equal(v.measured,false);assert.equal(v.earliestPresentationProven,false);assert.equal(v.inputLineageProven,false);
    assert.ok(typeof v.reason==='string'&&/^[a-z_]{1,128}$/.test(v.reason));throw new Error(`Original warm refusal: ${v.reason}`);
  }
}
const readyKeys=['producer','version','status','nonce','preparedUs','browserPid','browserProcessUuid','browserProcessStart',
  'originalBrowserWindowId','trial','launchReceiptNonce','launchReceiptSha256','helperBinarySha256','helperSourceSha256'];
/** Original raw native bytes only. This validates pairing, never compiled/native
 * execution, launch classification, AC power or a counted trial cohort. */
export function decodeStockWarmReady(raw, launch, coldPresentation, coldKernel, expectedSequence) {
  const outer=envelope(raw,'prepareStockWarmWindow',launch,expectedSequence),v=outer.record;refusal(v);exact(v,readyKeys);
  assert.equal(v.producer,'aux-native-stock-warm-ready');assert.equal(v.version,1);assert.equal(v.status,'ready');
  assert.ok(token(v.nonce));decimal(v.preparedUs);decimal(v.browserProcessStart);assert.ok(token(v.browserProcessUuid));
  assert.equal(v.browserPid,launch.record.browserPid);assert.equal(v.trial,launch.record.trial);
  assert.equal(v.launchReceiptNonce,launch.record.nonce);assert.equal(v.launchReceiptSha256,launch.receiptSha256);
  assert.equal(v.helperBinarySha256,launch.record.helperBinarySha256);assert.equal(v.helperSourceSha256,launch.record.helperSourceSha256);
  assert.ok(hash(v.helperBinarySha256)&&hash(v.helperSourceSha256));
  const cold=coldPresentation?.record;assert.equal(cold?.producer,'aux-native-stock-startup-presentation');
  assert.equal(cold.status,'measured');assert.equal(cold.measured,true);assert.equal(cold.earliestPresentationProven,true);
  assert.equal(cold.browserPid,v.browserPid);assert.equal(cold.launchReceiptSha256,v.launchReceiptSha256);assert.equal(cold.trial,v.trial);
  assert.equal(v.originalBrowserWindowId,cold.browserWindowId);assert.equal(outer.windowId,v.originalBrowserWindowId);
  assert.equal(coldKernel?.browserPid,v.browserPid);assert.equal(coldKernel.browserImageUuid,v.browserProcessUuid);
  assert.equal(coldKernel.browserStartMachTicks,v.browserProcessStart);
  assert.ok(decimal(cold.observedUs)<=decimal(v.preparedUs));
  return Object.freeze({record:immutable(v),outer:immutable(outer),raw,rawSha256:createHash('sha256').update(raw).digest('hex'),classificationProven:false});
}
const ticks=['preparedUs','nativeInputUs','registeredUs','typeableObservedUs','commitUs','submittedUs','drawUs','swapStartUs','swapEndUs','presentedUs','observedUs'];
const fields=['producer','version','status','reason','measured','earliestPresentationProven','inputLineageProven',
  'originalBrowserProcessUuid','originalBrowserProcessStart','originalBrowserWindowId','trial','launchReceiptNonce','launchReceiptSha256',
  'launcherPid','browserPid','helperBinarySha256','helperSourceSha256','helperProcessUuid','helperProcessStart','launchMachTicks',
  'spawnReturnedMachTicks','originalLaunchedUs','originalEventSeconds','originalCgTimestampNs','inputWindowNumber','inputSourcePid',
  'inputSourceState','inputKeyCode','inputCgFlags','inputModifierFlags','spawnReturnedUs','deadlineUs','browserWindowId','displayGeneration',
  'documentReceipt','measurementNonce','sampleSequence','rootSurface','rootFrameToken','rootBounds','feedbackFlags','alphaReadbackAttempted','elapsedUs',...ticks];
export function decodeStockWarmPresentation(raw, launch, readyReceipt, {expectedSequence, launcherImageUuid}) {
  const outer=envelope(raw,'completeStockWarmWindow',launch,expectedSequence),v=outer.record;refusal(v);exact(v,fields);
  const ready=readyReceipt?.record;assert.equal(ready?.producer,'aux-native-stock-warm-ready');assert.equal(ready.status,'ready');
  assert.ok(decimal(expectedSequence)>decimal(readyReceipt.outer.sequence));
  assert.equal(v.producer,'aux-native-stock-warm-presentation');assert.equal(v.version,1);assert.equal(v.status,'measured');
  assert.equal(v.reason,'first_full_interactive_stock_added_window_root_hardware');assert.equal(v.measured,true);
  assert.equal(v.earliestPresentationProven,true);assert.equal(v.inputLineageProven,false);
  for(const k of ['trial','launchReceiptNonce','launchReceiptSha256','helperBinarySha256','helperSourceSha256','preparedUs','originalBrowserWindowId'])assert.equal(v[k],ready[k]);
  assert.equal(v.measurementNonce,ready.nonce);assert.equal(v.browserPid,ready.browserPid);
  assert.equal(v.originalBrowserProcessUuid,ready.browserProcessUuid);assert.equal(v.originalBrowserProcessStart,ready.browserProcessStart);
  assert.equal(outer.windowId,ready.originalBrowserWindowId);assert.ok(uint(v.browserWindowId)&&v.browserWindowId!==ready.originalBrowserWindowId);
  assert.equal(v.launcherPid,launch.record.launcherPid);assert.equal(v.launchMachTicks,launch.record.launchMachTicks);
  assert.equal(v.spawnReturnedMachTicks,launch.record.spawnReturnedMachTicks);
  assert.ok(token(launcherImageUuid));assert.equal(v.helperProcessUuid.toLowerCase(),launcherImageUuid.toLowerCase());decimal(v.helperProcessStart);
  assert.ok(token(v.documentReceipt)&&token(v.measurementNonce));assert.equal(v.sampleSequence,'1');decimal(v.displayGeneration);
  for(let i=1;i<ticks.length;i++)assert.ok(decimal(v[ticks[i-1]])<=decimal(v[ticks[i]]),'Reversed native warm causal chain');
  assert.ok(decimal(v.originalLaunchedUs)<=decimal(v.spawnReturnedUs)&&decimal(v.spawnReturnedUs)<=decimal(v.preparedUs));
  assert.equal(decimal(v.deadlineUs)-decimal(v.nativeInputUs),5000000n);assert.ok(decimal(v.observedUs)<=decimal(v.deadlineUs));
  assert.equal(decimal(v.elapsedUs),decimal(v.presentedUs)-decimal(v.nativeInputUs));
  assert.ok(uint(v.rootFrameToken));exact(v.rootSurface,['frameSink','parentSequenceNumber','childSequenceNumber','embedToken']);
  exact(v.rootSurface.frameSink,['clientId','sinkId']);assert.ok(uint(v.rootSurface.frameSink.clientId)&&uint(v.rootSurface.frameSink.sinkId));
  assert.ok(uint(v.rootSurface.parentSequenceNumber)&&uint(v.rootSurface.childSequenceNumber)&&token(v.rootSurface.embedToken));
  assert.ok(Array.isArray(v.rootBounds)&&v.rootBounds.length===4&&v.rootBounds[0]===0&&v.rootBounds[1]===0&&v.rootBounds.slice(2).every(n=>uint(n)&&n<=32768));
  assert.ok(Number.isInteger(v.feedbackFlags)&&v.feedbackFlags>=0&&v.feedbackFlags<=0xffffffff&&(v.feedbackFlags&4)!==0&&(v.feedbackFlags&16)===0);
  assert.equal(typeof v.alphaReadbackAttempted,'boolean');decimal(v.originalCgTimestampNs);decimal(v.inputSourcePid);
  assert.equal(v.inputSourceState,'-1');assert.equal(v.inputKeyCode,45);assert.equal(v.inputCgFlags,'1048576');assert.equal(v.inputModifierFlags,'1048576');assert.ok(uint(v.inputWindowNumber));
  assert.ok(typeof v.originalEventSeconds==='string'&&/^[0-9]+(?:\.[0-9]+)?$/.test(v.originalEventSeconds)&&Number.isFinite(Number(v.originalEventSeconds))&&Number(v.originalEventSeconds)>0);
  return Object.freeze({record:immutable(v),outer:immutable(outer),raw,rawSha256:createHash('sha256').update(raw).digest('hex'),elapsedUs:v.elapsedUs,
    endpoint:'original Cmd+N input → first eligible full interactive Stock added-window root HW',
    classificationProven:false,inputPairProven:false,compiledNativeProven:false,cohortProven:false,relativeComparisonProven:false});
}
