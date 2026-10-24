/** Real filesystem fixtures for the seed body; no native authority or target execution. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {seedAuxMemoryV2} from './source/seed.mjs';
const root='/Users/rcourson/Documents/Vibe/web';
const here=path.join(root,'docs/integration/proposed/standard-profile-isolation/memory-runtime-v2-a1');
const source='/private/tmp/aux-memory-runtime-v2-20261024-a1/distribution';
const seedBytes=await fs.readFile('/private/tmp/aux-memory-runtime-v2-20261024-a1/seed.json');
const seed=JSON.parse(seedBytes),hash=b=>createHash('sha256').update(b).digest('hex');
const fixture='/private/tmp/aux-memory-seed-v2-fixture-20261024-a1';
await fs.mkdir(fixture,{mode:0o700});
const home=path.join(fixture,'task-home');await fs.mkdir(home,{mode:0o700});
let checks=0;const check=()=>{checks++};
const before=Date.now();
const first=await seedAuxMemoryV2({source,home,seed,check});
assert.deepEqual(first.published,['models','memory-runtimes']);assert.deepEqual(first.retained,[]);assert.equal(first.authorityGranted,false);
const pointers=new Map();
for(const group of seed.groups){
 const base=path.join(home,group.kind,group.key),current=await fs.readFile(path.join(base,'CURRENT'),'utf8');
 assert(/^[a-f0-9-]{36}$/.test(current));
 pointers.set(group.kind,current);
 for(const pin of group.files){
  const actual=path.join(base,current,pin.path),stat=await fs.lstat(actual);
  assert(!stat.isSymbolicLink());assert.equal(stat.mode&0o777,pin.mode);
  if(pin.type==='file')assert.equal(hash(await fs.readFile(actual)),pin.sha256);else assert(stat.isDirectory());
 }
}
const second=await seedAuxMemoryV2({source,home,seed,check});
assert.deepEqual(second.published,[]);assert.deepEqual(second.retained,['models','memory-runtimes']);
for(const group of seed.groups)assert.equal(await fs.readFile(path.join(home,group.kind,group.key,'CURRENT'),'utf8'),pointers.get(group.kind));
const runtime=seed.groups.find(group=>group.kind==='memory-runtimes');
const oldGeneration=pointers.get(runtime.kind),cache=path.join(home,runtime.kind,runtime.key);
const corrupted=path.join(cache,oldGeneration,'runtime.json');await fs.writeFile(corrupted,'partial-cache');
const repaired=await seedAuxMemoryV2({source,home,seed,check});
assert.deepEqual(repaired.published,['memory-runtimes']);assert.deepEqual(repaired.retained,['models']);
const newGeneration=await fs.readFile(path.join(cache,'CURRENT'),'utf8');assert.notEqual(newGeneration,oldGeneration);
assert.equal(await fs.readFile(corrupted,'utf8'),'partial-cache');
assert.equal(hash(await fs.readFile(path.join(cache,newGeneration,'runtime.json'))),runtime.key);
await fs.unlink(path.join(cache,'CURRENT'));await fs.symlink('/dev/null',path.join(cache,'CURRENT'));
await assert.rejects(seedAuxMemoryV2({source,home,seed,check}),error=>['ELOOP','AUX_MEMORY_UNSAFE'].includes(error.code));
assert.equal(await fs.readlink(path.join(cache,'CURRENT')),'/dev/null');

const bad=path.join(fixture,'bad-source'),untouched=path.join(fixture,'untouched-home');
await fs.cp(source,bad,{recursive:true});await fs.mkdir(untouched,{mode:0o700});
const badRuntime=path.join(bad,runtime.sourcePrefix,'aux-memory'),bytes=await fs.readFile(badRuntime);bytes[400]^=1;
await fs.writeFile(badRuntime,bytes);
await assert.rejects(seedAuxMemoryV2({source:bad,home:untouched,seed,check}),{code:'AUX_MEMORY_INTEGRITY'});
assert.deepEqual(await fs.readdir(untouched),[]);
const report={format:'aux.memory-seed-v2.fixture.actual.v1',passed:true,fixture,seedManifestSha256:hash(seedBytes),
 initialPublicationAndAllPayloadHashesPassed:true,validExistingGenerationsRetained:true,partialCacheRepairedWithNewGeneration:true,
 oldCorruptGenerationPreserved:true,unsafeCurrentLinkRefused:true,badSourceRefusedBeforeTargetMutation:true,
 fixtureGuardCallbacks:checks,elapsedMs:Date.now()-before,nativeAuthorityTested:false,productExecutableRun:false,
 ownerStateAccessed:false,uiChanged:false};
await fs.writeFile(path.join(here,'actual-seed-fixture-a1.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,guardCallbacks:checks,productExecutableRun:false,nativeAuthorityTested:false}));
