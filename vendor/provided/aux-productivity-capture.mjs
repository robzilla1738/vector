export async function captureBoundPage(request,sender,api,fullPage,crop,enabled) {
 let capability;
 try {
  if(!await enabled())throw Error('Screenshot is disabled in Settings.');
  if(!Number.isInteger(sender?.tab?.id)||sender.frameId!==0||!sender.documentId)
   throw Error('Capture must start from the current page.');
  const begin=await api.beginPageSurfaceCapture({tabId:sender.tab.id,documentId:sender.documentId});
  if(!begin?.success||!begin.capability||!begin.targetId)throw Error(begin?.error??'The page changed before capture.');
  capability=begin.capability;
  let dataUrl;
  if(request.mode==='full'){
   const result=await fullPage({targetId:begin.targetId,documentCapability:capability});dataUrl=result.dataUrl;
  }else if(request.mode==='viewport'||request.mode==='area'){
   const result=await api.capturePageSurface({capability});
   if(!result?.success)throw Error(result?.error??'Page capture failed.');
   dataUrl=result.dataUrl;
   if(request.mode==='area'){
    const rect=request.rect;
    if(!rect||![rect.x,rect.y,rect.width,rect.height,request.viewportWidth].every(Number.isFinite)||
       rect.x<0||rect.y<0||rect.width<=0||rect.height<=0||request.viewportWidth<=0||
       rect.x+rect.width>request.viewportWidth||rect.width*rect.height>32*1024*1024)
     throw Error('Select a valid area inside the page.');
    dataUrl=await crop(dataUrl,rect,request.viewportWidth);
   }
  }else throw Error('Unsupported capture mode.');
  if(typeof dataUrl!=='string'||!dataUrl.startsWith('data:image/png;base64,')||dataUrl.length>Math.ceil(16*1024*1024*4/3)+64)
   throw Error('The image exceeds the capture limit; select a smaller area.');
  const current=await api.validatePageSurfaceCapture({capability});
  if(!current?.success)throw Error(current?.error??'The page changed during capture.');
  return {ok:true,dataUrl};
 }catch(error){return {ok:false,error:error instanceof Error?error.message:String(error)}}
 finally {if(capability)await api.cancelPageSurfaceCapture({capability}).catch(()=>{});}
}
function change(text,find,replace,anchors,kind){const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one anchor, got ${count}`);anchors.push({find,replace,kind,count:1});return text.replace(find,replace)}
export function installNativeCaptureListener(api,tabs,enabled,onError){
 if(!api?.onPageCaptureRequested)return;
 api.onPageCaptureRequested.addListener(async target=>{
  try{
   if(!Number.isInteger(target?.tabId)||typeof target.documentId!=="string")throw Error("The screenshot page changed.");
   if(!await enabled())throw Error("Enable Screenshot in Settings to capture this page.");
   await tabs.sendMessage(target.tabId,{type:"capture:open"},{documentId:target.documentId});
  }catch(error){
   const message=(error instanceof Error?error.message:String(error)).replace(/[\x00-\x1f\x7f]/g," ").slice(0,160);
   try{
    const reported=await api.reportPageCaptureError({tabId:target?.tabId,documentId:target?.documentId,error:message});
    if(!reported?.success)onError(reported?.error??message);
   }catch(reportError){onError(reportError instanceof Error?reportError.message:String(reportError));}
  }
 });
}
export function transformAuxCaptureUi({relative,text}){
 const anchors=[];
 if(relative==='background.js'){
  const start=text.indexOf('async function zg(e, t) {'),end=text.indexOf('\nasync function Fg(e)',start);
  if(start<0||end<0)throw Error('Pinned screenshot handler unavailable');
  const original=text.slice(start,end);
  text=change(text,original,`${captureBoundPage.toString()}\n${installNativeCaptureListener.toString()}\ninstallNativeCaptureListener(chrome.auxBrowserPreferences,chrome.tabs,Cs,message=>console.warn("Aux screenshot:",message));\nasync function zg(e,t){return captureBoundPage(e,t,chrome.auxBrowserPreferences,input=>D.capture.fullPage.mutate(input),od,Cs)}`,anchors,'aux-capture-native-document-dispatch');
 }
 if(relative==='assets/capture-result-nUfmrYC9.js'){
  text=change(text,'var i=v(S());','import{n as auxCaptureToast}from"./dist-LyKrHgST.js";var i=v(S());',anchors,'aux-capture-existing-error-toast');
  text=change(text,'n({type:"CAPTURE_RESULT_COPIED"})}catch{}','n({type:"CAPTURE_RESULT_COPIED"})}catch(error){auxCaptureToast.error(error instanceof Error?error.message:"Could not copy screenshot.")}',anchors,'aux-capture-copy-error');
  text=change(text,'x=()=>{try{const r=URL.createObjectURL(f(m)),c=document.createElement("a");c.href=r,c.download=$(),c.click(),URL.revokeObjectURL(r),n({type:"CAPTURE_RESULT_DOWNLOAD"})}catch{}}',
   'x=async()=>{try{await chrome.downloads.download({url:m,filename:$(),saveAs:!0}),n({type:"CAPTURE_RESULT_DOWNLOAD"})}catch(error){if(!/cancel/i.test(String(error?.message??error)))auxCaptureToast.error(error instanceof Error?error.message:"Could not save screenshot.")}}',anchors,'aux-capture-native-save-dialog');
 }
 return {text,anchors};
}
export function transformAuxCaptureDaemon({text}){
 const anchors=[],patch=(find,next,kind)=>{text=change(text,find,next,anchors,kind)};
 patch('async function withCaptureCdpSession(Cn,ei){','async function withCaptureCdpSession(Cn,ei,auxCapability){if(!auxCapability)throw new Error("A current native page capture is required.");','aux-capture-require-native-capability');
 patch('await globalCdpClient.send(`Page.enable`,void 0,ti),await globalCdpClient.send(`Runtime.enable`,void 0,ti),await ei(ti)',
  'await globalCdpClient.send(`Page.enable`,void 0,ti,{auxDocumentCapability:auxCapability}),await globalCdpClient.send(`Runtime.enable`,void 0,ti),await ei(ti)','aux-capture-bind-native-cdp-document');
 for(const name of ['captureFullPage','captureViewport']){
  const start=text.indexOf(`async function ${name}({targetId:Cn})`);
  const end=text.indexOf('async function ',start+15);
  if(start<0||end<0)throw Error(`${name}: supplied function not found`);
  const original=text.slice(start,end);
  if(!original.endsWith('})}'))throw Error(`${name}: unexpected supplied closing shape`);
  const next=original.replace('({targetId:Cn})','({targetId:Cn,documentCapability:auxCapability})').slice(0,-3)+'},auxCapability)}';
  patch(original,next,`aux-capture-${name}-scope`);
 }
 const route='captureRouter=router({fullPage:publicProcedure.input(object({targetId:string$3().min(1)})).mutation(async({input:Cn})=>captureFullPage(Cn)),viewport:publicProcedure.input(object({targetId:string$3().min(1)})).mutation(async({input:Cn})=>captureViewport(Cn))})';
 patch(route,route.replaceAll('targetId:string$3().min(1)','targetId:string$3().min(1),documentCapability:string$3().uuid()'),'aux-capture-route-document-contract');
 patch('fi=planVerticalTiles({viewportH:ai,contentH:di,dpr:ci});try{','fi=planVerticalTiles({viewportH:ai,contentH:di,dpr:ci});if(ui*di*ci*ci>32*1024*1024)throw new Error("This page is too large; capture a smaller area.");try{','aux-capture-full-page-pixel-bound');
 // The original page can restore its own transient capture styling when hidden,
 // without issuing a new cross-document CDP write after the native lease expires.
 patch('      style.textContent = ${JSON.stringify(STITCH_BASE_CSS)};\n    })()`);let ei=[];',
  '      style.textContent = ${JSON.stringify(STITCH_BASE_CSS)};\n      const cleanup = () => { document.getElementById(${JSON.stringify(STITCH_STYLE_ID)})?.remove(); for(const el of document.querySelectorAll(${JSON.stringify(`[${STITCH_FIXED_ATTR}]`)}))el.removeAttribute(${JSON.stringify(STITCH_FIXED_ATTR)});window.scrollTo(${JSON.stringify(oi)},${JSON.stringify(si)});document.removeEventListener("visibilitychange",hidden);window.removeEventListener("pagehide",cleanup);window.removeEventListener("aux-capture-cleanup",cleanup); }; const hidden=()=>{if(document.hidden)cleanup()};document.addEventListener("visibilitychange",hidden);window.addEventListener("pagehide",cleanup,{once:true});window.addEventListener("aux-capture-cleanup",cleanup,{once:true});\n    })()`);let ei=[];', 'aux-capture-page-owned-interruption-cleanup');
 patch('        document.getElementById(${JSON.stringify(STITCH_STYLE_ID)})?.remove();','        window.dispatchEvent(new Event("aux-capture-cleanup"));\n        document.getElementById(${JSON.stringify(STITCH_STYLE_ID)})?.remove();','aux-capture-page-owned-completion-cleanup');
 return {text,anchors};
}
export function transformAuxCaptureNative({relative,text}){
 const anchors=[];
 if(relative==='chrome/browser/devtools/chrome_devtools_manager_delegate.cc'){
  text=change(text,'#include "chrome/browser/ui/aux_tab_reference_context.h"','#include "chrome/browser/ui/aux_tab_reference_context.h"\n#include "chrome/browser/ui/aux_page_capture.h"',anchors,'aux-capture-native-guard-include');
  text=change(text,'  return GetAuxTabDocumentGuard(actual_target, capability);','  auto guard = GetAuxTabDocumentGuard(actual_target, capability);\n  return guard ? std::move(guard) : GetAuxPageCaptureDocumentGuard(actual_target, capability);',anchors,'aux-capture-native-guard');
 }
 return{text,anchors};
}
