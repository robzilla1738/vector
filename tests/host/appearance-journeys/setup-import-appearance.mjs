import { captureSetupImport } from '../lib/setup-import-appearance.mjs';
// Outside the functional registry; retained original pair and source lease required.
export const journey = {
  id: 'setup-import-appearance', title: 'Explicit synthetic browser import review and completed receipt',
  features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 150000, owner: 'Trust importer appearance preparation',
};
export const run = captureSetupImport;
