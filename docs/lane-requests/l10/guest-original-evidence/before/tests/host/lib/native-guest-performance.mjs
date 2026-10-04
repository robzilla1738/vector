import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { basename } from 'node:path';
import { validateAppearanceCandidate } from './appearance-provenance.mjs';
import { validateLittlePresentationReady, validateLittlePresentationPair } from './native-little-performance-protocol.mjs';
const methods = { 'little-window': 'prepareLittleWindowPresentation', 'split-drop': 'prepareGuestSplitDropPresentation', 'divider-frame': 'prepareGuestDividerFramePresentation', 'tab-switch': 'prepareGuestTabSwitchPresentation' };
const scope = ['metric', 'requestNonce', 'sampleSequence', 'windowId', 'widgetRoutingId', 'rendererPid', 'nativeDocumentGeneration', 'shellSink', 'displaySink'];
const integer = value => Number.isInteger(value) && value > 0 && value <= 0xffffffff;
const decimal = value => typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value) && BigInt(value) <= 18446744073709551615n;
function decode(text) {
  assert.ok(typeof text === 'string' && Buffer.byteLength(text) <= 16384, 'Missing bounded original native reply');
  const value = JSON.parse(text);
  assert.equal(value.producer, 'aux-native-guest-presentation'); assert.equal(value.version, 1);
  if (value.status === 'refused') {
    assert.equal(value.measured, false); assert.ok(typeof value.reason === 'string' && value.reason.length > 0 && value.reason.length <= 128);
    throw new Error(`Original native refusal: ${value.reason}`);
  }
  assert.ok(Object.keys(methods).includes(value.metric), 'Unknown actual guest metric');
  for (const key of ['windowId', 'widgetRoutingId', 'rendererPid']) assert.ok(integer(value[key]), `Missing native ${key}`);
  for (const key of ['sampleSequence', 'nativeDocumentGeneration']) assert.ok(decimal(value[key]), `Invalid ${key}`);
  assert.match(value.requestNonce ?? '', /^[a-f0-9]{32}$/i, 'Missing actual nonce');
  for (const key of ['shellSink', 'displaySink']) {
    assert.deepEqual(Object.keys(value[key] ?? {}).sort(), ['clientId', 'sinkId']);
    assert.ok(integer(value[key].clientId) && integer(value[key].sinkId), 'Invalid actual frame sink');
  }
  return value;
}
export function validateGuestPresentationReady(readyText, metric) {
  if (metric === 'little-window') return validateLittlePresentationReady(readyText);
  const ready = decode(readyText);
  assert.equal(ready.status, 'ready'); assert.equal(ready.reason, 'ready'); assert.equal(ready.measured, false);
  assert.equal(ready.metric, metric);
  assert.deepEqual(Object.keys(ready).sort(), ['producer', 'version', 'status', 'reason', 'measured', ...scope].sort());
  return ready;
}
export function validateGuestPresentationPair(readyText, measuredText, metric) {
  if (metric === 'little-window') return validateLittlePresentationPair(readyText, measuredText);
  const ready = validateGuestPresentationReady(readyText, metric), measured = decode(measuredText);
  for (const key of scope) assert.deepEqual(measured[key], ready[key], `Native ${key} changed`);
  assert.equal(measured.status, 'measured', `Original native refusal: ${measured.reason}`);
  assert.equal(measured.measured, true); assert.equal(measured.reason, 'measured');
  const timestamps = ['nativeInputUs', 'rendererInputUs', 'mutationUs', 'commitUs', 'submittedUs', 'drawUs', 'swapStartUs', 'swapEndUs', 'presentedUs'];
  for (const key of [...timestamps, 'nativeObservedUs', 'elapsedUs']) assert.ok(decimal(measured[key]), `Missing actual ${key}`);
  assert.equal(measured.nativeInputUs, measured.rendererInputUs, 'Native/renderer clock input mismatch');
  assert.ok(BigInt(measured.nativeObservedUs) >= BigInt(measured.nativeInputUs) && BigInt(measured.nativeObservedUs) <= BigInt(measured.mutationUs), 'Observed input is outside input→mutation interval');
  for (let i = 1; i < timestamps.length; i++) assert.ok(BigInt(measured[timestamps[i]]) >= BigInt(measured[timestamps[i - 1]]), 'Reversed genuine causal chain');
  assert.equal(BigInt(measured.elapsedUs), BigInt(measured.presentedUs) - BigInt(measured.nativeInputUs), 'Elapsed differs from raw native endpoints');
  assert.equal(measured.originalInputKind, metric === 'tab-switch' ? 'keydown' : metric === 'split-drop' ? 'left-up' : 'left-drag');
  assert.ok(Number.isInteger(measured.sourcePid) && measured.sourcePid >= 0, 'Missing actual input source PID');
  assert.ok(integer(measured.shellFrameToken), 'Missing matching postmutation shell token');
  assert.ok(Number.isInteger(measured.feedbackFlags) && measured.feedbackFlags >= 0 && measured.feedbackFlags <= 0xffffffff && (measured.feedbackFlags & 4) !== 0 && (measured.feedbackFlags & 16) === 0, 'Missing hardware completion');
  assert.ok(Array.isArray(measured.drawn) && measured.drawn.length > 0 && measured.drawn.length <= 5, 'Missing actual guest inclusion');
  for (const row of measured.drawn) {
    assert.deepEqual(Object.keys(row).sort(), ['surface', 'token', 'surfaceSize', 'visibleBounds'].sort());
    assert.deepEqual(Object.keys(row.surface ?? {}).sort(), ['frameSink', 'parentSequenceNumber', 'childSequenceNumber', 'embedToken'].sort());
    assert.deepEqual(Object.keys(row.surface?.frameSink ?? {}).sort(), ['clientId', 'sinkId']);
    assert.deepEqual(Object.keys(row.surfaceSize ?? {}).sort(), ['height', 'width']);
    assert.deepEqual(Object.keys(row.visibleBounds ?? {}).sort(), ['height', 'width', 'x', 'y']);
    assert.ok(integer(row.token), 'Missing actual guest frame token');
    assert.ok(integer(row.surface?.parentSequenceNumber) && integer(row.surface?.childSequenceNumber), 'Missing actual guest surface sequence');
    assert.ok(typeof row.surface?.embedToken === 'string' && /^[a-f0-9]{32}$/i.test(row.surface.embedToken), 'Missing surface embed token');
    assert.ok(integer(row.surface?.frameSink?.clientId) && integer(row.surface?.frameSink?.sinkId), 'Missing guest frame sink');
    for (const key of ['width', 'height']) assert.ok(integer(row.surfaceSize?.[key]) && Number.isInteger(row.visibleBounds?.[key]) && row.visibleBounds[key] > 0, 'Missing transformed coverage');
    for (const key of ['x', 'y']) assert.ok(Number.isInteger(row.visibleBounds?.[key]), 'Invalid coverage bounds');
  }
  assert.deepEqual(Object.keys(measured).sort(), ['producer', 'version', 'status', 'reason', 'measured', ...scope, ...timestamps, 'nativeObservedUs', 'elapsedUs', 'originalInputKind', 'sourcePid', 'shellFrameToken', 'feedbackFlags', 'drawn'].sort());
  return { ready, measured, elapsedMs: Number(BigInt(measured.elapsedUs)) / 1000 };
}

