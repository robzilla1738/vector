import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import test from 'node:test';
import { applyCloudCookieProfileAdapter, cloudCookieProfileDaemonHelpers, cloudCookieProfileAgentHelpers } from './cloud-cookie-profile.mjs';
import { composeCloudDesktop } from './cloud-desktop-composition.mjs';

const { z } = createRequire(new URL('../../services/aux-cloud/package.json', import.meta.url))('zod');
const agent = await readFile(new URL('../../out/provided-source-snapshot-1.26.1016.1852/agent/background.js', import.meta.url), 'utf8');
const shippedAgent = await readFile(new URL('../../out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/extension/dist/background.js', import.meta.url), 'utf8');
const daemon = await readFile(new URL('../../out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs', import.meta.url), 'utf8');
const nativeContext = () => ({ profileId:'profile-fixture', boundAccountId:1, boundUserId:'user-fixture', isRegularProfile:true, isOffTheRecord:false, hasAccountSession:true, accountAuthPaused:false, cookieRestoreEpoch:'restore-fixture', cookieRestorePending:false, cookieBindingEpoch:'epoch-fixture', browserContextId:'native-fixture', profilePath:'/never-export' });

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
  const restore={method:'Aside.restoreCookieSnapshot',params:{...request.params,generation:0,browserContextId:'native-fixture',cookieBindingEpoch:'epoch-fixture',revision:3,objectSha256:'a'.repeat(64),cookies:[{name:'fixture',value:'private-fixture',domain:'example.invalid'}]}};
  assert.deepEqual(context.e.cookieRestoreRequestSchema.parse(restore),restore);
  assert.throws(()=>context.e.cookieRestoreRequestSchema.parse({...restore,params:{...restore.params,cookies:null}}));
  const daemonResult=composeCloudDesktop({component:'daemon',path:'entry.mjs',text:daemon},{enableCloud:true,profile:'development'});
  const daemonSchema=daemonResult.anchors.find(anchor=>anchor.name==='daemon bridge cookie-context schema').replace;
  const daemonContext=vm.createContext({Cn:{},object:z.object,literal:z.literal,number$2:z.number,string$3:z.string,array:z.array,unknown$1:z.unknown});
  new vm.Script(daemonSchema.slice(0,daemonSchema.indexOf('let Ri='))).runInContext(daemonContext);
  assert.deepEqual(daemonContext.Cn.cookieRestoreRequestSchema.parse(restore),restore);
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
  for(const [key,value] of Object.entries({profileId:'wrong',boundAccountId:2,boundUserId:'wrong',isRegularProfile:false,isOffTheRecord:true,hasAccountSession:false,accountAuthPaused:true,cookieRestorePending:true,cookieRestoreEpoch:'',cookieBindingEpoch:'',browserContextId:''})){
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
  const context=vm.createContext({isSyncEnabled:()=>true,AccountRegistry:{getAccount:()=>account,getSession:()=>({accessToken:'fixture'}),getAll:()=>state,getAccountIdForProfile:()=>1},readAccessTokenSyncGeneration:()=>0,
    sendCommandToExtension:async(command,route)=>{
      assert.equal(command.method,'Aside.getCookieSyncContext');assert.equal(route.accountId,1);assert.equal(route.profileId,binding.profileId);assert.equal(route.browserMode,'default');
      nativeCalls++;
      if(mutateAt==='native-await')binding.updatedAt++;
      return {...nativeContext(),cookieRestoreEpoch:mutateAt==='restore-epoch'&&nativeCalls>1?'new-restore':'restore-fixture',cookieRestorePending:mutateAt==='restore-pending',isOffTheRecord:privateContext,cookieBindingEpoch:mutateAt==='epoch'&&nativeCalls>1?'new-epoch':'epoch-fixture',browserContextId:mutateAt==='context'&&nativeCalls>1?'new-context':'native-fixture'};
    },globalCdpClient:{ensureConnected:async()=>{if(mutateAt==='connect')binding.updatedAt++;},send:async(method,params)=>{
      reads++;assert.equal(method,'Storage.getCookies');assert.equal(params.browserContextId,'native-fixture');
      if(mutateAt==='read')binding.updatedAt++;
      return {cookies:[{name:'fixture',priority:'High',sourceScheme:'Secure',sourcePort:443}]};
    }}});
  new vm.Script(cloudCookieProfileDaemonHelpers).runInContext(context);
  context.realRestoreCookiesOnce=context.auxCloudRestoreCookiesOnce;
  context.auxCloudRestoreCookiesOnce=async()=>true;
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
  for(const mutateAt of ['native-await','connect','read','epoch','context','restore-epoch','restore-pending']) {
    const fixture=captureFixture({mutateAt});
    await assert.rejects(fixture.context.syncCookies(1,()=>true),mutateAt==='restore-pending'?/unavailable/:/changed/);
    if(['native-await','connect','restore-pending'].includes(mutateAt))assert.equal(fixture.reads,0);
  }
  for(const options of [{duplicate:true},{privateContext:true}]) {
    const fixture=captureFixture(options);
    await assert.rejects(fixture.context.syncCookies(1,()=>true));
    assert.equal(fixture.reads,0);
  }
  const canceled=captureFixture();await canceled.context.syncCookies(1,()=>false);assert.equal(canceled.nativeCalls,0);assert.equal(canceled.reads,0);
});

