import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const dir=new URL('./source/',import.meta.url),callbacks={};
const noopEvent=name=>({addListener:callback=>callbacks[name]=callback});
const native={profileId:'profile',boundAccountId:7,isRegularProfile:true,isOffTheRecord:false,accountAuthPaused:false,cookieRestorePending:false,browserContextId:'native-profile-instance',cookieBindingEpoch:'binding-1',cookieRestoreEpoch:'restore-1',hasAccountSession:false};
const route={accountId:7,profileId:'profile',browserMode:'default',windowId:12},taskId='12345678-1234-4234-8234-123456789abc';
const tabs=new Map([[20,{id:20,windowId:12,incognito:false,url:'https://example.test'}],[21,{id:21,windowId:13,incognito:false}]]);
let commands=0,detaches=0,unknown=0,physicalResolve,referenceValid=true;const nativeCommands=[];
const extension=vm.createContext({console,crypto:webcrypto,navigator:{userAgent:'actual-fixture-agent'},AbortController,Set,Map,Promise,Error,URL,Number,JSON,
 chrome:{auxBrowserPreferences:{validateTabReferences:async()=>({success:referenceValid})},auxAccount:{getProfileContext:async()=>({...native}),onProfileContextChanged:noopEvent('profile')},windows:{get:async id=>({id,incognito:false,type:'normal'})},tabs:{get:async id=>tabs.get(id)},debugger:{onEvent:noopEvent('event'),onDetach:noopEvent('detach'),attach:async()=>{},detach:async()=>{detaches++},sendCommand:(...args)=>{commands++;nativeCommands.push(args);return new Promise(resolve=>physicalResolve=resolve)}}},
 auxWorkerPhysical:(_name,callback)=>callback(),auxWorkerNoteUnknown:()=>unknown++,Be:async target=>target==='target'?20:21});
