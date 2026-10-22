import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolveCloudServicePolicy,cloudBuildOptionsFromEnvironment,transformReviewedCloudServicePolicy,reviewedAuxCloudOrigins,reviewedAuxDevelopmentCloudOrigins,localUnavailableOrigins} from './cloud-service-policy.mjs';
import {adaptDaemonCode,DAEMON_CODE_SHA256} from './daemon-adapter.mjs';
import {adaptCliCode,CLI_CODE_SHA256} from './cli-adapter.mjs';
import {transformProvidedUiBoundary} from '../../scripts/lib/provided-ui-boundary.mjs';
const enable={enableCloud:true,profile:'production'};
const development={enableCloud:true,profile:'development'};
const hash=value=>createHash('sha256').update(value).digest('hex');
const originalPath=component=>new URL(`../../out/provided-source-audit/${component}-original.mjs`,import.meta.url);
function replay(before,result){let text=before;for(const a of result.anchors){assert.equal(text.split(a.find).length-1,a.count,a.name);text=text.split(a.find).join(a.replace);}assert.equal(text,result.text);}
function parses(text){execFileSync(process.execPath,['--input-type=module','--check'],{input:text,stdio:['pipe','pipe','pipe']});}

test('cloud build opt-in is explicit, fixed to Aux HTTPS origins and cannot take arbitrary endpoint values',()=>{
  assert.equal(resolveCloudServicePolicy().mode,'local');
  assert.deepEqual(resolveCloudServicePolicy(enable).origins,reviewedAuxCloudOrigins);
  assert.deepEqual(resolveCloudServicePolicy(development),{mode:'development',origins:reviewedAuxDevelopmentCloudOrigins});
  assert.deepEqual(reviewedAuxDevelopmentCloudOrigins,{api:'https://dev-cloud.getaux.co',share:'https://dev-cloud.getaux.co'});
  for(const options of [{enableCloud:'1'},{enableCloud:true},{enableCloud:true,profile:'preview'},{enableCloud:true,profile:'__proto__'},{enableCloud:true,profile:'development',api:'https://dev-cloud.getaux.co'},{enableCloud:true,profile:'production',api:'https://evil.example'},{profile:'production'},Object.create(enable)])assert.throws(()=>resolveCloudServicePolicy(options));
  assert.deepEqual(cloudBuildOptionsFromEnvironment({}),{});
  assert.deepEqual(cloudBuildOptionsFromEnvironment({AUX_ENABLE_CLOUD:'0'}),{});
  assert.deepEqual(cloudBuildOptionsFromEnvironment({AUX_ENABLE_CLOUD:'0',AUX_CLOUD_PROFILE:'development'}),{});
  assert.deepEqual(cloudBuildOptionsFromEnvironment({AUX_CLOUD_PROFILE:'development'}),{});
  assert.deepEqual(cloudBuildOptionsFromEnvironment({AUX_ENABLE_CLOUD:'1',AUX_CLOUD_PROFILE:'production'}),enable);
  assert.deepEqual(cloudBuildOptionsFromEnvironment({AUX_ENABLE_CLOUD:'1',AUX_CLOUD_PROFILE:'development'}),development);
  for(const env of [{AUX_ENABLE_CLOUD:'true'},{AUX_ENABLE_CLOUD:'1',AUX_CLOUD_PROFILE:'development',AUX_API_URL:'https://dev-cloud.getaux.co'},{AUX_ENABLE_CLOUD:'1',AUX_CLOUD_PROFILE:'dev-cloud.getaux.co'},{AUX_ENABLE_CLOUD:'1',AUX_CLOUD_PROFILE:'production',AUX_API_URL:'https://evil.example'},{AUX_ENABLE_CLOUD:'1',AUX_CLOUD_PROFILE:'https://api.getaux.co.evil.example'}])assert.throws(()=>cloudBuildOptionsFromEnvironment(env));
  const inert='http://127.0.0.1:9/aux-unavailable/api';
  assert.equal(transformReviewedCloudServicePolicy({component:'daemon',path:'entry.mjs',text:inert}).text,inert);
});

