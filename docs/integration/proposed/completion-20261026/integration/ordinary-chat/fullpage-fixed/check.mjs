import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('./composed.js',import.meta.url),'utf8');
async function run(stale=false,cancel=false){
 let valid=true,attached=false,detached=false,handler,pendingReject,resolvePending;
 const pending=new Promise(r=>resolvePending=r),calls=[];
 const png=Buffer.alloc(24);png.writeUInt32BE(100,16);png.writeUInt32BE(100,20);
 const api={validatePageSurfaceCapture:async()=>({success:valid})};
 const chrome={auxBrowserPreferences:api,auxAccount:{onProfileContextChanged:{addListener:h=>handler=h,removeListener:()=>handler=null}},debugger:{attach:async source=>{assert.equal(source.tabId,42);attached=true},detach:async()=>{assert(attached);detached=true;pendingReject?.(Error('Detached'))},sendCommand:async(source,method,params)=>{
  assert.equal(source.tabId,42);assert.equal(params.__auxDocumentCapability,'synthetic-capability');calls.push(method);
  if(stale&&method==='Page.enable')valid=false;
  if(method==='Page.getLayoutMetrics')return {cssContentSize:{width:100,height:100}};
  if(method==='Runtime.evaluate')return {result:{value:params.expression.includes('innerWidth:')?{innerWidth:100,innerHeight:100,scrollX:0,scrollY:0,dpr:1}:undefined}};
  if(method==='Page.captureScreenshot'){if(cancel)return new Promise((_,reject)=>{pendingReject=reject;resolvePending()});return {data:png.toString('base64')}}return {};
 }}};
 const context=vm.createContext({chrome,auxWorkerPhysical:(_k,f)=>f(),auxWorkerNoteUnknown:()=>{throw Error('Unexpected unknown settlement')},OffscreenCanvas:class{getContext(){return {drawImage(){}}}async convertToBlob(){return new Blob([png])}},createImageBitmap:async()=>({width:100,height:100,close(){}}),Blob,Uint8Array,DataView,atob,btoa,setInterval,clearInterval,setTimeout,clearTimeout});
 const fn=vm.runInContext(code+';auxCaptureFullPageFixed',context),operation=fn({targetId:'synthetic-target',documentCapability:'synthetic-capability'},42);
 if(cancel){await pending;valid=false;handler();await assert.rejects(operation,/Detached|changed|cancelled/)}
 else if(stale)await assert.rejects(operation,/changed/);
 else assert.match((await operation).dataUrl,/^data:image\/png;base64,/);
 assert(detached);assert.equal(handler,null);if(stale)assert.deepEqual(calls,['Page.enable']);
}
await run();await run(true);await run(false,true);
console.log('Fixed capture marker, exact tab, stale rejection, cancellation and awaited detach passed.');