vm.runInContext(fs.readFileSync(new URL('extension-browser-actions.js',dir),'utf8'),extension);
const evaluate=code=>vm.runInContext(code,extension);
const context=await evaluate('auxBrowserNativeContext')({...route});
const execute=evaluate('auxRunBoundBrowserAction');
const task=()=>evaluate(`auxBoundBrowserTasks.get('${taskId}')`);
await assert.rejects(execute({taskId,context:{...context,profileId:'foreign'},command:{method:'Aux.debuggerAttach',params:{targetId:'target'}}},route,undefined,()=>{}),/context changed/);
assert.equal(commands,0);
// Owned provenance is produced by native tab creation, not an input boolean.
await execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDetach',params:{sessionId:'absent'}}},route,undefined,()=>{});
await assert.rejects(execute({taskId,context,persistent:true,command:{method:'Aux.debuggerAttach',params:{targetId:'target'}}},route,undefined,()=>{}),/not owned/);
task().created.set('target',20);task().created.set('foreign-window',21);
await assert.rejects(execute({taskId,context,persistent:true,command:{method:'Aux.debuggerAttach',params:{targetId:'foreign-window'}}},route,undefined,()=>{}),/outside/);
await assert.rejects(execute({taskId,context:{...context,cookieBindingEpoch:'foreign'},command:{method:'Aux.debuggerCloseTask',params:{}}},route,undefined,()=>{}),/original browser task context/);
const attached=await execute({taskId,context,persistent:true,command:{method:'Aux.debuggerAttach',params:{targetId:'target'}}},route,undefined,()=>{});
await assert.rejects(execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDispatch',params:{method:'Runtime.evaluate',params:{expression:'1'},sessionId:'forged'}}},route,undefined,()=>{}),/session is unavailable/);
await assert.rejects(execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDispatch',params:{method:'Browser.setDownloadBehavior',sessionId:attached.sessionId}}},route,undefined,()=>{}),/unavailable/);
await assert.rejects(execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDispatch',params:{method:'Page.navigate',params:{url:'file:///private/native-seed'},sessionId:attached.sessionId}}},route,undefined,()=>{}),/web pages/);
assert.equal(commands,0);
const controller=new AbortController();let settled=false;
const dispatch=execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDispatch',params:{method:'Runtime.evaluate',params:{expression:'1'},sessionId:attached.sessionId}}},route,controller.signal,()=>{}).finally(()=>settled=true);
while(!physicalResolve)await Promise.resolve();
controller.abort(Error('cancelled'));
let closed=false;const close=evaluate('auxCloseBrowserTask')(task()).then(()=>closed=true);
await new Promise(resolve=>setTimeout(resolve,5));assert.equal(settled,false);assert.equal(closed,false);assert.equal(detaches,0);
physicalResolve({result:{value:1}});await assert.rejects(dispatch,/cancelled/);await close;
assert.equal(detaches,1);assert.equal(task(),undefined);assert.equal(unknown,0);
// Explicit selected immutable documents reuse the original native lease.
const reference={targetId:'target',url:'https://example.test',documentCapability:'native-selected-document'};
const borrowed=await execute({taskId,context,persistent:true,command:{method:'Aux.debuggerAttach',params:{targetId:'target',reference}}},route,undefined,()=>{});
physicalResolve=undefined;
const selected=execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDispatch',params:{method:'Runtime.evaluate',params:{expression:'1'},sessionId:borrowed.sessionId}}},route,undefined,()=>{});
while(!physicalResolve)await Promise.resolve();assert.equal(nativeCommands.at(-1)[2].__auxDocumentCapability,reference.documentCapability);physicalResolve({result:{value:1}});await selected;
callbacks.event({tabId:20},'Target.attachedToTarget',{sessionId:'native-iframe',targetInfo:{type:'iframe'}});
physicalResolve=undefined;
const child=execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDispatch',params:{method:'Page.getFrameTree',params:{},sessionId:'native-iframe'}}},route,undefined,()=>{});
while(!physicalResolve)await Promise.resolve();assert.equal(nativeCommands.at(-1)[0].sessionId,'native-iframe');assert.equal(nativeCommands.at(-1)[2].__auxDocumentCapability,reference.documentCapability);physicalResolve({frameTree:{}});await child;
referenceValid=false;
await assert.rejects(execute({taskId,context,persistent:true,command:{method:'Aux.debuggerDispatch',params:{method:'Runtime.evaluate',params:{expression:'1'},sessionId:borrowed.sessionId}}},route,undefined,()=>{}),/selected tab document changed/);
const retiring=task();if(retiring)await evaluate('auxCloseBrowserTask')(retiring);assert.equal(detaches,2);
// Exercise the actual rewritten class's pending response logic, rather than a
// replacement model of abort handling. No router/socket/native app is opened.
const projected=fs.readFileSync('/private/tmp/aux-browser-automation-resource-check-20261026/aux-native-entry.mjs','utf8');
const start=projected.indexOf('ExtensionBridgeServer=class{'),end=projected.indexOf('})),extension_bridge_exports',start);
assert.ok(start>0&&end>start);
let active=0,untracked=0;const sent=[];
const binding={};Object.defineProperty(binding,'supervisedTasksEnabled',{value:false});
const daemon=vm.createContext({console,process:{_linkedBinding:()=>binding},crypto:webcrypto,structuredClone,AbortController,Set,Map,Promise,Error,JSON,Number,clearTimeout,setTimeout,WebSocket:{OPEN:1},
 auxRequireSupervisedTasks:()=>{throw Error('raw task guard')},init_accounts:()=>{},AccountRegistry:{getAccount:()=>({id:7,createdAt:1,incarnationId:'account-1'})},
 auxCreateProductivityAccountGuard:(_id,_account,_profile,controller)=>({assertCurrent:()=>controller.signal.throwIfAborted(),dispose:()=>{}}),
 auxBrokerBoundary:()=>({assertOwner:()=>{},registerProducerStop:()=>{},awaited:async callback=>{active++;try{return await callback()}finally{active--}},noteUntracked:()=>untracked++}),
 getConnectionKey:(account,profile,mode)=>`${account}:${profile}:${mode}`,getCommandTimeoutMs:()=>1000,EXTENSION_BRIDGE_CONNECT_TIMEOUT_MS:1000,createAbortError$1:signal=>signal.reason??Error('cancelled'),safeWebsocketSend:(socket,value)=>socket.send(JSON.stringify(value))});
vm.runInContext(fs.readFileSync(new URL('daemon-browser-actions.js',dir),'utf8'),daemon);
vm.runInContext(projected.slice(start,end),daemon);
const Bridge=vm.runInContext('ExtensionBridgeServer',daemon),bridge=new Bridge;
bridge.connections.set('7:profile:default',{accountId:7,profileId:'profile',browserMode:'default',connectionId:'exact',ws:{readyState:1,send:value=>sent.push(JSON.parse(value))}});
const settle=value=>{const [id,pending]=[...bridge.pendingCommandRequests][0];bridge.pendingCommandRequests.delete(id);clearTimeout(pending.timeout);pending.resolve(value)};
const abort=new AbortController();let resultSettled=false;
const result=bridge.sendCommandToExtension({method:'Aux.listTabs',params:{accountId:7}},{...route,signal:abort.signal}).finally(()=>resultSettled=true);
while(sent.length<1)await Promise.resolve();settle(context);
while(sent.length<2)await Promise.resolve();abort.abort(Error('cancelled'));
await new Promise(resolve=>setTimeout(resolve,5));assert.equal(resultSettled,false);assert.equal(bridge.pendingCommandRequests.size,1);assert.equal(active,1);assert.equal(sent.at(-1).method,'cancelCommand');
settle({items:[]});await assert.rejects(result,/cancelled/);assert.equal(active,0);assert.equal(untracked,0);
console.log(JSON.stringify({passed:true,checks:['native profile/window and owned-tab provenance','selected native document token inherited by real iframe sessions','unsafe navigation and foreign task close refusal','forged session/global method refusal','original debugger promise retained through cancellation and close','actual supplied bridge class retains bounded response through cancellation'],nativeExecuted:false,appExecuted:false}));
