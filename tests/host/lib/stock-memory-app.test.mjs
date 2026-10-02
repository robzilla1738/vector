import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, realpathSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStockChildLifetime, readStockBuildIdentity, validateStockBuildManifest, stockLaunchArguments } from './stock-memory-app.mjs';
function child() { const value = new EventEmitter(); value.pid = 123; value.signals = []; value.kill = signal => { value.signals.push(signal); return true; }; return value; }
test('original close/reap is required, TERM cleanup is idempotent', async () => {
  const value = child(), lifetime = createStockChildLifetime(value, { termMs: 20, killMs: 20 });
  const stopping = lifetime.stop(); assert.equal(lifetime.stop(), stopping); assert.equal(lifetime.running, true);
  value.emit('exit', 0, null); assert.equal(lifetime.running, false); let resolved = false; stopping.then(() => { resolved = true; });
  await Promise.resolve(); assert.equal(resolved, false); value.emit('close', 0, null);
  assert.deepEqual(await stopping, { code: 0, signal: null }); assert.deepEqual(value.signals, ['SIGTERM']);
});
test('TERM timeout uses exact owned child KILL and still waits its reap', async () => {
  const value = child(), lifetime = createStockChildLifetime(value, { termMs: 1, killMs: 50 });
  value.kill = signal => { value.signals.push(signal); if (signal === 'SIGKILL') queueMicrotask(() => { value.emit('exit', null, signal); value.emit('close', null, signal); }); return true; };
  assert.deepEqual(await lifetime.stop(), { code: null, signal: 'SIGKILL' }); assert.deepEqual(value.signals, ['SIGTERM', 'SIGKILL']);
});
test('failed cleanup retains original subprocess and reap promise', async () => {
  const value = child(), lifetime = createStockChildLifetime(value, { termMs: 1, killMs: 1 });
  await assert.rejects(lifetime.stop(), error => error instanceof AggregateError && error.ownedChild === value && error.reaped === lifetime.reaped);
  assert.deepEqual(value.signals, ['SIGTERM', 'SIGKILL']); value.emit('close', null, 'SIGKILL'); await lifetime.reaped;
});
test('already exited child is never signalled using a recycled numeric PID', async () => {
  const value = child(), lifetime = createStockChildLifetime(value); value.emit('exit', 2, null); value.emit('close', 2, null);
  assert.deepEqual(await lifetime.stop(), { code: 2, signal: null }); assert.deepEqual(value.signals, []);
});
function buildFixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'stock-source-control-'))), out = join(root, 'out'); mkdirSync(out);
  const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
  git(['init', '-q']); writeFileSync(join(root, 'source'), 'actual synthetic source control\n'); writeFileSync(join(root, '.gitignore'), 'out/\n');
  git(['add', '.']); git(['-c', 'user.name=SourceControl', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'synthetic fixture']); git(['tag', '154.0.8037.58']);
  writeFileSync(join(out, 'chrome'), 'synthetic pinned bytes; never executed\n');
  writeFileSync(join(out, 'args.gn'), 'is_debug = false\nis_component_build = true\nsymbol_level = 0\nuse_lld = false\nstock_measurement_for_tests = true\nuse_dummy_lastchange = false\nis_official_build = false\n');
  const sha = name => createHash('sha256').update(readFileSync(join(root, name))).digest('hex');
  const row = { producer: 'aux-stock-memory-build', version: 1, sourceRoot: root, sourceCommit: git(['rev-parse', 'HEAD']), sourceTree: git(['rev-parse', 'HEAD^{tree}']), upstreamCommit: git(['rev-parse', 'HEAD']), upstreamTag: '154.0.8037.58', chromiumVersion: '154.0.8037.58', chromiumLastChange: `${git(['rev-parse', 'HEAD'])}-refs/branch-heads/8037@{#1294}`, buildId: 'synthetic source-test-only', executable: 'out/chrome', files: ['out/chrome', 'out/args.gn'].map(path => ({ path, sha256: sha(path) })), effectiveGnArgs: { is_debug: false, is_component_build: true, symbol_level: 0, use_lld: false, stock_measurement_for_tests: true, use_dummy_lastchange: false, is_official_build: false }, gnArgsFile: 'out/args.gn', measurementPackets: ['a'.repeat(64)] };
  const path = join(out, 'manifest.json'); const save = () => writeFileSync(path, JSON.stringify(row)); save();
  return { root, row, path, save, close: () => rmSync(root, { recursive: true, force: true }) };
}
test('actual clean source, tag, tree, explicit GN and file hashes are revalidated', async () => {
  const fixture = buildFixture(); try { const result = await readStockBuildIdentity(fixture.path, createHash('sha256').update(readFileSync(fixture.path)).digest('hex')); assert.equal(result.identity.dirty, false); assert.equal(result.identity.sourceCommit, fixture.row.sourceCommit); assert.equal(result.identity.manifestHash, createHash('sha256').update(readFileSync(fixture.path)).digest('hex')); await assert.rejects(readStockBuildIdentity(fixture.path, '0'.repeat(64)), /approved digest/); }
  finally { fixture.close(); }
});
test('dirty original source cannot be labelled clean by its manifest', async () => {
  const fixture = buildFixture(); try { writeFileSync(join(fixture.root, 'source'), 'changed'); await assert.rejects(readStockBuildIdentity(fixture.path, createHash('sha256').update(readFileSync(fixture.path)).digest('hex')), /clean/); } finally { fixture.close(); }
});
test('changed executable original bytes refuse before any native launch', async () => {
  const fixture = buildFixture(); try { writeFileSync(join(fixture.root, 'out/chrome'), 'different'); await assert.rejects(readStockBuildIdentity(fixture.path, createHash('sha256').update(readFileSync(fixture.path)).digest('hex')), /build bytes changed/); } finally { fixture.close(); }
});
test('duplicate GN override refuses even when a matching literal appears', async () => {
  const fixture = buildFixture(); try {
    const path = join(fixture.root, 'out/args.gn'); writeFileSync(path, readFileSync(path, 'utf8') + 'is_debug = unknown_variable\n');
    fixture.row.files.find(file => file.path === 'out/args.gn').sha256 = createHash('sha256').update(readFileSync(path)).digest('hex'); fixture.save();
    await assert.rejects(readStockBuildIdentity(fixture.path, createHash('sha256').update(readFileSync(fixture.path)).digest('hex')), /Duplicate or indirect/);
  } finally { fixture.close(); }
});
test('missing/extra manifest identity and Aux-enabled flags refuse', () => {
  const fixture = buildFixture(); try {
    assert.throws(() => validateStockBuildManifest({ ...fixture.row, pid: 1 }));
    assert.throws(() => validateStockBuildManifest({ ...fixture.row, chromiumVersion: '1.2.3.4' }));
    assert.throws(() => validateStockBuildManifest({ ...fixture.row, chromiumLastChange: '0'.repeat(40) }));
    assert.throws(() => validateStockBuildManifest({ ...fixture.row, effectiveGnArgs: { ...fixture.row.effectiveGnArgs, enable_aux_shell: true } }));
  } finally { fixture.close(); }
});

