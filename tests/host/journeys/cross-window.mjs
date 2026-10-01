import { fixturePage } from '../lib/fixture.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';
import { execFileSync } from 'node:child_process';

export const journey = {
  id: 'cross-window', title: 'Claim shared tabs while preserving the live page and its source window',
  features: ['windowSync'], devAcceptance: ['windowSync', 'spaces', 'commandRegistry', 'splitView'],
  needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 180_000, owner: 'L4',
};
const row = title => ({ role: 'AXRadioButton', name: `^${title}(?: Close ${title})?$`, match: 'regex', scope: 'shell', index: 0 });
const button = name => ({ role: 'AXButton', name, match: 'exact', index: 0 });
const pageIn = async (t, pageId) => (await t.rpc('pages.list')).find(page => page.pageId === pageId);
async function withinWindow(t, id) {
  const native = (await t.ax.windows()).find(window => window.id === id && window.layer === 0);
  t.assert.ok(native, 'The intended window still belongs to this journey');
  const windows = await t.ax.query({ role: 'AXWindow', scope: 'window' });
  const index = windows.findIndex(window => window.frame && Math.abs(window.frame.x - native.x) < 1 && Math.abs(window.frame.y - native.y) < 1);
  t.assert.ok(index >= 0, 'Native inventory and AX agree on the target window');
  return { role: 'AXWindow', scope: 'window', index };
}

