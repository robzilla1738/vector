// Parsing-only fixture: the imported launch function must never execute.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = await realpath(await mkdtemp(join(tmpdir(), 'aux-port-contract-')));
try {
  await mkdir(join(root, 'lib'));
  await writeFile(join(root, 'lib/owned-process.mjs'), 'export function launchOwnedProcess() { throw new Error("Fixture must never launch"); }\n');
  const proposal = new URL('./aux.mjs', import.meta.url);
  await writeFile(join(root, 'aux.mjs'), await readFile(proposal));
  const run = (...args) => spawnSync(process.execPath, [join(root, 'aux.mjs'), '--app', join(root, 'Missing.app'), ...args], {
    env: { ...process.env, HOME: root, AUX_HOME: join(root, 'state') }, encoding: 'utf8', timeout: 3000,
  });
  for (const flags of [['--port', '21522'], ['--temp-profile', '--port', '21522']]) {
    const result = run(...flags);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Custom --port is supported only with --no-browser/);
    assert.doesNotMatch(result.stderr, /Assemble the supplied app|Fixture must never launch/);
  }
  for (const flags of [['--port', '21520'], ['--no-browser', '--port', '21522']]) {
    const result = run(...flags);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Assemble the supplied app first/);
    assert.doesNotMatch(result.stderr, /Custom --port is supported only|Fixture must never launch/);
  }
  // Execute daemon-only wiring with authored module/fetch fixtures. No child or HTTP request.
  const app = join(root, 'Fixture.app');
  const resources = join(app, 'Contents/Resources/aux');
  await mkdir(join(resources, 'native'), { recursive: true });
  await writeFile(join(resources, 'bundle.json'), JSON.stringify({ version: 1, implementation: 'supplied' }));
  await writeFile(join(resources, 'native/libaux-native-boundary.dylib'), 'fixture-only', { mode: 0o600 });
  await writeFile(join(root, 'lib/owned-process.mjs'), `import { writeFileSync } from 'node:fs';
export async function launchOwnedProcess(command, args, { env }) {
  writeFileSync(${JSON.stringify(join(root, 'child-env.json'))}, JSON.stringify(env));
  return { pid: process.pid, done: new Promise(() => {}), stop: async () => ({ groupStopped: true }) };
}
`);
  const source = await readFile(proposal, 'utf8');
  await writeFile(join(root, 'aux.mjs'), `globalThis.fetch = async () => ({ ok: true, json: async () => ({ service: 'aside-daemon', pid: process.pid, ready: true }) });\n` + source.replace(/^#![^\n]*\n/, ''));
  const wired = spawnSync(process.execPath, [join(root, 'aux.mjs'), '--app', app, '--home', join(root, 'own-home'), '--no-browser', '--port', '21522'], {
    env: { ...process.env, HOME: root, AUX_HOME: root, AUX_HOST: 'owner-host', DAEMON_BASE_URL: 'http://localhost:21420', AUX_BROWSER_CDP_HOST: 'localhost:45103' },
    encoding: 'utf8', timeout: 3000,
  });
  assert.equal(wired.status, 0, wired.stderr);
  const environment = JSON.parse(await readFile(join(root, 'child-env.json'), 'utf8'));
  assert.equal(environment.AUX_PORT, '21522');
  assert.equal(environment.AUX_HOST, '127.0.0.1');
  assert.equal(environment.DAEMON_BASE_URL, 'http://127.0.0.1:21522');
  assert.equal(environment.AUX_BROWSER_CDP_HOST, '127.0.0.1:45203');
  console.log('Four parser cases and daemon-only environment fixture PASS; no product process, endpoint or native code used.');
} finally {
  await rm(root, { recursive: true, force: true });
}
