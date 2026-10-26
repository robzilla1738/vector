import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('./source/',import.meta.url),projected=fs.readFileSync('/private/tmp/aux-browser-automation-resource-check-20261026/aux-native-entry.mjs','utf8');
const start=projected.indexOf('Repl=class{#e;#t;#n;#r=null;'),end=projected.indexOf('}));function createDesktopRepl',start);
assert.ok(start>0&&end>start);
let captures=0,nativeClosed=0,bridgeDisposed=0,leak=0,hostResolve,rawScope,bridge;
const route={accountId:7,profileId:'profile',windowId:12,browserMode:'default'},account={id:7,createdAt:1,incarnationId:'account-1'},session={id:'session',createdAt:2,browserBinding:route};
class CdpClient{}class AuxBrowser{}
class Page{url(){return 'https://example.test'}evaluate(){return Promise.resolve({value:1})}}
const page=new Page;page.cdp=new CdpClient;
class AuxPDFRepl{constructor(resolve,backend){this.resolve=resolve;this.backend=backend}}
const functions=new Map([[Page.prototype.evaluate,0]]),globals={};
const native={assertTaskSessionPath(path){assert.equal(path,'/task/session')},assertCurrent(){assert.equal(nativeClosed,0)},awaited(operation){this.assertCurrent();return operation()},close(){nativeClosed++}};
const sandbox=vm.createContext({console,Promise,WeakMap,Set,Map,Proxy,Reflect,Object,Buffer,URL,Date,ArrayBuffer,AbortController,AbortSignal,Error,AuxPDFRepl,FUNCTION_SOURCE_ARGUMENTS:functions,HOST_DENYLIST:new Set([Function]),CdpClient,AuxBrowser,
 AccountRegistry:{getAccount:()=>account},SessionStore:{get:()=>session},auxUsesBoundBrowserActions:()=>true,auxRequireSupervisedTasks:()=>{throw Error('unregistered task guard')},auxSelectedAccountIdentity:()=>({incarnation:'account-1'}),
 auxBrokerBoundary:()=>({registerProducerStop(){},assertOwner(){},captureSelectedBuiltinSession(){captures++;return native},noteUntracked(){throw Error('Unexpected unknown custody')}}),
 createReplScope(){rawScope={globals:{fs:{leak:true,resolvePath:value=>value},path:{},pwd:'/unsafe',fetch:()=>leak++,setTimeout:()=>leak++,console:{log(){}},sleep:async()=>{},tabs:[page],page,openTab:()=>new Promise(resolve=>hostResolve=resolve)},sync:async()=>{},setRunActive(){}};return rawScope},
 loadNodeQuickJS(){},GUEST_NATIVE_GLOBALS:new Set,PLATFORM_GLOBALS:{},MODULE_ACCESS_PATTERN:/\b(?:import|require)\(/,
 QuickJSBridge:{create:async options=>bridge={runtime:{setInterruptHandler(){},removeInterruptHandler(){}},alive:true,defineGlobal(name,get){globals[name]=get},evalAsync:async code=>{if(code==='fire-host')rawScope.globals.openTab('https://example.test');return {}},dispose(){this.alive=false;bridgeDisposed++},options}},
 runRepl:async(code,options,impl)=>{const original={signal:options.signal,promise:new Promise(()=>{})};return await impl.beginRun(original,1000).evaluate(code)},
 getCurrentReplContext:()=>({outputs:[]}),imageInputToBuffer:Buffer.from,detectSupportedImageMimeTypeFromBuffer:async()=> 'image/png'});
sandbox.HOST_DENYLIST.add(vm.runInContext('Function',sandbox));
vm.runInContext(fs.readFileSync(new URL('browser-repl.js',root),'utf8'),sandbox);
vm.runInContext(projected.slice(start,end),sandbox);
const create=vm.runInContext('auxCreateBrowserOnlyRepl',sandbox);
const browser={extensionBridgeRoute:route,state:{tabs:[]},bindSelectedBrowserOwner(){}};
const repl=create({accountId:7,agentSessionId:'session',browser,sessionStorageDir:'/task/session',hooks:{trigger:async()=>({fs:{leak:true},openTab:()=>leak++})}});
assert.equal(captures,0,'ordinary factory remains lazy');
const register=vm.runInContext('auxRegisterBrowserReplTool',sandbox),execute=vm.runInContext('auxExecuteRegisteredBrowserTool',sandbox);
const tool=register({name:'repl'},repl);
assert.throws(()=>execute({tool:{...tool}},()=>42),/unregistered task guard/);
await execute({tool},()=>repl.run('fire-host'));
assert.equal(captures,1);assert.equal(leak,0);assert.ok(hostResolve);assert.equal(rawScope.globals.openTab.constructor,undefined,'wrapping cannot disguise the original forbidden host Function constructor');
assert.equal(Object.hasOwn(globals,'fs'),false);assert.equal(Object.hasOwn(globals,'fetch'),false);assert.equal(Object.hasOwn(globals,'setTimeout'),false);
assert.equal(rawScope.globals.page.url(),'https://example.test','sync browser methods preserve sync return');
const wrapped=rawScope.globals.page.evaluate;assert.equal(functions.get(wrapped),0,'supplied evaluate function-source argument preserved');
assert.equal(bridge.options.isMarshalable(rawScope.globals.page.cdp),false,'task transport cannot leak into guest globals');
let closed=false;const close=repl.dispose().then(()=>closed=true);
await new Promise(resolve=>setTimeout(resolve,5));assert.equal(closed,false);assert.equal(nativeClosed,0);assert.equal(bridgeDisposed,0);
hostResolve(page);await close;
assert.equal(nativeClosed,1);assert.equal(bridgeDisposed,1);assert.equal(functions.has(wrapped),false);
console.log(JSON.stringify({passed:true,checks:['actual supplied Repl class uses held original evalAsync','lazy selected native owner and exact tool object admission','unawaited original browser promise held through real bridge disposal','unsafe/plugin globals removed and sync method/function-source semantics preserved','scoped CdpClient remains unmarshalable'],nativeExecuted:false,quickJsExecuted:false,appExecuted:false}));
