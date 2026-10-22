import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {edits:[{replace}]}=JSON.parse(await readFile(new URL('../provided-notification-window-routing/patch.json',import.meta.url)));
async function run(mode,hint){
 let windows=[{id:10}],created=0;
 const chrome={runtime:{getURL:()=> 'chrome-extension://fixture/main.html'},windows:{getAll:async()=>windows,create:async p=>{assert.equal(p.incognito,false);++created},update:async()=>{if(mode==='focus-transfer'){windows=[];throw Error('No window')}}},tabs:{query:async()=>mode==='query-close'?(windows=[],[]):[{id:4,windowId:10,url:'chrome-extension://fixture/main.html#/fixture'}],update:async()=>{if(mode==='update-transfer'){windows=[];throw Error('No tab')}if(mode==='policy')throw Error('Policy refused');return{windowId:10}},create:async()=>{throw Error('No window')}}};
 const ic=new Function('chrome','ry',replace+';return ic;')(chrome,p=>'chrome-extension://fixture/main.html#'+p);
 let error;try{await ic('/u/0',hint)}catch(e){error=e}
 return {created,error};
}
for(const mode of ['query-close','update-transfer','focus-transfer']){const r=await run(mode,10);assert.equal(r.created,1,mode);assert.equal(r.error,undefined,mode)}
const denied=await run('policy',10);assert.equal(denied.created,0);assert.match(denied.error.message,/Policy/);
const noHint=await run('update-transfer',undefined);assert.equal(noHint.created,1);assert.equal(noHint.error,undefined);
console.log('Actual supplied routing close/transfer race and surviving-target failure checks passed');
