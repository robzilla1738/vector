// Synthetic DataPack/compression controls, never generated or deployed evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { readShellResourceCarrier } from './lib/shell-resource-carrier.mjs';
function pack(version, values, aliases = []) {
  const header = version === 4 ? 9 : 12;
  const start = header + (values.length + 1) * 6 + aliases.length * 4;
  const bytes = Buffer.alloc(start + values.reduce((sum, [, value]) => sum + value.length, 0));
  bytes.writeUInt32LE(version);
  if (version === 4) bytes.writeUInt32LE(values.length, 4);
  else { bytes.writeUInt16LE(values.length, 8); bytes.writeUInt16LE(aliases.length, 10); }
  let offset = start;
  for (let index = 0; index < values.length; index++) {
    const [id, value] = values[index]; bytes.writeUInt16LE(id, header + index * 6); bytes.writeUInt32LE(offset, header + index * 6 + 2);
    value.copy(bytes, offset); offset += value.length;
  }
  bytes.writeUInt32LE(offset, header + values.length * 6 + 2);
  for (let index = 0; index < aliases.length; index++) {
    const position = header + (values.length + 1) * 6 + index * 4;
    bytes.writeUInt16LE(aliases[index][0], position); bytes.writeUInt16LE(aliases[index][1], position + 2);
  }
  return bytes;
}
test('actual-layout v4 and v5 stored resources, aliases and declared compression decode exactly', () => {
  const text = Buffer.from('controlled resource');
  const brotli = Buffer.alloc(8); brotli[0] = 0x1e; brotli[1] = 0x9b; brotli.writeUIntLE(text.length, 2, 6);
  for (const version of [4, 5]) {
    const source = pack(version, [[1, text], [3, gzipSync(text)], [5, Buffer.concat([brotli, brotliCompressSync(text)])]], version === 5 ? [[7, 0]] : []);
    const carrier = readShellResourceCarrier(source); source.fill(0);
    assert.deepEqual(carrier.read(1, 'literal').bytes, text);
    assert.deepEqual(carrier.read(3, 'gzip').bytes, text);
    assert.deepEqual(carrier.read(5, 'brotli').bytes, text);
    if (version === 5) assert.deepEqual(carrier.read(7, 'literal').bytes, text);
    carrier.read(1, 'literal').bytes.fill(0);
    assert.deepEqual(carrier.read(1, 'literal').bytes, text);
  }
});
test('duplicate, foreign alias, truncated, partial and unsupported carrier layouts refuse', () => {
  const original = pack(5, [[1, Buffer.from('a')], [3, Buffer.from('b')]], [[7, 0]]);
  for (const change of [b => b.writeUInt32LE(6), b => b.writeUInt16LE(1, 18),
    b => b.writeUInt32LE(b.length + 1, 20), b => b.writeUInt32LE(0, 14),
    b => b.writeUInt16LE(9, 24), b => b.writeUInt16LE(1, 30), b => b.writeUInt16LE(2, 32)]) {
    const bytes = Buffer.from(original); change(bytes); assert.throws(() => readShellResourceCarrier(bytes));
  }
  assert.throws(() => readShellResourceCarrier(original.subarray(0, -1)));
  const carrier = readShellResourceCarrier(original);
  assert.throws(() => carrier.read(2, 'literal'));
  assert.throws(() => carrier.read(1, 'automatic'));
  assert.throws(() => carrier.read(1, 'gzip'));
});

test('original GRIT Brotli framing, size and bounded expansion remain mandatory', () => {
  const text = Buffer.from('controlled');
  assert.throws(() => readShellResourceCarrier(pack(5, [[1, brotliCompressSync(text)]])).read(1, 'brotli'));
  const header = Buffer.alloc(8); header[0] = 0x1e; header[1] = 0x9b; header.writeUIntLE(text.length + 1, 2, 6);
  assert.throws(() => readShellResourceCarrier(pack(5, [[1, Buffer.concat([header, brotliCompressSync(text)])]])).read(1, 'brotli'));
  header.writeUIntLE(16 * 1024 * 1024 + 1, 2, 6);
  assert.throws(() => readShellResourceCarrier(pack(5, [[1, header]])).read(1, 'brotli'));
  assert.throws(() => readShellResourceCarrier(pack(5, [[1, gzipSync(Buffer.alloc(16 * 1024 * 1024 + 1))]] )).read(1, 'gzip'));
});

test('bounded decoding must consume the entire original gzip/Brotli stream', () => {
  const text = Buffer.from('controlled');
  const envelope = Buffer.alloc(8); envelope[0] = 0x1e; envelope[1] = 0x9b; envelope.writeUIntLE(text.length, 2, 6);
  for (const [kind, original] of [['gzip', gzipSync(text)], ['brotli', Buffer.concat([envelope, brotliCompressSync(text)])]]) {
    assert.deepEqual(readShellResourceCarrier(pack(5, [[1, original]])).read(1, kind).bytes, text);
    for (const suffix of [Buffer.from([0]), Buffer.from([0, 0, 0]), Buffer.from([1])])
      assert.throws(() => readShellResourceCarrier(pack(5, [[1, Buffer.concat([original, suffix])]])).read(1, kind));
  }
});
