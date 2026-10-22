import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isBuiltin} from 'node:module';
import {SourceTextModule,SyntheticModule,createContext} from 'node:vm';
import test from 'node:test';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
import {applyAuxColdEntryAdmission,AUX_COLD_ENTRY_REFUSAL} from './aux-cold-entry-admission.mjs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-cold-entry-admission/inputs.json',import.meta.url)));
const source=component=>{const b=readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/'+component+'/Contents/MacOS/'+(component==='daemon'?'aside-daemon':'aside')),s=findMachOSeaSection(b);return readSeaBlob(b.subarray(s.offset,s.offset+s.size)).code};
for(const component of ['daemon','cli'])test('actual '+component+' refuses before bundled initialization without user modules or state I/O',async()=>{
 const original=source(component),result=applyAuxColdEntryAdmission({component,text:original,original,stateIdentityVersion:2}),context=createContext({});
 const module=new SourceTextModule(result.text,{context});assert.deepEqual(module.dependencySpecifiers,pins.inputs.find(p=>p.component===component).staticBuiltinImports);
 const dependencies=new Map;
 await module.link(async specifier=>{
  assert.equal(isBuiltin(specifier),true,'All hoisted imports must be Node builtins');
  if(!dependencies.has(specifier)){
   const names=Object.getOwnPropertyNames(await import(specifier));
   // Supply undefined bindings only: no fs/process/native/provider function is
   // callable by the evaluated actual entry. The first throw must still win.
   const stub=new SyntheticModule(names,function(){for(const name of names)this.setExport(name,undefined)},{context});dependencies.set(specifier,stub);
  }
  return dependencies.get(specifier);
 });
 await assert.rejects(module.evaluate(),error=>error.code==='AUX_STATE_IDENTITY_QUARANTINED');
 assert.equal(result.anchors.length,1);assert.equal(result.text,original.replace(result.anchors[0].find,result.anchors[0].replace));
 assert.ok(result.text.startsWith((component==='cli'?'#!/usr/bin/env node\n':'')+AUX_COLD_ENTRY_REFUSAL));
});
test('state1 preserves both actual entries exactly and accepts no version/bypass option',()=>{
 for(const component of ['daemon','cli']){const original=source(component),opts={component,text:original,original};assert.deepEqual(applyAuxColdEntryAdmission({...opts,stateIdentityVersion:1}),{text:original,anchors:[]});for(const version of [undefined,0,3,'2'])assert.throws(()=>applyAuxColdEntryAdmission({...opts,stateIdentityVersion:version}),/version/)}
});
test('wrong original, moved executable prefix and mixed generation fail closed',()=>{
 const original=source('daemon'),opts={component:'daemon',text:original,original,stateIdentityVersion:2};assert.throws(()=>applyAuxColdEntryAdmission({...opts,original:original+' '}),/pin mismatch/);assert.throws(()=>applyAuxColdEntryAdmission({...opts,text:'doWork();'+original}),/prefix drift/);const result=applyAuxColdEntryAdmission(opts);assert.throws(()=>applyAuxColdEntryAdmission({...opts,text:result.text}),/Mixed or repeated/);
});
