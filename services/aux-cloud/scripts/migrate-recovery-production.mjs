// Prepare only the approved Aux production schema; never activate a deployment.
import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {neon} from '@neondatabase/serverless';
import {migrationInventory} from './check-environment.mjs';

const projectId = 'ancient-river-76453764';
const databaseHost = 'ep-red-snow-b8ctxcyx-pooler.c-14.us-east-1.aws.neon.tech';
const migration = '012-sync-recovery-v2.sql';
const migrationSha256 = 'c7b963011657f8d6e28acdc0969eca1d0b6d7f118954142c918cf2bb52ba2e5e';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

async function run() {
  if (process.argv[2] !== '--apply') throw Error('explicit-schema-preparation-required');
  const connection = new URL(process.env.DATABASE_URL ?? '');
  if (process.env.NEON_PROJECT_ID !== projectId || connection.hostname !== databaseHost
      || !['postgres:', 'postgresql:'].includes(connection.protocol)) throw Error('target');
  const resources = JSON.parse(await readFile(new URL('../config/deployment-resources.json', import.meta.url)));
  // Keep the separate production deployment/resource profile deliberately off.
  if (resources.production !== null) throw Error('activation-state-changed');
  const approval = JSON.parse(await readFile(new URL('../../../docs/cloud/production-resource-review/execution.json', import.meta.url)));
  if (approval.database.projectId !== projectId || approval.productionActivated !== false
      || approval.teamId !== 'team_aFPyA9tVAkB2WegquB3aADsL'
      || approval.projectId !== 'prj_WLAGrKLQ42G5unZOI5FUkk5gBwxB') throw Error('resource-binding');
  const manifestBytes = await readFile(new URL('../src/schema-manifest.json', import.meta.url));
  const manifest = JSON.parse(manifestBytes);
  if (JSON.stringify(await migrationInventory()) !== JSON.stringify(manifest)
      || Object.keys(manifest).length !== 12 || manifest[migration] !== migrationSha256) throw Error('source');

  const db = neon(process.env.DATABASE_URL);
  const before = await db`SELECT name,sha256 FROM aux_migrations ORDER BY name`;
  if (![11, 12].includes(before.length)
      || before.some(row => manifest[row.name] !== row.sha256)
      || new Set(before.map(row => row.name)).size !== before.length
      || (before.length === 11 && before.some(row => row.name === migration))) throw Error('history');
  // The normal runner uses transactions, advisory locks and immutable hashes.
  // Every earlier migration is already present and therefore not replayed.
  await import('./migrate.mjs');
  const after = await db`SELECT name,sha256 FROM aux_migrations ORDER BY name`;
  if (after.length !== 12 || after.some(row => manifest[row.name] !== row.sha256)) throw Error('verification');
  const tables = await db`SELECT table_name FROM information_schema.tables
    WHERE table_schema='public'
    AND table_name IN ('aux_sync_recovery_v2','aux_sync_recovery_challenges_v2') ORDER BY table_name`;
  const [routine] = await db`SELECT to_regprocedure(
    'aux_apply_sync_recovery_v2(uuid,uuid,uuid,text,integer,jsonb,text,integer,jsonb,jsonb)') IS NOT NULL AS present`;
  if (tables.length !== 2 || routine?.present !== true) throw Error('verification');
  const evidence = {
    format: 'aux.production.recovery.schema-preparation.v1',
    checkedAt: new Date().toISOString(), projectId, databaseHost,
    beforeMigrations: before.length, afterMigrations: after.length,
    migrationSha256, manifestSha256: sha(manifestBytes),
    tables: tables.map(row => row.table_name), recoveryRoutinePresent: true,
    allMigrationHashesMatch: true, additiveOnly: true,
    accountOrExistingKeyUpdates: false, secretValuesPrinted: false,
    productionActivated: false, deploymentOrDomainChanged: false,
    developmentTouched: false, desktopChanged: false,
  };
  await writeFile(new URL('../evidence/production-recovery-migration.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
  console.log('Aux production schema12 verified; additive recovery tables/routine prepared; production remains inactive.');
}

try {
  await run();
} catch {
  console.error('Aux production recovery schema did not verify; private diagnostics withheld. Do not assume the migration was unapplied.');
  process.exitCode = 1;
}
