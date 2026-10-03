import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';
import { assertSyntheticImportPreview } from './setup-import-appearance.mjs';
import { IMPORT_INTERRUPTION_ROWS as total } from './import-interruption-source.mjs';
export const SETUP_IMPORT_INTERRUPTION_ID = 'setup-import-interruption-appearance';
export function requireImportInterruptionAppearance({ journeyId, appearance, pair }) {
  assert.equal(journeyId, SETUP_IMPORT_INTERRUPTION_ID); assert.equal(appearance, true); assert.ok(pair, 'Original admitted appearance pair required');
}
const selections = [{ sourceId: 'chrome', profileId: 'Default', categories: ['history'] }];
function progress(job) {
  assert.deepEqual(job.selections, selections); assert.equal(job.progress.length, 1);
  const row = job.progress[0]; assert.equal(row.source, 'chrome'); assert.equal(row.profileId, 'Default'); assert.equal(row.category, 'history');
  assert.ok(Number.isSafeInteger(row.imported) && row.imported > 0 && row.imported < total);
  assert.equal(row.skipped, 0); assert.ok(!job.error && !job.interrupted);
  return row;
}
export function assertRunningPartial(job) { assert.equal(job.done, false); assert.equal(job.cancelled, false); assert.equal(progress(job).state, 'running'); }
export function assertCancelledPartial(job) { assert.equal(job.done, true); assert.equal(job.cancelled, true); assert.equal(progress(job).state, 'done'); }
export function assertMergedRetry(job, original) {
  assertCancelledPartial(original); assert.notEqual(job.jobId, original.jobId);
  assert.equal(job.done, true); assert.equal(job.cancelled, false); assert.ok(!job.error && !job.interrupted);
  assert.deepEqual(job.selections, selections); assert.equal(job.progress.length, 1);
  assert.deepEqual([job.progress[0].source, job.progress[0].profileId, job.progress[0].category, job.progress[0].state], ['chrome', 'Default', 'history', 'done']);
  assert.equal(job.progress[0].imported, total - original.progress[0].imported); assert.equal(job.progress[0].skipped, original.progress[0].imported);
}
export async function readInterruptionHistory(rpc, origin) {
  const prefix = new URL('/setup/interrupt-history/', origin).href, rows = [], seen = new Set();
  let before;
  for (let page = 0; page < 12; page++) {
    const batch = await rpc('history.list', { query: 'Synthetic interruption history', limit: 500, ...(before ? { before } : {}) });
    assert.ok(Array.isArray(batch) && batch.length <= 500);
    for (const row of batch) {
      assert.ok(row.url.startsWith(prefix)); const id = Number(row.url.slice(prefix.length));
      assert.ok(Number.isSafeInteger(id) && id > 0 && id <= total && row.url === `${prefix}${id}`);
      assert.equal(row.title, `Synthetic interruption history ${id}`); assert.ok(Number.isSafeInteger(row.visitedAt) && row.visitedAt >= 0);
      assert.ok(!seen.has(row.url), 'Duplicate destination URL'); seen.add(row.url); rows.push(row);
    }
    if (batch.length < 500) return rows;
    const last = batch.at(-1), next = { visitedAt: last.visitedAt, url: last.url };
    assert.notDeepEqual(next, before, 'Original history cursor stalled'); before = next;
  }
  assert.fail('Fixed history destination exceeds bounded pagination');
}
export async function readStableInterruptionDestinations(rpc, origin) {
  const before = await rpc('history.count', {});
  assert.ok(Number.isSafeInteger(before.count) && before.count >= 0 && before.count <= total);
  const rows = await readInterruptionHistory(rpc, origin);
  const after = await rpc('history.count', {});
  assert.ok(Number.isSafeInteger(after.count) && after.count >= 0 && after.count <= total);
  if (before.count !== after.count) return null; // Actual projection still applying acknowledged import.
  assert.equal(after.count, rows.length, 'Stable fresh Profile count differs from exact original cohort');
  return rows;
}
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const checkbox = name => ({ name, role: 'AXCheckBox', match: 'contains', scope: 'shell' });
export async function captureImportInterruption(t) {
  assert.equal(t.appearanceEnabled, true);
  const source = t.app.readImportSourceHome(); assert.equal(source.cohort, 'interruption-history-5001'); assert.deepEqual(source.counts, { bookmarks: 1, history: total });
  const unchanged = () => assert.deepEqual(t.app.readImportSourceHome(), source);
  async function noChat() { unchanged(); assert.equal((await t.rpc('settings.get')).modelConfigured, false); assert.deepEqual(await t.rpc('pages.list'), []); assert.deepEqual(await t.rpc('runs.list'), []); }
  async function states(history) { for (const [name, checked] of [['Bookmarks', false], ['History', history]]) { const rows = await t.ax.query(checkbox(name)); assert.equal(rows.length, 1); assert.equal(rows[0].checked, checked); } }
  async function destinations() {
    try { return await readStableInterruptionDestinations(t.rpc, t.fixture.url); }
    catch (error) { if (error.code === 'backend_unavailable') return null; throw error; }
  }
  async function initialNoJob() { try { await t.rpc('import.status', {}); } catch (error) { if (error.code === 'not_found') return; throw error; } assert.fail('No initial import may precede consent'); }
  let cancelled, retry;
  await t.step('review fixed history cohort without import consent', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.waitFor(shell('Welcome to Aux'), 'visible'); await noChat(); await initialNoJob();
    await t.until('actual native HistoryService initial projection ready', async () => { try { const rows = await destinations(); if (rows === null) return false; assert.equal(rows.length, 0); return true; } catch (error) { if (error.code === 'backend_unavailable') return false; throw error; } });
    await t.ax.click(shell('2. import')); await t.ax.waitFor(shell('Bring your bookmarks and history'), 'visible');
    await t.ax.click(shell('See what can be imported', 'AXButton')); await t.ax.waitFor(shell('Import selected (0)', 'AXButton'), 'disabled');
    const preview = await t.rpc('import.preview', {}); assertSyntheticImportPreview(preview); assert.deepEqual(preview.recentJobs, []); await states(false);
    await t.ax.press(checkbox('History')); await states(true); await initialNoJob(); await noChat();
    await captureHomeState(t, 'setup-import-interruption-reviewed', 'setup-import-history-selected-no-consent');
    return { ax: await t.ax.dump(), rpc: { preview, source } };
  });
  await t.step('confirm then genuinely observe partial running import before UI Cancel', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('Import selected (1)', 'AXButton'));
    let running;
    await t.until('actual partial running import', async () => { let job; try { job = await t.rpc('import.status', {}); } catch (error) { if (error.code === 'not_found') return false; throw error; } assert.equal(job.done, false, 'Import completed before genuine UI cancellation; trial cannot prove interruption'); if (!job.progress?.length || job.progress[0].imported === 0) return false; assertRunningPartial(job); running = job; return true; });
    await t.ax.waitFor(shell('Cancel import', 'AXButton'), 'enabled');
    const atClick = await t.rpc('import.status', { jobId: running.jobId }); assertRunningPartial(atClick);
    await t.ax.click(shell('Cancel import', 'AXButton'));
    await t.until('original cancelled import reaches real terminal receipt', async () => { const job = await t.rpc('import.status', { jobId: running.jobId }); if (!job.done) return false; cancelled = job; assertCancelledPartial(cancelled); return true; });
    await t.until('original partial imported destinations projected', async () => (await destinations())?.length === cancelled.progress[0].imported);
    await t.ax.waitFor({ name: 'Import stopped — completed items remain available', match: 'contains', scope: 'shell', index: 0 }, 'visible'); await noChat();
    await captureHomeState(t, 'setup-import-cancelled-partial', 'setup-import-genuine-cancelled-partial');
    return { ax: await t.ax.dump(), rpc: { running, atClick, cancelled, history: await destinations(), source: t.app.readImportSourceHome() } };
  });
  await t.step('review and explicitly retry merges original partial import without duplicates', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('Review sources to retry', 'AXButton')); await t.ax.waitFor(shell('Import selected (0)', 'AXButton'), 'disabled');
    assertSyntheticImportPreview(await t.rpc('import.preview', {})); await states(false);
    await t.ax.press(checkbox('History')); await states(true);
    assert.deepEqual(await t.rpc('import.status', { jobId: cancelled.jobId }), cancelled); await noChat();
    await captureHomeState(t, 'setup-import-retry-reviewed', 'setup-import-retry-selected-before-confirmation');
    await t.ax.click(shell('Import selected (1)', 'AXButton'));
    await t.until('actual reviewed retry completes', async () => { const job = await t.rpc('import.status', {}); if (job.jobId === cancelled.jobId || !job.done) return false; retry = job; assertMergedRetry(retry, cancelled); return true; });
    await t.until('all original cohort destinations visible once', async () => (await destinations())?.length === total);
    assert.deepEqual(await t.rpc('import.status', { jobId: cancelled.jobId }), cancelled); await noChat();
    await t.ax.waitFor(shell('Import finished.'), 'visible'); await captureHomeState(t, 'setup-import-retry-merged', 'setup-import-reviewed-retry-exact-5001-no-duplicates');
    return { ax: await t.ax.dump(), rpc: { cancelled, retry, historyCount: (await destinations())?.length, source: t.app.readImportSourceHome() } };
  });
  await t.step('revisit restores original receipts and counts without automatic retry', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('1. welcome')); await t.ax.waitFor(shell('Welcome to Aux'), 'visible'); await t.ax.click(shell('2. import')); await t.ax.waitFor(shell('Import finished.'), 'visible');
    assert.deepEqual(await t.rpc('import.status', {}), retry); assert.deepEqual(await t.rpc('import.status', { jobId: cancelled.jobId }), cancelled);
    const preview = await t.rpc('import.preview', {}); assert.deepEqual(preview.recentJobs.map(job => job.jobId), [retry.jobId, cancelled.jobId]);
    assert.equal((await destinations())?.length, total); await noChat();
    await captureHomeState(t, 'setup-import-retry-revisited', 'setup-import-original-two-receipts-no-replay');
    return { ax: await t.ax.dump(), rpc: { cancelled, retry, historyCount: total } };
  });
}
