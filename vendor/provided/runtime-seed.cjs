'use strict';
// Copy only pinned supplied runtime distribution. No native/model/network calls.
const fs = require('node:fs/promises');
const { constants } = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const roots = new Set(['bin', 'native', 'node', 'python']);
const top = new Set(['env.sh', 'manifest.txt', 'openssl.cnf', 'prepare-python.py', 'version.txt']);
const textFiles = new Set(['env.sh', 'python/venv/bin/activate', 'python/venv/bin/activate.csh',
  'python/venv/bin/activate.fish', 'python/venv/bin/pip', 'python/venv/bin/pip3',
  'python/venv/bin/pip3.13', 'python/venv/bin/vba_extract.py', 'python/venv/pyvenv.cfg']);
const inside = (a, b) => { const r = path.relative(a, b); return !r || (!path.isAbsolute(r) && r !== '..' && !r.startsWith(`..${path.sep}`)); };
const stat = async (p) => { try { return await fs.lstat(p); } catch (e) { if (e.code !== 'ENOENT') throw e; } };
async function chain(p) {
  let current = path.parse(p).root;
  for (const part of p.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part); const s = await fs.lstat(current);
    if (!s.isDirectory() || s.isSymbolicLink()) throw new Error('Runtime path traverses non-directory or symlink');
  }
}
async function file(p) {
  if (!(await fs.lstat(p)).isFile()) throw new Error('Runtime payload is not regular');
  const h = await fs.open(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try { if (!(await h.stat()).isFile()) throw new Error('Runtime payload is not regular'); return await h.readFile(); }
  finally { await h.close(); }
}
function originalBytes(bytes, entry, bundleRuntimeRoot) {
  if (!entry.anchors?.length) return bytes;
  if (!textFiles.has(entry.path) || bytes.includes(0) || !Buffer.from(bytes.toString('utf8')).equals(bytes)) throw new Error('Unallowlisted runtime relocation');
  let text = bytes.toString('utf8');
  for (const a of [...entry.anchors].reverse()) {
    const staged = a.replacement === 'runtimeRoot' ? bundleRuntimeRoot : a.replace;
    if (typeof staged !== 'string' || !staged || text.split(staged).length - 1 !== a.count) throw new Error('Staged runtime relocation anchor drift');
    text = text.split(staged).join(a.find);
  }
  return Buffer.from(text);
}
function relocate(original, entry, runtimeRoot) {
  if (!entry.anchors?.length) return original;
  let text = original.toString('utf8');
  for (const a of entry.anchors) {
    if (text.split(a.find).length - 1 !== a.count) throw new Error('Original runtime relocation anchor drift');
    text = text.split(a.find).join(a.replacement === 'runtimeRoot' ? runtimeRoot : a.replace);
  }
  return Buffer.from(text);
}
async function seedBundledRuntime({ source, home, bundleRuntimeRoot, pins }) {
  if (![source, home, bundleRuntimeRoot].every((p) => typeof p === 'string' && path.isAbsolute(p))) throw new Error('Absolute runtime source/home/text root required');
  source = path.resolve(source); home = path.resolve(home);
  if (inside(source, home) || inside(home, source)) throw new Error('Runtime seed source and home must be disjoint');
  await chain(source); await chain(home);
  const hs = await fs.lstat(home);
  if (hs.uid !== process.getuid() || (hs.mode & 0o7777) !== 0o700) throw new Error('Runtime home must be private0700');
  const runtime = path.join(home, 'runtime'), existing = await stat(runtime);
  if (existing) {
    if (!existing.isDirectory() || existing.isSymbolicLink() || existing.uid !== process.getuid() || (existing.mode & 0o022)) throw new Error('Unsafe existing runtime cache');
    // Mutable npm/pip caches and genuine newer versions are not original pins.
    return { retained: true, runtime, seeded: false };
  }
  if (pins?.version !== 1 || !Array.isArray(pins.files)) throw new Error('Invalid runtime pin inventory');
  const seen = new Set();
  for (const e of pins.files) {
    if (typeof e.path !== 'string' || path.isAbsolute(e.path) || e.path.includes('\\') || e.path.split('/').some((v) => !v || v === '.' || v === '..') || (!top.has(e.path) && !roots.has(e.path.split('/')[0])) || seen.has(e.path)) throw new Error('Invalid runtime payload path');
    seen.add(e.path);
    if (!['file', 'directory', 'symlink'].includes(e.type) || !Number.isInteger(e.mode) || e.mode < 0 || (e.mode & ~0o755)) throw new Error('Invalid runtime payload type/mode');
    if (e.type === 'file' && (!Number.isSafeInteger(e.size) || e.size < 0 || !/^[a-f0-9]{64}$/.test(e.sourceSha256))) throw new Error('Invalid runtime file pin');
    if (e.anchors?.length && (!textFiles.has(e.path) || e.type !== 'file')) throw new Error('Unallowlisted runtime relocation');
    for (const a of e.anchors ?? []) {
      if (typeof a.find !== 'string' || !a.find || !Number.isSafeInteger(a.count) || a.count <= 0 || !((a.kind === 'integration' && a.replacement === 'runtimeRoot') || (a.kind === 'identity' && a.find === 'ASIDE_' && a.replace === 'AUX_'))) throw new Error('Invalid runtime relocation anchor');
    }
  }
  const staging = await fs.mkdtemp(path.join(home, '.aux-runtime-seed-'));
  try {
    for (const e of pins.files.filter((e) => e.type === 'directory').sort((a, b) => a.path.length - b.path.length)) {
      await chain(path.dirname(path.join(source, e.path)));
      const s = await fs.lstat(path.join(source, e.path));
      if (!s.isDirectory() || s.isSymbolicLink()) throw new Error('Non-directory runtime source');
      await fs.mkdir(path.join(staging, e.path), { mode: e.mode });
    }
    let relocatedTextFiles = 0;
    for (const e of pins.files.filter((e) => e.type === 'file')) {
      await chain(path.dirname(path.join(source, e.path)));
      const original = originalBytes(await file(path.join(source, e.path)), e, bundleRuntimeRoot);
      if (original.length !== e.size || sha(original) !== e.sourceSha256) throw new Error('Runtime payload pin mismatch');
      const output = relocate(original, e, runtime);
      if (e.anchors?.length) relocatedTextFiles++;
      await fs.writeFile(path.join(staging, e.path), output, { flag: 'wx', mode: e.mode });
      await fs.chmod(path.join(staging, e.path), e.mode);
    }
    for (const e of pins.files.filter((e) => e.type === 'symlink')) {
      const p = path.join(source, e.path); await chain(path.dirname(p));
      if (!(await fs.lstat(p)).isSymbolicLink() || await fs.readlink(p) !== e.linkTarget || path.isAbsolute(e.linkTarget) || !inside(source, path.resolve(path.dirname(p), e.linkTarget)) || !inside(source, await fs.realpath(p))) throw new Error('Runtime symlink pin changed or escapes distribution');
      await fs.symlink(e.linkTarget, path.join(staging, e.path));
    }
    await fs.mkdir(path.join(staging, 'tmp'), { mode: 0o700 });
    await fs.writeFile(path.join(staging, '.npmrc'), 'fund=false\naudit=false\nupdate-notifier=false\n', { flag: 'wx', mode: 0o600 });
    // Exclusive reservation; never POSIX-rename over an existing empty cache.
    try { await fs.mkdir(runtime, { mode: 0o700 }); }
    catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const s = await fs.lstat(runtime);
      if (!s.isDirectory() || s.isSymbolicLink() || s.uid !== process.getuid() || (s.mode & 0o022)) throw new Error('Unsafe racing runtime cache');
      return { retained: true, runtime, seeded: false };
    }
    for (const name of (await fs.readdir(staging)).sort((a, b) => (a === 'version.txt') - (b === 'version.txt'))) {
      if (await stat(path.join(runtime, name))) throw new Error('Runtime publication destination changed');
      await fs.rename(path.join(staging, name), path.join(runtime, name));
    }
    return { seeded: true, retained: false, runtime, relocatedTextFiles };
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
    // A crash/failed publication leaves a partial cache for original validation;
    // never delete/repair an existing runtime or imply it is installed.
  }
}
module.exports = { seedBundledRuntime };
