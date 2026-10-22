import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import test from 'node:test';
import { applyCloudCookieProfileAdapter, cloudCookieProfileDaemonHelpers, cloudCookieProfileAgentHelpers } from './cloud-cookie-profile.mjs';
import { composeCloudDesktop } from './cloud-desktop-composition.mjs';

const { z } = createRequire(new URL('../../services/aux-cloud/package.json', import.meta.url))('zod');
const agent = await readFile(new URL('../../out/provided-source-snapshot-1.26.1016.1852/agent/background.js', import.meta.url), 'utf8');
const shippedAgent = await readFile(new URL('../../out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/extension/dist/background.js', import.meta.url), 'utf8');
const daemon = await readFile(new URL('../../out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs', import.meta.url), 'utf8');
const nativeContext = () => ({ profileId:'profile-fixture', boundAccountId:1, boundUserId:'user-fixture', isRegularProfile:true, isOffTheRecord:false, hasAccountSession:true, accountAuthPaused:false, cookieBindingEpoch:'epoch-fixture', browserContextId:'native-fixture', profilePath:'/never-export' });

test('actual supplied Agent replays all three anchors and accepts the additive command schema', () => {
  const input={ component:'agent', path:'background.js', text:agent };
  const result=applyCloudCookieProfileAdapter(input);
  assert.equal(result.anchors.length,3);
  let replay=agent;
  for(const anchor of result.anchors){assert.equal(replay.split(anchor.find).length-1,1);replay=replay.replace(anchor.find,()=>anchor.replace);}
  assert.equal(replay,result.text);
  assert.throws(()=>applyCloudCookieProfileAdapter({...input,text:result.text}),/anchor changed/);
  const schema=result.anchors[1].replace.split('\n')[0];
  const context=vm.createContext({ e:{}, m:z.object, E:z.literal, T:z.number, p:z.string });
  new vm.Script(schema).runInContext(context);
  const request={method:'Aside.getCookieSyncContext',params:{accountId:1,profileId:'profile-fixture',userId:'user-fixture'}};
  assert.deepEqual(context.e.cookieSyncContextRequestSchema.parse(request),request);
  assert.throws(()=>context.e.cookieSyncContextRequestSchema.parse({...request,params:{...request.params,accountId:-1}}));
  const shippedInput={...input,text:shippedAgent};
  const composed=composeCloudDesktop(shippedInput,{enableCloud:true,profile:'development'});
  execFileSync(process.execPath,['--check','--input-type=module'],{input:composed.text,stdio:['pipe','pipe','pipe']});
  assert.equal(composeCloudDesktop(shippedInput).text,shippedAgent);
});

test('Agent context is metadata-only and rejects private, paused or mismatched profiles', async () => {
  let current=nativeContext();
  const context=vm.createContext({chrome:{extension:{inIncognitoContext:false},auxAccount:{getProfileContext:async()=>current}}});
  new vm.Script(cloudCookieProfileAgentHelpers).runInContext(context);
  const params={accountId:1,profileId:'profile-fixture',userId:'user-fixture'};
  const result=await context.auxCloudGetCookieSyncContext(params);
  assert.equal(result.browserContextId,'native-fixture');
  assert.equal('profilePath' in result,false);
  for(const [key,value] of Object.entries({profileId:'wrong',boundAccountId:2,boundUserId:'wrong',isRegularProfile:false,isOffTheRecord:true,hasAccountSession:false,accountAuthPaused:true,cookieBindingEpoch:'',browserContextId:''})){
    current={...nativeContext(),[key]:value};
    await assert.rejects(context.auxCloudGetCookieSyncContext(params),/does not match/);
  }
  context.chrome.extension.inIncognitoContext=true;
  await assert.rejects(context.auxCloudGetCookieSyncContext(params),/unavailable/);
});

function captureFixture({mutateAt,privateContext=false,duplicate=false}={}) {
  const account={mode:'cloud',userId:'user-fixture',createdAt:'fixture',incarnationId:'incarnation'};
  const binding={profileId:'profile-fixture',userId:'user-fixture',updatedAt:1};
  const state={profileBindings:{one:binding},profileAccountBindings:{'profile-fixture':{updatedAt:1}}};
  if(duplicate)state.profileBindings.two={...binding};
  let nativeCalls=0,reads=0;
  const context=vm.createContext({AccountRegistry:{getAccount:()=>account,getSession:()=>({accessToken:'fixture'}),getAll:()=>state,getAccountIdForProfile:()=>1},readAccessTokenSyncGeneration:()=>0,
    sendCommandToExtension:async(command,route)=>{
      assert.equal(command.method,'Aside.getCookieSyncContext');assert.equal(route.accountId,1);assert.equal(route.profileId,binding.profileId);assert.equal(route.browserMode,'default');
      nativeCalls++;
      if(mutateAt==='native-await')binding.updatedAt++;
      return {...nativeContext(),isOffTheRecord:privateContext,cookieBindingEpoch:mutateAt==='epoch'&&nativeCalls>1?'new-epoch':'epoch-fixture',browserContextId:mutateAt==='context'&&nativeCalls>1?'new-context':'native-fixture'};
    },globalCdpClient:{ensureConnected:async()=>{if(mutateAt==='connect')binding.updatedAt++;},send:async(method,params)=>{
      reads++;assert.equal(method,'Storage.getCookies');assert.equal(params.browserContextId,'native-fixture');
      if(mutateAt==='read')binding.updatedAt++;
      return {cookies:[{name:'fixture',priority:'High',sourceScheme:'Secure',sourcePort:443}]};
    }}});
  new vm.Script(cloudCookieProfileDaemonHelpers).runInContext(context);
  const result=composeCloudDesktop({component:'daemon',path:'entry.mjs',text:daemon},{enableCloud:true,profile:'development'});
  const capture=result.anchors.find(anchor=>anchor.name==='capture cookies only through verified native browser context').replace;
  // Execute the actual patched capture prefix, stopping at the untouched original filters/upload.
  new vm.Script(capture+'return ni;}').runInContext(context);
  return {context,get reads(){return reads;},get nativeCalls(){return nativeCalls;}};
}

test('capture pins explicit native context and retains full CDP cookie attributes', async () => {
  const fixture=captureFixture();
  const cookies=await fixture.context.syncCookies(1,()=>true);
  assert.equal(cookies[0].sourcePort,443);assert.equal(cookies[0].priority,'High');assert.equal(fixture.nativeCalls,2);assert.equal(fixture.reads,1);
});

test('capture rejects binding races and native epoch/context changes before upload', async () => {
  for(const mutateAt of ['native-await','connect','read','epoch','context']) {
    const fixture=captureFixture({mutateAt});
    await assert.rejects(fixture.context.syncCookies(1,()=>true),/changed/);
    if(['native-await','connect'].includes(mutateAt))assert.equal(fixture.reads,0);
  }
  for(const options of [{duplicate:true},{privateContext:true}]) {
    const fixture=captureFixture(options);
    await assert.rejects(fixture.context.syncCookies(1,()=>true));
    assert.equal(fixture.reads,0);
  }
  const canceled=captureFixture();await canceled.context.syncCookies(1,()=>false);assert.equal(canceled.nativeCalls,0);assert.equal(canceled.reads,0);
});
