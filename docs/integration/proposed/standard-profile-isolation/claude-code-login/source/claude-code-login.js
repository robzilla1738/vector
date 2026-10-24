// Capture the actual supplied inline implementation at initialization, not its
// mutable provider name or a newly supplied replacement function.
const auxClaudeCodeLoginIdentity = new WeakMap();
function auxReviewedClaudeCodeLogin(provider) {
  return !!provider && auxClaudeCodeLoginIdentity.has(provider) &&
    auxClaudeCodeLoginIdentity.get(provider)===provider.login;
}
async function auxStartClaudeCallbackGroup({createServer,handler,hosts,port,signal,
  resolveCode,waitForCode,redirectUri,manualPrompt,ownServer,unknown}) {
  signal.throwIfAborted();
  const records=[], outcomes=[];
  let closePromise;
  const onAbort=()=>resolveCode(null);
  signal.addEventListener('abort',onAbort,{once:true});
  function close() {
    if(closePromise)return closePromise;
    resolveCode(null);
    closePromise=(async()=>{
      try {
        const results=await Promise.allSettled(records.map(record=>record.owner.close()));
        const errors=results.filter(result=>result.status==='rejected').map(result=>result.reason);
        if(errors.length){unknown();throw new AggregateError(errors,'Claude callback close failed');}
      } finally {signal.removeEventListener('abort',onAbort);}
    })();
    return closePromise;
  }
  try {
    // Each owner is recorded before listen. Failure on one address never loses
    // the other address's pending bind, accepted sockets or close callback.
    for(const host of hosts) {
      try {
        const server=createServer(handler),owner=ownServer(server,signal,unknown);
        const record={server,owner};records.push(record);
        outcomes.push(owner.listen(port,host).then(()=>({record}),error=>({error})));
      } catch(error) { outcomes.push(Promise.resolve({error})); }
    }
    const settled=await Promise.all(outcomes);
    signal.throwIfAborted();
    const active=settled.filter(result=>result.record).map(result=>result.record);
    const errors=settled.filter(result=>result.error).map(result=>result.error);
    const portInUse=errors.some(error=>error.code==='EADDRINUSE');
    if(!active.length && !portInUse)throw errors[0]??Error('Failed to start Claude sign-in callback server');
    return {servers:active.map(record=>record.server),redirectUri,
      manualPrompt:portInUse?manualPrompt:undefined,
      waitForCode:active.length?waitForCode:async()=>null,
      cancelWait:()=>resolveCode(null),close};
  } catch(error) {await close();throw error;}
}
async function auxWaitClaudeCodeInput(callback,prompt,signal) {
  const controller=new AbortController;
  const linked=AbortSignal.any([signal,controller.signal]);
  const callbackResult=callback.waitForCode().then(value=>({type:'callback',callback:value}));
  let manualResult;
  try {
    if(prompt)manualResult=Promise.resolve(prompt(linked)).then(input=>({type:'manual',input}));
    return await Promise.race(manualResult?[callbackResult,manualResult]:[callbackResult]);
  } finally {
    // Abort is a request, not settlement. The supplied manager's real prompt
    // promise must settle, and the losing callback wait is explicitly released.
    controller.abort();callback.cancelWait();
    await Promise.allSettled(manualResult?[callbackResult,manualResult]:[callbackResult]);
  }
}
