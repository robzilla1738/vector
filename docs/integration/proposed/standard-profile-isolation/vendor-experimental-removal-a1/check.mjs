import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {transformAuxVendorEntitlementRemoval} from '../vendor-entitlement-removal-a1/source/transform.mjs';
import {transformAuxVendorExperimentalRemoval} from './source/transform.mjs';
const review=JSON.parse(fs.readFileSync(new URL('./overlay.json',import.meta.url)));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const row of review.pairedInputs){
 const initial=fs.readFileSync('/private/tmp/aux-standard-daemon-projection-20261024-a5/'+row.path,'utf8');
 const before=transformAuxVendorEntitlementRemoval(initial).text;
 assert.equal(sha(before),row.inputSha256);
 const after=transformAuxVendorExperimentalRemoval(before).text;
 assert.equal(sha(after),row.outputSha256);
 assert(!after.includes('INTERNAL_EMAIL_SUFFIX')&&!after.includes('@at.studio')&&!after.includes('@aside.com'));
}
const [edit]=JSON.parse(fs.readFileSync(new URL('./source/anchors.json',import.meta.url)));
const functionText=edit.replace.slice(0,edit.replace.indexOf('var EXPERIMENTAL'));
const eligible=vm.runInNewContext('('+functionText+')');
assert.equal(eligible(),false);
for(const email of ['staff@at.studio','staff@aside.com','staff@getaux.co','person@example.test'])
 for(const isCanary of [false,true])for(const featureFlag of [false,true])
  assert.equal(eligible({email,isCanary,featureFlag}),isCanary||featureFlag);
assert.throws(()=>transformAuxVendorExperimentalRemoval('changed source'));
console.log(JSON.stringify({passed:true,pairedReplay:true,purePredicateCases:17,productExecuted:false,projected:false}));
