// Controlled filesystem/owner seams only, no native slot or process operation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../../scripts/native-slot.mjs', import.meta.url), 'utf8');
async function fixture(t) {
  const home = fs.mkdtempSync('/tmp/aux-slot-quarantine-control-'); fs.mkdirSync(path.join(home, 'aux-chromium-stable'));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const state = { alive: true, absent: false, checks: 0, hold: null, dispatches: 0, failPublication: false, failOpen: false }, app = {}, pair = {}, exports = {};
  const original = { pid: 42, generation: 123, async observeAbsent() { ++state.checks; if (state.hold) await state.hold; return state.absent; } };
  const imports = { 'node:crypto': crypto, 'node:fs': { ...fs, openSync(name, ...args) { if (state.failOpen && typeof name === 'string' && name.endsWith('quarantine.json')) throw new Error('Controlled original reservation open failed'); return fs.openSync(name, ...args); }, writeFileSync(name, ...args) { if (state.failPublication && typeof name === 'number') throw new Error('Controlled original reservation publication failed'); return fs.writeFileSync(name, ...args); } }, 'node:os': { homedir: () => home }, 'node:path': path,
    'node:url': { fileURLToPath: () => '/controlled/native-slot.mjs' }, 'node:child_process': { spawn() { throw new Error('Controlled slot must not spawn'); } },
    '../tests/host/lib/app.mjs': { readLaunchServicesQuarantineOwner(a, p) { assert.equal(a, app, 'Foreign App'); assert.equal(p, pair, 'Foreign pair'); return original; } } };
  const env = {};
  vm.runInNewContext(ts.transpileModule(source.slice(0, source.indexOf('\nif (process.argv[1]')).replaceAll('import.meta.url', "'file:///controlled/native-slot.mjs'"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, Buffer, Date, setTimeout, process: { pid: 123, argv: [], getuid: process.getuid, env, kill() { if (!state.alive) throw Object.assign(new Error('No controlled process'), { code: 'ESRCH' }); } },
      require(name) { assert.ok(imports[name], name); return imports[name]; } });
  const slot = await exports.acquireNativeSlot(); env.AUX_NATIVE_SLOT_TOKEN = slot.token;
  const marker = path.join(exports.nativeSlotPath, 'quarantine.json');
  const create = async () => { const guard = await exports.quarantineLaunchServicesAppearanceSlot(app, pair); t.after(() => guard.retire()); return guard; };
  return { exports, slot, marker, state, app, pair, create, env, original };
}
test('persistent quarantine refuses original release and dead-owner reclamation', async t => {
  const f = await fixture(t); await f.create();
  assert.throws(() => f.slot.release(), /quarantined/); f.state.alive = false;
  await assert.rejects(f.exports.acquireNativeSlot({ timeoutMs: 100 }), /quarantined|reservation retired/); assert.ok(fs.existsSync(f.marker));
});
test('only original observed generation absence clears, then ordinary release still works', async t => {
  const f = await fixture(t), guard = await f.create();
  await assert.rejects(guard.clearAfterOriginalRetirement(), /unverified/); assert.ok(fs.existsSync(f.marker));
  f.state.absent = true; await guard.clearAfterOriginalRetirement(); assert.ok(!fs.existsSync(f.marker));
  f.slot.release(); await assert.rejects(guard.clearAfterOriginalRetirement(), /retired/);
});
test('foreign App or inherited token cannot publish a quarantine', async t => {
  const f = await fixture(t);
  await assert.rejects(f.exports.quarantineLaunchServicesAppearanceSlot({}, f.pair), /Foreign App/);
  f.env.AUX_NATIVE_SLOT_TOKEN = 'foreign'; await assert.rejects(f.create(), /Foreign native slot/); assert.ok(!fs.existsSync(f.marker));
  f.slot.release();
});
test('replacement during held genuine retirement cannot clear a foreign marker', async t => {
  const f = await fixture(t), guard = await f.create(); let release;
  f.state.absent = true; f.state.hold = new Promise(resolve => { release = resolve; });
  const clearing = guard.clearAfterOriginalRetirement(); await Promise.resolve();
  fs.renameSync(f.marker, f.marker + '.original'); fs.writeFileSync(f.marker, '{}', { mode: 0o600 }); release();
  await assert.rejects(clearing, /replaced/); assert.equal(fs.readFileSync(f.marker, 'utf8'), '{}');
});
test('dangling quarantine symlink refuses release and dead-owner reclamation', async t => {
  const f = await fixture(t); fs.symlinkSync('/controlled/nonexistent', f.marker);
  assert.throws(() => f.slot.release(), /quarantined/); f.state.alive = false;
  await assert.rejects(f.exports.acquireNativeSlot({ timeoutMs: 100 }), /quarantined/);
});

test('invalid original owner shape cannot publish, even with matching inherited token', async t => {
  const f = await fixture(t), owner = path.join(f.exports.nativeSlotPath, 'owner.json');
  const original = JSON.parse(fs.readFileSync(owner, 'utf8'));
  fs.writeFileSync(owner, JSON.stringify({ ...original, foreign: true }));
  await assert.rejects(f.create(), /Foreign native slot/); assert.ok(!fs.existsSync(f.marker));
  fs.writeFileSync(owner, JSON.stringify(original)); f.slot.release();
});

test('unknown original LS generation remains quarantined without invented absence', async t => {
  const f = await fixture(t); f.original.pid = null; f.original.generation = null;
  f.original.observeAbsent = async () => { throw new Error('Original LS generation unknown'); };
  const guard = await f.create(); await assert.rejects(guard.clearAfterOriginalRetirement(), /unknown/);
  assert.equal(guard.receipt.pid, null); assert.equal(guard.receipt.launchServicesGeneration, null);
  assert.throws(() => f.slot.release(), /quarantined/);
});

test('only this live reservation permits its own inherited helper acquisition; outer release remains blocked', async t => {
  const f = await fixture(t), guard = await f.create();
  const helper = await f.exports.acquireNativeSlot(); assert.equal(helper.token, f.slot.token); helper.release();
  assert.throws(() => f.slot.release(), /quarantined/);
  guard.retire(); await assert.rejects(f.exports.acquireNativeSlot({ timeoutMs: 100 }), /quarantined/);
});
test('publication failure before dispatch leaves persistent refusal for outer release and dead-owner reclaim', async t => {
  const f = await fixture(t); f.state.failPublication = true;
  const dispatch = async () => { await f.create(); ++f.state.dispatches; };
  await assert.rejects(dispatch(), /publication failed/); assert.equal(f.state.dispatches, 0);
  assert.ok(fs.existsSync(f.marker)); assert.throws(() => f.slot.release(), /quarantined/);
  f.state.alive = false; await assert.rejects(f.exports.acquireNativeSlot({ timeoutMs: 100 }), /quarantined/);
});
test('reservation open failure aborts before dispatch and retains ordinary release when no marker/effect exists', async t => {
  const f = await fixture(t); f.state.failOpen = true;
  const dispatch = async () => { await f.create(); ++f.state.dispatches; };
  await assert.rejects(dispatch(), /open failed/); assert.equal(f.state.dispatches, 0); assert.ok(!fs.existsSync(f.marker));
  f.slot.release();
});
