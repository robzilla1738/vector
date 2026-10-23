// Inactive pinned daemon-only broker. Promise completion is accepted ONLY for
// the reviewed finite bodies and concrete resource close observers below.
function auxBrokerBoundary(){
 if(auxBrokerBoundary.cached)return auxBrokerBoundary.cached;
 let binding;
 try{binding=process._linkedBinding('aux_owned_native')}catch{throw Error('AUX_BROKER_NATIVE_UNAVAILABLE')}
 const names=['assertBrokerOwner','withBrokerSync','withBrokerAwaited','closeBrokerWriteAdmission','noteUntrackedBrokerWork'];
 const funcs=Object.fromEntries(names.map(name=>{
  const d=Object.getOwnPropertyDescriptor(binding,name);
  if(!d||!Object.hasOwn(d,'value')||typeof d.value!=='function'||d.writable||d.configurable)throw Error('AUX_BROKER_NATIVE_UNAVAILABLE');
  return[name,d.value.bind(binding)];
 }));
 let closing=false,shutdown,lifetimeFailure,operationFailure;
 const producerStops=new Set,watchers=new Set;
 const operations=new Set,databases=new Set,streams=new Set,producerStreams=new Set,lifetimes=new Set;
 const observeLifetime=promise=>{lifetimes.add(promise);promise.then(()=>lifetimes.delete(promise),error=>{lifetimes.delete(promise);lifetimeFailure??=error});return promise};
 const admit=()=>{if(closing)throw Error('AUX_BROKER_CLOSED');funcs.assertBrokerOwner()};
 const sync=callback=>{admit();return funcs.withBrokerSync(callback)};
 const track=promise=>{operations.add(promise);promise.then(()=>operations.delete(promise),error=>{operations.delete(promise);operationFailure??=error});return promise};
 const awaited=callback=>{admit();return track(funcs.withBrokerAwaited(callback))};
 function iterator(iterator){let proxy;proxy=new Proxy(iterator,{get(target,key){const value=Reflect.get(target,key,target);if(key===Symbol.iterator)return()=>proxy;if(typeof value!=='function')return value;if(!['next','return','throw'].includes(key))throw Error('AUX_BROKER_SQLITE_METHOD_UNREVIEWED');return(...args)=>sync(()=>Reflect.apply(value,target,args));}});return proxy;}
 const statement=raw=>new Proxy(raw,{get(target,key){const value=Reflect.get(target,key,target);if(typeof value!=='function')return value;if(!['run','get','all','iterate','columns','setReadBigInts','setReturnArrays','setAllowBareNamedParameters','setAllowUnknownNamedParameters'].includes(key))throw Error('AUX_BROKER_SQLITE_METHOD_UNREVIEWED');return(...args)=>sync(()=>{const result=Reflect.apply(value,target,args);return key==='iterate'?iterator(result):result;});}});
 function database(factory){
  admit();let raw,resolve,reject,constructionError;
  // Reserve before constructing a native connection; retained until actual
  // synchronous sqlite close returns, including its WAL cleanup.
  const lifetime=funcs.withBrokerAwaited(()=>new Promise((yes,no)=>{resolve=yes;reject=no;try{raw=factory()}catch(error){constructionError=error;no(error)}}));
  observeLifetime(lifetime);
  if(!raw)throw constructionError??Error('AUX_BROKER_DATABASE_CONSTRUCTION_FAILED');
  const record={close(){try{const result=funcs.withBrokerSync(()=>raw.close());databases.delete(record);resolve();return result}catch(error){reject(error);throw error}}};
  databases.add(record);
  return new Proxy(raw,{get(target,key){const value=Reflect.get(target,key,target);if(typeof value!=='function')return value;if(!['exec','prepare','close'].includes(key))throw Error('AUX_BROKER_SQLITE_METHOD_UNREVIEWED');return(...args)=>{admit();if(key==='close')return record.close();return sync(()=>{const result=Reflect.apply(value,target,args);return key==='prepare'?statement(result):result;});}}});
 }
 function logStream(factory,endOnShutdown=true){
  admit();let stream;
  const lifetime=funcs.withBrokerAwaited(()=>new Promise((resolve,reject)=>{
   try{stream=factory();let failure;stream.once('error',error=>{failure=error});stream.once('close',()=>{streams.delete(stream);producerStreams.delete(stream);failure?reject(failure):resolve()})}catch(error){reject(error)}
  }));
  observeLifetime(lifetime);
  if(!stream)throw Error('AUX_BROKER_LOG_CONSTRUCTION_FAILED');
  streams.add(stream);if(!endOnShutdown)producerStreams.add(stream);return stream;
 }
 function registerProducerStop(stop){admit();producerStops.add(stop)}
 function watcher(factory){
  admit();let raw,constructionError,resolve,reject;
  const lifetime=funcs.withBrokerAwaited(()=>new Promise((yes,no)=>{
   resolve=yes;reject=no;try{raw=factory()}catch(error){constructionError=error;no(error)}
  }));
  observeLifetime(lifetime);
  if(!raw)throw constructionError??Error('AUX_BROKER_WATCH_CONSTRUCTION_FAILED');
  const originalClose=raw.close.bind(raw);let closingPromise;
  const record={close(){
   if(closingPromise)return closingPromise;
   // Only actual Chokidar.close is registered here; its result covers closing
   // watchers, never callbacks or work already spawned by their notifications.
   closingPromise=Promise.resolve().then(originalClose).then(value=>{watchers.delete(record);resolve();return value},error=>{reject(error);throw error});
   closingPromise.catch(()=>{});return closingPromise;
  }};
  raw.close=()=>record.close();watchers.add(record);return raw;
 }
 function beginShutdown(){
  if(shutdown)return shutdown;
  closing=true;
  shutdown=(async()=>{
   // Refuse new producer entries first. No timeout/AbortSignal is treated as
   // completion. The outer existing process timeout is NOT a drain receipt.
   // Stop future triggers before awaiting work. Calling these pinned stops
   // does not itself establish native drain; their original closure is awaited.
   const stopResults=await Promise.allSettled([...producerStops].map(stop=>{try{return stop()}catch(error){return Promise.reject(error)}}));
   const watcherResults=await Promise.allSettled([...watchers].map(watcher=>watcher.close()));
   const outcomes=await Promise.allSettled([...operations]);
   let failure=[...stopResults,...watcherResults,...outcomes].find(result=>result.status==='rejected')?.reason??operationFailure;
   if(failure)funcs.noteUntrackedBrokerWork();
   for(const database of [...databases])try{database.close()}catch(error){failure??=error}
   await Promise.all([...streams].map(stream=>new Promise(resolve=>{stream.once('close',resolve);try{if(!producerStreams.has(stream))stream.end()}catch(error){failure??=error;funcs.noteUntrackedBrokerWork();resolve()}})));
   const resourceOutcomes=await Promise.allSettled([...lifetimes]);
   failure??=resourceOutcomes.find(result=>result.status==='rejected')?.reason??lifetimeFailure;
   funcs.closeBrokerWriteAdmission();
   if(failure)throw failure;
  })();
  shutdown.catch(()=>{});return shutdown;
 }
 return auxBrokerBoundary.cached=Object.freeze({assertOwner:admit,sync,awaited,beginShutdown,close:()=>funcs.closeBrokerWriteAdmission(),noteUntracked:()=>funcs.noteUntrackedBrokerWork(),database,logStream,registerProducerStop,watcher,outputStream:factory=>logStream(factory,false)});
}
