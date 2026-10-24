/** Exercise actual extracted schemas/catalog predicates with the installed Zod. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import * as z from '../../../../../node_modules/.pnpm/zod@4.6.7/node_modules/zod/index.js';
const root='/Users/rcourson/Documents/Vibe/web',here=path.join(root,'docs/integration/proposed/standard-profile-isolation/memory-runtime-v2-a1');
const text=await fs.readFile('/private/tmp/aux-standard-daemon-projection-20261024-a7/index.mjs','utf8');
const catalogText=await fs.readFile('/private/tmp/aux-memory-runtime-v2-20261024-a1/distribution/memory-catalog.json','utf8');
const catalog=JSON.parse(catalogText),hash=value=>createHash('sha256').update(value).digest('hex');
const context={object:z.object,string$3:z.string,number$2:z.number,record:z.record,literal:z.literal,_enum:z.enum,
 array:z.array,unknown$1:z.unknown,MAX_MODEL_BYTES:536870912,
 COREML_MODEL_ID:catalog.models.find(model=>model.id.includes('coreml')).id,
 ONNX_MODEL_ID:catalog.models.find(model=>model.id.includes('onnx')).id};
let start=text.indexOf('hashSchema=string$3()'),end=text.indexOf(',ModelDownloadError=class',start);
assert(start>=0&&end>start);
const schemas=runInNewContext('(()=>{let '+text.slice(start,end)+';return{runtimeManifestSchema,modelManifestSchema}})()',context);
const runtime=schemas.runtimeManifestSchema.parse(catalog.runtimes[0]);
for(const model of catalog.models)schemas.modelManifestSchema.parse(model);
const canonical={...runtime,files:Object.fromEntries(Object.entries(runtime.files).sort(([a],[b])=>a.localeCompare(b)).map(([name,pin])=>[name,{bytes:pin.bytes,sha256:pin.sha256}]))};
assert.equal(hash(JSON.stringify(canonical)),'a3a6ff1214564e80f18999e80e3125da517530794e30661bbf16c320124d4e33');
assert.throws(()=>schemas.runtimeManifestSchema.parse({...catalog.runtimes[0],formatVersion:1,id:'aside-memory-runtime-v1',executable:'aside-memory'}));
start=text.indexOf('payloadSchema$1=object(');end=text.indexOf(',parseKnown=',start);assert(start>=0&&end>start);
const payload=runInNewContext('(()=>{let '+text.slice(start,end)+';return payloadSchema$1})()',context);
start=text.indexOf('function verifyMemoryCatalog(');end=text.indexOf('function selectMemoryAssets(',start);assert(start>=0&&end>start);
const verify=runInNewContext('('+text.slice(start,end)+')',{Buffer,createHash,MAX_CATALOG_BYTES:1048576,payloadSchema$1:payload});
assert.equal(verify(catalogText).formatVersion,2);
assert.throws(()=>verify(catalogText+' '),/integrity mismatch/);
assert.throws(()=>verify(JSON.stringify({...catalog,sequence:catalog.sequence+1})),/integrity mismatch/);
const classStart=text.indexOf('MemoryCatalog=class{'),classEnd=text.indexOf('})),MAX_MESSAGE_BYTES',classStart);
assert(classStart>=0&&classEnd>classStart);
const Catalog=runInNewContext('('+text.slice(classStart+'MemoryCatalog='.length,classEnd)+')',{
 ModelDownloadError:Error,verifyMemoryCatalog:verify,auxReadBundledMemoryCatalogV2:async()=>catalogText,
 fetch:()=>{throw Error('Unexpected network request')},
});
assert.throws(()=>new Catalog({url:'https://example.invalid/catalog'}),/overrides are unavailable/);
assert.throws(()=>new Catalog({publicKey:'untrusted'}),/overrides are unavailable/);
const loaded=await new Catalog({cachePath:'/unused-disposable-cache'}).load();
assert.equal(loaded.catalog.format,'aux.bundled-memory-catalog.v1');await loaded.commit();
const result={format:'aux.memory-v2.schema.fixture.actual.v1',passed:true,sourceSha256:hash(text),catalogSha256:hash(catalogText),
 runtimeV2AndBothOriginalModelsParsed:true,canonicalCacheKeyMatches:true,legacyRuntimeDescriptorRefused:true,
 changedCatalogBytesRefused:true,publicKeyAndUrlOverridesRefused:true,installedSchemaLibrary:'zod@4.6.7',
 catalogReaderFixtureUsed:true,nativeAuthorityTested:false,productExecutableRun:false,networkRequests:0};
await fs.writeFile(path.join(here,'actual-schema-fixture-a1.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,runtimeV2:true,legacyRefused:true,productExecutableRun:false}));
