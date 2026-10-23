import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {transformProviderFundedLaunch,providerFundedLaunchUiInputs,providerFundedLaunchPolicy} from './provider-funded-launch.mjs';
import {adaptProviderLaunchCode as adaptDaemonCode} from './provider-launch-stage.mjs';
import {applyAuxProviderIdentity} from './aux-provider-identity.mjs';
import {applyAuxRuntimeContractIdentity} from './aux-runtime-contract-identity.mjs';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
const snapshot=process.env.AUX_TEST_SOURCE_SNAPSHOT??'/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852';
const sha=t=>createHash('sha256').update(t).digest('hex');
const classes=t=>[...t.matchAll(/className:("(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/g)].map(m=>m[1]);
function syntax(text){const d=mkdtempSync(join(tmpdir(),'aux-launch-source-'));try{const p=join(d,'entry.mjs');writeFileSync(p,text);execFileSync(process.execPath,['--check',p],{stdio:'pipe'});}finally{rmSync(d,{recursive:true,force:true});}}
test('actual pinned UI: replay every edit, preserve className tokens and provider controls',()=>{
 let changed=0;
 for(const [path,pin] of Object.entries(providerFundedLaunchUiInputs)){
  const original=readFileSync(join(snapshot,'agent',path),'utf8');assert.equal(sha(original),pin);
  const result=transformProviderFundedLaunch({component:'agent',path,text:original,branding:'supplied'});let replay=original;
  for(const edit of result.anchors){assert.equal(replay.split(edit.find).length-1,edit.count);replay=replay.split(edit.find).join(edit.replace);}
  assert.equal(replay,result.text);assert.deepEqual(classes(result.text),classes(original));syntax(result.text);changed++;
  let branded=original.replaceAll('Aside','Aux');
  const provider=applyAuxProviderIdentity({component:'agent',path,text:branded,original,branding:'aux'});
  const runtime=applyAuxRuntimeContractIdentity({component:'agent',path,text:provider.text,original,branding:'aux',nativeAdapted:true});
  const migrated=transformProviderFundedLaunch({component:'agent',path,text:runtime.text,stateIdentityVersion:2});syntax(migrated.text);assert.deepEqual(classes(migrated.text),classes(runtime.text));
  assert.throws(()=>transformProviderFundedLaunch({component:'agent',path,text:result.text,branding:'supplied'}),/drift/);
 }
 assert.equal(changed,10);assert.equal(providerFundedLaunchPolicy.paymentsEnabled,false);assert.equal(providerFundedLaunchPolicy.hostedAiEnabled,false);
});
test('actual daemon: compiled source and payment/hosted boundary fails before token/network access',()=>{
 const binary=readFileSync(join(snapshot,'daemon/Contents/MacOS/aside-daemon')),section=findMachOSeaSection(binary),source=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
 for(const [identityProfile,stateIdentityVersion] of [['compatibility',1],['aux-v1',2]]){
 const adapted=adaptDaemonCode(source,{},identityProfile,stateIdentityVersion);
 const text=adapted.code;assert.equal(adapted.applied.filter(a=>a.name==='public provider-funded launch policy').length,1);syntax(text);
 assert.throws(()=>transformProviderFundedLaunch({component:'daemon',path:'entry.mjs',text,stateIdentityVersion}),/already applied/);
 const policy=text.slice(text.indexOf('const AUX_LAUNCH_POLICY='),text.indexOf('import{createRequire}'));
 const context=vm.createContext({});vm.runInContext(policy+';globalThis.check=assertAuxLaunchRequest;',context);
 for(const p of ['/ai/v1/responses','/ai/private-input','/speech/transcribe','/stt/transcribe'])assert.throws(()=>context.check(p,{method:'POST'}),/Aux-hosted AI is unavailable/);
 for(const p of ['/billing/checkout','/billing/add-on-checkout','/billing/auto-reload'])assert.throws(()=>context.check(p,{method:'POST'}),/Aux payments are not enabled/);
 for(const p of ['/auth/refresh','/drive/files','/identity','/billing/subscription'])assert.doesNotThrow(()=>context.check(p,{method:'GET'}));
 const account=text.match(/function accountHasAllowedPlan\(Cn,ei\)\{[^}]+\}/)[0];
 const accountContext=vm.createContext({});vm.runInContext(policy+account+';globalThis.entitled=accountHasAllowedPlan;',accountContext);assert.equal(accountContext.entitled(null,['pro']),false);assert.equal(accountContext.entitled({subscriptionPlan:'free'},['pro']),true);
 assert.ok(text.includes('Cn===AUX_PROVIDER_ID)throw Error("Aux-hosted AI is unavailable.'));
 assert.ok(text.includes('await getValidAccessToken(this.accountId,Cn)'));
 }
});
