// Controlled temporary files only; no compile, launch or approved artifact evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, realpathSync, writeFileSync, renameSync, rmSync, chmodSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pairHash } from './lib/packaged-runtime-pair-protocol.mjs';
import { retainPackagedRuntimeFiles } from './lib/packaged-runtime-files.mjs';
function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'aux-pair-reference-'))), path = join(root, 'original');
  writeFileSync(path, 'original controlled bytes', { mode: 0o600 });
  return { root, reference: { path, sha256: pairHash('original controlled bytes') } };
}
test('held original references validate and return independent copies until explicit release', () => {
  const f = fixture(), lease = retainPackagedRuntimeFiles();
  try { const bytes = lease.read(f.reference); bytes.fill(0); assert.equal(lease.read(f.reference).toString(), 'original controlled bytes');
    lease.validate(); lease.release(); assert.throws(lease.validate); assert.throws(() => lease.read(f.reference)); }
  finally { lease.release(); rmSync(f.root, { recursive: true, force: true }); }
});
test('same-byte inode replacement, modified bytes, unsafe permissions and swapped symlink refuse', () => {
  for (const change of [f => { renameSync(f.reference.path, join(f.root, 'old')); writeFileSync(f.reference.path, 'original controlled bytes', { mode: 0o600 }); },
    f => writeFileSync(f.reference.path, 'changed controlled bytes'), f => chmodSync(f.reference.path, 0o666),
    f => { renameSync(f.reference.path, join(f.root, 'old')); symlinkSync('old', f.reference.path); }]) {
    const f = fixture(), lease = retainPackagedRuntimeFiles();
    try { lease.retain(f.reference); change(f); assert.throws(lease.validate); }
    finally { lease.release(); rmSync(f.root, { recursive: true, force: true }); }
  }
});
test('contradictory approval hashes and bounded reads fail without granting new file authority', () => {
  const f = fixture(), lease = retainPackagedRuntimeFiles();
  try { lease.retain(f.reference); assert.throws(() => lease.retain({ ...f.reference, sha256: 'a'.repeat(64) }));
    assert.throws(() => lease.read(f.reference, 1)); lease.validate(); }
  finally { lease.release(); rmSync(f.root, { recursive: true, force: true }); }
});
