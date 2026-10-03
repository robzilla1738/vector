// Controlled native/runtime/helper contracts only; no physical resize/pixel evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOwnedNarrowGenerations, createDistinctNarrowWindowPreparation } from './lib/distinct-narrow-window.mjs';
const ownership = (id, kind, bwi, page) => ({ producer: 'aux-native-utility-appearance-owner', version: 1, windowId: id, browserWindowId: bwi, windowKind: kind, shellDocumentToken: 'A'.repeat(32), pages: [{ pageId: page, documentToken: 'B'.repeat(32), selected: true }] });
function fixture() {
  const windows = [{ id: 6, layer: 0, x: 0, y: 0, width: 1388, height: 800 }, { id: 7, layer: 0, x: 1600, y: 0, width: 960, height: 720 }];
  const owners = [ownership(6, 'normal', '12', 'p_normal'), ownership(7, 'little', '13', 'p_little')];
  const pages = owners.map(owner => ({ windowId: owner.browserWindowId, windowKind: owner.windowKind, pageId: owner.pages[0].pageId, loading: false, ownedByRuntime: false }));
  const state = { pages, windows, owners, inputs: [], captures: [], retired: false, failCapture: undefined, failRestore: false };
  const identity = { producer: 'aux-native-warm-window-identity', version: 1, targetPid: 42, helperPid: 43, targetProcessUuid: 'a'.repeat(32), helperProcessUuid: 'b'.repeat(32), targetProcessStartMachTicks: '1', helperProcessStartMachTicks: '2' };
  const app = { pid: 42 }, ax = { pid: 42, helperPid: 43, windows: async () => structuredClone(state.windows), request: async () => identity,
    drag: async (from, to) => { if (state.failRestore && to.x > from.x) throw new Error('restore HID refused'); state.inputs.push({ from, to }); const target = windows.find(window => Math.abs(window.x + window.width - 1 - from.x) < 2); assert.ok(target, 'actual target corner'); target.width = to.x - target.x + 1; return { actual: 'controlled HID' }; } };
  const provenance = {
    discoverUtilityOwner: async ({ browserWindowId, windowKind }) => ({ owner: structuredClone(state.owners.find(owner => owner.browserWindowId === browserWindowId && owner.windowKind === windowKind)) }),
    observeUtilityOwner: async (windowId, owner) => { assert.ok(!state.retired, 'native document retired'); const actual = state.owners.find(value => value.windowId === windowId); assert.deepEqual(actual, owner); return { owner: structuredClone(actual) }; },
  };
  const t = { app, ax, provenance, appearanceEnabled: true, readRuntimePages: async () => structuredClone(state.pages), capture: async (name, options) => { assert.deepEqual(options.expectedUtilityOwnership, state.owners.find(owner => owner.windowId === options.windowId)); if (state.failCapture) throw state.failCapture; state.captures.push({ name, options, width: windows.find(window => window.id === options.windowId).width }); return { name, windowFrame: { ...windows.find(window => window.id === options.windowId) } }; } };
  return { t, state };
}
test('two original returned BWIs resize and restore separately only after functional-proof capture', async () => {
  const { t, state } = fixture(), manifest = {}, generations = createOwnedNarrowGenerations(() => t, manifest);
  await generations.prepare(); assert.equal(state.inputs.length, 0);
  await generations.captureDistinct('owned', 'actual-functional-proof');
  assert.deepEqual(state.captures.map(value => [value.options.windowId, value.width]), [[6, 1388], [6, 810], [7, 960], [7, 810]]);
  assert.deepEqual(state.windows.map(value => value.width), [1388, 960]);
  assert.deepEqual(manifest.distinctNarrowGenerations.map(value => value.restoration.windowId), [6, 7]);
});
test('foreign returned runtime scope cannot cause an input', async () => {
  const { t, state } = fixture(); state.pages[1].windowId = '99';
  await assert.rejects(createDistinctNarrowWindowPreparation(t, { windowId: '13', windowKind: 'little' }, t.provenance), /absent/);
  assert.equal(state.inputs.length, 0);
});
test('retired shell or selected guest document refuses before physical input', async () => {
  const { t, state } = fixture();
  const session = await createDistinctNarrowWindowPreparation(t, { windowId: '13', windowKind: 'little' }, t.provenance);
  state.owners[1].pages[0].documentToken = 'C'.repeat(32);
  await assert.rejects(session.prepare()); assert.equal(state.inputs.length, 0);
});
test('original primary capture failure survives successful restoration', async () => {
  const { t, state } = fixture(), generations = createOwnedNarrowGenerations(() => t, {});
  await generations.prepare(); const original = new Error('original capture refusal'); state.failCapture = original;
  await assert.rejects(generations.captureDistinct('owned', 'proof'), error => error === original);
  assert.equal(state.inputs.length, 0); assert.deepEqual(state.windows.map(value => value.width), [1388, 960]);
});
test('narrow capture failure and original restoration refusal both remain debts', async () => {
  const { t, state } = fixture(), manifest = {}, generations = createOwnedNarrowGenerations(() => t, manifest);
  await generations.prepare(); const original = new Error('narrow PNG failed'); const capture = t.capture;
  t.capture = async (name, options) => { if (name.endsWith('-narrow')) { state.failRestore = true; throw original; } return capture(name, options); };
  await assert.rejects(generations.captureDistinct('owned', 'proof'), error => error.cause === original && error.errors[0] === original && error.errors[1] instanceof AggregateError);
  assert.match(manifest.distinctNarrowGenerations[0].cleanupError, /restore HID refused/);
  await assert.rejects(generations.restore(), /cleanup debt/);
});
test('original helper PID generation cannot be replaced during prepare', async () => {
  const { t, state } = fixture();
  const session = await createDistinctNarrowWindowPreparation(t, { windowId: '13', windowKind: 'little' }, t.provenance);
  t.ax = { ...t.ax, pid: 44 };
  await assert.rejects(session.prepare(), /retired/); assert.equal(state.inputs.length, 0);
});

