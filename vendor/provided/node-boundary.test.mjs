import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const shim = resolve('vendor/provided/aux-native.cjs');
test('production native module refuses before any guard/original load without acceptance', () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-native-node-'));
  try {
    const env = { ...process.env, AUX_HOME: home, AUX_PROVIDED_NATIVE_LOAD_ONLY: '0',
      AUX_ENABLE_PROVIDED_NATIVE_CARRIER: '0', AUX_NATIVE_HELPER_BINDING: '/must-not-load',
      AUX_ASIDE_NATIVE_BINDING: '/must-not-load' };
    const result = spawnSync(process.execPath, ['-e', `try { require(${JSON.stringify(shim)}); process.exitCode=2 } catch(e) { if(e.message !== 'Provided native execution has not been accepted') throw e }`], { env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  } finally { rmSync(home, { recursive: true, force: true }); }
});
test('load-only worker refuses mismatched inherited canonical-home scope before module loading', () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-native-node-'));
  try {
    const env = { ...process.env, AUX_HOME: home, AUX_PROVIDED_NATIVE_LOAD_ONLY: '1',
      AUX_NATIVE_KEYCHAIN_SCOPE: 'a'.repeat(64) };
    const result = spawnSync(process.execPath, ['-e', `try { require(${JSON.stringify(shim)}); process.exitCode=2 } catch(e) { if(e.message !== 'Inherited native worker scope does not match canonical home') throw e }`], { env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  } finally { rmSync(home, { recursive: true, force: true }); }
});