// transport must invoke the genuine private owned-fixture channel, never runtime RPC.
export async function collectGuestPresentations({ transport, ax, candidate, readIdentity, readPower = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 }), setup, input, cleanup, metric, onReady, trials = 20 }) {
  const report = { schema: 1, endpoint: metric === 'little-window' ? 'native external Arm → exact created Little root/guest hardware upperbound' : 'actual NSEvent → matching root/guest hardware presentation', metric, candidate: structuredClone(candidate), attempts: [], samplesMs: [], status: 'running' };
  try {
    validateAppearanceCandidate(candidate);
    assert.ok(methods[metric] && Number.isInteger(trials) && trials >= 20 && trials <= 100, '20–100 actual guest trials required');
    if (metric === 'little-window') assert.equal(typeof cleanup, 'function', 'Exact created target cleanup required');
    assert.ok(typeof transport?.invoke === 'function' && typeof setup === 'function' && typeof input === 'function' && typeof readIdentity === 'function' && typeof readPower === 'function', 'Missing actual private producers');
    const verify = async () => {
      const actual = await readIdentity(); assert.deepEqual(actual.runtime, candidate.productIdentity);
      for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(actual.native?.[key], candidate.native[key]);
      const power = await readPower(); assert.match(power, /Now drawing from 'AC Power'/, 'Actual AC required');
      return { identity: actual, power };
    };
    assert.ok(Number.isInteger(ax?.pid) && ax.pid > 0 && Number.isInteger(ax.helperPid) && ax.helperPid > 0, 'Missing actual helper process metadata');
    const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
    const pins = { targetPid: ax.pid, helperPid: ax.helperPid, source: realpathSync(ax.helperSource), executable: realpathSync(ax.helperExecutable), sourceSha256: digest(ax.helperSource), executableSha256: digest(ax.helperExecutable) };
    assert.equal(basename(pins.source), 'native-window.swift'); assert.equal(basename(pins.executable), `native-window-${pins.sourceSha256.slice(0, 12)}`);
    report.helper = pins;
    const writer = structuredClone(transport.writer);
    assert.deepEqual(Object.keys(writer ?? {}).sort(), ['source', 'sourceSha256', 'interpreter', 'interpreterSha256'].sort());
    assert.equal(basename(writer.source), 'performance-mailbox-writer.py');
    assert.equal(realpathSync(writer.interpreter), realpathSync('/usr/bin/python3'));
    report.writer = writer;
    const verifyWriter = () => {
      assert.deepEqual(transport.writer, writer, 'Fixture writer metadata changed');
      for (const [path, expected] of [[writer.source, writer.sourceSha256], [writer.interpreter, writer.interpreterSha256]]) {
        assert.ok(lstatSync(path).isFile() && !lstatSync(path).isSymbolicLink()); assert.equal(realpathSync(path), path);
        assert.match(expected, /^[a-f0-9]{64}$/); assert.equal(digest(path), expected, 'Fixture writer bytes changed');
      }
    };
    const verifyHelper = () => {
      verifyWriter();
      assert.equal(ax.pid, pins.targetPid); assert.equal(ax.helperPid, pins.helperPid);
      for (const [path, expected] of [[pins.source, pins.sourceSha256], [pins.executable, pins.executableSha256]]) {
        const info = lstatSync(path); assert.ok(info.isFile() && !info.isSymbolicLink()); assert.equal(realpathSync(path), path); assert.equal(digest(path), expected, 'Helper bytes changed');
      }
    };
    report.before = await verify(); verifyHelper(); let shellScope;
    const nonces = new Set(); let end = 0n, previousSequence = 0n, receiptSequence = 0n, transportGeneration;
    const originalReceipt = (method, recordRaw) => {
      const receipt = transport.lastReceipt;
      assert.ok(receipt && typeof receipt.raw === 'string' && Buffer.byteLength(receipt.raw) <= 16384, 'Missing original native stderr receipt');
      assert.equal(receipt.pid, pins.targetPid); assert.ok(Number.isInteger(receipt.generation) && receipt.generation > 0);
      if (transportGeneration === undefined) transportGeneration = receipt.generation; else assert.equal(receipt.generation, transportGeneration, 'Native child generation changed across trials');
      assert.equal(receipt.operation, method); assert.equal(receipt.recordRaw, recordRaw);
      assert.ok(decimal(receipt.sequence) && BigInt(receipt.sequence) > receiptSequence, 'Stale native transport receipt'); receiptSequence = BigInt(receipt.sequence);
      assert.ok(receipt.raw.startsWith('AUX_NATIVE_FIXTURE_REPLY_V1 '));
      const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
      assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1);
      assert.equal(wrapper.pid, pins.targetPid); assert.equal(wrapper.sequence, receipt.sequence); assert.equal(wrapper.operation, method);
      assert.equal(JSON.stringify(wrapper.record), recordRaw);
      return { ...receipt, sha256: createHash('sha256').update(receipt.raw).digest('hex') };
    };
    for (let trial = 0; trial < trials; trial++) {
      const attempt = { trial: trial + 1, status: 'running' }; report.attempts.push(attempt);
      await setup(trial); attempt.before = await verify(); verifyHelper();
      attempt.readyRaw = await transport.invoke(methods[metric]);
      attempt.readyReceipt = originalReceipt(methods[metric], attempt.readyRaw);
      const ready = validateGuestPresentationReady(attempt.readyRaw, metric);
      assert.equal(JSON.parse(attempt.readyReceipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length)).windowId, ready.windowId);
      assert.equal(ready.metric, metric);
      assert.ok(BigInt(ready.sampleSequence) > previousSequence, 'Replayed or reversed native sample sequence'); previousSequence = BigInt(ready.sampleSequence);
      const currentShell = Object.fromEntries(['windowId', 'widgetRoutingId', 'rendererPid', 'nativeDocumentGeneration', 'shellSink', 'displaySink'].map(key => [key, ready[key]]));
      if (shellScope) assert.deepEqual(currentShell, shellScope, 'Owning native shell changed across trials'); else shellScope = currentShell;
      assert.ok(!nonces.has(ready.requestNonce), 'Replayed native nonce'); nonces.add(ready.requestNonce);
      if (onReady !== undefined) {
        assert.equal(typeof onReady, 'function');
        const immutable = value => { if (value && typeof value === 'object') { for (const row of Object.values(value)) immutable(row); Object.freeze(value); } return value; };
        await onReady(immutable(structuredClone({ ready, receipt: attempt.readyReceipt, candidate })));
      }
      await input(trial); const completion = metric === 'little-window' ? 'completeLittleWindowPresentation' : 'completeGuestPresentation';
      attempt.measuredRaw = await transport.invoke(completion);
      attempt.measuredReceipt = originalReceipt(completion, attempt.measuredRaw);
      assert.equal(attempt.measuredReceipt.generation, attempt.readyReceipt.generation, 'Native child generation changed');
      const result = validateGuestPresentationPair(attempt.readyRaw, attempt.measuredRaw, metric);
      assert.equal(JSON.parse(attempt.measuredReceipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length)).windowId, ready.windowId);
      if (metric !== 'little-window') assert.equal(result.measured.sourcePid, pins.helperPid, 'Physical input belongs to another producer');
      const started = metric === 'little-window' ? result.ready.armedUs : result.measured.nativeInputUs;
      assert.ok(BigInt(started) > end, 'Overlapping native trials'); end = BigInt(result.measured.presentedUs);
      if (cleanup !== undefined) { assert.equal(typeof cleanup, 'function'); await cleanup(trial, result); }
      attempt.after = await verify(); verifyHelper(); attempt.sha256 = createHash('sha256').update(attempt.measuredRaw).digest('hex');
      attempt.status = 'measured'; report.samplesMs.push(result.elapsedMs);
    }
    report.after = await verify(); report.maxMs = Math.max(...report.samplesMs);
    report.budgetMs = metric === 'split-drop' ? 150 : metric === 'divider-frame' ? 16.7 : metric === 'little-window' ? 600 : 50;
    const sorted = [...report.samplesMs].sort((a, b) => a - b);
    report.p95Ms = sorted[Math.ceil(sorted.length * 0.95) - 1];
    report.gatedMs = metric === 'divider-frame' ? report.p95Ms : report.maxMs;
    assert.ok(report.gatedMs <= report.budgetMs, `Raw ${metric} interval exceeds ${report.budgetMs}ms`);
    report.status = 'measured'; return report;
  } catch (error) {
    report.status = 'failed'; report.error = error.message;
    if (error.nativeRaw) report.transportRefusalRaw = error.nativeRaw;
    const failure = new Error(`Guest presentation refused: ${error.message}`, { cause: error }); failure.report = report; throw failure;
  }
}
