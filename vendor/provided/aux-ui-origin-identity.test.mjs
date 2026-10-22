import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SourceTextModule} from 'node:vm';
import test from 'node:test';
import {transformProvidedUiBoundary} from '../../scripts/lib/provided-ui-boundary.mjs';
import {transformReviewedCloudServicePolicy} from './cloud-service-policy.mjs';
import {applyAuxUiOriginIdentity,assertAuxUiOriginPairing} from './aux-ui-origin-identity.mjs';
const root='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/';
const source=path=>readFileSync(root+path,'utf8');
const manifestOriginal=source('manifest.json');
const paths=['background.js','assets/strip-markdown-DRcmtuJc.js'];
const modes=[{}, {enableCloud:true,profile:'development'}, {enableCloud:true,profile:'production'}];
const callers=options=>paths.map(path=>{
 const original=source(path),local=transformProvidedUiBoundary({component:'agent',path,text:original}).text;
 return {path,original,text:transformReviewedCloudServicePolicy({component:'agent',path,text:local},options).text};
});
const apply=(path,text,original,options)=>applyAuxUiOriginIdentity({component:'agent',path,text,original},options);
function replay(text,result){for(const anchor of result.anchors){assert.equal(text.split(anchor.find).length-1,anchor.count);text=text.split(anchor.find).join(anchor.replace);}assert.equal(result.text,text);}

test('actual manifest and both API producers pair across fixed local/development/production policies',()=>{
 for(const options of modes) {
  // Simulate preceding identity changes without changing the WAR resource cohort.
  const incoming=manifestOriginal.replaceAll('Aside','Aux');
  const result=apply('manifest.json',incoming,manifestOriginal,options);replay(incoming,result);
  const actual=JSON.parse(result.text),before=JSON.parse(incoming);
  assert.equal(JSON.stringify(actual.web_accessible_resources[0]),JSON.stringify(before.web_accessible_resources[0]));
  assert.equal(actual.permissions.join(','),before.permissions.join(','));
  assert.deepEqual(actual.host_permissions,before.host_permissions);
  const cohort=callers(options);
  for(const caller of cohort)new SourceTextModule(caller.text);
  const receipt=assertAuxUiOriginPairing({manifestText:result.text,manifestOriginal,callers:cohort},options);
  assert.equal(receipt.hostedEmbeddingVerified,false);
  if(!options.enableCloud){assert.equal(actual.web_accessible_resources.length,1);assert.deepEqual(receipt.mainExposureOrigins,[]);}
  else{const origin=options.profile==='development'?'https://dev-cloud.getaux.co':'https://api.getaux.co';assert.deepEqual(actual.web_accessible_resources[1],{resources:['main.html'],matches:[origin+'/*']});}
  assert.throws(()=>apply('manifest.json',result.text,manifestOriginal,options),/Mixed|changed|drift/);
 }
});

test('origin cohort rejects mismatched or widened permissions, wrong producers and source drift',()=>{
 const options=modes[1],manifestText=apply('manifest.json',manifestOriginal,manifestOriginal,options).text,cohort=callers(options);
 for(const mutation of [text=>text.replace('https://dev-cloud.getaux.co/*','https://*.getaux.co/*'),text=>text.replace('https://dev-cloud.getaux.co/*','https://api.aside.com/*')])assert.throws(()=>assertAuxUiOriginPairing({manifestText:mutation(manifestText),manifestOriginal,callers:cohort},options),/mismatch/);
 assert.throws(()=>assertAuxUiOriginPairing({manifestText,manifestOriginal,callers:callers(modes[2])},options),/generation/);
 assert.throws(()=>assertAuxUiOriginPairing({manifestText,manifestOriginal,callers:cohort.slice(0,1)},options),/Both/);
 assert.throws(()=>assertAuxUiOriginPairing({manifestText,manifestOriginal,callers:[cohort[0],{...cohort[1],original:cohort[1].original+' '}]},options),/source pin/);
 assert.throws(()=>apply('manifest.json',manifestOriginal,manifestOriginal+' ',options),/source pin/);
 assert.throws(()=>apply('manifest.json',manifestOriginal,manifestOriginal,{enableCloud:true,profile:'unknown'}),/reviewed/);
});

test('actual product demo hrefs use the configured Aux home while every other byte stays identical',()=>{
 for(const path of ['assets/chat-wBzshK0k.js','assets/artifact-test-CdjpLuI1.js']) {
  const original=source(path),incoming=original.replaceAll('Aside','Aux');
  const result=apply(path,incoming,original,{});replay(incoming,result);new SourceTextModule(result.text);
  assert.equal(result.text.replace('https://getaux.co','https://aside.com'),incoming);
  assert.throws(()=>apply(path,result.text,original,{}),/drift|repeated/);
 }
 for(const path of ['assets/ai-CzEX5E7S.js','assets/route-TQyeTEXE.js','assets/channels-CJn5l9_T.js']) {
  const original=source(path);assert.equal(apply(path,original,original,{}).text,original);
 }
});