function restoreFixture(options={}) {
  const fixture=captureFixture(options),context=fixture.context;
  const schemaStart=daemon.indexOf('cookieParamSchema=object('),schemaEnd=daemon.indexOf(',discriminatedUnion(`encryption`',schemaStart);
  assert.ok(schemaStart>=0&&schemaEnd>schemaStart);
  const schema=new vm.Script(daemon.slice(schemaStart+'cookieParamSchema='.length,schemaEnd)).runInNewContext({object:z.object,string$3:z.string,boolean$1:z.boolean,number$2:z.number,_enum:z.enum,unknown$1:z.unknown});
  const cloudFilterStart=daemon.indexOf('function isCloudExcludedCookieDomain('),cloudFilterEnd=daemon.indexOf('var EXCLUDED_COOKIE_DOMAIN',cloudFilterStart);
  const regexStart=daemon.indexOf('EXCLUDED_COOKIE_DOMAIN=/',cloudFilterEnd),regexEnd=daemon.indexOf('}));',regexStart);
  assert.ok(cloudFilterStart>=0&&cloudFilterEnd>cloudFilterStart&&regexStart>cloudFilterEnd&&regexEnd>regexStart);
  new vm.Script(daemon.slice(cloudFilterStart,cloudFilterEnd)+daemon.slice(regexStart,regexEnd)+';').runInContext(context);
  const filterStart=daemon.indexOf('function isExcludedDomain('),filterEnd=daemon.indexOf('async function syncCookies(',filterStart);
  assert.ok(filterStart>=0&&filterEnd>filterStart);
  new vm.Script(daemon.slice(filterStart,filterEnd)).runInContext(context);
  context.URL=URL;
  context.globalCdpClient={ensureConnected(){throw Error('Restore preflight must not access CDP.');},send(){throw Error('Restore preflight must not access CDP.');}};
  context.EXCLUDED_HOSTS=new Set(['localhost','127.0.0.1','dev-cloud.getaux.co']);
  context.init_cookies=()=>{};
  context.auxCloudCookieSnapshot=value=>({...value,cookies:value.cookies.map(cookie=>schema.parse(cookie))});
  const good={name:'synthetic',value:'private-fixture',domain:'.example.invalid',path:'/',priority:'High',sourceScheme:'Secure',sourcePort:443,partitionKey:{topLevelSite:'https://example.invalid',hasCrossSiteAncestor:true}};
  const recovered={userId:'user-fixture',generation:0,metadata:{revision:3},snapshot:{formatVersion:1,encryption:'none',capturedAt:1,cookies:options.cookies??[good]}};
  let reads=0;
  context.auxCloudReadCookieSnapshot=async()=>{reads++;if(options.onRead)await options.onRead(context,recovered);return options.missing?null:recovered;};
  return {...fixture,context,recovered,good,get snapshotReads(){return reads;}};
}

