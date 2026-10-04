import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import {createValidImageFixture,longImageFilename} from './lib/composer-image-appearance.mjs';
import {captureMountedImageAppearance,captureLongNamedMountedImageAppearance} from './lib/mounted-image-appearance.mjs';
function context(filename='valid-image.png'){
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
test('ordinary mode does not mint a file or issue an action',async()=>assert.deepEqual(await captureMountedImageAppearance({appearanceEnabled:false}),{status:'not-requested'}));
test('fixed PNG is genuine16×16 RGBA and original retained lease disposes idempotently',async()=>{
 const f=await createValidImageFixture();try{const bytes=await readFile(f.path);assert.equal(bytes.length,82);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),16);assert.equal(bytes.readUInt32BE(20),16);assert.deepEqual([...bytes.subarray(24,29)],[8,6,0,0,0]);
 let offset=8,pixels;while(offset<bytes.length){const length=bytes.readUInt32BE(offset),name=bytes.toString('ascii',offset+4,offset+8),data=bytes.subarray(offset+8,offset+8+length);let crc=0xffffffff;for(const value of bytes.subarray(offset+4,offset+8+length)){crc^=value;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}assert.equal((crc^0xffffffff)>>>0,bytes.readUInt32BE(offset+8+length));if(name==='IDAT')pixels=inflateSync(data);offset+=12+length}assert.equal(offset,bytes.length);assert.equal(pixels.length,16*65);for(let row=0;row<16;row++){assert.equal(pixels[row*65],0);for(let col=0;col<16;col++)assert.deepEqual([...pixels.subarray(row*65+1+col*4,row*65+5+col*4)],[54,121,199,255])}await f.validate()}finally{await f.dispose()}await f.dispose();await assert.rejects(readFile(f.path),{code:'ENOENT'});
});
test('mounted original UI flow produces only visual states and no private identity assertion',async()=>{
 const{t,state,captures,paths,records}=context();const result=await captureMountedImageAppearance(t);assert.equal(result.status,'observed-visual-only');assert.equal(result.qualification,'none');assert.equal(result.privateImageIdentity,'unobserved');assert.equal(captures.length,13);assert.equal(state.zoom,null);assert.equal(state.details,false);for(const[,options]of captures){assert.equal(options.windowId,17);assert.ok(options.state.endsWith('visual-only'))}assert.equal(state.attached,false);assert.equal(state.preview,false);assert.deepEqual(t.model.calls,[]);assert.ok(records.some(x=>x.role==='AXCheckBox'));await assert.rejects(readFile(paths[0]),{code:'ENOENT'});
});
test('original preview capture failure preserves primary and uses actual close/remove cleanup',async()=>{
 const{t,state,paths}=context();const primary=new Error('original capture refusal');t.capture=async name=>{if(name==='home-mounted-image-preview')throw primary};await assert.rejects(captureMountedImageAppearance(t),error=>error===primary);assert.equal(state.attached,false);assert.equal(state.preview,false);await assert.rejects(readFile(paths[0]),{code:'ENOENT'});
});
test('retired samePID App and unexpected run refuse subsequent captures and native mutations',async()=>{
 for(const kind of ['owner','run']){const{t,paths,captures,records,snapshots}=context();const panel=t.ax.openPanel;t.ax.openPanel=async path=>{await panel(path);if(kind==='owner')t.app={pid:881};else snapshots['runs.list']=[{runId:'foreign'}]};await assert.rejects(captureMountedImageAppearance(t));assert.equal(captures.length,1);assert.ok(!records.some(x=>x.name==='Attach image'));await assert.rejects(readFile(paths[0]),{code:'ENOENT'})}
});
test('duplicate mounted preview controls refuse; original known UI cleanup still completes',async()=>{
 const{t,state,paths}=context();const query=t.ax.query;t.ax.query=async selector=>{const nodes=await query(selector);return selector.match==='regex'?[...nodes,...nodes]:nodes};await assert.rejects(captureMountedImageAppearance(t));assert.equal(state.attached,false);await assert.rejects(readFile(paths[0]),{code:'ENOENT'});
});
test('changed fixture retains original primary+cleanup lease and exact restored inode retry',async()=>{
 const{t,paths}=context();const panel=t.ax.openPanel,primary=new Error('original chooser failure');let bytes,original,failure;t.ax.openPanel=async path=>{await panel(path);bytes=await readFile(path);original=await lstat(path);await writeFile(path,Buffer.alloc(bytes.length));throw primary};await assert.rejects(captureMountedImageAppearance(t),error=>{failure=error;return error instanceof AggregateError&&error.errors[0]===primary&&error.errors.length===2});const lease=failure.errors[1].ownedImageFixture;assert.ok(lease);assert.equal((await lstat(paths[0])).ino,original.ino);await writeFile(paths[0],bytes);await lease.validate();await lease.dispose();
});
test('unchanged Include checkbox cannot be relabeled as successful exclusion',async()=>{
 const{t,state,captures,paths}=context();const click=t.ax.click;t.ax.click=async selector=>{if(selector.name!=='Use valid-image.png in next reply')await click(selector)};await assert.rejects(captureMountedImageAppearance(t));assert.ok(!captures.some(([name])=>name==='home-mounted-image-excluded'));assert.equal(state.attached,false);await assert.rejects(readFile(paths[0]),{code:'ENOENT'});
});
test('original capture retirement preserves UI cleanup debt without acting on replacement owner',async()=>{
 const{t,records,paths}=context();t.capture=async name=>{if(name==='home-mounted-image-tray')t.app={pid:881}};await assert.rejects(captureMountedImageAppearance(t),error=>error instanceof AggregateError&&error.errors.length===2);assert.ok(!records.some(x=>x.name==='Remove valid-image.png'));await assert.rejects(readFile(paths[0]),{code:'ENOENT'});
});

