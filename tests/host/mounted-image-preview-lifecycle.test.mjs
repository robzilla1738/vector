import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {captureMountedImageAppearance} from './lib/mounted-image-appearance.mjs';
import {createMountedImagePreviewLifecycle} from './lib/mounted-image-preview-lifecycle.mjs';
function context({loading=false,wrongFocus=false,retire=false}={}){
 const records=[],captures=[];const state={open:true,loading,focus:'close',live:true};const c={close:{name:'Close image preview'},fit:{name:'Fit'},preview:{name:'original16 × 16'},unchanged:async()=>assert.equal(state.live,true),unique:async s=>{assert.equal(state.live,true);return {focused:s===c.close?state.focus==='close':state.focus==='preview',checked:true}},capture:async(n,s)=>{await c.unchanged();captures.push([n,s])},click:async s=>{assert.equal(s,c.preview);await c.unchanged();records.push('same-original-preview');state.open=true;state.focus=wrongFocus?'body':'close'},ax:{windows:async()=>[{layer:0,width:800,height:700}],query:async s=>{assert.equal(s.name,'Loading image…');return state.loading?[{name:s.name}]:[]},waitFor:async(s,mode)=>{if(s===c.close&&mode==='absent')assert.equal(state.open,false);if(s.name==='Loading image…'){state.loading=false;state.focus=wrongFocus?'body':'close'}},key:async(k,via)=>{assert.equal(k,'escape');assert.equal(via,'hid');records.push('escape-hid');state.open=false;state.focus='preview';if(retire)state.live=false}}};return{c,state,records,captures};
}
test('genuine original UI lifecycle uses HID Escape and same retained control, leaves original preview open for parent cleanup',async()=>{const{c,state,records,captures}=context();const x=createMountedImagePreviewLifecycle();await x.afterOpen(c);await x.beforeClose(c);assert.deepEqual(records,['escape-hid','same-original-preview']);assert.equal(state.open,true);assert.equal(x.observations.asyncLoadingFocus,'pending-not-observed');assert.equal(x.observations.reopen,'observed-same-original-ui-control');assert.equal(captures.length,2);assert.ok(captures.every(([,s])=>s.endsWith('visual-only')))});
test('observed loading captures original transition only; no delay or fabricated loading',async()=>{const{c,captures}=context({loading:true});const x=createMountedImagePreviewLifecycle();await x.afterOpen(c);assert.equal(x.observations.asyncLoadingFocus,'observed-original-loading-to-loaded-close-focus');assert.equal(captures.length,2)});
test('loaded BODY focus refuses capture rather than claiming async focus success',async()=>{const{c,captures}=context({loading:true,wrongFocus:true});const x=createMountedImagePreviewLifecycle();await assert.rejects(x.afterOpen(c));assert.equal(captures.length,1);assert.equal(x.observations.asyncLoadingFocus,'pending-not-observed')});
test('retired original owner after Escape prevents same-control mutation and capture',async()=>{const{c,records,captures}=context({retire:true});await assert.rejects(createMountedImagePreviewLifecycle().beforeClose(c));assert.deepEqual(records,['escape-hid']);assert.deepEqual(captures,[])});
test('same original reopened preview wrong focus preserves rejection and has no reopened capture',async()=>{const{c,captures}=context({wrongFocus:true});await assert.rejects(createMountedImagePreviewLifecycle().beforeClose(c));assert.equal(captures.length,1)});

