// Controlled temporary file leases only; no package/compiler/native admission.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, mkdirSync, symlinkSync, rmSync, renameSync, chmodSync, realpathSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { retainApprovedClosure } from './lib/packaged-runtime-closure.mjs';
import { pairHash, canonicalPairJson } from './lib/packaged-runtime-pair-protocol.mjs';
function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'aux-pair-closure-')));
  mkdirSync(join(root, 'payload'), { mode: 0o700 }); writeFileSync(join(root, 'payload', 'entry'), 'original', { mode: 0o600 });
  symlinkSync('payload/entry', join(root, 'current'));
  const rows = [{ kind: 'symlink', path: 'current', target: 'payload/entry', mode: lstatSync(join(root, 'current')).mode & 0o7777, size: 13, sha256: pairHash('payload/entry') },
    { kind: 'directory', path: 'payload', mode: 0o700 }, { kind: 'regular', path: 'payload/entry', mode: 0o600, size: 8, sha256: pairHash('original') }];
  const info = lstatSync(root);
  return { root, rows, scope: 'complete-tree', rootMetadata: { device: info.dev, inode: info.ino, mode: info.mode & 0o7777 }, inventorySha256: pairHash(canonicalPairJson(rows)) };
}
test('holds original complete files and in-closure literal symlink until release', () => {
  const f = fixture(); try { const lease = retainApprovedClosure(f); lease.validate(); lease.release(); assert.throws(lease.validate, /Retired/); }
  finally { rmSync(f.root, { recursive: true, force: true }); }
});
test('changed bytes, inode replacement, extra members and permissions refuse after admission', () => {
  for (const change of [f => writeFileSync(join(f.root, 'payload/entry'), 'modified'),
    f => { renameSync(join(f.root, 'payload/entry'), join(f.root, 'old')); writeFileSync(join(f.root, 'payload/entry'), 'original', { mode: 0o600 }); },
    f => writeFileSync(join(f.root, 'extra'), 'foreign', { mode: 0o600 }), f => chmodSync(join(f.root, 'payload/entry'), 0o644)]) {
    const f = fixture(); let lease; try { lease = retainApprovedClosure(f); change(f); assert.throws(lease.validate); }
    finally { lease?.release(); rmSync(f.root, { recursive: true, force: true }); }
  }
});
test('subset inventory and outside or dangling symlink refuse before byte admission', () => {
  for (const change of [f => { f.rows.pop(); }, f => { rmSync(join(f.root, 'current')); symlinkSync('../outside', join(f.root, 'current')); },
    f => { rmSync(join(f.root, 'payload/entry')); }]) {
    const f = fixture(); try { change(f); f.inventorySha256 = pairHash(canonicalPairJson(f.rows)); assert.throws(() => retainApprovedClosure(f)); }
    finally { rmSync(f.root, { recursive: true, force: true }); }
  }
});
