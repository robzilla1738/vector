// The retained scope owns only the pinned ChatGPT manager/client graph. The
// lockf inherited-FD process remains native-unknown until cohort integration.
function auxCreateChatGPTLifetime({boundary,isClosing,createTransport,ownServer,createServer,handleRequest,probeOrigin,callbackPath,probeTimeout,messageType,ackType}) {
  const controller=new AbortController(), pending=new Set(), brokers=new Map(), flows=new Map();
  let closing=false, stopped;
  const unknown=()=>boundary.noteUntracked();
  const admit=()=>{if(closing||isClosing())throw Error('AUX_CHATGPT_CLOSED');};
  function run(operation) {
    admit();
    // Expected OAuth errors are returned only after the reviewed body has
    // physically drained; native/transport uncertainty is marked separately.
    const work=boundary.awaited(async()=>{try{return {ok:true,value:await operation()};}catch(error){return {ok:false,error};}});
    pending.add(work);work.then(()=>pending.delete(work),()=>pending.delete(work));
    return work.then(result=>{if(!result.ok)throw result.error;return result.value;});
  }
  function request(input,init={}) {
    return run(async()=>{
      const signal=init.signal?AbortSignal.any([controller.signal,init.signal]):controller.signal;
      const scope=createTransport(signal,unknown);
      try{return await scope.fetch(input,init);}finally{await scope.close();}
    });
  }
  function register(flow,cancel) {
    admit();
    const abort=()=>{try{cancel();}catch(error){unknown();}flows.delete(flow);};
    flows.set(flow,abort);flow.abortController.signal.addEventListener('abort',abort,{once:true});
    if(flow.abortController.signal.aborted)abort();
  }
  function release(flow) {
    const abort=flows.get(flow);
    if(abort){flow.abortController.signal.removeEventListener('abort',abort);flows.delete(flow);}
  }
  async function closeBroker(server) {
    const owner=brokers.get(server);
    if(!owner){unknown();throw Error('Unknown ChatGPT broker owner');}
    try{await owner.close();}finally{brokers.delete(server);}
  }
  function listen(host,port) {
    return run(async()=>{
      const server=createServer((request,response)=>{try{handleRequest(request,response);}catch(error){response.statusCode=500;response.end('Internal error');}});
      const owner=ownServer(server,controller.signal,unknown);brokers.set(server,owner);
      try{await owner.listen(port,host);return {server};}
      catch(error){
        await closeBroker(server);
        if(error.code!=='EADDRINUSE')throw Error('Failed to start ChatGPT Subscription callback server');
        if(controller.signal.aborted)throw controller.signal.reason;
        // Same original probe and manual fallback, now with retained DNS,
        // response, socket, client and dispatcher destruction callbacks.
        try{
          const url=new URL(callbackPath(),probeOrigin(host));url.searchParams.set('state','aux-probe.test');
          const response=await request(url,{signal:AbortSignal.timeout(probeTimeout())}),text=await response.text();
          if(!response.ok||!text.includes(messageType())||!text.includes(ackType()))throw Error('Callback broker mismatch');
          return {};
        }catch(error){
          if(controller.signal.aborted)throw controller.signal.reason;
          return {manualPrompt:{message:'ChatGPT sign-in callback port is in use. Complete sign-in in the browser, then paste the redirected URL or authorization code here.',placeholder:probeOrigin('127.0.0.1')+callbackPath()}};
        }
      }
    });
  }
  function stop() {
    if(stopped)return stopped;
    closing=true;controller.abort(Error('Aux is shutting down'));
    for(const [flow,abort] of flows){flow.status='cancelled';flow.abortController.abort();abort();release(flow);}
    stopped=(async()=>{
      const failures=[];
      const closed=await Promise.allSettled([...brokers.keys()].map(closeBroker));
      for(const value of closed)if(value.status==='rejected')failures.push(value.reason);
      while(pending.size)for(const value of await Promise.allSettled([...pending]))if(value.status==='rejected')failures.push(value.reason);
      if(failures.length){unknown();throw new AggregateError(failures,'ChatGPT shutdown did not settle');}
    })();
    return stopped;
  }
  return Object.freeze({run,request,register,release,listen,closeBroker,stop,unknown,admit,signal:controller.signal});
}
let auxChatGPTLifetimeOwner;
function auxChatGPTLifetime() {
  if(!auxChatGPTLifetimeOwner){
    const boundary=auxBrokerBoundary();
    auxChatGPTLifetimeOwner=auxCreateChatGPTLifetime({boundary,isClosing:()=>auxDaemonClosing,
      createTransport(signal,unknown){const {Agent,Client,buildConnector}=require_undici$1();return auxCreateRefreshIo({fetch,Agent,Client,buildConnector,lookup:auxRefreshDnsLookup,signal,unknown});},
      ownServer:auxOwnOAuthCallbackServer,createServer,handleRequest,
      probeOrigin:host=>CALLBACK_HOST_ORIGINS[host],callbackPath:()=>CALLBACK_PATH,
      probeTimeout:()=>CALLBACK_BROKER_PROBE_TIMEOUT_MS,messageType:()=>CALLBACK_MESSAGE_TYPE,ackType:()=>CALLBACK_ACK_MESSAGE_TYPE});
    boundary.registerProducerStop(()=>auxChatGPTLifetimeOwner.stop());
  }
  return auxChatGPTLifetimeOwner;
}
function auxPrepareChatGPTModule(module) {module.configureLifetime(auxChatGPTLifetime());return module;}
