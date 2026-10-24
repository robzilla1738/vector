import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {AsyncLocalStorage} from 'node:async_hooks';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {transformRuntimeCoordination} from './transform.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const sources=['index.mjs','aux-native-entry.mjs'];const records=[];
for(const name of sources){
 const input=fs.readFileSync(path.join('/private/tmp/aux-browser-features-async-daemon-20261023-a2',name),'utf8');
 const result=transformRuntimeCoordination(input);let replay=input;
 for(const change of result.changes){assert.equal(replay.split(change.find).length-1,1);replay=replay.replace(change.find,change.replace)}
 assert.equal(replay,result.text);
 const output=path.join('/private/tmp',`aux-runtime-coordination-check-${name}`);fs.writeFileSync(output,result.text);
 const syntax=spawnSync(process.execPath,['--check',output],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
 for(const name of ['auxLocalDownloadArchive','extractArchive','replaceRuntime','performInstall']){
  const anchor=JSON.parse(fs.readFileSync(path.join(here,'anchors.json'),'utf8')).find(c=>c.find.startsWith(`async function ${name}(`));
  assert.ok(anchor);assert.ok(!anchor.replace.includes('noteUntracked()'));
 }
 assert.ok(!result.text.includes('runtime/aside-runtime-'));assert.ok(!result.text.includes('let ni=`aside-runtime-${ti.version}'));
 records.push({name,inputSha256:hash(input),outputSha256:hash(result.text),anchors:result.changes.length});
}
// Tiny synthetic scope test: nested mutation is reentrant only inside its own
// async context; two independent operations never inherit each other's rights.
let acquired=0;const closed=[];const contexts=[];
const binding={};Object.defineProperty(binding,'acquireRuntimeMutation',{value:async()=>{const id=++acquired;return Object.freeze({id,close:()=>closed.push(id)})}});
const context=vm.createContext({AsyncLocalStorage,process:{_linkedBinding:()=>binding},auxBrokerBoundary:()=>({assertOwner(){}}),Error,Object,path,console});
vm.runInContext(fs.readFileSync(path.join(here,'source/runtime-coordination.js'),'utf8'),context);
await context.auxWithRuntimeMutation(async()=>{
 const outer=context.auxRuntimeMutation();await context.auxWithRuntimeMutation(async()=>assert.equal(context.auxRuntimeMutation(),outer));
});
assert.equal(acquired,1);assert.deepEqual(closed,[1]);
await Promise.all([context.auxWithRuntimeMutation(async()=>{const scope=context.auxRuntimeMutation();await Promise.resolve();contexts.push(scope.id);assert.equal(context.auxRuntimeMutation(),scope)}),context.auxWithRuntimeMutation(async()=>{const scope=context.auxRuntimeMutation();await Promise.resolve();contexts.push(scope.id);assert.equal(context.auxRuntimeMutation(),scope)})]);
assert.equal(new Set(contexts).size,2);assert.equal(acquired,3);assert.equal(closed.length,3);
const core=fs.readFileSync(path.join(here,'source/AuxRuntimeCoordination.inc'),'utf8');
assert.ok(core.includes('scope->lease->Acquire(task,current,scope->lease->mode,attempts)'));
assert.ok(core.includes('!pending_children&&!unsettled_children&&!unknown&&counted'));
assert.ok(core.includes('RuntimeChildCohortSettled('));
const host=fs.readFileSync(path.join(here,'source/AuxDevelopmentWorkerHost.cc'),'utf8');
assert.equal(host.split('RuntimeChildCreatedLocked(reservation->runtime_scope);').length-1,2);
assert.equal(host.split('RuntimeChildFailed(reservation->runtime_scope);').length-1,2);
assert.equal(host.split('RuntimeChildCohortSettled(').length-1,0);
console.log(JSON.stringify({format:'aux.runtime-coordination.source-check.v1',records,sourceReplay:true,syntax:true,syntheticScopeChecks:3,nativeCompiled:false,nativeIntegrated:false,runtimeAccepted:false,descendantSettlementAvailable:false},null,2));
