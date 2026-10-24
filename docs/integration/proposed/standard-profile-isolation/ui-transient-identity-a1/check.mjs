/** Focused exact-delta/source checks; no browser, storage or provider execution. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {applyAuxUiTransientIdentity} from '../../../../../vendor/provided/aux-ui-transient-identity.mjs';
const root=process.cwd(),here=path.join(root,'docs/integration/proposed/standard-profile-isolation/ui-transient-identity-a1');
const pins=JSON.parse(await fs.readFile(path.join(here,'inputs.json'),'utf8'));
const stage='/private/tmp/aux-ui-transient-stage-20261024-a1/desktop-v1/agent';
const previous='/private/tmp/aux-ui-peer-stage-20261024-a1/desktop-v1/agent';
const snapshot=path.join(root,'out/provided-source-snapshot-1.26.1016.1852/agent');
const sha=value=>createHash('sha256').update(value).digest('hex');
let replaced=0;
for(const file of pins.files){
 const original=await fs.readFile(path.join(snapshot,file.path),'utf8');
 const text=await fs.readFile(path.join(previous,file.path),'utf8');
 assert.equal(sha(text),file.predecessorSha256);
 const input={component:'agent',path:file.path,text,original,stateIdentityVersion:2};
 const result=applyAuxUiTransientIdentity(input),actual=await fs.readFile(path.join(stage,file.path),'utf8');
 assert.equal(result.text,actual);
 assert.equal(applyAuxUiTransientIdentity({...input,stateIdentityVersion:1}).text,text);
 assert.throws(()=>applyAuxUiTransientIdentity({...input,text:actual}),/drift or repeated/);
 const syntax=spawnSync(process.execPath,['--check',path.join(stage,file.path)],{encoding:'utf8'});
 assert.equal(syntax.status,0,syntax.stderr);
 replaced+=result.anchors.reduce((sum,anchor)=>sum+anchor.count,0);
}
// Compare the actual three protocol-definition cohorts after real staging.
const contracts=[];
for(const relative of ['background.js','tab-preview-player.js','assets/channel-platform-icon-Cjhdli_M.js']){
 const text=await fs.readFile(path.join(stage,relative),'utf8');
 const contract={};
 for(const field of ['readyMessageType','renderStateMessageType','streamPort','visibilityMessageType']){
  const matches=[...text.matchAll(new RegExp(field+':\\s*"(aux\\.tab-preview\\.[^"]+)"','g'))];
  assert.equal(matches.length,1);contract[field]=matches[0][1];
 }
 contracts.push(contract);
}
assert.deepEqual(contracts[0],contracts[1]);assert.deepEqual(contracts[1],contracts[2]);
assert.equal(replaced,29);
await fs.writeFile(path.join(here,'actual-focused-a1.json'),JSON.stringify({format:'aux.ui-transient.focused.actual.v1',passed:true,
 files:pins.files.length,countedReplacements:replaced,exactPredecessorReplayPassed:true,changedScriptsParse:true,
 compatibilityStateUnchanged:true,repeatedDerivationRefused:true,actualPreviewProtocolCohortsMatch:true,
 persistedStateReadOrChanged:false,uiGeometryChanged:false,productExecuted:false,runtimeBehaviorEstablished:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,files:pins.files.length,replacements:replaced,productExecuted:false}));
