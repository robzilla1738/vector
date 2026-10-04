import assert from 'node:assert/strict';
import {captureLongNamedMountedImageAppearance} from '../lib/mounted-image-appearance.mjs';
export const MOUNTED_LONG_IMAGE_APPEARANCE_ID='mounted-long-image-appearance';
export function requireMountedLongImageAppearance({journeyId,appearance,pair}) {
 assert.equal(journeyId,MOUNTED_LONG_IMAGE_APPEARANCE_ID);assert.equal(appearance,true);
 assert.ok(typeof pair==='string'&&pair.length>0,'Externally admitted original appearance pair request required');
}
export const journey={id:MOUNTED_LONG_IMAGE_APPEARANCE_ID,title:'Original fixed long filename mounted image visual states',features:['electronMigration'],needs:['accessibility','screen-recording'],model:'loopback',launch:{},timeoutMs:150000,owner:'Design reviewer'};
export async function run(t) {
 assert.equal(t.appearanceEnabled,true,'Long image visual states require original appearance capture');
 t.signal.throwIfAborted();
 await t.step('original long local chooser and mounted Preview zoom details Include Remove visual states',{kind:'ui',features:['electronMigration']},()=>captureLongNamedMountedImageAppearance(t));
}
