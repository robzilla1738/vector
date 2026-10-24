// Only the new consumer functions run against synthetic native callbacks.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),sha=v=>createHash('sha256').update(v).digest('hex');
const [evidencePath,projectionPath]=process.argv.slice(2);if(!evidencePath||!path.isAbsolute(evidencePath)||!evidencePath.startsWith('/private/tmp/')||!projectionPath||!path.isAbsolute(projectionPath))throw Error('Fresh absolute evidence and exact projection paths required');
const helper=await fs.readFile(path.join(here,'source/cli-boundary.js'),'utf8'),loader=await fs.readFile(path.join(here,'source/aux-owned-cli.cjs'),'utf8');
function fixture({env={},mutate}={}){
 let roots=Object.freeze({format:'aux.native.storage-roots.v1',layoutVersion:1,ownerGeneration:'7',transportGeneration:'11',controlHome:'/synthetic/control',taskHome:'/synthetic/tasks'}),calls=[];
 const native={};for(const [name,value] of Object.entries({captureStorageRoots:()=>roots,assertBrokerOwner:()=>calls.push('assert'),withBrokerSync:fn=>{calls.push('sync');return fn()},withBrokerAwaited:async fn=>{calls.push('begin');try{return await fn()}finally{calls.push('complete')}}}))Object.defineProperty(native,name,{value});
 mutate?.(native);
 const context={native,env,path};runInNewContext(helper+'\nglobalThis.boundary=auxCreateCliBoundary(native,env,path);',context,{timeout:1000});
 return{boundary:context.boundary,calls,change(){roots=Object.freeze({...roots,ownerGeneration:'8'})}};
}
const good=fixture();assert.equal(good.boundary.data,'/synthetic/control/cli');assert.equal(good.boundary.auth,'/synthetic/control/cli/auth.json');assert.equal(good.boundary.sync(()=>42),42);
assert.throws(()=>fixture({env:{AUX_CLI_AUTH_PATH:'/synthetic/tasks/auth.json'}}),/ROOT_OVERRIDE_REFUSED/);
assert.throws(()=>fixture({env:{AUX_CLI_INSTALL_DIR:'relative'}}),/ROOT_OVERRIDE_REFUSED/);
let release;const waiting=fixture();let done=false;const pending=waiting.boundary.awaited(()=>new Promise(resolve=>{release=resolve})).then(value=>{done=true;return value});await Promise.resolve();assert.equal(done,false);assert(!waiting.calls.includes('complete'));release('completed');assert.equal(await pending,'completed');assert(waiting.calls.includes('complete'));
const changed=fixture();let finish;const result=changed.boundary.awaited(()=>new Promise(resolve=>{finish=resolve}));changed.change();finish('old-result');await assert.rejects(result,/OWNER_CHANGED/);
const blocked=fixture();blocked.change();let called=false;assert.throws(()=>blocked.boundary.sync(()=>{called=true}),/OWNER_CHANGED/);assert.equal(called,false);
const projection=JSON.parse(await fs.readFile(path.join(projectionPath,'source-plan.json'))),projectedSource=await fs.readFile(projection.entry.path,'utf8');
assert.equal(sha(projectedSource),projection.entry.sha256);
const actualFunction=name=>{const start=projectedSource.indexOf('async function '+name+'('),end=projectedSource.indexOf('\n}\n',start);assert(start>=0&&end>=0);return projectedSource.slice(start,end+2)};
// Run the actual transformed writer. Revocation during its original mkdir
// await must prevent the later synchronous credential write, even though its
// whole operation stays retained through the real callback's settlement.
const writer=fixture();let mkdirDone,writes=0;
const writerContext={__auxCliBoundary:writer.boundary,path,CLI_AUTH_PATH:'/synthetic/control/cli/auth.json',fsp:{mkdir:()=>new Promise(resolve=>{mkdirDone=resolve}),chmod:async()=>{}},writeFileSync:()=>{writes++}};
runInNewContext(actualFunction('writeCliAuth')+';globalThis.write=writeCliAuth;',writerContext,{timeout:1000});
const writing=writerContext.write({synthetic:true});writer.change();mkdirDone();await assert.rejects(writing,/OWNER_CHANGED/);assert.equal(writes,0);assert(writer.calls.includes('complete'));
const reader=fixture();reader.change();let reads=0;
const readContext={__auxCliBoundary:reader.boundary,CLI_AUTH_PATH:'/synthetic/control/cli/auth.json',fsp:{readFile:async()=>{reads++;return '{}'}},cliAuthSchema:{safeParse:()=>({success:false})}};
runInNewContext(actualFunction('readCliAuth')+';globalThis.read=readCliAuth;',readContext,{timeout:1000});assert.equal(await readContext.read(),undefined);assert.equal(reads,0);
let nativeCalls=[],pdfLoads=0,active=true;
const methods=['extractText','fillFormFields','getFormFields','merge','renderPages','rotate','split'];
const native={run:(command,input)=>{nativeCalls.push([command,input]);return '{"ok":true}'},assertBrokerOwner:()=>{if(!active)throw Error('retired')},withBrokerSync:fn=>fn()};
const actual=Object.fromEntries(methods.map(name=>[name,(...args)=>({name,args})]));
const context={process:{_linkedBinding:name=>{assert.equal(name,'aux_owned_native');return native}},__dirname:'/synthetic/aux/apps/cli/Aux CLI.app/Contents/Resources/native',module:{exports:{}},require:specifier=>{if(specifier==='node:path')return path;assert.equal(specifier,'/synthetic/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-pdf.cjs');pdfLoads++;return actual}};
runInNewContext(loader,context,{timeout:1000});const facade=context.module.exports;assert(Object.isFrozen(facade));assert.equal(facade.run('cdp-sign','{"challenge":"synthetic"}'),'{"ok":true}');assert.deepEqual(nativeCalls,[['cdp-sign','{"challenge":"synthetic"}']]);assert.equal(pdfLoads,0);for(const name of methods){const reply=facade.pdf[name]({synthetic:true});assert.equal(reply.name,name)}assert.equal(pdfLoads,1);active=false;assert.throws(()=>facade.run('secure-read','{}'),/retired/);assert.throws(()=>facade.pdf.extractText({}),/retired/);
const evidence={format:'aux.cli-native-owner.consumer-check.actual.v1',passed:true,helperSha256:sha(helper),loaderSha256:sha(loader),projectedEntrySha256:projection.entry.sha256,cases:9,nativeRootBinding:true,foreignOverridesRefused:true,actualAwaitedCompletionRetained:true,ownerDriftRefused:true,actualWriterRechecksAfterAwait:true,privateReadAfterRetirementRefused:true,jsonStringAbiPreserved:true,lazyFixedPdfRoute:true,retiredOwnerRefused:true,
 syntheticCallbacksOnly:true,wholeCliExecuted:false,realWorkersRun:false,nativeCommandsRun:false,pdfModuleLoaded:false,providerRequests:0,ownerStateAccessed:false,runtimeAcceptance:false};
await fs.writeFile(evidencePath,JSON.stringify(evidence,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(evidence));