export async function run(t) {
  t.fixture.route('/claim-red', fixturePage('Aux claim Red', '<label>Draft <textarea aria-label="Claim draft" oninput="document.querySelector(\'output\').textContent=this.value"></textarea></label><output></output><button onclick="history.pushState({},\'\',\'#history\')">Keep history</button><button onclick="document.querySelector(\'audio\').play()">Play claim tone</button><audio loop src="/tone.wav"></audio><video id="claim-video" width="320" height="180" muted autoplay></video><script>const c=document.createElement("canvas");c.width=320;c.height=180;const ctx=c.getContext("2d"),v=document.querySelector("video");setInterval(()=>{ctx.fillStyle="#164b72";ctx.fillRect(0,0,320,180);ctx.fillStyle="white";ctx.fillText("Live claim video "+Date.now(),10,40);v.dataset.time=String(v.currentTime)},50);v.srcObject=c.captureStream(20);v.play();</script>'));
  const red = await t.rpc('pages.open', { url: `${t.fixture.url}/claim-red`, activate: true });
  await t.until('Red native owner ready', async () => (await pageIn(t, red.pageId))?.windowId);
  const sourceId = (await pageIn(t, red.pageId)).windowId;
  for (const page of await t.rpc('pages.list'))
    if (page.windowId === sourceId && page.pageId !== red.pageId && !page.ownedByRuntime) await t.rpc('pages.close', { pageId: page.pageId });
  const initialWindows = (await t.ax.windows()).filter(window => window.layer === 0);
  t.assert.equal(initialWindows.length, 1);
  await t.step('prepare live state and create a second shared sidebar', { kind: 'ui', features: ['windowSync'] }, async () => {
    await setTabLayout(t, 'vertical', row('Aux claim Red'));
    await t.ax.type('Draft survives the move', { role: 'AXTextArea', name: 'Claim draft', match: 'exact', index: 0 });
    await t.ax.press(button('Keep history'));
    await t.ax.press(button('Play claim tone'));
    await t.until('audio is playing before claim', async () => (await pageIn(t, red.pageId))?.audible);
    await t.ax.key('command+n', 'hid');
    await t.until('second normal native window', async () => (await t.ax.windows()).filter(window => window.layer === 0).length === initialWindows.length + 1);
    await t.ax.waitFor(row('Aux claim Red'));
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list') } };
  });
  const attachedBefore = await t.rpc('pages.observe', { pageId: red.pageId, format: 'compact' });
  t.assert.ok(attachedBefore, 'The runtime is attached to the live page before reparenting');
  const videoBefore = await t.rpc('pages.read', { pageId: red.pageId, query: { kind: 'attribute', selector: '#claim-video', name: 'data-time' } });
  const loaded = t.fixture.requests.filter(request => request.path === '/claim-red').length;
  const receivingWindow = (await t.ax.windows()).find(window => window.layer === 0 && !initialWindows.some(old => old.id === window.id));
  t.assert.ok(receivingWindow);
  let destinationId;
  await t.step('claim Red without reloading or closing its last-tab source', { kind: 'ui', features: ['windowSync'] }, async () => {
    await t.ax.click({ role: 'AXImage', name: `Open in Window ${sourceId} · click to move here`, match: 'exact', scope: 'shell', index: 0 });
    await t.until('Red is owned by the receiving window', async () => {
      destinationId = (await pageIn(t, red.pageId))?.windowId;
      return destinationId && destinationId !== sourceId;
    });
    await t.ax.waitFor(button('Bring it back'));
    await t.ax.waitFor({ name: 'Draft survives the move', match: 'exact', index: 0 });
    const page = await pageIn(t, red.pageId);
    t.assert.equal(page.audible, true, 'Playing media survives WebContents reparenting');
    const videoAfter = await t.rpc('pages.read', { pageId: red.pageId, query: { kind: 'attribute', selector: '#claim-video', name: 'data-time' } });
    t.assert.ok(Number(videoAfter.value) > Number(videoBefore.value), 'The same playing video advances across reparenting through the runtime CDP attachment');
    t.assert.ok(await t.rpc('pages.observe', { pageId: red.pageId, format: 'compact' }), 'Runtime observation remains attached after the move');
    t.assert.equal(page.canGoBack, true, 'Session history survives the move');
    t.assert.match(page.url, /#history$/);
    t.assert.equal(t.fixture.requests.filter(request => request.path === '/claim-red').length, loaded, 'Claim must not navigate a replacement page');
    const windows = (await t.ax.windows()).filter(window => window.layer === 0);
    t.assert.ok(initialWindows.every(window => windows.some(current => current.id === window.id)), 'An anchor keeps the last-tab source window alive');
    t.assert.equal((await t.rpc('pages.list')).filter(page => page.pageId === red.pageId).length, 1);
    await t.capture('cross-window-source-placeholder', { windowId: initialWindows[0].id });
    await t.capture('cross-window-claimed', { windowId: receivingWindow.id });
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list'), sourceId, destinationId } };
  });
  await t.step('show the owner without moving, then bring Red back', { kind: 'ui', features: ['windowSync'] }, async () => {
    await t.ax.press(button(`Show Window ${destinationId}`));
    t.assert.equal((await pageIn(t, red.pageId)).windowId, destinationId, 'Show window does not claim');
    await t.ax.press(button('Bring it back'));
    await t.until('Red returns to the original window', async () => (await pageIn(t, red.pageId))?.windowId === sourceId);
    await t.ax.waitFor({ name: 'Draft survives the move', match: 'exact', index: 0 });
    t.assert.equal((await pageIn(t, red.pageId)).audible, true);
    t.assert.equal(t.fixture.requests.filter(request => request.path === '/claim-red').length, loaded);
    await t.capture('cross-window-returned');
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list') } };
  });
  await t.step('twenty whole-page claims paint in the receiving window within the budget on AC', { kind: 'ui', features: ['windowSync'] }, async () => {
    t.assert.match(execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8' }), /AC Power/);
    const trials = [];
    for (let trial = 0; trial < 20; trial++) {
      const previous = (await pageIn(t, red.pageId)).windowId;
      const destination = previous === sourceId ? receivingWindow.id : initialWindows[0].id;
      const within = await withinWindow(t, destination);
      const start = performance.now();
      await t.ax.press({ ...button('Bring it back'), within });
      await t.until('claim owner changed', async () => (await pageIn(t, red.pageId)).windowId !== previous, { intervalMs: 10 });
      await t.ax.waitFor({ role: 'AXWebArea', name: 'Aux claim Red', match: 'exact', index: 0, within }, 'visible');
      trials.push(performance.now() - start);
      t.assert.equal((await pageIn(t, red.pageId)).audible, true);
    }
    const p95 = [...trials].sort((a, b) => a - b)[18];
    t.assert.ok(p95 <= 300, `Claim click to paint p95 ${p95.toFixed(1)} ms exceeds 300 ms`);
    t.assert.equal(t.fixture.requests.filter(request => request.path === '/claim-red').length, loaded);
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list'), performance: { power: 'AC', trials, p95 } } };
  });
  await t.step('claiming a native split member carries both live pages as one group', { kind: 'ui', features: ['windowSync'] }, async () => {
    const blue = await t.rpc('pages.open', { url: `${t.fixture.url}/blue`, activate: false });
    await t.until('Blue shares the source window', async () => (await pageIn(t, blue.pageId))?.windowId === (await pageIn(t, red.pageId))?.windowId);
    await t.ax.contextMenu(row('Aux native Blue'));
    await t.ax.press({ name: 'Open beside current tab', scope: 'shell', index: 0 });
    await t.ax.waitFor({ role: 'AXSplitter', name: 'Resize split divider 1', scope: 'shell', index: 0 });
    const ownerBefore = (await pageIn(t, red.pageId)).windowId;
    const destination = ownerBefore === sourceId ? receivingWindow.id : initialWindows[0].id;
    await t.ax.click({ role: 'AXImage', name: `Open in Window ${ownerBefore} · click to move here`, match: 'exact', index: 0, within: await withinWindow(t, destination) });
    await t.until('every split member has moved to the same new owner', async () => {
      const pages = await t.rpc('pages.list');
      const moved = [red.pageId, blue.pageId].map(id => pages.find(page => page.pageId === id));
      return moved.every(page => page && page.windowId !== ownerBefore) && moved[0].windowId === moved[1].windowId;
    });
    const within = await withinWindow(t, destination);
    await t.ax.waitFor({ role: 'AXWebArea', name: 'Aux claim Red', match: 'exact', index: 0, within }, 'visible');
    await t.ax.waitFor({ role: 'AXWebArea', name: 'Aux native Blue', match: 'exact', index: 0, within }, 'visible');
    t.assert.equal(t.fixture.requests.filter(request => request.path === '/claim-red').length, loaded);
    await t.capture('cross-window-split-claimed', { windowId: destination });
    return { ax: await t.ax.dump(), rpc: { pages: await t.rpc('pages.list') } };
  });

}
