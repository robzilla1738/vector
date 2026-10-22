import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {transformProvidedDraftFlush as transform} from '../../../../scripts/lib/provided-draft-flush.mjs';
const dir=process.argv[2];
const input=fs.readFileSync(`${dir}/browser-binding-CzDmxQNA.js`,'utf8');
const adapted=transform({component:'agent',path:'assets/browser-binding-CzDmxQNA.js',text:input});
const start=adapted.text.indexOf('function P(t)'),end=adapted.text.indexOf('function E(t)',start);
const events=()=>({listener:null,addListener(f){this.listener=f},removeListener(f){assert.equal(this.listener,f);this.listener=null}});
const tabs={onActivated:events(),onUpdated:events(),onRemoved:events()};
const deferred=[];const outputs=[];
const c=vm.createContext({chrome:{tabs},m:()=>new Promise(resolve=>deferred.push(resolve)),outputs});
vm.runInContext(adapted.text.slice(start,end),c);
const stop=c.P(x=>outputs.push(x));
const old=tabs.onActivated.listener(),fresh=tabs.onActivated.listener();
deferred[1]({tabId:2});await fresh;deferred[0]({tabId:1});await old;
assert.deepEqual(outputs,[{tabId:2}]);
const pending=tabs.onActivated.listener();stop();deferred[2]({tabId:3});await pending;
assert.deepEqual(outputs,[{tabId:2}]);
const hookInput=fs.readFileSync(`${dir}/use-tab-context-Bi3TKsrh.js`,'utf8');
const hook=transform({component:'agent',path:'assets/use-tab-context-Bi3TKsrh.js',text:hookInput});
// Execute the actual full-context hook with minimal React effect/state seams.
let cleanup,notify,resolveInitial;const states=[];
const hc=vm.createContext({e:{useState:()=>[null,x=>states.push(x)],useEffect:f=>{cleanup=f()}},m:()=>new Promise(r=>resolveInitial=r),b:f=>{notify=f;return()=>{notify=null}}});
const hs=hook.text.indexOf('function R()'),he=hook.text.indexOf('function p(',hs);
vm.runInContext(hook.text.slice(hs,he),hc);hc.R();notify({tabId:2});resolveInitial({tabId:1});await Promise.resolve();
assert.deepEqual(states,[{tabId:2}]);cleanup();
let disposeResolve;hc.m=()=>new Promise(r=>disposeResolve=r);hc.R();cleanup();disposeResolve({tabId:3});await Promise.resolve();
assert.deepEqual(states,[{tabId:2}]);
// The shared initial attachment cache must also reject older snapshots.
const queries=[];
const mc=vm.createContext({chrome:{tabs:{query:()=>new Promise(r=>queries.push(r))},debugger:{getTargets:async()=>[{type:'page',tabId:1,id:'old'},{type:'page',tabId:2,id:'new'}]},auxAccount:{getProfileContext:async id=>({draftPageId:String(id)})}},I:()=>true});
vm.runInContext('var l=null,auxSnapshotGeneration=0;'+adapted.text.slice(adapted.text.indexOf('async function m()'),adapted.text.indexOf('function P(t)')),mc);
const oldSnapshot=mc.m(),newSnapshot=mc.m();queries[1]([{id:2,windowId:1,url:'https://example.test/new'}]);await newSnapshot;queries[0]([{id:1,windowId:1,url:'https://example.test/old'}]);await oldSnapshot;
assert.equal(vm.runInContext('l.targetId',mc),'new');
const pins=[];
for(const [name,original,result] of [['browser-binding-CzDmxQNA.js',input,adapted],['use-tab-context-Bi3TKsrh.js',hookInput,hook]]){
 fs.writeFileSync(`/tmp/aux-context-${name}.mjs`,result.text);
 pins.push({path:`assets/${name}`,sourceSha256:crypto.createHash('sha256').update(original).digest('hex'),outputSha256:crypto.createHash('sha256').update(result.text).digest('hex'),anchors:result.anchors.map(a=>({count:a.count,findSha256:crypto.createHash('sha256').update(a.find).digest('hex')}))});
}
fs.writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify(pins,null,2)+'\n');
console.log('PASS actual source: latest tab wins out-of-order completion; unsubscribed callbacks ignored; initial snapshot cannot replace observed context; unmounted initial load ignored.');
