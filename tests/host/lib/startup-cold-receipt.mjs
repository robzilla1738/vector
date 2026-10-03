import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
export const startupColdPrefix = 'AUX_STARTUP_COLD_V1 ';
const fields = ['producer', 'version', 'kind', 'trial', 'launcherPid', 'browserPid',
  'browserBinarySha256', 'browserImageUuid', 'browserDevice', 'browserInode',
  'browserStartMachTicks', 'inventoryStartedMachTicks', 'inventoryFinishedMachTicks',
  'launchMachTicks', 'spawnReturnedMachTicks', 'childObservedMachTicks'].sort();
const ticks = value => {
  assert.ok(typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value));
  const number = BigInt(value); assert.ok(number <= 18446744073709551615n); return number;
};
/** Original helper stdout, joined to the admitted executable and original launch.
 * Parsing synthetic records is not evidence of kernel inventory or performance. */
export function parseStartupColdReceipt(raw, launch, browser) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 2048 &&
    raw.startsWith(startupColdPrefix) && raw.endsWith('\n') && !raw.slice(0, -1).includes('\n'));
  const bytes = raw.slice(startupColdPrefix.length, -1), record = JSON.parse(bytes);
  assert.deepEqual(Object.keys(record ?? {}).sort(), fields);
  assert.equal(JSON.stringify(Object.fromEntries(fields.map(key => [key, record[key]]))), bytes);
  assert.equal(record.producer, 'aux-native-startup-cold'); assert.equal(record.version, 1);
  for (const key of ['kind', 'trial', 'launcherPid', 'browserPid', 'launchMachTicks', 'spawnReturnedMachTicks'])
    assert.equal(record[key], launch[key], `Original cold launch ${key} mismatch`);
  for (const [key, expected] of Object.entries({ browserBinarySha256: browser.sha256,
    browserImageUuid: browser.imageUuid, browserDevice: browser.device, browserInode: browser.inode }))
    assert.equal(record[key], expected, `Original cold executable ${key} mismatch`);
  assert.match(record.browserBinarySha256, /^[a-f0-9]{64}$/); assert.notEqual(record.browserBinarySha256, '0'.repeat(64));
  assert.match(record.browserImageUuid, /^[a-f0-9]{32}$/); assert.notEqual(record.browserImageUuid, '0'.repeat(32));
  ticks(record.browserDevice); ticks(record.browserInode);
  const start = ticks(record.inventoryStartedMachTicks), end = ticks(record.inventoryFinishedMachTicks);
  const launched = ticks(record.launchMachTicks), returned = ticks(record.spawnReturnedMachTicks);
  const child = ticks(record.browserStartMachTicks), observed = ticks(record.childObservedMachTicks);
  assert.ok(start <= end && end <= launched && launched <= child && child <= returned && returned <= observed,
    'Original kernel inventory, spawn and child-generation order mismatch');
  return Object.freeze({ record: Object.freeze(record), raw,
    rawSha256: createHash('sha256').update(raw).digest('hex') });
}

export const startupRefusalPrefix = 'AUX_STARTUP_REFUSAL_V1 ';
/** A paired fixed helper can prove its original spawn path was never entered.
 * This permits cleanup of a refused trial; it never becomes a cold sample. */
export function parseStartupPrelaunchRefusal(raw, expected) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 2048 &&
    raw.startsWith(startupRefusalPrefix) && raw.endsWith('\n') && !raw.slice(0, -1).includes('\n'));
  const bytes = raw.slice(startupRefusalPrefix.length, -1), record = JSON.parse(bytes);
  const names = ['producer', 'version', 'kind', 'trial', 'launcherPid',
    'helperBinarySha256', 'helperSourceSha256', 'browserSpawnAttempted'].sort();
  assert.deepEqual(Object.keys(record ?? {}).sort(), names);
  assert.equal(JSON.stringify(Object.fromEntries(names.map(key => [key, record[key]]))), bytes);
  assert.equal(record.producer, 'aux-native-startup-prelaunch-refusal');
  assert.equal(record.version, 1); assert.equal(record.browserSpawnAttempted, false);
  for (const key of ['kind', 'trial', 'launcherPid', 'helperBinarySha256', 'helperSourceSha256'])
    assert.equal(record[key], expected[key]);
  return Object.freeze({ record: Object.freeze(record), raw,
    rawSha256: createHash('sha256').update(raw).digest('hex') });
}
