import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { shell, settings, press } from '../fixtures/legacy-ui.mjs';

export const journey = { id: 'runtime-backup-restore', title: 'Create a native task-data backup and restore it after restart with a recovery snapshot', features: ['electronMigration'], devAcceptance: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 120000, owner: 'LJ' };
export async function run(t) {
  const data = join(t.app.userDataDir, 'Default/Aux Runtime Data');
  let backup;
  let marker;
  await t.step('create a native task data backup in Settings', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await settings(t, 'General');
    await press(t, shell('Manage task data backup', 'AXButton'));
    await t.ax.waitFor(shell('Create backup…', 'AXButton'));
    await press(t, shell('Create backup…', 'AXButton'));
    backup = await t.until('native backup manifest committed', async () => (await t.rpc('installation.listBackups')).find(item => item.name.startsWith('aux-runtime-')), 30000);
    const backupRelative = relative(realpathSync(data), realpathSync(backup.path));
    t.assert.ok(backupRelative && !backupRelative.startsWith('..'), 'Only backup paths inside disposable runtime data may be inspected');
    t.assert.ok(existsSync(join(backup.path, 'manifest.json')));
    await t.ax.waitFor({ ...shell('Backup saved'), match: 'contains' });
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('installation.listBackups');
    await t.capture('runtime-backup-created');
    return { ax, rpc };
  });
  marker = await t.rpc('workspaces.create', { name: 'Post-backup disposable marker' });
  t.assert.ok((await t.rpc('workspaces.list')).some(item => item.workspaceId === marker.workspaceId));
  await t.step('choose the exact disposable backup in the native restore picker', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await settings(t, 'General');
    await press(t, shell('Manage task data backup', 'AXButton'));
    await press(t, shell('Restore backup…', 'AXButton'));
    await t.ax.waitFor({ role: 'AXSheet', scope: 'window' });
    await t.ax.request('openPanel', { path: backup.path, button: 'Select' });
    await t.until('validated restore staged', () => existsSync(join(data, 'pending-runtime-restore.json')));
    const pending = JSON.parse(readFileSync(join(data, 'pending-runtime-restore.json'), 'utf8'));
    t.assert.equal(pending.version, 2);
    t.assert.ok(Array.isArray(pending.artifactFiles));
    const ax = await t.ax.dump({ scope: 'shell' });
    const rpc = await t.rpc('installation.restoreStatus');
    t.assert.equal(rpc.pending, true);
    await t.capture('runtime-restore-staged');
    return { ax, rpc };
  });
  await t.restart();
  await t.step('restart applies the backup and preserves the replaced database for recovery', { kind: 'ui', features: ['electronMigration'] }, async () => {
    await settings(t, 'General');
    await press(t, shell('Manage task data backup', 'AXButton'));
    await t.ax.waitFor(shell('Restore backup…', 'AXButton'));
    const workspaces = await t.rpc('workspaces.list');
    t.assert.ok(!workspaces.some(item => item.workspaceId === marker.workspaceId));
    const rpc = await t.rpc('installation.restoreStatus');
    t.assert.equal(rpc.pending, false);
    t.assert.ok(rpc.lastAppliedAt > 0);
    t.assert.equal(existsSync(join(data, 'pending-runtime-restore.json')), false);
    const snapshots = readdirSync(join(data, 'recovery')).filter(name => name.startsWith('runtime-'));
    t.assert.equal(snapshots.length, 1, 'Restore preserves exactly one replaced database');
    const db = new DatabaseSync(join(data, 'recovery', snapshots[0], 'state.sqlite'), { readOnly: true });
    try { t.assert.ok(db.prepare('SELECT 1 FROM workspaces WHERE workspace_id=?').get(marker.workspaceId)); }
    finally { db.close(); }
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.capture('runtime-backup-restored');
    return { ax, rpc: { restore: rpc, workspaces, recoverySnapshots: snapshots.length } };
  });
}
