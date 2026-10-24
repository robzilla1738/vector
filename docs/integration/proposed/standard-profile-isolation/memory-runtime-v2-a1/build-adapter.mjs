/** Literal, pinned integration of Aux v2 into the supplied memory implementation. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {seedAuxMemoryV2} from './source/seed.mjs';
import {auxProvisionBundledMemoryV2,auxReadBundledMemoryCatalogV2} from './source/entry-helpers.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../..//vendor/provided/aux-cold-entry-admission.mjs';
const root='/Users/rcourson/Documents/Vibe/web',here=path.join(root,'docs/integration/proposed/standard-profile-isolation/memory-runtime-v2-a1');
const hash=value=>createHash('sha256').update(value).digest('hex');
const input='/private/tmp/aux-standard-daemon-projection-20261024-a6/index.mjs';
const before=await fs.readFile(input,'utf8');
assert.equal(hash(before),'3ce70424305191a2345ea070b00b1d36b9935b7e348950167316f4386ecd45b1');
const distribution=JSON.parse(await fs.readFile(path.join(here,'actual-distribution-a1.json'),'utf8'));
const seedBytes=await fs.readFile(path.join(distribution.output,'seed.json'));
assert.equal(hash(seedBytes),distribution.seedManifestSha256);
const seed=JSON.parse(seedBytes);assert.equal(seed.catalogSha256,distribution.derivedCatalogSha256);
const anchors=[];let text=before;
function edit(name,find,replace,count=1){
 assert.equal(text.split(find).length-1,count,name);
 text=text.split(find).join(replace);anchors.push({kind:'integration',name,find,replace,count});
}
const helpers=[
 'let auxMemoryV2SeedPending,auxMemoryV2SeedRoots,auxMemoryV2SeedStopped=false;',
 'const AUX_MEMORY_V2_SEED='+JSON.stringify(seed)+';',
 seedAuxMemoryV2.toString(),auxProvisionBundledMemoryV2.toString(),auxReadBundledMemoryCatalogV2.toString(),
].join('\n');
edit('Native-root and physically awaited supplied-seed adaptation',AUX_COLD_ENTRY_REFUSAL,AUX_COLD_ENTRY_REFUSAL+'\n'+helpers+'\n');
edit('Native-owned startup replaces environment-selected legacy bootstrap',
 'async function main(){await (await import(`node:module`)).createRequire(process.execPath)(path.join(__auxDaemonResources,`native/memory-bootstrap.cjs`))();',
 'async function main(){await auxProvisionBundledMemoryV2();');
let start=text.indexOf('function verifyMemoryCatalog('),end=text.indexOf('function selectMemoryAssets(',start);
assert(start>=0&&end>start);
edit('Sealed-entry content pin authenticates only the explicit Aux v2 catalog',text.slice(start,end),
 'function verifyMemoryCatalog(Cn){if(typeof Cn!==`string`||Buffer.byteLength(Cn)>MAX_CATALOG_BYTES||createHash(`sha256`).update(Cn).digest(`hex`)!==`'+seed.catalogSha256+'`)throw Error(`Aux bundled memory catalog integrity mismatch`);return payloadSchema$1.parse(JSON.parse(Cn))}');
start=text.indexOf('var MEMORY_CATALOG_URL,MEMORY_CATALOG_PUBLIC_KEY,MAX_CATALOG_BYTES,SIGNATURE_DOMAIN,');
end=text.indexOf(',MAX_MESSAGE_BYTES',start);assert(start>=0&&end>start);
const next='var MAX_CATALOG_BYTES,payloadSchema$1,parseKnown,MemoryCatalog,init_catalog=__esmMin((()=>{'+
 'init_zod(),init_model_download(),init_model_id(),MAX_CATALOG_BYTES=1048576,'+
 'payloadSchema$1=object({format:literal(`aux.bundled-memory-catalog.v1`),formatVersion:literal(2),sequence:number$2().int().positive(),runtimes:array(unknown$1()),models:array(unknown$1())}),'+
 'parseKnown=(Cn,ei)=>Cn.flatMap(Cn=>{try{return[ei(Cn)]}catch{return[]}}),'+
 'MemoryCatalog=class{options;constructor(Cn={}){if(Cn.url!==void 0||Cn.publicKey!==void 0)throw new ModelDownloadError(`Aux memory catalog overrides are unavailable`);this.options=Cn}async load(){const Cn=verifyMemoryCatalog(await auxReadBundledMemoryCatalogV2());return{catalog:Cn,commit:async()=>{}}}}}))';
edit('Retire original catalog RSA-domain/cache/network authority without reinterpreting its signature',text.slice(start,end),next);
const nameCount=text.split('aside-memory').length-1;assert.equal(nameCount,9);
edit('All runtime paths and descriptors use Aux names','aside-memory','aux-memory',nameCount);
edit('Explicit v2 runtime descriptor; model descriptors remain v1',
 'runtimeManifestSchema=object({formatVersion:literal(1),id:literal(`aux-memory-runtime-v1`)',
 'runtimeManifestSchema=object({formatVersion:literal(2),id:literal(`aux-memory-runtime-v2`)');
start=text.indexOf('if(this.options.kind===`runtime`&&process.platform===`darwin`)');
end=text.indexOf('return Cn.controller.signal.throwIfAborted()',start);assert(start>=0&&end>start);
const quarantine='if(this.options.kind===`runtime`&&process.platform===`darwin`){let ti=path.join(ei,`aux-memory`),ni=!0;try{await execute(`/usr/bin/xattr`,[`-p`,`com.apple.quarantine`,ti],{timeout:3e4})}catch(Cn){if(!(Cn instanceof Error&&`stderr`in Cn&&String(Cn.stderr).includes(`No such xattr`)))throw Cn;ni=!1}if(ni)throw new ModelDownloadError(`Aux memory runtime is quarantined; installation verification is required`)}';
edit('Quarantine is never cleared or authenticated under the original vendor identity',text.slice(start,end),quarantine);
edit('Damaged/untrusted cache cannot trigger an unsigned or unrelated remote update',
 '}catch{ei.throwIfAborted()}await mkdir(li,{recursive:!0,mode:448});let fi=',
 '}catch{ei.throwIfAborted()}throw new ModelDownloadError(`Aux bundled memory cache failed integrity verification; restart Aux to repair it from the bundled seed`);await mkdir(li,{recursive:!0,mode:448});let fi=');
start=text.indexOf('async prune(){let Cn=this.#e;');end=text.indexOf('#n(Cn,ei){',start);assert(start>=0&&end>start);
const prune=text.slice(start,end);assert(prune.endsWith('}'));
edit('Pruning retains the actual native/model producer until its filesystem work settles',prune,
 'async prune(){return auxControlledModel(new AbortController(),async()=>{'+prune.slice('async prune(){'.length,-1)+'})}');
assert(!text.includes('aside-memory'));assert(!text.includes('MEMORY_CATALOG_PUBLIC_KEY'));
assert(text.startsWith(AUX_COLD_ENTRY_REFUSAL));
let replay=before;for(const anchor of anchors){assert.equal(replay.split(anchor.find).length-1,anchor.count);replay=replay.split(anchor.find).join(anchor.replace)}
assert.equal(replay,text);
const output='/private/tmp/aux-memory-v2-adapter-20261024-a1';await fs.mkdir(output,{mode:0o700});
const target=path.join(output,'index.mjs');await fs.writeFile(target,text,{flag:'wx',mode:0o600});
const syntax=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
await fs.writeFile(path.join(here,'source/anchors.json'),JSON.stringify(anchors,null,2)+'\n',{flag:'wx'});
const report={format:'aux.memory-runtime-v2.adapter.actual.v1',passed:true,input,inputSha256:hash(before),output:target,outputSha256:hash(text),
 stages:anchors.length,totalAnchors:anchors.reduce((sum,item)=>sum+item.count,0),catalogSha256:seed.catalogSha256,
 sourceReplayPassed:true,wholeSourceSyntaxPassed:true,defaultColdRefusalPreserved:true,
 nativeApiChanged:false,independentEntryProjectionPending:true,packaged:false,productExecuted:false,uiChanged:false};
await fs.writeFile(path.join(here,'actual-adapter-a1.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,stages:anchors.length,totalAnchors:report.totalAnchors,productExecuted:false}));
