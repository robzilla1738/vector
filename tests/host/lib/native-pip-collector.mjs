import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createPipOwnedOperations } from './pip-owned-operations.mjs';
import { extractOriginalGuestFixtureRecord, decodeOriginalGuestRecord } from './guest-original-record.mjs';
import { validatePipPresentationReady, validatePipPresentationRetirement } from './native-pip-performance-protocol.mjs';

const kinds = ['video-pip', 'document-pip'];
const debt = new Set();
const power = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 });
const ac = raw => { assert.equal(typeof raw, 'string'); assert.match(raw, /Now drawing from 'AC Power'/); return raw; };
const errorRecord = reason => ({ name: reason?.name ?? typeof reason, message: reason?.message ?? String(reason) });
function child(app) {
  const row = app.processObservation;
  assert.equal(row.launchKind, 'child'); assert.equal(row.exitStatusAvailable, false); assert.equal(row.spawnError, null);
  assert.ok(Number.isSafeInteger(row.pid) && row.pid > 0 && Number.isSafeInteger(row.generation) && row.generation > 0);
  assert.equal(row.pid, app.pid); return { pid: row.pid, generation: row.generation };
}
function original(receipt, owner, operation) {
  assert.equal(receipt.pid, owner.pid); assert.equal(receipt.generation, owner.generation); assert.equal(receipt.operation, operation);
  const record = extractOriginalGuestFixtureRecord(receipt.raw);
  assert.equal(record, receipt.recordRaw);
  const wrapper = decodeOriginalGuestRecord(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
  assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1);
  assert.equal(wrapper.pid, owner.pid); assert.equal(wrapper.operation, operation); assert.equal(wrapper.sequence, receipt.sequence);
  assert.match(wrapper.sequence, /^[1-9][0-9]*$/); assert.ok(BigInt(wrapper.sequence) <= 4000n);
  assert.equal(wrapper.windowId, decodeOriginalGuestRecord(record).windowId);
  return record;
}
/** Pure falsification gate. Original native records remain indispensable; no
 * caller labels, appearance, Hide or AX disappearance can supply a sample. */
export function evaluatePipTrials(attempts, trials) {
  assert.ok(Number.isSafeInteger(trials) && trials >= 20 && trials <= 100);
  assert.equal(attempts.length, trials * kinds.length);
  const pages = new Set(), widgets = new Set(), nonces = new Set(); let lastEnd = 0n;
  return kinds.map(kind => {
    const selected = attempts.filter(row => row.kind === kind); assert.equal(selected.length, trials);
    const values = selected.map(row => {
      assert.equal(row.status, 'measured'); ac(row.powerBefore); ac(row.powerAfter);
      const pair = validatePipPresentationRetirement(row.readyRaw, row.measuredRaw, row.retiredRaw);
      assert.equal(pair.measured.surfaceKind, kind); assert.equal(pair.ready.sourcePageId, row.pageId);
      assert.ok(!pages.has(row.pageId) && !widgets.has(pair.measured.targetWidgetReceipt) && !nonces.has(pair.ready.requestNonce), 'A PiP trial reused an original page/controller/Widget/nonce');
      pages.add(row.pageId); widgets.add(pair.measured.targetWidgetReceipt); nonces.add(pair.ready.requestNonce);
      assert.ok(BigInt(pair.ready.armedUs) > lastEnd, 'PiP trials overlapped original native lifetimes'); lastEnd = BigInt(pair.retired.destroyedUs);
      assert.equal(row.close.ok, true); assert.equal(row.originalPageAbsent, true);
      return pair.elapsedMs;
    });
    const maxMs = Math.max(...values);
    return { kind, trials, maxMs, limitMs: 500, pass: maxMs <= 500 };
  });
}

/** Independently reconstruct persisted evidence against the same externally
 * admitted pair/helper lease. Report labels alone never admit a producer. */
