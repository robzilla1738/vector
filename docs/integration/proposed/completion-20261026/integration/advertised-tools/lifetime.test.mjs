import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { transformAuxBashCloseLifetime } from '../../../../../../vendor/provided/aux-bash-close-lifetime.mjs';

const root = '/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/';
const source = readFileSync(root + 'index.mjs', 'utf8');
const transformed = transformAuxBashCloseLifetime({ text: source });
const start = transformed.text.indexOf('async function runSessionBash(');
const body = transformed.text.slice(start, transformed.text.indexOf('async function spawnSessionProcess(', start));

test('actual bash background consumer retains kill registration and runtime until child close', async () => {
  const proc = new EventEmitter();
  proc.on('error', () => {});
  Object.defineProperty(proc, 'auxPhysicalClose', { value: new Promise(resolve => proc.once('close', resolve)) });
  let releaseCount = 0, terminateCount = 0, background, finishDrain;
  const commands = new Set();
  const drain = new Promise(resolve => { finishDrain = resolve; });
  const context = { CWD_TRAILER: '', AbortController, setTimeout: (...args) => setTimeout(...args).unref(), clearTimeout, Date,
    randomUUID: () => 'fixture', runningCommands: commands,
    spawnSessionProcess: async () => ({ proc, release: () => releaseCount++, signalProcessGroup: () => terminateCount++ }),
    createTerminalOutput: () => ({ stdout: { getResult: () => '' }, stderr: { getResult: () => '' } }),
    drainTerminalProcess: () => drain, Promise };
  const run = runInNewContext('(' + body + ')', context);
  const pending = run({ execSessions: { onBackgroundRequest(fn) { background = fn; return () => {}; } } }, 'fixture',
    { timeoutMs: 60000, moveToBackground: () => 'background accepted' });
  await new Promise(resolve => setImmediate(resolve));
  background();
  const result = await pending;
  assert.equal(result.details.backgrounded, true);
  assert.equal(releaseCount, 0);
  assert.equal(commands.size, 1);
  for (const terminate of commands) terminate();
  assert.equal(terminateCount, 1);
  proc.emit('error', Error('late process error'));
  assert.equal(releaseCount, 0);
  proc.emit('close', 0, null);
  proc.emit('close', 0, null);
  await Promise.resolve();
  assert.equal(releaseCount, 1);
  assert.equal(commands.size, 0);
  finishDrain({ exitCode: 0, stdout: '', stderr: '' });
});

test('actual sandbox producer latches close before either asynchronous consumer receives child', async () => {
  const proc = new EventEmitter();
  const producerStart = transformed.text.indexOf('async function spawnSandboxed(');
  const producer = transformed.text.slice(producerStart, transformed.text.indexOf('async function wrapSandboxCommand(', producerStart));
  const spawn = runInNewContext('(' + producer + ')', {
    wrapSandboxCommand: async options => options,
    spawnCommand: () => proc,
    withExitCodePromise: child => child,
  });
  const published = await spawn({ command: ['fixture'] });
  proc.emit('close', 0, null);
  await published.process.auxPhysicalClose;
  let cleaned = false;
  published.process.auxPhysicalClose.then(() => { cleaned = true; });
  await Promise.resolve();
  assert.equal(cleaned, true);
  const descriptor = Object.getOwnPropertyDescriptor(proc, 'auxPhysicalClose');
  assert.equal(descriptor.writable, false);
  assert.equal(descriptor.configurable, false);
});

test('both actual leaves retain admission guards and count-checked replay', () => {
  for (const name of ['index.mjs', 'aux-native-entry.mjs']) {
    const original = readFileSync(root + name, 'utf8');
    const result = transformAuxBashCloseLifetime({ text: original });
    assert.equal(result.anchors.length, 3);
    assert.ok(result.text.includes('function prepareSessionSpawn(Cn,ei){auxRequireSupervisedTasks();'));
    let replay = result.text;
    for (const rule of [...result.anchors].reverse()) replay = replay.replace(rule.replace, () => rule.find);
    assert.equal(replay, original);
    assert.throws(() => transformAuxBashCloseLifetime({ text: result.text, source: original }), /repeated/);
  }
});