function flowContext(filename='valid-image.png'){
 const records=[],captures=[],paths=[];const snapshots={'pages.list':[],'runs.list':[],'workspace.get':{id:'original'},'settings.get':{modelConfigured:false}};
 const state={attached:false,preview:false,included:true,review:false,focused:true,zoom:null,details:false};
 const t={appearanceEnabled:true,signal:new AbortController().signal,app:{pid:881,observeAppearance:async()=>JSON.stringify({producer:'aux-native-appearance-snapshot',version:1,pid:881,windowId:17,windowKind:'normal',observedAtUnixMs:Date.now()})},model:{calls:[]},rpc:async method=>structuredClone(snapshots[method]),until:async(_name,condition)=>assert.equal(await condition(),true),capture:async(name,options)=>captures.push([name,options]),ax:{pid:881,
  windows:async()=>[{id:17,layer:0,width:800,height:700}],dump:async()=>({sourceFixtureOnly:true}),focus:async()=>{state.focused=true},
  query:async selector=>{
   const n=selector.name;if(n==='Reply to conversation')return [{value:'Original unsent draft',focused:state.focused,enabled:true}];
   if(n===`Remove ${filename}`||n===`Use ${filename} in next reply`)return state.attached?[{enabled:true,checked:state.included}]:[];
   if(selector.match==='regex'&&selector.role==='AXStaticText')return state.preview&&state.details?[{name:'Saved original timestamp',enabled:true}]:[];
   if(selector.match==='regex')return state.attached?[{name:`${filename}16 × 16`,enabled:true}]:[];
   if(n==='Fit'||n==='100%'){assert.equal(selector.role,'AXCheckBox');return state.preview?[{enabled:true,checked:n==='Fit'?state.zoom===null:state.zoom===1}]:[]}
   if(n==='Image details')assert.equal(selector.role,'AXButton');
   if(n==='125%'&&selector.role==='AXStaticText')return state.preview&&state.zoom===1.25?[{name:'125%',enabled:true}]:[];
   if(n==='Close image preview'||(n===filename&&selector.role==='AXImage'))return state.preview?[{enabled:true}]:[];
   return [{enabled:true}];
  },click:async selector=>{records.push(selector);const n=selector.name;
   if(n==='Attach image'){assert.equal(state.review,true);state.attached=true;state.review=false}
   else if(selector.match==='regex')state.preview=true;
   else if(n==='100%')state.zoom=1;
   else if(n==='Fit')state.zoom=null;
   else if(n==='Zoom image in')state.zoom=Math.min(4,(state.zoom??1)+0.25);
   else if(n==='Zoom image out')state.zoom=Math.max(0.25,(state.zoom??1)-0.25);
   else if(n==='Image details')state.details=!state.details;
   else if(n==='Close image preview')state.preview=false;
   else if(n===`Use ${filename} in next reply`)state.included=false;
   else if(n===`Remove ${filename}`)state.attached=false;
  },waitFor:async(selector,mode)=>{if(selector.name&&!['Preparing image…','Loading image…'].includes(selector.name)){const n=await t.ax.query(selector);assert.equal(n.length,mode==='absent'?0:1)}},
  openPanel:async path=>{paths.push(path);assert.equal((await readFile(path)).subarray(0,8).toString('hex'),'89504e470d0a1a0a');state.review=true}
 }};
 return{t,state,records,captures,paths,snapshots};
}

function composed(){const f=flowContext(),query=f.t.ax.query,click=f.t.ax.click;let focus='close';f.t.ax.query=async s=>{if(s.name==='Loading image…')return [];const nodes=await query(s);return nodes.map(n=>({...n,focused:s.name==='Close image preview'?focus==='close':s.match==='regex'&&s.role==='AXButton'?focus==='preview':n.focused}));};f.t.ax.click=async s=>{await click(s);if(s.match==='regex')focus='close';};f.t.ax.key=async(k,via)=>{assert.equal(k,'escape');assert.equal(via,'hid');f.state.preview=false;focus='preview';};return f;}
test('original fixture full composition retains default13 captures plus genuine reopen2 and removes exact owned PNG',async()=>{const f=composed(),l=createMountedImagePreviewLifecycle();const result=await captureMountedImageAppearance(f.t,l);assert.equal(result.privateImageIdentity,'unobserved');assert.equal(f.captures.length,15);assert.equal(l.observations.reopen,'observed-same-original-ui-control');assert.equal(f.state.preview,false);assert.equal(f.state.attached,false);assert.deepEqual(f.t.model.calls,[]);await assert.rejects(readFile(f.paths[0]),{code:'ENOENT'});});
test('original flow reopened capture refusal preserves primary and actual preview/remove/fixture cleanup',async()=>{const f=composed(),primary=new Error('original reopened capture refusal'),capture=f.t.capture;f.t.capture=async(name,options)=>{if(name==='home-mounted-image-preview-reopened')throw primary;return capture(name,options);};await assert.rejects(captureMountedImageAppearance(f.t,createMountedImagePreviewLifecycle()),e=>e===primary);assert.equal(f.state.preview,false);assert.equal(f.state.attached,false);await assert.rejects(readFile(f.paths[0]),{code:'ENOENT'});});

test('observed wide geometry refuses before any Escape or reopened capture',async()=>{const{c,records,captures}=context();c.ax.windows=async()=>[{layer:0,width:1000,height:700}];await assert.rejects(createMountedImagePreviewLifecycle().beforeClose(c));assert.deepEqual(records,[]);assert.deepEqual(captures,[])});
test('actual wrapper keeps normal original13 states and adds narrow reopen only through original UI step',async()=>{const{run}=await import('./appearance-journeys/mounted-image-appearance.mjs');for(const narrowEnabled of [false,true]){const f=composed();f.t.narrowEnabled=narrowEnabled;let receipt;f.t.step=async(name,options,callback)=>{assert.equal(options.kind,'ui');receipt=await callback();};await run(f.t);assert.equal(f.captures.length,narrowEnabled?15:13);assert.equal(receipt.previewLifecycle.reopen,narrowEnabled?'observed-same-original-ui-control':'pending-requires-observed-narrow');assert.equal(receipt.privateImageIdentity,'unobserved');assert.equal(f.state.attached,false);}});
