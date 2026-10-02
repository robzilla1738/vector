const s = (name, role = 'AXButton') => ({ name, role, scope: 'shell', match: 'exact', index: 0 });
export const journey = {
  id: 'organization-work-performance', title: '20 AC full native archive batches with completed renderer task coverage',
  features: ['autoArchive'], devAcceptance: ['autoArchive', 'archive', 'spaces', 'tabSections'],
  needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: ({ appearance }) => ({ args: ['--aux-test-clock-scale=3600', '--aux-native-performance-observer'], perf: !appearance }),
  timeoutMs: 600_000, owner: 'L10',
};
export async function run(t) {
  t.assert.equal(t.appearanceEnabled, false, 'Actual work metrics require a separate performance run');
  t.assert.equal(t.clock.delayMs(12 * 3_600_000), 12_000, 'The real native clock preserves the canonical twelve-second idle age');
  const active = await t.rpc('pages.open', { url: `${t.fixture.url}/blue`, activate: true });
  await t.until('active protection page loaded', async () => (await t.rpc('pages.list')).some(page => page.pageId === active.pageId && !page.loading));
  if ((await t.ax.query(s('Show sidebar'))).length) await t.ax.press(s('Show sidebar'));
  await t.ax.waitFor(s('Got it')); await t.ax.press(s('Got it')); await t.ax.waitFor(s('Got it'), 'absent');
  t.assert.equal((await t.rpc('settings.get')).autoArchive.acknowledged, true, 'Education is genuinely acknowledged before policy work');
  let spaceId, batch;
  async function policy(hours) {
    await t.ax.press(s('Personal')); await t.ax.press(s('Edit Personal', 'AXMenuItem'));
    await t.ax.waitFor(s('Archive unpinned tabs after', 'AXPopUpButton'));
    await t.ax.press(s('Archive unpinned tabs after', 'AXPopUpButton'));
    await t.ax.press(s(hours === 'never' ? 'Never' : '12 hours', 'AXMenuItem'));
    await t.until('actual registered policy mutation persisted', async () => {
      const settings = await t.rpc('settings.get');
      const entries = Object.entries(settings.autoArchive.bySpace);
      t.assert.equal(entries.length, 1, 'The clean fixture has exactly one edited Space');
      if (spaceId) t.assert.equal(entries[0][0], spaceId, 'Policy remains on the same native Space');
      if (entries[0][1] !== hours) return false;
      spaceId = entries[0][0]; return true;
    });
    await t.ax.key('escape', 'hid'); await t.ax.waitFor(s('Archive unpinned tabs after', 'AXPopUpButton'), 'absent');
  }
  await t.step('20 AC positive whole cycles each commit the full twenty-tab native policy batch', { kind: 'ui', features: ['autoArchive'] }, async () => {
    const report = await t.measureOrganizationWork({ metric: 'auto-archive',
      prepareTrial: async trial => {
        await policy('never'); batch = [];
        for (let unit = 0; unit < 20; unit++) batch.push(await t.rpc('pages.open', {
          url: `${t.fixture.url}/red?organizationTrial=${trial + 1}&unit=${unit + 1}`, activate: false }));
        const ids = new Set(batch.map(page => page.pageId));
        t.assert.equal(ids.size, 20, 'Every trial creates twenty distinct real native tabs');
        await t.until('full clean policy batch is loaded and genuinely twelve hours idle', async () => {
          const pages = await t.rpc('pages.list'); const current = pages.filter(page => ids.has(page.pageId));
          return current.length === 20 && current.every(page => !page.loading && !page.ownedByRuntime && page.controller === 'none'
            && t.clock.elapsedSince(Math.max(page.createdAt, page.lastActiveAt)) >= 12 * 3_600_000);
        }, 25_000);
        t.assert.ok((await t.rpc('pages.list')).some(page => page.pageId === active.pageId), 'The active protection page remains live');
      },
      performWork: async () => {
        await policy(12);
        await t.until('all twenty eligible native tabs actually archived', async () => {
          const pages = await t.rpc('pages.list'); return batch.every(page => !pages.some(current => current.pageId === page.pageId));
        }, 25_000);
      } });
    t.assert.equal(report.measurements.length, 20, 'All twenty AC cycles produce actual native receipts');
    for (const receipt of report.measurements) t.assert.equal(receipt.work.units, 20, 'A one-tab or empty cycle cannot replace the full policy batch');
    t.assert.ok((await t.rpc('pages.list')).some(page => page.pageId === active.pageId), 'Actual policy work preserves the active tab');
    return { ax: await t.ax.dump(), rpc: { performance: report } };
  });
}
