import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { spawnSync } from 'node:child_process';
import { auxSubmitSessionFeedback, transformAuxSessionFeedback, transformAuxFeedbackCopy } from '../../../../../../vendor/provided/aux-session-feedback.mjs';
const root='/Users/rcourson/Documents/Vibe/web', original=root+'/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/';
const current=root+'/out/completion-20261026-paired-source-a6/';
const entry=readFileSync(current+'aux-native-entry.mjs','utf8');
const helpers=entry.slice(entry.indexOf('function auxCloudTransferIdentity('),entry.indexOf('async function auxCloudBackupAttachment('));
let account={id:7,createdAt:1,incarnationId:'first',userId:'fixture'},auth={},session={id:'session',createdAt:2},calls=[],mode='ready',dumpHook=async()=>({version:2,messages:[{text:'synthetic'}]}),pending=0,body;
const context={Buffer,AbortSignal,URL,AccountRegistry:{getAccount:()=>account,getSession:()=>auth},SessionStore:{get:()=>session},DAEMON_VERSION:'fixture',randomUUID:()=> '00000000-0000-4000-8000-000000000001',sha256Hex:bytes=>createHash('sha256').update(bytes).digest('hex'),buildSessionFeedbackDump:(...args)=>dumpHook(...args),auxBrokerBoundary:()=>({async awaited(fn){pending++;try{return await fn()}finally{pending--}}}),fetchAuxAPIAuthenticatedRequest:async(_id,route,options)=>{
 calls.push(route);if(route==='/attachments/intents'){body=JSON.parse(options.body);return Response.json({id:'00000000-0000-4000-8000-000000000002'})}
 if(route.endsWith('/upload-url'))return Response.json({url:'https://fixture.private.blob.vercel-storage.com/upload'});
 if(route.endsWith('/commit'))return Response.json({id:'00000000-0000-4000-8000-000000000002',sha256:body.sha256,size:body.size,name:body.name,purpose:'attachment',mimeType:'application/json',state:mode,contentUrl:'/attachments/00000000-0000-4000-8000-000000000002/content'});
 throw Error('Unexpected route');},fetch:async(_url,options)=>{calls.push('signed PUT');assert.equal(JSON.parse(options.body).format,'aux.session-feedback.v1');if(mode==='account-change')account={...account,incarnationId:'replacement'};return new Response(null,{status:mode==='upload-failure'?503:200})}};
const submit=runInNewContext(helpers+'\n'+auxSubmitSessionFeedback.toString()+'\nauxSubmitSessionFeedback',context);
assert.equal((await submit(7,session,'synthetic')).ok,true);assert.equal(pending,0);assert.deepEqual(calls,['/attachments/intents','/attachments/00000000-0000-4000-8000-000000000002/upload-url','signed PUT','/attachments/00000000-0000-4000-8000-000000000002/commit']);
for(const state of ['issued','upload-failure','account-change']){mode=state;calls=[];await assert.rejects(submit(7,session,'synthetic'));assert.equal(pending,0);if(state==='account-change')assert.ok(!calls.some(value=>value.endsWith('/commit')))}
auth=null;calls=[];await assert.rejects(submit(7,session,'synthetic'),/Connect/);assert.equal(calls.length,0);auth={};
const selected=session;dumpHook=async()=>{session={...session,createdAt:99};return{version:2}};calls=[];await assert.rejects(submit(7,selected,'synthetic'),/session changed/);assert.equal(calls.length,0);
dumpHook=async()=>({messages:['x'.repeat(8*1024*1024)]});calls=[];await assert.rejects(submit(7,session,'synthetic'),/8 MiB/);assert.equal(calls.length,0);
const output=mkdtempSync(join(tmpdir(),'aux-private-feedback-source-')),files=[];
for(const name of ['index.mjs','aux-native-entry.mjs']){
 const source=readFileSync(original+name,'utf8'),before=readFileSync(current+name,'utf8'),result=transformAuxSessionFeedback({source,text:before});
 assert.ok(!result.text.includes('/voc/session-feedback'));
 let reversed=result.text;
 for(const anchor of [...result.anchors].reverse())reversed=anchor.append?reversed.slice(0,-anchor.append.length):reversed.slice(0,anchor.offsetAtApplication)+anchor.find+reversed.slice(anchor.offsetAtApplication+anchor.replace.length);
 assert.equal(reversed,before);
 const path=join(output,name);writeFileSync(path,result.text,{mode:0o600});assert.equal(spawnSync(process.execPath,['--check',path]).status,0);files.push({path,sha256:createHash('sha256').update(result.text).digest('hex')});
}
const ui='assets/session-feedback-dialog-BjDg0W8m.js',uiOriginal=readFileSync(root+'/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/extension/dist/'+ui,'utf8');
const transformedUi=transformAuxFeedbackCopy({path:ui,text:uiOriginal,source:uiOriginal});assert.ok(transformedUi.text.includes('Saved privately for review.'));const uiPath=join(output,'feedback.js');writeFileSync(uiPath,transformedUi.text);assert.equal(spawnSync(process.execPath,['--check',uiPath]).status,0);
writeFileSync(new URL('./verification.json',import.meta.url),JSON.stringify({format:'aux.private-feedback.source-check.v1',passed:true,files,checks:['actual account-bound upload helper authenticated intent/PUT/verified commit','nonready/upload failure refuses success','incarnation change prevents commit','session change/no cloud/size bound before upload','pending original promise settles before broker release','paired exact reverse and full syntax','truthful same-style UI copy syntax'],productExecuted:false,cloudWrite:false,credentialsRead:false},null,2)+'\n');
console.log(JSON.stringify({passed:true,output,pairedFiles:files.length,cloudWrite:false}));
