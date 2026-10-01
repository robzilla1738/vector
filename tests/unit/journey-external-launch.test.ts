import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { validateExternalLaunch, externalGenerationRunning } from '../host/lib/app.mjs';
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function profile() {
  const root = mkdtempSync('/tmp/aux-native-journey-'); roots.push(root);
  const path = join(root, 'profile'); mkdirSync(path, { mode: 0o700 }); return path;
}
it.each(['https://example.com/red', 'file:///tmp/red', 'http://user:secret@127.0.0.1/red', 'javascript:alert(1)', 'http://127.0.0.1.evil.test/red'])(
  'refuses an external target outside the credential-free loopback fixture: %s', url => {
    expect(() => validateExternalLaunch(url, [], 42, '')).toThrow();
  });
it('warm external open requires an existing positive PID and cannot change process arguments', () => {
  expect(validateExternalLaunch('http://127.0.0.1:1234/red', [], 42, '')).toBe('http://127.0.0.1:1234/red');
  expect(() => validateExternalLaunch('http://127.0.0.1/red', ['--user-data-dir=/tmp/other'], 42, '')).toThrow();
  expect(() => validateExternalLaunch('http://127.0.0.1/red', [], -1, '')).toThrow();
});
it('cold external open requires exact owner-only disposable profile and protected flags', () => {
  const dir = profile();
  const args = [`--user-data-dir=${dir}`, '--profile-directory=Default', '--use-mock-keychain', '--password-store=basic'];
  expect(validateExternalLaunch('http://127.0.0.1/red', args, 0, dir)).toBe('http://127.0.0.1/red');
  expect(() => validateExternalLaunch('http://127.0.0.1/red', args.slice(1), 0, dir)).toThrow();
  for (const override of ['--user-data-dir=/tmp/another', '--password-store=keychain', '--profile-directory=Profile 2', '--use-mock-keychain=false'])
    expect(() => validateExternalLaunch('http://127.0.0.1/red', [...args, override], 0, dir)).toThrow();
  expect(() => validateExternalLaunch('http://127.0.0.1/red', [...args, '--remote-debugging-port=9222'], 0, dir)).toThrow();
  expect(() => validateExternalLaunch('http://127.0.0.1/red', [`--user-data-dir=${dir}-other`, ...args.slice(1)], 0, dir)).toThrow();
});

it('only a typed native check receipt can prove a launch generation gone', () => {
  expect(externalGenerationRunning({ running: false })).toBe(false);
  expect(externalGenerationRunning({ running: true })).toBe(true);
  for (const receipt of [null, {}, { running: "false" }, { error: "IPC timeout" }])
    expect(() => externalGenerationRunning(receipt)).toThrow("cleanup is unverified");
});
