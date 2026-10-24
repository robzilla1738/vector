import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {EventEmitter} from 'node:events';
import {transformAuxBackgroundWriters} from '../background-writers/source/aux-background-writers.mjs';
import {transformAuxDaemonShutdown} from './source/aux-daemon-shutdown.mjs';
const manifest=JSON.parse(readFileSync(new URL('./manifest.json',import.meta.url),'utf8'));
const helper=readFileSync(new URL('./source/shutdown-lifetimes.js',import.meta.url),'utf8');
const temp=mkdtempSync(path.join(tmpdir(),'aux-shutdown-check-'));
let source;
try {
 for(const input of manifest.daemonInputs){const result=transformAuxDaemonShutdown(transformAuxBackgroundWriters(readFileSync(input.originalPath,'utf8')).text);source??=result.text;const file=path.join(temp,input.kind+'.mjs');writeFileSync(file,result.text);const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(check.status,0,check.stderr.split('\n').filter(line=>line.length<500).join('\n'))}
 const make=runInNewContext(helper+';auxCreateDaemonShutdown',{Promise,Set,Error,AggregateError,Object,AbortController,AbortSignal,Request,Response,URL});
 const deferred=()=>Promise.withResolvers();
 const physical=deferred();const client=new EventEmitter();client.readyState=1;client.terminate=()=>{};
 let httpClosed,wsClosed,exits=0,broker=0,holds=0,unknown=0;
 const noop=()=>{};
 const shutdown=make({fetch:async()=>new Response('accepted'),closeReadiness:noop,clearBootstrapTimer:noop,hold:()=>++holds,releaseHold:()=>holds--,
  http:()=>({close(cb){httpClosed=cb},closeIdleConnections:noop}),websockets:()=>({clients:new Set([client]),close(cb){wsClosed=cb}}),
  stopIntervals:noop,stopRefresh:noop,stopProductivity:noop,stopOutbox:noop,stopChannels:noop,stopBackground:()=>physical.promise,stopComputerUse:noop,stopCoder:noop,terminateExec:noop,killCommands:noop,bootstrap:noop,stopTelemetry:noop,closeBroker:()=>broker++,exit:()=>exits++,unknown:()=>unknown++});
 const accepted=await shutdown.fetch(new Request('http://fixture/shutdown'));assert.equal(await accepted.text(),'accepted');
 const pending=shutdown.start();await new Promise(resolve=>setImmediate(resolve));assert.equal(holds,1);assert.equal(broker,0);assert.equal(exits,0);
 assert.equal((await shutdown.fetch(new Request('http://fixture/trpc/write'))).status,503);
 physical.resolve();await new Promise(resolve=>setImmediate(resolve));assert.equal(broker,0);assert.equal(exits,0);
 client.emit('close');wsClosed();httpClosed();await pending;assert.equal(broker,1);assert.equal(exits,1);assert.equal(holds,0);assert.equal(unknown,0);
 // Exercise the actual adapted ChannelManager against a late-created handle.
 const begin=source.indexOf('ChannelManager=class{');const end=source.indexOf(',globalChannelManager=new ChannelManager',begin);
 const creation=deferred(),closed=deferred();let closeCalls=0;
 const Channel=runInNewContext(source.slice(begin,end)+';ChannelManager',{
  Map,Set,Promise,AbortController,Error,AggregateError,Math,
  hasChannelsAccess:()=>true,updateConnection:noop,unregisterChannelRuntime:noop,
  createChannelRuntime:()=>creation.promise,clearTimeout:noop
 });
 const channels=new Channel();const starting=channels.startConnection('fixture',{id:'test'});starting.catch(()=>{});
 await new Promise(resolve=>setImmediate(resolve));const draining=channels.shutdownAll();draining.catch(()=>{});
 let drainSettled=false;draining.then(()=>drainSettled=true,()=>drainSettled=true);
 creation.resolve({async forceShutdown(){closeCalls++;await closed.promise}});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(closeCalls,1);assert.equal(drainSettled,false);
 closed.resolve();await Promise.allSettled([starting,draining]);assert.equal(drainSettled,true);assert.equal(closeCalls,1);
 console.log(JSON.stringify({exactPairedReplay:true,ordinaryAndDormantSyntax:true,changeCount:manifest.changeCount,transportAndProducerOrderFixture:true,lateChannelHandleClosureFixture:true,productExecuted:false,nativeBuilt:false}));
} finally {rmSync(temp,{recursive:true,force:true})}
