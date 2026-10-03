import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import vm from 'node:vm';
import ts from 'typescript';
// Actual launcher/brand/Ready lifecycle with controlled effects. No native
// launch, compiler, file publication or timing endpoint is executed.
function fixture() {
 const events=[];let live=true,reads=0,exitOnRead=false,exitOnReady=false,retired=false,resolveClose;
 const digest=b=>createHash('sha256').update(b).digest('hex'),writer='controlled-writer';
 const identity={sourceCommit:'a'.repeat(40)}, launch={record:{kind:'stock',browserPid:20,launcherPid:99}},kernel={record:{browserImageUuid:'b'.repeat(32),browserStartMachTicks:'100'}};
 const child=new EventEmitter();Object.assign(child,{pid:99,stdin:Object.assign(new EventEmitter(),{end(){events.push('stdin');}})});
 const closed=new Promise(resolve=>{resolveClose=resolve;});
 const owner={originalHelperPid:99,launched:Promise.resolve(launch),coldMeasured:Promise.resolve(kernel),closed,get active(){return live;},nativeStderr:Buffer.alloc(0),async stop(primary){live=false;const row={primary,cleanupDebt:false};resolveClose(row);return row;}};
 const artifact={identity:{},validate(){assert.equal(retired,false);events.push('bytes');},release(){retired=true;}};
 const relay={push(){},attach(){},assertLive(){assert.ok(live,'original channel retired');},retire(){live=false;},refuse(){},};
 const mailbox={lastReceipt:null,async invoke(operation){events.push(operation);if(exitOnReady&&operation==='prepareStockWarmWindow')live=false;this.lastReceipt={operation,raw:'controlled',sequence:'1'};}};
 const strict={...assert,deepEqual(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}};
 const deps={'node:assert/strict':strict,'node:child_process':{spawn(){events.push('spawn');return child;},execFileSync(_p,_args,{input}){const build=JSON.parse(input).build;const raw=JSON.stringify(Object.fromEntries(Object.keys(build).sort().map(k=>[k,build[k]])));return JSON.stringify({producer:'aux-startup-build-writer',version:1,sha256:digest(raw),bytes:Buffer.byteLength(raw)});}},'node:crypto':{createHash,randomBytes:n=>Buffer.alloc(n,1)},'node:fs':{readFileSync:()=>writer,realpathSync:p=>p},'node:url':{fileURLToPath:()=>'/controlled/writer'},'node:path':{dirname:p=>p.slice(0,p.lastIndexOf('/')),join:(...p)=>p.join('/')},'../../../scripts/native-slot.mjs':{acquireNativeSlot:async()=>({release(){events.push('slot-release');}})},'./stock-memory-app.mjs':{readStockBuildIdentity:async()=>{reads++;if(exitOnRead)live=false;return {identity,executable:'/controlled/Chromium.app/Contents/MacOS/Chromium'};}},'./startup-helper-artifact.mjs':{retainStartupHelperArtifact:()=>artifact},'./startup-browser-artifact.mjs':{retainStartupBrowserArtifact:()=>({...artifact,release(){}})},'./startup-helper-channel.mjs':{ownStartupHelperChannel:()=>owner},'./startup-stock-native-stream.mjs':{createStockStartupNativeStream:()=>({push(){},refuse(){},finish(){},assertComplete(){},async measured(){return {record:{browserPid:20}};}})},'./performance-mailbox.mjs':{preparePerformanceMailbox(){},createPerformanceMailbox:()=>mailbox},'./startup-warm-stderr.mjs':{createWarmStderrRelay:()=>relay},'./native-stock-warm-protocol.mjs':{decodeStockWarmReady(){events.push('decode-ready');return {};},decodeStockWarmPresentation(){return {};}}};
 const exports={};const source=readFileSync(new URL('./startup-stock-helper-launch.mjs',import.meta.url),'utf8').replace('import.meta.url',JSON.stringify('file:///controlled/startup-stock-helper-launch.mjs'));
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,process:{platform:'darwin'},Buffer,URL,Object,require:n=>{assert.ok(deps[n],n);return deps[n];}});
 return {events,read:exports.readStockStartupOwner,launch:()=>exports.launchStockStartupHelper({manifestPath:'/controlled/manifest',manifestSha256:'d'.repeat(64),fixtureRoot:'/controlled/fixture',trial:'a'.repeat(32),helper:{path:'/controlled/helper',imageUuid:'c'.repeat(32)},compilerAudit:{},browser:{},metadataWriter:{interpreter:'/controlled/python',sourceSha256:digest(writer),interpreterSha256:digest(writer)},signal:new AbortController().signal}),retire(){live=false;},exitDuringRead(){exitOnRead=true;},exitDuringReady(){exitOnReady=true;},get reads(){return reads;}};
}
test('only original branded measured Stock owner exposes immutable read-only identity',async()=>{const f=fixture(),o=await f.launch();assert.throws(()=>f.read(o),/unmeasured/);await o.presentation();const scope=f.read(o);assert.equal(Object.isFrozen(scope),true);assert.equal(scope.browserPid,20);assert.equal((await scope.readIdentity()).sourceCommit,'a'.repeat(40));assert.throws(()=>f.read({...o}),/Foreign/);await o.stop();assert.throws(()=>f.read(o),/Retired/);});
test('original child exit during awaited Stock identity refuses after byte revalidation',async()=>{const f=fixture(),o=await f.launch();await o.presentation();const scope=f.read(o);f.exitDuringRead();await assert.rejects(scope.readIdentity(),/Retired/);await o.stop();});
test('Ready delivered after original channel retirement cannot be accepted',async()=>{const f=fixture(),o=await f.launch();await o.presentation();f.exitDuringReady();await assert.rejects(o.prepareWarmWindow(),/Retired/);assert.ok(!f.events.includes('decode-ready'));await o.stop();});
test('retired original owner refuses before native Prepare',async()=>{const f=fixture(),o=await f.launch();await o.presentation();f.retire();await assert.rejects(o.prepareWarmWindow());assert.ok(!f.events.includes('prepareStockWarmWindow'));await o.stop();});
