import assert from 'node:assert/strict';
import { captureSuccessfulModelProbeAppearance } from '../lib/model-probe-appearance.mjs';
export const journey = { id: 'model-probe-success-appearance', title: 'Genuine held loopback probe and saved successful connection', features: ['electronMigration'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 150000, owner: 'Trust' };
export async function run(t) {
  assert.equal(t.appearanceEnabled, true);
  t.signal.throwIfAborted();
  return t.step('original disposable Profile success probe', { kind: 'ui', features: ['electronMigration'] }, () => captureSuccessfulModelProbeAppearance(t));
}
