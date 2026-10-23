// Scheduling/resource custody only; authority remains the native broker boundary.
function auxManagedEvent(emitter,event,callback){
 const boundary=auxBrokerBoundary(), pending=new Set();let stopping=false;
 boundary.assertOwner();
 const unsubscribe=emitter.on(event,(...args)=>{
  if(stopping)return;
  boundary.assertOwner();boundary.noteUntracked();
  const operation=boundary.awaited(()=>callback(...args));pending.add(operation);
  operation.then(()=>pending.delete(operation),()=>pending.delete(operation));return operation;
 });
 boundary.registerProducerStop(async()=>{stopping=true;unsubscribe();const results=await Promise.allSettled([...pending]);const errors=results.filter(v=>v.status==='rejected').map(v=>v.reason);if(errors.length)throw new AggregateError(errors,'Routine listener cleanup failed')});
 return unsubscribe;
}
const auxModelProducers=new Set();let auxModelStopRegistered=false;
function auxControlledModel(controller,callback){
 const boundary=auxBrokerBoundary();boundary.assertOwner();
 if(!auxModelStopRegistered){boundary.registerProducerStop(async()=>{const active=[...auxModelProducers];for(const record of active)record.controller.abort(Error('Aux model producer stopped'));const outcomes=await Promise.allSettled(active.map(record=>record.promise));const errors=outcomes.filter(v=>v.status==='rejected').map(v=>v.reason);if(errors.length)throw new AggregateError(errors,'Model producer cleanup reported failure')});auxModelStopRegistered=true}
 const record={controller,promise:null};auxModelProducers.add(record);
 try{record.promise=boundary.awaited(callback)}catch(error){auxModelProducers.delete(record);throw error}
 record.promise.then(()=>auxModelProducers.delete(record),()=>auxModelProducers.delete(record));return record.promise;
}
function auxManagedTimeout(callback,delay){
 const boundary=auxBrokerBoundary();boundary.assertOwner();let stopped=false,operation;
 const timer=setTimeout(()=>{if(stopped)return;boundary.assertOwner();boundary.noteUntracked();operation=boundary.awaited(callback);operation.catch(()=>{})},delay);
 boundary.registerProducerStop(async()=>{stopped=true;clearTimeout(timer);if(operation)await operation});return timer;
}
