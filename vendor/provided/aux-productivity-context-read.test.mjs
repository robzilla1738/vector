import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {auxValidateReferenceMessages,auxDrainValidatedQueue,auxReferenceCdpClient,transformAuxContextReadDaemon,transformAuxContextReadUi} from './aux-productivity-context-read.mjs';
const route={accountId:7,profileId:'profile-one',browserMode:'default'};
const reference={type:'tab',targetId:'view-one',url:'https://example.test/selected',documentCapability:'document-one'};
const metadata={role:'user-message-metadata',attachments:[reference]};
function queue(messages){return{messages,peek(){return this.messages.slice()},drain(){return this.messages.splice(0)}}}
test('queue validation precedes removal and preserves cancelled, stale and edited messages',async()=>{
 const pending=queue([metadata]);
 await assert.rejects(auxDrainValidatedQueue(pending,async()=>{throw Error('Document changed')}),/Document changed/);
 assert.deepEqual(pending.messages,[metadata]);
 const controller=new AbortController();
 await assert.rejects(auxDrainValidatedQueue(pending,async()=>controller.abort(),controller.signal),/cancelled/);
 assert.deepEqual(pending.messages,[metadata]);
 const replacement={role:'user',content:'updated'};
 await assert.rejects(auxDrainValidatedQueue(pending,async()=>{pending.messages=[replacement]}),/changed during validation/);
 assert.deepEqual(pending.messages,[replacement]);
 assert.deepEqual(await auxDrainValidatedQueue(pending,async()=>{}),[replacement]);assert.equal(pending.messages.length,0);
});
test('one-row drain validates the separately queued attachment metadata before removing the user row',async()=>{
 const user={role:'user',content:'read this tab'},pending=queue([user,metadata]);
 pending.peek=function(){return this.messages.slice(0,1)};
 let validated;await assert.rejects(auxDrainValidatedQueue(pending,async messages=>{validated=messages;throw Error('stale metadata')}),/stale metadata/);
 assert.deepEqual(validated,[user,metadata]);assert.deepEqual(pending.messages,[user,metadata]);
});
test('actual bridge route is required and cannot change during admission',async()=>{
 let current=route;const browser={get extensionBridgeRoute(){return current}};
 let sent;await auxValidateReferenceMessages(browser,[metadata],async(command,options)=>{sent={command,options};return {success:true}});
 assert.equal(sent.command.method,'Aux.validateTabReferences');assert.deepEqual(sent.options,route);
 await assert.rejects(auxValidateReferenceMessages(browser,[{...metadata,attachments:[{...reference,documentCapability:''}]}],async()=>assert.fail('must not route')),/selected again/);
 await assert.rejects(auxValidateReferenceMessages(browser,[metadata],async()=>{current={...route,profileId:'other-profile'};return{success:true}}),/profile changed/);
});
test('selected reads use existing native sessions and carry document guard through frames; ordinary reads stay identical',async()=>{
 const calls=[],listeners=new Map(),tabs=[{targetId:reference.targetId,source:'attachment',documentCapability:reference.documentCapability,documentUrl:reference.url}];
 const original={async send(...args){calls.push(args);return args[0]==='Target.attachToTarget'?{sessionId:'actual-session'}:{result:{value:'actual-result'}}},on(event,fn){listeners.set(event,fn);return()=>listeners.delete(event)}};
 let bridge=0;const guarded=auxReferenceCdpClient(original,()=>tabs,()=>route,async()=>{bridge++;return{success:true}});
 assert.deepEqual(await guarded.send('Target.attachToTarget',{targetId:reference.targetId,flatten:true}),{sessionId:'actual-session'});assert.equal(bridge,1);
 const options={timeoutMs:10};await guarded.send('Runtime.evaluate',{expression:'document.title'},'actual-session',options);
 assert.deepEqual(calls.at(-1),['Runtime.evaluate',{expression:'document.title'},'actual-session',{timeoutMs:10,auxDocumentCapability:'document-one'}]);assert.deepEqual(options,{timeoutMs:10});
 guarded.on('Target.attachedToTarget',()=>{});listeners.get('Target.attachedToTarget')({sessionId:'actual-frame',targetInfo:{targetId:'frame-target'}},{sessionId:'actual-session'});
 await guarded.send('DOM.getDocument',{},'actual-frame');assert.equal(calls.at(-1)[3].auxDocumentCapability,'document-one');
 await guarded.send('Runtime.evaluate',{expression:'1'},'unrelated-session',options);assert.strictEqual(calls.at(-1)[3],options);
 tabs[0].documentCapability='';await assert.rejects(guarded.send('Runtime.evaluate',{},'actual-session'),/expired/);
});
test('failed or changing selection never attaches a target',async()=>{
 const client={send:async()=>assert.fail('must not attach')},tabs=[{targetId:'view',source:'attachment',documentCapability:'old',documentUrl:'https://example.test'}];
 await assert.rejects(auxReferenceCdpClient(client,()=>tabs,()=>route,async()=>({success:false,error:'Document changed'})).send('Target.attachToTarget',{targetId:'view'}),/Document changed/);
 await assert.rejects(auxReferenceCdpClient(client,()=>tabs,()=>route,async()=>{tabs[0].documentCapability='new';return{success:true}}).send('Target.attachToTarget',{targetId:'view'}),/context changed/);
});
test('counted adapters apply to both actual paired daemon entries and authenticated extension dispatch',()=>{
 const root='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-protected-startup-integration-20261023/Aux.app/Contents/Resources/aux';
 const dir=mkdtempSync(join(tmpdir(),'aux-context-read-'));
 try{
  for(const file of ['index.mjs','aux-native-entry.mjs']){
   const source=readFileSync(join(root,'apps/daemon/Aux Daemon.app/Contents/Resources/node-development',file),'utf8'),result=transformAuxContextReadDaemon({text:source});assert.ok(result.anchors.length>10);
   const path=join(dir,file);writeFileSync(path,result.text);const checked=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);
  }
  const relative='background.js',source=readFileSync(join(root,'apps/extension/dist',relative),'utf8'),result=transformAuxContextReadUi({relative,text:source});assert.equal(result.anchors.length,2);
  const path=join(dir,'background.mjs');writeFileSync(path,result.text);const checked=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
