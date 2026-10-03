import assert from 'node:assert/strict';
const token = v => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v) && !/^0+$/.test(v);
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v) && !/^0+$/.test(v);
const pid = v => Number.isSafeInteger(v) && v > 0 && v <= 0x7fffffff;
/** Normalize the fixed native read-only reply against original client PID and
 * separately retained artifact metadata. This is not compiler attestation or
 * authority to invoke anything; admission of the artifacts remains separate. */
export function decodeWarmWindowHelperIdentity(record, { targetPid, helperPid, artifact }) {
  assert.deepEqual(Object.keys(record ?? {}).sort(), ['producer','version','targetPid','helperPid',
    'targetProcessUuid','targetProcessStartMachTicks','helperProcessUuid','helperProcessStartMachTicks'].sort());
  assert.equal(record.producer, 'aux-native-warm-window-identity'); assert.equal(record.version, 1);
  assert.ok(pid(targetPid) && pid(helperPid) && targetPid !== helperPid);
  assert.equal(record.targetPid, targetPid); assert.equal(record.helperPid, helperPid);
  assert.ok(token(record.targetProcessUuid) && token(record.helperProcessUuid));
  for (const key of ['targetProcessStartMachTicks','helperProcessStartMachTicks']) {
    assert.match(record[key], /^[1-9][0-9]{0,19}$/); assert.ok(BigInt(record[key]) <= 18446744073709551615n);
  }
  assert.deepEqual(Object.keys(artifact ?? {}).sort(), ['binarySha256','sourceSha256','imageUuid'].sort());
  assert.ok(hash(artifact.binarySha256) && hash(artifact.sourceSha256) && token(artifact.imageUuid));
  assert.equal(record.helperProcessUuid, artifact.imageUuid, 'Loaded helper kernel UUID differs from original compiled image');
  return Object.freeze({ pid: helperPid, imageUuid: record.helperProcessUuid,
    processStartMachTicks: record.helperProcessStartMachTicks, binarySha256: artifact.binarySha256,
    sourceSha256: artifact.sourceSha256 });
}
