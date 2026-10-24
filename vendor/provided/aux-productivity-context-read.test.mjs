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
test('a referenced session never downgrades or rebinds when its record disappears or changes',async()=>{
 const calls=[],tabs=[{targetId:'view',source:'attachment',documentCapability:'original',documentUrl:'https://example.test/original'}];
 const client={send:async(...args)=>{calls.push(args);return args[0]==='Target.attachToTarget'?{sessionId:'bound'}:{}}};
 const guarded=auxReferenceCdpClient(client,()=>tabs,()=>route,async()=>({success:true}));
 await guarded.send('Target.attachToTarget',{targetId:'view'});
 tabs.length=0;
 await assert.rejects(guarded.send('Runtime.evaluate',{},'bound'),/context (expired|changed)/);
 tabs.push({targetId:'view',source:'attachment',documentCapability:'replacement',documentUrl:'https://example.test/other'});
 await assert.rejects(guarded.send('Runtime.evaluate',{},'bound'),/context (expired|changed)/);
 Object.assign(tabs[0],{documentCapability:'original',documentUrl:'https://example.test/original'});
 await assert.rejects(guarded.send('Runtime.evaluate',{},'bound'),/context expired/);
 assert.deepEqual(calls.map(call=>call[0]),['Target.attachToTarget','Target.detachFromTarget']);
});
test('in-place route and queued reference changes cannot pass an earlier validation',async()=>{
 const mutable={...route},browser={extensionBridgeRoute:mutable};
 await assert.rejects(auxValidateReferenceMessages(browser,[metadata],async()=>{
  mutable.profileId='other';return {success:true};
 }),/profile changed/);
 const captured={...reference},pending=queue([{role:'user-message-metadata',attachments:[captured]}]);
 await assert.rejects(auxDrainValidatedQueue(pending,async()=>{captured.documentCapability='new-document'}),/changed during validation/);
 assert.equal(pending.messages.length,1);
 assert.equal(pending.messages[0].attachments[0].documentCapability,'new-document');
});
test('early attached frames retain the pending parent binding before its reply',async()=>{
 const calls=[],listeners=new Map(),tabs=[{targetId:'view',source:'attachment',documentCapability:'document',documentUrl:'https://example.test'}];
 const client={send:async(...args)=>{
  calls.push(args);
  if(args[0]==='Target.attachToTarget'){
   listeners.get('Target.attachedToTarget')({sessionId:'parent',targetInfo:{targetId:'view'}},{});
   listeners.get('Target.attachedToTarget')({sessionId:'child',targetInfo:{targetId:'frame'}},{sessionId:'parent'});
   return {sessionId:'parent'};
  }
  return {};
 },on(event,callback){listeners.set(event,callback)}};
 const guarded=auxReferenceCdpClient(client,()=>tabs,()=>route,async()=>({success:true}));
 guarded.on('Target.attachedToTarget',()=>{});
 await guarded.send('Target.attachToTarget',{targetId:'view'});
 await guarded.send('DOM.getDocument',{},'child');
 assert.equal(calls.at(-1)[3].auxDocumentCapability,'document');
 tabs.length=0;
 await assert.rejects(guarded.send('DOM.getDocument',{},'child'),/context (expired|changed)/);
});
test('an existing ordinary session and its frames upgrade when selected context is attached',async()=>{
 const calls=[],listeners=new Map(),tabs=[{targetId:'view',source:'ordinary'}];
 const client={send:async(...args)=>{calls.push(args);return args[0]==='Target.attachToTarget'?{sessionId:'parent'}:{}},
  on(event,callback){listeners.set(event,callback)}};
 const guarded=auxReferenceCdpClient(client,()=>tabs,()=>route,async()=>({success:true}));
 guarded.on('Target.attachedToTarget',()=>{});
 await guarded.send('Target.attachToTarget',{targetId:'view'});
 listeners.get('Target.attachedToTarget')({sessionId:'child',targetInfo:{targetId:'frame'}},{sessionId:'parent'});
 Object.assign(tabs[0],{source:'attachment',documentCapability:'selected',documentUrl:'https://example.test'});
 await guarded.send('DOM.getDocument',{},'child');
 assert.equal(calls.at(-1)[3].auxDocumentCapability,'selected');
 tabs.length=0;
 await assert.rejects(guarded.send('Runtime.evaluate',{},'parent'),/context (expired|changed)/);
});
test('a context changed during physical attachment detaches only its exact new session',async()=>{
 const calls=[],tabs=[{targetId:'view',source:'attachment',documentCapability:'original',documentUrl:'https://example.test'}];
 const client={send:async(...args)=>{
  calls.push(args);
  if(args[0]==='Target.attachToTarget'){tabs.length=0;return {sessionId:'created'}}
  if(args[0]==='Target.detachFromTarget')throw Error('Cleanup reply lost');
  return {};
 }};
 const guarded=auxReferenceCdpClient(client,()=>tabs,()=>route,async()=>({success:true}));
 await assert.rejects(guarded.send('Target.attachToTarget',{targetId:'view'}),/context (expired|changed)/);
 assert.deepEqual(calls[1],['Target.detachFromTarget',{sessionId:'created'}]);
 await assert.rejects(guarded.send('Runtime.evaluate',{},'created'),/context (expired|changed)/);
 assert.equal(calls.length,2);
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
