import { shell, settings, loadedPage, press } from '../fixtures/legacy-ui.mjs';

export const journey = { id: 'tab-lifecycle', title: 'Sleep clean tabs while dirty, unknown, audible and runtime-owned tabs stay awake, with durable reports', features: ['tabLifecycle'], devAcceptance: ['tabLifecycle'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 300000, owner: 'LJ' };
export async function run(t) {
  const loads = { clean: 0, dirty: 0, unknown: 0, protected: 0, tone: 0, agent: 0 };
  const beats = [];
  const page = (name, body = '') => `<!doctype html><title>Lifecycle ${name}</title><h1>Lifecycle ${name}</h1>${body}`;
  for (const name of Object.keys(loads)) t.fixture.route(`/lifecycle-${name}`, () => {
    loads[name]++;
    const bodies = {
      dirty: '<label>Draft<input aria-label="Draft" value=""></label>',
      unknown: '<input>'.repeat(5001),
      protected: '<script>window.addEventListener("beforeunload",event=>{event.preventDefault();event.returnValue=""})</script>',
      tone: '<button onclick="const a=document.querySelector(\'audio\');a.play().then(()=>{setInterval(()=>fetch(\'/lifecycle-beat?t=\'+a.currentTime+\'&paused=\'+a.paused),500)})">Play lifecycle tone</button><audio loop src="/tone.wav"></audio>',
    };
    return page(name, bodies[name]);
  }, { headers: { 'cache-control': 'no-store' } });
  t.fixture.route('/lifecycle-beat', request => { const url = new URL(request.url, t.fixture.url); beats.push({ time: Number(url.searchParams.get('t')), paused: url.searchParams.get('paused') }); return 'heartbeat'; });
  const dirty = await loadedPage(t, '/lifecycle-dirty');
  await t.ax.type('Owner edited draft', { name: 'Draft', role: 'AXTextField', match: 'exact', scope: 'page', index: 0 });
  const unknown = await loadedPage(t, '/lifecycle-unknown');
  const protectedPage = await loadedPage(t, '/lifecycle-protected');
  const tone = await loadedPage(t, '/lifecycle-tone');
  const agent = await t.rpc('pages.open', { url: `${t.fixture.url}/lifecycle-agent`, background: true, ownedByRuntime: true, activate: false });
  let clean;
  const awake = [dirty, unknown, protectedPage, tone, agent];
  const report = async () => {
    await settings(t, 'General');
    await t.ax.waitFor(shell('Memory saver cycle report'));
    await press(t, shell('Recent Memory saver cycles'));
    await t.ax.waitFor({ ...shell('This tab has unload handlers and stays awake.', 'AXStaticText'), match: 'contains' });
    const ax = await t.ax.dump({ scope: 'shell' });
    t.assert.match(JSON.stringify(ax), /estimated at sleep time|Memory estimate unavailable/);
    return ax;
  };
  await t.step('genuine audio starts, saved one-minute policy sleeps only a clean background tab', { kind: 'ui', features: ['tabLifecycle'] }, async () => {
    await t.rpc('pages.activate', { pageId: tone.pageId });
    await press(t, { name: 'Play lifecycle tone', role: 'AXButton', match: 'exact', scope: 'page', index: 0 });
    await t.until('actual audio playback clock advances', () => beats.some(beat => beat.paused === 'false' && beat.time > 0.5));
    await t.ax.waitFor({ ...shell('Mute tab:'), match: 'contains' });
    clean = await loadedPage(t, '/lifecycle-clean');
    await loadedPage(t, '/blue');
    await settings(t, 'General');
    await press(t, shell('Memory saver', 'AXPopUpButton'));
    await press(t, { name: 'After 1 minute', role: 'AXMenuItem', match: 'exact', scope: 'window', index: 0 });
    await t.until('one-minute native policy persisted', async () => (await t.rpc('settings.get')).memorySaverMinutes === 1);
    await press(t, shell('Close settings', 'AXButton'));
    await t.until('clean tab sleeps without reload', async () => {
      const workspace = await t.rpc('workspace.get');
      return workspace.pages.find(item => item.pageId === clean.pageId)?.lifecycle === 'placeholder';
    }, 180000);
    t.assert.equal(loads.clean, 1);
    const workspace = await t.rpc('workspace.get');
    for (const original of awake) {
      const current = workspace.pages.find(item => item.pageId === original.pageId);
      t.assert.ok(current, 'Every protected fixture must remain present');
      t.assert.equal(current.lifecycle, 'live');
    }
    t.assert.equal(workspace.pages.find(item => item.pageId === agent.pageId).ownedByRuntime, true);
    for (const name of ['dirty', 'unknown', 'protected', 'tone', 'agent']) t.assert.equal(loads[name], 1);
    await t.ax.waitFor({ ...shell('Mute tab:'), match: 'contains' });
    const ax = await report();
    await t.capture('lifecycle-protected-report');
    return { ax, rpc: { workspace, loads: structuredClone(loads), audio: beats.slice(-4) } };
  });
  await t.restart();
  await t.step('restart retains the sleeping placeholder and report, activation reloads only that tab', { kind: 'ui', features: ['tabLifecycle'] }, async () => {
    const workspace = await t.rpc('workspace.get');
    t.assert.equal(workspace.pages.find(item => item.pageId === clean.pageId)?.lifecycle, 'placeholder');
    t.assert.equal(loads.clean, 1);
    for (const original of [dirty, unknown]) {
      const current = workspace.pages.find(item => item.pageId === original.pageId);
      t.assert.ok(current && current.lifecycle !== 'placeholder' && current.lifecycle !== 'discarded');
    }
    const ax = await report();
    await t.capture('lifecycle-report-restarted');
    await press(t, shell('Close settings', 'AXButton'));
    const before = structuredClone(loads);
    const sleepingTab = { name: 'Lifecycle clean', role: 'AXRadioButton', match: 'contains', scope: 'shell' };
    t.assert.equal((await t.ax.query(sleepingTab)).length, 1, 'Only the original clean fixture tab may be activated');
    await press(t, sleepingTab);
    await t.until('native activation selects the exact original clean page', async () => (await t.rpc('workspace.get')).activePageId === clean.pageId);
    await t.until('sleeping clean tab lazily reloads once', () => loads.clean === 2);
    t.assert.equal(loads.dirty, before.dirty);
    t.assert.equal(loads.unknown, before.unknown);
    return { ax, rpc: { workspace, loads: structuredClone(loads) } };
  });
}
