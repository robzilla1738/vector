// Synthetic Ed25519 protocol controls only, no native channel/admission/capture.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, createHash } from 'node:crypto';
import { createAppearanceFileRecordDecoder, verifyAppearanceFileRecord } from './lib/appearance-file-records.mjs';
function fixture() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const header = { producer: 'aux-native-appearance-file-channel', version: 1, pid: 42, processUuid: 'a'.repeat(32), processStartMachTicks: '9', buildId: '132-hash-commit', sourceCommit: 'a'.repeat(40), nonce: 'b'.repeat(32), basename: 'native-appearance-channel.jsonl', rootDevice: '1', rootInode: '2', profileName: 'Default', profileDevice: '1', profileInode: '3', fileDevice: '1', fileInode: '4', publicKeySpkiHex: publicKey.export({ type: 'spki', format: 'der' }).toString('hex') };
  const rawHeader = Buffer.from(JSON.stringify(header) + '\n');
  const receipt = { ...header, headerSha256: createHash('sha256').update(rawHeader).digest('hex') };
  const frame = (sequence = 1, raw = '{"native":"original getter bytes"}', nonce = header.nonce) => {
    const payload = JSON.stringify({ producer: 'aux-native-appearance-file-record', version: 1, nonce, sequence, raw });
    return Buffer.from(JSON.stringify({ payload, signatureHex: sign(null, Buffer.from(`AUX_NATIVE_APPEARANCE_FILE_V1\n${payload}`), privateKey).toString('hex') }) + '\n');
  };
  return { rawHeader, receipt, frame };
}
test('original capability-bound key accepts split signed framing and retains exact raw getter bytes', () => {
  const f = fixture(), decoder = createAppearanceFileRecordDecoder(f.receipt), bytes = Buffer.concat([f.rawHeader, f.frame()]);
  assert.deepEqual(decoder.write(bytes.subarray(0, 7)), []);
  const [record] = decoder.write(bytes.subarray(7)); assert.equal(record.sequence, 1); assert.equal(record.raw, '{"native":"original getter bytes"}'); decoder.finish();
});
test('file header cannot self-select another signing key', () => {
  const original = fixture(), foreign = fixture(), decoder = createAppearanceFileRecordDecoder(original.receipt);
  assert.throws(() => decoder.write(foreign.rawHeader), /header bytes differ/);
});
test('payload or signature mutation permanently refuses subsequent correct frames', () => {
  for (const field of ['payload', 'signatureHex']) {
    const f = fixture(), decoder = createAppearanceFileRecordDecoder(f.receipt); decoder.write(f.rawHeader);
    const envelope = JSON.parse(f.frame()); envelope[field] = field === 'payload' ? envelope.payload.replace('original', 'modified') : '0'.repeat(128);
    assert.throws(() => decoder.write(Buffer.from(JSON.stringify(envelope) + '\n')), /signature invalid/);
    assert.throws(() => decoder.write(f.frame()), /signature invalid/);
  }
});
test('duplicate and out-of-order native sequence and foreign nonce refuse', () => {
  for (const frame of [(f) => f.frame(2), (f) => f.frame(1, '{}', 'c'.repeat(32))]) {
    const f = fixture(), decoder = createAppearanceFileRecordDecoder(f.receipt); decoder.write(f.rawHeader); assert.throws(() => decoder.write(frame(f)));
  }
  const f = fixture(), decoder = createAppearanceFileRecordDecoder(f.receipt); decoder.write(f.rawHeader); decoder.write(f.frame()); assert.throws(() => decoder.write(f.frame()), /duplicate or out of order/);
});
test('duplicate escaped envelope fields refuse even with original valid signature', () => {
  const f = fixture(), decoder = createAppearanceFileRecordDecoder(f.receipt); decoder.write(f.rawHeader);
  const raw = f.frame().toString().replace('{', '{"signatureHex":"' + '0'.repeat(128) + '",');
  assert.throws(() => decoder.write(Buffer.from(raw)), /Duplicate/);
});
test('raw and encoded wire bounds, incomplete final frame and retirement remain failures', () => {
  const f = fixture();
  for (const bytes of [f.frame(1, 'x'.repeat(4097)), Buffer.alloc(32769, 32)]) {
    const decoder = createAppearanceFileRecordDecoder(f.receipt); decoder.write(f.rawHeader); assert.throws(() => decoder.write(bytes));
  }
  const decoder = createAppearanceFileRecordDecoder(f.receipt); decoder.write(f.rawHeader); decoder.write(Buffer.from('{')); assert.throws(() => decoder.finish(), /incomplete/); decoder.retire(); assert.throws(() => decoder.write(f.frame()), /retired/);
});

test('capture proof replays exact signed bytes and original sequence without reconstruction', () => {
  const f = fixture(), decoder = createAppearanceFileRecordDecoder(f.receipt);
  const [record] = decoder.write(Buffer.concat([f.rawHeader, f.frame()]));
  const proof = { ...record, header: f.receipt, originalHeaderBase64: f.rawHeader.toString('base64') };
  assert.equal(verifyAppearanceFileRecord(proof), record.raw);
  for (const change of [{ sequence: 2 }, { raw: '{}' }, { signedPayload: record.signedPayload + ' ' }, { originalHeaderBase64: Buffer.from('{}\n').toString('base64') }])
    assert.throws(() => verifyAppearanceFileRecord({ ...proof, ...change }));
});
