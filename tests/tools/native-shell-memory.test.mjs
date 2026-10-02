// Synthetic protocol records only; no native memory/AC performance qualification.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectShellMemory, validateShellMemorySample } from '../host/lib/native-shell-memory.mjs';
const candidate = {
  productIdentity: { commit: 'a'.repeat(40), tree: 'b'.repeat(40), label: 'a'.repeat(40), dirty: false },
  native: { sourceCommit: 'a'.repeat(40), buildId: 'synthetic', manifestHash: 'c'.repeat(64) },
  shellDigest: 'd'.repeat(64), harnessCommit: 'e'.repeat(40), moduleSha256: 'f'.repeat(64),
};
function fixture() {
  const f = { calls: 0, mutate: row => row };
  const transport = { async invoke(operation) {
    assert.equal(operation, 'sampleShellMemory');
    const index = ++f.calls;
    const row = f.mutate({ producer: 'aux-native-shell-memory', version: 1, status: 'sampled', reason: 'sampled',
      windowId: 9, widgetRoutingId: 3, rendererPid: 42, requestNonce: '1'.repeat(32), processUuid: '2'.repeat(32),
      processStartAbsolute: '1000', sampleSequence: String(index), sampleStartUs: String(index * 1000),
      sampleEndUs: String(index * 1000 + 10), physicalFootprintBytes: '149999999' });
    const recordRaw = JSON.stringify(row);
    const wrapper = { producer: 'aux-native-fixture-reply', version: 1, pid: 41, windowId: row.windowId,
      operation, sequence: String(index), record: row };
    this.lastReceipt = { pid: 41, generation: 1, operation, sequence: String(index), recordRaw,
      raw: 'AUX_NATIVE_FIXTURE_REPLY_V1 ' + JSON.stringify(wrapper) };
    return recordRaw;
  } };
  f.options = { candidate, browserPid: 41, transport, setup: async () => {},
    readIdentity: async () => ({ runtime: candidate.productIdentity, native: candidate.native }),
    readPower: async () => "Now drawing from 'AC Power'" };
  return f;
}
test('retains20 bounded kernel-shaped originals and exact decimal150MB limit', async () => {
  const f = fixture(), report = await collectShellMemory(f.options);
  assert.equal(f.calls, 20); assert.equal(report.status, 'measured'); assert.equal(report.maxBytes, '149999999');
  assert.equal(report.budgetBytes, 150_000_000); assert.ok(report.attempts.every(row => row.raw && row.receipt.raw && row.sha256));
});
test('one byte over budget refuses without rounding or losing raw receipts', async () => {
  const f = fixture(); f.mutate = row => ({ ...row, physicalFootprintBytes: row.sampleSequence === '20' ? '150000001' : '100000000' });
  await assert.rejects(collectShellMemory(f.options), error => error.report.maxBytes === '150000001' && error.report.attempts.length === 20 && error.report.status === 'failed');
});
for (const [name, mutate] of [
  ['zero UUID', row => ({ ...row, processUuid: '0'.repeat(32) })],
  ['missing footprint', row => ({ ...row, physicalFootprintBytes: '0' })],
  ['numeric precision loss', row => ({ ...row, physicalFootprintBytes: 149999999 })],
  ['reversed sample clock', row => ({ ...row, sampleEndUs: '1' })],
  ['replayed sequence', row => ({ ...row, sampleSequence: '1' })],
  ['reused PID process start', row => ({ ...row, processStartAbsolute: row.sampleSequence })],
  ['different owned renderer', row => ({ ...row, rendererPid: Number(row.sampleSequence) })],
]) test(`${name} refuses with original record retained`, async () => {
  const f = fixture(); f.mutate = mutate;
  await assert.rejects(collectShellMemory(f.options), error => error.report.attempts.at(-1).raw && error.report.status === 'failed');
});
test('original native refusal is retained', async () => {
  const f = fixture(); f.mutate = () => ({ producer: 'aux-native-shell-memory', version: 1, status: 'refused', reason: 'kernel_memory_unavailable' });
  await assert.rejects(collectShellMemory(f.options), error => error.report.attempts[0].raw.includes('kernel_memory_unavailable') && error.message.includes('kernel_memory_unavailable'));
});
test('foreign child receipt refuses before sample acceptance', async () => {
  const f = fixture(), invoke = f.options.transport.invoke;
  f.options.transport.invoke = async function (...args) { const raw = await invoke.apply(this, args); this.lastReceipt.pid = 77; return raw; };
  await assert.rejects(collectShellMemory(f.options), error => error.report.samplesBytes.length === 0);
});
test('battery, dirty identity and short trial series refuse before native input', async () => {
  const f = fixture();
  await assert.rejects(collectShellMemory({ ...f.options, trials: 19 }));
  await assert.rejects(collectShellMemory({ ...f.options, readPower: async () => "Now drawing from 'Battery Power'" }), /AC required/);
  await assert.rejects(collectShellMemory({ ...f.options, readIdentity: async () => ({ native: candidate.native, runtime: { ...candidate.productIdentity, dirty: true } }) }));
  assert.equal(f.calls, 0);
});
test('parser refuses additional fields instead of trusting caller estimates', () => {
  assert.throws(() => validateShellMemorySample(JSON.stringify({ producer: 'aux-native-shell-memory', version: 1, status: 'sampled', reason: 'sampled', estimatedRss: 100 })));
});
