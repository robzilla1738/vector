import { captureSetupDisclosures } from '../lib/setup-appearance.mjs';

// Deliberately outside the functional registry: no qualification journey added.
// Import, interruption, replay and postcard need separate source-home admission.
export const journey = {
  id: 'setup-appearance', title: 'Strict paired fresh welcome and ungranted setup disclosures',
  features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 150000, owner: 'Design reviewer setup appearance preparation',
};
export const run = captureSetupDisclosures;
