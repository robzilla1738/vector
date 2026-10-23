import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync, symlinkSync, chmodSync, realpathSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { applyOfficialChatGPT, applyOfficialChatGPTCallbackAsset } from '../patches/chatgpt.mjs';
const require = createRequire(import.meta.url);
const { LocalChatGPTStore, ChatGPTPlanClient, ISSUER, SCOPES, planResponsesApi, completedResponsesFetch, planModels, normalizePlanPayload } = require('./aux-chatgpt.cjs');
const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...pair.publicKey.export({format:'jwk'}), kid:'fixture-key', alg:'RS256', use:'sig' };
const epoch = 1792771200000;
const jwt = (claims = {}) => {
  const h = Buffer.from(JSON.stringify({alg:'RS256',kid:'fixture-key'})).toString('base64url');
  const p = Buffer.from(JSON.stringify({iss:ISSUER,aud:'oaiapp_fixture',sub:'fixture-sub',iat:epoch/1000,exp:epoch/1000+3600,...claims})).toString('base64url');
  return `${h}.${p}.${sign('RSA-SHA256',Buffer.from(`${h}.${p}`),pair.privateKey).toString('base64url')}`;
};
function fixture(t, response = {}) {
  const dir = mkdtempSync(join(realpathSync(tmpdir()),'aux-chatgpt-fixture-')); t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const store = new LocalChatGPTStore(join(dir,'local-only'));
  let nonce, calls=[];
  const client = new ChatGPTPlanClient({store,now:()=>epoch,fetch:async(url,options)=>{
    calls.push({url:String(url),options});
    if(String(url).endsWith('jwks.json')) return new Response(JSON.stringify({keys:[jwk]}));
    if(String(url).endsWith('/oauth/token')) return new Response(JSON.stringify({access_token:'fixture-access',refresh_token:'fixture-refresh',token_type:'Bearer',expires_in:3600,scope:SCOPES,id_token:jwt({nonce}),...response}));
    throw Error('unexpected fixture request');
  }});
  const begin = id => {const result=client.begin(id,'http://127.0.0.1:1455/auth/callback','fixture-account');nonce=new URL(result.url).searchParams.get('nonce');return result;};
  const callback = (attempt, extra={})=>{let u=new URL(attempt.redirectUri);u.search=new URLSearchParams({code:'fixture-code',state:attempt.state,client_id:'oaiapp_fixture',...extra});return u.href;};
  return {dir,store,client,begin,callback,calls};
}
test('actual local registration, signature, account isolation, issued-client refresh and token-free completion',async t=>{
  const f=fixture(t), first=f.begin('fixture-flow'); const url=new URL(first.url);
  assert.equal(url.searchParams.get('client_id'),'dynamic_agent_client');assert.equal(url.searchParams.get('agent_name_hint'),'Aux');assert.equal(url.searchParams.get('resource'),'https://api.openai.com/v1');
  assert.deepEqual(await f.client.complete('fixture-flow',f.callback(first)),{status:'completed',providerId:'openai-codex'});
  assert.equal(f.store.read('another-account'),undefined);
  assert.equal(f.store.read('fixture-account').clientId,'oaiapp_fixture');
  const restarted=new LocalChatGPTStore(join(f.dir,'local-only'));assert.equal(restarted.hostId(),f.store.hostId());
  const again=f.begin('returning');assert.equal(new URL(again.url).searchParams.get('client_id'),'oaiapp_fixture');assert.equal(new URL(again.url).searchParams.has('agent_name_hint'),false);assert.equal(new URL(again.url).searchParams.has('id_token_hint'),false);
  await f.client.auth('fixture-account','fixture-access');
  const form=f.calls.filter(c=>c.url.endsWith('/oauth/token')).at(-1).options.body;
  assert.equal(form.get('client_id'),'oaiapp_fixture');assert.equal(form.get('grant_type'),'refresh_token');assert.equal(form.has('scope'),false);
  assert.equal(readdirSync(join(f.dir,'local-only')).some(n=>n.endsWith('.lock')),true);
});
test('callback state, nonce, signature, identity, permissions and replay fail closed',async t=>{
  const f=fixture(t), attempt=f.begin('bad-state');await assert.rejects(f.client.complete('bad-state',f.callback(attempt,{state:'wrong'})),/state mismatch/);assert.equal(f.calls.length,0);
  await assert.rejects(f.client.complete('bad-state',f.callback(attempt,{client_id:'dynamic_agent_client'})),/issued client/);
  const g=fixture(t,{scope:'openid profile email'}), denied=g.begin('denied');await assert.rejects(g.client.complete('denied',g.callback(denied)),/permission not granted/);assert.equal(g.store.read('fixture-account'),undefined);
  await assert.rejects(f.client.verifyIdentity(jwt({nonce:'wrong'}),'oaiapp_fixture','expected'),/nonce mismatch/);
  await assert.rejects(f.client.verifyIdentity(jwt({aud:'other'}),'oaiapp_fixture'),/audience mismatch/);
  await assert.rejects(f.client.verifyIdentity(jwt({exp:1}),'oaiapp_fixture'),/expired/);
  await assert.rejects(f.client.verifyIdentity(jwt(),'oaiapp_fixture',undefined,'different'),/account mismatch/);
  let corrupted=jwt();corrupted=corrupted.slice(0,-4)+'abcd';await assert.rejects(f.client.verifyIdentity(corrupted,'oaiapp_fixture'),/signature/);
  const ok=f.begin('once');await f.client.complete('once',f.callback(ok));await assert.rejects(f.client.complete('once',f.callback(ok)),/expired/);
});
test('unsafe storage refuses; logout retains registration and clears all local tokens',async t=>{
  const f=fixture(t), attempt=f.begin('logout');await f.client.complete('logout',f.callback(attempt));f.store.clearTokens('fixture-account');const saved=f.store.read('fixture-account');for(const k of ['access','refresh','idToken'])assert.equal(saved[k],undefined);assert.equal(saved.clientId,'oaiapp_fixture');
  const target=join(f.dir,'link');symlinkSync(join(f.dir,'local-only'),target);assert.throws(()=>new LocalChatGPTStore(target),/unsafe/);
  chmodSync(join(f.dir,'local-only'),0o755);assert.throws(()=>new LocalChatGPTStore(join(f.dir,'local-only')),/private/);
});
test('supplied Responses adapter forces public endpoint and stateless streaming after hooks',async()=>{
  let seen;const original={fixtureMetadata:'preserved',stream:(m,c,o)=>{seen={m,c,o};return 'existing-stream';},streamSimple(){}};const adapter=planResponsesApi(original);
  assert.equal(adapter.fixtureMetadata,'preserved');assert.equal(adapter.stream({id:'fixture-model',baseUrl:'https://invalid.test'},[],{onPayload:()=>({model:'fixture-model',input:[],store:true,stream:false})}),'existing-stream');assert.equal(seen.m.baseUrl,'https://api.openai.com/v1');assert.deepEqual(await seen.o.onPayload({}),{model:'fixture-model',input:[],store:false,stream:true});
});

