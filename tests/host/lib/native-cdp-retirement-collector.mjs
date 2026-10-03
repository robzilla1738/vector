import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, lstatSync } from 'node:fs';
import { basename, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeNativeWindowCompiler } from './native-window-compiler-protocol.mjs';
import { readNativeWindowCompilerExecutable } from './native-window-compiler-artifact.mjs';
import { decodeWarmWindowHelperIdentity } from './native-warm-helper-identity.mjs';
import { validateAppearanceCandidate } from './appearance-provenance.mjs';
import { decodeNativeCdpRetirement, evaluateNativeCdpRetirementTrials } from './native-cdp-retirement.mjs';

const fields = (row, expected) => assert.deepEqual(Object.keys(row).sort(), expected.sort());
/** Decode the original direct-child stderr envelope; derived row copies cannot replace it. */
export function readCdpRetirementReceipt(receipt, originalChild, operation) {
  assert.ok(receipt && typeof receipt.raw === 'string' && Buffer.byteLength(receipt.raw) <= 16384);
  assert.equal(receipt.pid, originalChild.pid); assert.equal(receipt.generation, originalChild.generation);
  assert.equal(receipt.operation, operation);
  const prefix = 'AUX_NATIVE_FIXTURE_REPLY_V1 ';
  assert.ok(receipt.raw.startsWith(prefix));
  const row = JSON.parse(receipt.raw.slice(prefix.length));
  fields(row, ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record']);
  assert.equal(row.producer, 'aux-native-fixture-reply'); assert.equal(row.version, 1);
  assert.equal(row.pid, originalChild.pid); assert.equal(row.sequence, receipt.sequence); assert.equal(row.operation, operation);
  assert.ok(typeof row.sequence === 'string' && /^[1-9][0-9]{0,3}$/.test(row.sequence) && BigInt(row.sequence) <= 4000n);
  assert.ok(Number.isSafeInteger(row.windowId) && row.windowId > 0);
  assert.equal(row.record.producer, 'aux-native-cdp-retirement'); assert.equal(row.record.version, 1);
  assert.equal(JSON.stringify(row.record), receipt.recordRaw, 'Original receipt record changed');
  if (row.record.status === 'refused') {
    fields(row.record, ['producer', 'version', 'status']);
    const failure = new Error('Original native CDP measurement refused'); failure.nativeReceipt = receipt; throw failure;
  }
  assert.equal(row.record.pid, originalChild.pid);
  return { wrapper: row, recordRaw: receipt.recordRaw };
}

export function evaluateAuthenticatedCdpRetirementReport(report, helperAdmission) {
  assert.ok(helperAdmission, 'Missing external input-helper compiler admission');
  fields(report.helperCompiler, ['manifestRaw', 'auditRaw']);
  const compiler = decodeNativeWindowCompiler(report.helperCompiler.manifestRaw, report.helperCompiler.auditRaw, helperAdmission).manifest;
  const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
  const writerSource = realpathSync(fileURLToPath(new URL('./performance-mailbox-writer.py', import.meta.url)));
  const writerInterpreter = realpathSync('/usr/bin/python3');
  const originalWriter = { source: writerSource, sourceSha256: digest(writerSource), interpreter: writerInterpreter, interpreterSha256: digest(writerInterpreter) };
  validateAppearanceCandidate(report.candidate);
  assert.ok(['stop', 'takeover'].includes(report.mode));
  let previous = 0n;
  const rows = report.trials.map(row => {
    assert.equal(row.status, 'sampled');
    const prepare = report.mode === 'stop' ? 'prepareCdpStopMeasurement' : 'prepareCdpTakeoverMeasurement';
    const arm = readCdpRetirementReceipt(row.armReceipt, report.originalChild, prepare);
    const completed = readCdpRetirementReceipt(row.receipt, report.originalChild, 'completeCdpRetirementMeasurement');
    assert.equal(arm.wrapper.windowId, completed.wrapper.windowId);
    const armSequence = BigInt(arm.wrapper.sequence), completeSequence = BigInt(completed.wrapper.sequence);
    assert.ok(armSequence > previous); assert.equal(completeSequence, armSequence + 1n); previous = completeSequence;
    assert.deepEqual(row.afterInputProducer, row.beforeInputProducer, 'Original helper or writer changed');
    const input = row.beforeInputProducer;
    fields(input, ['targetPid', 'helperPid', 'source', 'executable', 'sourceSha256', 'executableSha256', 'writer']);
    assert.ok(isAbsolute(input.source) && basename(input.source) === 'native-window.swift');
    assert.equal(input.sourceSha256, compiler.source.sha256);
    assert.equal(input.executable, compiler.output.path);
    assert.equal(input.executableSha256, compiler.output.sha256);
    fields(input.writer, ['source', 'sourceSha256', 'interpreter', 'interpreterSha256']);
    assert.deepEqual(input.writer, originalWriter, 'Original fixed writer identity changed');
    assert.equal(input.targetPid, report.originalChild.pid);
    assert.ok(Number.isSafeInteger(row.beforeInputProducer?.helperPid) && row.beforeInputProducer.helperPid > 0 &&
      row.beforeInputProducer.helperPid !== report.originalChild.pid);
    const artifact = { binarySha256: compiler.output.sha256, sourceSha256: compiler.source.sha256, imageUuid: compiler.output.uuid };
    for (const original of [row.beforeWarmHelperIdentity, row.afterWarmHelperIdentity])
      decodeWarmWindowHelperIdentity(original, { targetPid: report.originalChild.pid, helperPid: input.helperPid, artifact });
    assert.deepEqual(row.afterWarmHelperIdentity, row.beforeWarmHelperIdentity, 'Original loaded helper or target generation changed');
    for (const value of [row.beforeIdentity, row.afterIdentity]) {
      assert.deepEqual(value.runtime, report.candidate.productIdentity);
      for (const field of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(value.native?.[field], report.candidate.native[field]);
    }
    return { ...row, raw: completed.recordRaw, armedRaw: arm.recordRaw };
  });
  return evaluateNativeCdpRetirementTrials(rows);
}

/** Source-only caller seam. Physical setup/input and cleanup must come from the owned app harness. */
export async function collectNativeCdpRetirement({ mode, trials = 20, app, mailbox, signal,
  prepareTrial, performPhysicalInput, readPower, cleanupTrial, candidate, readIdentity, ax, compilerArtifact, helperAdmission }) {
  assert.ok(['stop', 'takeover'].includes(mode));
  assert.ok(Number.isSafeInteger(trials) && trials >= 20 && trials <= 100);
  const processOwner = () => {
    const observed = app.processObservation;
    assert.ok(observed && observed.launchKind === 'child' && !observed.exitStatusAvailable && !observed.spawnError &&
      observed.exitCode === null && observed.signal === null, 'Measurement requires its original live direct child');
    assert.equal(observed.pid, app.pid);
    assert.ok(Number.isSafeInteger(observed.pid) && observed.pid > 0 && Number.isSafeInteger(observed.generation) && observed.generation > 0);
    return { pid: observed.pid, generation: observed.generation };
  };
  const originalChild = processOwner();
  const rows = [];
  const report = () => ({ helperCompiler: compilerArtifact ? { manifestRaw: compilerArtifact.decoded.manifestRaw, auditRaw: compilerArtifact.decoded.auditRaw } : undefined, producer: 'aux-cdp-retirement-collection/v1', mode, originalChild, candidate,
    trials: rows.map(({ raw: _raw, armedRaw: _arm, ...original }) => original) });
  for (let index = 0; index < trials; index++) {
    const row = { index, status: 'pending' }; rows.push(row);
    let ownedTrial, primary, cleanup;
    try {
      signal.throwIfAborted();
      ownedTrial = await prepareTrial(index, signal);
      signal.throwIfAborted();
      assert.deepEqual(processOwner(), originalChild);
      validateAppearanceCandidate(candidate);
      assert.equal(typeof readIdentity, 'function', 'Missing original compiled identity producer');
      assert.ok(helperAdmission && compilerArtifact, 'Missing external input-helper compiler admission');
      const pins = () => {
        readNativeWindowCompilerExecutable(compilerArtifact, ax.helperSource);
        compilerArtifact.matchOriginalClient(ax);
        const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
        assert.equal(ax.pid, originalChild.pid);
        assert.ok(Number.isSafeInteger(ax.helperPid) && ax.helperPid > 0);
        const source = realpathSync(ax.helperSource), executable = compilerArtifact.executablePath;
        assert.equal(realpathSync(ax.helperExecutable), realpathSync(executable));
        for (const path of [source, executable]) assert.ok(lstatSync(path).isFile() && !lstatSync(path).isSymbolicLink());
        const sourceSha256 = digest(source), executableSha256 = digest(executable);
        assert.equal(basename(source), 'native-window.swift');
        assert.equal(basename(executable), `native-window-${sourceSha256.slice(0, 12)}`);
        const writer = mailbox.writer;
        fields(writer, ['source', 'sourceSha256', 'interpreter', 'interpreterSha256']);
        assert.equal(basename(writer.source), 'performance-mailbox-writer.py');
        assert.equal(realpathSync(writer.interpreter), realpathSync('/usr/bin/python3'));
        assert.equal(digest(writer.source), writer.sourceSha256); assert.equal(digest(writer.interpreter), writer.interpreterSha256);
        return { targetPid: ax.pid, helperPid: ax.helperPid, source, executable, sourceSha256, executableSha256, writer };
      };
      row.beforeInputProducer = pins();
      row.beforeWarmHelperIdentity = await ax.request('warmWindowIdentity');
      decodeWarmWindowHelperIdentity(row.beforeWarmHelperIdentity, { targetPid: originalChild.pid, helperPid: ax.helperPid, artifact: compilerArtifact.artifact });
      row.beforeIdentity = await readIdentity();
      row.powerBefore = await readPower();
      const prepare = mode === 'stop' ? 'prepareCdpStopMeasurement' : 'prepareCdpTakeoverMeasurement';
      await mailbox.invoke(prepare, 5000);
      row.armReceipt = mailbox.lastReceipt;
      const arm = readCdpRetirementReceipt(row.armReceipt, originalChild, prepare);
      row.armedRaw = arm.recordRaw;
      assert.equal(arm.wrapper.record.status, 'armed'); assert.equal(arm.wrapper.record.mode, mode);
      signal.throwIfAborted();
      // The actual caller performs input after the native associated Ready ACK.
      // The fixed native Complete endpoint independently awaits the original
      // measured Stop worker callback; caller UI observations never prove ACK.
      row.controlObservation = await performPhysicalInput(ownedTrial, mode, signal);
      signal.throwIfAborted();
      await mailbox.invoke('completeCdpRetirementMeasurement', 5000);
      row.receipt = mailbox.lastReceipt;
      const completed = readCdpRetirementReceipt(row.receipt, originalChild, 'completeCdpRetirementMeasurement');
      assert.equal(completed.wrapper.windowId, arm.wrapper.windowId, 'Original shell owner changed');
      row.raw = completed.recordRaw;
      decodeNativeCdpRetirement(row.raw, row.armedRaw);
      assert.deepEqual(processOwner(), originalChild);
      row.afterInputProducer = pins(); assert.deepEqual(row.afterInputProducer, row.beforeInputProducer);
      row.afterWarmHelperIdentity = await ax.request('warmWindowIdentity');
      decodeWarmWindowHelperIdentity(row.afterWarmHelperIdentity, { targetPid: originalChild.pid, helperPid: ax.helperPid, artifact: compilerArtifact.artifact });
      assert.deepEqual(row.afterWarmHelperIdentity, row.beforeWarmHelperIdentity, 'Original loaded helper or target generation changed');
      row.afterIdentity = await readIdentity();
      row.powerAfter = await readPower();
      row.status = 'sampled';
    } catch (error) {
      primary = error; row.status = 'refused'; row.failure = { name: error.name, message: error.message };
      if (error.nativeReceipt) row.refusalReceipt = error.nativeReceipt;
    } finally {
      try { await cleanupTrial(ownedTrial, signal); }
      catch (error) { cleanup = error; row.status = 'refused'; row.cleanupFailure = { name: error.name, message: error.message }; }
    }
    try { assert.ok(Buffer.byteLength(JSON.stringify(report())) <= 1024 * 1024, 'Original measurement evidence exceeds unchanged 1MiB bound'); }
    catch (error) { primary = primary ? new AggregateError([primary, error], 'Original trial and evidence bound failed') : error; }
    if (primary || cleanup) {
      const failure = new AggregateError([primary, cleanup].filter(Boolean), 'Original M4 trial or owned cleanup failed');
      failure.report = report();
      // Retain actual cleanup debt/owned process handles, never rediscover by PID.
      if (cleanup) { failure.cleanupDebt = cleanup; failure.ownedChild = cleanup.ownedChild; failure.reaped = cleanup.reaped; }
      throw failure;
    }
  }
  try { evaluateAuthenticatedCdpRetirementReport(report(), helperAdmission); }
  catch (error) { error.report = report(); throw error; }
  return report();
}
