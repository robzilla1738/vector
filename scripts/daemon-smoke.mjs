import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { sign } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import WebSocket from 'ws';

const root = resolve(import.meta.dirname, '..');
const home = await mkdtemp(join(tmpdir(), 'aux-core-smoke-'));
const allocator = createServer();
await new Promise((done) => allocator.listen(0, '127.0.0.1', done));
const address = allocator.address();
assert(address && typeof address !== 'string');
const port = address.port;
await new Promise((done) => allocator.close(done));
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, [join(root, 'apps/daemon/dist/index.js')], {
  cwd: root, env: { ...process.env, AUX_HOME: home, AUX_PORT: String(port), AUX_BRIDGE_PORT: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => { output = (output + chunk).slice(-16_384); });
const ended = new Promise((done) => child.once('exit', (code) => done(code)));
let socket;
try {
  let health;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error('Daemon exited before readiness.');
    try {
      const response = await fetch(`${origin}/health`, { signal: AbortSignal.timeout(500) });
      if (response.ok) { health = await response.json(); if (health.ready) break; }
    } catch (error) {
      if (!(error instanceof TypeError) && error.name !== 'TimeoutError') throw error;
    }
    await delay(100);
  }
  assert.equal(health?.service, 'aux-daemon');
  assert.equal(health?.pid, child.pid);
  assert.equal(health?.ready, true);
  assert.equal((await fetch(`${origin}/auth/daemon/verify`)).status, 401);
  const foreignHostStatus = await new Promise((done, reject) => {
    const req = request(`${origin}/health`, { headers: { Host: 'untrusted.invalid' } }, (response) => { response.resume(); done(response.statusCode); });
    req.once('error', reject);
    req.end();
  });
  assert.equal(foreignHostStatus, 403);
  const challenge = await (await fetch(`${origin}/auth/daemon/challenge?clientKind=cli`)).json();
  const key = await readFile(join(home, 'installation-private.pem'));
  const signedChallenge = sign('sha256', Buffer.concat([
    Buffer.from('Aux Daemon Auth v1\0'), Buffer.from(challenge.challenge, 'base64'),
  ]), key).toString('base64');
  const sessionOptions = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId: challenge.challengeId, signedChallenge }) };
  const sessionResponse = await fetch(`${origin}/auth/daemon/session`, sessionOptions);
  assert.equal(sessionResponse.status, 200);
  const session = await sessionResponse.json();
  assert.equal(session.token_type, 'AuxDaemonSessionToken');
  const authorization = `AuxDaemonSessionToken ${session.access_token}`;
  assert.equal((await fetch(`${origin}/auth/daemon/session`, sessionOptions)).status, 401);
  assert.equal((await fetch(`${origin}/auth/daemon/verify`, { headers: { Authorization: authorization } })).status, 200);
  const accounts = await (await fetch(`${origin}/trpc/accounts.list?input=${encodeURIComponent('{}')}`, { headers: { Authorization: authorization } })).json();
  const registry = accounts.result.data;
  assert.equal(registry.version, 1);
  assert(registry.accounts.some((account) => account.id === registry.currentAccountId));
  socket = new WebSocket(`ws://127.0.0.1:${port}/extension-bridge/extension`, [`aux.daemon.auth.${session.access_token}`]);
  await new Promise((done, reject) => { socket.once('open', done); socket.once('error', reject); });
  const registered = new Promise((done, reject) => {
    const timeout = setTimeout(() => reject(new Error('Bridge registration timed out.')), 3000);
    socket.once('message', (data) => { clearTimeout(timeout); done(JSON.parse(data.toString())); });
  });
  socket.send(JSON.stringify({ method: 'register', connectionId: 'core-smoke', route: { accountId: registry.currentAccountId, profileId: 'smoke', browserMode: 'default' } }));
  assert.equal((await registered).method, 'registered');
  socket.close();
  const shutdown = await fetch(`${origin}/shutdown`, { method: 'POST', headers: { Authorization: authorization } });
  assert.equal(shutdown.status, 200);
  const code = await Promise.race([ended, delay(5000).then(() => { throw new Error('Shutdown timed out.'); })]);
  assert.equal(code, 0);
  console.log('Independent daemon smoke passed: readiness, Host policy, auth/replay, accounts, bridge and shutdown.');
} catch (error) {
  // Daemon logs must already redact secrets. Keep them on disk, never inline credentials in failures.
  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir(join(root, 'out/diagnostics'), { recursive: true, mode: 0o700 });
  const log = join(root, 'out/diagnostics', `smoke-${Date.now()}.log`);
  await writeFile(log, output, { mode: 0o600 });
  console.error(`Smoke failed; private diagnostics: ${log}`);
  throw error;
} finally {
  socket?.terminate();
  if (child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([ended, delay(3000)]);
    if (child.exitCode === null) { child.kill('SIGKILL'); await ended; }
  }
  await rm(home, { recursive: true, force: true });
}
