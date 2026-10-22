import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {transformProvidedDraftFlush as transform} from '../../../../scripts/lib/provided-draft-flush.mjs';
const dir=process.argv[2],read=n=>fs.readFileSync(`${dir}/${n}`,'utf8');
const original=read('newtab-editor-u_GbForB.js'),create=read('create-editor-B-Br5Wz9.js');
const result=transform({component:'agent',path:'assets/newtab-editor-u_GbForB.js',text:original});
assert.equal(create.split('f=()=>e.callbacks.onChange?.(y(i.getJSON()))').length-1,1);
assert.equal(create.split('onCreate:()=>f()').length-1,1);
const program=result.text.slice(result.text.indexOf('var R='));
const stored={version:2,plainText:'stored fixture text',attachments:[{type:'file',name:'synthetic.txt'}]};
async function run({typed=false}={}){
 let snapshot={plainText:'',attachments:[],doc:{}},writerDraft=stored,onCreate;
 const events=[],runtime={mention:{},callbacks:{},submit:{},file:{}},input={textContent:'',replaceChildren(){},removeAttribute(){}},tabs={querySelectorAll:()=>[],addEventListener(){}};
 const editor={get isEmpty(){return snapshot.plainText.length===0&&snapshot.attachments.length===0},getJSON:()=>snapshot,state:{doc:{content:{size:2}},tr:{setMeta(){return this},scrollIntoView(){return this}}},view:{dom:{style:{}},dispatch(){},focus(){}},commands:{setTextSelection(){}}};
 const controller={getSnapshot:()=>snapshot,setSnapshot:s=>{snapshot=s;events.push('restore')}};
 const c=vm.createContext({URLSearchParams,location:{search:''},chrome:{extension:{inIncognitoContext:false},tabs:{getCurrent:async()=>({id:17})},auxAccount:{getProfileContext:async()=>({draftPageId:'p_fixture_page_123'})}},window:{addEventListener(){},dispatchEvent(){events.push('ready')},sessionStorage:{getItem:()=>null}},document:{querySelectorAll:()=>[],getElementById:id=>id==='new-tab-editor'?input:id==='new-tab-mode-tabs'?tabs:null,documentElement:{dataset:{}}},y:'new-tab',k:()=>false,I:()=> 'search',v:()=>runtime,x:()=>stored,P:()=>true,D:(initial,write)=>({getDraft:()=>writerDraft,write:r=>{writerDraft=r;return write(r)},flush(){}}),A:x=>x,M:r=>({plainText:r?.plainText??'',attachments:[],doc:r?.doc??{}}),T:{configure:()=>({})},C:x=>x,requestAnimationFrame(){},performance:{mark(){}},Event:class{constructor(type){this.type=type}}});
 c.E=(node,runtime,options)=>{snapshot=options.initialContent;const ec=vm.createContext({e:runtime,i:editor,y:x=>x});vm.runInContext('var f=()=>e.callbacks.onChange?.(y(i.getJSON()));var onCreate=()=>f();',ec);onCreate=ec.onCreate;return {editor,controller}};
 await vm.runInContext(`(async()=>{${program}
})()`,c);
 onCreate(); // Real supplied delayed create callback after callbacks are installed.
 const n=c.window.__asideNewTabEditor;
 if(typed){snapshot={plainText:'user replacement',attachments:[],doc:{}};runtime.callbacks.onChange(snapshot);snapshot={plainText:'',attachments:[],doc:{}};runtime.callbacks.onChange(snapshot)}
 n.subscribe(()=>events.push('subscriber'));
 n.setMode('ask');
 return {snapshot,events,writerDraft};
}
const initial=await run();assert.equal(initial.snapshot.plainText,stored.plainText);assert.ok(initial.events.indexOf('restore')<initial.events.indexOf('subscriber'));
const edited=await run({typed:true});assert.equal(edited.snapshot.plainText,'');assert.equal(edited.events.includes('restore'),false);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');fs.writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify({sourceSha256:hash(original),outputSha256:hash(result.text),createEditorSha256:hash(create),anchors:result.anchors.map(a=>({count:a.count,findSha256:hash(a.find)}))},null,2)+'\n');fs.writeFileSync('/tmp/aux-ntp-create-callback.mjs',result.text);
console.log('PASS: full transformed NTP initialization + supplied delayed onCreate callback preserves first Ask recovery; real edit then clear cancels restoration.');
