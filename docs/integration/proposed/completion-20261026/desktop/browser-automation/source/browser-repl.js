// The supplied QuickJS engine and REPL remain the evaluator. Admission is tied
// to exact factory-created tools and an actual held native selected session.
const auxBrowserRepls=new WeakMap,auxBrowserTools=new WeakMap,auxBrowserJsBridges=new WeakMap,auxBrowserJsOwners=new WeakMap;
const auxBrowserReplStates=new Set;
function auxCloseBrowserRepls(){return Promise.allSettled([...auxBrowserReplStates].map(state=>state.close()))}
function auxRunBrowserJsBackground(browser,operation){const state=auxBrowserJsOwners.get(browser);return state?state.awaited(operation):operation()}
function auxRunBrowserJsBridge(bridge,operation){const state=auxBrowserJsBridges.get(bridge);return state?state.awaited(operation):operation()}
function auxRegisterBrowserReplTool(tool,repl){
 const state=auxBrowserRepls.get(repl);if(!state)return tool;
 auxBrowserTools.set(tool,state);
 tool.description='Run JavaScript in the existing persistent browser QuickJS REPL. Available: page, tabs, openTab, closeTab, getTabByTargetId, listBrowserTabs, attachBrowserTab (explicit selected or task-owned tabs), attachActiveBrowserTab, snapshot, annotatedScreenshot, installPageScript, sleep, console.log, display(image bytes/base64), Buffer, text codecs and standard JavaScript values. Browser operations retain the original account, profile, window and selected document. aux.pdf provides the original seven PDF methods through the existing scoped file resolver and held native session. External modules, fs, shell, arbitrary chrome APIs and background callback timers are unavailable in this browser scope.';
 return tool;
}
function auxExecuteRegisteredBrowserTool(prepared,operation){
 if(!auxUsesBoundBrowserActions()){auxRequireSupervisedTasks();return operation()}
 if(typeof auxIsSelectedReadFileTool==='function'&&auxIsSelectedReadFileTool(prepared.tool))return operation();
 const state=auxBrowserTools.get(prepared.tool);if(!state)auxRequireSupervisedTasks();
 return state.awaited(operation);
}
function auxCreateBrowserOnlyRepl(options){
 const scope=createReplScope(options),resolvePdfPath=scope.globals.fs.resolvePath,controller=new AbortController,pending=new Set,objects=new WeakMap,originals=new WeakMap,functions=new WeakMap,mappedFunctions=new Set;
 let native,raw,closing=false,closePromise,bridgeDisposal;
 const account=AccountRegistry.getAccount(options.accountId),createdAt=account?.createdAt,incarnation=account?.incarnationId;
 const initialRoute={...options.browser.extensionBridgeRoute};
 const initialSession=SessionStore.get(options.accountId,options.agentSessionId),sessionCreatedAt=String(options.sessionCreatedAt??initialSession?.createdAt);
 const bindingKey=route=>JSON.stringify([route?.accountId,route?.profileId,route?.browserMode,route?.windowId]);
 const expectedRoute=bindingKey(initialRoute);
 const capture=()=>{
  if(closing)throw Error('The original browser REPL is closing.');
  const current=AccountRegistry.getAccount(options.accountId),session=SessionStore.get(options.accountId,options.agentSessionId),route=options.browser.extensionBridgeRoute;
  if(!current||current.createdAt!==createdAt||current.incarnationId!==incarnation||!session||String(session.createdAt)!==sessionCreatedAt||bindingKey(route)!==expectedRoute||route.accountId!==options.accountId||route.browserMode!=='default'||!route.profileId||!Number.isInteger(route.windowId)||options.incognito)throw Error('The original regular browser account, session or window changed.');
  if(!native){
   const boundary=auxBrokerBoundary();boundary.assertOwner();
   native=boundary.captureSelectedBuiltinSession(options.accountId,options.agentSessionId,Buffer.from(JSON.stringify(auxSelectedAccountIdentity(current,route.profileId))));
  }
  native.assertCurrent();native.assertTaskSessionPath(options.sessionStorageDir);controller.signal.throwIfAborted();return native;
 };
 const track=value=>{
  if(value instanceof Promise){pending.add(value);value.then(()=>pending.delete(value),()=>pending.delete(value))}
  return value;
 };
 const state={signal:controller.signal,assertCurrent:capture,awaited(operation){return track(capture().awaited(operation))},disposeBridge(promise){bridgeDisposal=promise?.then(bridge=>bridge.dispose());return bridgeDisposal},
  async close(){
   if(closePromise)return closePromise;
   closing=true;controller.abort(Error('Browser REPL disposed.'));scope.setRunActive(false);
   closePromise=(async()=>{
    while(pending.size)await Promise.allSettled([...pending]);
    raw.dispose();if(bridgeDisposal)await bridgeDisposal;
    for(const fn of mappedFunctions)FUNCTION_SOURCE_ARGUMENTS.delete(fn);
    native?.close();auxBrowserReplStates.delete(state);if(auxBrowserJsOwners.get(options.browser)===state)auxBrowserJsOwners.delete(options.browser);
   })().catch(error=>{auxBrokerBoundary().noteUntracked();throw error});
   return closePromise;
  }
 };
 const unwrap=value=>originals.get(value)??value;
 const guard=value=>{
  if(HOST_DENYLIST.has(value))return undefined;
  if(value===null||typeof value!=='object'&&typeof value!=='function')return value;
  if(value instanceof Promise){const wrapped=value.then(guard);wrapped.catch(()=>{});return wrapped}
  if(value instanceof CdpClient||value instanceof AuxBrowser||ArrayBuffer.isView(value)||value instanceof ArrayBuffer||value instanceof Date||value instanceof URL)return value;
  if(objects.has(value))return objects.get(value);
  if(Array.isArray(value)){const copy=[];objects.set(value,copy);for(const item of value)copy.push(guard(item));return copy}
  if(typeof value==='object'&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)){const copy={};objects.set(value,copy);for(const [key,item]of Object.entries(value))if(key!=='__proto__')copy[key]=guard(item);return copy}
  const proxy=new Proxy(value,{get(target,key){
   if(key==='then'&&!(key in target))return undefined;
   state.assertCurrent();const result=Reflect.get(target,key,target);
   if(HOST_DENYLIST.has(result))return undefined;
   if(typeof result!=='function')return guard(result);
   let cached=functions.get(target);if(!cached)functions.set(target,cached=new Map);
   if(cached.get(key)?.original===result)return cached.get(key).wrapped;
   const wrapped=(...args)=>{
    if(['setInputFiles','uploadFile','saveAs','createReadStream'].includes(String(key))||['screenshot','pdf'].includes(String(key))&&args[0]?.path!==undefined)throw Error('Use an explicitly chosen file/output owner for browser file paths.');
    return guard(state.awaited(()=>Reflect.apply(result,target,args.map(unwrap))));
   };
   if(FUNCTION_SOURCE_ARGUMENTS.has(result)){FUNCTION_SOURCE_ARGUMENTS.set(wrapped,FUNCTION_SOURCE_ARGUMENTS.get(result));mappedFunctions.add(wrapped)}
   cached.set(key,{original:result,wrapped});return wrapped;
  },apply(target,receiver,args){return guard(state.awaited(()=>Reflect.apply(target,unwrap(receiver),args.map(unwrap))))},set(target,key,result){state.assertCurrent();return Reflect.set(target,key,unwrap(result),target)}});
  objects.set(value,proxy);originals.set(proxy,value);return proxy;
 };
 const allowed=new Set(['console','display','sleep','tabs','page','getTabByTargetId','openTab','closeTab','snapshot','annotatedScreenshot','installPageScript','Buffer','TextDecoder','TextEncoder','atob','btoa']);
 for(const name of Reflect.ownKeys(scope.globals))if(!allowed.has(name))delete scope.globals[name];
 // Image bytes are returned directly. No caller path or arbitrary image Worker
 // is introduced by browser-only display; selected file publication is separate.
 scope.globals.display=value=>{
  const outputs=getCurrentReplContext()?.outputs;if(!outputs)return;
  const promise=state.awaited(async()=>{const bytes=imageInputToBuffer(value),mimeType=await detectSupportedImageMimeTypeFromBuffer(bytes);if(!mimeType)throw Error('display expects PNG/JPEG/GIF/WebP image bytes or base64.');return[{type:'image',data:bytes.toString('base64'),mimeType}]});promise.catch(()=>{});outputs.push(promise);
 };
 scope.globals.aux={pdf:new AuxPDFRepl(resolvePdfPath,()=>capture().pdf)};
 scope.globals.listBrowserTabs=()=>sendCommandToExtension({method:'Aux.listTabs',params:{accountId:options.accountId}},options.browser.browserActionRoute?.()??{...options.browser.extensionBridgeRoute});
 scope.globals.attachBrowserTab=async targetId=>{
  const record=options.browser.state.tabs.find(tab=>tab.targetId===targetId);
  if(!record||record.ownership!=='owned'&&!record.documentCapability)throw Error('Select the original tab with @tab before attaching it.');
  const page=await options.browser.ensurePage(targetId);options.browser.page=page;await scope.sync();return page;
 };
 scope.globals.attachActiveBrowserTab=async()=>{const tabs=await scope.globals.listBrowserTabs(),active=tabs.items?.find(tab=>tab.active&&tab.windowId===initialRoute.windowId);if(!active)throw Error('No selected active browser tab is available.');return scope.globals.attachBrowserTab(active.targetId)};
 const descriptors=new Map;
 for(const key of Reflect.ownKeys(scope.globals)){
  const original=Object.getOwnPropertyDescriptor(scope.globals,key);let value=original.value;
  const read=()=>guard(original.get?original.get.call(scope.globals):value);
  const write=result=>{state.assertCurrent();if(original.set)original.set.call(scope.globals,unwrap(result));else value=unwrap(result)};
  const descriptor={get:read,set:write,enumerable:true,configurable:true};
  Object.defineProperty(scope.globals,key,descriptor);descriptors.set(key,{descriptor,reset:()=>{if(!['page','tabs'].includes(key))value=original.value}});
 }
 state.restoreGlobals=()=>{for(const key of Reflect.ownKeys(scope.globals))if(!descriptors.has(key))delete scope.globals[key];for(const {descriptor,reset}of descriptors.values())reset();for(const [key,{descriptor}]of descriptors)Object.defineProperty(scope.globals,key,descriptor)};
 raw=new Repl(scope,options.hooks,{loadQuickJS:loadNodeQuickJS,auxBrowserState:state});
 const repl={run(code,runOptions={}){return state.awaited(()=>raw.run(code,{...runOptions,signal:AbortSignal.any([controller.signal,...runOptions.signal?[runOptions.signal]:[]])}))},dispose(){return state.close()}};
 auxBrowserRepls.set(repl,state);auxBrowserReplStates.add(state);auxBrowserJsOwners.set(options.browser,state);
 options.browser.bindSelectedBrowserOwner?.(state);
 auxBrokerBoundary().registerProducerStop(auxCloseBrowserRepls);
 return repl;
}