test('warm Little uses its own original owner and restores before later promotion', async () => {
  const { t, state } = fixture(), manifest = {}, generations = createOwnedNarrowGenerations(() => t, manifest);
  await generations.captureUtility({ windowId: '13', windowKind: 'little' }, 'warm-little', 'actual-draft-narrow');
  assert.deepEqual(state.captures.map(value => [value.options.windowId, value.width]), [[7, 810]]);
  assert.deepEqual(state.windows.map(value => value.width), [1388, 960]);
  assert.equal(manifest.distinctNarrowGenerations[0].restoration.windowId, 7);
});
test('narrow capture cannot borrow restored or changed native geometry', async () => {
  const { t, state } = fixture();
  const session = await createDistinctNarrowWindowPreparation(t, { windowId: '13', windowKind: 'little' }, t.provenance);
  await session.prepare(); await session.restore();
  await assert.rejects(session.capture('narrow', 'narrow-state', { narrow: true }), /already restored/);
  assert.equal(state.captures.length, 0);
});

const held = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
test('retired same-PID app/helper/provenance during inventory cannot authorize input', async () => {
  for (const key of ['app', 'ax', 'provenance']) {
    const { t, state } = fixture(), wait = held(); let context = t;
    t.ax.windows = () => wait.promise;
    const manager = createOwnedNarrowGenerations(() => context, {}), pending = manager.prepare();
    context = { ...t, [key]: { ...t[key] } }; wait.resolve(structuredClone(state.windows));
    await assert.rejects(pending, /context retired/); assert.equal(state.inputs.length, 0);
    await manager.restore();
  }
});
test('runtime inventory retirement and abort refuse before publishing resize authority', async () => {
  for (const retire of [false, true]) {
    const { t, state } = fixture(), wait = held(), controller = new AbortController(); let context = t;
    t.signal = controller.signal; t.readRuntimePages = () => wait.promise;
    const manager = createOwnedNarrowGenerations(() => context, {}), pending = manager.prepare();
    await new Promise(resolve => setImmediate(resolve));
    if (retire) context = { ...t, provenance: { ...t.provenance } }; else controller.abort(new Error('original abort'));
    wait.resolve(structuredClone(state.pages));
    await assert.rejects(pending, retire ? /context retired/ : /original abort/);
    assert.equal(state.inputs.length, 0); await manager.restore();
  }
});
test('all public operations reserve before the first awaited inventory', async () => {
  const { t, state } = fixture(), wait = held(); t.ax.windows = () => wait.promise;
  const manager = createOwnedNarrowGenerations(() => t, {}), pending = manager.prepare();
  for (const operation of [() => manager.prepare(), () => manager.captureUtility({ windowId: '13', windowKind: 'little' }, 'x', 'x'), () => manager.captureDistinct('x', 'x'), () => manager.restore()])
    await assert.rejects(operation(), /operation is still pending/);
  wait.resolve(structuredClone(state.windows)); await pending; await manager.restore();
  assert.equal(state.inputs.length, 0);
});
test('capture cleanup retains reservation until original physical restoration finishes', async () => {
  const { t, state } = fixture(), wait = held(), originalDrag = t.ax.drag; let restoring;
  t.ax.drag = async (from, to) => { if (to.x > from.x) { restoring = true; await wait.promise; } return originalDrag(from, to); };
  const manager = createOwnedNarrowGenerations(() => t, {});
  const pending = manager.captureUtility({ windowId: '13', windowKind: 'little' }, 'x', 'x');
  while (!restoring) await new Promise(resolve => setTimeout(resolve, 1));
  await assert.rejects(manager.restore(), /operation is still pending/);
  await assert.rejects(manager.prepare(), /operation is still pending/);
  wait.resolve(); await pending; await manager.restore();
  assert.deepEqual(state.windows.map(value => value.width), [1388, 960]);
});
