#!/usr/bin/env node
/** Read-only rehearsal against a disposable copy of an Electron Aux data directory. */
import { mkdtemp, readFile, realpath, rm, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { prepareElectronMigration } from '../apps/runtime/dist/services/electron-migration.js';
import { applyElectronMigration } from '../apps/runtime/dist/services/electron-migration-apply.js';

const args = process.argv.slice(2);
const value = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
if (!value('--source-copy')) {
  console.error('Usage: node scripts/rehearse-electron-migration.mjs --source-copy <disposable Electron Aux data dir> [--source-original <original dir> for artifact path rebasing] [--layout <layout.json>]');
  process.exitCode = 2;
} else {
  const temporary = await mkdtemp(join(tmpdir(), 'aux-migration-rehearsal-'));
  try {
    const source = resolve(value('--source-copy'));
    const db = join(source, 'aux-state.sqlite');
    if (value('--source-original')) {
      const original = await realpath(resolve(value('--source-original')));
      const copied = await realpath(source);
      if (original === copied) throw new Error('Artifact path rebasing requires a separate disposable source copy.');
      const sourceArtifacts = join(original, 'artifacts');
      const copyDb = new DatabaseSync(db);
      try {
        copyDb.exec('BEGIN IMMEDIATE');
        try {
          for (const row of copyDb.prepare('SELECT artifact_id,path FROM artifacts').all()) {
            const path = String(row.path ?? '');
            const part = relative(sourceArtifacts, path);
            if (!part || part === '..' || part.startsWith(`..${sep}`) || isAbsolute(part)) continue;
            const target = join(copied, 'artifacts', part);
            try { if (!(await stat(target)).isFile()) continue; } catch { continue; }
            copyDb.prepare('UPDATE artifacts SET path=? WHERE artifact_id=?').run(target, row.artifact_id);
          }
          copyDb.exec('COMMIT');
        } catch (error) { copyDb.exec('ROLLBACK'); throw error; }
      } finally { copyDb.close(); }
    }
    const before = createHash('sha256').update(await readFile(db)).digest('hex');
    const layoutPath = value('--layout');
    if (layoutPath && (await stat(resolve(layoutPath))).size > 4 * 1024 * 1024) throw new Error('The layout export is too large.');
    const layoutJson = layoutPath ? await readFile(resolve(layoutPath), 'utf8') : undefined;
    const prepared = await prepareElectronMigration({ sourceDataDir: source, destinationDir: join(temporary, 'bundle'), layoutJson });
    const applied = await applyElectronMigration({ bundleDir: join(temporary, 'bundle'), profileDir: join(temporary, 'chromium-profile') });
    const again = await applyElectronMigration({ bundleDir: join(temporary, 'bundle'), profileDir: join(temporary, 'chromium-profile') });
    const after = createHash('sha256').update(await readFile(db)).digest('hex');
    if (before !== after || !again.alreadyApplied || prepared.contentHash !== applied.contentHash) throw new Error('Migration rehearsal did not preserve the source or apply idempotently.');
    process.stdout.write(`${JSON.stringify({ ok: true, sourcePreserved: true, idempotent: true, prepared, applied }, null, 2)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
