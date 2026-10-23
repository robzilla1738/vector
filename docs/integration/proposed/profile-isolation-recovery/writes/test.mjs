import assert from 'node:assert/strict';
import vm from 'node:vm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {applyAuxRecoveryWrites,recoveryWritesPrelude} from './transform.mjs';
import {EventEmitter} from 'node:events';
const input='/private/tmp/aux-profile-final-source-20261023/index.mjs';
const raw=fs.readFileSync(input,'utf8'),result=applyAuxRecoveryWrites(raw);
assert.equal(result.changes.length,23);
const temporary=fs.mkdtempSync(path.join(tmpdir(),'aux-session-writer-fixture-'));
let closed=false,admissions=0;
const boundary={sync(fn){if(closed)throw Error('CLOSED');admissions++;return fn()},awaited(fn){if(closed)throw Error('CLOSED');admissions++;return fn()}};
const context=vm.createContext({...fs,path,Buffer,Buffer$1:Buffer,fs$1:fs.promises,constants:fs.constants,auxBrokerBoundary:()=>boundary,resolveSessionMessageDir:()=>temporary,sessionMessagesJsonlPath:dir=>path.join(dir,'messages.jsonl'),Map});
const sourceBetween=(first,last)=>{const start=result.source.indexOf(first),end=result.source.indexOf(last,start);assert(start>=0&&end>start);return result.source.slice(start,end)};
try{
 // Actual original/patched JSONL bodies against disposable real filesystem.
 vm.runInContext(sourceBetween('function appendSessionMessageJsonlRow(', 'var SESSION_MESSAGES_JSONL_FILE,'),context);
 const first={text:'héllo'},second={text:'second'};
 assert.equal(context.appendSessionMessageJsonlRow(1,{},first),'0');
 assert.equal(context.appendSessionMessageJsonlRow(1,{},second),String(Buffer.byteLength(JSON.stringify(first)+'\n')));
 const mapping=context.rewriteSessionMessageJsonlRows(1,{},[{id:'b',msg:second},{id:'a',msg:first}]);
 assert.equal(mapping.get('a'),String(Buffer.byteLength(JSON.stringify(second)+'\n')));
 assert.equal(fs.readFileSync(path.join(temporary,'messages.jsonl'),'utf8'),JSON.stringify(second)+'\n'+JSON.stringify(first)+'\n');
 closed=true;assert.throws(()=>context.appendSessionMessageJsonlRow(1,{},first),/CLOSED/);closed=false;
 Object.assign(context,{SESSION_ATTACHMENTS_DIR:'attachments',isStoredAttachmentPath:value=>value.startsWith('./attachments/'),resolveSessionPath:(root,value)=>path.resolve(root,value),attachmentFilename:name=>name});
 vm.runInContext(sourceBetween('async function prepareFileAttachment(', 'function normalizeToolResultContent('),context);
 const attachment={id:'id',name:'hello.txt',mimeType:'text/plain',data:Buffer.from('hello').toString('base64')};
 const a=await context.prepareFileAttachment(temporary,attachment),b=await context.prepareFileAttachment(temporary,attachment);
 assert.equal(a.path,'./attachments/hello.txt');assert.equal(b.path,'./attachments/hello-id.txt');assert.equal(b.data,undefined);
 assert.equal(fs.readFileSync(path.resolve(temporary,b.path),'utf8'),'hello');
 const external=path.join(temporary,'source.txt');fs.writeFileSync(external,'copy');
 const copied=await context.prepareFileAttachment(temporary,{id:'copy',name:'copy.txt',mimeType:'text/plain',path:external});assert.equal(fs.readFileSync(path.resolve(temporary,copied.path),'utf8'),'copy');
 closed=true;await assert.rejects(context.prepareFileAttachment(temporary,attachment),/CLOSED/);closed=false;
 // Actual REPL closure preserves hook/path approval, and refuses a write when
 // the owner closes while that approval is pending. No hook lifetime claim.
 let approve;let hookStarted;
 Object.assign(context,{SESSION_OWNED_DIRS:new Set(['artifacts','attachments','tmp']),getCurrentReplToolCallId:()=> 'test'});
 vm.runInContext(sourceBetween('function createReplFs(', 'function createReplPath('),context);
 const hooks={trigger(){hookStarted=true;return new Promise(resolve=>approve=resolve)}};
 const repl=context.createReplFs({cwd:temporary,sessionStorageDir:temporary,accountRoot:temporary,browser:{isReadableDownloadPath:()=>false},hooks});
 const pending=repl.writeFile('late.txt','not written');assert.equal(hookStarted,true);closed=true;approve();await assert.rejects(pending,/CLOSED/);assert.equal(fs.existsSync(path.join(temporary,'late.txt')),false);closed=false;
 const working=context.createReplFs({cwd:temporary,sessionStorageDir:temporary,accountRoot:temporary,browser:{isReadableDownloadPath:()=>false}});
 await working.writeFile('working.txt','yes');await working.copyFile('working.txt','copy-working.txt');await working.rename('copy-working.txt','renamed.txt');await working.unlink('working.txt');assert.equal(fs.readFileSync(path.join(temporary,'renamed.txt'),'utf8'),'yes');
 // Background output remains open while the original producer is alive.
 const binding={};let nativeClosed=false,nativePending=0;
 for(const [name,value] of Object.entries({assertBrokerOwner(){},withBrokerSync:fn=>fn(),withBrokerAwaited(fn){nativePending++;return fn().then(value=>{nativePending--;return value})},closeBrokerWriteAdmission(){nativeClosed=true},noteUntrackedBrokerWork(){}}))Object.defineProperty(binding,name,{value});
 const runtime=vm.createContext({process:{_linkedBinding:()=>binding},Object,Proxy,Reflect,Error,Promise,Set});vm.runInContext(recoveryWritesPrelude+';globalThis.b=auxBrokerBoundary();',runtime);
 const output=new EventEmitter;let ended=0;output.end=()=>{ended++;output.emit('close')};runtime.b.outputStream(()=>output);
 let shutdownDone=false;const shutdown=runtime.b.beginShutdown().then(()=>shutdownDone=true);await new Promise(resolve=>setImmediate(resolve));assert.equal(ended,0);assert.equal(shutdownDone,false);assert.equal(nativeClosed,false);assert.equal(nativePending,1);
 output.end();await shutdown;assert.equal(nativePending,0);assert.equal(nativeClosed,true);
 const target=path.join(temporary,'index.mjs');fs.writeFileSync(target,result.source);const syntax=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
 assert.throws(()=>applyAuxRecoveryWrites(raw+' '),/Unreviewed/);
 fs.writeFileSync(new URL('./evidence/source.json',import.meta.url),JSON.stringify({format:'aux.recovery-writers.source.v1',passed:true,inputSha256:result.inputSha256,outputSha256:result.outputSha256,changes:result.changes,checks:['actual JSONL Unicode offsets/rewrite and closed admission','actual attachment data/copy/collision and closed admission','actual REPL path-hook race refusal plus mutation operations','background stream awaits original producer close during shutdown','complete source syntax','changed input refusal'],fixtureNativeBinding:'synthetic only',filesystem:'disposable temporary files only',nativeAuthorityExecuted:false,newNativeAbi:false,allBackgroundWritersClosed:false,uiChanged:false},null,2)+'\n');
 console.log('PASS focused actual writer fixtures; no native authority/app execution');
}finally{fs.rmSync(temporary,{recursive:true,force:true})}
