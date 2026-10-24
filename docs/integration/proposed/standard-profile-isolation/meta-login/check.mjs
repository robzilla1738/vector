import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxMetaLogin} from './source/transform.mjs';
const here=path.dirname(new URL(import.meta.url).pathname);
const sha=value=>createHash('sha256').update(value).digest('hex');
const roots='/private/tmp/aux-standard-daemon-projection-20261024-a3';
const expected={source:'3ee2471769470b820bfaf16d64f6dfc7aa0bef1b8ad54493c7d2a0bffe725802',entry:'ba6194fbe579dec43ccaa2a7b788e58bc0a1cb9a0ff52ab5b5cfcea334890804'};
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'aux-meta-login-source-'));
const daemonInputs=[];
try {
  for(const kind of ['source','entry']) {
    const file=path.join(roots,kind==='source'?'index.mjs':'projected-entry/aux-native-entry.mjs');
    const input=await fs.readFile(file,'utf8');assert.equal(sha(input),expected[kind]);
    const result=transformAuxMetaLogin(input);assert.equal(result.changes.length,3);
    let replay=input;for(const edit of result.changes){assert.equal(edit.count,1);assert.equal(replay.split(edit.find).length,2);replay=replay.replace(edit.find,()=>edit.replace);}
    assert.equal(replay,result.text);
    const out=path.join(temp,kind+'.mjs');await fs.writeFile(out,result.text);
    const check=spawnSync(process.execPath,['--check',out],{encoding:'utf8'});
    assert.equal(check.status,0,'Syntax-only check failed');
    assert.equal(sha(await fs.readFile(file)),expected[kind]);
    daemonInputs.push({kind,input:file,inputSha256:expected[kind],outputSha256:sha(result.text),changesSha256:sha(JSON.stringify(result.changes))});
  }
} finally {await fs.rm(temp,{recursive:true,force:true});}
// Inert lifetime fixture: no sockets, HTTP, provider, browser or native calls.
const helper=await fs.readFile(path.join(here,'source/meta-login.js'),'utf8');
let unknown=0,closed=0,operations=0,releaseClose,enteredClose;
const closeEntered=new Promise(resolve=>{enteredClose=resolve});
const closeGate=new Promise(resolve=>{releaseClose=resolve});
const scope={requests:1,close:async()=>{closed++;enteredClose();await closeGate;}};
const context=vm.createContext({auxDaemonClosing:false,
  auxBrokerBoundary:()=>({registerProducerStop(){},noteUntracked(){unknown++;},awaited:operation=>operation()}),
  auxStopRefreshProducers(){},require_undici$1:()=>({}),auxCreateRefreshIo:()=>scope,
  fetch(){throw Error('Fixture network forbidden');},auxRefreshDnsLookup(){},
  auxRefreshIoContext:{run:(_scope,operation)=>operation()}});
vm.runInContext(helper+'\nthis.run=auxRunMetaLogin;',context);
const signal=new AbortController().signal;let finished=false;
const pending=context.run(signal,async()=>{operations++;return 'ok';}).then(value=>{finished=true;return value});
await closeEntered;assert.equal(closed,1);assert.equal(finished,false);assert.equal(unknown,1);
releaseClose();assert.equal(await pending,'ok');assert.equal(operations,1);assert.equal(unknown,1);
const abort=new AbortController();abort.abort();await assert.rejects(context.run(abort.signal,async()=>{operations++;}));assert.equal(operations,1);
context.auxDaemonClosing=true;assert.throws(()=>context.run(signal,()=>{}),/SHUTTING_DOWN/);
const sourceFiles=[];for(const name of ['source/transform.mjs','source/anchors.json','source/meta-login.js'])sourceFiles.push({path:name,sha256:sha(await fs.readFile(path.join(here,name)))});
const overlay={version:1,stage:'meta-login',changes:3,sourceFiles,daemonInputs,
  nativeRequirements:['Existing fresh descendant observer and broker retained ownership remain required.'],
  preservedUnknown:['Meta CDP context destruction and intentional socket close have no authentic completion channel; HTTP settlement does not clear whole-login uncertainty.']};
await fs.writeFile(path.join(here,'overlay.json'),JSON.stringify(overlay,null,2)+'\n');
await fs.writeFile(path.join(here,'evidence.json'),JSON.stringify({format:'aux.meta-login.source-evidence.v1',pairedLiteralReplay:true,pairedSyntax:true,editsPerLeaf:3,retainsUntilTransportClose:true,uncertaintyNotCleared:true,abortedAndShutdownAdmissionRefused:true,sourceExecuted:false,providerRequests:0,browserRequests:0,nativeBuild:false,productExecuted:false},null,2)+'\n');
console.log('Paired literal replay/syntax and inert transport-lifetime fixture passed; Meta window uncertainty retained.');
