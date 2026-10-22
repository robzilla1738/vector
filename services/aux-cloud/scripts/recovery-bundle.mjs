import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream, constants } from 'node:fs';
import { appendFile, mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import assert from 'node:assert/strict';

const magic = Buffer.from('AUXREC01');
const filename = /^(database\.dump|blob-[0-9]+\.bin)$/;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const privateRead = path => createReadStream(path, { flags: constants.O_RDONLY | constants.O_NOFOLLOW });
function entryKey(key, id, name) {
  assert(Buffer.isBuffer(key) && key.length === 32, 'Recovery key must be 32 random bytes');
  return Buffer.from(hkdfSync('sha256', key, id, `aux.recovery.bundle.v1:${name}`, 32));
}
function meter(maxBytes) {
  let size = 0;
  const hash = createHash('sha256');
  const stream = new Transform({ transform(chunk, _encoding, callback) {
    size += chunk.length;
    if (size > maxBytes) return callback(Error('Recovery bundle exceeds its byte limit'));
    hash.update(chunk); callback(null, chunk);
  } });
  return { stream, result: () => ({ size, sha256: hash.digest('hex') }) };
}
async function seal(source, path, key, id, name, maxBytes) {
  const nonce = randomBytes(12), header = Buffer.concat([magic, nonce]);
  const cipher = createCipheriv('aes-256-gcm', entryKey(key, id, name), nonce);
  cipher.setAAD(Buffer.from(`${id}:${name}`));
  const counted = meter(maxBytes);
  await writeFile(path, header, { flag: 'wx', mode: 0o600 });
  await pipeline(source, counted.stream, cipher, createWriteStream(path, { flags: constants.O_WRONLY | constants.O_APPEND | constants.O_NOFOLLOW }));
  await appendFile(path, cipher.getAuthTag());
  return counted.result();
}

async function unseal(path, key, id, name, target, maxBytes) {
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await file.stat();
    assert(stat.isFile() && stat.size >= 36 && stat.size <= maxBytes + 36, 'Invalid sealed entry size');
    const header = Buffer.alloc(20), tag = Buffer.alloc(16);
    await file.read(header, 0, 20, 0); await file.read(tag, 0, 16, stat.size - 16);
    assert(header.subarray(0, 8).equals(magic), 'Unknown recovery envelope');
    const decipher = createDecipheriv('aes-256-gcm', entryKey(key, id, name), header.subarray(8));
    decipher.setAAD(Buffer.from(`${id}:${name}`)); decipher.setAuthTag(tag);
    const counted = meter(maxBytes);
    const source = stat.size === 36 ? Readable.from([]) : createReadStream(path, { fd: file.fd, autoClose: false, start: 20, end: stat.size - 17 });
    await pipeline(source, decipher, counted.stream, createWriteStream(target, { flags: 'wx', mode: 0o600 }));
    return counted.result();
  } finally { await file.close(); }
}

export async function readRecoveryKey(path) {
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await file.stat();
    assert(stat.isFile() && stat.size <= 128 && (stat.mode & 0o077) === 0, 'Recovery key must be a private mode0600 file');
    const encoded = (await file.readFile('utf8')).trim();
    assert(/^[a-f0-9]{64}$/.test(encoded), 'Recovery key must be 32 random bytes encoded as hex');
    return Buffer.from(encoded, 'hex');
  } finally { await file.close(); }
}

export async function writeBundle({ directory, key, metadata, entries, maxBytes }) {
  assert(Number.isSafeInteger(maxBytes) && maxBytes > 0, 'Provide a bounded byte budget');
  const path = resolve(directory), id = randomUUID(), files = [], names = new Set();
  await mkdir(path, { mode: 0o700 }); // Refuses existing destinations; never deletes owner directories.
  try {
    let remaining = maxBytes;
    for await (const entry of entries) {
      assert(filename.test(entry.name) && !names.has(entry.name), 'Invalid or duplicate recovery entry');
      names.add(entry.name);
      const result = await seal(entry.source, join(path, entry.name + '.sealed'), key, id, entry.name, remaining);
      remaining -= result.size;
      files.push({ name: entry.name, ...result, ...(entry.object ? { object: entry.object } : {}) });
    }
    assert(names.has('database.dump'), 'Database archive is required');
    const manifest = Buffer.from(JSON.stringify({ version: 1, id, createdAt: new Date().toISOString(), metadata, files }));
    assert(manifest.length <= 8 * 1024 * 1024, 'Recovery manifest exceeds 8MiB');
    await seal(Readable.from([manifest]), join(path, 'manifest.sealed'), key, id, 'manifest', manifest.length);
    // Completion record is written last. All identity, paths, hashes and secrets stay sealed.
    await writeFile(join(path, 'bundle.json'), JSON.stringify({ version: 1, id }), { flag: 'wx', mode: 0o600 });
    return { id, files: files.length, bytes: maxBytes - remaining, manifestSha256: sha(manifest) };
  } catch (error) { await rm(path, { recursive: true, force: true }); throw error; }
}

/** Produces a local copy only after every entry authenticates; never imports into a database or Blob store. */
export async function unpackBundle({ directory, key, destination, maxBytes }) {
  const source = resolve(directory), target = resolve(destination);
  assert(target !== source, 'Recovery staging must be a new directory');
  assert(Number.isSafeInteger(maxBytes) && maxBytes > 0, 'Provide a bounded byte budget');
  const headerFile = await open(join(source, 'bundle.json'), constants.O_RDONLY | constants.O_NOFOLLOW);
  let header;
  try {
    assert((await headerFile.stat()).size < 1024, 'Invalid completion record');
    header = JSON.parse(await headerFile.readFile('utf8'));
  } finally { await headerFile.close(); }
  assert(header.version === 1 && /^[0-9a-f-]{36}$/.test(header.id), 'Unknown recovery bundle');
  await mkdir(target, { mode: 0o700 });
  try {
    await unseal(join(source, 'manifest.sealed'), key, header.id, 'manifest', join(target, 'manifest.json'), 8 * 1024 * 1024);
    const manifest = JSON.parse(await readFile(join(target, 'manifest.json'), 'utf8'));
    assert(manifest.id === header.id && manifest.version === 1 && Array.isArray(manifest.files) && manifest.files.length <= 100_001, 'Invalid recovery manifest');
    let remaining = maxBytes;
    const names = new Set();
    for (const entry of manifest.files) {
      assert(filename.test(entry.name) && !names.has(entry.name), 'Unsafe or duplicate recovery filename');
      assert(Number.isSafeInteger(entry.size) && entry.size >= 0 && entry.size <= remaining && /^[a-f0-9]{64}$/.test(entry.sha256), 'Invalid entry bounds');
      names.add(entry.name);
      const result = await unseal(join(source, entry.name + '.sealed'), key, header.id, entry.name, join(target, entry.name), entry.size);
      assert(result.size === entry.size && result.sha256 === entry.sha256, 'Recovery entry hash mismatch');
      remaining -= entry.size;
    }
    assert(names.has('database.dump'), 'Database archive is required');
    return { manifest, bytes: maxBytes - remaining };
  } catch (error) { await rm(target, { recursive: true, force: true }); throw error; }
}

export const recoveryFileSource = privateRead;
