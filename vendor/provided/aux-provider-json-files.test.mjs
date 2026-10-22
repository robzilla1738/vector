import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createRequire}from'node:module';
import{runInNewContext}from'node:vm';
import test from'node:test';
import{findMachOSeaSection,readSeaBlob}from'../aside/lib/sea.mjs';
import{prepareAuxProviderJsonFile,prepareAuxProviderRendererStorage,stripProvidedModelsJsonComments,verifyAuxProviderJsonSource}from'./aux-provider-json-files.mjs';
import{migrateAuxProviderState}from'./aux-provider-identity.mjs';
const root='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852',bytes=readFileSync(root+'/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(bytes),daemon=readSeaBlob(bytes.subarray(section.offset,section.offset+section.size)).code;
const agentSettingsText=readFileSync(root+'/agent/assets/use-agent-settings-DiedG0R1.js','utf8');
const fixture=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-provider-json-files/virtual-fixture.json',import.meta.url)));
const z=createRequire('/Users/rcourson/Documents/Vibe/web/services/aux-cloud/package.json')('zod').z;
const input=value=>Buffer.from(JSON.stringify(value));

test('actual1852 loaders, fields and source hashes authenticate the reviewed layout',()=>{
 assert.equal(verifyAuxProviderJsonSource({daemonText:daemon,agentSettingsText}).layoutVersion,1);
 assert.throws(()=>verifyAuxProviderJsonSource({daemonText:daemon+' ',agentSettingsText}),/pin/);
 const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-provider-json-files/source-anchors.json',import.meta.url)));
 for(const anchor of pins.anchors)assert.equal(daemon.split(anchor.find).length-1,anchor.count,anchor.name);
 const start=daemon.indexOf('modelSelectionSchema=')+'modelSelectionSchema='.length,end=daemon.indexOf(',imageGenerationModelSelectionSchema=',start),expression=daemon.slice(start,end);assert.ok(end>start);
 const schema=runInNewContext(expression,{object:z.object,custom:z.custom,string$3:z.string,modelThinkingLevelSchema:z.enum(['off','minimal','low','medium','high','xhigh','max']),boolean$1:z.boolean});
 const settings=prepareAuxProviderJsonFile({path:'u/0/settings.json',bytes:input(fixture.homeFiles['u/0/settings.json'])});
 assert.equal(schema.parse(JSON.parse(settings.after).defaultModel).provider,'aux');
});

test('actual credential/provider/selection files prepare changed bytes without touching login registry or opaque fields',()=>{
 for(const[path,value]of Object.entries(fixture.homeFiles)){
  const before=input(value),result=prepareAuxProviderJsonFile({path,bytes:before});assert.deepEqual(result.before,before);assert.deepEqual(before,input(value));
  const parsed=JSON.parse(result.after);
  if(path==='accounts.json'){assert.equal(result.changed,false);assert.deepEqual(result.after,before);assert.equal(parsed.accounts[0].provider,'anonymous');assert.equal(parsed.accounts[1].provider,'email');assert.equal(parsed.sessions['1'].refreshToken,'synthetic-refresh-fixture')}
  if(path.endsWith('/credentials.json')){assert.deepEqual(parsed.aux,value.aside);assert.deepEqual(parsed['vercel-ai-gateway'],value['vercel-ai-gateway']);assert.ok(!Object.hasOwn(parsed,'credentialStore'))}
  if(path.endsWith('/settings.json')){assert.equal(parsed.defaultModel.modelId,value.defaultModel.modelId);assert.equal(parsed.modelCategories.fast.provider,'aux');assert.deepEqual(parsed.auxModelCatalog,value.asideModelCatalog)}
  if(path==='u/0/cache/models.json')assert.deepEqual(parsed['["models","provider-catalog","aux"]'],value['["models","provider-catalog","aside"]']);
  assert.equal(prepareAuxProviderJsonFile({path,bytes:result.after}).changed,false);
 }
 const credentials={aside:{type:'oauth',access:'opaque-access',refresh:'opaque-refresh',expires:55,custom:{provider:'aside',nonce:'kept',ciphertext:'opaque-fixture'}},google:{type:'api_key',key:'other-fixture'}};
 assert.deepEqual(JSON.parse(prepareAuxProviderJsonFile({path:'u/1/credentials.json',bytes:input(credentials)}).after).aux,credentials.aside);
 const settings={defaultModel:{provider:'aside',modelId:'keep',thinkingLevel:'high',fastMode:true},imageGenerationModel:{provider:'aside',modelId:'image-kept'},customModels:[{id:'custom-kept',provider:'aside',api:'aside-provider',headers:{asideSource:'unchanged-header'},compat:{provider:'aside'}}],modelCategories:{visual:{provider:'aside',modelId:'visual-kept'}},unrelated:{provider:'aside'}};
 const changed=JSON.parse(prepareAuxProviderJsonFile({path:'u/1/settings.json',bytes:input(settings)}).after);
 assert.equal(changed.imageGenerationModel.provider,'aux');assert.equal(changed.customModels[0].provider,'aux');assert.equal(changed.customModels[0].headers.asideSource,'unchanged-header');assert.equal(changed.unrelated.provider,'aside');
});

test('actual models JSON line-comment/trailing-comma semantics preserve commands, headers and unknown config',()=>{
 const original=daemon.match(/(function stripJsonComments\(Cn\)\{[\s\S]*?\})function applyProviderDefaults/)?.[1];assert.ok(original);
 const context={strip:undefined};runInNewContext(original+';globalThis.strip=stripJsonComments',context);
 const json=`{ // comment\n "providers":{"aside":{"apiKey":"!printf fixture-not-executed","api":"aside-provider","asideDisconnected":true,"headers":{"X-URL":"https://example.com/a//b","asideSource":"kept"},"models":[{"id":"chosen-kept","asideSource":"openrouter_catalog",}],"custom":{"provider":"aside"},},},}`;
 assert.equal(stripProvidedModelsJsonComments(json),context.strip(json));
 const prepared=prepareAuxProviderJsonFile({path:'u/3/models.json',bytes:Buffer.from(json)}),config=JSON.parse(prepared.after).providers.aux;
 assert.equal(config.apiKey,'!printf fixture-not-executed');assert.equal(config.api,'aux-provider');assert.equal(config.auxDisconnected,true);assert.equal(config.models[0].auxSource,'openrouter_catalog');assert.equal(config.models[0].id,'chosen-kept');assert.equal(config.headers.asideSource,'kept');assert.equal(config.custom.provider,'aside');
 const untouched=Buffer.from('{"providers": {"openai": {"apiKey":"kept",},},}');assert.deepEqual(prepareAuxProviderJsonFile({path:'u/3/models.json',bytes:untouched}).after,untouched);
});

test('unsupported paths, malformed/conflicting snapshots and invalid selection fields refuse before a commit exists',()=>{
 for(const path of ['../accounts.json','u/01/settings.json','u/0/../settings.json','u/9007199254740992/settings.json','u/0/state.db','backups/accounts/a.json'])assert.throws(()=>prepareAuxProviderJsonFile({path,bytes:input({})}),/Unsupported/);
 for(const[path,value]of [['u/0/credentials.json',{aside:{},aux:{}}],['u/0/models.json',{providers:{aside:{},aux:{}}}],['u/0/settings.json',{asideModelCatalog:{},auxModelCatalog:{}}],['u/0/settings.json',{defaultModel:{provider:'aside',modelId:7}}],['u/0/settings.json',{modelCategories:{fast:[]}}],['accounts.json',{accounts:[{provider:'aux'}]}]])assert.throws(()=>prepareAuxProviderJsonFile({path,bytes:input(value)}),/Invalid|Ambiguous/);
 for(const bytes of [Buffer.from('{bad'),Buffer.from('{"aside":{},"aside":{}}'),Buffer.from([0xef,0xbb,0xbf,0x7b,0x7d]),Buffer.from([0xff])])assert.throws(()=>prepareAuxProviderJsonFile({path:'u/0/credentials.json',bytes}),/Invalid/);
});

test('account-qualified renderer preparation migrates visible IDs and preserves other accounts and provider fields',()=>{
 const entries={...fixture.extensionOriginStorage.localStorage,'aside.agent-settings.v2:1':JSON.stringify({modelProvider:'openai',modelId:'other-account'})};
 const inventory=JSON.parse(entries['aside.settings-inventory.v1:0']);inventory.availableModels=[{id:'kept',provider:'aside',name:'unchanged'}];inventory.connectedProviders[0].hasModelsJsonAuth=true;entries['aside.settings-inventory.v1:0']=JSON.stringify(inventory);
 const operations=prepareAuxProviderRendererStorage({accountId:0,entries}).operations;assert.equal(operations.length,2);
 const next=JSON.parse(operations.find(op=>op.targetKey==='aux.settings-inventory.v2:0').after);assert.equal(next.availableModels[0].provider,'aux');assert.equal(next.availableModels[0].id,'kept');assert.equal(next.connectedProviders[0].providerId,'aux');assert.equal(next.connectedProviders[0].hasModelsJsonAuth,true);assert.deepEqual(next.visibleModelIdsByProvider.aux,['fixture-model']);assert.equal(entries['aside.agent-settings.v2:1'],JSON.stringify({modelProvider:'openai',modelId:'other-account'}));assert.equal(operations.some(op=>op.sourceKey.endsWith(':1')),false);
 const generic=migrateAuxProviderState({version:1,browserStorage:entries});assert.deepEqual(JSON.parse(generic.browserStorage['aux.settings-inventory.v2:0']).visibleModelIdsByProvider.aux,['fixture-model']);
 assert.throws(()=>prepareAuxProviderRendererStorage({accountId:0,entries:{...entries,'aux.agent-settings.v3:0':'{}'}}),/Ambiguous/);
 const collision={...inventory,visibleModelIdsByProvider:{aside:['one'],aux:['other']}};assert.throws(()=>prepareAuxProviderRendererStorage({accountId:0,entries:{'aside.settings-inventory.v1:0':JSON.stringify(collision)}}),/Ambiguous/);
 assert.throws(()=>prepareAuxProviderRendererStorage({accountId:'0',entries}),/account identity/);
});
