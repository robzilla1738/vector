// Pinned actual producers only. No owner selector or synthetic drain flag.
async function auxStopSyncProducers(){
 const waiting=[];
 if(typeof runtimes!=='undefined')for(const [id,runtime] of [...runtimes]){
  runtime.generation+=1;
  if(runtime.debounce)clearTimeout(runtime.debounce);
  if(runtime.poll)clearInterval(runtime.poll);
  if(runtime.cookiePoll)clearInterval(runtime.cookiePoll);
  runtime.stopCookieTriggers?.();runtime.stopCookieTriggers=null;
  runtimes.delete(id);
  // Original queue error handling is preserved; prior unknown native custody
  // covers generic sync operations, even if this swallowed error appears done.
  waiting.push(runtime.queue);
  if(runtime.watcher)waiting.push(runtime.watcher.close());
 }
 if(typeof runtimes$1!=='undefined')for(const [id,runtime] of [...runtimes$1]){
  runtime.stopping=true;runtime.restart=false;
  // Original stop aborts active fetch, clears interval and awaits active tick.
  waiting.push(Promise.resolve().then(()=>runtime.stop()).then(()=>{
   if(runtimes$1.get(id)===runtime)runtimes$1.delete(id);
  }));
 }
 const results=await Promise.allSettled(waiting);
 const errors=results.filter(result=>result.status==='rejected').map(result=>result.reason);
 if(errors.length)throw new AggregateError(errors,'Aux sync producer shutdown did not complete');
}
const auxRefreshControllers=new Set;
function auxStopRefreshProducers(){for(const controller of auxRefreshControllers)controller.abort(Error('Aux is shutting down'))}
async function auxRefreshProducer(provider,credential,signal){
 const boundary=auxBrokerBoundary();boundary.registerProducerStop(auxStopRefreshProducers);
 // Arbitrary provider.refresh can spawn work beyond its returned promise.
 // Abort and settlement never clear this strongest native uncertainty.
 boundary.noteUntracked();
 const controller=new AbortController;auxRefreshControllers.add(controller);
 try{
  const linked=signal?AbortSignal.any([signal,controller.signal]):controller.signal;
  return await boundary.awaited(()=>provider.refresh(credential,linked));
 }catch(error){throw toOAuthRefreshError(error)}finally{auxRefreshControllers.delete(controller)}
}