test('restore preflight reuses original filters and preserves eligible CDP fields without cookie access', async () => {
  const fixture=restoreFixture();
  fixture.recovered.snapshot.cookies.push(...['localhost','127.0.0.1','127.0.0.2','[::1]','accounts.GETAUX.co','.getaux.co','getaux.co.','clerk.com','fixture.clerk.accounts.dev','google.com','mail.google.com','youtube.com','images.googleusercontent.com'].map(domain=>({...fixture.good,domain})),{...fixture.good,name:'expired',expires:1});
  const plan=await fixture.context.auxCloudPrepareCookieRestore(1,()=>true);
  assert.equal(plan.cookies.length,1);assert.equal(plan.cookies[0].sourcePort,443);assert.equal(plan.cookies[0].priority,'High');assert.equal(plan.cookies[0].partitionKey.topLevelSite,'https://example.invalid');
  assert.equal(plan.binding.generation,0);assert.equal(plan.nativeContext.browserContextId,'native-fixture');
  assert.equal(fixture.recovered.snapshot.cookies.length,0);
  // The helper must not touch even the fake CDP jar or extension cookie API.
  assert.equal(fixture.context.chrome,undefined);
  assert.equal(fixture.context.auxCloudCookieDomainExcluded('getaux.co.evil.invalid'),false);
  assert.equal(fixture.context.auxCloudCookieDomainExcluded('www.example.invalid'),false);
});

test('restore preflight refuses changed native/remote ownership and invalid partition/domain parameters', async () => {
  for(const mutateAt of ['native-await','epoch','context','restore-epoch']) {
    const fixture=restoreFixture({mutateAt});
    await assert.rejects(fixture.context.auxCloudPrepareCookieRestore(1,()=>true),/changed/);
    if(mutateAt!=='native-await')assert.equal(fixture.recovered.snapshot.cookies.length,0);
  }
  for(const change of [{userId:'wrong-user'},{generation:2}]) {
    const fixture=restoreFixture({onRead:(_context,recovered)=>Object.assign(recovered,change)});
    await assert.rejects(fixture.context.auxCloudPrepareCookieRestore(1,()=>true),/owner or generation/);
    assert.equal(fixture.recovered.snapshot.cookies.length,0);
  }
  for(const change of [{domain:undefined},{domain:'example.invalid/path'},{sourcePort:65536},{sourcePort:0},{partitionKey:{topLevelSite:'null',hasCrossSiteAncestor:false}},{partitionKey:{topLevelSite:'https://example.invalid',hasCrossSiteAncestor:true,opaque:true}},{partitionKey:{topLevelSite:'https://example.invalid/path',hasCrossSiteAncestor:false}}]) {
    const fixture=restoreFixture();fixture.recovered.snapshot.cookies=[{...fixture.good,...change}];
    await assert.rejects(fixture.context.auxCloudPrepareCookieRestore(1,()=>true));
    assert.equal(fixture.recovered.snapshot.cookies.length,0);
  }
  const canceled=restoreFixture();assert.equal(await canceled.context.auxCloudPrepareCookieRestore(1,()=>false),null);assert.equal(canceled.snapshotReads,0);
  const missing=restoreFixture({missing:true});assert.equal(await missing.context.auxCloudPrepareCookieRestore(1,()=>true),null);
  const lateCancel=restoreFixture();let active=true;lateCancel.context.auxCloudReadCookieSnapshot=async()=>{active=false;return lateCancel.recovered;};assert.equal(await lateCancel.context.auxCloudPrepareCookieRestore(1,()=>active),null);assert.equal(lateCancel.recovered.snapshot.cookies.length,0);
});

