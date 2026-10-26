// Future supervised factory only. Reuse the original Repl, globals and bridge;
// the selected owner is the actual stored session, never a caller root.
const auxSelectedReplStates=new Set;
function auxStopSelectedRepls(){return Promise.allSettled([...auxSelectedReplStates].map(state=>state.close()))}
function auxCreateSelectedDesktopRepl(options){
 auxRequireSupervisedTasks();
 const held=auxCaptureReadFileScope(options);let originalScope;
 try{
  originalScope=createReplScope(options);
  originalScope.globals.fs=auxCreateSelectedReplFs(options,held);
  Object.assign(originalScope.globals,createDesktopReplExtensions({...options,replFs:originalScope.globals.fs,sync:originalScope.sync}));
 }catch(error){held.close().catch(()=>{});throw error}
 const pending=new Set,wrappedObjects=new WeakMap,originals=new WeakMap,mappedFunctions=new Set;
 let raw,closing=false,closePromise,bridgeDisposal,state,abort=()=>{};
 try{
 const assertCurrent=()=>{if(closing)throw Error('The original REPL is closing.');held.signal.throwIfAborted();held.guard.assertCurrent();held.scope.assertCurrent();held.scope.assertTaskSessionPath(options.sessionStorageDir)};
 const track=value=>{if(value instanceof Promise){pending.add(value);value.then(()=>pending.delete(value),()=>pending.delete(value))}return value};
 state={assertCurrent,awaited(operation){assertCurrent();return track(held.scope.awaited(operation))},
  disposeBridge(promise){bridgeDisposal=promise?.then(bridge=>bridge.dispose());return bridgeDisposal},
  close(){
   if(closePromise)return closePromise;
   closing=true;
   closePromise=(async()=>{
    originalScope.setRunActive(false);
    // These are original host/eval Promises, independent of runRepl's cancel
    // race. setRunActive(false) first physically clears original timer handles.
    while(pending.size)await Promise.allSettled([...pending]);
    raw?.dispose();if(bridgeDisposal)await bridgeDisposal;
    for(const fn of mappedFunctions)FUNCTION_SOURCE_ARGUMENTS.delete(fn);
    await held.close();auxSelectedReplStates.delete(state);
    if(auxBrowserJsOwners.get(options.browser)===state)auxBrowserJsOwners.delete(options.browser);
    held.signal.removeEventListener('abort',abort);
   })().catch(error=>{auxBrokerBoundary().noteUntracked();throw error});
   return closePromise;
  }
 };
 abort=()=>{state.close().catch(()=>{})};
 const unwrap=value=>originals.get(value)??value;
 const guard=value=>{
  if(HOST_DENYLIST.has(value))return undefined;
  if(value===null||typeof value!=='object'&&typeof value!=='function')return value;
  if(value instanceof Promise){const promise=value.then(guard);promise.catch(()=>{});return promise}
  if(value instanceof CdpClient||value instanceof AuxBrowser||ArrayBuffer.isView(value)||value instanceof ArrayBuffer||value instanceof Date||value instanceof URL)return value;
  if(wrappedObjects.has(value))return wrappedObjects.get(value);
  if(Array.isArray(value)){const result=[];wrappedObjects.set(value,result);for(const item of value)result.push(guard(item));return result}
  if(typeof value==='object'&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)){
   const result={};wrappedObjects.set(value,result);for(const [key,item]of Object.entries(value))if(key!=='__proto__')result[key]=guard(item);return result;
  }
  const methods=new Map;
  const proxy=new Proxy(value,{
   get(target,key){
    if(key==='then'&&!(key in target))return undefined;
    assertCurrent();const result=Reflect.get(target,key,target);
    if(HOST_DENYLIST.has(result))return undefined;
    if(typeof result!=='function')return guard(result);
    if(methods.get(key)?.original===result)return methods.get(key).wrapped;
    const wrapped=(...args)=>guard(state.awaited(()=>Reflect.apply(result,target,args.map(unwrap))));
    if(FUNCTION_SOURCE_ARGUMENTS.has(result)){FUNCTION_SOURCE_ARGUMENTS.set(wrapped,FUNCTION_SOURCE_ARGUMENTS.get(result));mappedFunctions.add(wrapped)}
    methods.set(key,{original:result,wrapped});return wrapped;
   },
   apply(target,receiver,args){return guard(state.awaited(()=>Reflect.apply(target,unwrap(receiver),args.map(unwrap))))},
   set(target,key,value){assertCurrent();return Reflect.set(target,key,unwrap(value),target)}
  });
  wrappedObjects.set(value,proxy);originals.set(proxy,value);return proxy;
 };
 // Reuse the original scheduler and clear functions. The callback's *original*
 // Promise is held, including when the guest never awaits its timer callback.
 for(const name of ['setTimeout','setInterval']){
  const original=originalScope.globals[name];
  originalScope.globals[name]=(callback,...args)=>original((...values)=>state.awaited(()=>callback(...values)),...args);
 }
 const descriptors=new Map;
 for(const key of Reflect.ownKeys(originalScope.globals)){
  const original=Object.getOwnPropertyDescriptor(originalScope.globals,key);let value=original.value;
  const descriptor={get(){assertCurrent();return guard(original.get?original.get.call(originalScope.globals):value)},
   set(result){assertCurrent();if(original.set)original.set.call(originalScope.globals,unwrap(result));else value=unwrap(result)},enumerable:true,configurable:true};
  Object.defineProperty(originalScope.globals,key,descriptor);
  descriptors.set(key,{descriptor,reset(){if(!['page','tabs'].includes(key))value=original.value}});
 }
 state.restoreGlobals=()=>{
  for(const key of Reflect.ownKeys(originalScope.globals))if(!descriptors.has(key))delete originalScope.globals[key];
  for(const {reset}of descriptors.values())reset();
  for(const [key,{descriptor}]of descriptors)Object.defineProperty(originalScope.globals,key,descriptor);
 };
 raw=new Repl(originalScope,options.hooks,{loadQuickJS:loadNodeQuickJS,auxBrowserState:state});
 const repl={run(code,runOptions={}){return state.awaited(()=>raw.run(code,{...runOptions,signal:AbortSignal.any([held.signal,...runOptions.signal?[runOptions.signal]:[]])}))},dispose(){return state.close()}};
 auxSelectedReplStates.add(state);auxBrowserJsOwners.set(options.browser,state);
 auxBrokerBoundary().registerProducerStop(auxStopSelectedRepls);
 held.signal.addEventListener('abort',abort,{once:true});if(held.signal.aborted)abort();
 return repl;
 }catch(error){if(state)state.close().catch(()=>{});else held.close().catch(()=>{});throw error}
}
