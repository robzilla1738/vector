import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isBuiltin} from 'node:module';
import {SourceTextModule,SyntheticModule,createContext} from 'node:vm';
import test from 'node:test';
import {AUX_COLD_ENTRY_REFUSAL} from './aux-cold-entry-admission.mjs';
const root='/Users/rcourson/Documents/Vibe/web';
const binary=readFileSync(root+'/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon');
const baseline=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-node-cold-entry/state1-baseline.json',import.meta.url)));
// Use the actual root composed adapter, including its new direct-entry guard,
// without copying or changing the root's concurrently owned adapter file.
async function generator(){
 const url=new URL('./daemon-node-development.mjs',import.meta.url),context=createContext({Buffer,URL}),module=new SourceTextModule(readFileSync(url,'utf8'),{context,identifier:url.href});
 await module.link(async specifier=>{
  const actual=await import(specifier==='./daemon-adapter.mjs'?root+'/vendor/provided/daemon-adapter.mjs':isBuiltin(specifier)?specifier:new URL(specifier,url).href);
  const names=Object.getOwnPropertyNames(actual);
  return new SyntheticModule(names,function(){for(const name of names)this.setExport(name,actual[name])},{context});
 });await module.evaluate();return module.namespace.buildDaemonNodeDevelopment;
}
const build=await generator();
test('actual composed state2 generated entry refuses before any nonbuiltin asset import/init',async()=>{
 const result=build(binary,{},'aux-v1',2),entry=result.files.find(f=>f.path.endsWith('/index.mjs')).bytes.toString();
 assert.ok(entry.startsWith(AUX_COLD_ENTRY_REFUSAL));assert.equal(entry.split(AUX_COLD_ENTRY_REFUSAL).length-1,1);
 assert.ok(entry.includes('getAsset: __auxProvidedGetAsset } = await import("./assets.mjs");'));
 let dynamicImports=0;const context=createContext({}),module=new SourceTextModule(entry,{context,importModuleDynamically:()=>{dynamicImports++;throw Error('Nonbuiltin assets initialized before refusal')}}),dependencies=new Map;
 assert.ok(!module.dependencySpecifiers.includes('./assets.mjs'));
 await module.link(async specifier=>{
  assert.ok(isBuiltin(specifier),'No nonbuiltin dependency may initialize');
  if(!dependencies.has(specifier)){const names=Object.getOwnPropertyNames(await import(specifier));dependencies.set(specifier,new SyntheticModule(names,function(){for(const name of names)this.setExport(name,undefined)},{context}))}
  return dependencies.get(specifier);
 });
 await assert.rejects(module.evaluate(),error=>error.code==='AUX_STATE_IDENTITY_QUARANTINED');assert.equal(dynamicImports,0);
});
test('state1 actual generated entry and all copied assets preserve their previous bytes',()=>{
 const result=build(binary,{},'aux-v1',1);assert.deepEqual(JSON.parse(JSON.stringify(result.manifest.files)),baseline.files);
 const entry=result.files.find(f=>f.path.endsWith('/index.mjs')).bytes.toString();assert.ok(entry.startsWith('import { daemonResources as __auxDaemonResources'));assert.ok(!entry.includes('aux-cold-entry-admission-v1'));
});
