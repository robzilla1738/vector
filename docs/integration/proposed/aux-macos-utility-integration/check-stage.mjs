// New pipeline boundary only; never load a native image or reach bundled startup.
import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {createContext,SourceTextModule,SyntheticModule} from 'node:vm';import {isBuiltin} from 'node:module';
import {adaptDaemonBinaryWithMacUtilities,buildDaemonNodeDevelopmentWithMacUtilities,macUtilityResources} from '../../../../vendor/provided/aux-macos-utility-stage.mjs';
import {adaptDaemonBinaryWithAuxCrypto,buildDaemonNodeDevelopmentWithAuxCrypto} from '../../../../vendor/provided/aux-crypto-stage.mjs';
import {findMachOSeaSection,readSeaBlob} from '../../../../vendor/aside/lib/sea.mjs';import {AUX_COLD_ENTRY_REFUSAL} from '../../../../vendor/provided/aux-cold-entry-admission.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex'),input=readFileSync('out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon');
const blob=binary=>{const s=findMachOSeaSection(binary);return readSeaBlob(binary.subarray(s.offset,s.offset+s.size));},original=blob(input),opts={enableCloud:true,profile:'development'};
const output=adaptDaemonBinaryWithMacUtilities(input,opts,'aux-v1',2),embedded=blob(output.binary),node=buildDaemonNodeDevelopmentWithMacUtilities(input,opts,'aux-v1',2),resources=macUtilityResources(2);
assert.equal(embedded.flags,25);assert.deepEqual(embedded.assets,original.assets);assert.equal(resources.files.length,4);assert.ok(resources.files.every(f=>f.mode===0o644&&f.generatedBy==='vendor/provided/aux-macos-utility-stage.mjs'));
let runs=0;for(const code of [embedded.code,node.files.find(f=>f.path.endsWith('/index.mjs')).bytes.toString()]){
 const context=createContext({}),dependencies=new Map();let dynamic=0;const module=new SourceTextModule(code,{context,importModuleDynamically(){dynamic++;throw Error('Unexpected initialization');}});
 assert.ok(code.startsWith(AUX_COLD_ENTRY_REFUSAL));assert.ok(module.dependencySpecifiers.every(isBuiltin));
 await module.link(async specifier=>{if(!dependencies.has(specifier)){const names=Object.getOwnPropertyNames(await import(specifier));dependencies.set(specifier,new SyntheticModule(names,function(){for(const name of names)this.setExport(name,undefined)},{context}));}return dependencies.get(specifier);});
 await assert.rejects(module.evaluate(),e=>e.code==='AUX_STATE_IDENTITY_QUARANTINED');assert.equal(dynamic,0);runs++;
}
const base=adaptDaemonBinaryWithAuxCrypto(input,{},'compatibility',1),compat=adaptDaemonBinaryWithMacUtilities(input,{},'compatibility',1);assert.deepEqual(compat,base);assert.deepEqual(buildDaemonNodeDevelopmentWithMacUtilities(input,{},'compatibility',1),buildDaemonNodeDevelopmentWithAuxCrypto(input,{},'compatibility',1));assert.equal(macUtilityResources(1).files.length,0);
const e={format:'aux.macos.utility.stage.check.v1',actualEmbeddedDevelopmentSeaSha256:sha(embedded.code),actualNodeEntrySha256:sha(node.files.find(f=>f.path.endsWith('/index.mjs')).bytes),originalSeaAssetsPreserved:2,seaFlags:25,fixedGeneratedUtilityAndRecoveryFiles:resources.files.map(f=>({path:f.path,mode:f.mode,sha256:sha(f.bytes)})),guardedEntriesEvaluated:runs,dynamicLoadsBeforeRefusal:0,state1BytesAndManifestUnchanged:true,nativeModuleLoaded:false,productionOSCalls:0,appLaunched:false};
writeFileSync(new URL('./stage-check.json',import.meta.url),JSON.stringify(e,null,2)+'\n');console.log('New actual utility SEA/Node pipeline retains quarantine/assets and exact state1 bytes;2 fixed utility files and2 recovery copies, no native load.');
