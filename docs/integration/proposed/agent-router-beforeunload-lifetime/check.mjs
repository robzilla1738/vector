import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { transformProvidedPendingFiles } from '../../../../scripts/lib/provided-pending-files.mjs';
const root = process.argv[2];
assert(root, 'pass the pinned source snapshot directory');
const path = 'assets/Matches-B99cyGDb.js';
const source = await readFile(`${root}/agent/${path}`, 'utf8');
const {text, anchors} = transformProvidedPendingFiles({component:'agent',path,text:source});
assert.equal(anchors.length, 2);
const snippet = text.slice(text.indexOf('var j="__TSR_index"'), text.indexOf('function zn(t)'));
// Execute the actual transformed history owner, with only browser environment
// dependencies stubbed. No generated replacement of blocker logic.
const createHistory = new Function('document', snippet + ';return ye;')({});
const listeners = new Map();
const window = {
  history: {state:{__TSR_key:'fixture'},length:1,pushState(){},replaceState(){},back(){},forward(){},go(){}},
  addEventListener(type, fn) { if(!listeners.has(type)) listeners.set(type,new Set()); listeners.get(type).add(fn); },
  removeEventListener(type, fn) { listeners.get(type)?.delete(fn); }
};
const history = createHistory({window,parseLocation:()=>({state:{__TSR_index:0}})});
const count = () => listeners.get('beforeunload')?.size ?? 0;
const dispatch = () => {const e={preventDefault(){this.prevented=true}};for(const fn of listeners.get('beforeunload')??[])fn(e);return !!e.prevented;};
assert.equal(count(),0);
const pendingRead=()=>{};
window.addEventListener('beforeunload',pendingRead);
const removeFirst=history.block({blockerFn:()=>true});
assert.equal(count(),2); assert.equal(dispatch(),true);
let enabled=false;
const removeDynamic=history.block({blockerFn:()=>true,enableBeforeUnload:()=>enabled});
removeFirst(); assert.equal(count(),2); assert.equal(dispatch(),false);
enabled=true; assert.equal(dispatch(),true);
removeDynamic(); assert.equal(count(),1);
window.removeEventListener('beforeunload',pendingRead); assert.equal(count(),0);
const removeDisabled=history.block({blockerFn:()=>true,enableBeforeUnload:false});
assert.equal(count(),1); assert.equal(dispatch(),false);
removeDisabled(); assert.equal(count(),0);
history.block({blockerFn:()=>true}); history.destroy(); assert.equal(count(),0);
const hash = value => createHash('sha256').update(value).digest('hex');
console.log(JSON.stringify({sourceSHA256:hash(source),outputSHA256:hash(text),anchors:anchors.length,actualHistoryLifecycle:'passed'},null,2));
if(process.argv[3])await writeFile(process.argv[3],text);
