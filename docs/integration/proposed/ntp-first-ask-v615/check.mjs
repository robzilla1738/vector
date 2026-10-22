import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {transformProvidedDraftFlush as transform} from '../../../../scripts/lib/provided-draft-flush.mjs';
const path='assets/newtab-editor-u_GbForB.js',source=fs.readFileSync(`${process.argv[2]}/newtab-editor-u_GbForB.js`,'utf8');
const result=transform({component:'agent',path,text:source});
const body=result.text.slice(result.text.indexOf('setMode:e=>{')+'setMode:'.length,result.text.indexOf(',setSearchPreview:'));
function run({pending=true,empty=true}={}){
 const events=[];
 const context=vm.createContext({auxRestorePending:pending,a:'search',i:{getDraft:()=>({plainText:'saved fixture'}),flush:()=>events.push('flush')},l:()=>{},r:{isEmpty:empty,state:{tr:{setMeta(){return this},scrollIntoView(){return this}}},view:{dispatch:()=>{}}},m:{setSnapshot:(draft,options)=>{events.push(['restore',draft.plainText,options.emitUpdate])}},M:x=>x,s:{mention:{}},document:{documentElement:{dataset:{}}},f:{querySelectorAll:()=>[]},w:()=>events.push('notify')});
 context.setMode=vm.runInContext(`(${body})`,context);return {context,events};
}
const fresh=run();fresh.context.setMode('search');assert.deepEqual(fresh.events,['flush','notify']);fresh.events.length=0;fresh.context.setMode('ask');assert.deepEqual(fresh.events,[['restore','saved fixture',false],'flush','notify']);assert.equal(fresh.context.auxRestorePending,false);
fresh.events.length=0;fresh.context.setMode('search');fresh.context.setMode('ask');assert.equal(fresh.events.some(e=>Array.isArray(e)),false);
const typed=run({pending:false});typed.context.setMode('ask');assert.equal(typed.events.some(e=>Array.isArray(e)),false);
const nonempty=run({empty:false});nonempty.context.setMode('ask');assert.equal(nonempty.events.some(e=>Array.isArray(e)),false);
assert.ok(result.anchors.some(a=>a.replace==='s.callbacks.onChange=e=>{(e.plainText.length>0||e.attachments.length>0)&&(auxRestorePending=!1);a==="ask"'));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');fs.writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify({path,sourceSha256:hash(source),outputSha256:hash(result.text),anchors:result.anchors.map(a=>({count:a.count,findSha256:hash(a.find)}))},null,2)+'\n');
fs.writeFileSync('/tmp/aux-ntp-first-ask.mjs',result.text);
console.log('PASS: first untouched Search→Ask restores before subscriber notification; input changes/nonempty editor prevent restore; restoration is one-shot.');
