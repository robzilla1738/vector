import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {edits:[{replace}]}=JSON.parse(await readFile(new URL('patch.json',import.meta.url)));
async function fixture(windows,tabs,hint){
 const calls=[];
 const chrome={runtime:{getURL:()=> 'chrome-extension://fixture/main.html'},
 tabs:{async query(q){calls.push(['query',q]);return tabs.filter(t=>q.windowId===undefined||t.windowId===q.windowId)},async update(id,p){calls.push(['update',id,p]);return tabs.find(t=>t.id===id)},async create(p){calls.push(['createTab',p]);return {id:90,windowId:p.windowId}}},
 windows:{async getAll(){return windows},async create(p){calls.push(['createWindow',p])},async update(id,p){calls.push(['focus',id,p])}}};
 const ic=new Function('chrome','ry',replace+';return ic;')(chrome,path=>'chrome-extension://fixture/main.html#'+path);
 await ic('/u/7/session/fixture',hint);return calls;
}
let c=await fixture([{id:2,type:'normal'}],[],1);
assert(c.some(x=>x[0]==='createWindow'));assert(!c.some(x=>x[0]==='createTab'||x[0]==='query'));
c=await fixture([{id:2,type:'normal'}],[{id:8,windowId:2,url:'chrome-extension://fixture/main.html#/old'}],undefined);
assert(c.some(x=>x[0]==='update'&&x[1]===8));assert(!c.some(x=>x[0]==='createTab'));
c=await fixture([{id:2,type:'normal'},{id:3,type:'normal',focused:true}],[],2);
assert.equal(c.find(x=>x[0]==='createTab')[1].windowId,2);
c=await fixture([],[],1);assert.equal(c.filter(x=>x[0]==='createWindow').length,1);
// Existing hidden/cache metadata is never chosen as a replacement destination.
c=await fixture([{id:9,type:'normal',focused:false}],[{id:3,windowId:9,url:'chrome-extension://fixture/main.html#/cached'}],1);
assert(c.some(x=>x[0]==='createWindow'));assert(!c.some(x=>x[0]==='query'||x[0]==='update'));
console.log('Actual transformed notification routing: stale hint, original reuse, valid hint, no window and no substitute cache passed');
