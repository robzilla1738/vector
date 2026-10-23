import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync, symlinkSync, chmodSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createRequire } from 'node:module';
import { applyOfficialChatGPT, applyOfficialChatGPTCallbackAsset } from '../patches/chatgpt.mjs';
const require = createRequire(import.meta.url);
const { LocalChatGPTStore, ChatGPTPlanClient, ISSUER, SCOPES, planResponsesApi, completedResponsesFetch } = require('./aux-chatgpt.cjs');
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
  assert.equal(readdirSync(join(f.dir,'local-only')).some(n=>n.endsWith('.lock')),false);
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
  let seen;const original={stream:(m,c,o)=>{seen={m,c,o};return 'existing-stream';},streamSimple(){}};const adapter=planResponsesApi(original);
  assert.equal(adapter.stream({baseUrl:'https://invalid.test'},[],{onPayload:()=>({store:true,stream:false})}),'existing-stream');assert.equal(seen.m.baseUrl,'https://api.openai.com/v1');assert.deepEqual(await seen.o.onPayload({}),{store:false,stream:true});
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
