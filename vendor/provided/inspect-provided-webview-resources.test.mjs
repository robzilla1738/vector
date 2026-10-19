import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { inspectWebviewPak } from './inspect-provided-webview-resources.mjs';
test('static PAK v5 scan decodes plain, gzip and Chromium8-byte Brotli headers without executing payloads', () => {
  const plain = Buffer.from('authored attachGuest fixture'), gzip = gzipSync(Buffer.from('authored attachTab fixture')), decoded = Buffer.from('authored expose-wv fixture'), header = Buffer.alloc(8); header[0] = 0x1e; header[1] = 0x9b; header.writeUIntLE(decoded.length, 2, 6);
  const entries = [plain, gzip, Buffer.concat([header, brotliCompressSync(decoded)])], index = Buffer.alloc(12 + 4 * 6); index.writeUInt32LE(5); index.writeUInt16LE(3, 8); let offset = index.length;
  entries.forEach((b, i) => { index.writeUInt16LE(100 + i, 12 + i * 6); index.writeUInt32LE(offset, 14 + i * 6); offset += b.length; }); index.writeUInt32LE(offset, 14 + 3 * 6);
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'aux-pak-static-fixture-')));
  try { const p = path.join(dir, 'fixture.pak'); fs.writeFileSync(p, Buffer.concat([index, ...entries])); const r = inspectWebviewPak(p); assert.deepEqual(r.codecCounts, { plain: 1, gzip: 1, brotli: 1 }); assert.equal(r.failures.length, 0); assert.equal(r.matches.attachTab[0].id, 101); assert.equal(r.matches['expose-wv'][0].id, 102); assert.equal(r.codeEvaluated, false);
    const bad = Buffer.concat([index, ...entries]); bad.writeUInt32LE(bad.length + 1, 14 + 3 * 6); fs.writeFileSync(p, bad); assert.throws(() => inspectWebviewPak(p));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
