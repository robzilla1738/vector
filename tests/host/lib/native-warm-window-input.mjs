import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const fields = ['producer','version','targetPid','helperPid','originalWindowNumber',
  'targetProcessUuid','targetProcessStartMachTicks','helperProcessUuid','helperProcessStartMachTicks',
  'cgTimestampNs','postBeforeNs','postReturnedNs','releaseNs','keyCode','flags',
  'sourcePid','sourceState','autorepeat','transport'];
const token = value => typeof value === 'string' && /^[a-f0-9]{32}$/.test(value) && !/^0+$/.test(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) && !/^0+$/.test(value);
const pid = value => Number.isInteger(value) && value > 0 && value <= 0x7fffffff;
const decimal = value => {
  assert.ok(typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value));
  const n = BigInt(value); assert.ok(n <= 9223372036854775807n); return n;
};
/** Pair a decoded genuine fixed helper receipt with the independently decoded
 * native warm record. This function cannot prove compiled helper provenance,
 * launch classification, power, native first-HW or a trial cohort. It must be
 * called only after those original producer records are admitted by their own
 * strict decoders for the selected fixed producer kind. It never rewrites the native inputLineageProven field. */
export function pairWarmWindowInput(input, native, ready, { kind, inputHelper, coldKernel }) {
  assert.ok(kind === 'aux' || kind === 'stock', 'Closed producer kind required');
  const aux = kind === 'aux';
  assert.deepEqual(Object.keys(input ?? {}).sort(), [...fields].sort());
  assert.equal(input.producer, 'aux-native-warm-window-input'); assert.equal(input.version, 1);
  assert.equal(input.transport, 'cghidEventTap'); assert.equal(input.autorepeat, false);
  assert.ok(pid(input.targetPid) && pid(input.helperPid) && input.targetPid !== input.helperPid);
  assert.ok(token(input.targetProcessUuid) && token(input.helperProcessUuid));
  assert.ok(inputHelper && hash(inputHelper.binarySha256) && hash(inputHelper.sourceSha256));
  assert.equal(input.helperPid, inputHelper.pid); assert.equal(input.helperProcessUuid, inputHelper.imageUuid);
  assert.equal(input.helperProcessStartMachTicks, inputHelper.processStartMachTicks);
  decimal(input.helperProcessStartMachTicks);
  assert.ok(coldKernel && token(coldKernel.browserImageUuid));
  assert.equal(input.targetPid, coldKernel.browserPid);
  assert.equal(input.targetProcessUuid, coldKernel.browserImageUuid);
  assert.equal(input.targetProcessStartMachTicks, coldKernel.browserStartMachTicks);
  decimal(input.targetProcessStartMachTicks);
  assert.equal(native.producer, aux ? 'aux-native-warm-window' : 'aux-native-stock-warm-presentation'); assert.equal(native.version, 1);
  assert.equal(native.status, 'measured'); assert.equal(native.measured, true);
  assert.equal(native.earliestPresentationProven, true); assert.equal(native.inputLineageProven, false);
  assert.equal(native[aux ? 'browserProcessUuid' : 'originalBrowserProcessUuid'], input.targetProcessUuid);
  assert.equal(native[aux ? 'browserProcessStart' : 'originalBrowserProcessStart'], input.targetProcessStartMachTicks);
  assert.equal(native.browserPid, input.targetPid);
  assert.equal(ready.producer, aux ? 'aux-native-warm-window' : 'aux-native-stock-warm-ready'); assert.equal(ready.version, 1);
  assert.equal(ready.status, 'ready'); assert.equal(ready[aux ? 'requestNonce' : 'nonce'], native[aux ? 'requestNonce' : 'measurementNonce']);
  assert.equal(ready.browserPid, input.targetPid);
  assert.equal(ready.browserProcessUuid, input.targetProcessUuid);
  assert.equal(ready.browserProcessStart, input.targetProcessStartMachTicks);
  assert.equal(ready[aux ? 'windowId' : 'originalBrowserWindowId'], native[aux ? 'preparedWindowId' : 'originalBrowserWindowId']);
  assert.equal(ready.preparedUs, native.preparedUs);
  assert.equal(native.inputWindowNumber, input.originalWindowNumber);
  assert.ok(pid(input.originalWindowNumber));
  assert.equal(input.keyCode, 45); assert.equal(native.inputKeyCode, input.keyCode);
  // CGEventFlags.maskCommand and private source state are fixed by the actual
  // helper endpoint, never supplied by a caller's requested chord.
  assert.equal(input.flags, '1048576'); assert.equal(input.sourceState, '-1');
  assert.equal(native.inputCgFlags, input.flags); assert.equal(native.inputModifierFlags, input.flags);
  assert.equal(input.sourcePid, String(input.helperPid));
  assert.equal(native.inputSourcePid, input.sourcePid); assert.equal(native.inputSourceState, input.sourceState);
  assert.equal(native.originalCgTimestampNs, input.cgTimestampNs);
  assert.equal(input.cgTimestampNs, input.postBeforeNs);
  const posted = decimal(input.postBeforeNs), returned = decimal(input.postReturnedNs), released = decimal(input.releaseNs);
  assert.ok(posted <= returned && returned <= released);
  const prepared = decimal(ready.preparedUs), nativeInput = decimal(native[aux ? 'originalInputUs' : 'nativeInputUs']);
  assert.ok(prepared <= nativeInput);
  // Keep the independently produced original CG timestamp and actual AppKit
  // TimeTicks conversion; never invent a wallclock or subtract Node delay.
  const cgUs = posted / 1000n;
  const conversionDifference = cgUs >= nativeInput ? cgUs - nativeInput : nativeInput - cgUs;
  assert.ok(conversionDifference <= 1n, 'Original CG/AppKit timebases disagree');
  const originalInputBytes = JSON.stringify(input);
  return Object.freeze({ originalInput: Object.freeze({ ...input }), inputBytesSha256: createHash('sha256').update(originalInputBytes).digest('hex'),
    nativeCgTimestampNs: native.originalCgTimestampNs, nativeInputUs: native[aux ? 'originalInputUs' : 'nativeInputUs'],
    conversionDifferenceUs: conversionDifference.toString(), helperPairMatched: true,
    compiledHelperProven: false, classificationProven: false, acPowerProven: false,
    cohortProven: false, relativeComparisonProven: false });
}
