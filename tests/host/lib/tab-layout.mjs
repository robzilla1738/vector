/** Choose the real tab-menu setting and expose the vertical tab controls. */
export async function setTabLayout(t, layout, tab) {
  t.assert.ok(['horizontal', 'vertical'].includes(layout));
  if ((await t.rpc('settings.get')).tabLayout !== layout) {
    await t.ax.waitFor(tab);
    await t.ax.contextMenu(tab);
    const item = { role: 'AXMenuItem', name: layout === 'vertical' ? 'Show Tabs Vertically' : 'Show Tabs Horizontally',
      match: 'exact', scope: 'shell', enabled: true };
    const visibleItems = async () => (await t.ax.query(item)).filter(row => {
      const frame = row.frame;
      return frame && [frame.x, frame.y, frame.width, frame.height].every(Number.isFinite)
        && frame.width > 0 && frame.height > 0;
    });
    const selected = await t.until('one visible tab-layout menu item', async () => {
      const rows = await visibleItems();
      t.assert.ok(rows.length <= 1, 'Tab-layout menu must have one visible owned control');
      return rows.length === 1 ? rows[0] : null;
    });
    const frame = selected.frame;
    const windows = (await t.ax.windows()).filter(window => window.layer === 0 &&
      frame.x >= window.x && frame.y >= window.y &&
      frame.x + frame.width <= window.x + window.width &&
      frame.y + frame.height <= window.y + window.height);
    t.assert.equal(windows.length, 1, 'Tab-layout control must be fully inside one owned window');
    await t.ax.request('click', { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 });
    await t.until('tab-layout menu closed after physical click', async () => !(await visibleItems()).length);
    await t.until(`${layout} tab layout saved`, async () => (await t.rpc('settings.get')).tabLayout === layout);
  }
  const tabs = { role: 'AXTabGroup', name: layout === 'vertical' ? 'Tabs' : 'Browser tabs', match: 'exact', scope: 'shell' };
  if (layout === 'vertical' && !(await t.ax.query(tabs)).length) {
    const show = { role: 'AXButton', name: 'Show sidebar', match: 'exact', scope: 'shell', index: 0 };
    if (!(await t.ax.query(show)).length) {
      const windows = (await t.ax.windows()).filter(window => window.layer === 0 && window.width >= 800);
      t.assert.equal(windows.length, 1, "Reveal controls in the exact owned browser window");
      const window = windows[0];
      await t.ax.request("hover", { x: window.x + window.width / 2, y: window.y + 2 });
    }
    await t.ax.waitFor(show, "visible");
    await t.ax.press(show);
  }
  await t.ax.waitFor(tabs);
}
