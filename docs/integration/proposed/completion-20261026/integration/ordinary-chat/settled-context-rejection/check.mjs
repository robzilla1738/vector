import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./owner.js',import.meta.url),'utf8');
let reject,settled=false;
const context=vm.createContext({auxBrowserNativeContext:()=>new Promise((_,fail)=>reject=error=>{settled=true;fail(error)})});
const api=vm.runInContext(source+';({lookup:auxGetBrowserActionContext,known:error=>auxSettledContextRejections.has(error)})',context);
const failure=Error('synthetic predicate refusal'),pending=api.lookup({},null);
assert(!settled);assert(!api.known(failure));reject(failure);await assert.rejects(pending,error=>error===failure);assert(api.known(failure));
assert(!api.known(Error(failure.message)));assert(!api.known({message:failure.message,auxBrowserActionSettled:true}));assert(!api.known('primitive'));
console.log('Only original rejected read-only lookup identity is settled, after awaited completion.');
