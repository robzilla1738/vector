import assert from 'node:assert/strict';import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {isBuiltin} from 'node:module';import {createContext,SourceTextModule,SyntheticModule} from 'node:vm';
import {prepareAuxCryptoRuntimeEntries} from '../source/build.mjs';import {materializeAuxCryptoRuntimeAssets} from '../source/materialize.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
const binary=readFileSync(process.argv[2]??'/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon'),built=prepareAuxCryptoRuntimeEntries(binary);
assert.equal(built.manifest.activation,false);assert.equal(built.manifest.seaInjectionPerformed,false);assert.equal(built.manifest.seaFlags,25);assert.equal(built.seaAssets.length,4);assert.equal(built.developmentFiles.length,8);
for(const [name,entry]of [['sea',built.seaEntry.toString()],['node-development',built.developmentFiles.find(f=>f.path.endsWith('/index.mjs')).bytes.toString()]]){
 let dynamicImports=0;const context=createContext({}),module=new SourceTextModule(entry,{context,identifier:'aux-captured-'+name,importModuleDynamically:()=>{dynamicImports++;throw Error('Aux asset loader ran before refusal')}}),dependencies=new Map();
 assert.ok(entry.startsWith(AUX_COLD_ENTRY_REFUSAL));assert.equal(entry.split(AUX_COLD_ENTRY_REFUSAL).length-1,1);assert.ok(module.dependencySpecifiers.every(isBuiltin));
 // Builtin stubs permit linking only; no original initializer is reached.
 await module.link(async specifier=>{assert.ok(isBuiltin(specifier));if(!dependencies.has(specifier)){const names=Object.getOwnPropertyNames(await import(specifier));dependencies.set(specifier,new SyntheticModule(names,function(){for(const n of names)this.setExport(n,undefined)},{context}));}return dependencies.get(specifier);});
 await assert.rejects(module.evaluate(),e=>e.code==='AUX_STATE_IDENTITY_QUARANTINED');assert.equal(dynamicImports,0);
}
const assets=materializeAuxCryptoRuntimeAssets({mode:'node-development'}),directory=mkdtempSync(path.join(tmpdir(),'aux-fixed-crypto-assets-'));
try{
 const context=createContext({}),modules=new Map(),byName=new Map(assets.files.map(f=>[path.basename(f.path),f]));
 for(const [name,file]of byName){const text=file.bytes.toString();assert.ok(!text.includes('../../'));assert.ok(!text.toLowerCase().includes('aside'));assert.equal(file.mode,0o644);writeFileSync(path.join(directory,name),file.bytes,{mode:0o600});modules.set(name,new SourceTextModule(text,{context,identifier:name}));}
 const builtins=new Map();
 async function link(specifier,referencing){if(isBuiltin(specifier)){if(!builtins.has(specifier)){const names=Object.getOwnPropertyNames(await import(specifier));builtins.set(specifier,new SyntheticModule(names,function(){for(const n of names)this.setExport(n,undefined)},{context}));}return builtins.get(specifier);}assert.ok(specifier.startsWith('./')&&!specifier.slice(2).includes('/'),'Fixed app-contained sibling only');assert.ok(modules.has(specifier.slice(2)));return modules.get(specifier.slice(2));}
 // Parse/link the actual materialized graph without evaluating module bodies.
 await modules.get('aux-csk-v2-runtime.mjs').link(link);await modules.get('aux-live-dk-runtime.mjs').link(link);
 assert.ok(!Object.keys(JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url)))).includes('admissionGranted'));
 assert.ok(!byName.get('aux-dk-crypto.mjs').bytes.toString().includes('prepareAuxInstallationMigration'));
 assert.ok(!byName.get('aux-json-tokens.mjs').bytes.toString().includes('replaceAuxIdentityJsonStringToken'));
}finally{rmSync(directory,{recursive:true,force:true});}
console.log('deferred crypto assets passed: actual SEA/node entries cold-refuse with zero dynamic loads;4 fixed assets materialized/parsed/linked without evaluation');
