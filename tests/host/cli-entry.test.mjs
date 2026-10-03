import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('journey and Stock CLI checks execute through directory aliases while imports stay quiet', () => {
  const root = realpathSync(fileURLToPath(new URL('../..', import.meta.url)));
  const temporary = mkdtempSync(join(tmpdir(), 'aux-host-cli-entry-'));
  const alias = join(temporary, 'workspace');
  symlinkSync(root, alias);
  try {
    for (const [module, args, status] of [
      ['tests/host/journeys/index.mjs', ['--check'], 0],
      // Missing required arguments must refuse before collector/slot admission.
      ['tests/host/native-stock-memory.mjs', [], 1],
    ]) {
      for (const flags of [[], ['--preserve-symlinks-main']]) {
        const result = spawnSync(process.execPath, [...flags, join(alias, module), ...args],
          { cwd: root, encoding: 'utf8', timeout: 30_000 });
        assert.ifError(result.error);
        assert.equal(result.status, status);
        if (status === 0) assert.deepEqual(JSON.parse(result.stdout), { journeys: 48, features: 43 });
        else assert.match(result.stderr, /AssertionError/);
      }
      const wrapper = join(temporary, 'import.mjs');
      writeFileSync(wrapper, `await import(${JSON.stringify(join(alias, module))});`);
      for (const argv of [[wrapper], ['--input-type=module', '-e',
        'await import(process.argv[2])', resolve(temporary, 'nonexistent-argument'), join(alias, module)]]) {
        const result = spawnSync(process.execPath, argv, { cwd: root, encoding: 'utf8', timeout: 30_000 });
        assert.ifError(result.error);
        assert.equal(result.status, 0);
        assert.equal(result.stdout, '');
        assert.equal(result.stderr, '');
      }
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
