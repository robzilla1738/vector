import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createJourneyApp } from './app.mjs';
import { createRpc } from './rpc.mjs';
import { createAxClient } from './ax.mjs';
import { readPackagedRuntimePairBytes } from './packaged-runtime-pair-artifact.mjs';
import { prepareCommandHistoryDataset, readCommandHistoryDataset } from './command-history-dataset.mjs';
import { readNativeWindowCompilerExecutable } from './native-window-compiler-artifact.mjs';
import { decodeWarmWindowHelperIdentity } from './native-warm-helper-identity.mjs';
import { decodeNativeCommandPresentation, extractNativeCommandFixtureRecord } from './native-command-presentation.mjs';
import { rawPercentile } from './native-key-performance.mjs';
const modes = Object.freeze([{ mode: 'new-tab', shortcut: 'command+t', prefix: 'auxperf0000', key: '0' }, { mode: 'edit', shortcut: 'command+l', prefix: 'auxperf0000', key: '0' }, { mode: 'command', shortcut: 'command+k', prefix: 'setting', key: 's' }]);
const dialog = Object.freeze({ role: 'AXGroup', name: 'Command surface', scope: 'shell' });
const field = Object.freeze({ role: 'AXComboBox', name: 'Address, search, and agent prompt', scope: 'shell', within: dialog, index: 0 });
const retainedDebt = new Set();
const ac = raw => { assert.equal(typeof raw, 'string'); assert.match(raw, /Now drawing from 'AC Power'/); return raw; };
const failure = reason => ({ name: reason?.name ?? typeof reason, message: reason?.message ?? String(reason) });
const actualPower = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 });
function child(app) {
  const row = app.processObservation; assert.equal(row.launchKind, 'child'); assert.equal(row.exitStatusAvailable, false); assert.equal(row.spawnError, null);
  assert.ok(Number.isSafeInteger(row.pid) && row.pid > 0 && Number.isSafeInteger(row.generation) && row.generation > 0);
  assert.equal(row.pid, app.pid); assert.equal(row.exitCode, null); assert.equal(row.signal, null); return { pid: row.pid, generation: row.generation };
}
function finalReceipt(receipt, owner, ready) {
  assert.equal(receipt.pid, owner.pid); assert.equal(receipt.generation, owner.generation); assert.equal(receipt.operation, 'commandPresentationSnapshot');
  const original = extractNativeCommandFixtureRecord(receipt.raw); assert.equal(original, receipt.recordRaw);
  const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
  assert.deepEqual(Object.keys(wrapper).sort(), ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record'].sort());
  assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1); assert.equal(wrapper.pid, owner.pid);
  assert.equal(wrapper.sequence, receipt.sequence); assert.equal(wrapper.operation, receipt.operation);
  assert.match(wrapper.sequence, /^[1-9][0-9]*$/); assert.ok(BigInt(wrapper.sequence) <= 4000n);
  assert.equal(ready.pid, owner.pid); assert.equal(ready.generation, owner.generation); assert.equal(ready.sequence, wrapper.sequence);
  assert.equal(receipt.commandReady.raw, ready.raw); const decoded = decodeNativeCommandPresentation(original, ready.raw);
  assert.equal(wrapper.windowId, decoded.windowId); return decoded;
}
/** Actual caller, never automatic execution: canonical pair + fresh owned App only. */
export async function collectNativeCommandPresentation({ pair, fixtureUrl, signal, trials = 20, readPower = actualPower }) {
  assert.equal(retainedDebt.size, 0, 'Original command cohort cleanup debt remains');
  assert.ok(Number.isSafeInteger(trials) && trials >= 20 && trials <= 100, '20–100 actual trials per mode required');
  assert.equal(typeof signal?.throwIfAborted, 'function'); signal.throwIfAborted();
  const artifact = readPackagedRuntimePairBytes(pair); assert.equal(artifact.productIdentity.dirty, false);
  const url = new URL(fixtureUrl); assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1'); assert.ok(url.port); assert.equal(url.pathname, '/'); assert.ok(!url.username && !url.password && !url.search && !url.hash);
  const report = { schema: 'aux-native-command-cohort/v1', status: 'running', pair: structuredClone(artifact.artifact), productIdentity: structuredClone(artifact.productIdentity), native: structuredClone(artifact.native),
    helperCompiler: { manifestRaw: pair.compilerArtifact.decoded.manifestRaw, auditRaw: pair.compilerArtifact.decoded.auditRaw }, trialsPerMode: trials, attempts: [],
    firstFrameProven: false, ordinaryNavigationTimingProven: false, nativeQualificationProven: false, cleanupErrors: [] };
  let app, ax, mailbox, primary, original, dataset;
  const cleanupFailures = [], pendingCleanup = [];
  const cleanup = async (operation, deadline) => {
    const originalPromise = Promise.resolve().then(operation); pendingCleanup.push(originalPromise); originalPromise.catch(() => {});
    let timer;
    try { return await Promise.race([originalPromise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Original command cohort cleanup deadline expired')), Math.max(0, deadline - Date.now())); })]); }
    finally { clearTimeout(timer); }
  };
  const verify = async () => {
    pair.validate(); assert.deepEqual(child(app), original); readNativeWindowCompilerExecutable(pair.compilerArtifact, ax.helperSource); pair.compilerArtifact.matchOriginalClient(ax); assert.equal(ax.pid, original.pid);
    const identity = await app.identity(); assert.deepEqual(identity.runtime, artifact.productIdentity);
    for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(identity.native[key], artifact.native[key]);
    return identity;
  };
  try {
    report.powerBeforeBootstrap = ac(await readPower()); signal.throwIfAborted(); pair.validate();
    app = createJourneyApp({ appPath: artifact.bundle, launch: { args: ['--aux-native-performance-observer'], devAcceptance: { features: ['commandBar', 'commandRegistry'], sourceCommit: artifact.native.sourceCommit } } });
    await app.start(); signal.throwIfAborted();
    const rpc = createRpc(() => app.descriptor());
    report.nativeSeed = await rpc('pages.open', { url: url.origin + '/command-history/native-seed', activate: true });
    assert.equal(report.nativeSeed.url, url.origin + '/command-history/native-seed'); assert.equal(report.nativeSeed.backend, 'aux'); assert.equal(report.nativeSeed.ownedByRuntime, false); assert.ok(!report.nativeSeed.agentIsolation);
    report.nativeSeedClose = await rpc('pages.close', { pageId: report.nativeSeed.pageId });
    assert.equal(report.nativeSeedClose.ok, true);
    assert.ok(!(await rpc('pages.list')).some(page => page.pageId === report.nativeSeed.pageId), 'Original native seed page remains live');
    await app.quit(); const stopped = await app.waitForStoppedCommandProfile(); signal.throwIfAborted();
    dataset = prepareCommandHistoryDataset(stopped, fixtureUrl); report.historyBefore = readCommandHistoryDataset(dataset, stopped);
    report.powerBeforeLaunch = ac(await readPower()); pair.validate(); signal.throwIfAborted();
    await app.start(); original = child(app); report.originalChild = original;
    ax = await createAxClient(original.pid, { compilerArtifact: pair.compilerArtifact }); mailbox = app.configurePerformanceMailbox(); report.writer = mailbox.writer;
    report.identityBefore = await verify(); let lastSample = 0n, lastEnd = 0n;
    for (const mode of modes) for (let index = 0; index < trials; index++) {
      const attempt = { mode: mode.mode, trial: index + 1, status: 'pending' }; report.attempts.push(attempt);
      signal.throwIfAborted(); await ax.key('escape', 'hid'); await ax.key(mode.shortcut, 'hid'); await ax.waitFor(dialog); await ax.waitFor(field, 'enabled');
      await ax.key('command+a', 'hid'); await ax.type(mode.prefix, field);
      const controls = await ax.query(field); assert.equal(controls.length, 1); assert.equal(controls[0].value, mode.prefix); assert.equal(controls[0].focused, true);
      attempt.beforeIdentity = await verify(); attempt.powerBefore = ac(await readPower());
      attempt.beforeInputProducer = await ax.request('warmWindowIdentity'); decodeWarmWindowHelperIdentity(attempt.beforeInputProducer, { targetPid: original.pid, helperPid: ax.helperPid, artifact: pair.compilerArtifact.artifact });
      const completion = mailbox.invoke('commandPresentationSnapshot', 7000); completion.catch(() => {});
      attempt.ready = await mailbox.waitForCommandPresentationReady(); assert.equal(attempt.ready.record.surfaceMode, mode.mode); signal.throwIfAborted();
      // Exactly one real HID keystroke after genuine renderer readiness.
      await ax.key(mode.key, 'hid'); const originalRaw = await completion; attempt.receipt = mailbox.lastReceipt; assert.equal(originalRaw, attempt.receipt.recordRaw);
      const measured = finalReceipt(attempt.receipt, original, attempt.ready); assert.equal(measured.surfaceMode, mode.mode);
      assert.ok(BigInt(measured.sampleSequence) > lastSample && BigInt(measured.nativeInputUs) > lastEnd); lastSample = BigInt(measured.sampleSequence); lastEnd = BigInt(measured.presentationUs);
      attempt.afterInputProducer = await ax.request('warmWindowIdentity'); decodeWarmWindowHelperIdentity(attempt.afterInputProducer, { targetPid: original.pid, helperPid: ax.helperPid, artifact: pair.compilerArtifact.artifact });
      assert.deepEqual(attempt.afterInputProducer, attempt.beforeInputProducer); attempt.afterIdentity = await verify(); attempt.powerAfter = ac(await readPower()); attempt.status = 'measured';
    }
    report.powerAfterCohort = ac(await readPower());
  } catch (error) { primary = error; report.primaryFailure = failure(error); }
  finally {
    const cleanupDeadline = Date.now() + 10000;
    try { if (ax) { const closed = await cleanup(() => ax.close(), cleanupDeadline); report.helperClose = closed; if (closed.primary) throw closed.primary; assert.equal(closed.reaped, true); assert.equal(closed.clean, true); } } catch (error) { cleanupFailures.push(error); }
    try { if (app) { await cleanup(() => app.quit(), cleanupDeadline); const stopped = app.processObservation.pid ? await cleanup(() => app.waitForStoppedCommandProfile(), cleanupDeadline) : undefined; if (dataset) { assert.ok(stopped); report.historyAfter = readCommandHistoryDataset(dataset, stopped); } } } catch (error) { cleanupFailures.push(error); }
    if (cleanupFailures.length) retainedDebt.add({ app, ax, primary, pendingCleanup, cleanupErrors: cleanupFailures });
  }
  if (!primary && !cleanupFailures.length) {
    report.metrics = modes.map(({ mode }) => {
      const values = report.attempts.filter(attempt => attempt.mode === mode).map(attempt => Number(decodeNativeCommandPresentation(attempt.receipt.recordRaw, attempt.ready.raw).elapsedUs) / 1000);
      assert.equal(values.length, trials); const p95Ms = rawPercentile(values, 0.95); return { mode, trials, p95Ms, limitMs: 30, pass: p95Ms <= 30 };
    });
    report.status = report.metrics.every(metric => metric.pass) ? 'passed' : 'failed';
  } else report.status = 'failed';
  // Persist original wrapper and READY bytes; these parsed copies are independently reproducible.
  for (const attempt of report.attempts) {
    if (attempt.ready) delete attempt.ready.record;
    if (attempt.receipt) { delete attempt.receipt.recordRaw; delete attempt.receipt.commandReady; }
  }
  if (Buffer.byteLength(JSON.stringify(report)) > 1024 * 1024) {
    const error = new Error('Original command evidence exceeds unchanged 1MiB bound');
    if (!primary) primary = error; else cleanupFailures.push(error);
    report.status = 'failed';
  }
  report.cleanupErrors = cleanupFailures.map(failure);
  if (primary && !report.primaryFailure) report.primaryFailure = failure(primary);
  if (primary || cleanupFailures.length) { const error = new AggregateError([...(primary ? [primary] : []), ...cleanupFailures], 'Original command cohort failed', { cause: primary }); error.report = report; error.retainedOriginalOwners = cleanupFailures.length ? { app, ax, pendingCleanup } : undefined; throw error; }
  return report;
}
