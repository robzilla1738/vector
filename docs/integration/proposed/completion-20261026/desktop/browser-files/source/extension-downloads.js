async function auxReadBoundDownload(task,params,signal){
 const original=task.downloads.get(params.targetId);if(!original)throw Error('The original attached download tab is unavailable.');
 const current=async()=>{await auxBrowserTaskCurrent(task,signal);if(original.reference)await auxBrowserSelectedReference(task,original.reference,signal)};
 const native=async(method,params)=>{
  await current();
  const carrier=[...task.roots.values()].find(root=>root.tabId===original.tabId)??task.roots.values().next().value;
  if(!carrier)throw Error('The original browser task has no retained debugger connection.');
  await auxBrowserTaskTarget(task,carrier.targetId,signal,!carrier.reference);
  if(carrier.reference)await auxBrowserSelectedReference(task,carrier.reference,signal);
  const result=await auxWorkerPhysical('browser-native-download',()=>chrome.debugger.sendCommand({tabId:carrier.tabId},method,{...params,...carrier.reference?{__auxDocumentCapability:carrier.reference.documentCapability}:{}}),false);
  await current();return result;
 };
 const timeout=params.timeoutMs??30000;if(!Number.isFinite(timeout)||timeout<=0||timeout>600000)throw Error('Download timeout must be at most ten minutes.');
 const deadline=Date.now()+timeout;let item;
 while(!item){
  const result=await native('Aux.listOwnedDownloads',{lease:original.lease});
  item=result.items.find(item=>(params.guid?item.guid===params.guid:item.startedAt>=params.startedAfterMs)&&(!params.expectedFilename||item.filename===params.expectedFilename));
  if(item?.state==='failed')throw Error('The original native download did not complete.');
  if(item?.state!=='complete')item=undefined;
  if(!item){if(Date.now()>=deadline)throw Error('Timed out waiting for the original tab download.');await new Promise(resolve=>setTimeout(resolve,100))}
 }
 const chunks=[];let offset=0,snapshot,size;
 for(;;){
  const result=await native('Aux.readOwnedDownload',{lease:original.lease,guid:item.guid,offset,...snapshot?{snapshot}:{}});
  if(result.offset!==offset||!Number.isSafeInteger(result.nextOffset)||result.nextOffset<offset||result.nextOffset-offset>256*1024||typeof result.data!=='string'||typeof result.snapshot!=='string'||snapshot&&result.snapshot!==snapshot||size!==undefined&&result.size!==size)throw Error('Original native download snapshot changed.');
  snapshot??=result.snapshot;size??=result.size;
  if(!Number.isSafeInteger(size)||size<0||size>64*1024*1024)throw Error('Native download snapshot is too large.');
  chunks.push(result.data);offset=result.nextOffset;
  if(result.eof){if(offset!==size)throw Error('Native download snapshot is incomplete.');break}
  if(offset>=size)throw Error('Native download snapshot did not settle.');
 }
 await current();return {downloadId:item.downloadId,guid:item.guid,filename:item.filename,size,chunks};
}
