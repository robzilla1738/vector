import assert from 'node:assert/strict';
import { captureMountedImageAppearance } from '../lib/mounted-image-appearance.mjs';
export const MOUNTED_IMAGE_APPEARANCE_ID = 'mounted-image-appearance';
export function requireMountedImageAppearance({journeyId,appearance,pair}) {
  assert.equal(journeyId,MOUNTED_IMAGE_APPEARANCE_ID);
  assert.equal(appearance,true);
  assert.ok(typeof pair==='string'&&pair.length>0,'Externally admitted original appearance pair request required');
}
export const journey = { id: MOUNTED_IMAGE_APPEARANCE_ID, title: 'Original local PNG mounted image visual states', features: ['electronMigration'], needs: ['accessibility','screen-recording'], model: 'loopback', launch: {}, timeoutMs: 150000, owner: 'Design reviewer' };
export async function run(t) {
  assert.equal(t.appearanceEnabled,true,'Mounted image visual states require original appearance capture');
  await t.step('original local chooser and mounted Preview Include Remove visual states', {kind:'ui',features:['electronMigration']}, () => captureMountedImageAppearance(t));
}
