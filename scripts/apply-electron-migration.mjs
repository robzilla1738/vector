#!/usr/bin/env node
import { resolve } from 'node:path';
import { applyElectronMigration } from '../apps/runtime/dist/services/electron-migration-apply.js';

const args = process.argv.slice(2);
const value = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
if (!value('--bundle') || !value('--profile') || (value('--vault') && !value('--vault-passphrase-env'))) {
  console.error('Usage: node scripts/apply-electron-migration.mjs --bundle <migration bundle> --profile <new Chromium Aux profile data dir> [--vault <file.auxvault> --vault-passphrase-env <env name>] [--dry-run]');
  process.exitCode = 2;
} else {
  try {
    const passphraseName = value('--vault-passphrase-env');
    if (passphraseName && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(passphraseName)) throw new Error('Invalid passphrase environment variable name.');
    const passphrase = passphraseName ? process.env[passphraseName] : undefined;
    const report = await applyElectronMigration({ bundleDir: resolve(value('--bundle')),
      profileDir: resolve(value('--profile')), ...(value('--vault') ? { vaultPath: resolve(value('--vault')) } : {}),
      ...(passphrase ? { vaultPassphrase: passphrase } : {}), dryRun: args.includes('--dry-run') });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
