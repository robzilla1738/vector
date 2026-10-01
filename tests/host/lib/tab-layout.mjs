/** Choose the real tab-menu setting and expose the vertical tab controls. */
export async function setTabLayout(t, layout, tab) {
  t.assert.ok(['horizontal', 'vertical'].includes(layout));
  if ((await t.rpc('settings.get')).tabLayout !== layout) {
    await t.ax.waitFor(tab);
    await t.ax.contextMenu(tab);
    const item = { role: 'AXMenuItem', name: layout === 'vertical' ? 'Show Tabs Vertically' : 'Show Tabs Horizontally',
      match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(item);
    await t.ax.press(item);
    await t.until(`${layout} tab layout saved`, async () => (await t.rpc('settings.get')).tabLayout === layout);
  }
  const tabs = { role: 'AXTabGroup', name: layout === 'vertical' ? 'Tabs' : 'Browser tabs', match: 'exact', scope: 'shell' };
  if (layout === 'vertical' && !(await t.ax.query(tabs)).length) {
    const show = { role: 'AXButton', name: 'Show sidebar', match: 'exact', scope: 'shell', index: 0 };
    await t.ax.waitFor(show);
    await t.ax.press(show);
  }
  await t.ax.waitFor(tabs);
}
