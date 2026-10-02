import { resolve } from 'node:path';
import { setTabLayout } from '../lib/tab-layout.mjs';

export const journey = {
  id: 'extension-actions', title: 'Use unpacked Chromium actions, shortcuts and a native side panel',
  features: ['extensions'], devAcceptance: ['extensions', 'commandRegistry', 'spaces', 'windowSync'],
  needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 180_000, owner: 'L7',
};
const control = (name, role = 'AXButton', scope = 'shell') => ({ name, role, match: 'exact', scope, index: 0 });
const fixtureName = 'Aux extension fixture';
const action = control(`${fixtureName} · 4`);
const popup = control('Aux fixture popup', 'AXHeading', 'any');
const pause = ms => new Promise(resolvePause => setTimeout(resolvePause, ms));
export async function run(t) {
  t.fixture.route('/extension-created', '<!doctype html><title>Aux extension-created fixture</title><h1>Aux extension-created fixture</h1>');
  const page = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  await t.step('install the actual unpacked MV3 folder through Settings', { kind: 'ui', features: ['extensions'] }, async () => {
    await t.ax.key('command+,', 'hid');
    await t.ax.waitFor(control('Extensions'), 'visible');
    await t.ax.press(control('Extensions'));
    await t.ax.press(control('Install unpacked extension…'));
    await t.ax.openPanel(resolve(import.meta.dirname, '../fixtures/extension-actions'), { button: 'Select' });
    await t.ax.waitFor(control(fixtureName, 'AXStaticText'));
    const installed = { role: 'AXGroup', name: fixtureName, match: 'exact', scope: 'shell' };
    const enable = { ...control('Enable'), within: installed };
    // Unpacked installation can finish disabled; enable only through the real
    // reviewed Settings action before expecting an active Chromium action.
    if ((await t.ax.query(enable)).length) await t.ax.press(enable);
    await t.ax.waitFor({ ...control('Disable'), within: installed });
    t.assert.deepEqual(await t.ax.query(enable), [], 'The installed extension is actually enabled');
    await t.capture('extension-unpacked-installed');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: await t.rpc('pages.list') };
  });
  await t.ax.key('escape', 'hid');
  await t.step('pin the unpacked action and verify the native popup anchor within forty pixels', { kind: 'ui', features: ['extensions'] }, async () => {
    await t.ax.press(control('Extensions', 'AXPopUpButton'));
    await t.ax.press(control(`Pin ${fixtureName}`, 'AXMenuItem'));
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(action);
    const [button] = await t.ax.query(action);
    t.assert.ok(button?.frame, 'Pinned action has an actual native screen frame');
    const before = await t.ax.windows();
    await t.ax.press(action);
    await t.ax.waitFor(popup);
    const after = await t.ax.windows();
    const candidates = after.filter(window => !before.some(previous => previous.id === window.id));
    t.assert.equal(candidates.length, 1, 'Exactly one native popup window opened');
    const window = candidates[0], anchor = button.frame;
    const dx = Math.max(window.x - (anchor.x + anchor.width), anchor.x - (window.x + window.width), 0);
    const dy = Math.max(window.y - (anchor.y + anchor.height), anchor.y - (window.y + window.height), 0);
    t.assert.ok(dx <= 40 && dy <= 40, `Popup anchor gap ${dx},${dy} exceeds forty pixels`);
    await t.capture('extension-popup-anchored');
    return { ax: await t.ax.dump({ scope: 'any' }), native: { anchor, window, dx, dy }, rpc: await t.rpc('workspace.get') };
  });
  await t.ax.key('escape', 'hid');
  await t.step('open the native popup with the manifest command and persist a new command chord', { kind: 'ui', features: ['extensions'] }, async () => {
    await t.ax.key('command+shift+y', 'hid');
    await t.ax.waitFor(popup);
    await t.ax.key('escape', 'hid');
    await t.ax.key('command+,', 'hid');
    await t.ax.waitFor(control('Appearance'), 'visible');
    await t.ax.press(control('Appearance'));
    await t.ax.press(control('Manage shortcuts'));
    const shortcut = { name: '^Shortcut for Aux extension fixture', role: 'AXTextField', match: 'regex', scope: 'shell', index: 0 };
    await t.ax.waitFor(shortcut);
    await t.ax.type('Command+Shift+U', shortcut);
    await t.ax.press(control('Save shortcut'));
    await t.until('new extension shortcut persisted in Settings', async () => JSON.stringify(await t.ax.query(shortcut)).includes('Command+Shift+U'));
    await t.ax.key('escape', 'hid');
    await t.ax.key('command+shift+y', 'hid');
    await pause(400);
    t.assert.deepEqual(await t.ax.query(popup), [], 'The old extension chord is dead');
    await t.ax.key('command+shift+u', 'hid');
    await t.ax.waitFor(popup);
    await t.capture('extension-rebound-popup');
    return { ax: await t.ax.dump({ scope: 'any' }), rpc: await t.rpc('workspace.get') };
  });
  await t.ax.key('escape', 'hid');
  await t.restart();
  await t.ax.waitFor(action);
  await t.step('retain the pin and command through a real browser restart', { kind: 'ui', features: ['extensions'] }, async () => {
    await t.ax.key('command+shift+u', 'hid'); await t.ax.waitFor(popup);
    await t.capture('extension-command-after-restart');
    return { ax: await t.ax.dump({ scope: 'any' }), rpc: await t.rpc('pages.list') };
  });
  await t.step('embed the actual extension side-panel guest and exchange a worker message', { kind: 'ui', features: ['extensions'] }, async () => {
    await t.ax.press(control('Open fixture side panel', 'AXButton', 'any'));
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(control('Aux fixture side panel', 'AXHeading', 'any'));
    await t.ax.press(control('Wake service worker', 'AXButton', 'any'));
    await t.until('native extension guest received worker reply', async () => /Aux loopback/.test(JSON.stringify(await t.ax.dump({ scope: 'any' }))));
    await t.capture('extension-side-panel-guest');
    const ax = await t.ax.dump({ scope: 'any' });
    await t.ax.press(control('Close Aux extension fixture side panel'));
    await t.ax.waitFor(control('Aux fixture side panel', 'AXHeading', 'any'), 'absent');
    return { ax, rpc: await t.rpc('pages.list') };
  });
  await t.step('preserve native extension-created tab placement and switch to its existing Space', { kind: 'ui', features: ['extensions'] }, async () => {
    await setTabLayout(t, 'vertical', { role: 'AXRadioButton', name: '^Aux native Red(?: Close Aux native Red)?$', match: 'regex', scope: 'shell', index: 0 });
    const createSpace = async (name, color) => {
      const menu = { role: 'AXPopUpButton', name: '^(Personal|Aux extension Space A|Aux extension Space B)$', match: 'regex', scope: 'shell', index: 0 };
      await t.ax.waitFor(menu);
      await t.ax.press(menu);
      await t.ax.press(control('New space', 'AXMenuItem'));
      const input = { role: 'AXTextField', scope: 'shell', index: 0 };
      await t.ax.waitFor(input);
      t.assert.equal((await t.ax.query(input))[0].placeholder, 'Name', 'The actual Space editor owns this field');
      await t.ax.type(name, input);
      await t.ax.press(control(color, 'AXRadioButton'));
      await t.ax.press(control('Create'));
      await t.ax.waitFor(control('New space'), 'absent');
      const saved = await t.until('person-created native Space workspace is published', async () => (await t.rpc('workspaces.list')).find(workspace => workspace.name === name));
      return { ...saved, color };
    };
    const spaceA = await createSpace('Aux extension Space A', 'blue');
    const spaceB = await createSpace('Aux extension Space B', 'green');
    const menu = { role: 'AXPopUpButton', name: '^(Personal|Aux extension Space A|Aux extension Space B)$', match: 'regex', scope: 'shell', index: 0 };
    const selectSpace = async name => {
      await t.ax.press(menu);
      await t.ax.press({ name, match: 'exact', scope: 'shell', index: 0 });
      await t.ax.waitFor({ ...control(name, 'AXPopUpButton') });
    };
    await selectSpace('Personal');
    const moveOriginal = async destination => {
      const previousId = (await t.rpc('workspace.get')).tabPlacements?.[page.pageId]?.spaceId;
      const tab = { role: 'AXRadioButton', name: '^Aux native Red(?: Close Aux native Red)?$', match: 'regex', scope: 'shell', index: 0 };
      await t.ax.waitFor(tab);
      await t.ax.contextMenu(tab);
      await t.ax.press(control('Move tab…', 'AXMenuItem'));
      await t.ax.press(control(destination.name, 'AXMenuItem'));
      await selectSpace(destination.name);
      await t.ax.waitFor(tab);
      await t.ax.press(tab);
      const value = await t.until('original tab placement and activation published after person move', async () => {
        const workspace = await t.rpc('workspace.get');
        const id = workspace.tabPlacements?.[page.pageId]?.spaceId;
        return workspace.activePageId === page.pageId && id && id !== previousId && workspace;
      });
      const id = value.tabPlacements[page.pageId].spaceId;
      t.assert.ok(!destination.id || destination.id === id, 'An existing destination retains its original native identity');
      destination.id = id;
    };
    await moveOriginal(spaceA);
    const created = [];
    for (const button of ['Create fixture tab', 'Create opener fixture tab']) {
      const before = await t.rpc('pages.list');
      await t.ax.press(action); await t.ax.waitFor(popup);
      await t.ax.type(t.fixture.url, control('Loopback fixture origin', 'AXTextField', 'any'));
      await t.ax.press(control(button, 'AXButton', 'any'));
      const tab = await t.until('native extension-created tab published', async () => (await t.rpc('pages.list')).find(item =>
        item.url === `${t.fixture.url}/extension-created` && !before.some(old => old.pageId === item.pageId)));
      const workspace = await t.rpc('workspace.get');
      t.assert.equal(workspace.tabPlacements?.[tab.pageId]?.spaceId, spaceA.id, 'Native placement retains the active/opener Space');
      created.push(tab);
      await t.ax.key('escape', 'hid');
    }
    await moveOriginal(spaceB);
    t.assert.notEqual(spaceA.id, spaceB.id, 'The two person-created Spaces have distinct native identities');
    await t.ax.press(action); await t.ax.waitFor(popup);
    await t.ax.press(control('Activate fixture tab', 'AXButton', 'any'));
    const workspace = await t.until('extension activation selects its existing native page', async () => {
      const value = await t.rpc('workspace.get'); return value.activePageId === created.at(-1).pageId && value;
    });
    await t.ax.waitFor(control('Aux extension Space A'));
    await t.capture('extension-native-space-activation');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: { created, workspace, spaceA, spaceB } };
  });
  await t.step('give an Aux intercept chord precedence over the same extension chord in guest and shell fields', { kind: 'ui', features: ['extensions'] }, async () => {
    await t.ax.key('command+,', 'hid');
    await t.ax.waitFor(control('Appearance'), 'visible');
    await t.ax.press(control('Appearance')); await t.ax.press(control('Manage shortcuts'));
    const shortcut = { name: '^Shortcut for Aux extension fixture', role: 'AXTextField', match: 'regex', scope: 'shell', index: 0 };
    await t.ax.type('Command+K', shortcut); await t.ax.press(control('Save shortcut'));
    await t.ax.key('escape', 'hid');
    for (const location of ['guest', 'shell']) {
      if (location === 'guest') await t.ax.click(control('Aux extension-created fixture', 'AXHeading', 'page'));
      else await t.ax.key('command+l', 'hid');
      await t.ax.key('command+k', 'hid');
      await t.ax.waitFor(control('Command palette', 'AXTextField'));
      t.assert.deepEqual(await t.ax.query(popup), [], 'Extension must not supersede the Aux intercept command');
      await t.capture(`extension-aux-intercept-${location}`);
      await t.ax.key('escape', 'hid');
    }
    await t.rpc('pages.activate', { pageId: page.pageId });
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: await t.rpc('workspace.get') };
  });
  await t.step('show the real extension context-menu item on a loopback page', { kind: 'ui', features: ['extensions'] }, async () => {
    await t.ax.contextMenu(control('Red loopback fixture.', 'AXStaticText', 'page'));
    await t.ax.waitFor(control('Aux extension context fixture', 'AXMenuItem', 'any'));
    await t.capture('extension-context-menu');
    const ax = await t.ax.dump({ scope: 'any' });
    await t.ax.key('escape', 'hid');
    return { ax, rpc: { pages: await t.rpc('pages.list'), originalPageId: page.pageId } };
  });
}
