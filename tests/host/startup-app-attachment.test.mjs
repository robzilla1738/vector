import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const source = new URL('./lib/app.mjs', import.meta.url);
// Actual App adapter executed against controlled filesystem/peer/owner fixtures.
// No native launch, helper, real descriptor/token or measurement is accessed.
function fixture() {
 const root='/private/tmp/aux-native-journey-Controlled',bundle='/controlled/Aux.app',owners=new WeakMap();
 const state={active:true,rootInode:1,stops:0,peerHook:async()=>{}};
 let resolveClose;
 const closed=new Promise(resolve=>{resolveClose=resolve;}),owner={};
 const observation=Object.freeze({bundle,fixtureRoot:root,userDataDir:root+'/profile',generation:7,browserPid:777,closed,
  assertLive(){assert.equal(state.active,true,'Retired actual source fixture owner');},async stop(){state.stops++;return {cleanupDebt:false};}});
 owners.set(owner,observation);
 const descriptor={port:1234,token:'controlled-fixture-only',pid:555,instanceId:'controlled-instance',startedAt:1,version:{schema:2}};
 const dir=filename=>({dev:1,ino:filename===root?state.rootInode:2,uid:100,mode:0o40700,isSymbolicLink:()=>false,isDirectory:()=>true,isFile:()=>false});
 const imports={
  'node:os':{homedir:()=>'/controlled'},'node:path':path,'node:crypto':crypto,
  'node:child_process':{execFileSync(command){assert.equal(command,'/usr/libexec/PlistBuddy');return 'dev.aux.browser\n';},spawn(){throw new Error('Native spawn forbidden');}},
  'node:fs':{existsSync:filename=>!filename.endsWith('_CodeSignature'),realpathSync:filename=>filename==='/tmp'?'/private/tmp':filename,
   lstatSync:filename=>filename.endsWith('runtime.json')?{uid:100,mode:0o100600,isFile:()=>true,isSymbolicLink:()=>false}:dir(filename),
   mkdirSync(){},readFileSync:filename=>filename.endsWith('runtime.json')?JSON.stringify(descriptor):Buffer.from('controlled source'),
   mkdtempSync(){throw new Error('Unowned fixture forbidden');}},
  'node:timers/promises':{setTimeout:async()=>{}},
  '../../../scripts/native-slot.mjs':{acquireNativeSlot(){throw new Error('Native slot forbidden');}},
  './dev-acceptance.mjs':{nativeProfileName:name=>assert.equal(name,'Default'),validateDisposableProfile:filename=>assert.equal(filename,root+'/profile')},
  './rpc.mjs':{validateDescriptor:v=>v,createRpc:get=>async method=>{assert.equal(method,'runtime.describe');await get();return {nativeIdentity:{buildId:'controlled+'+'a'.repeat(64)},runtimeIdentity:{commit:'b'.repeat(40)}};}},
  './packaged-runtime-pair-artifact.mjs':{},'./private-window-stream.mjs':{},'./private-observation-owner.mjs':{},'./appearance-stream.mjs':{},'./performance-mailbox.mjs':{},'./startup-evidence.mjs':{},
  './startup-helper-launch.mjs':{readAuxStartupAttachment:actual=>{assert.ok(owners.has(actual),'Foreign owner');const v=owners.get(actual);v.assertLive();return v;}},
 };
 const exports={},script=ts.transpileModule(readFileSync(source,'utf8').replaceAll('import.meta.dirname',"'/controlled'"),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(script,{exports,Buffer,URL,AbortSignal,process:{platform:'darwin',getuid:()=>100,env:{}},
  require(name){assert.ok(imports[name],`Unexpected dependency ${name}`);return imports[name];},
  async fetch(url){await state.peerHook();return {ok:true,status:200,json:async()=>({service:'aux-runtime',ready:true,
   nonce:new URL(url).searchParams.get('nonce'),pid:descriptor.pid,instanceId:descriptor.instanceId,startedAt:descriptor.startedAt,schema:2})};}});
 const app=exports.createJourneyApp({appPath:bundle,profileRoot:root});
 return {app,owner,state,close(){state.active=false;resolveClose({code:0});}};
}
test('exact original owner attaches through the existing peer/identity route; quit delegates only owner',async()=>{
 const f=fixture();await f.app.attachStartup(f.owner);assert.equal(f.app.pid,777);
 const identity=await f.app.identity();assert.equal(identity.native.manifestHash,'a'.repeat(64));
 assert.deepEqual(await f.app.quit(),{cleanupDebt:false});assert.equal(f.state.stops,1);
 assert.throws(()=>f.app.pid,/No live/);
});
test('foreign clone, unknown owner and replacement cannot attach',async()=>{
 const f=fixture();await assert.rejects(f.app.attachStartup({...f.owner}),/Foreign/);
 await f.app.attachStartup(f.owner);await assert.rejects(f.app.attachStartup(f.owner),/already/);
});
test('retired owner refuses attachment before peer or identity',async()=>{
 const f=fixture();f.close();await assert.rejects(f.app.attachStartup(f.owner),/Retired/);
});
test('owner closes during awaited peer validation; identity cannot escape as valid',async()=>{
 const f=fixture();await f.app.attachStartup(f.owner);f.state.peerHook=async()=>f.close();
 await assert.rejects(f.app.identity(),/No live|Retired/);
});
test('fixture inode replacement during awaited peer validation refuses',async()=>{
 const f=fixture();await f.app.attachStartup(f.owner);f.state.peerHook=async()=>{f.state.rootInode=9;};
 await assert.rejects(f.app.identity(),/fixture replaced/);
});
test('attached owner cannot use ordinary launcher/restart/effect paths',async()=>{
 const f=fixture();await f.app.attachStartup(f.owner);
 await assert.rejects(f.app.start(),/another launcher/);
 await assert.rejects(f.app.restart(),/another launcher/); assert.equal(f.state.stops,0);
 await assert.rejects(f.app.openExternal('http://127.0.0.1/'),/observation-only/);
 await assert.rejects(f.app.openAux('aux://open'),/observation-only/);
 await assert.rejects(f.app.appleScript('controlled'),/observation-only/);
});
