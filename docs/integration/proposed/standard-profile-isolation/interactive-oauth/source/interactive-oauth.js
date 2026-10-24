// Lifetime ownership for the supplied interactive login. A returned auth URL is
// not completion; deleted/expired flow-map entries do not release a login.
function auxCreateInteractiveOAuth({boundary, isClosing, isCandidate, isReviewed, createTransport, context}) {
  let closing = false, stopPromise;
  const pending = new Set(), flows = new Map();
  const retain = promise => {
    pending.add(promise);
    promise.then(() => pending.delete(promise), () => pending.delete(promise));
    return promise;
  };
  const admit = () => {
    if (closing || isClosing()) throw Error('AUX_DAEMON_SHUTTING_DOWN');
    const owner = boundary(); owner.registerProducerStop(auxStopRefreshProducers); return owner;
  };
  function run(operation) {
    const owner = admit();
    return retain(owner.awaited(operation));
  }
  function register(flow, cancel) {
    const owner = admit();
    const reviewed = isCandidate(flow.providerId);
    if (!reviewed) owner.noteUntracked();
    flows.set(flow, {reviewed,cancel});
  }
  function login(flow, operation) {
    const owner = admit(), record = flows.get(flow);
    if (!record) { owner.noteUntracked(); throw Error('Interactive OAuth lifetime missing'); }
    return retain(owner.awaited(async () => {
      try {
        if (!record.reviewed) return await operation();
        let reviewed;
        try { reviewed=await isReviewed(flow.providerId); } catch(error) {owner.noteUntracked();throw error;}
        flow.abortController.signal.throwIfAborted();
        if (!reviewed) { owner.noteUntracked();return await operation(); }
        const scope = createTransport(flow.abortController.signal, () => owner.noteUntracked());
        try {
          const result = await context.run(scope, operation);
          if (!scope.requests) { owner.noteUntracked(); throw Error('Reviewed OAuth transport was not used'); }
          return result;
        } finally { await scope.close(); }
      } finally { flows.delete(flow); }
    }));
  }
  function stop() {
    if (stopPromise) return stopPromise;
    closing = true;
    // Abort before any await: no map deletion, HTTP reply or timeout is a drain.
    for (const [flow,record] of flows) {
      flow.status = 'cancelled';
      flow.abortController.abort(Error('Aux is shutting down'));
      flow.inputDeferred?.reject(Error('OAuth prompt cancelled'));
      try { const cancelled=Promise.resolve(record.cancel());cancelled.catch(()=>boundary().noteUntracked());retain(cancelled); }
      catch (error) { boundary().noteUntracked(); }
    }
    stopPromise = (async () => {
      while (pending.size) {
        const outcomes = await Promise.allSettled([...pending]);
        // Rejected authorization is expected on abort. Physical cleanup records
        // its own uncertainty; an arbitrary provider remains unknown throughout.
        void outcomes;
      }
      flows.clear();
    })();
    return stopPromise;
  }
  return {run,register,login,stop};
}
const auxInteractiveLazyLogins = new WeakMap();
function auxInteractiveProviderCandidate(id) {
  const entry=getOAuthProviderForCredential(id);
  return !!entry && (id==='anthropic' || id==='github-copilot' ||
    entry===kimiCodeProvider || entry===xaiGrokOAuthProvider);
}
async function auxReviewedInteractiveProvider(id) {
  let provider=getOAuthProviderForCredential(id)?.oauth;
  if (!auxKnownRefreshProvider(provider)) return false;
  // Supplied credentials contain nested lazyOAuth proxies (and Kimi copies a
  // proxy). Resolve only functions registered by that exact original factory.
  for(let depth=0;depth<4;++depth) {
    if (provider===anthropicOAuth && provider.login===loginAnthropic ||
        provider===githubCopilotOAuth && provider.login===loginGitHubCopilot ||
        provider===kimiCodingOAuth && provider.login===loginKimiCoding ||
        provider===xaiOAuth && provider.login===loginXai) return true;
    const load=auxInteractiveLazyLogins.get(provider?.login);
    if(!load)return false;
    provider=await load();
  }
  return false;
}
const auxInteractiveOAuth = auxCreateInteractiveOAuth({
  boundary:auxBrokerBoundary,isClosing:()=>auxDaemonClosing,
  isCandidate:auxInteractiveProviderCandidate,isReviewed:auxReviewedInteractiveProvider,context:auxRefreshIoContext,
  createTransport(signal,unknown) {
    const {Agent,Client,buildConnector}=require_undici$1();
    return auxCreateRefreshIo({fetch,Agent,Client,buildConnector,lookup:auxRefreshDnsLookup,signal,unknown});
  }
});
// node:http close is asynchronous. Retain listening, each accepted socket, each
// response, and the server-close callback, even after the flow map removes it.
function auxOwnOAuthCallbackServer(server, signal, unknown) {
  let closing = false, started = false, listenFailed = false, listenPromise, closePromise;
  const sockets = new Set(), socketLifetimes = new Set(), responses = new Set();
  const retain = (set,promise) => { set.add(promise); promise.then(()=>set.delete(promise)); return promise; };
  server.on('connection', socket => {
    sockets.add(socket);
    retain(socketLifetimes,new Promise(resolve=>socket.once('close',()=>{sockets.delete(socket);resolve();})));
    if (closing || signal.aborted) socket.destroy();
  });
  server.prependListener('request', (request,response) => {
    let finish;
    const promise = new Promise(resolve=>{finish=resolve;});
    const done=()=>{response.removeListener('finish',done);response.removeListener('close',done);finish();};
    response.once('finish',done);response.once('close',done);retain(responses,promise);
  });
  const destroySockets=()=>{for(const socket of sockets)socket.destroy();};
  const onAbort=()=>{destroySockets();close().catch(()=>unknown());};
  // Keep the abort hook until all response/socket callbacks physically settle.
  signal.addEventListener('abort',onAbort,{once:true});
  server.on('error',()=>{if(started)unknown();});
  async function listen(port,host) {
    if (listenPromise || closing || signal.aborted) {
      signal.removeEventListener('abort',onAbort);
      throw Error('OAuth callback admission closed');
    }
    listenPromise=new Promise((resolve,reject)=>{
      const failed=error=>{listenFailed=true;server.removeListener('listening',ready);reject(error);};
      const ready=()=>{started=true;server.removeListener('error',failed);resolve();};
      server.once('error',failed);server.once('listening',ready);
      try {server.listen(port,host);} catch(error){unknown();server.removeListener('error',failed);failed(error);}
    });
    try {
      await listenPromise;
      if(signal.aborted || closing)throw Error('OAuth callback admission closed');
    } catch(error) {await close();throw error;}
  }
  function close() {
    if(closePromise)return closePromise;
    closing=true;
    closePromise=(async()=>{
      // A close before the asynchronous listen callback can report not-running
      // while a late listen still opens the port. Wait for its actual outcome.
      if(listenPromise)await listenPromise.catch(()=>{});
      try {
        if(started) {
          const closed=new Promise((resolve,reject)=>{
            try {server.close(error=>{if(error){unknown();reject(error);}else resolve();});}
            catch(error){unknown();reject(error);}
          });
          closed.catch(()=>{});
          // Preserve the original success/error HTML on ordinary completion;
          // cancellation destroys sockets and their actual close ends responses.
          if(signal.aborted)destroySockets();
          while(responses.size)await Promise.all([...responses]);
          destroySockets();
          const results=await Promise.allSettled([closed,...socketLifetimes]);
          while(socketLifetimes.size)await Promise.all([...socketLifetimes]);
          while(responses.size)await Promise.all([...responses]);
          const failures=results.filter(value=>value.status==='rejected');
          if(failures.length)throw new AggregateError(failures.map(value=>value.reason),'OAuth callback close failed');
        } else if(!listenFailed && sockets.size) {
          unknown();destroySockets();await Promise.all([...socketLifetimes]);
          throw Error('OAuth callback listener outcome unknown');
        }
      } finally {signal.removeEventListener('abort',onAbort);}
    })();
    return closePromise;
  }
  return {listen,close};
}
