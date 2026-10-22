import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext,SourceTextModule} from 'node:vm';
import test from 'node:test';
import {findMachOSeaSection,readSeaBlob} from '../aside/lib/sea.mjs';
import {applyAuxProviderIdentity,auxProviderIdentityInputs,migrateAuxProviderState} from './aux-provider-identity.mjs';
const root='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852';
const binary=readFileSync(root+'/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(binary);
const daemon=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const brand=t=>t.replaceAll('ASIDE_','AUX_').replaceAll('Aside','Aux');
const z=createRequire(new URL('../../services/aux-cloud/package.json',import.meta.url))('zod').z;

test('all pinned actual provider modules replay in supplied and Aux symbol variants, preserving syntax and HTML',()=>{
 for(const input of auxProviderIdentityInputs){
  const original=input.component==='daemon'?daemon:readFileSync(root+'/agent/'+input.path,'utf8');
  for(const branding of ['supplied','aux']){
   const text=branding==='aux'?brand(original):original;
   const result=applyAuxProviderIdentity({...input,original,text,branding});
   assert.ok(result.anchors.length);
   assert.throws(()=>applyAuxProviderIdentity({...input,original,text:result.text,branding}),/drift/);
   assert.throws(()=>applyAuxProviderIdentity({...input,original:original+' ',text,branding}),/pin/);
   // Parse actual minified code without executing application startup.
   new SourceTextModule(result.text);
   if(input.component==='daemon'){
    assert.ok(result.text.includes('AUX_PROVIDER_ID=`aux`')||result.text.includes('ASIDE_PROVIDER_ID=`aux`'));
    assert.ok(result.text.includes('aside: "complementary"'));
    assert.ok(result.text.includes('case`article`:case`aside`:case`blockquote`'));
   }
  }
 }
 const html='const t=jsx("aside",{className:"same"});';
 assert.equal(applyAuxProviderIdentity({component:'agent',path:'assets/route-TQyeTEXE.js',text:html}).text,html);
});

test('actual supplied catalog schema accepts new backend Aux provider and rejects the obsolete identity',()=>{
 const text=applyAuxProviderIdentity({component:'daemon',path:'entry.mjs',original:daemon,text:daemon,branding:'supplied'}).text;
 const match=text.match(/asideModelCatalogResponseSchema=(object\(\{provider:literal\(ASIDE_PROVIDER_ID\)[\s\S]*?\)),asideModelCatalogCacheSchema=/);
 assert.ok(match);
 const schema=runInNewContext(match[1],{object:z.object,literal:z.literal,array:z.array,string$3:z.string,ASIDE_PROVIDER_ID:'aux',asideModelCatalogItemSchema:z.object({id:z.string()}),asideImageModelCatalogItemSchema:z.object({id:z.string()})});
 assert.equal(schema.parse({provider:'aux',models:[{id:'gpt-aux-fast'}]}).provider,'aux');
 assert.equal(schema.safeParse({provider:'aside',models:[]}).success,false);
});

test('versioned offline migration preserves model choices, credential bytes and account-qualified cache state',()=>{
 const input={version:1,settings:{defaultModel:{provider:'aside',modelId:'kept-model',thinkingLevel:'high',fastMode:true},modelCategories:{deep:[{provider:'aside',modelId:'other-model'}]},asideModelCatalog:{added:['kept-model'],removed:['hidden-model']}},credentialStore:{aside:{apiKey:'synthetic-only',wrapped:new Uint8Array([1,2,3])},openai:{apiKey:'separate-fixture'}},modelsJson:{providers:{aside:{api:'aside-provider',asideSource:'catalog',asideDisconnected:false,apiKey:'synthetic-only',models:[{id:'kept-model'}]}}},browserStorage:{'aside.agent-settings.v2:12':JSON.stringify({modelProvider:'aside',modelId:'kept-model',fastMode:true}),'aside.settings-inventory.v1:12':JSON.stringify({availableModels:[{provider:'aside',id:'kept-model'}],connectedProviders:[{providerId:'aside'}],providerOptions:[{id:'aside'}]})},modelCatalog:{provider:'aside',models:[{id:'kept-model'}]}};
 const original=structuredClone(input),output=migrateAuxProviderState(input);
 assert.deepEqual(input,original);
 assert.equal(output.version,2);
 assert.deepEqual(output.settings.defaultModel,{...original.settings.defaultModel,provider:'aux'});
 assert.deepEqual(output.credentialStore.aux,original.credentialStore.aside);
 assert.deepEqual(output.credentialStore.openai,original.credentialStore.openai);
 assert.deepEqual(output.settings.auxModelCatalog,original.settings.asideModelCatalog);
 assert.equal(output.modelsJson.providers.aux.models[0].id,'kept-model');
 assert.equal(output.modelsJson.providers.aux.api,'aux-provider');
 assert.equal(output.modelsJson.providers.aux.auxDisconnected,false);
 assert.equal(JSON.parse(output.browserStorage['aux.agent-settings.v3:12']).modelProvider,'aux');
 assert.equal(JSON.parse(output.browserStorage['aux.settings-inventory.v2:12']).providerOptions[0].id,'aux');
 assert.deepEqual(migrateAuxProviderState(output),output);
 assert.throws(()=>migrateAuxProviderState({version:1,credentialStore:{aside:{},aux:{}}}),/Ambiguous/);
 assert.throws(()=>migrateAuxProviderState({version:1,browserStorage:{'aside.agent-settings.v2:12':'invalid'}}),/Malformed/);
});
