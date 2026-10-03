import { captureImportInterruption } from '../lib/setup-import-interruption.mjs';
export const journey = {
  id: 'setup-import-interruption-appearance', title: 'Genuine partial browser import cancellation and reviewed merge',
  features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'none',
  launch: {}, timeoutMs: 150000, owner: 'Trust import interruption source preparation',
};
export const run = captureImportInterruption;