test('inference stream requires actual completion; interrupted and incomplete streams refuse',async()=>{
  const response = text => async()=>new Response(text,{headers:{'content-type':'text/event-stream'}});
  const run = text => completedResponsesFetch(response(text))('https://api.openai.com/v1/responses',{}).then(r=>r.text());
  await assert.rejects(run('data: {"type":"response.output_text.delta","delta":"partial"}\n\n'),/response.completed/);
  await assert.rejects(run('data: {"type":"response.incomplete"}\n\n'),/incomplete/);
  assert.match(await run('data: {"type":"response.completed"}\n\n'),/response.completed/);
  await assert.rejects(completedResponsesFetch(response(''))('https://chatgpt.com/backend-api/codex/responses',{}),/unexpected/);
});
test('failed exchange retains only issued registration; cancelled in-flight exchange cannot save tokens',async t=>{
  const f=fixture(t);const first=f.begin('failed-exchange');
  const originalFetch=f.client.fetch;
  f.client.fetch=async(url,options)=>String(url).endsWith('/oauth/token')?new Response('{}',{status:400}):originalFetch(url,options);
  await assert.rejects(f.client.complete('failed-exchange',f.callback(first)),/provider request failed/);
  assert.equal(f.store.read('fixture-account'),undefined);assert.equal(f.store.registration('fixture-account').clientId,'oaiapp_fixture');
  const retry=f.begin('retry');assert.equal(new URL(retry.url).searchParams.get('client_id'),'oaiapp_fixture');
  f.client.fetch=async(url,options)=>{if(String(url).endsWith('/oauth/token'))f.client.cancel('retry');return originalFetch(url,options);};
  await assert.rejects(f.client.complete('retry',f.callback(retry)),/cancelled/);assert.equal(f.store.read('fixture-account'),undefined);
});

