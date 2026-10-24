/** Inlined into the native-authenticated supplied entry; no external selectors. */
export async function auxProvisionBundledMemoryV2(){
 const boundary=auxBrokerBoundary(),roots=auxTaskRoots();
 const check=()=>{
  if(auxMemoryV2SeedStopped)throw Object.assign(Error('Aux memory seed stopped'),{code:'AUX_MEMORY_SEED_STOPPED'});
  boundary.assertOwner();const current=auxTaskRoots();
  if(Object.keys(roots).some(key=>current[key]!==roots[key]))throw Error('Aux memory seed owner changed');
 };
 check();
 if(auxMemoryV2SeedPending){
  if(Object.keys(roots).some(key=>auxMemoryV2SeedRoots[key]!==roots[key]))throw Error('Aux memory seed generation changed');
  return auxMemoryV2SeedPending;
 }
 auxMemoryV2SeedRoots=roots;
 boundary.registerProducerStop(async()=>{
  auxMemoryV2SeedStopped=true;
  try{await auxMemoryV2SeedPending}catch(error){
   // The finite body has finished its awaited cleanup before this catch runs.
   // Other failures remain failures; a stop request alone never settles work.
   if(error?.code!=='AUX_MEMORY_SEED_STOPPED')throw error;
  }
 });
 auxMemoryV2SeedPending=boundary.awaited(()=>seedAuxMemoryV2({
  source:path.resolve(__auxDaemonResources,'../../../../../memory-distribution'),
  home:roots.taskHome,seed:AUX_MEMORY_V2_SEED,check,
 }));
 return auxMemoryV2SeedPending;
}

export async function auxReadBundledMemoryCatalogV2(){
 const boundary=auxBrokerBoundary(),roots=auxTaskRoots();boundary.assertOwner();
 return boundary.awaited(async()=>{
  const fs=await import('node:fs/promises'),{constants}=await import('node:fs');
  const filename=path.resolve(__auxDaemonResources,'../../../../../memory-distribution/memory-catalog.json');
  const file=await fs.open(filename,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  try{
   const before=await file.stat();
   if(!before.isFile()||before.nlink!==1||(before.mode&0o022)||before.size<1||before.size>1048576)throw Error('Unsafe Aux memory catalog');
   const bytes=await file.readFile(),after=await file.stat();
   if(['dev','ino','size','mtimeMs','ctimeMs'].some(key=>before[key]!==after[key]))throw Error('Aux memory catalog changed while reading');
   boundary.assertOwner();const current=auxTaskRoots();
   if(Object.keys(roots).some(key=>current[key]!==roots[key]))throw Error('Aux memory catalog owner changed');
   return bytes.toString('utf8');
  }finally{await file.close()}
 });
}