test('actual complete capture excludes Aux/Clerk and retains original expiry/opaque-partition filtering', async () => {
  const fixture=restoreFixture(),context=fixture.context;
  const cookies=[fixture.good,...['accounts.GETAUX.co.','fixture.clerk.accounts.dev','[::1]','127.0.0.2','google.com'].map(domain=>({...fixture.good,domain})),{...fixture.good,expires:1},{...fixture.good,partitionKeyOpaque:true}];
  context.globalCdpClient={ensureConnected:async()=>{},send:async(method,params)=>{assert.equal(method,'Storage.getCookies');assert.equal(params.browserContextId,'native-fixture');return {cookies};}};
  context.TextEncoder=TextEncoder;
  context.sha256Hex=bytes=>createHash('sha256').update(bytes).digest('hex');
  context.loadCookieSnapshotSha=()=>null;
  let uploaded,saved;
  context.putRemoteCookies=async(accountId,snapshot)=>{assert.equal(accountId,1);uploaded=snapshot;};
  context.saveCookieSnapshotSha=(_accountId,hash)=>{saved=hash;};
  context.logger={info(){}};
  const encodeStart=daemon.indexOf('function encodeCookies('),encodeEnd=daemon.indexOf('var cipherAlgorithmSchema',encodeStart);
  assert.ok(encodeStart>=0&&encodeEnd>encodeStart);
  new vm.Script(daemon.slice(encodeStart,encodeEnd)).runInContext(context);
  const composed=composeCloudDesktop({component:'daemon',path:'entry.mjs',text:daemon},{enableCloud:true,profile:'development'}).text;
  const start=composed.indexOf('async function syncCookies('),end=composed.indexOf('async function clearRemoteCookies(',start);
  assert.ok(start>=0&&end>start);
  new vm.Script(composed.slice(start,end)).runInContext(context);
  await context.syncCookies(1,()=>true);
  assert.equal(uploaded.cookies.length,1);assert.equal(uploaded.cookies[0].value,'private-fixture');assert.equal(uploaded.cookies[0].priority,'High');assert.equal(uploaded.cookies[0].sourcePort,443);assert.equal(saved,context.sha256Hex(new TextEncoder().encode(JSON.stringify(uploaded.cookies))));
});

test('Agent restore uses the existing native importer only for its exact verified context', async () => {
  let current=nativeContext(),imports=0,complete=true;
  const params={accountId:1,profileId:'profile-fixture',userId:'user-fixture',generation:0,browserContextId:'native-fixture',cookieBindingEpoch:'epoch-fixture',revision:3,objectSha256:'a'.repeat(64),cookies:[]};
  const context=vm.createContext({chrome:{extension:{inIncognitoContext:false},auxAccount:{getProfileContext:async()=>current},auxBrowserImport:{startImport:async options=>{imports++;assert.equal(options.source,'aux-cloud-cookies');assert.equal(options.profileId,params.profileId);assert.equal(options.browserContextId,params.browserContextId);current={...current,cookieRestoreEpoch:'rotated-by-own-restore'};return {complete};}}}});
  new vm.Script(cloudCookieProfileAgentHelpers).runInContext(context);
  assert.equal((await context.auxCloudRestoreCookieSnapshot({...params,source:'unrelated-source'})).complete,true);assert.equal(imports,1);
  await assert.rejects(context.auxCloudRestoreCookieSnapshot({...params,cookieBindingEpoch:'wrong'}),/unavailable/);assert.equal(imports,1);
  current={...nativeContext(),isOffTheRecord:true};await assert.rejects(context.auxCloudRestoreCookieSnapshot(params),/does not match/);assert.equal(imports,1);
  current=nativeContext();complete=false;await assert.rejects(context.auxCloudRestoreCookieSnapshot(params),/did not complete/);
});

