// Focused correction only: do not repeat unchanged migration/auth/evidence cases.
import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {encryptAuxSkillCache,decryptAuxSkillCache,parseAuxSkillCacheBlob} from '../source/runtime.mjs';
const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),root=Buffer.alloc(32,13),purpose='skill-cache.builtin/aux.☃';
let stored;
const source=pin.edits.slice(0,2).map(x=>x.replace).join(';');
const c=new Function('unlock','getDk','decryptAuxSkillCache','parseAuxSkillCacheBlob','encryptAuxSkillCache','readFile','writeFile','chmod','textDecoder$1','textEncoder$1',source+';return {readCacheEntry,writeCacheEntry}')(async()=>{},()=>root,decryptAuxSkillCache,parseAuxSkillCacheBlob,encryptAuxSkillCache,async()=>stored,async(_p,x)=>{stored=x},async()=>{},new TextDecoder(),new TextEncoder());
// Original readCacheEntry uses plain JSON.parse with no record-shape/size gate.
const value={cachedAt:1,expiresAt:2,value:'x'.repeat(2*1024*1024+1),additionalSourceAcceptedField:true};
await c.writeCacheEntry('captured-path-only',purpose,value);assert.deepEqual(await c.readCacheEntry('captured-path-only',purpose),value);assert.equal(JSON.parse(stored).purpose,purpose);
console.log('runtime source compatibility passed: actual cache functions retain slash/dot/Unicode purpose, additional JSON field and >2MiB value');