for(const [component,adapter,pinnedHash]of [['daemon',adaptDaemonCode,DAEMON_CODE_SHA256],['cli',adaptCliCode,CLI_CODE_SHA256]]){
  for(const profile of [enable,development])test(`actual pinned ${component} ${profile.profile} cloud policy replays exact anchors, fixes runtime override and preserves release/wire/crypto boundaries`,{skip:!existsSync(originalPath(component))},()=>{
    const original=readFileSync(originalPath(component),'utf8');assert.equal(hash(original),pinnedHash);
    const local=adapter(original).code;
    assert.equal(transformReviewedCloudServicePolicy({component,path:'entry.mjs',text:local}).text,local);
    const result=transformReviewedCloudServicePolicy({component,path:'entry.mjs',text:local},profile);
    replay(local,result);parses(result.text);
    assert.equal(result.policy.mode,profile.profile);
    assert.ok(result.text.includes(result.policy.origins.api));
    if(profile.profile==='development')assert.equal(result.text.includes('https://api.getaux.co'),false);
    assert.equal(result.text.includes('process.env.AUX_API_URL'),false);
    assert.equal(result.text.includes(localUnavailableOrigins.api),false);
    assert.equal(result.text.includes(localUnavailableOrigins.legacyApi),false);
    assert.equal(result.text.includes('https://api.aside.com'),false);
    for(const needle of ['http://127.0.0.1:9/aux-unavailable/releases','aside.dk.','AsideDaemonSessionToken','AsideSessionToken','Aside Daemon Auth v1','aside.daemon.auth.','Aside.'])assert.equal(result.text.split(needle).length,local.split(needle).length,needle);
    assert.throws(()=>transformReviewedCloudServicePolicy({component,path:'entry.mjs',text:result.text},profile),/anchor changed/);
    assert.throws(()=>transformReviewedCloudServicePolicy({component,path:'wrong-role.mjs',text:local},profile));
    if(component==='daemon')assert.equal(result.anchors[0].count,8);
  });
}

test('actual pinned Agent boundaries enable only the two API consumers; docs/installers and unrelated UI remain identical',()=>{
  const root=new URL('../../out/provided-source-snapshot-1.26.1016.1852/agent/',import.meta.url);
  const pins=JSON.parse(readFileSync(new URL('../../docs/source/provided-ui-inputs.json',import.meta.url),'utf8'));
  for(const path of ['background.js','assets/strip-markdown-DRcmtuJc.js','assets/channels-CJn5l9_T.js','assets/developers-DTvaoVBC.js','content/content.js']){
    const original=readFileSync(new URL(path,root),'utf8');
    const pin=pins.components.agent.files.find(p=>p.path===path);assert.equal(hash(original),pin.sourceSha256);
    const local=transformProvidedUiBoundary({component:'agent',path,text:original}).text;
    const result=transformReviewedCloudServicePolicy({component:'agent',path,text:local},enable);replay(local,result);parses(result.text);
    if(['background.js','assets/strip-markdown-DRcmtuJc.js'].includes(path)){
      assert.equal(result.anchors.length,1);assert.equal(result.anchors[0].count,1);
      assert.ok(result.text.includes(reviewedAuxCloudOrigins.api));
      assert.equal(result.text.includes(localUnavailableOrigins.api),false);
    }else assert.equal(result.text,local);
  }
  assert.throws(()=>transformReviewedCloudServicePolicy({component:'vault',path:'background.js',text:''},enable),/exclude/);
  assert.throws(()=>transformReviewedCloudServicePolicy({component:'unknown',path:'entry.mjs',text:''},enable),/Unsupported/);
});

test('development Agent origin is the same fixed reviewed HTTPS host without unrelated UI changes',()=>{
  const root=new URL('../../out/provided-source-snapshot-1.26.1016.1852/agent/',import.meta.url);
  const pins=JSON.parse(readFileSync(new URL('../../docs/source/provided-ui-inputs.json',import.meta.url),'utf8'));
  for(const path of ['background.js','assets/strip-markdown-DRcmtuJc.js']){
    const original=readFileSync(new URL(path,root),'utf8');
    assert.equal(hash(original),pins.components.agent.files.find(file=>file.path===path).sourceSha256);
    const local=transformProvidedUiBoundary({component:'agent',path,text:original}).text;
    const result=transformReviewedCloudServicePolicy({component:'agent',path,text:local},development);
    assert.equal(result.policy.mode,'development');
    assert.equal(result.anchors.length,1);
    assert.equal(result.anchors[0].replace,'https://dev-cloud.getaux.co');
    replay(local,result);parses(result.text);
  }
});
