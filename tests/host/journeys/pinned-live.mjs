import { organizationFixtures } from '../lib/organization-fixtures.mjs';

const s = (name, role = 'AXButton') => ({ name, role, match: 'exact', scope: 'shell', index: 0 });
const folder = name => ({ name: `^${name}(?: tab group.*)?$`, role: 'AXButton', match: 'regex', scope: 'shell', index: 0 });
async function showSidebar(t) { const button = s('Show sidebar'); if ((await t.ax.query(button)).length) await t.ax.press(button); }
async function choose(t, label, option) { await t.ax.press(s(label, 'AXPopUpButton')); await t.ax.press(s(option, 'AXMenuItem')); }
async function makeFolder(t, name, kind, configure) {
  await showSidebar(t); await t.ax.press(s('Personal')); await t.ax.press(s('New folder', 'AXMenuItem'));
  await t.ax.type(name, s('Folder name', 'AXTextField')); await t.ax.key('return', 'hid');
  await t.ax.contextMenu(folder(name)); await t.ax.press(s('Make live folder…', 'AXMenuItem'));
  if (kind !== 'RSS or Atom') await choose(t, 'Source', kind);
  await configure(); await t.ax.press(s('Save live folder')); await t.ax.waitFor(s('Save live folder'), 'absent');
}
export const journey = {
  id: 'pinned-live', title: 'Bound pinned apps and cached live source rows through native UI', features: ['pinnedApps', 'liveFolders', 'folders', 'tabSections'],
  devAcceptance: ['pinnedApps', 'liveFolders', 'folders', 'tabSections', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: ({ fixture, appearance }) => ({ args: [`--aux-loopback-services-url=${fixture.url}/`, ...(appearance ? [] : ['--aux-native-performance-observer'])] }),
  prepare: ({ fixture }) => { organizationFixtures(fixture); }, timeoutMs: 240_000, owner: 'L8',
};
export async function run(t) {
  t.fixture.route('/inbox', '<!doctype html><html><head><title>(3) Inbox</title></head><body><h1>Inbox</h1></body></html>');
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/red`, activate: true });
  await t.until('Red loaded', async () => (await t.rpc('pages.list')).some(page => page.pageId === red.pageId && !page.loading));
  await showSidebar(t);
  await t.step('pin follows its bound tab, exposes unread and resets URL drift', { kind: 'ui', features: ['pinnedApps'] }, async () => {
    await t.ax.key('command+shift+d', 'hid'); await t.ax.waitFor(s('Aux native Red'));
    await t.ax.key('command+l', 'hid'); await t.ax.type(`${t.fixture.url}/inbox`); await t.ax.key('return', 'hid');
    await t.ax.waitFor(s('Aux native Red, 3 unread'));
    await t.ax.contextMenu(s('Aux native Red, 3 unread'));
    const reset = { name: 'Reset to pinned URL', match: 'contains', scope: 'shell', index: 0 };
    await t.ax.waitFor(reset); await t.ax.press(reset);
    const pages = await t.until('same bound tab returned to Red', async () => {
      const list = await t.rpc('pages.list'); return list.some(page => page.pageId === red.pageId && page.url === `${t.fixture.url}/red` && !page.loading) && list;
    });
    await t.capture('pinned-reset'); return { ax: await t.ax.dump(), rpc: { pages } };
  });
  await t.step('Cmd W unloads a pin and reopening retains its page ID', { kind: 'ui', features: ['pinnedApps'] }, async () => {
    await t.ax.key('command+w', 'hid');
    await t.until('bound tab unloaded', async () => !(await t.rpc('pages.list')).some(page => page.pageId === red.pageId));
    await t.ax.press(s('Aux native Red'));
    const pages = await t.until('pin materialized with same ID', async () => { const pages = await t.rpc('pages.list'); return pages.some(page => page.pageId === red.pageId) && pages; });
    await t.ax.contextMenu(s('Aux native Red')); await t.ax.press(s('Keep awake', 'AXMenuItem'));
    await t.capture('pin-keep-awake'); return { ax: await t.ax.dump(), rpc: { pages } };
  });
  await t.step('RSS rows open into their folder and read dots survive refresh', { kind: 'ui', features: ['liveFolders', 'folders', 'tabSections'] }, async () => {
    await makeFolder(t, 'RSS test', 'RSS or Atom', () => t.ax.type(`${t.fixture.url}/organization/feed`, s('Feed URL', 'AXTextField')));
    await t.ax.waitFor(s('Read Red, unread')); await t.ax.waitFor(s('Read Blue, unread'));
    await t.ax.press(s('Read Red, unread')); await showSidebar(t); await t.ax.waitFor(s('Read Red'));
    await t.ax.press(s('Refresh live folder')); await t.ax.waitFor(s('Read Red')); await t.ax.waitFor(s('Read Blue, unread'));
    const pages = await t.rpc('pages.list'); t.assert.ok(pages.some(page => page.pageId !== red.pageId && page.url === `${t.fixture.url}/red`));
    await t.capture('rss-read-dot'); return { ax: await t.ax.dump(), rpc: { pages } };
  });
  if (!t.appearanceEnabled) {
    await t.step('20 AC source refreshes through actual committed RSS rows', { kind: 'ui', features: ['liveFolders'] }, async () => {
      const report = await t.measureOrganizationWork({ metric: 'live-folder-refresh',
        prepareTrial: async () => {
          await t.ax.waitFor(s('Read Red')); await t.ax.waitFor(s('Read Blue, unread'));
          const refresh = await t.ax.query(s('Refresh live folder'));
          t.assert.equal(refresh.length, 1, 'The actual RSS folder owns one refresh control');
          t.assert.equal(refresh[0].enabled, true, 'The prior native refresh and row commit completed');
        },
        performWork: async () => {
          await t.ax.press(s('Refresh live folder'));
          await t.ax.waitFor(s('Read Red')); await t.ax.waitFor(s('Read Blue, unread'));
        } });
      return { ax: await t.ax.dump(), rpc: { performance: report } };
    });
  }
  await t.step('GitHub PAT is pasted in owner UI and Calendar completes real OAuth callback', { kind: 'ui', features: ['liveFolders'] }, async () => {
    await t.ax.key('command+,', 'hid'); await t.ax.waitFor(s('MCP & Connectors')); await t.ax.press(s('MCP & Connectors'));
    await t.ax.type('Fixture GitHub', s('Connection name', 'AXTextField'));
    await t.ax.type('aux-loopback-fixture-token', s('Personal access token', 'AXSecureTextField')); await t.ax.press(s('Connect GitHub'));
    const githubAccount = s('Fixture GitHub', 'AXStaticText');
    await t.ax.waitFor(githubAccount);
    const githubLogin = { ...s('^\\s*·\\s*aux-fixture$', 'AXStaticText'), match: 'regex' };
    await t.ax.waitFor(githubLogin);
    const github = { account: await t.ax.query(githubAccount), login: await t.ax.query(githubLogin) };
    t.assert.equal(github.account.length, 1, 'The actual trusted account list publishes fixture name and login');
    await t.ax.press(s('Connect Google Calendar'));
    await t.until('real Calendar OAuth account stored', async () => (await t.rpc('calendar.connections.list')).connections.some(account => account.label === 'Aux Calendar fixture'), 30_000);
    await t.ax.key('escape', 'hid');
    await makeFolder(t, 'GitHub test', 'GitHub', () => choose(t, 'Account', 'Fixture GitHub'));
    await t.ax.waitFor(s('Review Aux work, unread'));
    await makeFolder(t, 'Calendar test', "Today's Calendar events with links", () => choose(t, 'Account', 'Aux Calendar fixture'));
    await t.ax.waitFor(s('Review the browser, unread')); await t.capture('github-calendar-live');
    return { ax: await t.ax.dump(), githubAccount: github, rpc: { calendar: await t.rpc('calendar.connections.list') } };
  });
  await t.step('restart retains live rows and read state', { kind: 'ui', features: ['liveFolders', 'pinnedApps'] }, async () => {
    await t.restart(); await showSidebar(t); await t.ax.waitFor(s('Read Red')); await t.ax.waitFor(s('Read Blue, unread'));
    await t.ax.waitFor(s('Review Aux work, unread')); await t.ax.waitFor(s('Review the browser, unread')); await t.ax.waitFor(s('Aux native Red'));
    await t.capture('pinned-live-restarted'); return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list') } };
  });
}
