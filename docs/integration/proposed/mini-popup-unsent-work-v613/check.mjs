import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {transformProvidedDraftFlush as transform} from '../../../../scripts/lib/provided-draft-flush.mjs';
const file=process.argv[2];assert.ok(file,'Pass frozen minipopup-LkDLFvnq.js');
const source=fs.readFileSync(file,'utf8');
const result=transform({component:'agent',path:'assets/minipopup-LkDLFvnq.js',text:source});
assert.equal(result.anchors.length,6);
assert.throws(()=>transform({component:'agent',path:'assets/minipopup-LkDLFvnq.js',text:result.text}),/anchor changed/);
const storeSource=fs.readFileSync(path.join(path.dirname(file),'draft-storage-ixLojjZ5.js'),'utf8');
const store=transform({component:'agent',path:'assets/draft-storage-ixLojjZ5.js',text:storeSource});
const storeCode=store.text.slice(store.text.indexOf('var l="aside.chat-draft.v2"'),store.text.indexOf('function $(e)'));
const start=result.text.indexOf('k=auxReadMiniDraft('),end=result.text.indexOf(',is=({onHeightChange:',start);
assert.ok(start>0&&end>start);
const helper='var '+result.text.slice(start,end)+';';
function storage(){return {data:new Map,failSet:false,failRemove:false,getItem(k){return this.data.get(k)??null},setItem(k,v){if(this.failSet)throw Error('full');this.data.set(k,v)},removeItem(k){if(this.failRemove)throw Error('unavailable');this.data.delete(k)}}}
function document(local=storage()){
 const listeners=new Set,errors=[],session=storage();
 const c=vm.createContext({window:{localStorage:local,sessionStorage:session,addEventListener:(t,f)=>{assert.equal(t,'beforeunload');listeners.add(f)},removeEventListener:(t,f)=>listeners.delete(f)},Z:{error:x=>errors.push(x)}});
 vm.runInContext(storeCode+';var auxReadMiniDraft=F,auxWriteMiniDraft=J;'+helper,c);
 return {c,local,session,listeners,errors,run:s=>vm.runInContext(s,c)};
}
const key='aside.chat-draft.v2:mini-popup:new';
let d=document();
assert.equal(d.run('k'),null);
assert.equal(d.run('auxSetMiniPopupDraft({version:2,plainText:"saved",attachments:[{type:"file",data:"YQ=="}]})'),true);
assert.equal(d.listeners.size,0);assert.ok(d.local.data.has(key));
let fresh=document(d.local);assert.equal(fresh.run('k.plainText'),'saved');assert.equal(fresh.run('k.attachments[0].data'),'YQ==');
assert.equal(document().run('k'),null); // Separate actual Profile origin.
assert.equal(fresh.run('auxSetMiniPopupMode("incognito")'),true);
assert.equal(fresh.local.data.has(key),false);assert.equal(fresh.session.data.has(key),false);
assert.equal(fresh.listeners.size,1);
fresh.run('auxSetMiniPopupDraft({version:2,plainText:"private"})');
assert.equal(fresh.local.data.size,0);assert.equal(fresh.session.data.size,0);
assert.equal(document(fresh.local).run('k'),null);
assert.equal(fresh.run('auxSetMiniPopupMode("default")'),true);
assert.equal(fresh.listeners.size,0);assert.equal(document(fresh.local).run('k.plainText'),'private');
fresh.local.failRemove=true;
assert.equal(fresh.run('auxSetMiniPopupMode("incognito")'),false);
assert.equal(fresh.run('auxMiniPopupDraftMode'),'default');assert.ok(fresh.errors.length);assert.ok(fresh.listeners.size);
fresh.local.failRemove=false;fresh.run('auxSetMiniPopupDraft(null)');
assert.equal(fresh.listeners.size,0);assert.equal(document(fresh.local).run('k'),null);
fresh.local.failSet=true;
assert.equal(fresh.run('auxSetMiniPopupDraft({version:2,plainText:"retain"})'),false);
assert.equal(fresh.run('k.plainText'),'retain');assert.ok(fresh.listeners.size);
fresh.local.failSet=false;assert.equal(fresh.run('auxSetMiniPopupDraft(k)'),true);assert.equal(fresh.listeners.size,0);
fresh.run('auxSetMiniPopupMode("incognito");auxSetMiniPopupDraft(null)');assert.equal(fresh.listeners.size,0);
assert.equal(fresh.run('auxSetMiniPopupMode("invalid")'),false);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'aux-mini-draft-check-'));
try{for(const [name,text]of [['mini',result.text],['store',store.text]]){const out=path.join(tmp,name+'.mjs');fs.writeFileSync(out,text);execFileSync(process.execPath,['--check',out]);}}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
console.log(JSON.stringify({miniSourceSha256:sha(source),miniOutputSha256:sha(result.text),storeSourceSha256:sha(storeSource),storeOutputSha256:sha(store.text),checks:'module syntax; restart+attachment recovery; profile isolation; private-mode removal/memory-only; normal-mode opt-in; failed-clear mode refusal; failed-save retention/retry; clear; changed anchors'},null,2));
