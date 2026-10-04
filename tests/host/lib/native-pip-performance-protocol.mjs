import assert from 'node:assert/strict';
import { decodeOriginalGuestRecord } from './guest-original-record.mjs';
const identity = ['metric', 'startKind', 'rootHardwareCoverage', 'videoGuestCoverage', 'earliestPresentationProven', 'firstFrameProven', 'requestNonce', 'sourcePageId', 'windowId', 'widgetRoutingId', 'rendererPid', 'shellSink', 'displaySink', 'armedUs', 'deadlineUs'];
const target = ['targetWidgetReceipt', 'surfaceKind', 'createdUs', 'registeredUs', 'displayGeneration'];
const keys = (value, expected) => assert.deepEqual(Object.keys(value ?? {}).sort(), [...expected].sort());
const integer = value => Number.isInteger(value) && value > 0 && value <= 0xffffffff;
const decimal = value => typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value) && BigInt(value) <= 18446744073709551615n;
const token = value => typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value);
const sink = value => { keys(value, ['clientId', 'sinkId']); assert.ok(integer(value.clientId) && integer(value.sinkId)); };
function decode(raw, producer = 'aux-native-pip-root-presentation') {
  const value = decodeOriginalGuestRecord(raw);
  assert.equal(value.producer, producer); assert.equal(value.version, 1);
  assert.ok(typeof value.reason === 'string' && value.reason.length > 0 && value.reason.length <= 128);
  if (value.status === 'refused') { assert.equal(value.measured, false); throw new Error(`Original native refusal: ${value.reason}`); }
  assert.equal(value.metric, 'pip-window'); assert.equal(value.startKind, 'native-arm-upperbound');
  assert.equal(value.rootHardwareCoverage, true); assert.equal(value.videoGuestCoverage, false);
  assert.equal(value.earliestPresentationProven, false); assert.equal(value.firstFrameProven, false);
  for (const key of ['windowId', 'widgetRoutingId', 'rendererPid']) assert.ok(integer(value[key]), `Invalid original ${key}`);
  for (const key of ['armedUs', 'deadlineUs']) assert.ok(decimal(value[key]), `Missing native ${key}`);
  assert.equal(BigInt(value.deadlineUs) - BigInt(value.armedUs), 5_000_000n, 'Original deadline changed');
  assert.ok(token(value.requestNonce)); assert.match(value.sourcePageId, /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i);
  sink(value.shellSink); sink(value.displaySink); return value;
}
export function validatePipPresentationReady(raw) {
  const value = decode(raw); assert.equal(value.status, 'ready'); assert.equal(value.reason, 'original_native_arm'); assert.equal(value.measured, false);
  keys(value, ['producer', 'version', 'status', 'reason', 'measured', ...identity]); return value;
}
export function validatePipPresentationPair(readyRaw, measuredRaw) {
  const ready = validatePipPresentationReady(readyRaw), measured = decode(measuredRaw);
  for (const key of identity) assert.deepEqual(measured[key], ready[key], `Original ${key} changed`);
  assert.equal(measured.status, 'measured'); assert.equal(measured.reason, 'created_native_pip_root_hardware_upperbound'); assert.equal(measured.measured, true);
  assert.ok(token(measured.targetWidgetReceipt)); assert.ok(['video-pip', 'document-pip'].includes(measured.surfaceKind));
  assert.ok(decimal(measured.displayGeneration));
  const times = ['armedUs', 'createdUs', 'registeredUs', 'readyUs', 'commitUs', 'submittedUs', 'drawUs', 'swapStartUs', 'swapEndUs', 'presentedUs', 'observedUs'];
  for (const key of [...times, 'elapsedUs']) assert.ok(decimal(measured[key]), `Missing native ${key}`);
  for (let i = 1; i < times.length; i++) assert.ok(BigInt(measured[times[i]]) >= BigInt(measured[times[i - 1]]), 'Reversed original native causal chain');
  assert.ok(BigInt(measured.observedUs) < BigInt(ready.deadlineUs), 'Original 5s deadline expired');
  assert.equal(BigInt(measured.elapsedUs), BigInt(measured.presentedUs) - BigInt(ready.armedUs), 'Whole native upperbound rewritten');
  assert.ok(integer(measured.frameToken));
  keys(measured.rootSurface, ['frameSink', 'parentSequenceNumber', 'childSequenceNumber', 'embedToken']); sink(measured.rootSurface.frameSink);
  assert.ok(integer(measured.rootSurface.parentSequenceNumber) && integer(measured.rootSurface.childSequenceNumber) && token(measured.rootSurface.embedToken));
  assert.notDeepEqual(measured.rootSurface.frameSink, ready.displaySink, 'PiP borrowed the original browser display sink');
  assert.ok(Array.isArray(measured.output) && measured.output.length === 4 && measured.output[0] === 0 && measured.output[1] === 0 && integer(measured.output[2]) && integer(measured.output[3]));
  assert.ok(Number.isInteger(measured.feedbackFlags) && measured.feedbackFlags >= 0 && measured.feedbackFlags <= 0xffffffff && (measured.feedbackFlags & 4) !== 0 && (measured.feedbackFlags & 16) === 0, 'Actual hardware completion absent');
  assert.equal(typeof measured.alphaReadbackAttempted, 'boolean');
  keys(measured, ['producer', 'version', 'status', 'reason', 'measured', ...identity, ...target, ...times.slice(3), 'elapsedUs', 'rootSurface', 'frameToken', 'output', 'feedbackFlags', 'alphaReadbackAttempted']);
  return { ready, measured, elapsedMs: Number(BigInt(measured.elapsedUs)) / 1000 };
}
export function validatePipPresentationRetirement(readyRaw, measuredRaw, retiredRaw) {
  const pair = validatePipPresentationPair(readyRaw, measuredRaw), retired = decode(retiredRaw, 'aux-native-pip-root-retirement');
  for (const key of [...identity, ...target]) assert.deepEqual(retired[key], pair.measured[key], `Original retirement ${key} changed`);
  assert.equal(retired.status, 'retired'); assert.equal(retired.reason, 'original_native_widget_destroyed'); assert.equal(retired.measured, false); assert.equal(retired.nativeWidgetDestroyed, true);
  assert.ok(decimal(retired.destroyedUs)); assert.ok(BigInt(retired.destroyedUs) >= BigInt(pair.measured.presentedUs)); assert.ok(BigInt(retired.destroyedUs) < BigInt(pair.ready.deadlineUs), 'Retirement extended the original deadline');
  keys(retired, ['producer', 'version', 'status', 'reason', 'measured', ...identity, ...target, 'nativeWidgetDestroyed', 'destroyedUs']);
  return { ...pair, retired };
}
