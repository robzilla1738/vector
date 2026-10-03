import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const script = fileURLToPath(new URL('../../scripts/design-qa.mjs', import.meta.url));
test('canonical, lexical temporary alias and symlink entries execute usage refusal', () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-design-qa-cli-'));
  try {
    const alias = join(root, 'entry.mjs'); symlinkSync(script, alias);
    for (const entry of [script, alias]) {
      const result = spawnSync(process.execPath, [entry], { encoding: 'utf8', timeout: 5000 });
      assert.equal(result.status, 1); assert.match(result.stderr, /Usage: node scripts\/design-qa.mjs/); assert.equal(result.stdout, '');
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('ordinary module import remains quiet and does not invoke the CLI', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', `await import(${JSON.stringify(new URL('../../scripts/design-qa.mjs', import.meta.url).href)})`], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 0); assert.equal(result.stderr, ''); assert.equal(result.stdout, '');
});
