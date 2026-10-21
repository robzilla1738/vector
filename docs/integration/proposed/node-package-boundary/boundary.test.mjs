import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

// Inert JS fixtures only: no supplied host, native addon, app or owner state.
test('outer untyped marker stops absolute createRequire scan and preserves untyped JS/cjs/mjs modes', () => {
  const root = mkdtempSync(join(tmpdir(), 'aux-package-boundary-'));
  try {
    const app = join(root, 'Aux.app');
    const host = join(app, 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon');
    const native = join(app, 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native');
    mkdirSync(native, { recursive: true });
    mkdirSync(join(host, '..'), { recursive: true });
    writeFileSync(join(root, 'package.json'), '{invalid ancestor JSON');
    const cjs = join(native, 'fixture.cjs');
    const js = join(app, 'fixture.js');
    const esm = join(app, 'fixture.mjs');
    writeFileSync(cjs, 'module.exports = { mode: "commonjs" };');
    writeFileSync(js, 'module.exports = { mode: "untyped-commonjs" };');
    writeFileSync(esm, 'export default "module";');
    const code = 'import{createRequire}from"node:module";import{pathToFileURL}from"node:url";const r=createRequire(process.argv[1]);console.log(JSON.stringify({cjs:r(process.argv[2]).mode,js:r(process.argv[3]).mode,esm:(await import(pathToFileURL(process.argv[4]).href)).default}));';
    const invoke = () => execFileSync(process.execPath, ['--input-type=module', '-e', code, host, cjs, js, esm], { cwd: tmpdir(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 5000 });
    assert.throws(invoke, (error) => error.stderr.includes('ERR_INVALID_PACKAGE_CONFIG') && error.stderr.includes(join(root, 'package.json')));
    writeFileSync(join(app, 'package.json'), readFileSync(new URL('./package.json', import.meta.url)));
    assert.deepEqual(JSON.parse(invoke()), { cjs: 'commonjs', js: 'untyped-commonjs', esm: 'module' });
  } finally { rmSync(root, { recursive: true, force: true }); }
});
