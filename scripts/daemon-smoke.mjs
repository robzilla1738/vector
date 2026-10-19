import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { sign } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { parseEnv } from 'node:util';
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
  async function rpc(name, input) {
      const response = await fetch(`${origin}/trpc/${name}`, {
        method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: registry.currentAccountId, ...input }),
      });
      return { status: response.status, body: await response.json() };
    }
  if (process.argv.includes('--onboarding')) {
    const denied = await rpc('accounts.completeOnboarding', { deferModelSetup: true });
    assert.equal(denied.status, 412);
    const setup = await rpc('passwordManager.auth.setup', { password: 'Disposable-password-for-onboarding' });
    assert.equal(setup.status, 200);
    assert.equal(typeof setup.body.result.data.recoveryKey, 'string');
    const modelRequired = await rpc('accounts.completeOnboarding', { deferModelSetup: false });
    assert.equal(modelRequired.status, 412);
    const finished = await rpc('accounts.completeOnboarding', { deferModelSetup: true });
    assert.equal(finished.status, 200);
    assert.equal(typeof finished.body.result.data.onboardingCompletedAt, 'number');
    await rpc('passwordManager.auth.lock', {});
    assert.equal((await rpc('accounts.completeOnboarding', { deferModelSetup: true })).status, 412);
    console.log('Onboarding gate smoke passed: security required, model deferral explicit, locked account rejected.');
  }
  if (process.argv.includes('--repl')) {
    const started = await rpc('cli.replStart', {});
    assert.equal(started.status, 200);
    const id = started.body.result.data.id;
    const first = await rpc('cli.replRun', { id, code: 'let value = await Promise.resolve(40); value + 2' });
    assert.equal(first.status, 200);
    assert.equal(first.body.result.data.result, 42);
    const second = await rpc('cli.replRun', { id, code: 'value += 1; value' });
    assert.equal(second.body.result.data.result, 41);
    const isolated = await rpc('cli.replRun', { id, code: 'typeof process + ":" + typeof require' });
    assert.equal(isolated.body.result.data.result, 'undefined:undefined');
    const imported = await rpc('cli.replRun', { id, code: 'await import("node:fs")' });
    assert.notEqual(imported.status, 200);
    const timed = await rpc('cli.replStart', {});
    const timedId = timed.body.result.data.id;
    const interrupted = await rpc('cli.replRun', { id: timedId, code: 'while (true) {}', timeoutMs: 25 });
    assert.notEqual(interrupted.status, 200);
    console.log('Isolated REPL smoke passed: async bindings persist, host globals/imports unavailable, runaway execution interrupted.');
  }
  if (process.argv.includes('--ai')) {
    const values = parseEnv(await readFile(join(root, '.env'), 'utf8'));
    if (!values.AI_GATEWAY_API_KEY) throw new Error('AI_GATEWAY_API_KEY is missing from the private environment file.');
    const credentialResponse = await fetch(`${origin}/trpc/models.setCredential`, {
      method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: registry.currentAccountId, providerId: 'vercel-ai-gateway', credential: { type: 'api_key', key: values.AI_GATEWAY_API_KEY } }),
    });
    assert.equal(credentialResponse.status, 200);
    delete values.AI_GATEWAY_API_KEY;
    const cli = spawn(process.execPath, [join(root, 'apps/cli/dist/index.js'), 'exec', '--json', '--model', 'vercel-ai-gateway/meta/muse-spark-1.3-contributor', '--effort', 'low', 'Reply with exactly: Aux local engine verified'], {
      cwd: root, env: { ...process.env, AUX_HOME: home, AUX_PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'], signal: AbortSignal.timeout(180_000),
    });
    let result = '', diagnostic = '';
    cli.stdout.on('data', (chunk) => { result += chunk; });
    cli.stderr.on('data', (chunk) => { diagnostic += chunk; });
    const cliCode = await new Promise((done, reject) => { cli.once('error', reject); cli.once('exit', done); });
    assert.equal(cliCode, 0, diagnostic.replace(/(?:Bearer|AuxDaemonSessionToken)\s+\S+/gi, '[redacted]'));
    const task = JSON.parse(result);
    assert.equal(task.status, 'idle');
    assert.match(task.text, /Aux local engine verified/);
    console.log('Muse Spark contributor completed a real task through the independent CLI and agent engine.');
  }
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