test('kernel auth lock survives utility exit, refuses live contenders and recovers after actual process crash', {skip:process.platform!=='darwin'}, async t=>{
  const f=fixture(t); const other=new LocalChatGPTStore(join(f.dir,'local-only'));
  let release, entered;const ready=new Promise(r=>entered=r);const hold=new Promise(r=>release=r);
  const operation=f.store.locked('same-account',async()=>{entered();await hold;});await ready;
  await assert.rejects(other.locked('same-account',()=>assert.fail('live lock stolen')),/in progress/);
  await other.locked('different-account',()=>{});release();await operation;
  const modulePath=require.resolve('./aux-chatgpt.cjs');
  const script=`const {LocalChatGPTStore}=require(process.argv[1]);new LocalChatGPTStore(process.argv[2]).locked('crash-account',async()=>{process.stdout.write('locked\\n');await new Promise(()=>{});});setInterval(()=>{},1000);`;
  const child=spawn(process.execPath,['-e',script,modulePath,join(f.dir,'local-only')],{stdio:['ignore','pipe','pipe'],env:{PATH:'/usr/bin:/bin'}});
  t.after(()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');});
  await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('lock fixture exited before holding');})]);
  const lockPath=join(f.dir,'local-only',`${createHashForFixture('crash-account')}.lock`);const before=statSync(lockPath);
  await assert.rejects(other.locked('crash-account',()=>assert.fail('live process lock stolen')),/in progress/);
  const ended=once(child,'exit');child.kill('SIGKILL');await ended;
  await other.locked('crash-account',()=>{});const after=statSync(lockPath);assert.equal(before.ino,after.ino);
  assert.equal(JSON.parse(readFileSync(lockPath)).schema,'aux.chatgpt.auth-lock.v2');
});
function createHashForFixture(value){return require('node:crypto').createHash('sha256').update(value).digest('hex');}
test('unknown legacy lock is preserved and never guessed stale',async t=>{
  const f=fixture(t),path=join(f.dir,'local-only',`${createHashForFixture('legacy')}.lock`);writeFileSync(path,'',{mode:0o600});
  await assert.rejects(f.store.locked('legacy',()=>assert.fail('legacy lock stolen')),/explicit recovery review/);assert.equal(readFileSync(path,'utf8'),'');
});
test('plan metadata uses exact supplied slugs and conservative unknown bounds without inventing capabilities',()=>{
  const supplied={id:'known',contextWindow:128000,maxTokens:16000,input:['text','image'],reasoning:true,compat:{supportsToolSearch:true}};
  const models=planModels([{slug:'unknown',displayName:'New model'},{slug:'known',displayName:'Current name'}],[supplied]);
  assert.deepEqual(models.map(m=>m.name),['New model','Current name']);assert.equal(models[0].auxPlanMetadata.capabilityVerified,false);assert.deepEqual(models[0].input,['text']);assert.equal(models[0].contextWindow,8192);
  assert.equal(models[1].contextWindow,128000);assert.deepEqual(models[1].input,['text','image']);assert.equal(models[1].compat.supportsToolSearch,false);assert.equal(models[1].compat.supportsMaxOutputTokens,false);
  assert.equal(supplied.compat.supportsToolSearch,true);
});
test('official plan payload removes unsupported fields, preserves history and local tool names, refuses unsupported tools/modalities',()=>{
  const model={id:'fixture',input:['text']};const body={model:'fixture',store:true,stream:false,max_output_tokens:100,temperature:1,previous_response_id:'old',metadata:{x:1},input:[{role:'system',content:'instructions'},{role:'user',content:'hello'}],tools:[{type:'function',name:'browser',parameters:{type:'object'}},{type:'custom',name:'shell',format:{type:'text'}}]};
  const normalized=normalizePlanPayload(body,model);for(const key of ['max_output_tokens','temperature','previous_response_id','metadata','tools'])assert.equal(key in normalized,false);
  assert.deepEqual(normalized.input[0],{type:'additional_tools',role:'developer',tools:body.tools});assert.equal(normalized.input[1].role,'developer');assert.equal(normalized.input[2].content,'hello');assert.equal(body.input[0].role,'system');assert.equal(normalized.store,false);assert.equal(normalized.stream,true);
  for(const type of ['tool_search','image_generation','mcp','computer_use_preview','programmatic_tool_calling'])assert.throws(()=>normalizePlanPayload({model:'fixture',input:[],tools:[{type}]},model),/unsupported/);
  assert.throws(()=>normalizePlanPayload({model:'fixture',input:[{role:'user',content:[{type:'input_image'}]}]},model),/not verified/);
  assert.throws(()=>normalizePlanPayload({model:'fixture',input:[{role:'user',content:[{type:'input_audio'}]}]},model),/unsupported/);
  assert.throws(()=>normalizePlanPayload({model:'different',input:[]},model),/model changed/);
});
test('rejected refresh sets truthful local expired state without exposing provider body or retrying',async t=>{
  const f=fixture(t),attempt=f.begin('expire');await f.client.complete('expire',f.callback(attempt));let requests=0;
  f.client.fetch=async()=>{requests++;return new Response(JSON.stringify({error:'invalid_grant',error_description:'fixture-sensitive-provider-body'}),{status:400});};
  await assert.rejects(f.client.auth('fixture-account','fixture-access'),error=>/connection expired/.test(error.message)&&!error.message.includes('fixture-sensitive'));
  assert.equal(f.store.read('fixture-account').state,'auth-expired');await assert.rejects(f.client.auth('fixture-account'),/connection expired/);assert.equal(requests,1);
});
test('local disconnect aborts a pending refresh and cannot resurrect cleared tokens',async t=>{
  const f=fixture(t),attempt=f.begin('refresh-cancel');await f.client.complete('refresh-cancel',f.callback(attempt));let started;
  const ready=new Promise(resolve=>started=resolve);
  f.client.fetch=async(url,options)=>new Promise((resolve,reject)=>{started();options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});});
  const refreshing=f.client.auth('fixture-account','fixture-access');await ready;f.client.disconnectLocal('fixture-account');await assert.rejects(refreshing,/Aborted/);assert.equal(f.store.read('fixture-account').access,undefined);assert.equal(f.store.read('fixture-account').refresh,undefined);
});