export async function evaluateNativePipReport(report, pair) {
  const { readPackagedRuntimePairBytes } = await import('./packaged-runtime-pair-artifact.mjs');
  const { decodeWarmWindowHelperIdentity } = await import('./native-warm-helper-identity.mjs');
  const { readNativePerformanceMailboxWriterIdentity } = await import('./performance-mailbox.mjs');
  pair.validate(); const artifact = readPackagedRuntimePairBytes(pair);
  assert.deepEqual(report.writer, readNativePerformanceMailboxWriterIdentity());
  assert.equal(report.schema, 'aux-native-pip-cohort/v1'); assert.deepEqual(report.pair, artifact.artifact);
  assert.deepEqual(report.productIdentity, artifact.productIdentity); assert.deepEqual(report.native, artifact.native);
  assert.deepEqual(report.helperCompiler, { manifestRaw: pair.compilerArtifact.decoded.manifestRaw, auditRaw: pair.compilerArtifact.decoded.auditRaw });
  assert.equal(report.cleanupErrors.length, 0); assert.ok(!report.primaryFailure);
  assert.equal(report.videoGuestCoverage, false); assert.equal(report.firstFrameProven, false); assert.equal(report.earliestPresentationProven, false); assert.equal(report.nativeQualificationProven, false);
  assert.ok(Buffer.byteLength(JSON.stringify(report)) <= 1024 * 1024); ac(report.powerBefore); ac(report.powerAfter);
  const attempts = report.attempts.map(row => {
    assert.deepEqual(row.after, row.before); assert.deepEqual(row.before, report.identityBefore);
    for (const identity of [row.before.identity, row.after.identity]) {
      assert.deepEqual(identity.runtime, artifact.productIdentity);
      for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(identity.native[key], artifact.native[key]);
    }
    for (const helper of [row.before.helper, row.after.helper]) decodeWarmWindowHelperIdentity(helper, { targetPid: report.originalChild.pid, helperPid: helper.helperPid, artifact: pair.compilerArtifact.artifact });
    const last = row.retirementAttempts.at(-1); assert.ok(last);
    const extract = (receipt, operation) => original({ ...receipt, recordRaw: extractOriginalGuestFixtureRecord(receipt.raw) }, report.originalChild, operation);
    return { ...row, readyRaw: extract(row.readyReceipt, 'preparePipWindowPresentation'), measuredRaw: extract(row.measuredReceipt, 'completePipWindowPresentation'), retiredRaw: extract(last, 'retirePipWindowPresentation') };
  });
  const metrics = evaluatePipTrials(attempts, report.trialsPerKind); assert.deepEqual(report.metrics, metrics);
  assert.equal(report.status, metrics.every(row => row.pass) ? 'passed' : 'failed'); return metrics;
}

/** Runs only when explicitly called by an admitted owned journey. The outer
 * original App/helper owner retains launch/quit/reap; this collector owns only
 * its freshly created pages and native PiP lifetime receipts. */
