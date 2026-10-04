import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

export const PAGE_RECOVERY_APPEARANCE_ID = 'page-recovery-appearance';
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const details = shell('Connection details');
const composer = shell('Reply to conversation', 'AXTextArea');
const address = shell('Address, search, and agent prompt', 'AXComboBox');
export function requirePageRecoveryAppearance({ journeyId, appearance, pair }) {
  assert.equal(journeyId, PAGE_RECOVERY_APPEARANCE_ID);
  assert.equal(appearance, true); assert.ok(pair, 'Original externally admitted pair required');
}

/** Original native navigation error, never a supplied PageTarget or unsafe exception. */
export async function capturePageRecoveryAppearance(t) {
  assert.equal(t.appearanceEnabled, true);
  const app = t.app, ax = t.ax, pid = app.pid;
  const stable = () => assert.ok(t.app === app && t.ax === ax && Number.isInteger(pid) && pid > 0 && app.pid === pid && ax.pid === pid && !t.signal?.aborted, 'Original recovery capture owner retired');
  const owned = async action => { stable(); const value = await action(); stable(); return value; };
  const base = new URL(t.fixture.tlsUrl);
  assert.equal(base.protocol, 'https:'); assert.equal(base.hostname, '127.0.0.1'); assert.ok(base.port); assert.equal(base.pathname, '/');
  assert.ok(t.fixture.certificate && t.fixture.certificateSpki, 'Original owned self-signed TLS fixture is required');
  const url = new URL('/appearance-page-recovery', base).href;
  const remove = t.fixture.route('/appearance-page-recovery', '<!doctype html><title>Owned recovery TLS fixture</title>Certificate trust must remain ungranted.');
  let opened, primary, finalError;
  const debts = [], observations = [];
  try {
    const settings = await owned(() => t.rpc('settings.get'));
    const pages = await owned(() => t.rpc('pages.list')); assert.deepEqual(pages, [], 'Recovery preparation requires original fresh page-free Home');
    const runs = await owned(() => t.rpc('runs.list')); assert.deepEqual(runs, []);
    const workspace = await owned(() => t.rpc('workspace.get')); assert.equal(workspace.activePageId, null);
    const draft = await owned(() => ax.query(composer)); assert.equal(draft.length, 1);
    const inventory = async () => {
      const windows = (await owned(() => ax.windows())).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
      assert.equal(windows.length, 1); assert.ok(Number.isInteger(windows[0].id) && windows[0].id > 0);
      if (t.narrowEnabled) assert.ok(Number.isFinite(windows[0].width) && windows[0].width >= 720 && windows[0].width <= 900);
      return windows[0];
    };
    const originalWindow = await inventory();
    const originalRecords = async () => {
      assert.deepEqual(await owned(() => t.rpc('settings.get')), settings);
      assert.deepEqual(await owned(() => t.rpc('runs.list')), runs);
      const state = await owned(() => t.rpc('workspace.get'));
      for (const key of ['sets', 'members', 'sessions', 'streamId']) assert.deepEqual(state[key], workspace[key]);
      assert.ok(Number.isSafeInteger(state.lastSeq) && state.lastSeq >= workspace.lastSeq);
      assert.deepEqual(await inventory(), originalWindow);
      return state;
    };
    let error;
    try {
      opened = await owned(() => t.rpc('pages.open', { url: 'about:blank', activate: true }));
      assert.ok(opened?.pageId && opened.windowId && opened.targetId);
      assert.equal(opened.backend, 'aux'); assert.equal(opened.ownedByRuntime, false);
      // Ordinary native person tabs intentionally omit a CDP session. Preserve the original value/absence.
      const readOriginal = async () => {
        const current = await owned(() => t.rpc('pages.list'));
        assert.equal(current.length, 1); const page = current[0];
        for (const key of ['pageId', 'windowId', 'targetId', 'sessionId']) assert.equal(page[key], opened[key]);
        assert.ok(Number.isSafeInteger(page.documentEpoch) && page.documentEpoch >= opened.documentEpoch);
        assert.equal((await originalRecords()).activePageId, opened.pageId);
        return page;
      };
      const blank = await readOriginal(); assert.equal(blank.url, 'about:blank'); assert.ok(!blank.navigationError);
      await owned(() => ax.key('command+l', 'hid'));
      const field = await owned(() => ax.query(address)); assert.equal(field.length, 1); assert.equal(field[0].focused, true);
      await owned(() => ax.key('command+a', 'hid')); await owned(() => ax.type(url, address));
      const typed = await owned(() => ax.query(address)); assert.equal(typed.length, 1); assert.equal(typed[0].value, url);
      const beforeCommit = await readOriginal(); assert.equal(beforeCommit.url, 'about:blank');
      assert.equal(beforeCommit.documentEpoch, blank.documentEpoch); assert.ok(!beforeCommit.navigationError);
      await owned(() => ax.key('return', 'hid'));
      error = await owned(() => t.until('original native certificate error', async () => {
        const page = await readOriginal();
        if (page.loading || !page.navigationError) return false;
        assert.equal(page.url, url); assert.equal(page.navigationError.url, url);
        assert.match(page.navigationError.message, /^net::ERR_CERT_/);
        assert.ok(page.navigationError.code <= -200 && page.navigationError.code >= -299);
        assert.equal(page.navigationError.upgradedFrom, undefined); assert.notEqual(page.viewStatus, 'crashed');
        return page;
      }));
      finalError = structuredClone(error);
      const identity = page => Object.fromEntries(['pageId', 'windowId', 'targetId', 'sessionId', 'documentEpoch', 'url', 'navigationError', 'viewStatus', 'loading'].map(key => [key, page[key]]));
      const one = async selector => { const rows = await owned(() => ax.query(selector)); assert.equal(rows.length, 1); return rows[0]; };
      const raw = shell(`${error.navigationError.message} (${error.navigationError.code})`, 'AXStaticText');
      const ready = async (expanded, focused = false) => {
        assert.deepEqual(identity(await readOriginal()), identity(error), 'Original native error document retired');
        await owned(() => ax.waitFor(shell('This connection isn’t secure')));
        await owned(() => ax.waitFor(shell('Proceed anyway (unsafe)', 'AXButton'), 'enabled'));
        await owned(() => ax.waitFor(raw, expanded ? 'visible' : 'absent'));
        const summary = await one(details); if (focused) assert.equal(summary.focused, true);
      };
      const capture = async (name, state, expanded, focused) => {
        await ready(expanded, focused);
        const before = await owned(() => ax.dump({ scope: 'shell' })); await ready(expanded, focused);
        await owned(() => captureHomeState(t, name, state)); await ready(expanded, focused);
        const after = await owned(() => ax.dump({ scope: 'shell' })); await ready(expanded, focused);
        observations.push({ name, state, before, after, originalErrorIdentity: identity(error) });
      };
      await capture('page-certificate-error-details-collapsed', 'page-native-certificate-error-details-collapsed', false, false);
      await owned(() => ax.focus(details)); await owned(() => ax.key('space', 'hid'));
      await capture('page-certificate-error-details-expanded-focused', 'page-native-certificate-error-details-expanded-focused', true, true);
      await owned(() => ax.key('space', 'hid'));
      await capture('page-certificate-error-details-recollapsed-focused', 'page-native-certificate-error-details-recollapsed-focused', false, true);
    } catch (cause) { primary = cause; }
    finally {
      if (opened) try {
        const current = await owned(() => t.rpc('pages.list'));
        assert.equal(current.length, 1);
        for (const key of ['pageId', 'windowId', 'targetId', 'sessionId']) assert.equal(current[0][key], opened[key]);
        assert.deepEqual(await inventory(), originalWindow);
        const closed = await owned(() => t.rpc('pages.close', { pageId: opened.pageId }));
        assert.equal(closed.ok, true, 'Original native page close was not acknowledged');
      } catch (cause) { debts.push(cause); }
      try {
        assert.deepEqual(await owned(() => t.rpc('pages.list')), pages);
        const restored = await originalRecords(); assert.equal(restored.activePageId, workspace.activePageId);
        assert.deepEqual(restored.tabPlacements, workspace.tabPlacements);
        const currentDraft = await owned(() => ax.query(composer)); assert.equal(currentDraft.length, 1); assert.equal(currentDraft[0].value, draft[0].value);
        await owned(() => ax.focus(composer)); assert.equal((await owned(() => ax.query(composer)))[0]?.focused, true);
      } catch (cause) { debts.push(cause); }
    }
  } catch (cause) { primary ??= cause; }
  finally { try { remove(); } catch (cause) { debts.push(cause); } }
  if (debts.length) throw new AggregateError([primary, ...debts].filter(Boolean), 'Original recovery capture or minted-page cleanup unresolved');
  if (primary) throw primary;
  return { ax: await owned(() => ax.dump({ scope: 'shell' })), rpc: { originalError: finalError, observations, originalClosedPageId: opened.pageId, certificateExceptionRequested: false } };
}
