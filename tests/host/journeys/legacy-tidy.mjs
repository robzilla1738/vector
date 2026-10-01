import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { shell, loadedPage, press } from '../fixtures/legacy-ui.mjs';
import { setTabLayout } from '../lib/tab-layout.mjs';

async function tidy(t, changed) {
  t.model.respond(payload => {
    const prompt = String(payload.messages.findLast(message => message.role === 'user').content);
    const pages = JSON.parse(prompt.slice(prompt.indexOf('\n') + 1));
    t.assert.equal(pages.length, 3);
    for (const page of pages) {
      t.assert.deepEqual(Object.keys(page).sort(), ['origin', 'pageId', 'title']);
      t.assert.equal(page.origin, t.fixture.url);
    }
    return { content: JSON.stringify({ groups: [{ name: 'Fixture reading', pageIds: pages.slice(0, 2).map(page => page.pageId) }] }) };
  });
  await t.rpc('settings.set', { modelProvider: 'openai-compatible', compatibleEndpoint: t.model.endpoint, plannerModel: t.model.model });
  const initial = (await t.rpc('pages.list')).filter(page => !page.ownedByRuntime && !page.anchor);
  const pages = [];
  for (const path of ['/red', '/blue', '/green']) pages.push(await loadedPage(t, path));
  for (const page of initial) await t.rpc('pages.close', { pageId: page.pageId });
  await setTabLayout(t, 'vertical', { role: 'AXRadioButton', name: '^Aux native Green(?: Close Aux native Green)?$', match: 'regex', scope: 'shell', index: 0 });
  const shared = () => JSON.parse(readFileSync(join(t.app.userDataDir, 'Default/Preferences'), 'utf8')).aux?.organization?.v2?.shared;
  let receipt;
  let before;
  await t.step('review and apply AI folders without leaking page contents', { kind: 'ui', features: ['aiTidy'] }, async () => {
    await t.ax.key('command+shift+o', 'hid');
    await t.ax.waitFor(shell('Your tabs'));
    before = structuredClone(shared());
    t.assert.equal((await t.rpc('pages.list')).filter(page => !page.ownedByRuntime && !page.anchor).length, 3);
    for (const name of ['Red', 'Blue', 'Green']) await press(t, shell(`Select Aux native ${name}`, 'AXCheckBox'));
    await press(t, shell('Tidy selected with AI', 'AXButton'));
    await t.ax.waitFor(shell('Fixture reading'));
    t.assert.equal(t.model.calls.length, 1);
    t.assert.ok(!shared().folders.some(folder => folder.name === 'Fixture reading'), 'Proposal cannot change native organization before Apply');
    await t.capture('tidy-review');
    await press(t, shell('Apply folders', 'AXButton'));
    receipt = await t.until('durable native Tidy receipt', () => {
      const value = shared()?.tidyUndo;
      return value?.created[0]?.name === 'Fixture reading' && value;
    }, 30000);
    t.assert.equal(receipt.created.length, 1);
    t.assert.equal(receipt.moved.length, 2);
    t.assert.ok(receipt.moved.every(move => pages.some(page => page.pageId === move.pageId)));
    for (const move of receipt.moved) t.assert.equal(shared().tabFolder[move.pageId], receipt.created[0].id);
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('pages.list');
    t.assert.ok(pages.every(page => rpc.some(item => item.pageId === page.pageId)));
    await t.capture('tidy-applied');
    return { ax, rpc: { pages: rpc, receipt } };
  });
  if (changed) {
    await t.step('owner folder edit invalidates stale Tidy Undo', { kind: 'ui', features: ['aiTidy'] }, async () => {
      await press(t, shell('Done', 'AXButton'));
      const folder = { ...shell('Fixture reading'), match: 'contains', role: 'AXButton' };
      await t.ax.waitFor(folder);
      await t.ax.contextMenu(folder);
      await t.ax.waitFor(shell('Rename', 'AXMenuItem'));
      const beforeRename = await t.ax.dump({ scope: 'shell' });
      await t.capture('tidy-rename-menu');
      await press(t, shell('Rename', 'AXMenuItem'));
      const afterRename = await t.ax.dump({ scope: 'shell' });
      await t.capture('tidy-rename-after-press');
      try { await t.ax.waitFor(shell('Folder name', 'AXTextField')); } catch (error) {
        const controls = records => records.filter(record => record.focused || ['AXMenu', 'AXMenuItem', 'AXTextField'].includes(record.role)).map(({ role, names, focused, enabled, frame }) => ({ role, names, focused, enabled, frame }));
        throw new Error(`${error.message}; native rename transition: ${JSON.stringify({ before: controls(beforeRename), after: controls(afterRename) }).slice(0, 8000)}`);
      }
      await t.ax.type('Owner changed', shell('Folder name', 'AXTextField'));
      await t.ax.key('return', 'hid');
      const native = await t.until('owner folder edit persisted and Undo removed', () => {
        const value = shared();
        return value.folders.some(item => item.id === receipt.created[0].id && item.name === 'Owner changed') && !value.tidyUndo && value;
      }, 30000);
      const ax = await t.ax.dump({ scope: 'shell' });
      const rpc = await t.rpc('pages.list');
      await t.capture('tidy-owner-changed');
      return { ax, rpc: { pages: rpc, native } };
    });
  }
  await t.restart();
  await t.step(changed ? 'restart preserves the owner edit and refuses stale Undo' : 'restart preserves the receipt and Undo restores the prior organization', { kind: 'ui', features: ['aiTidy'] }, async () => {
    await t.ax.key('command+shift+o', 'hid');
    await t.ax.waitFor(shell('Your tabs'));
    if (changed) {
      await t.ax.waitFor(shell('Undo Tidy', 'AXButton'), 'absent');
      t.assert.equal(shared().tidyUndo, undefined);
      t.assert.ok(shared().folders.some(folder => folder.id === receipt.created[0].id && folder.name === 'Owner changed'));
      for (const move of receipt.moved) t.assert.equal(shared().tabFolder[move.pageId], receipt.created[0].id);
    } else {
      await t.ax.waitFor(shell('Undo Tidy', 'AXButton'));
      await press(t, shell('Undo Tidy', 'AXButton'));
      await t.ax.waitFor(shell('Undo Tidy', 'AXButton'), 'absent');
      await t.until('receipt removed after native Undo', () => !shared().tidyUndo, 30000);
      t.assert.ok(!shared().folders.some(folder => folder.id === receipt.created[0].id));
      t.assert.deepEqual(shared().tabFolder, before.tabFolder);
      t.assert.deepEqual(shared().order, before.order);
    }
    t.assert.equal(t.model.calls.length, 1);
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('pages.list');
    t.assert.ok(pages.every(page => rpc.some(item => item.pageId === page.pageId)));
    await t.capture(changed ? 'tidy-stale-undo-refused' : 'tidy-undone');
    return { ax, rpc: { pages: rpc, native: shared() } };
  });
}
export const journeys = [false, true].map(changed => ({ journey: { id: changed ? 'tidy-changed-state' : 'tidy-receipt-restart', title: changed ? 'Refuse stale AI Tidy Undo after an owner folder edit and restart' : 'Apply reviewed AI Tidy folders and restore their native organization after restart', features: ['aiTidy'], devAcceptance: ['aiTidy', 'spaces'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 120000, owner: 'LJ' }, run: t => tidy(t, changed) }));
