import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, realpathSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const operations = Object.freeze({
  'auto-archive': 'prepareOrganizationAutoArchiveWork',
  'live-folder-refresh': 'prepareOrganizationLiveFolderWork',
});
const hex = (value, length) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
const token = value => typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value);
const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const integer = value => Number.isSafeInteger(value) && value > 0;
const defaultPower = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 });
const assertAC = value => { assert.equal(typeof value, 'string'); assert.match(value, /Now drawing from 'AC Power'/, 'Actual AC power required'); };

/** Private native whole-work/task observer receipts only. Not presentation or qualification. */
export async function collectNativeOrganizationWork({ metric, transport, ax, candidate, readIdentity, prepareTrial, performWork, trials = 20, readPower = defaultPower }) {
  const report = { schema: 1, status: 'running', metric, candidate: structuredClone(candidate), trials,
    endpoint: 'fresh whole asynchronous work through committed rows/archive receipt; completed native renderer tasks',
    startedAt: new Date().toISOString(), attempts: [], measurements: [], identities: [], power: [] };
  try {
    const expected = structuredClone(candidate), product = expected?.productIdentity;
    assert.ok(Object.hasOwn(operations, metric), 'Unsupported organization metric');
    assert.ok(Number.isInteger(trials) && trials >= 20 && trials <= 100, '20–100 actual trials required');
    assert.ok(product?.dirty === false && hex(product.commit, 40) && hex(product.tree, 40) && product.label === product.commit, 'Clean candidate required');
    assert.equal(expected.native?.sourceCommit, product.commit);
    assert.ok(hex(expected.native?.manifestHash, 64) && typeof expected.native?.buildId === 'string' && expected.native.buildId && hex(expected.shellDigest, 64) && hex(expected.harnessCommit, 40) && hex(expected.moduleSha256, 64), 'Missing paired candidate');
    assert.ok(integer(ax?.pid) && integer(ax.helperPid) && typeof transport?.invoke === 'function' && typeof readIdentity === 'function' && typeof prepareTrial === 'function' && typeof performWork === 'function' && typeof readPower === 'function', 'Missing genuine fixture/work/identity producers');
    const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
    const helper = { pid: ax.pid, helperPid: ax.helperPid, source: realpathSync(ax.helperSource), executable: realpathSync(ax.helperExecutable), sourceSha256: digest(ax.helperSource), executableSha256: digest(ax.helperExecutable) };
    const writer = structuredClone(transport.writer);
    assert.equal(basename(helper.source), 'native-window.swift');
    assert.equal(basename(helper.executable), `native-window-${helper.sourceSha256.slice(0, 12)}`);
    assert.deepEqual(Object.keys(writer ?? {}).sort(), ['source', 'sourceSha256', 'interpreter', 'interpreterSha256'].sort());
    assert.equal(basename(writer.source), 'performance-mailbox-writer.py');
    assert.equal(writer.interpreter, realpathSync('/usr/bin/python3'));
    report.helper = helper; report.writer = writer;
    const verify = async () => {
      assert.equal(ax.pid, helper.pid); assert.equal(ax.helperPid, helper.helperPid);
      assert.deepEqual(transport.writer, writer);
      for (const [path, expectedHash] of [[helper.source, helper.sourceSha256], [helper.executable, helper.executableSha256], [writer.source, writer.sourceSha256], [writer.interpreter, writer.interpreterSha256]]) {
        const info = lstatSync(path);
        assert.ok(info.isFile() && !info.isSymbolicLink() && hex(expectedHash, 64), 'Changed/missing producer file');
        assert.equal(realpathSync(path), path); assert.equal(digest(path), expectedHash, 'Producer bytes changed');
      }
      const actual = structuredClone(await readIdentity()); report.identities.push(actual);
      assert.deepEqual(actual.runtime, product, 'Runtime candidate changed');
      for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(actual.native?.[key], expected.native[key], `Native ${key} changed`);
    };
    const power = async () => { const actual = await readPower(); report.power.push(actual); assertAC(actual); };
    let transportSequence = 0n, transportGeneration;
    const decode = (method, text, attempt, stage) => {
      attempt[`${stage}Raw`] = text;
      assert.ok(typeof text === 'string' && Buffer.byteLength(text) <= 16384, 'Missing bounded original native reply');
      const receipt = structuredClone(transport.lastReceipt); attempt[`${stage}Receipt`] = receipt;
      assert.ok(receipt && typeof receipt.raw === 'string' && receipt.raw.startsWith('AUX_NATIVE_FIXTURE_REPLY_V1 ') && Buffer.byteLength(receipt.raw) <= 16384, 'Missing original native stderr receipt');
      assert.equal(receipt.pid, helper.pid); assert.equal(receipt.operation, method); assert.equal(receipt.recordRaw, text);
      assert.ok(integer(receipt.generation) && typeof receipt.sequence === 'string' && /^[1-9][0-9]{0,3}$/.test(receipt.sequence), 'Invalid transport provenance');
      assert.ok(BigInt(receipt.sequence) > transportSequence && BigInt(receipt.sequence) <= 4000n, 'Replayed transport receipt'); transportSequence = BigInt(receipt.sequence);
      if (transportGeneration === undefined) transportGeneration = receipt.generation;
      else assert.equal(receipt.generation, transportGeneration, 'Native process generation changed');
      const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
      assert.deepEqual(Object.keys(wrapper).sort(), ['producer', 'version', 'pid', 'windowId', 'sequence', 'operation', 'record'].sort());
      assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1);
      assert.equal(wrapper.pid, helper.pid); assert.equal(wrapper.sequence, receipt.sequence); assert.equal(wrapper.operation, method);
      assert.equal(JSON.stringify(wrapper.record), text);
      const record = JSON.parse(text);
      assert.equal(wrapper.windowId, record.scope?.windowId, 'Native receipt owner mismatch');
      if (record.status === 'refused') throw new Error('Original native organization work refusal');
      return record;
    };
    const seen = new Set(), workIds = new Set(); let previousSequence = 0, previousEnd = 0, owner;
    for (let index = 0; index < trials; index++) {
      const attempt = { trial: index + 1, stage: 'setup', status: 'running' }; report.attempts.push(attempt);
      let armed = false, completion;
      try {
        await power(); await verify(); await prepareTrial(index);
        attempt.stage = 'arm';
        const readyRaw = await transport.invoke(operations[metric]); armed = true;
        const ready = decode(operations[metric], readyRaw, attempt, "ready"); attempt.ready = ready;
        assert.equal(ready.status, "ready");
        assert.equal(ready?.producer, 'aux-native-organization-work-v1'); assert.equal(ready.version, 1);
        assert.equal(ready.pid, helper.pid); assert.equal(ready.operation, operations[metric]);
        const scope = ready.scope;
        assert.ok(scope && token(scope.requestNonce) && integer(scope.sampleSequence) && integer(scope.windowId) && integer(scope.rendererPid) && token(scope.documentToken) && integer(scope.nativeDocumentGeneration), 'Missing exact native scope');
        assert.equal(scope.metric, metric); assert.ok(scope.sampleSequence > previousSequence, 'Replayed/reversed native sequence');
        assert.ok(!seen.has(scope.requestNonce), 'Replayed native scope'); seen.add(scope.requestNonce); previousSequence = scope.sampleSequence;
        const currentOwner = { windowId: scope.windowId, rendererPid: scope.rendererPid, documentToken: scope.documentToken, nativeDocumentGeneration: scope.nativeDocumentGeneration };
        if (owner) assert.deepEqual(currentOwner, owner, 'Native owner/document changed'); else owner = currentOwner;
        // Reserve the native one-use read before work. It awaits the fresh
        // measure/actual final task; helper polling cannot skip to a later cycle.
        completion = transport.invoke('completeOrganizationWork', 30000).then(
          text => ({ text }), error => ({ error }));
        attempt.stage = 'real-work'; await performWork(index);
        attempt.stage = 'native-read';
        const finished = await completion; armed = false;
        if (finished.error) throw finished.error;
        const rawText = finished.text;
        const raw = decode('completeOrganizationWork', rawText, attempt, 'measured'); attempt.raw = raw;
        assert.equal(raw.status, 'measured');
        assert.equal(raw?.producer, ready.producer); assert.equal(raw.version, 1); assert.equal(raw.pid, helper.pid);
        assert.equal(raw.operation, 'completeOrganizationWork'); assert.deepEqual(raw.scope, scope, 'Receipt scope changed');
        const sample = raw.sample, work = raw.work;
        assert.ok(sample && ['startMs', 'durationMs', 'durationUpperBoundMs', 'completedThroughMs', 'maximumTaskMs', 'maximumLongTaskMs'].every(key => number(sample[key])), 'Invalid native measurement');
        assert.ok(sample.durationUpperBoundMs > sample.durationMs, 'Missing privacy resolution bound');
        assert.equal(sample.longTaskCoverage, true, 'Missing native task coverage');
        assert.ok(integer(sample.completedTasks) && sample.completedTasks <= 4096, 'Missing/overflowed native completed tasks');
        assert.ok(Number.isInteger(sample.overlappingLongTasks) && sample.overlappingLongTasks >= 0, 'Invalid native long-task count');
        assert.ok(sample.completedThroughMs >= sample.startMs + sample.durationUpperBoundMs, 'Read preceded final task completion');
        assert.ok(sample.startMs > previousEnd, 'Overlapping/replayed work interval'); previousEnd = sample.startMs + sample.durationUpperBoundMs;
        assert.ok(work && work.committed === true && integer(work.units) && uuid(work.operationId), 'Empty/unfinished work cannot qualify');
        assert.ok(!workIds.has(work.operationId), 'Replayed work receipt'); workIds.add(work.operationId);
        if (metric === 'auto-archive') {
          assert.equal(work.kind, 'nativeArchiveBatch'); assert.ok(work.units <= 20, 'Archive batch exceeded20');
          assert.ok(Array.isArray(work.batchIds) && work.batchIds.length === work.units && work.batchIds.every(uuid), 'Missing genuine committed native archive batches');
        } else {
          assert.equal(work.kind, 'runtimeLiveFolderRender');
          assert.ok(integer(work.runtimePid) && work.runtimePid !== scope.rendererPid && work.runtimePid !== helper.pid, 'Source refresh not proven off the UI thread');
          assert.equal(work.rowsCommitted, true, 'Refresh omitted renderer response/React commit');
          assert.ok(work.units <= 25, 'Live folder exceeded25 rows');
        }
        await power(); await verify(); report.measurements.push(raw); attempt.status = 'passed';
        assert.equal(sample.overlappingLongTasks, 0, 'Actual overlapping long task');
        assert.ok(sample.maximumTaskMs <= 50, 'Actual renderer task exceeded50ms');
        if (metric === 'auto-archive') assert.ok(sample.durationUpperBoundMs <= 50, 'Whole asynchronous archive cycle exceeded50ms');
      } catch (error) { attempt.status = 'failed'; attempt.error = error.message; throw error; }
      finally {
        if (armed) {
          // The fixed completion endpoint retires exact armed scope on every refusal.
          try {
            if (completion) { const finished = await completion; if (finished.error) attempt.cleanupError = finished.error.message;
              else attempt.cleanup = finished.text; }
            else attempt.cleanup = await transport.invoke('completeOrganizationWork', 30000);
          }
          catch (error) { attempt.cleanupError = error.message; }
        }
      }
    }
    report.maximumTaskMs = Math.max(...report.measurements.map(row => row.sample.maximumTaskMs));
    report.maximumCycleUpperBoundMs = Math.max(...report.measurements.map(row => row.sample.durationUpperBoundMs));
    report.status = 'measured'; return report;
  } catch (error) {
    report.status = 'failed'; report.error = error.message;
    const failure = new Error(`Native organization performance refused: ${error.message}`, { cause: error }); failure.report = report; throw failure;
  } finally { report.completedAt = new Date().toISOString(); }
}
