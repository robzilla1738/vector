import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {EventEmitter} from 'node:events';
import {transformAuxBackgroundWriters} from './source/aux-background-writers.mjs';
const manifest=JSON.parse(readFileSync(new URL('./manifest.json',import.meta.url),'utf8'));
const changes=JSON.parse(readFileSync(new URL('./source/changes.json',import.meta.url),'utf8'));
const helper=readFileSync(new URL('./source/background-writer-lifetimes.js',import.meta.url),'utf8');
const temp=mkdtempSync(path.join(tmpdir(),'aux-background-writer-check-'));
try {
  for(const input of manifest.daemonInputs){
    const result=transformAuxBackgroundWriters(readFileSync(input.path,'utf8'));
    const file=path.join(temp,input.kind+'.mjs');writeFileSync(file,result.text);
    const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    assert.equal(check.status,0,check.stderr);
  }
  // Exercise the actual inserted finite-lifetime helper, not a copied model.
  let nativePending=0, unknown=0, aborted=0, stopped=0;
  const boundary={assertOwner(){},noteUntracked(){unknown++},awaited(callback){nativePending++;return Promise.resolve().then(callback).finally(()=>nativePending--)}};
  const api=runInNewContext(helper+';({auxCreateBackgroundWriterLifetimes,auxRunSkillArchiveTool})',{Promise,Set,Error,AggregateError,Object,AbortController});
  const tracker=api.auxCreateBackgroundWriterLifetimes(boundary,()=>{stopped++},()=>({async auxCloseAdmissionAndDrain(){stopped++}}));
  let finishPhysical;const physical=new Promise(resolve=>finishPhysical=resolve);
  const release=tracker.agent({abort(){aborted++}});
  const work=tracker.run(async()=>{await physical;await tracker.cleanup(async()=>{});release()});
  let settled=false;const shutdown=tracker.stop().then(()=>settled=true);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(aborted,1);assert.equal(stopped,2);assert.equal(settled,false);assert.equal(nativePending,1);
  await assert.rejects(tracker.run(()=>{}),/ADMISSION_CLOSED/);
  finishPhysical();await work;await shutdown;assert.equal(nativePending,0);assert.equal(unknown,0);
  // An abort/error callback is not the physical child/stdio close boundary.
  let callback;const child=new EventEmitter();
  const tool=runInNewContext(helper+';auxRunSkillArchiveTool',{Promise,Set,Error,AggregateError,Object,AbortController,child_process:{execFile(command,args,options,done){callback=done;return child}}});
  let toolSettled=false;const result=tool('fixture',[],new AbortController().signal).catch(()=>{toolSettled=true});
  callback(Error('synthetic abort'), '');await Promise.resolve();assert.equal(toolSettled,false);
  child.emit('close');await result;assert.equal(toolSettled,true);
  // Execute only the changed archive function against disposable in-memory
  // I/O substitutes: a failed download must still attempt all three cleanups.
  const extraction=changes.find(value=>value.reason.startsWith('Await pipeline close')).replace;
  let pipelineCalls=0;const removed=[];const releases=[];
  const extract=runInNewContext(extraction+';extractSkillArchive',{
    auxBackgroundWriters:()=>({run:cb=>Promise.resolve().then(cb),aborter:()=>()=>releases.push(true)}),
    auxBrokerBoundary:()=>({noteUntracked(){},outputStream:cb=>cb()}),
    AbortController,AnthropicError:Error,Error,AggregateError,Promise,path$13:path,process:{pid:17},Date,
    stream$6:{Readable:{fromWeb:()=>({})},promises:{async pipeline(){pipelineCalls++;throw Error('synthetic download failure')}}},
    fs$12:{createWriteStream:()=>({})},fs$10:{async rm(name){removed.push(name);if(name.includes('skill-exclude'))throw Error('synthetic cleanup failure')}}
  });
  await assert.rejects(extract({body:{}},'/fixture/skills'),/cleanup failed/);
  assert.equal(pipelineCalls,1);assert.equal(removed.length,3);assert.equal(releases.length,1);
  console.log(JSON.stringify({exactInputReplay:true,ordinaryAndDormantSyntax:true,changeCount:changes.length,physicalLifetimeFixture:true,childCloseFixture:true,archiveFailureCleanupFixture:true,productExecuted:false,nativeBuilt:false}));
} finally {rmSync(temp,{recursive:true,force:true})}
