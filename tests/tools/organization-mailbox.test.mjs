// Actual fixed metadata writer only; no browser effects or native qualification.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, realpathSync, statSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const writer = fileURLToPath(new URL('../host/lib/performance-mailbox-writer.py', import.meta.url));
function fixture() {
  const root = realpathSync(mkdtempSync('/tmp/aux-native-journey-work-')), profile = join(root, 'profile');
  mkdirSync(profile, { mode: 0o700 });
  const rootInfo = statSync(root), profileInfo = statSync(profile);
  return { root, request: { profile, rootDevice: rootInfo.dev, rootInode: rootInfo.ino,
    profileDevice: profileInfo.dev, profileInode: profileInfo.ino, action: 'publish', sequence: '1' } };
}
for (const operation of ['prepareOrganizationAutoArchiveWork', 'prepareOrganizationLiveFolderWork', 'completeOrganizationWork']) {
  test(`real private writer admits only fixed metadata for ${operation}`, () => {
    const f = fixture();
    try {
      const result = spawnSync('/usr/bin/python3', [writer], { input: JSON.stringify({ ...f.request, operation }), encoding: 'utf8', timeout: 5000 });
      assert.equal(result.status, 0, result.stderr);
      const path = join(f.root, 'performance-request.json');
      assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), { sequence: '1', operation });
      assert.equal(statSync(path).mode & 0o777, 0o600);
    } finally { rmSync(f.root, { recursive: true, force: true }); }
  });
}
test('organization writer refuses caller method, selector and unknown operation before publication', () => {
  const f = fixture();
  try {
    for (const extra of [{ operation: 'runtime.readPage' }, { operation: 'completeOrganizationWork', selector: '#caller' },
      { operation: 'prepareOrganizationAutoArchiveWork', method: 'pages.evaluate' }]) {
      const result = spawnSync('/usr/bin/python3', [writer], { input: JSON.stringify({ ...f.request, ...extra }), encoding: 'utf8', timeout: 5000 });
      assert.notEqual(result.status, 0);
      assert.equal(existsSync(join(f.root, 'performance-request.json')), false);
    }
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
