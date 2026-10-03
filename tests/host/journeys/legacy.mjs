import { captureHomeJourneyState as captureLegacyState } from '../lib/home-capture.mjs';
/** Frozen-runner provenance for the 22 former claims. Ports replace these flags, never extend them. */
export const LEGACY_JOURNEY_FLAGS = {
  sitePermissions: ['--site-controls'], reader: ['--reader'], inboundAgents: ['--agent-connections'],
  extensions: ['--selector-extension'], electronMigration: ['--runtime-backup-restore'], quickAsk: ['--quick-ask-focus'],
  aiTranslate: ['--translation'], profiles: ['--profiles'], httpsFirst: ['--settings-https-first'],
  contentBlocking: ['--settings-content-blocking', '--settings-custom-list'], pageZoom: ['--regular-page-zoom'],
  automations: ['--settings-automations-create', '--settings-automations-fire'], spaces: ['--space-theme-advanced'],
  outboundMcp: ['--outbound-mcp-settings'], aiTidy: ['--tidy-receipt-restart', '--tidy-changed-state'],
  archive: ['--archive-tabs-ui'], tabLifecycle: ['--memory-saver-awake-report', '--memory-saver-awake-media'],
  splitView: ['--split-view'], peek: ['--link-peek', '--reader-peek'], commandBar: ['--selector-history'],
  titleRules: ['--tab-name-ui'], aiTabNaming: ['--tab-name-ui'],
};
const selector = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });

async function reader(t) {
  const paragraph = 'Aux Reader carries the article into a calm native reading surface. The page contains a full paragraph of useful prose, with clear sentences about browsing, attention, research, navigation, and the original document. ';
  t.fixture.route('/reader', `<!doctype html><html><head><title>Aux Reader fixture</title></head><body><main><article><h1>Aux Reader fixture</h1><p>Distinctive distilled article sentence.</p><h2>Reading overview</h2>${Array.from({ length: 12 }, (_, index) => `<p>${index + 1}. ${paragraph.repeat(3)}</p>`).join('')}<h2>Details worth keeping</h2><p>Keep the original document available.</p></article></main></body></html>`);
  const page = await t.rpc('pages.open', { url: `${t.fixture.url}/reader`, activate: true });
  await t.until('article loaded', async () => (await t.rpc('pages.list')).some(item => item.pageId === page.pageId && !item.loading));
  await t.step('distill the current native page into Reader', { kind: 'ui', features: ['reader'] }, async () => {
    await t.ax.key('command+alt+r', 'hid');
    await t.ax.waitFor(selector('Back to page', 'AXButton'));
    await t.ax.waitFor(selector('Distinctive distilled article sentence.'));
    await t.ax.waitFor(selector('Details worth keeping'));
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('pages.observe', { pageId: page.pageId });
    t.assert.match(JSON.stringify(rpc), /Distinctive distilled article sentence/);
    t.assert.doesNotMatch(JSON.stringify(ax), /Reader view isn.t available/);
    await captureLegacyState(t, 'reader-article', 'reader-article');
    return { ax, rpc };
  });
  await t.step('navigate Reader contents and return to the original page', { kind: 'ui', features: ['reader'] }, async () => {
    await t.ax.press(selector('Contents', 'AXButton'));
    await t.ax.waitFor(selector('Reading overview', 'AXButton'));
    await t.ax.press(selector('Reading overview', 'AXButton'));
    await t.ax.waitFor(selector('Reading overview', 'AXButton'), 'absent');
    await t.ax.key('command+f', 'hid');
    await t.ax.waitFor(selector('Find in article', 'AXTextField'));
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(selector('Find in article', 'AXTextField'), 'absent');
    await t.ax.press(selector('Back to page', 'AXButton'));
    await t.ax.waitFor(selector('Back to page', 'AXButton'), 'absent');
    const ax = await t.ax.dump({ scope: 'page' });
    const rpc = await t.rpc('pages.list');
    t.assert.ok(rpc.some(item => item.pageId === page.pageId && item.url === `${t.fixture.url}/reader`));
    t.assert.match(JSON.stringify(ax), /Aux Reader fixture/);
    await captureLegacyState(t, 'reader-returned', 'reader-returned');
    return { ax, rpc };
  });
}
async function pageZoom(t) {
  const url = `${t.fixture.url}/red`;
  let page = await t.rpc('pages.open', { url, activate: true });
  await t.until('zoom fixture loaded', async () => (await t.rpc('pages.list')).some(item => item.pageId === page.pageId && !item.loading));
  t.assert.ok(Math.abs((await t.rpc('pages.zoom', { pageId: page.pageId })).level) < 0.01);
  await t.step('change the website size through Site controls', { kind: 'ui', features: ['pageZoom'] }, async () => {
    await t.ax.key('command+l', 'hid');
    await t.ax.key('escape', 'hid');
    await t.ax.waitFor(selector('Site controls', 'AXButton'));
    await t.ax.press(selector('Site controls', 'AXButton'));
    await t.ax.waitFor({ ...selector('Zoom in', 'AXButton'), enabled: true });
    await t.ax.press(selector('Zoom in', 'AXButton'));
    await t.until('native website zoom changes', async () => (await t.rpc('pages.zoom', { pageId: page.pageId })).level > 0.4);
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('pages.zoom', { pageId: page.pageId });
    t.assert.match(JSON.stringify(ax), /110%/);
    await captureLegacyState(t, 'page-zoom-in', 'page-zoom-in');
    await t.ax.press(selector('Close site controls', 'AXButton'));
    return { ax, rpc };
  });
  await t.restart();
  page = await t.until('saved website restored after restart', async () => (await t.rpc('pages.list')).find(item => item.url === url && !item.loading));
  t.assert.ok((await t.rpc('pages.zoom', { pageId: page.pageId })).level > 0.4);
  await t.step('reset the persisted website size in Appearance', { kind: 'ui', features: ['pageZoom'] }, async () => {
    await t.ax.key('command+,', 'hid');
    await t.ax.waitFor(selector('Appearance', 'AXButton'));
    await t.ax.press(selector('Appearance', 'AXButton'));
    await t.ax.waitFor(selector('Reset size for 127.0.0.1', 'AXButton'));
    await t.ax.press(selector('Reset size for 127.0.0.1', 'AXButton'));
    await t.until('native website zoom reset', async () => Math.abs((await t.rpc('pages.zoom', { pageId: page.pageId })).level) < 0.01);
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('pages.zoom', { pageId: page.pageId });
    t.assert.match(JSON.stringify(ax), /Website sizes/);
    await captureLegacyState(t, 'page-zoom-reset', 'page-zoom-reset');
    return { ax, rpc };
  });
}

export const journeys = [{ journey: {
  id: 'reader', title: 'Read a distilled article and return to its native page', features: ['reader'],
  devAcceptance: ['reader', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 90000, owner: 'Integrator',
}, run: reader }, { journey: {
  id: 'page-zoom', title: 'Change and reset a native website size across restart', features: ['pageZoom'],
  devAcceptance: ['pageZoom', 'sitePermissions'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 90000, owner: 'Integrator',
}, run: pageZoom }];
