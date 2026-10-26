import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
let rendererCleanupExpression;
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
  if(method==='Runtime.evaluate'&&params.expression.includes('cleanupTimer=setTimeout'))rendererCleanupExpression=params.expression;
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

assert(rendererCleanupExpression);
for(const normal of [false,true]){
 let timer,cleared=0,removed=0,restored=0,attrsRemoved=0;
 const listeners=new Map;
 const renderer={document:{hidden:false,getElementById:()=>({remove(){removed++}}),querySelectorAll:()=>[{removeAttribute(){attrsRemoved++}}],addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:key=>listeners.delete(key)},window:{scrollTo:(x,y)=>{assert.equal(x,0);assert.equal(y,0);restored++},addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:key=>listeners.delete(key)},setTimeout:(fn,ms)=>{assert.equal(ms,45000);timer=fn;return 1},clearTimeout:id=>{assert.equal(id,1);cleared++}};
 vm.runInNewContext(rendererCleanupExpression,renderer);
 assert(timer);assert.equal(listeners.size,3);
 if(normal)listeners.get('aux-capture-cleanup')();else timer();
 timer();assert.equal(removed,1);assert.equal(attrsRemoved,1);assert.equal(restored,1);assert.equal(cleared,1);assert.equal(listeners.size,0);
}
console.log('Original renderer timeout and normal cleanup restore once and clear timer/listeners.');
