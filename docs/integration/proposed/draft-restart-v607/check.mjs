import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { transformProvidedDraftFlush } from '../../../../scripts/lib/provided-draft-flush.mjs';
const path = 'assets/draft-storage-ixLojjZ5.js';
const original = fs.readFileSync(process.argv[2], 'utf8');
const adapted = transformProvidedDraftFlush({component:'agent', path, text:original});
const storage = () => {const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
const localStorage=storage();
const open = (durable=localStorage) => {
 const c=vm.createContext({window:{sessionStorage:storage(),localStorage:durable},Date,crypto,console});
 vm.runInContext(adapted.text.replace(/import\{[^}]+\}from"[^"]+";/g,'').replace(/export\{[^}]+\};/,''),c);
 return c;
};
const draft={version:2,plainText:'Disposable draft',attachments:[{id:'fixture',type:'file',name:'fixture.txt',mimeType:'text/plain',data:'eA=='}]};
let c=open(); c.J('session-fixture',draft);c.J(undefined,draft,'sidepanel-target:old');
const page='sidepanel-page:11111111-1111-4111-8111-111111111111';c.J(undefined,draft,page);
c=open();assert.equal(JSON.stringify(c.F(undefined,page)),JSON.stringify(draft));assert.equal(c.F(undefined,'sidepanel-page:22222222-2222-4222-8222-222222222222'),null); assert.equal(JSON.stringify(c.F('session-fixture')),JSON.stringify(draft));
assert.equal(c.F(undefined,'sidepanel-target:old'),null);
assert.equal(c.F(undefined,'sidepanel-target:new'),null);
assert.equal(open(storage()).F('session-fixture'),null);
c.J('session-fixture',null);assert.equal(open().F('session-fixture'),null);
assert.throws(()=>transformProvidedDraftFlush({component:'agent',path,text:original.replace('r?.setItem(s,JSON.stringify(n))','changed')}));
console.log(JSON.stringify({checks:'stable conversation text/attachment restart, transient isolation, separate profile storage, clear, changed-anchor refusal',sourceSha256:crypto.createHash('sha256').update(original).digest('hex'),outputSha256:crypto.createHash('sha256').update(adapted.text).digest('hex'),anchors:adapted.anchors.length}));

const dir=process.argv[2].slice(0,process.argv[2].lastIndexOf('/'));
const pins=[];
for (const name of ['draft-storage-ixLojjZ5.js','browser-binding-CzDmxQNA.js','-components-4o0FSqQ9.js']) {
 const input=fs.readFileSync(`${dir}/${name}`,'utf8');
 const output=transformProvidedDraftFlush({component:'agent',path:`assets/${name}`,text:input});
 // Parse the full adapted module without executing renderer/API code.
 fs.writeFileSync(`/tmp/aux-draft-check-${name}.mjs`,output.text);
 pins.push({path:`assets/${name}`,sourceSha256:crypto.createHash('sha256').update(input).digest('hex'),outputSha256:crypto.createHash('sha256').update(output.text).digest('hex'),anchors:output.anchors.map(x=>({count:x.count,findSha256:crypto.createHash('sha256').update(x.find).digest('hex')}))});
}
fs.writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify(pins,null,2)+'\n');

const componentText=transformProvidedDraftFlush({component:'agent',path:'assets/-components-4o0FSqQ9.js',text:fs.readFileSync(`${dir}/-components-4o0FSqQ9.js`,'utf8')}).text;
const ve=componentText.slice(componentText.indexOf('function Ve('),componentText.indexOf('function y(',componentText.indexOf('function Ve(')));
const migration=open();vm.runInContext('var P="sidepanel-target";'+ve,migration);
migration.J(undefined,draft,'sidepanel-target:old');
const scope=migration.Ve({targetId:'old',draftPageId:'11111111-1111-4111-8111-111111111111'});
assert.equal(scope,page);assert.equal(JSON.stringify(migration.F(undefined,page)),JSON.stringify(draft));
assert.equal(migration.F(undefined,'sidepanel-target:old'),null);
migration.J(undefined,null,page);migration.Ve({targetId:'old',draftPageId:'11111111-1111-4111-8111-111111111111'});
assert.equal(migration.F(undefined,page),null);
console.log('Stable page scopes and one-way migration/clear verified.');
