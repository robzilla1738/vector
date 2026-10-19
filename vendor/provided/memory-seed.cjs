'use strict';
// Distribution cache provisioning only. Never imports the supplied native addon.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const stat = async (p) => { try { return await fs.lstat(p); } catch (e) { if (e.code !== 'ENOENT') throw e; } };
async function directory(p, ownerOnly = false) {
  const s = await fs.lstat(p);
  if (!s.isDirectory() || s.isSymbolicLink() || s.uid !== process.getuid() || (s.mode & 0o022) || (ownerOnly && (s.mode & 0o7777) !== 0o700)) throw new Error('Unsafe memory cache directory');
}
async function chain(p) {
  const absolute = path.resolve(p);
  let current = path.parse(absolute).root;
  for (const part of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const s = await fs.lstat(current);
    if (s.isSymbolicLink() || !s.isDirectory()) throw new Error('Memory cache path traverses non-directory or symlink');
  }
}
async function seedBundledMemory({ source, home, entries }) {
  if (!path.isAbsolute(source) || !path.isAbsolute(home)) throw new Error('Absolute memory source/home required');
  source = path.resolve(source); home = path.resolve(home);
  const contains = (parent, child) => {
    const relative = path.relative(parent, child);
    return !relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
  };
  if (contains(source, home) || contains(home, source)) throw new Error('Memory source and destination must be disjoint');
  await chain(source);
  if (!await stat(home)) await fs.mkdir(home, { mode: 0o700 });
  await chain(home); await directory(home, true);
  const groups = new Map(), seen = new Set();
  for (const e of entries) {
    if (typeof e.path !== 'string' || !/^(memory-catalog\.json|(?:models|memory-runtimes)(?:\/[a-f0-9]{64}(?:\/[a-zA-Z0-9_.-]+)*)?)$/.test(e.path) || e.path.split('/').some((p) => p === '.' || p === '..')) throw new Error('Invalid memory allowlist path');
    if (seen.has(e.path)) throw new Error('Duplicate memory allowlist path');
    seen.add(e.path);
    const parts = e.path.split('/');
    const group = parts.length === 1 ? e.path : parts.slice(0, 2).join('/');
    if (parts.length === 1 && e.path !== 'memory-catalog.json') {
      if (e.type !== 'directory') throw new Error('Invalid memory cache root');
      continue;
    }
    if (!['file', 'directory'].includes(e.type) || !Number.isInteger(e.mode) || (e.mode & ~0o700)) throw new Error('Invalid memory allowlist entry');
    groups.set(group, [...(groups.get(group) || []), e]);
  }
  // Validate ALL pinned source bytes before publishing anything.
  const bytes = new Map();
  for (const list of groups.values()) for (const e of list) {
    const p = path.join(source, e.path); await chain(path.dirname(p));
    const s = await fs.lstat(p);
    if (s.isSymbolicLink() || (e.type === 'directory' ? !s.isDirectory() : !s.isFile())) throw new Error('Invalid memory source type');
    if (e.type === 'file') {
      const b = await fs.readFile(p);
      if (b.length !== e.size || hash(b) !== e.sourceSha256) throw new Error('Memory distribution pin mismatch');
      bytes.set(e.path, b);
    }
  }
  const validateExisting = async (target, group, list) => {
    const existing = await fs.lstat(target);
    if (existing.isSymbolicLink() || (group === 'memory-catalog.json' ? !existing.isFile() : !existing.isDirectory())) throw new Error('Unsafe existing memory destination');
    for (const e of list) {
      let p = target;
      const parts = e.path.slice(group.length + 1).split('/').filter(Boolean);
      for (let i = 0; i < parts.length; i++) {
        p = path.join(p, parts[i]); const child = await stat(p);
        if (!child) break;
        const expectDirectory = i < parts.length - 1 || e.type === 'directory';
        if (child.isSymbolicLink() || (expectDirectory ? !child.isDirectory() : !child.isFile())) throw new Error('Unsafe existing memory cache descendant');
      }
    }
  };
  const report = { seeded: [], retained: [] };
  // Catalog published last; existing signed/newer/modified catalog is untouched.
  const ordered = [...groups].sort(([a], [b]) => (a === 'memory-catalog.json') - (b === 'memory-catalog.json'));
  for (const [group, list] of ordered) {
    const target = path.join(home, group);
    if (group !== 'memory-catalog.json') {
      const root = path.dirname(target);
      try { await fs.mkdir(root, { mode: 0o700 }); } catch (e) { if (e.code !== 'EEXIST') throw e; }
      await directory(root);
    }
    const existing = await stat(target);
    if (existing) {
      await validateExisting(target, group, list);
      report.retained.push(group); continue;
    }
    if (group === 'memory-catalog.json') {
      try { await fs.writeFile(target, bytes.get(group), { mode: 0o600, flag: 'wx' }); }
      catch (e) { if (e.code !== 'EEXIST') throw e; await validateExisting(target, group, list); report.retained.push(group); continue; }
    } else {
      // Exclusive reservation avoids rename replacing an existing empty cache.
      try { await fs.mkdir(target, { mode: 0o700 }); }
      catch (e) { if (e.code !== 'EEXIST') throw e; await validateExisting(target, group, list); report.retained.push(group); continue; }
      for (const e of [...list].sort((a, b) => (a.path.endsWith('/CURRENT') ? 1 : 0) - (b.path.endsWith('/CURRENT') ? 1 : 0) || a.path.length - b.path.length)) {
        if (e.path === group) continue;
        const p = path.join(home, e.path);
        if (e.type === 'directory') await fs.mkdir(p, { mode: e.mode });
        else await fs.writeFile(p, bytes.get(e.path), { mode: e.mode, flag: 'wx' });
      }
    }
    report.seeded.push(group);
  }
  return report;
}
module.exports = { seedBundledMemory };