test('real owned Node subprocess reaches close/reap without PID discovery', async () => {
  const process = spawn(globalThis.process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
  const lifetime = createStockChildLifetime(process, { termMs: 500, killMs: 500 });
  assert.ok(lifetime.running); const result = await lifetime.stop(); assert.equal(lifetime.running, false);
  assert.ok(result.signal === 'SIGTERM' || result.signal === 'SIGKILL'); assert.equal(process.signalCode, result.signal);
});

test('fixed stock launch creates ten loopback native tabs without public/debug/RPC arguments', () => {
  const root = realpathSync(mkdtempSync('/private/tmp/aux-native-journey-stock-argv-')); chmodSync(root, 0o700);
  const profile = join(root, 'profile'); mkdirSync(profile, { mode: 0o700 });
  const urls = Array.from({ length: 10 }, (_, index) => `http://127.0.0.1:49152/memory/human-${index + 1}`);
  try {
    const args = stockLaunchArguments(profile, urls); assert.deepEqual(args.slice(-10), urls);
    assert.ok(args.includes('--aux-native-stock-measurement-observer')); assert.ok(args.includes('--use-mock-keychain')); assert.ok(args.includes('--password-store=basic'));
    assert.equal(args.some(arg => /remote-debugging|aux-runtime|dev-acceptance|script|rpc/.test(arg)), false);
    assert.throws(() => stockLaunchArguments(profile, [...urls.slice(1), 'http://example.com/page']));
    assert.throws(() => stockLaunchArguments(profile, urls.slice(1)));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
