// Bounded offline PAK inspection only; no resource/native code is evaluated.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
const sha = b => createHash('sha256').update(b).digest('hex');
const limit = 64 * 1024 * 1024;
const needles = ['attachTab', 'expose-wv', 'webViewInternal', 'attachGuest', 'createGuest'];
export function inspectWebviewPak(file) {
  const st = fs.lstatSync(file);
  if (!st.isFile() || st.isSymbolicLink() || st.size > limit) throw Error('Bounded regular PAK required');
  const data = fs.readFileSync(file), version = data.readUInt32LE(0);
  let header, count, aliases, encoding;
  if (version === 5) { header = 12; encoding = data[4]; count = data.readUInt16LE(8); aliases = data.readUInt16LE(10); }
  else if (version === 4) { header = 9; count = data.readUInt32LE(4); encoding = data[8]; aliases = 0; }
  else throw Error('Unsupported PAK version');
  if (count > 65535 || header + (count + 1) * 6 + aliases * 4 > data.length) throw Error('Invalid PAK index');
  const matches = Object.fromEntries(needles.map(n => [n, []])), failures = [], codecCounts = { plain: 0, gzip: 0, brotli: 0 };
  let decodedBytes = 0;
  for (let i = 0; i < count; i++) {
    const index = header + i * 6, id = data.readUInt16LE(index), start = data.readUInt32LE(index + 2), end = data.readUInt32LE(index + 8);
    if (end < start || end > data.length || start < header + (count + 1) * 6 + aliases * 4) throw Error('Invalid resource bounds');
    const raw = data.subarray(start, end); let decoded = raw, codec = 'plain';
    try {
      if (raw[0] === 0x1f && raw[1] === 0x8b) { codec = 'gzip'; decoded = gunzipSync(raw, { maxOutputLength: limit }); }
      else if (raw.length >= 8 && raw[0] === 0x1e && raw[1] === 0x9b) { codec = 'brotli'; const size = raw.readUIntLE(2, 6); if (size > limit) throw Error('size'); decoded = brotliDecompressSync(raw.subarray(8), { maxOutputLength: limit }); if (decoded.length !== size) throw Error('size'); }
    } catch { failures.push({ id, start, bytes: raw.length, codec }); continue; }
    decodedBytes += decoded.length; codecCounts[codec]++;
    if (decodedBytes > 512 * 1024 * 1024) throw Error('PAK aggregate decode limit');
    for (const needle of needles) {
      const utf8 = decoded.indexOf(Buffer.from(needle)), utf16le = decoded.indexOf(Buffer.from(needle, 'utf16le'));
      if (utf8 >= 0 || utf16le >= 0) matches[needle].push({ id, start, rawBytes: raw.length, decodedBytes: decoded.length, codec, decodedSha256: sha(decoded), utf8Offset: utf8, utf16leOffset: utf16le });
    }
  }
  return { path: file, sha256: sha(data), bytes: data.length, version, encoding, uniqueResources: count, aliases, codecCounts, decodedBytes, failures, matches, aliasScope: 'Alias payloads share indexed resources and are covered once; aliases not duplicated', codeEvaluated: false };
}
export function inspectProvidedWebviewResources(resources) {
  resources = fs.realpathSync(resources);
  const names = ['aside_resources.pak', 'resources.pak', 'chrome_100_percent.pak', 'chrome_200_percent.pak'];
  return { version: 1, kind: 'bounded-static-webview-resource-scan', resources, packs: names.map(n => inspectWebviewPak(path.join(resources, n))), coverage: 'All unique indexed payloads of four named original nonlocale PAKs, plain/gzip/Chromium Brotli decoded, exact UTF8/UTF16LE literals only; not arbitrary semantics or V8 snapshot decoding', nativeExecuted: false };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw Error('Usage: inspect-provided-webview-resources.mjs explicit-original-resources-path');
  console.log(JSON.stringify(inspectProvidedWebviewResources(process.argv[2]), null, 2));
}
