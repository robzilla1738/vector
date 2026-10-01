export const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
export async function settings(t, category) {
  await t.ax.key('command+,', 'hid');
  await t.ax.waitFor(shell(category, 'AXButton'));
  await t.ax.press(shell(category, 'AXButton'));
}
export async function loadedPage(t, path) {
  const page = await t.rpc('pages.open', { url: `${t.fixture.url}${path}`, activate: true });
  await t.until('native fixture loaded', async () => (await t.rpc('pages.list')).some(item => item.pageId === page.pageId && !item.loading));
  return page;
}

export async function press(t, selector) {
  await t.ax.waitFor(selector, 'enabled');
  return t.ax.press(selector);
}
