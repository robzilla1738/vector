import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { requireMemoryAppearance, createMemoryLayoutReader, captureMemoryAppearance, memoryFixtureName, memoryFixtureNote } from './lib/memory-appearance.mjs';
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'aux-memory-appearance-')); mkdirSync(join(root, 'Default'));
  const original = { id: 'original', workspaceId: 'workspace-original', name: 'Personal', color: 'slate', grain: 0 };
  const created = { id: 'fixture', workspaceId: 'workspace-fixture', name: memoryFixtureName, color: 'slate', grain: 0 };
  const layout = { revision: 1, shared: { spaces: [original], archivedSpaces: [] }, windows: { main: { activeSpaceId: 'original' } }, windowOrder: ['main'] };
  const save = () => writeFileSync(join(root, 'Default/Preferences'), JSON.stringify({ aux: { organization: { v2: layout } } })); save();
  const app = { pid: 246, userDataDir: root }; let currentWorkspace = 'original', settingsOpen = false, newSpace = false, value = '', query = '', focused = '', saved = false;
  const captures = [], writes = [];
  const ax = { pid: 246,
    windows: async () => [{ id: 13, layer: 0, width: 810, height: 700 }],
    waitFor: async () => {}, dump: async () => ({ currentWorkspace, saved, query }),
    query: async selector => {
      if (selector.name === 'Search settings') return [];
      if (selector.name === 'Space memory') return [{ value, focused: focused === selector.name }];
      if (selector.name === 'Search Space names and saved notes') return settingsOpen ? [{ value: query, focused: focused === selector.name }] : [];
      if (selector.name === 'Save notes') return [{ enabled: !saved }];
      if (selector.name === 'New space') return newSpace ? [{}] : [];
      if (selector.within && selector.name === memoryFixtureName && selector.role !== 'AXCheckBox') return [];
      if (selector.within) return [{ checked: currentWorkspace === 'fixture', focused: focused === selector.name }];
      if (selector.role === 'AXTextField') return [{ placeholder: 'Name', value, focused: true }];
      return [{}];
    },
    focus: async selector => { focused = selector.name; },
    key: async key => { if (key === 'command+,') settingsOpen = true; if (key === 'escape') settingsOpen = false; if (key === 'backspace') { if (focused === 'Search Space names and saved notes') query = ''; else value = ''; } },
    type: async (text, selector) => { if (selector.name === 'Search Space names and saved notes') query = text; else value = text; },
    press: async selector => {
      writes.push(selector.name);
      if (selector.name === 'New space') { newSpace = true; value = ''; }
      if (selector.name === 'Create') { layout.shared.spaces.push(created); layout.windows.main.activeSpaceId = 'fixture'; newSpace = false; value = ''; save(); }
      if (selector.name === 'Save notes') saved = true;
      if (selector.name === memoryFixtureName && selector.within) { assert.equal(selector.role, 'AXCheckBox', 'Chromium aria-pressed toggle exposes the native checkbox role'); currentWorkspace = 'fixture'; }
      if (selector.name === 'Personal' && selector.role !== 'AXPopUpButton') { layout.windows.main.activeSpaceId = 'original'; save(); }
      if (selector.name === `Archive ${memoryFixtureName}`) { layout.shared.spaces = layout.shared.spaces.filter(row => row.id !== 'fixture'); layout.shared.archivedSpaces.push({ ...created, archived: true }); save(); }
    },
  };
  const t = { appearanceEnabled: true, app, ax, signal: new AbortController().signal,
    rpc: async method => method === 'workspaces.list' ? [original, ...layout.shared.spaces.filter(row => row.id === 'fixture'), ...layout.shared.archivedSpaces].map(row => ({ workspaceId: row.workspaceId, name: row.name })) : method === 'pages.list' || method === 'runs.list' ? [] : method === 'settings.get' ? { tabLayout: 'vertical' } : method === 'workspace.get' ? { activePageId: null } : assert.fail(method),
    until: async (_name, read) => { const result = await read(); assert.ok(result); return result; },
    capture: async (name, options) => captures.push({ name, options }),
  };
  return { t, captures, writes, layout, save, root, app, read: () => ({ saved, value, query, settingsOpen }), dispose: () => rmSync(root, { recursive: true, force: true }) };
}
test('closed Memory ID requires actual appearance pair and stays outside functional registry', () => {
  assert.equal(memoryFixtureName.length, 96);
  requireMemoryAppearance({ journeyId: 'memory-appearance', appearance: true, pair: 'externally-admitted-pair' });
  for (const change of [{ journeyId: 'other' }, { appearance: false }, { pair: undefined }]) assert.throws(() => requireMemoryAppearance({ journeyId: 'memory-appearance', appearance: true, pair: 'pair', ...change }));
});
test('original native layout reader refuses symlinked Preferences and replaced original root', () => {
  const f = fixture();
  try {
    const read = createMemoryLayoutReader(f.app); assert.equal(read().window.activeSpaceId, 'original');
    unlinkSync(join(f.root, 'Default/Preferences')); symlinkSync('/nonexistent', join(f.root, 'Default/Preferences')); assert.throws(read);
    f.app.userDataDir = `${f.root}-foreign`; assert.throws(read);
  } finally { f.dispose(); }
});
test('source protocol captures genuine UI save/search/selection and restores original selection while recording exact retained archived fixture artifacts', async () => {
  const f = fixture();
  try {
    const result = await captureMemoryAppearance(f.t);
    assert.equal(result.rpc.created.workspaceId, 'workspace-fixture'); assert.equal(result.rpc.created.archived, true); assert.equal(result.retainedFixtureArtifacts.profilePath, f.root); assert.equal(result.retainedFixtureArtifacts.profileDeletion, 'not-performed'); assert.equal(result.rpc.numericMemoryRevision.status, 'unavailable');
    assert.deepEqual(f.captures.map(row => row.options), [
      { windowId: 13, state: 'memory-long-space-selected-focused' },
      { windowId: 13, state: 'memory-long-space-real-notes-search-focused' },
      { windowId: 13, state: 'memory-search-result-selected-focused' },
    ]);
    assert.equal(f.layout.windows.main.activeSpaceId, 'original'); assert.equal(f.layout.shared.archivedSpaces[0].id, 'fixture');
    assert.equal(f.read().query, ''); assert.equal(f.read().settingsOpen, false); assert.equal(f.read().value, memoryFixtureNote); assert.equal(f.read().saved, true);
    assert.ok(f.writes.includes('Save notes')); assert.ok(f.writes.includes(`Archive ${memoryFixtureName}`));
  } finally { f.dispose(); }
});
test('same-PID helper replacement after pixels refuses and retains primary plus cleanup debt', async () => {
  const f = fixture(); const primary = new Error('Original capture failure');
  f.t.capture = async () => { f.t.ax = { ...f.t.ax }; throw primary; };
  try { await assert.rejects(captureMemoryAppearance(f.t), error => error instanceof AggregateError && error.errors[0] === primary && error.errors.length === 2); assert.equal(f.layout.shared.archivedSpaces.length, 0); }
  finally { f.dispose(); }
});
test('changed original Space record refuses before any counted capture and keeps restoration failure', async () => {
  const f = fixture(); const press = f.t.ax.press;
  f.t.ax.press = async selector => { await press(selector); if (selector.name === 'Create') { f.layout.shared.spaces[0].name = 'Foreign mutation'; f.save(); } };
  try { await assert.rejects(captureMemoryAppearance(f.t), AggregateError); assert.deepEqual(f.captures, []); }
  finally { f.dispose(); }
});

test('unacknowledged Save notes refuses every capture and still restores the exact original Space', async () => {
  const f = fixture(); const query = f.t.ax.query;
  f.t.ax.query = async selector => selector.name === 'Save notes' ? [{ enabled: true }] : query(selector);
  try { await assert.rejects(captureMemoryAppearance(f.t)); assert.deepEqual(f.captures, []); assert.equal(f.layout.windows.main.activeSpaceId, 'original'); assert.equal(f.layout.shared.archivedSpaces[0].id, 'fixture'); }
  finally { f.dispose(); }
});
