import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inspectProductionConfiguration } from './check-production-configuration.mjs';
import { requiredEnvironmentKeys } from './check-environment.mjs';

test('metadata audit reports missing production setup without serializing private values',()=>{
  const marker='fixture-private-value-must-not-escape';
  const rows=[{key:'CLERK_SECRET_KEY',value:marker,type:'sensitive',target:['production']},{key:'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',value:'pk_live_'+Buffer.from('clerk.getaux.co$').toString('base64'),type:'plain',target:['production']},{key:'RESEND_FROM',value:'Aux <hello@notify.getaux.co>',type:'plain',target:['development','preview','production']}];
  const result=inspectProductionConfiguration(rows,false);
  assert.equal(result.clerkHost,'clerk.getaux.co');assert.equal(result.configurationComplete,false);assert.equal(result.resourceProfileConfigured,false);assert.ok(result.missing.includes('CLERK_WEBHOOK_SIGNING_SECRET'));assert.deepEqual(result.scopeMismatches,[]);assert.equal(JSON.stringify(result).includes(marker),false);assert.equal(result.providerSecretPairingVerified,false);
});
test('metadata audit rejects cross-environment secrets, public secret types and wrong Aux endpoints',()=>{
  const rows=requiredEnvironmentKeys.map(key=>({key,value:'private-fixture',type:'sensitive',target:['production']}));
  rows.find(row=>row.key==='CLERK_SECRET_KEY').target.push('preview');
  rows.find(row=>row.key==='RESEND_API_KEY').type='plain';
  Object.assign(rows.find(row=>row.key==='NEXT_PUBLIC_APP_URL'),{type:'plain',value:'https://unrelated.example'});
  const result=inspectProductionConfiguration(rows,true);
  assert.equal(result.configurationComplete,false);assert.ok(result.scopeMismatches.includes('CLERK_SECRET_KEY'));assert.ok(result.typeMismatches.includes('RESEND_API_KEY'));assert.ok(result.publicValueMismatches.includes('NEXT_PUBLIC_APP_URL'));assert.ok(result.publicValueMismatches.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'));assert.equal(JSON.stringify(result).includes('private-fixture'),false);
  assert.throws(()=>inspectProductionConfiguration([...rows,rows[0]],true),/Ambiguous/);
  const encryptedPublic=inspectProductionConfiguration([{key:'AUX_ALLOWED_ORIGINS',value:'encrypted-private-marker',type:'encrypted',target:['production']}],true);
  assert.deepEqual(encryptedPublic.publicValuesUnverified,['AUX_ALLOWED_ORIGINS']);assert.deepEqual(encryptedPublic.publicValueMismatches,[]);assert.equal(JSON.stringify(encryptedPublic).includes('encrypted-private-marker'),false);
});
