import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { applyCloudInferenceUploadAdapter, cloudInferenceUploadHelpers } from './cloud-inference-upload-adapter.mjs';
const sourcePath='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs';
test('count-checked actual shipped1852 patch parses as a complete module',async()=>{
 const source=await readFile(sourcePath,'utf8'),result=applyCloudInferenceUploadAdapter(source);
 assert.equal(result.anchors.length,3);assert.throws(()=>applyCloudInferenceUploadAdapter(result.text),/anchor changed/);
 const dir=await mkdtemp(path.join(tmpdir(),'aux-inference-source-'));try{const file=path.join(dir,'index.mjs');await writeFile(file,result.text);execFileSync(process.execPath,['--check',file]);}finally{await rm(dir,{recursive:true,force:true});}
});
function fixture(){
 const account={userId:'fixture-user',createdAt:'fixture-time'},calls=[],records=new Map;let counter=0;
 const context=vm.createContext({Buffer,JSON,Number,Error,URL,AbortSignal,Promise,Map,Set,
  sha256Hex:b=>createHash('sha256').update(b).digest('hex'),AccountRegistry:{getAccount:()=>account,getSession:()=>({accessToken:'fixture'})},
  transcribeResponseSchema:{parse:v=>v},
  fetchAuxAPIAuthenticatedRequest:async(id,route,options)=>{
   calls.push({route,options});let result={};
   if(route==='/attachments/intents'){const body=JSON.parse(options.body),key='00000000-0000-4000-8000-'+String(++counter).padStart(12,'0');result={id:key,...body};records.set(key,result);}
   else if(route.endsWith('/upload-url'))result={url:'https://fixture.private.blob.vercel-storage.com/input?signed=fixture'};
   else if(route.endsWith('/commit')){const record=records.get(route.split('/')[2]);result={...record,state:'ready'};}
   else if(route==='/stt/transcribe')result={text:' fixture transcript '};
   return Response.json(result);
  },
  fetch:async(url,options)=>{calls.push({signed:true,url:String(url),options});return new Response('',{status:200});},
  fetchAuxAPIAuthenticatedJson:async(id,route,options)=>{calls.push({inference:true,route,options});return{model:options.body.model,images:[]};}
 });
 new vm.Script(cloudInferenceUploadHelpers).runInContext(context);return{context,calls,account};
}
test('large image transport keeps every cloud control body below platform limit and never sends auth to signed PUT',async()=>{
 const {context,calls}=fixture(),data=Buffer.alloc(3*1024*1024).toString('base64');
 await context.auxCloudImageJSON(1,'/ai/images/generations',{method:'POST',body:{model:'aux-image',prompt:'fixture',inputImages:[{data,mimeType:'image/png'},{data,mimeType:'image/jpeg'}]}});
 const uploads=calls.filter(c=>c.signed);assert.equal(uploads.length,2);
 for(const call of uploads){assert.deepEqual(Object.keys(call.options.headers),['content-type']);assert.equal(call.options.redirect,'error');}
 for(const call of calls.filter(c=>c.options.body&&typeof c.options.body==='string'))assert.ok(Buffer.byteLength(call.options.body)<4*1024*1024);
 const request=calls.find(c=>c.inference);assert.ok(JSON.stringify(request.options.body).length<1024);assert.equal(request.options.body.inputImages.length,2);
 assert.equal(calls.filter(c=>c.options.method==='DELETE').length,2);
});
test('large WebM/M4A transport preserves transcript and cleans uploaded input on inference failure',async()=>{
 const {context,calls}=fixture(),file=new File([Buffer.alloc(4*1024*1024)],'recording.m4a',{type:'audio/mp4'});
 assert.equal(await context.auxCloudTranscribeLarge(1,file,{language:'en-US'}),'fixture transcript');
 assert.equal(calls.find(c=>c.route==='/stt/transcribe').options.headers['content-type'],'application/json');
 assert.equal(calls.filter(c=>c.options.method==='DELETE').length,1);
 context.fetchAuxAPIAuthenticatedJson=async()=>{throw Error('fixture inference failed');};
 const data=Buffer.alloc(3*1024*1024).toString('base64');await assert.rejects(context.auxCloudImageJSON(1,'/ai/images/generations',{body:{inputImages:[{data,mimeType:'image/png'}]}}),/fixture inference failed/);
 assert.equal(calls.filter(c=>c.options.method==='DELETE').length,2);
});
test('small requests stay byte-for-byte supplied transport and large references retain16/20MiB bound',async()=>{
 const {context,calls}=fixture(),options={body:{model:'aux-image',prompt:'fixture'}};
 await context.auxCloudImageJSON(1,'/ai/images/generations',options);assert.equal(calls.length,1);assert.equal(calls[0].options,options);
 const data=Buffer.alloc(21*1024*1024).toString('base64');await assert.rejects(context.auxCloudImageJSON(1,'/ai/images/generations',{body:{inputImages:[{data,mimeType:'image/png'}]}}),/20 MiB/);
});
