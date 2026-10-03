import assert from 'node:assert/strict';
import { constants, openSync, closeSync, fstatSync, readFileSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import { captureHomeState } from './home-capture.mjs';
import { replaceAppearanceField } from './appearance-temporary-state.mjs';

export const MEMORY_APPEARANCE_ID = 'memory-appearance';
export const memoryFixtureName = 'AuxMemoryResearchPlanningAndReview'.repeat(3).slice(0, 96);
export const memoryFixtureNote = 'Owned memory appearance notes: prefer concise summaries of the disposable project.';
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const selection = { name: 'Space memory selection', match: 'exact', scope: 'shell' };
const search = shell('Search Space names and saved notes', 'AXTextField');
const textarea = shell('Space memory', 'AXTextArea');
export function requireMemoryAppearance({ journeyId, appearance, pair }) {
  assert.equal(journeyId, MEMORY_APPEARANCE_ID); assert.equal(appearance, true); assert.ok(pair, 'Memory appearance requires the original admitted pair');
}
const identity = stat => [stat.dev, stat.ino, stat.uid, stat.mode];
/** Only the original App disposable native organization file; no runtime DB, cipher or keys. */
export function createMemoryLayoutReader(app) {
  const root = app.userDataDir, initial = lstatSync(root);
  assert.ok(initial.isDirectory() && !initial.isSymbolicLink() && initial.uid === process.getuid() && (initial.mode & 0o777) === 0o700);
  return () => {
    assert.equal(app.userDataDir, root); assert.deepEqual(identity(lstatSync(root)), identity(initial));
    const parent = lstatSync(join(root, 'Default')); assert.ok(parent.isDirectory() && !parent.isSymbolicLink() && parent.uid === process.getuid());
    const fd = openSync(join(root, 'Default', 'Preferences'), constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const before = fstatSync(fd); assert.ok(before.isFile() && before.uid === process.getuid() && before.nlink === 1 && before.size > 0 && before.size <= 4 * 1024 * 1024);
      const layout = JSON.parse(readFileSync(fd, 'utf8')).aux?.organization?.v2;
      assert.deepEqual(identity(fstatSync(fd)), identity(before)); assert.equal(fstatSync(fd).size, before.size);
      assert.deepEqual(identity(lstatSync(root)), identity(initial)); assert.deepEqual(identity(lstatSync(join(root, 'Default'))), identity(parent));
      assert.ok(layout && Array.isArray(layout.shared?.spaces) && Array.isArray(layout.shared?.archivedSpaces));
      assert.equal(Object.keys(layout.windows ?? {}).length, 1, 'Fresh original native layout window must remain unique');
      const [windowId] = Object.keys(layout.windows); assert.deepEqual(layout.windowOrder, [windowId]);
      assert.ok(typeof layout.windows[windowId].activeSpaceId === 'string');
      return { layout, windowId, window: layout.windows[windowId] };
    } finally { closeSync(fd); }
  };
}
export async function captureMemoryAppearance(t) {
  assert.equal(t.appearanceEnabled, true);
  const app = t.app, ax = t.ax, pid = app.pid;
  const stable = () => assert.ok(t.app === app && t.ax === ax && app.pid === pid && ax.pid === pid && Number.isInteger(pid) && pid > 0 && !t.signal?.aborted, 'Original Memory appearance owner retired');
  const owned = async operation => { stable(); const result = await operation(); stable(); return result; };
  stable(); assert.equal((await owned(() => ax.query(shell('Search settings', 'AXTextField')))).length, 0, 'Fresh Memory fixture must begin with Settings closed'); const read = createMemoryLayoutReader(app), original = read();
  const originalSpaces = [...original.layout.shared.spaces, ...original.layout.shared.archivedSpaces];
  const active = original.layout.shared.spaces.find(space => space.id === original.window.activeSpaceId); assert.ok(active);
  assert.ok(!originalSpaces.some(space => space.name === memoryFixtureName));
  const settings = await owned(() => t.rpc('settings.get')), pages = await owned(() => t.rpc('pages.list')), runs = await owned(() => t.rpc('runs.list')), workspace = await owned(() => t.rpc('workspace.get')), workspaces = await owned(() => t.rpc('workspaces.list'));
  assert.deepEqual(pages, []); assert.deepEqual(runs, []);
  const windows = (await owned(() => ax.windows())).filter(window => window.layer === 0 && window.width > 0 && window.height > 0); assert.equal(windows.length, 1); const windowId = windows[0].id; assert.ok(Number.isInteger(windowId) && windowId > 0);
  let created, primary, creating = false, result; const debts = [];
  const choices = name => ({ ...shell(name, 'AXButton'), match: 'contains', within: selection });
  const menu = async name => { await owned(() => ax.waitFor(shell(name, 'AXPopUpButton'))); await owned(() => ax.press(shell(name, 'AXPopUpButton'))); };
  const inspect = () => {
    stable(); const current = read(); assert.equal(current.windowId, original.windowId);
    const spaces = [...current.layout.shared.spaces, ...current.layout.shared.archivedSpaces];
    for (const space of originalSpaces) assert.deepEqual(spaces.find(item => item.id === space.id), space, 'Original Space record changed');
    const extra = spaces.filter(space => !originalSpaces.some(item => item.id === space.id));
    if (extra.length) { assert.equal(extra.length, 1); assert.equal(extra[0].name, memoryFixtureName); assert.ok(typeof extra[0].workspaceId === 'string' && extra[0].workspaceId); if (created) assert.deepEqual({ ...extra[0], archived: false }, { ...created, archived: false }); else created = extra[0]; }
    return current;
  };
  const unchanged = async () => {
    inspect(); assert.deepEqual(await owned(() => t.rpc('settings.get')), settings); assert.deepEqual(await owned(() => t.rpc('pages.list')), pages); assert.deepEqual(await owned(() => t.rpc('runs.list')), runs);
    const all = await owned(() => t.rpc('workspaces.list'));
    for (const item of workspaces) assert.deepEqual(all.find(row => row.workspaceId === item.workspaceId), item);
    const extra = all.filter(item => !workspaces.some(row => row.workspaceId === item.workspaceId)); assert.equal(extra.length, 1); assert.equal(extra[0].workspaceId, created.workspaceId); assert.equal(extra[0].name, memoryFixtureName);
    const currentWindows = (await owned(() => ax.windows())).filter(window => window.layer === 0 && window.width > 0 && window.height > 0); assert.equal(currentWindows.length, 1); assert.equal(currentWindows[0].id, windowId);
  };
  const requireSelected = async () => { const nodes = await owned(() => ax.query(choices(memoryFixtureName))); assert.equal(nodes.length, 1); assert.equal(nodes[0].checked, true, 'Actual original Memory choice must remain selected'); const input = await owned(() => ax.query(textarea)); assert.equal(input.length, 1); assert.equal(input[0].value, memoryFixtureNote); };
  const capture = async (name, state) => { await unchanged(); await owned(() => captureHomeState(t, name, state)); await unchanged(); };
  try {
    await menu(active.name); await owned(() => ax.press(shell('New space', 'AXMenuItem')));
    await owned(() => ax.waitFor(shell('New space'))); const field = { role: 'AXTextField', scope: 'shell', index: 0 }; assert.equal((await owned(() => ax.query(field)))[0]?.placeholder, 'Name');
    await replaceAppearanceField(t, owned, field, memoryFixtureName); creating = true; await owned(() => ax.press(shell('Create', 'AXButton'))); await owned(() => ax.waitFor(shell('New space'), 'absent'));
    await owned(() => t.until('exact newly created native Space and workspace join', async () => { const current = inspect(); return created && current.window.activeSpaceId === created.id && (await t.rpc('workspaces.list')).some(item => item.workspaceId === created.workspaceId && item.name === memoryFixtureName); }));
    await owned(() => ax.key('command+,', 'hid')); await owned(() => ax.press(shell('Memory', 'AXButton'))); await owned(() => ax.waitFor(search));
    await owned(() => ax.press(choices(memoryFixtureName))); await owned(() => ax.waitFor(shell('Space overview'))); await owned(() => ax.press(shell('Space overview'))); await owned(() => ax.waitFor(textarea));
    assert.equal((await owned(() => ax.query(textarea)))[0]?.value, '', 'Only the fresh fixture empty notes may be authored');
    await replaceAppearanceField(t, owned, textarea, memoryFixtureNote); await owned(() => ax.press(shell('Save notes', 'AXButton')));
    await owned(() => t.until('actual native Save notes acknowledged', async () => { const buttons = await ax.query(shell('Save notes', 'AXButton')); return buttons.length === 1 && buttons[0].enabled === false && (await ax.query(textarea))[0]?.value === memoryFixtureNote; }));
    await owned(() => ax.waitFor({ ...shell('Saved notes'), match: 'contains' }));
    await owned(() => ax.waitFor(shell(memoryFixtureName, 'AXHeading'))); await owned(() => ax.focus(choices(memoryFixtureName))); assert.equal((await owned(() => ax.query(choices(memoryFixtureName))))[0]?.focused, true); await requireSelected();
    await capture('memory-long-space-selected', 'memory-long-space-selected-focused');
    await replaceAppearanceField(t, owned, search, 'Owned memory appearance notes'); await owned(() => ax.waitFor({ ...shell(memoryFixtureNote), within: selection })); await requireSelected();
    assert.equal((await owned(() => ax.query(search)))[0]?.focused, true);
    await capture('memory-long-space-search-focused', 'memory-long-space-real-notes-search-focused');
    await owned(() => ax.press(choices(memoryFixtureName))); await requireSelected(); await owned(() => ax.focus(choices(memoryFixtureName))); assert.equal((await owned(() => ax.query(choices(memoryFixtureName))))[0]?.focused, true);
    await capture('memory-search-result-selected', 'memory-search-result-selected-focused');
    result = { ax: await owned(() => ax.dump()), rpc: { created, numericMemoryRevision: { status: 'unavailable', reason: 'Protected Memory read is not external authority; actual UI save acknowledged only' }, settings, pages, runs, workspaces }, retainedFixtureArtifacts: { status: 'retained-owned-disposable-profile', profilePath: app.userDataDir, spaceId: created.id, workspaceId: created.workspaceId, notes: 'retained', profileDeletion: 'not-performed' } };
  } catch (error) { primary = error; }
  finally {
    try {
      stable(); if (creating) inspect();
      if ((await owned(() => ax.query(search))).length) { await replaceAppearanceField(t, owned, search, ''); await owned(() => ax.key('escape', 'hid')); }
      if ((await owned(() => ax.query(shell('New space')))).length) await owned(() => ax.press(shell('Cancel', 'AXButton')));
      if (created) {
        const current = inspect(), currentActive = [...current.layout.shared.spaces].find(space => space.id === current.window.activeSpaceId); assert.ok(currentActive);
        if (currentActive.id !== active.id) { await menu(currentActive.name); await owned(() => ax.press(shell(active.name))); await owned(() => t.until('original active Space restored', () => inspect().window.activeSpaceId === active.id)); }
        if (!inspect().layout.shared.archivedSpaces.some(space => space.id === created.id)) { await menu(active.name); await owned(() => ax.press(shell(`Archive ${memoryFixtureName}`, 'AXMenuItem'))); await owned(() => t.until('exact fixture Space archived', () => inspect().layout.shared.archivedSpaces.some(space => space.id === created.id && space.workspaceId === created.workspaceId))); }
        assert.equal(inspect().window.activeSpaceId, active.id); await unchanged(); assert.deepEqual(await owned(() => t.rpc('workspace.get')), workspace);
      } else if (creating) assert.fail('Created Space identity remains unknown; original fixture restoration is unresolved');
    } catch (error) { debts.push(error); }
  }
  if (debts.length) throw new AggregateError([primary, ...debts].filter(Boolean), 'Memory appearance or original fixture restoration unresolved');
  if (primary) throw primary;
  result.rpc.created = inspect().layout.shared.archivedSpaces.find(space => space.id === created.id);
  assert.ok(result.rpc.created, 'Exact retained fixture must be archived');
  return result;
}
