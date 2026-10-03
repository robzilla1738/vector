import assert from 'node:assert/strict';
import { createHash, createPublicKey, verify } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

const keys = (value, expected) => assert.deepEqual(Object.keys(value).sort(), [...expected].sort());
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const headerKeys = ['producer', 'version', 'pid', 'processUuid', 'processStartMachTicks', 'buildId', 'sourceCommit', 'nonce', 'basename', 'rootDevice', 'rootInode', 'profileName', 'profileDevice', 'profileInode', 'fileDevice', 'fileInode', 'publicKeySpkiHex'];
const decimal = value => typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value) && BigInt(value) <= 18446744073709551615n;
function header(value) {
  keys(value, headerKeys);
  assert.equal(value.producer, 'aux-native-appearance-file-channel'); assert.equal(value.version, 1);
  assert.ok(Number.isSafeInteger(value.pid) && value.pid > 0 && value.pid <= 2147483647);
  assert.match(value.processUuid, /^[a-f0-9]{32}$/); assert.notEqual(value.processUuid, '0'.repeat(32));
  assert.ok(decimal(value.processStartMachTicks)); assert.match(value.sourceCommit, /^[a-f0-9]{40}$/);
  assert.ok(typeof value.buildId === 'string' && value.buildId.length > 0 && value.buildId.length <= 200);
  assert.match(value.nonce, /^[a-f0-9]{32}$/); assert.equal(value.basename, 'native-appearance-channel.jsonl'); assert.equal(value.profileName, 'Default');
  for (const name of ['rootDevice', 'rootInode', 'profileDevice', 'profileInode', 'fileDevice', 'fileInode']) assert.ok(decimal(value[name]));
  assert.match(value.publicKeySpkiHex, /^[a-f0-9]{88}$/);
  const bytes = Buffer.from(value.publicKeySpkiHex, 'hex');
  const key = createPublicKey({ key: bytes, format: 'der', type: 'spki' });
  assert.equal(key.asymmetricKeyType, 'ed25519'); assert.deepEqual(key.export({ format: 'der', type: 'spki' }), bytes);
  return key;
}
function parse(raw) {
  const parsed = JSON.parse(raw); let offset = 0;
  const space = () => { while (offset < raw.length && /\s/.test(raw[offset])) offset++; };
  const string = () => {
    const start = offset++; assert.equal(raw[start], '"');
    while (offset < raw.length) {
      if (raw[offset++] === '\\') offset++;
      else if (raw[offset - 1] === '"') return JSON.parse(raw.slice(start, offset));
    }
    throw new Error('Incomplete original native string');
  };
  space(); assert.equal(raw[offset++], '{'); space(); const seen = new Set();
  if (raw[offset] !== '}') for (;;) {
    space(); const name = string(); assert.ok(!seen.has(name), 'Duplicate original native file field'); seen.add(name);
    space(); assert.equal(raw[offset++], ':'); space();
    if (raw[offset] === '"') string();
    else { const value = /^(?:null|true|false|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(raw.slice(offset)); assert.ok(value, 'Native file records must be flat'); offset += value[0].length; }
    space(); if (raw[offset] === '}') break; assert.equal(raw[offset++], ',');
  }
  assert.equal(raw[offset++], '}'); space(); assert.equal(offset, raw.length); return parsed;
}

/** Framing/signature validation only, not native admission. Caller must supply
 * original authenticated capability receipt plus retained FD/process/byte leases;
 * a self-declared file header never supplies a verification key or authority. */
export function createAppearanceFileRecordDecoder(guardedCapabilityReceipt) {
  const receipt = structuredClone(guardedCapabilityReceipt);
  keys(receipt, [...headerKeys, 'headerSha256']); assert.match(receipt.headerSha256, /^[a-f0-9]{64}$/);
  const expectedHeader = { ...receipt }; delete expectedHeader.headerSha256;
  const key = header(expectedHeader), decoder = new TextDecoder('utf-8', { fatal: true });
  let pending = Buffer.alloc(0), total = 0, sequence = 0, seenHeader = false, failure, retired = false;
  return Object.freeze({
    write(input) {
      assert.ok(!retired, 'Original appearance file decoder retired'); if (failure) throw failure;
      try {
        assert.ok(Buffer.isBuffer(input) || input instanceof Uint8Array);
        const bytes = Buffer.from(input); total += bytes.length;
        assert.ok(total <= 2 * 1024 * 1024, 'Original appearance file lifetime byte bound exceeded');
        pending = Buffer.concat([pending, bytes]); const records = [];
        let end;
        while ((end = pending.indexOf(10)) !== -1) {
          const frame = pending.subarray(0, end + 1); pending = pending.subarray(end + 1);
          assert.ok(frame.length <= (seenHeader ? 32768 : 4096), 'Original appearance file wire frame bound exceeded');
          const raw = decoder.decode(frame.subarray(0, -1));
          if (!seenHeader) {
            assert.equal(digest(frame), receipt.headerSha256, 'Original guarded native header bytes differ');
            assert.ok(isDeepStrictEqual(parse(raw), expectedHeader), 'Original guarded native capability/header differs'); seenHeader = true; continue;
          }
          const envelope = parse(raw); keys(envelope, ['payload', 'signatureHex']);
          assert.equal(typeof envelope.payload, 'string'); assert.match(envelope.signatureHex, /^[a-f0-9]{128}$/);
          assert.ok(verify(null, Buffer.from(`AUX_NATIVE_APPEARANCE_FILE_V1\n${envelope.payload}`), key, Buffer.from(envelope.signatureHex, 'hex')), 'Original native record signature invalid');
          const record = parse(envelope.payload); keys(record, ['producer', 'version', 'nonce', 'sequence', 'raw']);
          assert.equal(record.producer, 'aux-native-appearance-file-record'); assert.equal(record.version, 1); assert.equal(record.nonce, receipt.nonce);
          assert.equal(record.sequence, sequence + 1, 'Original native record sequence is duplicate or out of order'); assert.ok(record.sequence <= 4000);
          assert.equal(typeof record.raw, 'string'); assert.ok(Buffer.byteLength(record.raw) > 0 && Buffer.byteLength(record.raw) <= 4096);
          // Preserve original getter bytes. Full native snapshot normalization and
          // before/after document/window/process fences belong to provenance.
          sequence = record.sequence; records.push(Object.freeze({ sequence, raw: record.raw, signedPayload: envelope.payload, rawFrameBase64: frame.toString('base64') }));
        }
        assert.ok(pending.length <= (seenHeader ? 32768 : 4096), 'Original incomplete native frame bound exceeded'); return records;
      } catch (error) { failure = error; throw error; }
    },
    retire() { retired = true; pending = Buffer.alloc(0); },
    finish() { assert.ok(!retired && !failure && seenHeader && pending.length === 0, 'Original native file framing incomplete or failed'); },
  });
}

/** Replay one originally signed capture record. Native sequence continuity is
 * checked by the live reader; capture verification retains its original value. */
export function verifyAppearanceFileRecord({ header: receipt, originalHeaderBase64, rawFrameBase64, signedPayload, sequence, raw }) {
  keys(receipt, [...headerKeys, 'headerSha256']);
  const expected = { ...receipt }; delete expected.headerSha256;
  const key = header(expected), decoder = new TextDecoder('utf-8', { fatal: true });
  const bytes = value => { assert.equal(typeof value, 'string'); const b = Buffer.from(value, 'base64'); assert.equal(b.toString('base64'), value); return b; };
  const h = bytes(originalHeaderBase64), frame = bytes(rawFrameBase64);
  assert.ok(h.length <= 4096 && h.at(-1) === 10 && h.indexOf(10) === h.length - 1);
  assert.equal(digest(h), receipt.headerSha256); assert.deepEqual(parse(decoder.decode(h.subarray(0, -1))), expected);
  assert.ok(frame.length <= 32768 && frame.at(-1) === 10 && frame.indexOf(10) === frame.length - 1);
  const envelope = parse(decoder.decode(frame.subarray(0, -1))); keys(envelope, ['payload', 'signatureHex']);
  assert.equal(envelope.payload, signedPayload); assert.match(envelope.signatureHex, /^[a-f0-9]{128}$/);
  assert.ok(verify(null, Buffer.from(`AUX_NATIVE_APPEARANCE_FILE_V1\n${envelope.payload}`), key, Buffer.from(envelope.signatureHex, 'hex')), 'Original native record signature invalid');
  const record = parse(envelope.payload); keys(record, ['producer', 'version', 'nonce', 'sequence', 'raw']);
  assert.equal(record.producer, 'aux-native-appearance-file-record'); assert.equal(record.version, 1); assert.equal(record.nonce, receipt.nonce);
  assert.ok(Number.isInteger(record.sequence) && record.sequence > 0 && record.sequence <= 4000); assert.equal(record.sequence, sequence);
  assert.equal(record.raw, raw); assert.ok(typeof raw === 'string' && Buffer.byteLength(raw) > 0 && Buffer.byteLength(raw) <= 4096);
  return raw;
}
