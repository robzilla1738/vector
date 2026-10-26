import fs from 'node:fs';import assert from 'node:assert/strict';
import {transformAuxShortcutRepeatFocus as transform} from './renderer-transform.mjs';
const relative='assets/use-shortcut-capture-DGr8Ws5Z.js';
const before=fs.readFileSync(new URL('./baseline/'+relative,import.meta.url),'utf8'),after=fs.readFileSync(new URL('./source/'+relative,import.meta.url),'utf8');
assert.equal(transform({relative,text:before}).text,after);
const handler=after.match(/u=(\(\)=>\{a\(previous=>previous==="idle"\?"preparing":previous\)\}),n=/)?.[1];assert(handler);
let state='idle';const focus=Function('a','return '+handler)(update=>{state=typeof update==='function'?update(state):update});
focus();assert.equal(state,'preparing');focus();assert.equal(state,'preparing');state='ready';focus();assert.equal(state,'ready');state='idle';focus();assert.equal(state,'preparing');
console.log('PASS actual focus handler: idle starts capture; preparing/ready repeat focus is idempotent; blur permits new capture');