function consumerFixture(options={}) {
  const fixture=restoreFixture(),context=fixture.context,events=[];
  let imports=0,reads=0,generation=0;
  const getContext=context.sendCommandToExtension;
  context.auxCloudRestoreCookiesOnce=context.realRestoreCookiesOnce;
  context.readAccessTokenSyncGeneration=()=>generation;
  context.auxCloudReadCookieSnapshot=async()=>{reads++;events.push('snapshot');return {userId:'user-fixture',generation,metadata:{revision:3,objectSha256:'a'.repeat(64)},snapshot:{formatVersion:1,encryption:'none',capturedAt:1,cookies:[{...fixture.good}]}};};
  context.sendCommandToExtension=async(command,route)=>{
    if(command.method==='Aside.getCookieSyncContext')return {...await getContext(command,route),cookieRestoreEpoch:'restore-'+imports};
    assert.equal(command.method,'Aside.restoreCookieSnapshot');assert.equal(route.accountId,1);assert.equal(route.profileId,'profile-fixture');assert.equal(route.browserMode,'default');
    imports++;events.push('native');
    assert.equal(command.params.generation,generation);assert.equal(command.params.cookies[0].value,'private-fixture');
    if(options.onImport)await options.onImport(context,command,imports);
    if(options.failFirst&&imports===1)throw Error('Synthetic native restore refused');
    return {complete:true,imported:1,skipped:0};
  };
  context.globalCdpClient={ensureConnected:async()=>{},send:async(method,params)=>{events.push('capture');assert.equal(method,'Storage.getCookies');assert.equal(params.browserContextId,'native-fixture');return {cookies:[{...fixture.good}]};}};
  return {context,events,get imports(){return imports;},get reads(){return reads;},set generation(value){generation=value;}};
}

test('restore consumer deduplicates work per binding/generation and restores before capture', async()=>{
  const fixture=consumerFixture(),context=fixture.context;
  assert.deepEqual(await Promise.all([context.auxCloudRestoreCookiesOnce(1,()=>true),context.auxCloudRestoreCookiesOnce(1,()=>true)]),[true,true]);
  assert.equal(fixture.imports,1);assert.equal(fixture.reads,1);
  await context.syncCookies(1,()=>true);assert.deepEqual(fixture.events,['snapshot','native','capture']);
  fixture.generation=1;await context.auxCloudRestoreCookiesOnce(1,()=>true);assert.equal(fixture.imports,2);
});

test('restore failure blocks capture and can retry; canceled or rebound work is not cached', async()=>{
  const failed=consumerFixture({failFirst:true});
  await assert.rejects(failed.context.syncCookies(1,()=>true),/restore refused/);assert.equal(failed.events.includes('capture'),false);
  await failed.context.syncCookies(1,()=>true);assert.equal(failed.imports,2);assert.equal(failed.events.at(-1),'capture');
  let active=true;
  const canceled=consumerFixture({onImport:()=>{active=false;}});
  await canceled.context.syncCookies(1,()=>active);assert.equal(canceled.events.includes('capture'),false);
  active=true;await canceled.context.auxCloudRestoreCookiesOnce(1,()=>true);assert.equal(canceled.imports,2);
  const rebound=consumerFixture({onImport:context=>{context.AccountRegistry.getAccount().incarnationId='new-incarnation';}});
  await assert.rejects(rebound.context.syncCookies(1,()=>true),/binding changed/);assert.equal(rebound.events.includes('capture'),false);
  const disabled=consumerFixture();disabled.context.isSyncEnabled=()=>false;await disabled.context.syncCookies(1,()=>true);assert.equal(disabled.reads,0);assert.equal(disabled.imports,0);assert.deepEqual(disabled.events,[]);
  const turnedOff=consumerFixture({onImport:context=>{context.isSyncEnabled=()=>false;}});await turnedOff.context.syncCookies(1,()=>true);assert.equal(turnedOff.events.includes('capture'),false);
});