export async function collectNativePipPresentation({ pair, app, ax, mailbox, rpc, fixture, signal, trials = 20, readPower = power }) {
  assert.equal(debt.size, 0, 'Original PiP cleanup debt remains');
  assert.ok(Number.isSafeInteger(trials) && trials >= 20 && trials <= 100);
  assert.equal(typeof signal?.throwIfAborted, 'function'); signal.throwIfAborted();
  const { readPackagedRuntimePairBytes } = await import('./packaged-runtime-pair-artifact.mjs');
  const { readNativeWindowCompilerExecutable } = await import('./native-window-compiler-artifact.mjs');
  const { decodeWarmWindowHelperIdentity } = await import('./native-warm-helper-identity.mjs');
  const { surfaceMediaPage } = await import('../fixtures/surface-media.mjs');
  const { readNativePerformanceMailboxWriterIdentity } = await import('./performance-mailbox.mjs');
  const artifact = readPackagedRuntimePairBytes(pair), owner = child(app);
  assert.equal(artifact.productIdentity.dirty, false); assert.ok(mailbox.writer);
  const url = new URL(fixture.url); assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1'); assert.ok(url.port); assert.equal(url.pathname, '/'); assert.ok(!url.search && !url.hash && !url.username && !url.password);
  fixture.route('/pip-performance', surfaceMediaPage('Aux PiP performance', 1));
  const report = { schema: 'aux-native-pip-cohort/v1', status: 'running', pair: structuredClone(artifact.artifact), productIdentity: structuredClone(artifact.productIdentity), native: structuredClone(artifact.native),
    helperCompiler: { manifestRaw: pair.compilerArtifact.decoded.manifestRaw, auditRaw: pair.compilerArtifact.decoded.auditRaw }, originalChild: owner, writer: structuredClone(mailbox.writer), trialsPerKind: trials, attempts: [], cleanupErrors: [],
    videoGuestCoverage: false, firstFrameProven: false, earliestPresentationProven: false, nativeQualificationProven: false };
  const verify = async () => {
    pair.validate(); assert.deepEqual(child(app), owner); assert.equal(ax.pid, owner.pid);
    assert.deepEqual(mailbox.writer, report.writer); assert.deepEqual(readNativePerformanceMailboxWriterIdentity(), report.writer);
    pair.compilerArtifact.matchOriginalClient(ax); readNativeWindowCompilerExecutable(pair.compilerArtifact, ax.helperSource);
    const identity = await app.identity(); assert.deepEqual(identity.runtime, artifact.productIdentity);
    for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(identity.native[key], artifact.native[key]);
    const helper = await ax.request('warmWindowIdentity');
    decodeWarmWindowHelperIdentity(helper, { targetPid: owner.pid, helperPid: ax.helperPid, artifact: pair.compilerArtifact.artifact });
    return { identity, helper };
  };
  let primary, ownedPage, current, deadline; const failures = [];
  const originalOwners = { app, ax, mailbox, originalChild: owner };
  const operations = createPipOwnedOperations(originalOwners, () => deadline);
  const bounded = operations.bounded;
  const invoke = async operation => {
    await bounded(() => mailbox.invoke(operation, Math.max(1, deadline - Date.now())));
    const receipt = mailbox.lastReceipt; original(receipt, owner, operation); return receipt;
  };
  const closeOwned = async () => {
    if (!ownedPage) return;
    const pages = await bounded(() => rpc('pages.list'));
    const actual = pages.find(page => page.pageId === ownedPage.pageId);
    if (actual) {
      for (const key of ['windowId', 'backend', 'ownedByRuntime', 'controller', 'controllerEpoch', 'sessionId', 'documentEpoch']) assert.equal(actual[key], ownedPage[key], 'Original PiP page ownership changed before cleanup');
      assert.ok(!actual.agentIsolation); assert.equal(actual.url, ownedPage.url);
      current.close = await bounded(() => rpc('pages.close', { pageId: ownedPage.pageId })); assert.equal(current.close.ok, true);
    } else assert.ok(current.close?.ok, 'Original page disappeared without this owned close ACK');
    current.originalPageAbsent = !(await bounded(() => rpc('pages.list'))).some(page => page.pageId === ownedPage.pageId); assert.equal(current.originalPageAbsent, true);
    // Source closure destroys its actual PiP controller. Polling reads only a
    // genuine WidgetDestroyed receipt; it never supplies timing or retirement.
    do {
      const receipt = await invoke('retirePipWindowPresentation');
      current.retirementAttempts.push(receipt);
      const raw = original(receipt, owner, receipt.operation), record = decodeOriginalGuestRecord(raw);
      if (record.status === 'retired') { current.retiredRaw = raw; ownedPage = undefined; return; }
      assert.equal(record.status, 'refused');
      await bounded(() => new Promise(resolve => setTimeout(resolve, 10)));
    } while (Date.now() < deadline);
    throw new Error('Original native PiP Widget destruction was not retired');
  };
  try {
    report.identityBefore = await verify(); report.powerBefore = ac(await readPower());
    for (const kind of kinds) for (let index = 0; index < trials; index++) {
      signal.throwIfAborted(); current = { kind, trial: index + 1, status: 'pending', retirementAttempts: [] }; report.attempts.push(current);
      // Each source is new: a prior Video PiP Hide cannot be mistaken for Init.
      deadline = Date.now() + 10000;
      ownedPage = await bounded(() => rpc('pages.open', { url: url.origin + '/pip-performance', activate: true }));
      assert.equal(ownedPage.backend, 'aux'); assert.equal(ownedPage.ownedByRuntime, false); assert.ok(!ownedPage.agentIsolation); assert.equal(ownedPage.url, url.origin + '/pip-performance'); current.pageId = ownedPage.pageId;
      const playing = { name: 'Videos playing: 1', match: 'exact', scope: 'page', index: 0 };
      await ax.waitFor(playing); current.before = await verify(); assert.deepEqual(current.before, report.identityBefore); current.powerBefore = ac(await readPower()); signal.throwIfAborted(); deadline = Date.now() + 5000;
      current.readyReceipt = await invoke('preparePipWindowPresentation'); current.readyRaw = original(current.readyReceipt, owner, current.readyReceipt.operation);
      const ready = validatePipPresentationReady(current.readyRaw); assert.equal(ready.sourcePageId, ownedPage.pageId);
      if (kind === 'video-pip') await bounded(() => ax.key('control+command+p', 'hid'));
      else await bounded(() => ax.press({ name: 'Document picture in picture', match: 'exact', scope: 'page', role: 'AXButton', index: 0 }));
      current.measuredReceipt = await invoke('completePipWindowPresentation'); current.measuredRaw = original(current.measuredReceipt, owner, current.measuredReceipt.operation);
      await closeOwned(); validatePipPresentationRetirement(current.readyRaw, current.measuredRaw, current.retiredRaw);
      current.after = await verify(); assert.deepEqual(current.after, current.before); current.powerAfter = ac(await readPower()); signal.throwIfAborted(); current.status = 'measured';
    }
    report.powerAfter = ac(await readPower()); report.metrics = evaluatePipTrials(report.attempts, trials); report.status = report.metrics.every(row => row.pass) ? 'passed' : 'failed';
  } catch (reason) { primary = reason; report.primaryFailure = errorRecord(reason); report.status = 'failed'; }
  finally {
    // Never mint a new cleanup interval after original Arm expires. Failed
    // cleanup remains original owner debt for the outer App guardian/teardown.
    if (ownedPage) try { await closeOwned(); } catch (reason) { failures.push(reason); }
  }
  report.cleanupErrors = failures.map(errorRecord);
  // Omit only parsed clones: wrapper bytes retain each original record once.
  for (const row of report.attempts) {
    for (const key of ['readyRaw', 'measuredRaw', 'retiredRaw']) delete row[key];
    for (const receipt of [row.readyReceipt, row.measuredReceipt, ...row.retirementAttempts].filter(Boolean)) delete receipt.recordRaw;
  }
  if (Buffer.byteLength(JSON.stringify(report)) > 1024 * 1024) { failures.push(new Error('Original PiP evidence exceeds unchanged 1MiB bound')); report.status = 'failed'; report.cleanupErrors = failures.map(errorRecord); }
  if (primary || failures.length) {
    const pendingOriginalOperations = operations.retained();
    const retained = ownedPage || pendingOriginalOperations.length ? { ...originalOwners, ownedPage, current, deadline, pendingOriginalOperations } : undefined;
    if (retained) debt.add(retained);
    const error = new AggregateError([...(primary ? [primary] : []), ...failures], 'Original PiP cohort failed', { cause: primary }); error.report = report; error.retainedOriginalOwners = retained; throw error;
  }
  return report;
}
