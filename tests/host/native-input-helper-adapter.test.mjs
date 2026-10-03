import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { originalInputHelperClose } from './lib/native-input-helper-close.mjs';
const source = new URL('./lib/ax.mjs', import.meta.url);
// Executes the actual proposed adapter. The child and slot below are controlled
// protocol fixtures: no helper compilation, spawn, UI or native timing occurs.
async function fixture() {
  const child = new EventEmitter(), lines = new EventEmitter(), timers = new Map();
  let releases = 0, timerId = 0, ended = 0, killed = 0;
  child.pid = 123; child.stdout = {}; child.stderr = new EventEmitter();
  child.stdin = { write(_bytes, callback) { callback(); }, end() { ended++; } };
  child.kill = () => { killed++; }; lines.close = () => {};
  const imports = {
    './native-input-helper-close.mjs': { originalInputHelperClose },
    './native-window-compiler-artifact.mjs': { readNativeWindowCompilerExecutable() { throw new Error('Ordinary client must keep existing path'); } },
    'node:child_process': { spawn: () => child, execFileSync() { throw new Error('Compilation forbidden'); } },
    'node:crypto': { createHash: () => ({ update() { return this; }, digest: () => 'a'.repeat(64) }) },
    'node:fs': { existsSync: () => true, readFileSync: () => Buffer.from('controlled source') },
    'node:os': { homedir: () => '/controlled' },
    'node:path': { join: (...parts) => parts.join('/'), resolve: (...parts) => parts.join('/') },
    'node:readline': { createInterface: () => lines },
    '../../../scripts/native-slot.mjs': { acquireNativeSlot: async () => ({ token: 'fixture', release() { releases++; } }) },
  };
  const exports = {};
  const script = ts.transpileModule(readFileSync(source, 'utf8').replaceAll('import.meta.dirname', "'/controlled'"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(script, { exports, process: { env: {} }, Buffer,
    require(name) { assert.ok(imports[name], `Unexpected dependency ${name}`); return imports[name]; },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); } });
  const ax = await exports.createAxClient(456);
  return { child, lines, timers, ax, counts: () => ({ releases, ended, killed }) };
}
test('original adapter close request retains actual zero exit and original child PID', async () => {
  const f = await fixture(), closing = f.ax.close();
  assert.equal(f.counts().ended, 1); f.child.emit('close', 0, null);
  const receipt = await closing;
  assert.equal(receipt.helperPid, 123); assert.equal(receipt.code, 0); assert.equal(receipt.signal, null);
  assert.equal(receipt.clean, true); assert.equal(receipt.cleanupRequested, true);
  assert.equal(f.counts().releases, 1);
});
test('close called after unsolicited zero exit cannot relabel original intent', async () => {
  const f = await fixture(); f.child.emit('close', 0, null);
  const receipt = await f.ax.close();
  assert.equal(receipt.clean, false); assert.equal(receipt.cleanupRequested, false);
  assert.ok(receipt.primary); assert.equal(f.counts().ended, 0);
});
test('late close retains parser failure and actual SIGTERM receipt', async () => {
  const f = await fixture(); f.lines.emit('line', '{');
  const closing = f.ax.close(); f.child.emit('close', null, 'SIGTERM');
  const receipt = await closing;
  assert.equal(receipt.clean, false); assert.match(receipt.primary.message, /Invalid AX response/);
  assert.equal(receipt.code, null); assert.equal(receipt.signal, 'SIGTERM'); assert.equal(f.counts().killed, 1);
});
test('timed out original request remains a primary failure after requested shutdown', async () => {
  const f = await fixture(), request = f.ax.request('warmWindowKeyReceipt');
  const rejected = assert.rejects(request, /timed out/);
  [...f.timers.values()][0](); await rejected;
  const closing = f.ax.close(); f.child.emit('close', 0, null);
  const receipt = await closing;
  assert.equal(receipt.clean, false); assert.match(receipt.primary.message, /timed out/);
  assert.equal(receipt.pendingCount, 0); assert.equal(f.counts().killed, 1);
});
test('closing with an outstanding request retains failure and rejects original waiter', async () => {
  const f = await fixture(), request = f.ax.request('warmWindowKeyReceipt');
  const rejected = assert.rejects(request, /AX helper exited/);
  const closing = f.ax.close(); f.child.emit('close', 0, null); await rejected;
  const receipt = await closing;
  assert.equal(receipt.clean, false); assert.equal(receipt.pendingCount, 1);
  assert.equal(f.timers.size, 0); assert.equal(f.counts().releases, 1);
});
