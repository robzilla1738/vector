// Actual generated sources and embedded SEA only; no application/native initialization.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isBuiltin} from 'node:module';
import {createContext,SourceTextModule,SyntheticModule} from 'node:vm';
import {adaptDaemonCode,adaptDaemonBinary} from '../../../../vendor/provided/daemon-adapter.mjs';
import {buildDaemonNodeDevelopment} from '../../../../vendor/provided/daemon-node-development.mjs';
import {adaptDaemonCodeWithAuxCrypto,adaptDaemonBinaryWithAuxCrypto,buildDaemonNodeDevelopmentWithAuxCrypto,auxCryptoSeaResources} from '../../../../vendor/provided/aux-crypto-stage.mjs';
import {findMachOSeaSection,readSeaBlob} from '../../../../vendor/aside/lib/sea.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../vendor/provided/aux-cold-entry-admission.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const input=readFileSync('out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon');
function blob(binary){const section=findMachOSeaSection(binary);return readSeaBlob(binary.subarray(section.offset,section.offset+section.size));}
const original=blob(input),evidence={format:'aux.crypto.stage.check.v1',activation:false,originalBinarySha256:sha(input),variants:[]};
for(const [policy,options] of [['local',{}],['development',{enableCloud:true,profile:'development'}]]){
 const built=adaptDaemonBinaryWithAuxCrypto(input,options,'aux-v1',2),embedded=blob(built.binary),node=buildDaemonNodeDevelopmentWithAuxCrypto(input,options,'aux-v1',2),resources=auxCryptoSeaResources(2);
 assert.equal(embedded.flags,original.flags);assert.equal(embedded.flags,25);assert.deepEqual(embedded.assets,original.assets);assert.equal(embedded.code,adaptDaemonCodeWithAuxCrypto(original.code,options,'aux-v1',2).code);
 assert.equal(resources.files.length,4);assert.equal(node.files.length,8);const entries=[embedded.code,node.files.find(f=>f.path.endsWith('/node-development/index.mjs')).bytes.toString()];
 for(const entry of entries){
  let dynamicLoads=0;const context=createContext({}),dependencies=new Map(),module=new SourceTextModule(entry,{context,importModuleDynamically(){dynamicLoads++;throw Error('Unexpected dynamic import');}});
  assert.ok(entry.startsWith(AUX_COLD_ENTRY_REFUSAL));assert.equal(entry.split(AUX_COLD_ENTRY_REFUSAL).length,2);assert.ok(module.dependencySpecifiers.every(isBuiltin));
  await module.link(async specifier=>{if(!dependencies.has(specifier)){const names=Object.getOwnPropertyNames(await import(specifier));dependencies.set(specifier,new SyntheticModule(names,function(){for(const name of names)this.setExport(name,undefined)},{context}));}return dependencies.get(specifier);});
  await assert.rejects(module.evaluate(),e=>e.code==='AUX_STATE_IDENTITY_QUARANTINED');assert.equal(dynamicLoads,0);
 }
 for(const asset of [...resources.files,...node.files.filter(f=>f.path.includes('/aux-crypto/'))]){assert.equal(asset.mode,0o644);assert.ok(!asset.bytes.toString().toLowerCase().includes('aside'));assert.ok(!asset.path.split('/').includes('..'));new SourceTextModule(asset.bytes.toString());}
 evidence.variants.push({policy,embeddedCodeSha256:sha(embedded.code),nodeEntrySha256:sha(entries[1]),seaFlags:embedded.flags,unchangedOriginalSeaAssets:embedded.assets.length,cryptoAssets:resources.files.length,nodeResources:node.files.length,dynamicLoadsBeforeRefusal:0});
}
// Compatibility mode remains byte-identical, including original manifest shape.
for(const options of [{},{enableCloud:true,profile:'development'}]){
 assert.deepEqual(adaptDaemonCodeWithAuxCrypto(original.code,options,'compatibility',1),adaptDaemonCode(original.code,options,'compatibility',1));
 assert.deepEqual(adaptDaemonBinaryWithAuxCrypto(input,options,'compatibility',1),adaptDaemonBinary(input,options,'compatibility',1));
 const actual=buildDaemonNodeDevelopmentWithAuxCrypto(input,options,'compatibility',1),expected=buildDaemonNodeDevelopment(input,options,'compatibility',1);assert.deepEqual(actual.manifest,expected.manifest);assert.deepEqual(actual.files.map(({generatedBy,...f})=>f),expected.files);assert.equal(auxCryptoSeaResources(1).files.length,0);
}
const handoff=JSON.parse(readFileSync('docs/integration/proposed/aux-csk-prepared-handoff/source-pins.json'));for(const record of [handoff.fdBaseline,...handoff.dependencies])assert.equal(sha(readFileSync(record.path)),record.sha256);for(const [path,digest]of Object.entries(handoff.sources))assert.equal(sha(readFileSync('docs/integration/proposed/aux-csk-prepared-handoff/'+path)),digest);
evidence.compatibilityByteAndManifestEquality=true;evidence.nativeModulesLoaded=false;evidence.protectedOperations=false;
writeFileSync(new URL('./focused-check.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log('Actual embedded local/development SEA and node entries retain first refusal; fixed crypto assets added; compatibility bytes/manifests unchanged; handoff pins match.');
