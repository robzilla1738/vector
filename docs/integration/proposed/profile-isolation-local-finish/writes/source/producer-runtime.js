// Private pinned producers; cancellation is not completion or a drain receipt.
const auxLocalDownloads=new Set,auxLocalIntervals=new Set,auxLocalTicks=new Set;
function auxStopLocalDownloads(){for(const controller of auxLocalDownloads)controller.abort(Error('Aux is shutting down'))}
async function auxWithDownload(callback){
 const boundary=auxBrokerBoundary();boundary.registerProducerStop(auxStopLocalDownloads);
 const controller=new AbortController;auxLocalDownloads.add(controller);
 try{return await boundary.awaited(()=>callback(controller.signal))}finally{auxLocalDownloads.delete(controller)}
}
function auxWaitWritable(stream,signal){
 return new Promise((resolve,reject)=>{
  const cleanup=()=>{stream.off('drain',onDrain);stream.off('error',onError);stream.off('close',onClose);signal.removeEventListener('abort',onAbort)};
  const onDrain=()=>{cleanup();resolve()},onError=error=>{cleanup();reject(error)},onClose=()=>onError(Error('Download output closed before drain'));
  const onAbort=()=>{const reason=signal.reason??Error('Download stopped');cleanup();stream.destroy(reason);reject(reason)};
  stream.once('drain',onDrain);stream.once('error',onError);stream.once('close',onClose);signal.addEventListener('abort',onAbort,{once:true});if(signal.aborted)onAbort();
 });
}
async function auxStopLocalIntervals(){
 for(const timer of auxLocalIntervals)clearInterval(timer);auxLocalIntervals.clear();
 const results=await Promise.allSettled([...auxLocalTicks]);
 const failures=results.filter(result=>result.status==='rejected').map(result=>result.reason);
 if(failures.length)throw new AggregateError(failures,'Aux scheduled producers did not stop cleanly');
}
function auxManagedInterval(callback,delay){
 const boundary=auxBrokerBoundary();boundary.registerProducerStop(auxStopLocalIntervals);
 const timer=setInterval(()=>{
  try{boundary.assertOwner()}catch{return}
  boundary.noteUntracked();
  // Exact callback bodies below return their actual existing work promises.
  // Any nested detached work remains covered by the one-way unknown marker.
  let pending;try{pending=boundary.awaited(()=>Promise.resolve(callback()))}catch{return}
  auxLocalTicks.add(pending);pending.then(()=>auxLocalTicks.delete(pending),()=>auxLocalTicks.delete(pending));
 },delay);auxLocalIntervals.add(timer);return timer;
}
function auxWatchFileResource(factory){
 const boundary=auxBrokerBoundary();let resource,resolve,reject,failure;
 const lifetime=boundary.awaited(()=>new Promise((yes,no)=>{
  resolve=yes;reject=no;try{resource=factory();resource.once('error',error=>{failure=error});resource.once('close',()=>failure?reject(failure):resolve())}catch(error){no(error)}
 }));lifetime.catch(()=>{});
 if(!resource)throw Error('Aux file watcher construction failed');
 boundary.registerProducerStop(()=>{resource.close();return lifetime});return resource;
}
const auxZipReaders=new Set,auxStoppedZipReaders=new WeakSet;
async function auxStopZipReaders(){
 for(const record of auxZipReaders){record.stopping=true;if(record.reader){auxStoppedZipReaders.add(record.reader);record.reader.close()}}
 const results=await Promise.allSettled([...auxZipReaders].map(record=>record.lifetime));
 const errors=results.filter(result=>result.status==='rejected').map(result=>result.reason);
 if(errors.length)throw new AggregateError(errors,'ZIP readers did not close cleanly');
}
async function auxOpenZipResource(file){
 const boundary=auxBrokerBoundary();boundary.registerProducerStop(auxStopZipReaders);
 let opened,failed;const ready=new Promise((resolve,reject)=>{opened=resolve;failed=reject});
 const record={reader:null,stopping:false,lifetime:null};auxZipReaders.add(record);
 record.lifetime=boundary.awaited(async()=>{
  try{
   const reader=await openZip(file);record.reader=reader;
   const closure=new Promise((resolve,reject)=>{let failure;reader.on('error',error=>{failure=error});reader.once('close',()=>failure?reject(failure):resolve())});
   // Native open completion can race shutdown. Close the actual new reader
   // before making it available; never leave a newly opened producer running.
   if(record.stopping){auxStoppedZipReaders.add(reader);reader.close();failed(Error('ZIP extraction stopped'))}else opened(reader);
   await closure;
  }catch(error){failed(error);throw error}
 });
 record.lifetime.then(()=>auxZipReaders.delete(record),()=>auxZipReaders.delete(record));return ready;
}
