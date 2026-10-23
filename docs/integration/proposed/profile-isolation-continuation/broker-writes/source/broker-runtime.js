// Sealed daemon-local closure. Only pinned finite synchronous calls below may
// justify completion; arbitrary callbacks can start background work and return.
function auxBrokerBoundary(){
 if(auxBrokerBoundary.cached)return auxBrokerBoundary.cached;
 let binding;
 try{binding=process._linkedBinding('aux_owned_native')}catch{throw Error('AUX_BROKER_NATIVE_UNAVAILABLE')}
 const names=['assertBrokerOwner','withBrokerSync','closeBrokerWriteAdmission','noteUntrackedBrokerWork'];
 const funcs=Object.fromEntries(names.map(name=>{
  const d=Object.getOwnPropertyDescriptor(binding,name);
  if(!d||!Object.hasOwn(d,'value')||typeof d.value!=='function'||d.writable||d.configurable)throw Error('AUX_BROKER_NATIVE_UNAVAILABLE');
  return[name,d.value.bind(binding)];
 }));
 const sync=callback=>funcs.withBrokerSync(callback);
 // Keep each iterator's self-reference private; stepping may execute SQL.
 function iterator(iterator){let proxy;proxy=new Proxy(iterator,{get(target,key){const value=Reflect.get(target,key,target);if(key===Symbol.iterator)return()=>proxy;if(typeof value!=='function')return value;if(!['next','return','throw'].includes(key))throw Error('AUX_BROKER_SQLITE_METHOD_UNREVIEWED');return(...args)=>sync(()=>Reflect.apply(value,target,args));}});return proxy;}
 const statement=raw=>new Proxy(raw,{get(target,key){const value=Reflect.get(target,key,target);if(typeof value!=='function')return value;if(!['run','get','all','iterate','columns','setReadBigInts','setReturnArrays','setAllowBareNamedParameters','setAllowUnknownNamedParameters'].includes(key))throw Error('AUX_BROKER_SQLITE_METHOD_UNREVIEWED');return(...args)=>sync(()=>{const result=Reflect.apply(value,target,args);return key==='iterate'?iterator(result):result;});}});
 const database=raw=>new Proxy(raw,{get(target,key){const value=Reflect.get(target,key,target);if(typeof value!=='function')return value;if(!['exec','prepare','close'].includes(key))throw Error('AUX_BROKER_SQLITE_METHOD_UNREVIEWED');return(...args)=>sync(()=>{const result=Reflect.apply(value,target,args);return key==='prepare'?statement(result):result;});}});
 return auxBrokerBoundary.cached=Object.freeze({assertOwner:()=>funcs.assertBrokerOwner(),sync,close:()=>funcs.closeBrokerWriteAdmission(),noteUntracked:()=>funcs.noteUntrackedBrokerWork(),database:factory=>sync(()=>database(factory()))});
}
