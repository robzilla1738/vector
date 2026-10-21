import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {transformProvidedDraftFlush as draft} from '../../../../scripts/lib/provided-draft-flush.mjs';
import {transformProvidedPendingFiles as pending} from '../../../../scripts/lib/provided-pending-files.mjs';
const dir=process.argv[2];
const source=fs.readFileSync(`${dir}/draft-storage-ixLojjZ5.js`,'utf8');
const text=draft({component:'agent',path:'assets/draft-storage-ixLojjZ5.js',text:source}).text;
function store(){const m=new Map();return {fail:false,getItem:k=>m.get(k)??null,setItem(k,v){if(this.fail)throw new Error('quota');m.set(k,v)},removeItem(k){if(this.fail)throw new Error('blocked');m.delete(k)}}}
const session=store(),local=store(),listeners=new Set();
const c=vm.createContext({window:{sessionStorage:session,localStorage:local,addEventListener:(t,f)=>listeners.add(f),removeEventListener:(t,f)=>listeners.delete(f)},Date,crypto});
vm.runInContext(text.replace(/import\{[^}]+\}from"[^"]+";/g,'').replace(/export\{[^}]+\};/,''),c);
const one={version:2,plainText:'fixture',attachments:[{id:'a',type:'file',data:'eA==',mimeType:'text/plain',name:'fixture.txt'}]};
assert.equal(c.J('one',one),true);assert.equal(listeners.size,0);
local.fail=true;
const two={...one,plainText:'latest rejected'};
assert.equal(c.J('one',two),false);assert.equal(listeners.size,1);assert.equal(c.F('one').plainText,two.plainText);
assert.equal(c.J('two',two),false);assert.equal(listeners.size,1);
local.fail=false;
assert.equal(c.J('one',one),true);assert.equal(listeners.size,1);
assert.equal(c.J('two',null),true);assert.equal(listeners.size,0);assert.equal(c.F('two'),null);
session.fail=true;assert.equal(c.J('one',null),false);assert.equal(c.F('one'),null);assert.equal(listeners.size,1);
session.fail=false;assert.equal(c.J('one',null),true);assert.equal(listeners.size,0);assert.equal(c.F('one'),null);
// Required stores cannot be silently skipped by optional chaining.
c.window.localStorage=null;
assert.equal(c.J('stable-without-local',one),false);
assert.equal(c.F('stable-without-local').plainText,one.plainText);
c.window.localStorage=local;assert.equal(c.J('stable-without-local',null),true);
c.window.sessionStorage=null;
assert.equal(c.J(undefined,one,'sidepanel-target:transient'),false);
assert.equal(c.J('stable-with-local-only',one),true);
c.window.sessionStorage=session;
assert.equal(c.J(undefined,null,'sidepanel-target:transient'),true);
assert.equal(listeners.size,0);
const pins=[];
for(const name of ['draft-storage-ixLojjZ5.js','sidepanel-CI-CbXmY.js','permission-approval-D-GTf91U.js']){
 const original=fs.readFileSync(`${dir}/${name}`,'utf8');let result=draft({component:'agent',path:`assets/${name}`,text:original});const next=pending({component:'agent',path:`assets/${name}`,text:result.text});
 fs.writeFileSync(`/tmp/aux-recovery-${name}.mjs`,next.text);
 pins.push({path:`assets/${name}`,sourceSha256:crypto.createHash('sha256').update(original).digest('hex'),outputSha256:crypto.createHash('sha256').update(next.text).digest('hex'),anchors:[...result.anchors,...next.anchors].map(a=>({count:a.count,findSha256:crypto.createHash('sha256').update(a.find).digest('hex')}))});
}
fs.writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify(pins,null,2)+'\n');
console.log('PASS: quota failure retains latest scoped record; one listener protects all failures; retry/clear releases only when all saved; failed clear cannot resurrect old text.');
