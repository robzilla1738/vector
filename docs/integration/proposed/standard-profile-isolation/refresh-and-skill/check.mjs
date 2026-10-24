import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {EventEmitter} from 'node:events';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {transformAuxRefreshAndSkill} from './source/transform.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifest=JSON.parse(await fs.readFile(new URL('./manifest.json',import.meta.url)));
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'aux-refresh-source-'));
try {
 for(const row of manifest.daemonInputs){
  const input=await fs.readFile(row.input,'utf8');assert.equal(sha(input),row.inputSha256);
  const result=transformAuxRefreshAndSkill(input);assert.equal(sha(result.text),row.outputSha256);assert.equal(result.changes.length,15);
  let independent=input;for(const edit of result.changes){assert.equal(independent.split(edit.find).length,2);independent=independent.split(edit.find).join(edit.replace)}assert.equal(independent,result.text);
  const target=path.join(dir,row.kind+'.mjs');await fs.writeFile(target,result.text);
  const check=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});assert.equal(check.status,0,check.stderr?.split('\n').filter(x=>x.length<400).join('\n'));
 }
} finally {await fs.rm(dir,{recursive:true,force:true})}
const helper=await fs.readFile(new URL('./source/refresh-lifetimes.js',import.meta.url),'utf8');
const factoryText=helper.slice(helper.indexOf('function auxCreateRefreshIo('),helper.indexOf('\nfunction auxRefreshFetch('));
const factory=vm.runInNewContext('('+factoryText+')',{AbortSignal,Error,AggregateError,Promise,Map,Set,Uint8Array,Response,Object});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
let dnsCallback,connectCallback,socket,unknown=0,clientDestroyed=0;
class Agent {constructor(options){this.options=options}destroy(){return Promise.resolve()}}
class Client {constructor(origin,options){this.options=options}destroy(){++clientDestroyed;return Promise.resolve()}}
const controller=new AbortController;
const scope=factory({Agent,Client,signal:controller.signal,unknown:()=>++unknown,
 lookup(host,options,callback){dnsCallback=callback},
 buildConnector(options){return (_,callback)=>{connectCallback=callback;socket=new EventEmitter;socket.destroy=()=>{socket.destroyRequested=true};options.lookup('synthetic.invalid',{},()=>{});return socket}},
 async fetch(input,init){const client=init.dispatcher.options.factory('https://synthetic.invalid',{});client.options.connect({},()=>{});return new Response('synthetic')}
});
assert.equal(await (await scope.fetch('fixture')).text(),'synthetic');
let settled=false;const closure=scope.close().then(()=>settled=true);await tick();
assert(clientDestroyed>0&&socket.destroyRequested);assert.equal(settled,false);
connectCallback(null,socket);await tick();assert.equal(settled,false);
socket.emit('close');await tick();assert.equal(settled,false,'DNS callback remains physically pending');
dnsCallback(null,'127.0.0.1',4);await closure;assert.equal(settled,true);assert.equal(unknown,0);
await assert.rejects(scope.fetch('late'));
// An oversized body must physically cancel its reader before scope settlement.
let cancelRelease,cancelled=false;
const body=new ReadableStream({start(c){c.enqueue(new Uint8Array(8*1024*1024+1))},cancel(){cancelled=true;return new Promise(resolve=>cancelRelease=resolve)}});
const oversized=factory({Agent,Client,signal:new AbortController().signal,unknown:()=>++unknown,lookup(){throw Error('unexpected')},buildConnector(){return()=>{throw Error('unexpected')}},fetch:async()=>new Response(body)});
let rejected=false;const result=oversized.fetch('fixture').catch(()=>rejected=true);await tick();assert(cancelled);assert.equal(rejected,false);cancelRelease();await result;assert(rejected);await oversized.close();
// Actual lock helper: callback chaining remains retained through the late FS callback.
const lockText=helper.slice(helper.indexOf('function auxCredentialLockIo('),helper.indexOf('\nasync function auxCredentialStoreTransaction('));
let statCallback,utimesCallback;
const lockFactory=vm.runInNewContext('('+lockText+')',{Object,Set,Promise,require_graceful_fs:()=>({stat(...args){statCallback=args.at(-1)},utimes(...args){utimesCallback=args.at(-1)}})});
const lock=lockFactory();lock.fs.stat('synthetic',()=>lock.fs.utimes('synthetic',0,0,()=>{}));
let drained=false;const drain=lock.drain().then(()=>drained=true);statCallback(null,{});await tick();assert.equal(drained,false);utimesCallback(null);await drain;assert(drained);
const evidence={format:'aux.refresh-skill.focused.v1',pairedExactReplay:true,pairedSyntax:true,editsPerLeaf:15,connectorAndSocketAndDnsPhysicalClosure:true,responseCancellationAwaited:true,lateFsCallbackDrain:true,productExecuted:false,providerRequests:0,nativeBuild:false,nativePairingPending:true};
await fs.writeFile(new URL('./evidence.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
