import assert from 'node:assert/strict';
import vm from 'node:vm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {applyAuxCompletionWrites} from './transform.mjs';
const raw=fs.readFileSync('/private/tmp/aux-completion-writer-input.mjs','utf8'),result=applyAuxCompletionWrites(raw);
assert.equal(result.changes.length,25);
const root=fs.mkdtempSync(path.join(tmpdir(),'aux-completion-writer-fixture-'));
let closed=false,unknown=false;
const boundary={assertOwner(){if(closed)throw Error('CLOSED')},noteUntracked(){unknown=true},sync(fn){this.assertOwner();return fn()},awaited(fn){this.assertOwner();return fn()}};
const context=vm.createContext({...fs,path,process,Promise,AggregateError,auxBrokerBoundary:()=>boundary,LEGACY_CONTAINER_METADATA:'.legacy',logger:{warn(){},error(){}}});
function extract(first,last){const start=result.source.indexOf(first),end=result.source.indexOf(last,start);assert(start>=0&&end>start);return result.source.slice(start,end)}
try{
 vm.runInContext(extract('function mergeMigrationEntry(', 'function findCanonicalSessionDir('),context);
 const original=path.join(root,'original'),destination=path.join(root,'destination');fs.mkdirSync(original);fs.mkdirSync(destination);fs.writeFileSync(path.join(original,'move.txt'),'move');fs.writeFileSync(path.join(original,'conflict.txt'),'old');fs.writeFileSync(path.join(destination,'conflict.txt'),'new');
 context.mergeMigrationEntry(original,destination);assert.equal(fs.readFileSync(path.join(destination,'move.txt'),'utf8'),'move');assert.equal(fs.readFileSync(path.join(destination,'conflict.txt'),'utf8'),'new');assert.equal(unknown,true);
 closed=true;assert.throws(()=>context.mergeMigrationEntry(original,destination),/CLOSED/);closed=false;
 Object.assign(context,{WRITABLE_DIRECTORIES:['data'],stat$1:fs.promises.stat,rm:fs.promises.rm,cp:fs.promises.cp,lstat:fs.promises.lstat});
 vm.runInContext(extract('async function preserveWritableDirectories(', 'async function replaceRuntime('),context);
 const old=path.join(root,'old'),next=path.join(root,'next');fs.mkdirSync(path.join(old,'data'),{recursive:true});fs.mkdirSync(next);fs.writeFileSync(path.join(old,'data','keep'),'content');await context.preserveWritableDirectories(old,next);assert.equal(fs.readFileSync(path.join(next,'data','keep'),'utf8'),'content');
 // Exact queue: close while queued -> callback must not start, preserving queue errors.
 let release;const runtime={generation:7,queue:new Promise(resolve=>release=resolve)};Object.assign(context,{runtimes:new Map([[1,runtime]])});vm.runInContext(extract('function enqueue(Cn,ei)', 'async function syncAccount('),context);
 let ran=false;const queued=context.enqueue(1,()=>{ran=true;return Promise.resolve()});closed=true;release();await assert.rejects(queued,/CLOSED/);assert.equal(ran,false);closed=false;
 const target=path.join(root,'index.mjs');fs.writeFileSync(target,result.source);const syntax=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);assert.throws(()=>applyAuxCompletionWrites(raw+' '),/Unreviewed/);
 fs.writeFileSync(new URL('./evidence/source.json',import.meta.url),JSON.stringify({format:'aux.completion-writers.source.v1',passed:true,inputSha256:result.inputSha256,outputSha256:result.outputSha256,changes:result.changes,checks:['actual recursive migration preserves destination conflicts and guarded refusal','actual runtime writable directory preservation','actual queued producer rechecks admission at dispatch','whole source syntax','changed input refusal'],filesystem:'disposable fixture only',nativeBinding:'synthetic only',allWritersClosed:false,uiChanged:false,newNativeAbi:false},null,2)+'\n');console.log('PASS focused migration/runtime/queue source checks');
}finally{fs.rmSync(root,{recursive:true,force:true})}
