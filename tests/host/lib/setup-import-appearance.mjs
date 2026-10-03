import assert from 'node:assert/strict';
import { captureHomeState } from './home-capture.mjs';

export const SETUP_IMPORT_APPEARANCE_ID = 'setup-import-appearance';
export function requireSetupImportAppearance({ journeyId, appearance, pair }) {
  assert.equal(journeyId, SETUP_IMPORT_APPEARANCE_ID, 'Import requires the exact separate appearance journey');
  assert.equal(appearance, true, 'Import appearance requires --appearance');
  assert.ok(pair, 'Import appearance requires original externally admitted appearance pair');
}
export async function retirePreparedImportSource(app) {
  await app.quit();
  app.disposeImportSourceHome();
}
export async function readCompletedImport(rpc) {
  let job;
  try { job = await rpc('import.status', {}); }
  catch (error) { if (error.code === 'not_found') return null; throw error; }
  return job.done ? job : null;
}
export function assertSyntheticImportPreview(preview) {
  const sources = preview.sources.filter(source => source.profiles.length);
  assert.equal(sources.length, 1, 'Only the original synthetic Chrome source may be discovered');
  const source = sources[0];
  assert.equal(source.id, 'chrome'); assert.deepEqual(source.profiles, ['Default']);
  assert.equal(source.profileCategories.length, 1);
  const profile = source.profileCategories[0]; assert.equal(profile.profileId, 'Default');
  assert.deepEqual(profile.categories.map(row => row.category).sort(), ['bookmarks', 'history']);
  for (const row of profile.categories) { assert.equal(row.available, true); assert.equal(row.blocker, undefined); }
  assert.equal(profile.categories.find(row => row.category === 'bookmarks').count, 1);
  for (const unavailable of preview.sources.filter(source => !source.profiles.length))
    assert.equal(unavailable.categories.some(row => row.available), false, 'No attached/foreign source may be available');
  return source;
}
export function assertSyntheticImportCompletion(job) {
  assert.equal(job.done, true); assert.equal(job.cancelled, false);
  assert.ok(!job.interrupted && !job.error);
  assert.deepEqual(job.selections, [{ sourceId: 'chrome', profileId: 'Default', categories: ['bookmarks', 'history'] }]);
  assert.equal(job.progress.length, 2);
  assert.deepEqual(job.progress.map(row => row.category).sort(), ['bookmarks', 'history']);
  for (const row of job.progress) {
    assert.equal(row.source, 'chrome'); assert.equal(row.profileId, 'Default');
    assert.equal(row.state, 'done'); assert.equal(row.imported, 1); assert.equal(row.skipped, 0);
  }
}
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const checkbox = name => ({ name, role: 'AXCheckBox', match: 'contains', scope: 'shell' });
export async function captureSetupImport(t) {
  assert.equal(t.appearanceEnabled, true);
  const original = t.app.readImportSourceHome();
  const bookmarkUrl = new URL('/setup/bookmark', t.fixture.url).href;
  const historyUrl = new URL('/setup/history', t.fixture.url).href;
  const sourceCurrent = () => assert.deepEqual(t.app.readImportSourceHome(), original, 'Original source lease changed');
  async function destinations() {
    const bookmarks = await t.rpc('bookmarks.list', {}), history = await t.rpc('history.list', { query: 'Synthetic import history', limit: 500 });
    return { bookmarks: bookmarks.filter(row => row.url === bookmarkUrl), history: history.filter(row => row.url === historyUrl) };
  }
  async function noJob() {
    try { await t.rpc('import.status', {}); }
    catch (error) { if (error.code === 'not_found') return; throw error; }
    assert.fail('Discovery or selection created an import before explicit confirmation');
  }
  async function quiet() {
    assert.equal((await t.rpc('settings.get')).modelConfigured, false);
    assert.deepEqual(await t.rpc('pages.list'), []); assert.deepEqual(await t.rpc('runs.list'), []);
    sourceCurrent();
  }
  async function checks(checked) {
    for (const category of ['Bookmarks', 'History']) {
      const rows = await t.ax.query(checkbox(category));
      assert.equal(rows.length, 1, 'Unique original category control required');
      assert.equal(rows[0].checked, checked, 'Actual native category state differs');
    }
  }
  await t.step('discover only original synthetic Chrome source without consent', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.waitFor(shell('Welcome to Aux'), 'visible');
    await quiet(); await noJob(); assert.deepEqual(await destinations(), { bookmarks: [], history: [] });
    await t.ax.click(shell('2. import'));
    await t.ax.waitFor(shell('Bring your bookmarks and history'), 'visible');
    await captureHomeState(t, 'setup-import-before-discovery', 'setup-import-no-consent');
    await t.ax.click(shell('See what can be imported', 'AXButton'));
    await t.ax.waitFor(shell('Import selected (0)', 'AXButton'), 'disabled');
    const preview = await t.rpc('import.preview', {}); assertSyntheticImportPreview(preview);
    assert.deepEqual(preview.recentJobs, []); await checks(false); await noJob(); await quiet();
    await captureHomeState(t, 'setup-import-source-review', 'setup-import-synthetic-source-unselected');
    return { ax: await t.ax.dump(), rpc: { preview, destinations: await destinations(), source: original } };
  });
  await t.step('review exact bookmark and history selection before explicit import', { kind: 'ui', features: ['electronMigration'] }, async () => {
    for (const category of ['Bookmarks', 'History']) await t.ax.press(checkbox(category));
    await checks(true); await t.ax.waitFor(shell('Import selected (2)', 'AXButton'), 'enabled');
    await noJob(); assert.deepEqual(await destinations(), { bookmarks: [], history: [] }); await quiet();
    await captureHomeState(t, 'setup-import-selected-before-confirmation', 'setup-import-two-selected-not-imported');
    return { ax: await t.ax.dump(), rpc: { destinations: await destinations() } };
  });
  let completed;
  await t.step('explicitly confirm import then prove actual receipt and durable destination counts', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('Import selected (2)', 'AXButton'));
    await t.until('actual original import completes', async () => { const job = await readCompletedImport(t.rpc); if (!job) return false; completed = job; return true; });
    assertSyntheticImportCompletion(completed);
    await t.until('both imported destinations are genuinely visible', async () => { const rows = await destinations(); return rows.bookmarks.length === 1 && rows.history.length === 1; });
    await t.ax.waitFor(shell('Import finished.'), 'visible'); await quiet();
    await captureHomeState(t, 'setup-import-completed', 'setup-import-completed-one-bookmark-one-visit');
    return { ax: await t.ax.dump(), rpc: { job: completed, destinations: await destinations(), source: t.app.readImportSourceHome() } };
  });
  await t.step('revisit setup restores original completed receipt without replaying import', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await t.ax.click(shell('1. welcome')); await t.ax.waitFor(shell('Welcome to Aux'), 'visible');
    await t.ax.click(shell('2. import')); await t.ax.waitFor(shell('Import finished.'), 'visible');
    const restored = await t.rpc('import.status', {}); assert.deepEqual(restored, completed);
    const preview = await t.rpc('import.preview', {}); assertSyntheticImportPreview(preview);
    assert.deepEqual(preview.recentJobs.map(job => job.jobId), [completed.jobId]);
    const rows = await destinations(); assert.equal(rows.bookmarks.length, 1); assert.equal(rows.history.length, 1); await quiet();
    await captureHomeState(t, 'setup-import-completed-revisited', 'setup-import-original-receipt-no-replay');
    return { ax: await t.ax.dump(), rpc: { job: restored, destinations: rows, source: t.app.readImportSourceHome() } };
  });
}
