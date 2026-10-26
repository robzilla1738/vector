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
  const MAX_SCREENSHOT_TEXTURE_SIZE=16384,CAPTURE_SCREENSHOT_TIMEOUT_MS$1=15000,STITCH_STYLE_ID='aux-fullpage-stitch',STITCH_FIXED_ATTR='data-aux-stitch-fixed',STITCH_BASE_CSS='html { scroll-behavior: auto !important; }\naux-capture-toolbar, aux-capture-backdrop, aux-capture-anchor { visibility: hidden !important; }',STITCH_FIXED_CSS='[data-aux-stitch-fixed] { visibility: hidden !important; }';
function planVerticalTiles(Cn){let ei=Cn.viewportH,ti=Cn.contentH;if(ti<=ei)return[{scrollY:0,srcSkipCss:0,destY:0,destH:ti}];let ni=Cn.dpr,ri=Math.ceil(ni>=1?ni:1/ni),ii=Math.max(1,ei-OVERLAP_CSS-ri),ai=Math.max(0,ti-ei),oi=[{scrollY:0,srcSkipCss:0,destY:0,destH:ei}],si=ei,ci=0;for(;si<ti;){let Cn=Math.min(ci+ii,ai);if(Cn===ci)break;ci=Cn;let ni=OVERLAP_CSS,ri=ci+ni,li=Math.min(ei-ni,ti-ri);if(li<=0)break;oi.push({scrollY:ci,srcSkipCss:ni,destY:ri,destH:li}),si=ri+li}return oi}
async function captureFullPage({targetId:Cn,documentCapability:auxCapability}){return withCaptureCdpSession(Cn,async Cn=>{let ei=await globalCdpClient.send(`Page.getLayoutMetrics`,void 0,Cn),ti=ei.cssContentSize??ei.contentSize;if(!ti)throw new TRPCError({code:`INTERNAL_SERVER_ERROR`,message:`Full-page capture could not read layout metrics.`});let ni=await evaluate$1(Cn,`({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    dpr: window.devicePixelRatio
  })`),ri=typeof ni==`object`&&ni?ni:void 0,ii=finitePositive(ri?.innerWidth,0),ai=finitePositive(ri?.innerHeight,1),oi=finiteNumber(ri?.scrollX,0),si=finiteNumber(ri?.scrollY,0),ci=finitePositive(ri?.dpr,1),li=Math.max(1,Math.floor(MAX_SCREENSHOT_TEXTURE_SIZE/ci)),ui=Math.max(1,Math.min(ti.width,li)),di=Math.max(1,Math.min(ti.height,li)),fi=planVerticalTiles({viewportH:ai,contentH:di,dpr:ci});if(ui*di*ci*ci>32*1024*1024)throw new Error("This page is too large; capture a smaller area.");try{await evaluate$1(Cn,`(function() {
      let style = document.getElementById(${JSON.stringify(STITCH_STYLE_ID)});
      if (!style) {
        style = document.createElement('style');
        style.id = ${JSON.stringify(STITCH_STYLE_ID)};
        document.documentElement.appendChild(style);
      }
      style.textContent = ${JSON.stringify(STITCH_BASE_CSS)};
      let cleanupTimer,cleaned=false; const cleanup = () => { if(cleaned)return;cleaned=true;clearTimeout(cleanupTimer);document.getElementById(${JSON.stringify(STITCH_STYLE_ID)})?.remove(); for(const el of document.querySelectorAll(${JSON.stringify(`[${STITCH_FIXED_ATTR}]`)}))el.removeAttribute(${JSON.stringify(STITCH_FIXED_ATTR)});window.scrollTo(${JSON.stringify(oi)},${JSON.stringify(si)});document.removeEventListener("visibilitychange",hidden);window.removeEventListener("pagehide",cleanup);window.removeEventListener("aux-capture-cleanup",cleanup); }; const hidden=()=>{if(document.hidden)cleanup()};document.addEventListener("visibilitychange",hidden);window.addEventListener("pagehide",cleanup,{once:true});window.addEventListener("aux-capture-cleanup",cleanup,{once:true});cleanupTimer=setTimeout(cleanup,45000);
    })()`);let ei=[];for(let[ti,ni]of fi.entries()){await evaluate$1(Cn,`window.scrollTo(0, ${JSON.stringify(ni.scrollY)})`),await evaluate$1(Cn,`(async () => {
          await new Promise((r) => setTimeout(r, 150));
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        })()`,{awaitPromise:!0});let{data:ri}=await globalCdpClient.send(`Page.captureScreenshot`,{format:`png`,captureBeyondViewport:!1},Cn,{timeoutMs:CAPTURE_SCREENSHOT_TIMEOUT_MS$1});if(!ri)throw new TRPCError({code:`INTERNAL_SERVER_ERROR`,message:`Full-page capture returned no image data.`});ei.push(Uint8Array.from(atob(ri),value=>value.charCodeAt(0))),ti===0&&fi.length>1&&await evaluate$1(Cn,`(function() {
          const style = document.getElementById(${JSON.stringify(STITCH_STYLE_ID)});
          if (style) style.textContent = ${JSON.stringify(`${STITCH_BASE_CSS}\n${STITCH_FIXED_CSS}`)};
          const root = document.documentElement;
          const body = document.body;
          for (const el of document.querySelectorAll('*')) {
            if (el === root || el === body) continue;
            const pos = getComputedStyle(el).position;
            if (pos === 'fixed' || pos === 'sticky') el.setAttribute(${JSON.stringify(STITCH_FIXED_ATTR)}, '');
          }
        })()`)}let ti=ei[0];if(!ti)throw new TRPCError({code:`INTERNAL_SERVER_ERROR`,message:`Full-page capture returned no image data.`});let ni=ti.length>=24?new DataView(ti.buffer,ti.byteOffset,ti.byteLength).getUint32(16):0;return{dataUrl:await composePngTiles({tiles:ei,plan:fi,scaleMultiplier:ii>0?ni/ii:1,pageWidthCss:Math.max(1,ii||ui),pageHeightCss:di})}}finally{await evaluate$1(Cn,`(function() {
        window.dispatchEvent(new Event("aux-capture-cleanup"));
        document.getElementById(${JSON.stringify(STITCH_STYLE_ID)})?.remove();
        for (const el of document.querySelectorAll(${JSON.stringify(`[${STITCH_FIXED_ATTR}]`)})) {
          el.removeAttribute(${JSON.stringify(STITCH_FIXED_ATTR)});
        }
        window.scrollTo(${JSON.stringify(oi)}, ${JSON.stringify(si)});
      })()`).catch(()=>{})}},auxCapability)}async function evaluate$1(Cn,ei,ti){let{result:ni}=await globalCdpClient.send(`Runtime.evaluate`,{expression:ei,returnByValue:!0,awaitPromise:ti?.awaitPromise},Cn);return ni?.value}function finiteNumber(Cn,ei){return typeof Cn==`number`&&Number.isFinite(Cn)?Cn:ei}function finitePositive(Cn,ei){return typeof Cn==`number`&&Number.isFinite(Cn)&&Cn>0?Cn:ei}
  return await captureFullPage(input);
 },false);
}