test('fresh actual channel kind/window/duplicate-key or retired awaited read refuses before UI',async()=>{
 for(const kind of ['private','window','duplicate','retired']){const{t,records,captures}=context();const observe=t.app.observeAppearance;t.app.observeAppearance=async selection=>{const raw=await observe(selection);if(kind==='retired'){t.app={pid:881};return raw}if(kind==='duplicate')return raw.replace('{','{"windowKind":"normal",');const value=JSON.parse(raw);if(kind==='private')value.windowKind='private';else value.windowId=18;return JSON.stringify(value)};await assert.rejects(captureMountedImageAppearance(t));assert.deepEqual(records,[]);assert.deepEqual(captures,[])}
});

test('replacement call ledger cannot conceal original requests after chooser or capture',async()=>{
 for(const phase of ['chooser','capture']){const{t,state,records,paths}=context();const calls=t.model.calls;
  if(phase==='chooser'){const panel=t.ax.openPanel;t.ax.openPanel=async path=>{await panel(path);calls.push({originalOwnedRequest:true});t.model.calls=[]}}else t.capture=async name=>{if(name==='home-mounted-image-tray'){calls.push({originalOwnedRequest:true});t.model.calls=[]}};
  await assert.rejects(captureMountedImageAppearance(t),error=>phase==='capture'?error instanceof AggregateError&&error.errors.length===2:error instanceof Error);
  assert.equal(calls.length,1);assert.notEqual(t.model.calls,calls);
  if(phase==='chooser'){assert.ok(!records.some(x=>x.name==='Attach image'));assert.equal(state.attached,false)}else assert.ok(!records.some(x=>x.name==='Remove valid-image.png'));
  await assert.rejects(readFile(paths[0]),{code:'ENOENT'});
 }
});

test('unobserved zoom and details transitions cannot be labeled as captured success',async()=>{for(const target of ['100%','Zoom image in','Zoom image out','Fit','Image details']){const{t,state,captures,paths}=context();const click=t.ax.click;t.ax.click=async selector=>{if(selector.name!==target)await click(selector)};await assert.rejects(captureMountedImageAppearance(t));assert.equal(state.attached,false);assert.equal(state.preview,false);const refused={'100%':'home-mounted-image-preview-actual-size','Zoom image in':'home-mounted-image-preview-zoom-in','Zoom image out':'home-mounted-image-preview-zoom-restored','Fit':'home-mounted-image-preview-fit-restored','Image details':'home-mounted-image-preview-details-expanded'};assert.ok(!captures.some(([name])=>name===refused[target]));await assert.rejects(readFile(paths[0]),{code:'ENOENT'})}});
test('Preview action retirement preserves original UI debt and never acts through replacement',async()=>{const{t,records,paths}=context();const click=t.ax.click;t.ax.click=async selector=>{await click(selector);if(selector.name==='Zoom image in')t.app={pid:881}};await assert.rejects(captureMountedImageAppearance(t),error=>error instanceof AggregateError&&error.errors.length===2);assert.ok(!records.some(row=>row.name==='Close image preview'||row.name==='Remove valid-image.png'));await assert.rejects(readFile(paths[0]),{code:'ENOENT'})});

test('fixed long filename chooser tray Preview tools and removal preserve full original name and visual limits',async()=>{const{t,state,records,captures,paths}=context(longImageFilename);const result=await captureLongNamedMountedImageAppearance(t);assert.equal(result.qualification,'none');assert.equal(result.privateImageIdentity,'unobserved');assert.equal(captures.length,13);assert.ok(captures.every(([name,options])=>name.startsWith('home-mounted-long-image-')&&options.state.startsWith('home-mounted-long-image-')&&options.windowId===17));assert.ok(paths[0].endsWith('/'+longImageFilename));assert.ok(records.some(row=>row.name===`Use ${longImageFilename} in next reply`));assert.ok(records.some(row=>row.name===`Remove ${longImageFilename}`));const preview=records.find(row=>row.match==='regex');assert.ok(new RegExp(preview.name).test(longImageFilename+'16 × 16'));assert.equal(new RegExp(preview.name).test('valid-image.png16 × 16'),false);assert.equal(state.attached,false);assert.equal(state.preview,false);assert.equal(state.zoom,null);assert.equal(state.details,false);assert.deepEqual(t.model.calls,[]);await assert.rejects(readFile(paths[0]),{code:'ENOENT'})});
