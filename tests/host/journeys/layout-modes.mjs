import { captureSettingsRail } from '../lib/chat-settings-capture.mjs';
import { captureAppearanceTextState } from '../lib/appearance-text-state.mjs';
import { captureHomeJourneyState as captureLayoutState } from '../lib/home-capture.mjs';
import { performance } from 'node:perf_hooks';
import { setTabLayout } from '../lib/tab-layout.mjs';

const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const address = shell('Address, search, and agent prompt', 'AXComboBox');
const tabs = layout => shell(layout === 'vertical' ? 'Tabs' : 'Browser tabs', 'AXTabGroup');
const visible = (rows, window) => rows.filter(({ frame, hidden }) => frame?.width > 0 && frame?.height > 0 && hidden !== true && frame.x < window.x + window.width && frame.y < window.y + window.height && frame.x + frame.width > window.x && frame.y + frame.height > window.y);
async function mainWindow(t) {
  const windows = (await t.ax.windows()).filter(window => window.layer === 0);
  t.assert.equal(windows.length, 1, 'Layout journey requires one normal fixture window');
  const window = windows[0];
  t.assert.ok(['x', 'y', 'width', 'height'].every(key => Number.isFinite(window[key])) && window.width > 0 && window.height > 0,
    'Layout journey requires an actual positive finite window frame');
  return window;
}
async function centerPointer(t, window) {
  await t.ax.request('hover', { x: window.x + window.width / 2, y: window.y + window.height / 2 });
}
async function setting(t, label, key, value) {
  await t.ax.key('command+,', 'hid');
  await t.ax.waitFor(shell('Appearance', 'AXButton'));
  await t.ax.press(shell('Appearance', 'AXButton'));
  const search = shell('Search settings', 'AXTextField');
  await t.ax.waitFor(search, 'visible');
  if (t.appearanceEnabled && label === 'Auto-hide toolbar' && value === false) {
    const layout = (await t.rpc('settings.get')).tabLayout;
    await t.ax.focus(search);
    t.assert.equal((await t.ax.query(search))[0]?.focused, true, 'Settings search must own genuine focus');
    await captureLayoutState(t, `settings-${layout}-search-focused`, 'settings-search-focused');
    const originalPages = await t.rpc('pages.list');
    await captureAppearanceTextState(t, { selector: search,
      text: 'A quiet weekend museum itinerary with friends and dinner plans',
      name: `settings-${layout}-long-search-no-results`, state: 'settings-long-search-no-results',
      ready: () => t.ax.waitFor({ name: 'No settings found for', match: 'contains', scope: 'shell', index: 0 }) });
    t.assert.deepEqual(await t.rpc('pages.list'), originalPages, 'Settings search must not create or navigate a page');
    await captureSettingsRail(t, layout);
  }
  await t.ax.type(label, search);
  const result = { name: `^Appearance ${label}(?: |$)`, role: 'AXButton', match: 'regex', scope: 'shell', index: 0 };
  await t.ax.press(result);
  const control = shell(label, 'AXCheckBox');
  await t.ax.waitFor(control, 'visible');
  if ((await t.rpc('settings.get'))[key] !== value) await t.ax.press(control);
  await t.until(`${label} saved`, async () => (await t.rpc('settings.get'))[key] === value);
  await t.ax.key('escape', 'hid');
  await t.ax.key('command+l', 'hid');
  await t.ax.key('escape', 'hid');
}
async function sidebarModes(t) {
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  await t.until('Red fixture loaded', async () => (await t.rpc('pages.list')).some(page => page.pageId === red.pageId && !page.loading));
  const tab = { role: 'AXRadioButton', name: '^Aux native Red(?: Close Aux native Red)?$', match: 'regex', scope: 'shell', index: 0 };
  await setTabLayout(t, 'vertical', tab);
  const window = await mainWindow(t);
  await t.step('keep the address field visible when toolbar auto-hide is disabled', { kind: 'ui', features: ['autoHideToolbar', 'layouts'] }, async () => {
    await setting(t, 'Auto-hide toolbar', 'toolbarAutoHide', false);
    await centerPointer(t, window);
    await t.ax.waitFor(address);
    const ax = await t.ax.dump({ scope: 'shell' });
    t.assert.ok(visible(await t.ax.query(address), window).length, 'Address field must remain visible away from the edge');
    const rpc = await t.rpc('settings.get');
    t.assert.equal(rpc.toolbarAutoHide, false);
    t.assert.equal(rpc.tabLayout, 'vertical');
    await captureLayoutState(t, 'toolbar-always-visible', 'toolbar-always-visible');
    return { ax, rpc };
  });
  await t.step('hide the toolbar and reveal it from the top two pixels within 216ms', { kind: 'ui', features: ['autoHideToolbar'] }, async () => {
    await setting(t, 'Auto-hide toolbar', 'toolbarAutoHide', true);
    await centerPointer(t, window);
    await t.until('address field hidden away from edge', async () => !visible(await t.ax.query(address), window).length);
    const started = performance.now();
    await t.ax.request('hover', { x: window.x + window.width / 2, y: window.y + 2 });
    await t.until('toolbar edge reveal', async () => visible(await t.ax.query(address), window).length);
    const elapsedMs = performance.now() - started;
    t.assert.ok(elapsedMs <= 216, `Toolbar reveal took ${elapsedMs.toFixed(1)}ms`);
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('settings.get');
    t.assert.equal(rpc.toolbarAutoHide, true);
    await captureLayoutState(t, 'toolbar-edge-reveal', 'toolbar-edge-reveal');
    return { ax, rpc: { settings: rpc, elapsedMs } };
  });
  await t.step('snap the sidebar below 111px to hidden and restore it with the registered chord', { kind: 'ui', features: ['floatingSidebar', 'layouts'] }, async () => {
    await centerPointer(t, window);
    const show = shell('Show sidebar', 'AXButton');
    if ((await t.ax.query(show)).length) await t.ax.press(show);
    const handle = shell('Sidebar width', 'AXSplitter');
    await t.ax.waitFor(handle);
    const [row] = await t.ax.query(handle);
    t.assert.ok(row.frame?.height > 0);
    const y = row.frame.y + row.frame.height / 2;
    await t.ax.drag({ x: row.frame.x + row.frame.width / 2, y }, { x: window.x + 100, y }, { steps: 12, holdMs: 100 });
    await centerPointer(t, window);
    await t.ax.waitFor(show);
    t.assert.equal(visible(await t.ax.query(tabs('vertical')), window).length, 0);
    await captureLayoutState(t, 'sidebar-snapped-hidden', 'sidebar-snapped-hidden');
    await t.ax.key('command+s', 'hid');
    await t.ax.waitFor(tabs('vertical'));
    t.assert.ok(visible(await t.ax.query(tabs('vertical')), window).length);
    await t.ax.key('command+s', 'hid');
    await centerPointer(t, window);
    await t.ax.waitFor(show);
    t.assert.equal(visible(await t.ax.query(tabs('vertical')), window).length, 0);
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('workspace.get');
    t.assert.equal(rpc.activePageId, red.pageId);
    await captureLayoutState(t, 'sidebar-command-hidden', 'sidebar-command-hidden');
    return { ax, rpc };
  });
}
async function minimalUi(t) {
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  await t.until('Red fixture loaded', async () => (await t.rpc('pages.list')).some(page => page.pageId === red.pageId && !page.loading));
  const tab = { role: 'AXRadioButton', name: '^Aux native Red(?: Close Aux native Red)?$', match: 'regex', scope: 'shell', index: 0 };
  for (const layout of ['vertical', 'horizontal']) {
    await setTabLayout(t, layout, tab);
    const window = await mainWindow(t);
    await setting(t, 'Auto-hide toolbar', 'toolbarAutoHide', false);
    await t.step(`${layout} Minimal UI fills the window and restores edge controls`, { kind: 'ui', features: ['minimalUi'] }, async () => {
      await centerPointer(t, window);
      const addressTarget = { ...address }, tabsTarget = { ...tabs(layout) };
      delete addressTarget.index; delete tabsTarget.index;
      const performanceReport = t.appearanceEnabled ? null : await t.measureNativeKeyEffects({
        metric: 'minimal-toggle', chord: 'command+shift+b', selector: addressTarget,
        effect: { expectedVisible: false }, additionalHiddenSelectors: [tabsTarget],
        async prepareTrial() {
          if ((await t.rpc('settings.get')).minimalUi) {
            await t.ax.key('command+shift+b', 'hid');
            await t.until('Minimal UI exits before the next actual trial', async () => !(await t.rpc('settings.get')).minimalUi);
          }
          await centerPointer(t, window);
          await t.ax.waitFor(addressTarget, 'visible');
          await t.ax.waitFor(tabsTarget, 'visible');
        },
      });
      const timing = performanceReport?.measurements.at(-1) ?? await t.ax.request('measureKey', {
        chord: 'command+shift+b', selector: addressTarget, expectedVisible: false,
        additionalHiddenSelectors: [tabsTarget], timeoutMs: 250,
      });
      await t.until('Minimal UI saved', async () => (await t.rpc('settings.get')).minimalUi === true);
      await t.until('Minimal UI removes tab and address controls', async () => !visible(await t.ax.query(tabs(layout)), window).length && !visible(await t.ax.query(address), window).length);
      t.assert.equal(timing.via, 'hid');
      t.assert.deepEqual(timing.hiddenSelectors, [addressTarget, tabsTarget]);
      t.assert.deepEqual(timing.visibleElements, []);
      for (const endpoint of ['postedAtNs', 'observedAtNs', 'effectConfirmedAtNs']) t.assert.match(timing[endpoint], /^[0-9]+$/);
      t.assert.ok(BigInt(timing.postedAtNs) <= BigInt(timing.observedAtNs) && BigInt(timing.observedAtNs) <= BigInt(timing.effectConfirmedAtNs));
      const elapsedMs = Number(BigInt(timing.effectConfirmedAtNs) - BigInt(timing.postedAtNs)) / 1_000_000;
      t.assert.equal(timing.elapsedMs, elapsedMs);
      t.assert.ok(elapsedMs <= 250, `Minimal UI toggle took ${elapsedMs.toFixed(1)}ms`);
      const ax = await t.ax.dump({ scope: 'any' });
      const page = ax.find(row => row.role === 'AXWebArea' && row.name === 'Aux native Red' && row.frame?.width > 0);
      t.assert.ok(page?.frame, 'Native page frame must be present');
      const coverage = page.frame.width * page.frame.height / (window.width * window.height);
      t.assert.ok(coverage >= .99, `Minimal UI page covers ${(coverage * 100).toFixed(2)}% of its window`);
      await captureLayoutState(t, `minimal-${layout}-edge-to-edge`, `minimal-${layout}-edge-to-edge`);
      await t.ax.request('hover', { x: window.x + window.width / 2, y: window.y + 2 });
      await t.until('Minimal UI top edge reveals toolbar', async () => visible(await t.ax.query(address), window).length);
      await centerPointer(t, window);
      await t.ax.request('hover', { x: window.x + 2, y: window.y + window.height / 2 });
      await t.until('Minimal UI left edge reveals sidebar', async () => visible(await t.ax.query(tabs(layout)), window).length);
      await captureLayoutState(t, `minimal-${layout}-edge-controls`, `minimal-${layout}-edge-controls`);
      await t.ax.key('command+shift+b', 'hid');
      await t.until('Minimal UI exits', async () => (await t.rpc('settings.get')).minimalUi === false);
      const rpc = await t.rpc('workspace.get');
      t.assert.equal(rpc.activePageId, red.pageId);
      return { ax, rpc: { workspace: rpc, settings: await t.rpc('settings.get'), coverage, elapsedMs, timing, performanceReport } };
    });
  }
}
export const journeys = [
  { journey: { id: 'sidebar-modes', title: 'Persist toolbar visibility, edge reveal and sidebar snap and command behavior', features: ['floatingSidebar', 'autoHideToolbar', 'layouts'], devAcceptance: ['floatingSidebar', 'autoHideToolbar', 'layouts', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 120000, owner: 'L2' }, run: sidebarModes },
  { journey: { id: 'minimal-ui', title: 'Minimal UI geometry and edge reveal in both tab layouts', features: ['minimalUi'], devAcceptance: ['minimalUi', 'floatingSidebar', 'autoHideToolbar', 'layouts', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: ({ appearance }) => ({ perf: !appearance }), timeoutMs: 120000, owner: 'L2' }, run: minimalUi },
];
