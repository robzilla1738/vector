import { configureModel } from '../lib/l10-trust-fixtures.mjs';
import { captureModelDiscoveryAppearance } from '../lib/model-discovery-appearance.mjs';
export const journey = { id: 'model-discovery-appearance', title: 'Original owned provider discovery pending and released catalog', features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 150000, owner: 'Design reviewer' };
export async function run(t) { await configureModel(t); await t.step('real provider discovery GET loading and released planner focus', { kind: 'ui', features: ['electronMigration'] }, () => captureModelDiscoveryAppearance(t)); }
