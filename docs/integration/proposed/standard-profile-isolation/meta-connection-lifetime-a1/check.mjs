import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxMetaConnectionLifetime} from './source/transform.mjs';
const here=path.dirname(new URL(import.meta.url).pathname);
const sha=v=>createHash('sha256').update(v).digest('hex');
const root='/private/tmp/aux-standard-daemon-projection-20261024-a4';
const expected={source:'a37b3d7eb72707ca00729e39eae4aa90f3968ca7dfa5379f823ac1007f3157c4',entry:'edc8a98ed1bad63432c6ebf1e3244a27f690256f597933eb53054b4136dc9812'};
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'aux-meta-owned-source-'));
const daemonInputs=[];
try {
  for(const kind of ['source','entry']) {
    const file=path.join(root,kind==='source'?'index.mjs':'projected-entry/aux-native-entry.mjs');
    const input=await fs.readFile(file,'utf8');assert.equal(sha(input),expected[kind]);
    const result=transformAuxMetaConnectionLifetime(input);assert.equal(result.changes.length,14);
    let replay=input;
    for(const edit of result.changes){assert.equal(edit.count,1);assert.equal(replay.split(edit.find).length,2);replay=replay.replace(edit.find,()=>edit.replace);}
    assert.equal(result.text,replay);
    const out=path.join(temp,kind+'.mjs');await fs.writeFile(out,result.text);
    const check=spawnSync(process.execPath,['--check',out],{encoding:'utf8'});
    assert.equal(check.status,0,check.stderr);
    daemonInputs.push({kind,input:file,inputSha256:expected[kind],outputSha256:sha(result.text),changesSha256:sha(JSON.stringify(result.changes))});
  }
} finally {await fs.rm(temp,{recursive:true,force:true});}
const native=JSON.parse(await fs.readFile(path.join(here,'native-replacements.json'),'utf8'));
let nativeEdits=0;
for(const row of native.files){
  let text=await fs.readFile(path.join(here,'baseline',row.path),'utf8');assert.equal(sha(text),row.beforeSha256);
  assert.equal(sha(await fs.readFile(path.join('/private/tmp/aux-chromium-recovery-snapshot-20261023/src',row.path))),row.beforeSha256);
  for(const edit of row.changes){assert.equal(edit.count,1);assert.equal(text.split(edit.find).length,2);text=text.replace(edit.find,()=>edit.replace);nativeEdits++;}
  assert.equal(sha(text),row.afterSha256);assert.equal(text,await fs.readFile(path.join(here,'native-source',row.path),'utf8'));
}
assert.equal(native.files.length,13);assert.equal(nativeEdits,18);
// Inert event fixtures: these objects cannot create a real socket or process.
const helper=await fs.readFile(path.join(here,'source/owned-cdp-lifetime.js'),'utf8');
const ctx=vm.createContext({});vm.runInContext(helper+'\nthis.make=auxCreateOwnedCdpLifetime;',ctx);
class Socket extends EventTarget {readyState=0;closeRequests=0;close(){this.closeRequests++;}physicallyClose(){this.readyState=3;this.dispatchEvent(new Event('close'));}}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};};
let unknown=0;const owned=ctx.make(()=>unknown++), socket=new Socket();owned.trackSocket(socket);
let settled=false;const closed=owned.waitClosed().then(()=>settled=true);
await tick();assert.equal(settled,false);socket.dispatchEvent(new Event('error'));await tick();assert.equal(settled,false);assert.equal(unknown,1);
socket.physicallyClose();await closed;assert.equal(settled,true);
// An authorization attempt admitted before close may still create a socket.
const late=ctx.make(()=>unknown++), admission=deferred(), lateSocket=new Socket();
const attempt=late.trackAttempt(async()=>{await admission.promise;late.trackSocket(lateSocket);});
let lateDone=false;const lateClose=late.waitClosed().then(()=>lateDone=true);admission.resolve();await attempt;await tick();
assert.ok(lateSocket.closeRequests>0);assert.equal(lateDone,false);lateSocket.physicallyClose();await lateClose;
// Losing the owned native session cannot reconnect and claim another session.
const lost=ctx.make(()=>unknown++), first=new Socket();lost.trackSocket(first);first.physicallyClose();assert.equal(lost.unavailable,true);assert.throws(()=>lost.assertOpen());
const second=new Socket();assert.throws(()=>lost.trackSocket(second));assert.ok(second.closeRequests>0);second.physicallyClose();await lost.waitClosed();
// The window owner waits through the native object observation and physical
// socket close independently. The stub never represents service completion.
const observation=deferred(), transport=deferred();let retained, calls=[], windowUnknown=0, qualification=true;
class Client {
 enableOwnedLifetime(){} async send(method,_params,_session,options){options?.beforeSend?.();calls.push(method);if(method==='Target.createBrowserContext')return {browserContextId:'exact-context'};if(method==='Target.createTarget')return {targetId:'exact-target'};if(method==='Target.disposeAuxBrowserContextAndObserve'){assert.equal(options.timeoutMs,0);return {...await observation.promise,storagePartitionsMemoryOnly:qualification};}return {};}
 async closeOwnedAndWait(){calls.push('physical-close');await transport.promise;}
}
const win=vm.createContext({auxBrokerBoundary:()=>({registerProducerStop(){},noteUntracked(){windowUnknown++;},awaited:fn=>(retained=fn())}),auxStopRefreshProducers(){},init_client$7(){},client_exports:{CdpClient:Client},withoutReplContext:fn=>fn()});
vm.runInContext(await fs.readFile(path.join(here,'source/oauth-window.js'),'utf8')+'\nthis.open=openOAuthWindow;',win);
const abort=new AbortController();await win.open('https://example.invalid',abort.signal);let windowDone=false;retained.then(()=>windowDone=true);abort.abort();await tick();assert.equal(windowDone,false);assert.equal(calls.includes('physical-close'),false);
observation.resolve({profileObjectDestroyed:true,storagePartitionsMemoryOnly:true,serviceCleanupState:'unknown'});await tick();assert.equal(calls.includes('physical-close'),true);assert.equal(windowDone,false);transport.resolve();await retained;assert.equal(windowDone,true);assert.equal(windowUnknown,0);
qualification=false;const unqualified=new AbortController();await win.open('https://example.invalid',unqualified.signal);unqualified.abort();await retained;assert.equal(windowUnknown,1);
const sourceFiles=[];for(const file of ['source/transform.mjs','source/anchors.json','source/owned-cdp-lifetime.js','source/oauth-window.js','native-replacements.json','native.patch'])sourceFiles.push({path:file,sha256:sha(await fs.readFile(path.join(here,file)))});
const browserComposition='/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/standard-profile-isolation/integration/browser-composition-a4.json';
await fs.writeFile(path.join(here,'overlay.json'),JSON.stringify({version:1,stage:'meta-connection-lifetime',changes:14,sourceFiles,daemonInputs,browserComposition:{path:browserComposition,sha256:sha(await fs.readFile(browserComposition))},nativeFiles:13,nativeEdits:18,nativeRequirements:['Generate Target protocol bindings from the exact PDL overlay.','Original authenticated CDP endpoint, fresh daemon observer and broker requirements remain unchanged.'],preservedUnknown:['Memory-only qualification is not service-drain proof; browser-global work retains independent native browser ownership.','Missing socket close or context destruction remains pending; unexpected connection loss stays unknown.'],integrated:false},null,2)+'\n');
await fs.writeFile(path.join(here,'evidence.json'),JSON.stringify({format:'aux.meta-owned-connection.source-evidence.v1',pairedLiteralReplay:true,pairedSyntax:true,nativeLiteralReplay:true,nativeSnapshotInputsUnchanged:true,daemonAnchorsPerLeaf:14,nativeFiles:13,nativeAnchors:18,inertFixtures:['error is not socket close','late admitted authorization/socket remains retained','owned session loss forbids reconnect','native object observation precedes separate physical close','qualified local completion does not clear global browser ownership'],nativeCompiled:false,providerRequests:0,browserRequests:0,productExecuted:false},null,2)+'\n');
console.log('14 paired source anchors and 18 native anchors replayed; syntax and inert lifetime checks passed. No native/runtime acceptance claimed.');
