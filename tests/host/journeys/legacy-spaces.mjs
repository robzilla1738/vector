import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { shell, loadedPage, press } from '../fixtures/legacy-ui.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';

export const journey = { id: 'space-theme', title: 'Create, persist and reset an advanced Space color recipe', features: ['spaces'], devAcceptance: ['spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 150000, owner: 'LJ' };
export async function run(t) {
  await loadedPage(t, '/red');
  await setTabLayout(t, 'vertical', { role: 'AXRadioButton', name: '^Aux native Red(?: Close Aux native Red)?$', match: 'regex', scope: 'shell', index: 0 });
  const name = 'Spectrum Fixture';
  const theme = { hue: 195, lightness: 62, intensity: 80, inverted: true };
  const nativeSpace = () => JSON.parse(readFileSync(join(t.app.userDataDir, 'Default/Preferences'), 'utf8')).aux?.organization?.v2?.shared?.spaces?.find(space => space.name === name);
  const menu = async () => {
    const button = { role: 'AXPopUpButton', name: '^(Personal|Spectrum Fixture)$', match: 'regex', scope: 'shell', index: 0 };
    await t.ax.waitFor(button);
    await press(t, button);
  };
  const edit = async () => { await menu(); await press(t, shell(`Edit ${name}`, 'AXMenuItem')); await t.ax.waitFor(shell('Edit space')); };
  const range = async (label, min, value) => {
    await t.ax.waitFor(shell(label, 'AXSlider'));
    await t.ax.click(shell(label, 'AXSlider'));
    await t.ax.key('home', 'hid');
    for (let i = min; i < value; i++) await t.ax.key('right', 'hid');
  };
  await t.step('create a Space with the full advanced theme and native organization persistence', { kind: 'ui', features: ['spaces'] }, async () => {
    await menu();
    await press(t, shell('New space', 'AXMenuItem'));
    const nameInput = { role: 'AXTextField', scope: 'shell', index: 0 };
    await t.ax.waitFor(nameInput);
    t.assert.equal((await t.ax.query(nameInput))[0].placeholder, 'Name', 'The unnamed native field must be the Space name input');
    await t.ax.type(name, nameInput);
    await press(t, shell('Custom color', 'AXRadioButton'));
    await range('Color dial', 0, 195);
    await range('Lightness', 20, 62);
    await range('Intensity', 0, 80);
    await press(t, { ...shell('Invert lightness', 'AXCheckBox'), match: 'contains' });
    await press(t, shell('Cycle grain', 'AXButton'));
    await t.capture('space-theme-edit');
    await press(t, shell('Create', 'AXButton'));
    await t.ax.waitFor(shell('New space'), 'absent');
    const native = await t.until('native organization saves advanced theme', () => {
      const value = nativeSpace();
      return value?.grain === 25 && Object.entries(theme).every(([key, expected]) => value.theme?.[key] === expected) && value;
    }, 30000);
    const rpc = await t.rpc('workspaces.list');
    t.assert.ok(rpc.some(workspace => workspace.name === name));
    await edit();
    const ax = await t.ax.dump({ scope: 'shell' });
    for (const label of ['Color dial', 'Lightness', 'Intensity', 'Invert lightness', 'Grain']) t.assert.match(JSON.stringify(ax), new RegExp(label));
    t.assert.doesNotMatch(JSON.stringify(ax), /Profile organization could not be saved/);
    await t.capture('space-theme-reopened');
    await press(t, shell('Cancel', 'AXButton'));
    return { ax, rpc: { workspaces: rpc, native } };
  });
  await t.restart();
  await t.step('reset the persisted advanced Space theme', { kind: 'ui', features: ['spaces'] }, async () => {
    t.assert.deepEqual(nativeSpace().theme, theme);
    t.assert.equal(nativeSpace().grain, 25);
    await edit();
    await press(t, shell('Reset theme', 'AXButton'));
    await press(t, shell('Save', 'AXButton'));
    await t.ax.waitFor(shell('Edit space'), 'absent');
    const native = await t.until('native theme reset persisted', () => {
      const value = nativeSpace();
      return value?.color === 'violet' && value.grain === 0 && !value.theme && value;
    }, 30000);
    await edit();
    await t.ax.waitFor(shell('violet', 'AXRadioButton'));
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('workspaces.list');
    t.assert.ok(rpc.some(workspace => workspace.name === name));
    await t.capture('space-theme-reset');
    await press(t, shell('Cancel', 'AXButton'));
    return { ax, rpc: { workspaces: rpc, native } };
  });
}
