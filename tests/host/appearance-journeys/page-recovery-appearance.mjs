import { capturePageRecoveryAppearance } from '../lib/page-recovery-appearance.mjs';
// Outside the functional registry; exact paired admission is a separate runner request.
export const journey = {
  id: 'page-recovery-appearance', title: 'Original owned loopback certificate error and recovery disclosure',
  features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'none',
  fixture: { tls: true }, launch: {}, timeoutMs: 120000, owner: 'Design reviewer recovery appearance preparation',
};
export async function run(t) {
  await t.step('Observe the original native certificate error without granting an exception', { kind: 'ui', features: ['electronMigration'] }, () => capturePageRecoveryAppearance(t));
}
