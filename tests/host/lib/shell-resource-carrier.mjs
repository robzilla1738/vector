import assert from 'node:assert/strict';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';
import { pairHash } from './packaged-runtime-pair-protocol.mjs';
const limit = 64 * 1024 * 1024;
/** Exact v4/v5 DataPack layout from original GRIT data_pack.py. Parsing stored
 * bytes alone proves neither deployment nor an input/transformation join. */
export function readShellResourceCarrier(original) {
  assert.ok(Buffer.isBuffer(original) && original.length >= 9 && original.length <= limit);
  const bytes = Buffer.from(original), version = bytes.readUInt32LE(0);
  assert.ok(version === 4 || version === 5, 'Unsupported original DataPack version');
  const header = version === 4 ? 9 : 12;
  assert.ok(bytes.length >= header);
  const encoding = bytes.readUInt8(version === 4 ? 8 : 4);
  assert.ok(encoding <= 2, 'Unsupported original DataPack encoding');
  if (version === 5) assert.equal(bytes.subarray(5, 8).equals(Buffer.alloc(3)), true, 'Nonzero DataPack header padding');
  const count = version === 4 ? bytes.readUInt32LE(4) : bytes.readUInt16LE(8);
  const aliasCount = version === 4 ? 0 : bytes.readUInt16LE(10);
  assert.ok(count > 0 && count + aliasCount <= 65535, 'Invalid DataPack resource count');
  const tableEnd = header + (count + 1) * 6 + aliasCount * 4;
  assert.ok(tableEnd <= bytes.length, 'Truncated DataPack index');
  const rows = [], resources = new Map();
  let previousId = 0, previousOffset = tableEnd;
  for (let index = 0; index <= count; index++) {
    const position = header + index * 6;
    const id = bytes.readUInt16LE(position), offset = bytes.readUInt32LE(position + 2);
    assert.ok(offset >= previousOffset && offset <= bytes.length, 'Invalid original DataPack offset');
    if (index === 0) assert.equal(offset, tableEnd, 'Unaccounted DataPack data prefix');
    if (index < count) assert.ok(id > previousId, 'Duplicate or unordered resource ID');
    else { assert.equal(id, 0, 'Invalid DataPack sentinel'); assert.equal(offset, bytes.length, 'Unaccounted DataPack data suffix'); }
    rows.push({ id, offset }); previousId = id; previousOffset = offset;
  }
  for (let index = 0; index < count; index++) resources.set(rows[index].id, bytes.subarray(rows[index].offset, rows[index + 1].offset));
  const aliases = []; previousId = 0;
  for (let index = 0; index < aliasCount; index++) {
    const position = header + (count + 1) * 6 + index * 4;
    const id = bytes.readUInt16LE(position), target = bytes.readUInt16LE(position + 2);
    assert.ok(id > previousId && !resources.has(id) && target < count, 'Invalid original DataPack alias');
    const targetId = rows[target].id; resources.set(id, resources.get(targetId));
    aliases.push(Object.freeze({ id, targetId })); previousId = id;
  }
  const decodedPayloads = new Set(); let totalDecodedBytes = 0;
  return Object.freeze({ version, encoding, sha256: pairHash(bytes),
    get decodedTotalBytes() { return totalDecodedBytes; },
    ids: Object.freeze([...resources.keys()].sort((a, b) => a - b)), aliases: Object.freeze(aliases),
    read(id, compression) {
      assert.ok(Number.isInteger(id) && resources.has(id), 'Missing original resource ID');
      assert.ok(['literal', 'gzip', 'brotli'].includes(compression), 'Undeclared original GRIT compression');
      const stored = resources.get(id);
      const resourceLimit = 16 * 1024 * 1024;
      assert.ok(stored.length <= resourceLimit, 'Original stored resource byte limit');
      let payload = stored, expectedSize;
      if (compression === 'brotli') {
        // GRIT base.py prefixes the actual Brotli stream with 0x1e9b and
        // the original uncompressed size as six little-endian bytes.
        assert.ok(stored.length >= 8 && stored[0] === 0x1e && stored[1] === 0x9b, 'Invalid original GRIT Brotli envelope');
        expectedSize = stored.readUIntLE(2, 6); assert.ok(expectedSize <= resourceLimit);
        payload = stored.subarray(8);
      }
      let decoded;
      if (compression === 'literal') decoded = Buffer.from(stored);
      else {
        const result = (compression === 'gzip' ? gunzipSync : brotliDecompressSync)(payload, { maxOutputLength: resourceLimit, info: true });
        assert.equal(result.engine.bytesWritten, payload.length, 'Unconsumed original compression payload');
        decoded = result.buffer;
      }
      if (expectedSize !== undefined) assert.equal(decoded.length, expectedSize, 'Original GRIT decoded size changed');
      const key = `${stored.byteOffset}:${stored.length}:${compression}`;
      if (!decodedPayloads.has(key)) {
        assert.ok(totalDecodedBytes + decoded.length <= limit, 'Total original decoded byte limit');
        decodedPayloads.add(key); totalDecodedBytes += decoded.length;
      }
      return Object.freeze({ storedSize: stored.length, storedSha256: pairHash(stored),
        decodedSize: decoded.length, decodedSha256: pairHash(decoded), bytes: decoded });
    },
  });
}
