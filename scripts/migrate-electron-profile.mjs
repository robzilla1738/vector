#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { prepareElectronMigration } from '../apps/runtime/dist/services/electron-migration.js';

function usage() {
  console.error('Usage: node scripts/migrate-electron-profile.mjs --source <Electron Aux data dir> --output <new bundle dir> [--layout <exported layout.json>] [--dry-run]');
  process.exitCode = 2;
}
const args = process.argv.slice(2);
const value = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
if (!value('--source') || !value('--output')) usage();
else {
  try {
    const layout = value('--layout');
    if (layout && (await stat(resolve(layout))).size > 4 * 1024 * 1024) throw new Error('The layout export is too large.');
    const layoutJson = layout ? await readFile(resolve(layout), 'utf8') : undefined;
    const report = await prepareElectronMigration({ sourceDataDir: resolve(value('--source')),
      destinationDir: resolve(value('--output')), layoutJson, dryRun: args.includes('--dry-run') });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
