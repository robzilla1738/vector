import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const stockStartupPrefix = 'AUX_NATIVE_STOCK_STARTUP_V1 ';
const ticks = ['launchedUs', 'registeredUs', 'typeableObservedUs', 'commitUs', 'submittedUs',
  'drawUs', 'swapStartUs', 'swapEndUs', 'presentedUs', 'observedUs'];
const identity = ['trial', 'launchReceiptNonce', 'launchReceiptSha256', 'launcherPid', 'browserPid',
  'helperBinarySha256', 'helperSourceSha256', 'helperProcessUuid', 'helperProcessStart',
  'launchMachTicks', 'spawnReturnedMachTicks', 'spawnReturnedUs', 'deadlineUs',
  'browserWindowId', 'displayGeneration', 'documentReceipt', 'measurementNonce', 'sampleSequence'];
const fields = ['producer', 'version', 'status', 'reason', 'measured', 'earliestPresentationProven',
  ...identity, ...ticks, 'rootSurface', 'rootFrameToken', 'rootBounds', 'feedbackFlags', 'elapsedUs', 'alphaReadbackAttempted'];
const keys = (value, expected) => assert.deepEqual(Object.keys(value ?? {}).sort(), [...expected].sort());
const uint = value => Number.isInteger(value) && value > 0 && value <= 0xffffffff;
const token = value => typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value) && !/^0+$/.test(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) && !/^0+$/.test(value);
function decimal(value) {
  assert.ok(typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value));
  const result = BigInt(value); assert.ok(result <= 9223372036854775807n); return result;
}
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Decode original direct-child Stock stderr paired with its admitted original
 * helper launch. This does not establish cold classification, compiled source,
 * AC power or a trial cohort; those require their independent genuine receipts.
 * Aux's shell/Worker hello endpoint cannot substitute for this Views endpoint. */
export function validateStockStartupPresentation(raw, launch, { helperImageUuid }) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 16384 &&
    raw.startsWith(stockStartupPrefix) && raw.endsWith('\n') && !raw.slice(0, -1).includes('\n'));
  assert.ok(launch?.record && hash(launch.receiptSha256));
  assert.equal(launch.record.kind, 'stock', 'Stock requires its original Stock launch');
  assert.ok(token(helperImageUuid), 'Missing pinned actual helper image UUID');
  const record = JSON.parse(raw.slice(stockStartupPrefix.length, -1));
  assert.equal(raw, `${stockStartupPrefix}${JSON.stringify(record)}\n`,
    'Noncanonical original native Stock bytes');
  assert.equal(record.producer, 'aux-native-stock-startup-presentation'); assert.equal(record.version, 1);
  if (record.status === 'refused') {
    assert.equal(record.measured, false); assert.equal(record.earliestPresentationProven, false);
    assert.ok(typeof record.reason === 'string' && /^[a-z_]{1,128}$/.test(record.reason));
    throw new Error(`Original native Stock startup refusal: ${record.reason}`);
  }
  keys(record, fields);
  assert.equal(typeof record.alphaReadbackAttempted, 'boolean', 'Unknown original Stock GPU instrumentation');
  assert.equal(record.status, 'measured'); assert.equal(record.reason, 'first_full_interactive_stock_native_root_hardware');
  assert.equal(record.measured, true); assert.equal(record.earliestPresentationProven, true);
  for (const key of ['trial', 'launcherPid', 'browserPid', 'helperBinarySha256', 'helperSourceSha256',
    'launchMachTicks', 'spawnReturnedMachTicks']) assert.equal(record[key], launch.record[key], `Original launch ${key} changed`);
  assert.ok(uint(record.launcherPid) && uint(record.browserPid) && record.launcherPid !== record.browserPid);
  assert.ok(token(record.trial));
  assert.equal(record.launchReceiptNonce, launch.record.nonce);
  assert.ok(typeof record.launchReceiptNonce === 'string' &&
    /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(record.launchReceiptNonce) &&
    record.launchReceiptNonce !== '00000000-0000-0000-0000-000000000000');
  assert.equal(record.launchReceiptSha256, launch.receiptSha256);
  assert.ok(hash(record.helperBinarySha256) && hash(record.helperSourceSha256));
  assert.ok(token(record.helperProcessUuid));
  assert.equal(record.helperProcessUuid.toLowerCase(), helperImageUuid.toLowerCase());
  for (const key of ['helperProcessStart', 'displayGeneration', 'sampleSequence', 'elapsedUs', ...ticks]) decimal(record[key]);
  assert.equal(record.sampleSequence, '1'); assert.ok(token(record.measurementNonce) && token(record.documentReceipt));
  assert.ok(uint(record.browserWindowId) && uint(record.rootFrameToken));
  keys(record.rootSurface, ['frameSink', 'parentSequenceNumber', 'childSequenceNumber', 'embedToken']);
  keys(record.rootSurface.frameSink, ['clientId', 'sinkId']);
  assert.ok(uint(record.rootSurface.frameSink.clientId) && uint(record.rootSurface.frameSink.sinkId));
  assert.ok(uint(record.rootSurface.parentSequenceNumber) && uint(record.rootSurface.childSequenceNumber));
  assert.ok(token(record.rootSurface.embedToken), 'Missing complete native root embed token');
  assert.ok(Array.isArray(record.rootBounds) && record.rootBounds.length === 4);
  assert.equal(record.rootBounds[0], 0); assert.equal(record.rootBounds[1], 0);
  assert.ok(record.rootBounds.slice(2).every(value => uint(value) && value <= 32768));
  for (let index = 1; index < ticks.length; index++)
    assert.ok(decimal(record[ticks[index - 1]]) <= decimal(record[ticks[index]]), 'Reversed original Stock causal chain');
  assert.ok(decimal(record.launchMachTicks) <= decimal(record.spawnReturnedMachTicks));
  assert.ok(decimal(record.launchedUs) <= decimal(record.spawnReturnedUs));
  assert.ok(decimal(record.spawnReturnedUs) <= decimal(record.registeredUs),
    'Stock registration preceded original spawn return');
  assert.equal(decimal(record.deadlineUs) - decimal(record.launchedUs), 5000000n);
  assert.ok(decimal(record.observedUs) <= decimal(record.deadlineUs), 'Expired original Stock startup deadline');
  assert.equal(decimal(record.elapsedUs), decimal(record.presentedUs) - decimal(record.launchedUs));
  assert.ok(Number.isInteger(record.feedbackFlags) && record.feedbackFlags >= 0 && record.feedbackFlags <= 0xffffffff &&
    (record.feedbackFlags & 4) !== 0 && (record.feedbackFlags & 16) === 0, 'Missing original hardware completion');
  return Object.freeze({ record: freeze(record), raw, rawSha256: createHash('sha256').update(raw).digest('hex'),
    elapsedUs: record.elapsedUs, diagnosticElapsedMs: Number(BigInt(record.elapsedUs)) / 1000,
    endpoint: 'original Stock OS launch → first eligible full interactive native Views root hardware',
    classificationProven: false,
    instrumentation: Object.freeze({ alphaReadbackAttempted: record.alphaReadbackAttempted }),
    // Stock-only synchronous readback must not inflate the +10% denominator.
    // This decoder cannot establish matched Aux/Stock observer overhead.
    relativeComparisonProven: false });
}
