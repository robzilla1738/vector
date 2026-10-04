import assert from 'node:assert/strict';
import { captureRejectedModelProbeAppearance } from '../lib/model-probe-appearance.mjs';
export const journey = { id: 'model-probe-failure-appearance', title: 'Genuine rejected loopback probe and original failure details', features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 150000, owner: 'Trust' };
export async function run(t) {
  assert.equal(t.appearanceEnabled, true);
  t.signal.throwIfAborted();
  return t.step('original disposable Profile failure probe', { kind: 'ui', features: ['electronMigration'] }, () => captureRejectedModelProbeAppearance(t));
}
