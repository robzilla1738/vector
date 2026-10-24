// Only the pinned refresh call graph uses this scope. No global fetch mutation.
const auxRefreshIoContext = new AsyncLocalStorage();
function auxCreateRefreshIo({fetch: originalFetch, Agent, Client, buildConnector, lookup, signal, unknown}) {
  let closing = false, closePromise, requests = 0;
  const pending = new Set(), sockets = new Set(), clients = new Set(), destroyers = new Map();
  const retain = promise => {
    pending.add(promise);
    promise.then(() => pending.delete(promise), () => pending.delete(promise));
    return promise;
  };
  const destroy = client => {
    if (!destroyers.has(client)) {
      let promise;
      try { promise = Promise.resolve(client.destroy()); }
      catch (error) { promise = Promise.reject(error); }
      promise.catch(() => unknown()); destroyers.set(client, promise);
    }
    return destroyers.get(client);
  };
  const cancel = () => {
    for (const socket of sockets) socket.destroy(Error('Aux refresh transport stopped'));
    for (const client of clients) destroy(client);
  };
  const connector = buildConnector({allowH2:false, lookup(...args) {
    const callback = args.pop();
    if (closing || signal.aborted) { callback(Error('Aux refresh admission closed')); return; }
    let settled; const lifetime = new Promise(resolve => { settled = resolve; }); retain(lifetime);
    try { return lookup(...args, (...values) => { try { callback(...values); } finally { settled(); } }); }
    catch (error) { unknown(); settled(); throw error; }
  }});
  const connect = (options, callback) => {
    if (closing || signal.aborted) { callback(Error('Aux refresh admission closed')); return; }
    let callbackDone; retain(new Promise(resolve => { callbackDone = resolve; }));
    try {
      const socket = connector(options, (...values) => { try { callback(...values); } finally { callbackDone(); } });
      if (!socket || typeof socket.once !== 'function' || typeof socket.destroy !== 'function') throw Error('Refresh connector socket unavailable');
      sockets.add(socket);
      retain(new Promise(resolve => socket.once('close', () => { sockets.delete(socket); resolve(); })));
      if (closing || signal.aborted) socket.destroy(Error('Aux refresh transport stopped'));
      return socket;
    } catch (error) { unknown(); callbackDone(); throw error; }
  };
  const agent = new Agent({allowH2:false, factory(origin, options) {
    if (closing || signal.aborted) throw Error('Aux refresh admission closed');
    const client = new Client(origin, {...options, allowH2:false, connect}); clients.add(client); return client;
  }});
  signal.addEventListener('abort', cancel, {once:true});
  function fetchOwned(input, init={}) {
    if (closing || signal.aborted) return Promise.reject(Error('Aux refresh admission closed'));
    ++requests;
    return retain((async () => {
      const response = await originalFetch(input, {...init, dispatcher:agent,
        signal:init.signal ? AbortSignal.any([signal, init.signal]) : signal});
      let reader, complete = false; const chunks = []; let length = 0;
      try {
        if (response.body) {
          reader = response.body.getReader();
          for (;;) {
            const {done,value} = await reader.read();
            if (done) { complete = true; break; }
            length += value.byteLength;
            if (length > 8 * 1024 * 1024) throw Error('OAuth refresh response exceeds bounded limit');
            chunks.push(value);
          }
        }
        const bytes = new Uint8Array(length); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
        const result = new Response(response.body ? bytes : null,
          {status:response.status,statusText:response.statusText,headers:response.headers});
        for (const key of ['url','redirected','type']) Object.defineProperty(result,key,{value:response[key]});
        return result;
      } finally {
        if (reader) {
          try { if (!complete) await reader.cancel(); }
          catch (error) { unknown(); throw error; }
          finally { reader.releaseLock(); }
        }
      }
    })());
  }
  function close() {
    if (closePromise) return closePromise;
    closing = true; signal.removeEventListener('abort',cancel); cancel();
    closePromise = (async () => {
      const results = await Promise.allSettled([destroy(agent), ...[...clients].map(destroy)]);
      // Client.destroy alone can finish while its connector/DNS is pending.
      // Actual callbacks and socket close events remain retained independently.
      while (pending.size) await Promise.allSettled([...pending]);
      const errors = results.filter(value => value.status === 'rejected').map(value => value.reason);
      if (errors.length) { unknown(); throw new AggregateError(errors,'Refresh transport close failed'); }
    })();
    return closePromise;
  }
  return {fetch:fetchOwned,close,get requests(){return requests;}};
}
function auxRefreshFetch(input, init) {
  const scope = auxRefreshIoContext.getStore();
  return scope ? scope.fetch(input,init) : fetch(input,init);
}
function auxKnownRefreshProvider(provider) {
  return OAUTH_PROVIDERS.some(value => value.oauth === provider) && bundledLoaders &&
    bundledLoaders.anthropic() === anthropicOAuth && bundledLoaders.meta() === metaOAuth &&
    bundledLoaders.githubCopilot() === githubCopilotOAuth && bundledLoaders.openaiCodex() === openaiCodexOAuth &&
    bundledLoaders.kimiCoding() === kimiCodingOAuth && bundledLoaders.xai() === xaiOAuth;
}
async function auxRefreshProducer(provider,credential,signal) {
  if (auxDaemonClosing) throw Error('AUX_DAEMON_SHUTTING_DOWN');
  const boundary=auxBrokerBoundary(); boundary.registerProducerStop(auxStopRefreshProducers);
  const controller=new AbortController; auxRefreshControllers.add(controller);
  try {
    const linked=signal?AbortSignal.any([signal,controller.signal]):controller.signal;
    return await boundary.awaited(async () => {
      if (!auxKnownRefreshProvider(provider)) {
        boundary.noteUntracked(); return await provider.refresh(credential,linked);
      }
      const {Agent,Client,buildConnector}=require_undici$1();
      const scope=auxCreateRefreshIo({fetch,Agent,Client,buildConnector,lookup:auxRefreshDnsLookup,
        signal:linked,unknown:()=>boundary.noteUntracked()});
      try {
        const result=await auxRefreshIoContext.run(scope,()=>provider.refresh(credential,linked));
        if (!scope.requests) { boundary.noteUntracked(); throw Error('Reviewed refresh transport was not used'); }
        return result;
      } finally { await scope.close(); }
    });
  } catch (error) { throw toOAuthRefreshError(error); }
  finally { auxRefreshControllers.delete(controller); }
}
// Retain proper-lockfile's actual callback operations, including a heartbeat
// already in flight when unlock clears its timer. No timer is proof of closure.
function auxCredentialLockIo() {
  const original=require_graceful_fs(), fs=Object.create(original), pending=new Set();
  for (const name of ['realpath','stat','mkdir','rmdir','utimes']) fs[name]=function(...args) {
    const callback=args.pop(); let settled;
    const lifetime=new Promise(resolve=>{settled=resolve;});pending.add(lifetime);
    try { return original[name](...args,(...values)=>{try{callback(...values)}finally{pending.delete(lifetime);settled()}}); }
    catch(error){pending.delete(lifetime);settled();throw error;}
  };
  return {fs,async drain(){while(pending.size)await Promise.allSettled([...pending]);}};
}
async function auxCredentialStoreTransaction(store, callback) {
  return auxBackgroundWriters().run(async()=>{
    if(process.platform==='darwin'&&store.path===ACCOUNTS_JSON_PATH)throw Error('Async account registry transaction unsupported');
    store.ensureFileExists();const io=auxCredentialLockIo();let unlock,compromised=false,failure;
    const assertLock=()=>{if(compromised)throw failure??Error('storage lock was compromised')};
    try {
      unlock=await import_proper_lockfile$1.default.lock(store.path,{fs:io.fs,retries:{retries:10,factor:2,minTimeout:100,maxTimeout:1e4,randomize:!0},stale:3e4,onCompromised:error=>{compromised=true;failure=error}});
      assertLock();const result=await callback(store.readCurrentOrRecover());assertLock();
      if(result.next!==undefined)atomicWriteFileSync(store.path,JSON.stringify(result.next,null,2));assertLock();return result.result;
    } finally {
      try { if(unlock)await unlock(); }
      catch(error){auxBrokerBoundary().noteUntracked();throw error;}
      finally { await io.drain(); }
    }
  });
}
