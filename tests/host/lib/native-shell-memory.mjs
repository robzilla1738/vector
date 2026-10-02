import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { validateAppearanceCandidate } from './appearance-provenance.mjs';

const decimal = value => typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value) && BigInt(value) <= 18446744073709551615n;
const scope = ['windowId', 'widgetRoutingId', 'rendererPid', 'requestNonce', 'processUuid', 'processStartAbsolute'];
export function validateShellMemorySample(raw) {
  assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) <= 4096, 'Missing bounded native memory sample');
  const row = JSON.parse(raw);
  assert.equal(row.producer, 'aux-native-shell-memory'); assert.equal(row.version, 1);
  assert.equal(row.status, 'sampled', `Native memory refused: ${row.reason}`); assert.equal(row.reason, 'sampled');
  assert.deepEqual(Object.keys(row).sort(), ['producer', 'version', 'status', 'reason', ...scope,
    'sampleSequence', 'sampleStartUs', 'sampleEndUs', 'physicalFootprintBytes'].sort());
  for (const key of ['windowId', 'widgetRoutingId', 'rendererPid']) assert.ok(Number.isInteger(row[key]) && row[key] > 0 && row[key] <= 0x7fffffff, `Invalid native ${key}`);
  for (const key of ['requestNonce', 'processUuid']) assert.match(row[key] ?? '', /^[a-f0-9]{32}$/i, `Missing native ${key}`);
  assert.notEqual(row.processUuid, '0'.repeat(32), 'Unavailable kernel process UUID');
  for (const key of ['sampleSequence', 'processStartAbsolute', 'sampleStartUs', 'sampleEndUs', 'physicalFootprintBytes']) assert.ok(decimal(row[key]), `Invalid native ${key}`);
  assert.ok(BigInt(row.sampleEndUs) >= BigInt(row.sampleStartUs), 'Reversed kernel sampling interval');
  return row;
}

/** Fixed native-owned shell renderer, kernel physical footprint; never JS heap or RSS estimates. */
export async function collectShellMemory({ transport, browserPid, candidate, readIdentity, setup,
  trials = 20, readPower = () => execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8', timeout: 5000 }) }) {
  const report = { schema: 1, metric: 'shell-memory', endpoint: 'owned current shell renderer kernel physical footprint',
    candidate: structuredClone(candidate), attempts: [], samplesBytes: [], status: 'running' };
  try {
    validateAppearanceCandidate(candidate);
    assert.ok(Number.isInteger(browserPid) && browserPid > 0 && Number.isInteger(trials) && trials >= 20 && trials <= 100);
    assert.ok(typeof transport?.invoke === 'function' && typeof readIdentity === 'function' && typeof setup === 'function');
    const verify = async () => {
      const identity = await readIdentity(); assert.deepEqual(identity.runtime, candidate.productIdentity);
      for (const key of ['sourceCommit', 'buildId', 'manifestHash']) assert.equal(identity.native?.[key], candidate.native[key]);
      const power = await readPower(); assert.match(power, /Now drawing from 'AC Power'/, 'Actual AC required');
      return { identity, power };
    };
    let owned, generation, sequence = 0n, receiptSequence = 0n, previousEnd = 0n;
    for (let index = 0; index < trials; index++) {
      const attempt = { trial: index + 1, status: 'running' }; report.attempts.push(attempt);
      await setup(index); attempt.before = await verify();
      attempt.raw = await transport.invoke('sampleShellMemory');
      const receipt = transport.lastReceipt; attempt.receipt = structuredClone(receipt);
      assert.ok(receipt && typeof receipt.raw === 'string' && Buffer.byteLength(receipt.raw) <= 16384);
      assert.equal(receipt.pid, browserPid); assert.equal(receipt.operation, 'sampleShellMemory'); assert.equal(receipt.recordRaw, attempt.raw);
      assert.ok(Number.isInteger(receipt.generation) && receipt.generation > 0 && decimal(receipt.sequence));
      assert.ok(BigInt(receipt.sequence) > receiptSequence, 'Replayed native receipt'); receiptSequence = BigInt(receipt.sequence);
      assert.ok(receipt.raw.startsWith('AUX_NATIVE_FIXTURE_REPLY_V1 '));
      const wrapper = JSON.parse(receipt.raw.slice('AUX_NATIVE_FIXTURE_REPLY_V1 '.length));
      assert.equal(wrapper.producer, 'aux-native-fixture-reply'); assert.equal(wrapper.version, 1);
      assert.equal(wrapper.pid, browserPid); assert.equal(wrapper.operation, 'sampleShellMemory'); assert.equal(wrapper.sequence, receipt.sequence);
      assert.equal(JSON.stringify(wrapper.record), attempt.raw);
      const row = validateShellMemorySample(attempt.raw);
      assert.equal(wrapper.windowId, row.windowId);
      const actual = Object.fromEntries(scope.map(key => [key, row[key]]));
      if (owned) { assert.deepEqual(actual, owned, 'Native shell/process scope changed'); assert.equal(receipt.generation, generation, 'Native child changed'); }
      else { owned = actual; generation = receipt.generation; }
      assert.ok(BigInt(row.sampleSequence) > sequence, 'Replayed kernel sample'); sequence = BigInt(row.sampleSequence);
      assert.ok(BigInt(row.sampleStartUs) > previousEnd, 'Overlapping kernel sample'); previousEnd = BigInt(row.sampleEndUs);
      attempt.after = await verify(); attempt.sha256 = createHash('sha256').update(receipt.raw).digest('hex');
      report.samplesBytes.push(row.physicalFootprintBytes); attempt.status = 'sampled';
    }
    report.maxBytes = String(report.samplesBytes.reduce((max, value) => BigInt(value) > max ? BigInt(value) : max, 0n));
    report.budgetBytes = 150_000_000;
    assert.ok(BigInt(report.maxBytes) <= BigInt(report.budgetBytes), 'Shell kernel footprint exceeds150MB');
    report.status = 'measured'; return report;
  } catch (error) {
    report.status = 'failed'; report.error = error.message;
    if (error.nativeRaw) report.transportRefusalRaw = error.nativeRaw;
    const failure = new Error(`Shell memory refused: ${error.message}`, { cause: error }); failure.report = report; throw failure;
  }
}
