async function auxCaptureFullPageFixed(input,tabId){
 return auxWorkerPhysical('page-full-capture',async()=>{
  if(!Number.isInteger(tabId)||!input?.targetId||typeof input.documentCapability!=='string')throw Error('The original page capture is required.');
  const source={tabId},api=chrome.auxBrowserPreferences,capability=input.documentCapability;
  let attached=false,closed=false,closing,watch,deadline,checkPending;
  const close=()=>closing??=(async()=>{closed=true;if(attached){await auxWorkerPhysical('page-full-capture-detach',()=>chrome.debugger.detach(source));attached=false}})();
  const current=async()=>{
   if(closed)throw Error('The page capture was cancelled.');
   const value=await api.validatePageSurfaceCapture({capability});
   if(closed||value?.success!==true)throw Error('The original page capture changed.');
  };
  const changed=()=>{close().catch(()=>auxWorkerNoteUnknown('page-full-capture-detach'))};
  const allowed=new Set(['Page.enable','Runtime.enable','Page.getLayoutMetrics','Page.captureScreenshot','Runtime.evaluate']);
  const globalCdpClient={send:async(method,params)=>{
   if(!allowed.has(method))throw Error('Unsupported fixed capture command.');
   await current();
   const value=await auxWorkerPhysical('page-full-capture-command',()=>chrome.debugger.sendCommand(source,method,{...params,__auxDocumentCapability:capability}),false);
   await current();return value;
  }};
  const withCaptureCdpSession=async(target,operation,token)=>{
   if(target!==input.targetId||token!==capability)throw Error('The original page capture changed.');
   await current();
   await auxWorkerPhysical('page-full-capture-attach',()=>chrome.debugger.attach(source,'1.3'));attached=true;
   try{
    await current();
    chrome.auxAccount?.onProfileContextChanged?.addListener(changed);
    watch=setInterval(()=>{if(!checkPending&&!closed){checkPending=current().catch(changed).finally(()=>{checkPending=null})}},200);
    deadline=setTimeout(changed,45000);
    await globalCdpClient.send('Page.enable',{});await globalCdpClient.send('Runtime.enable',{});
    return await operation('fixed-page-capture');
   }finally{
    clearInterval(watch);clearTimeout(deadline);chrome.auxAccount?.onProfileContextChanged?.removeListener(changed);
    if(checkPending)await checkPending;
    await close();
   }
  };
  // Original supplied capture algorithm and tiling are inserted below. Only
  // transport and browser-native PNG composition differ from the daemon.
  const TRPCError=class extends Error{constructor(value){super(value.message)}},OVERLAP_CSS=200;
  async function composePngTiles({tiles,plan,scaleMultiplier:scale,pageWidthCss,pageHeightCss}){
   await current();
   const width=Math.max(1,Math.round(pageWidthCss*scale)),height=Math.max(1,Math.round(pageHeightCss*scale));
   if(width*height>32*1024*1024)throw Error('The page image exceeds the capture limit.');
   const canvas=new OffscreenCanvas(width,height),ctx=canvas.getContext('2d');
   if(!ctx)throw Error('PNG composition is unavailable.');
   for(let i=0;i<Math.min(tiles.length,plan.length);i++){
    await current();const tile=await createImageBitmap(new Blob([tiles[i]],{type:'image/png'}));
    try{await current();const row=plan[i],sy=Math.max(0,Math.round(row.srcSkipCss*scale)),dy=Math.max(0,Math.round(row.destY*scale)),w=Math.min(tile.width,width),h=Math.min(Math.round(row.destH*scale),tile.height-sy,height-dy);if(w>0&&h>0)ctx.drawImage(tile,0,sy,w,h,0,dy,w,h)}finally{tile.close()}
   }
   const blob=await canvas.convertToBlob({type:'image/png'});await current();
   if(blob.size>16*1024*1024)throw Error('The page image exceeds the capture limit.');
   const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   return 'data:image/png;base64,'+btoa(binary);
  }
  /* SUPPLIED_ALGORITHM */
  return await captureFullPage(input);
 },false);
}
