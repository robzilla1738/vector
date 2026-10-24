// A shutdown request closes admission immediately, but returns before teardown.
// Its Promise is owned here through every original callback and transport close.
let auxDaemonClosing = false;
function auxCreateDaemonShutdown(deps) {
  const fetches = new Set(), controllers = new Set();
  let closing = false, shutdown, hold;
  const call = callback => {try{return Promise.resolve(callback())}catch(error){return Promise.reject(error)}};
  async function fetch(request, ...rest) {
    if (closing) return new Response('Aux is shutting down', {status:503});
    const control = new URL(request.url).pathname === '/shutdown';
    const controller = new AbortController();
    if (!control) controllers.add(controller);
    const input = control ? request : new Request(request, {signal:AbortSignal.any([request.signal,controller.signal])});
    const pending = call(() => deps.fetch(input,...rest));
    fetches.add(pending);
    try{return await pending}finally{fetches.delete(pending);controllers.delete(controller)}
  }
  function closeWebSockets(server) {
    if (!server) return Promise.resolve();
    const clients = [...server.clients];
    const waiting = clients.map(client => new Promise((resolve,reject) => {
      if (client.readyState === 3) {resolve();return}
      client.once('close',resolve);
      // Termination requests cancellation. Only the actual close event settles.
      try{client.terminate()}catch(error){reject(error)}
    }));
    waiting.push(new Promise((resolve,reject) => {
      try{server.close(error => error ? reject(error) : resolve())}catch(error){reject(error)}
    }));
    return settled(waiting,'Aux websocket shutdown failed');
  }
  function closeHttp(server) {
    if (!server) return Promise.resolve();
    return new Promise((resolve,reject) => {
      try {
        server.close(error => error ? reject(error) : resolve());
        server.closeIdleConnections?.();
      } catch(error){reject(error)}
    });
  }
  async function settled(promises,message) {
    const results=await Promise.allSettled(promises);
    const errors=results.filter(result=>result.status==='rejected').map(result=>result.reason);
    if(errors.length)throw new AggregateError(errors,message);
  }
  function start() {
    if(shutdown)return shutdown;
    closing=true;auxDaemonClosing=true;deps.closeReadiness();deps.clearBootstrapTimer();
    // Retain the JS/native owner if a callback is lost or an outcome is unknown.
    // This interval is NOT a timeout, completion receipt or forced exit.
    hold=deps.hold();
    for(const controller of controllers)controller.abort(Error('Aux is shutting down'));
    const transports=[closeWebSockets(deps.websockets()),closeHttp(deps.http())];
    for(const promise of transports)promise.catch(()=>{});
    // Invoke stops synchronously so no new callback is admitted between gates.
    const stops=[call(deps.stopIntervals),call(deps.stopRefresh),call(deps.stopProductivity),
      call(deps.stopChannels),call(deps.stopOutbox),call(deps.stopBackground),call(deps.stopComputerUse),
      call(deps.stopCoder),call(deps.terminateExec),call(deps.killCommands)];
    shutdown=(async()=>{
      await settled([...stops,call(deps.bootstrap)],'Aux producers did not settle');
      while(fetches.size)await settled([...fetches],'Aux HTTP work did not settle');
      await settled(transports,'Aux transport did not close');
      // Telemetry is a producer too; close it while admitted cleanup can write.
      await deps.stopTelemetry();
      await deps.closeBroker();
      deps.releaseHold(hold);hold=undefined;
      // Only now can NativeRun return to the retained host's real settlement loop.
      deps.exit();
    })();
    shutdown.catch(error=>{deps.unknown(error)});
    return shutdown;
  }
  return Object.freeze({fetch,start,isClosing:()=>closing});
}
// Exact original channel outbox producers; not an arbitrary callback registry.
const auxChannelOutboxWork = new Set(), auxChannelStreams = new Set();
function auxRunChannelOutbox(callback) {
  if(auxDaemonClosing)return Promise.reject(Error('AUX_CHANNEL_ADMISSION_CLOSED'));
  const pending=auxBrokerBoundary().awaited(callback);
  auxChannelOutboxWork.add(pending);
  pending.then(()=>auxChannelOutboxWork.delete(pending),()=>auxChannelOutboxWork.delete(pending));
  return pending;
}
function auxOpenChannelStream(factory, close) {
  if(auxDaemonClosing)throw Error('AUX_CHANNEL_ADMISSION_CLOSED');
  const record={close,promise:auxRunChannelOutbox(factory)};
  auxChannelStreams.add(record);
  record.promise.then(()=>auxChannelStreams.delete(record),()=>auxChannelStreams.delete(record));
  return record.promise;
}
async function auxStopChannelOutbox() {
  if(typeof retryTimers!=='undefined'){
    for(const timer of retryTimers.values())clearTimeout(timer);
    retryTimers.clear();
  }
  const errors=[];
  for(const stream of auxChannelStreams)try{stream.close()}catch(error){errors.push(error)}
  while(auxChannelOutboxWork.size){
    const results=await Promise.allSettled([...auxChannelOutboxWork]);
    for(const result of results)if(result.status==='rejected')errors.push(result.reason);
  }
  if(errors.length)throw new AggregateError(errors,'Aux channel outbox did not settle');
}
