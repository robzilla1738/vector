import { setTabLayout } from '../lib/tab-layout.mjs';
import { fixturePage } from '../lib/fixture.mjs';

export const journey = {
  id: 'split-fluid', title: 'Create, restore, resize and reflow native split panes', features: ['splitView'],
  devAcceptance: ['splitView', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 180_000, owner: 'L5',
};
const tab = color => ({ role: 'AXRadioButton', name: `^Aux native ${color}(?: Close Aux native ${color})?$`, match: 'regex', scope: 'shell', index: 0 });
const button = name => ({ role: 'AXButton', name, match: 'exact', scope: 'shell', index: 0 });
const divider = index => ({ role: 'AXSplitter', name: `Resize split divider ${index}`, match: 'exact', scope: 'shell', index: 0 });
async function panes(t, titles, ids) {
  const ax = await t.ax.dump();
  const visible = ax.filter(item => item.role === 'AXWebArea' && titles.includes(item.name) && item.frame?.width > 0 && item.frame?.height > 0);
  t.assert.equal(visible.length, titles.length, 'Every split WebContents must be attached and visible');
  t.assert.ok(visible.every(item => item.frame.width >= 200 && item.frame.height >= 200), 'Every native pane meets the minimum');
  const pages = await t.rpc('pages.list');
  t.assert.ok(ids.every(id => pages.some(page => page.pageId === id)), 'All displayed panes remain live native pages');
  return { ax, rpc: { pages, workspace: await t.rpc('workspace.get') } };
}
async function edgeDrop(t, color, edge) {
  let areas;
  await t.until('native page ready for drop geometry', async () => {
    areas = await t.ax.query({ role: 'AXWebArea', name: '^Aux native (Red|Blue|Green)$', match: 'regex', scope: 'page' });
    return areas.length > 0 && areas.every(area => area.frame?.width >= 200 && area.frame?.height >= 200);
  });
  t.assert.ok(areas.length && areas.every(area => area.frame), 'A real native page supplies the drop geometry');
  const left = Math.min(...areas.map(area => area.frame.x)), top = Math.min(...areas.map(area => area.frame.y));
  const right = Math.max(...areas.map(area => area.frame.x + area.frame.width)), bottom = Math.max(...areas.map(area => area.frame.y + area.frame.height));
  const point = edge === 'right' ? { x: right - 20, y: (top + bottom) / 2 } : { x: (left + right) / 2, y: bottom - 20 };
  await t.ax.drag({ selector: tab(color) }, point, { steps: 30, destinationHoldMs: 1100 });
}
export async function run(t) {
  t.fixture.route('/gold', fixturePage('Aux native Gold', '<p>Fourth native split fixture.</p>', '#d6ae45'));
  const opened = {};
  for (const color of ['Red', 'Blue', 'Green', 'Gold']) opened[color] = await t.rpc('pages.open', { url: `${t.fixture.url}/${color.toLowerCase()}`, activate: color === 'Red' });
  await t.until('four fixtures loaded', async () => (await t.rpc('pages.list')).filter(page => Object.values(opened).some(item => item.pageId === page.pageId) && !page.loading).length === 4);
  const ids = colors => colors.map(color => opened[color].pageId), titles = colors => colors.map(color => `Aux native ${color}`);
  await t.step('dwell-drop Blue on the right edge of Red', { kind: 'ui', features: ['splitView'] }, async () => {
    await setTabLayout(t, 'vertical', tab('Blue')); await t.ax.press(tab('Red')); await edgeDrop(t, 'Blue', 'right');
    await t.ax.waitFor(divider(1)); await t.ax.waitFor(button('Swap split sides'));
    await t.until('pair mirrored into TabStripModel', async () => { const pages = await t.rpc('pages.list'); const pair = pages.filter(page => ids(['Red', 'Blue']).includes(page.pageId)); return pair.length === 2 && pair.every(page => page.split) && pair[0].split.id === pair[1].split.id; });
    await t.capture('split-fluid-two'); return panes(t, titles(['Red', 'Blue']), ids(['Red', 'Blue']));
  });
  await t.step('restore the native pair after restart', { kind: 'ui', features: ['splitView'] }, async () => {
    await t.restart(); await t.ax.press(tab('Red')); await t.ax.waitFor(divider(1));
    const observations = await panes(t, titles(['Red', 'Blue']), ids(['Red', 'Blue']));
    const pair = observations.rpc.pages.filter(page => ids(['Red', 'Blue']).includes(page.pageId));
    t.assert.ok(pair.every(page => page.split) && pair[0].split.id === pair[1].split.id, 'Session restoration retains the native split identity');
    await t.capture('split-fluid-restored'); return observations;
  });
  await t.step('add a third pane below the pair and swap it with the keyboard', { kind: 'ui', features: ['splitView'] }, async () => {
    await edgeDrop(t, 'Green', 'bottom'); await t.ax.waitFor(divider(2));
    const before = (await t.ax.query({ role: 'AXWebArea', name: 'Aux native Green', match: 'exact', scope: 'page', index: 0 }))[0].frame;
    await t.ax.key('control+shift+\\', 'hid');
    await t.until('focused pane moves after swap', async () => { const area = (await t.ax.query({ role: 'AXWebArea', name: 'Aux native Green', match: 'exact', scope: 'page', index: 0 }))[0]; return area?.frame && (area.frame.x !== before.x || area.frame.y !== before.y); });
    await t.capture('split-fluid-three'); return panes(t, titles(['Red', 'Blue', 'Green']), ids(['Red', 'Blue', 'Green']));
  });
  await t.step('add the fourth pane, resize and reset its divider', { kind: 'ui', features: ['splitView'] }, async () => {
    await edgeDrop(t, 'Gold', 'right'); await t.ax.waitFor(divider(3));
    await t.ax.focus(divider(1)); await t.ax.key('shift+right', 'hid'); await t.ax.key('left', 'hid');
    await t.ax.click(divider(1), { count: 2 });
    await t.capture('split-fluid-four'); return panes(t, titles(['Red', 'Blue', 'Green', 'Gold']), ids(['Red', 'Blue', 'Green', 'Gold']));
  });
  await t.step('close one pane and reflow the remaining native pages', { kind: 'ui', features: ['splitView'] }, async () => {
    await t.ax.key('control+shift+-', 'hid'); await t.ax.waitFor(divider(3), 'absent');
    await t.until('closed pane removed natively', async () => !(await t.rpc('pages.list')).some(page => page.pageId === opened.Gold.pageId));
    await t.capture('split-fluid-reflow'); return panes(t, titles(['Red', 'Blue', 'Green']), ids(['Red', 'Blue', 'Green']));
  });
  await t.step('separate the split while retaining every remaining page', { kind: 'ui', features: ['splitView'] }, async () => {
    await t.ax.press(button('Separate split tabs')); await t.ax.waitFor(divider(1), 'absent');
    const pages = await t.rpc('pages.list'); t.assert.ok(ids(['Red', 'Blue', 'Green']).every(id => pages.some(page => page.pageId === id && !page.split)));
    return { ax: await t.ax.dump(), rpc: { pages } };
  });
}
