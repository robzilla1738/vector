import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {transformAuxVendorEntitlementRemoval} from './source/transform.mjs';
const review=JSON.parse(fs.readFileSync(new URL('./overlay.json',import.meta.url)));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const row of review.daemonInputs){const input=fs.readFileSync(row.path,'utf8');assert.equal(sha(input),row.inputSha256);const result=transformAuxVendorEntitlementRemoval(input);assert.equal(sha(result.text),row.outputSha256);assert.equal(sha(JSON.stringify(result.changes)),row.changesSha256);assert.equal(result.text.includes('@aside.com'),false);}
const [edit]=JSON.parse(fs.readFileSync(new URL('./source/anchors.json',import.meta.url)));
for(const enabled of [false,true]){
 const context=vm.createContext({AUX_LAUNCH_POLICY:{paymentsEnabled:enabled}});
 // Execute only the isolated pure entitlement predicate, never the daemon.
 const predicate=vm.runInContext('('+edit.replace+')',context);
 assert.equal(predicate(null,['pro']),false);
 for(const email of ['staff@aside.com','staff@at.studio','staff@getaux.co','person@example.test']){
  assert.equal(predicate({email,subscriptionPlan:'free'},['pro']),!enabled);
  assert.equal(predicate({email,subscriptionPlan:'pro'},['pro']),true);
 }
}
assert.throws(()=>transformAuxVendorEntitlementRemoval('different source'));
console.log(JSON.stringify({passed:true,pairedSourceReplay:true,purePredicateCases:18,productExecuted:false,providerCalled:false,projectionWritten:false}));
