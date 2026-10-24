/** Actual supplied function with synthetic Worker events, never a native process. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {runInNewContext} from 'node:vm';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {adaptCliCode,CLI_BINARY_SHA256,CLI_CODE_SHA256} from '../../../../../vendor/provided/cli-adapter.mjs';
import {applyAuxCliWorkerSettlement} from '../../../../../vendor/provided/aux-cli-worker-settlement.mjs';
const root=process.cwd(),here=path.join(root,'docs/integration/proposed/standard-profile-isolation/cli-worker-settlement-a1');
const sha=value=>createHash('sha256').update(value).digest('hex');
const binary=await fs.readFile(path.join(root,'out/provided-source-snapshot-1.26.1016.1852/cli/Contents/MacOS/aside'));
assert.equal(sha(binary),CLI_BINARY_SHA256);
const source=bytes=>{const section=findMachOSeaSection(bytes);return readSeaBlob(bytes.subarray(section.offset,section.offset+section.size)).code};
const original=source(binary);assert.equal(sha(original),CLI_CODE_SHA256);
const predecessor=source(await fs.readFile(path.join(root,'out/provided-candidate-standard-profile-ui-20261024/Aux.app/Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea')));
const result=adaptCliCode(original,{enableCloud:true,profile:'development'},'aux-v1',2,'desktop-v1');
const replay=applyAuxCliWorkerSettlement({text:predecessor,original,stateIdentityVersion:2});
assert.equal(replay.text,result.code);assert.equal(replay.anchors.length,3);
assert(result.code.startsWith('#!/usr/bin/env node\n/* aux-cold-entry-admission-v1 */\nthrow '));
assert.equal(applyAuxCliWorkerSettlement({text:predecessor,original,stateIdentityVersion:1}).text,predecessor);
assert.throws(()=>applyAuxCliWorkerSettlement({text:result.code,original,stateIdentityVersion:2}),/drift or repeated/);
const output='/private/tmp/aux-cli-worker-settlement-source-20261024-a1';await fs.mkdir(output,{mode:0o700});
await fs.writeFile(path.join(output,'index.mjs'),result.code,{flag:'wx',mode:0o600});
const syntax=spawnSync(process.execPath,['--check',path.join(output,'index.mjs')],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
const before=await fs.readFile(path.join(here,'source/original.js.txt'),'utf8');
const after=await fs.readFile(path.join(here,'source/replacement.js.txt'),'utf8');
const body=text=>text.slice(text.indexOf('new Worker(`'),text.indexOf('let settled = false;'));
assert.equal(body(before),body(after));
function fixture(text,{binding=true}={}){
 const workers=[];
 class Worker extends EventEmitter{
  constructor(body,options){super();this.body=body;this.options=options;this.terminationRequests=0;workers.push(this)}
  terminate(){this.terminationRequests++;return Promise.resolve(0)}
 }
 const context={Worker,loadBinding:()=>binding?{}:null,loadedBindingPath:'/synthetic/fixed-native.node',bindingLoadError:null};
 runInNewContext(text+';globalThis.run=runNativeHelperCommandAsync;',context,{timeout:1000});
 let settled=false;const promise=context.run('synthetic-command','{}').then(value=>{settled=true;return value});
 return{workers,promise,isSettled:()=>settled};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve()};
// Demonstrate the real predecessor bug, then verify the corrected event order.
const prior=fixture(before);prior.workers[0].emit('message',{output:'{"ok":true}'});await flush();
assert.equal(prior.isSettled(),true);assert.equal(prior.workers[0].terminationRequests,1);prior.workers[0].emit('exit',0);
const clean=fixture(after);clean.workers[0].emit('message',{output:'{"ok":true}'});await flush();
assert.equal(clean.isSettled(),false);assert.equal(clean.workers[0].terminationRequests,0);
clean.workers[0].emit('exit',0);assert.equal((await clean.promise).ok,true);
const crash=fixture(after);crash.workers[0].emit('message',{output:'{"ok":true}'});await flush();
assert.equal(crash.isSettled(),false);crash.workers[0].emit('exit',9);
assert.match((await crash.promise).error,/exited with code 9/);
const failed=fixture(after);failed.workers[0].emit('error',Error('synthetic Worker failure'));await flush();
assert.equal(failed.isSettled(),false);failed.workers[0].emit('exit',1);
assert.equal((await failed.promise).error,'synthetic Worker failure');
const malformed=fixture(after);malformed.workers[0].emit('message',{output:'{malformed'});await flush();
assert.equal(malformed.isSettled(),false);malformed.workers[0].emit('exit',0);
assert.equal(typeof (await malformed.promise).error,'string');
const absent=fixture(after,{binding:false});assert.equal(absent.workers.length,0);
assert.equal((await absent.promise).error,'Native helper binding is not available');
const evidence={format:'aux.cli-worker-settlement.actual.v1',passed:true,originalCodeSha256:CLI_CODE_SHA256,
 predecessorCodeSha256:sha(predecessor),sourceSha256:result.sha256,output:path.join(output,'index.mjs'),
 exactSourceAnchors:3,independentFullCliAdapterMatches:true,wholeSourceSyntaxPassed:true,
 workerBodyAndDataUnchanged:true,originalEarlySettlementReproduced:true,newMessageWaitsForExit:true,
 laterExitFailureOverridesSuccess:true,workerErrorWaitsForExit:true,malformedOutputWaitsForExit:true,
 unavailableBindingPreserved:true,noEarlyWorkerTermination:true,compatibilitySourceUnchanged:true,
 defaultColdRefusalPreserved:true,nativeApiChanged:false,realWorkersRun:false,nativeCommandRun:false,
 nativeOsLifetimeEstablished:false,appLaunched:false,packaged:false,runtimeAcceptance:false};
await fs.writeFile(path.join(here,'actual-source-a1.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,anchors:3,originalEarlySettlementReproduced:true,realWorkersRun:false}));
