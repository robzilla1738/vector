import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { checkEnvironment, requiredEnvironmentKeys } from '../../../../services/aux-cloud/scripts/check-environment.mjs';

const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const resources = await read('../../../../services/aux-cloud/config/deployment-resources.json');
const migration = await read('../../../../services/aux-cloud/evidence/production-recovery-migration.json');
const inventory = await read('../../../../services/aux-cloud/evidence/production-configuration.json');
const origins = await read('../../../../services/aux-cloud/evidence/production-public-origins.json');
assert.equal(resources.production.databaseHost, migration.databaseHost);
assert.equal(migration.allMigrationHashesMatch, true);
assert.equal(migration.afterMigrations, 12);
assert.equal(resources.production.appOrigin, origins.settings.AUX_ALLOWED_ORIGINS);
assert.equal(resources.production.appOrigin, origins.settings.CLERK_AUTHORIZED_PARTIES);
assert.notEqual(resources.production.databaseHost, resources.development.databaseHost);

// Synthetic strings only. No process environment, provider SDK or network use.
const environment = Object.fromEntries(requiredEnvironmentKeys.map(key => [key, 'synthetic-config']));
Object.assign(environment, {
  VERCEL_ENV: 'production',
  DATABASE_URL: `postgresql://fixture:fixture@${resources.production.databaseHost}/fixture`,
  NEXT_PUBLIC_APP_URL: resources.production.appOrigin,
  AUX_API_ORIGIN: resources.production.apiOrigin,
  AUX_ALLOWED_ORIGINS: resources.production.appOrigin,
  CLERK_AUTHORIZED_PARTIES: resources.production.appOrigin,
  AUX_AUTH_SECRET: 'synthetic-auth-value-with-at-least-32-characters',
  CRON_SECRET: 'synthetic-cron-value-with-at-least-32-characters',
  AUX_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 3).toString('base64'),
  CLERK_SECRET_KEY: 'sk_live_synthetic',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_synthetic',
  STRIPE_SECRET_KEY: 'rk_live_synthetic',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_live_synthetic',
});
assert.deepEqual(checkEnvironment(environment, resources), { profile: 'production', target: 'production' });
assert.equal(inventory.missing.length, 9);
for (const key of inventory.missing) {
  const missing = { ...environment };
  delete missing[key];
  assert.throws(() => checkEnvironment(missing, resources), { message: 'Missing configuration: ' + key });
}
const actualMissingShape = { ...environment };
for (const key of inventory.missing) delete actualMissingShape[key];
assert.throws(() => checkEnvironment(actualMissingShape, resources), /Missing configuration:/);
for (const [key, value, error] of [
  ['DATABASE_URL', `postgresql://fixture:fixture@${resources.development.databaseHost}/fixture`, /DATABASE_URL does not match/],
  ['NEXT_PUBLIC_APP_URL', resources.development.appOrigin, /Invalid configuration: NEXT_PUBLIC_APP_URL/],
  ['AUX_API_ORIGIN', resources.development.apiOrigin, /Invalid configuration: AUX_API_ORIGIN/],
  ['STRIPE_SECRET_KEY', 'rk_test_synthetic', /Wrong provider mode: STRIPE_SECRET_KEY/],
]) assert.throws(() => checkEnvironment({ ...environment, [key]: value }, resources), error);
const development = { ...environment, VERCEL_ENV: 'preview',
  DATABASE_URL: `postgresql://fixture:fixture@${resources.development.databaseHost}/fixture`,
  NEXT_PUBLIC_APP_URL: resources.development.appOrigin, AUX_API_ORIGIN: resources.development.apiOrigin,
  AUX_ALLOWED_ORIGINS: resources.development.appOrigin, CLERK_AUTHORIZED_PARTIES: resources.development.appOrigin,
  CLERK_SECRET_KEY: 'sk_test_synthetic', NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_synthetic',
  STRIPE_SECRET_KEY: 'rk_test_synthetic', NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_synthetic' };
assert.deepEqual(checkEnvironment(development, resources), { profile: 'development', target: 'preview' });
console.log(JSON.stringify({ productionProfileSourceMatchesReceipts: true, missingFieldsIndividuallyRefused: 9,
  completeSyntheticShapeAccepted: true, developmentUnchanged: true, providerOrDeploymentOperations: 0 }));
