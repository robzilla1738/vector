import assert from 'node:assert/strict';
import {randomUUID,createHash,randomBytes} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
import {SignJWT} from 'jose';
import {del} from '@vercel/blob';
import {sql} from '../src/db';
import {app} from '../src/app';
import {encryptSyncObject,getPublicShare} from '../src/sync';

// Explicit fixture mode: never selects owner rows or creates a Clerk identity.
// This checks the real Aux DB/API/storage boundary, not email delivery/sign-in.
if(process.env.AUX_CHECK_DISPOSABLE!=='1')throw Error('Set AUX_CHECK_DISPOSABLE=1 for the new, disposable Aux database fixture.');
const ids=[randomUUID(),randomUUID()],sessions=[randomUUID(),randomUUID()],tokens:string[]=[],checks:string[]=[];
const hash=(value:Uint8Array|string)=>createHash('sha256').update(value).digest('hex');
const refresh=randomBytes(32).toString('base64url');
let syncKey:Buffer|undefined;
async function call(owner:number,path:string,expected:number,options:RequestInit={}) {
  const response=await app.request(`http://localhost/api/v1${path}`,{...options,headers:{Authorization:`Bearer ${tokens[owner]}`,...options.headers}});
  assert.equal(response.status,expected,`${options.method||'GET'} ${path}: unexpected status ${response.status}`);
  return response;
}
async function json(owner:number,path:string,body:unknown,expected=200,method='POST',headers:Record<string,string>={}) {
  return (await call(owner,path,expected,{method,headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)})).json();
}
try {
  for(let n=0;n<ids.length;n++){
    const token=await new SignJWT({sg:0,sid:sessions[n]}).setProtectedHeader({alg:'HS256'}).setSubject(ids[n]).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('15m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
    tokens.push(token);
    await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${ids[n]},${`aux_fixture:${ids[n]}`},${`${ids[n]}@example.invalid`},'Disposable API fixture')`;
    await sql`INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES(${sessions[n]},${ids[n]},${hash(token)},now()+interval '15 minutes',now()+interval '30 minutes','web')`;
  }
  await sql`INSERT INTO aux_refresh_tokens(token_hash,session_id) VALUES(${hash(refresh)},${sessions[0]})`;
  const me=await(await call(0,'/auth/me',200)).json();assert.equal(me.userId,ids[0]);checks.push('real database identity and signed-session validation');
  const resolved=await json(0,'/sync/key/resolve',{});syncKey=Buffer.from(resolved.cskB64,'base64');assert.equal(syncKey.length,32);
  const plain=Buffer.from('Aux disposable encrypted sync fixture.');
  const encrypted=encryptSyncObject(plain,syncKey,{userId:ids[0],path:'AGENTS.md',generation:0});
  const objectHash=hash(encrypted);
  await call(0,`/sync/agent-files/objects/${objectHash}`,200,{method:'PUT',body:Buffer.from(encrypted)});
  const manifest={formatVersion:1,files:[{path:'AGENTS.md',sha256:hash(plain),size:plain.length,objectSha256:objectHash,objectSize:encrypted.length,encryption:'aes-256-gcm',generation:0}]};
  await json(0,'/sync/agent-files/head',manifest,200,'PUT',{'If-None-Match':'*'});
  const head=await call(0,'/sync/agent-files/head',200);assert.ok(head.headers.get('etag'));
  await call(0,'/sync/agent-files/head',304,{headers:{'If-None-Match':head.headers.get('etag')!}});
  await json(0,'/sync/agent-files/head',manifest,412,'PUT',{'If-Match':'"stale"'});
  await call(1,'/sync/agent-files/head',404);await call(1,`/sync/agent-files/objects/${objectHash}`,404);
  checks.push('encrypted object storage, ETag/304, stale CAS/412 and cross-account denial');
  const shared=await json(0,'/shared-sessions',{sourceSessionId:'disposable-fixture',title:'Aux disposable fixture',messages:[{role:'user',content:'An inert fixture.',timestamp:Date.now()}]});
  assert.ok(await getPublicShare(shared.id));
  await call(1,'/shared-sessions/source/disposable-fixture',200).then(async r=>assert.equal(await r.json(),null));
  await call(0,'/shared-sessions/source/disposable-fixture',200,{method:'DELETE'});assert.equal(await getPublicShare(shared.id),null);checks.push('public share publication, ownership and revocation');
  const bytes=Buffer.from('Aux disposable private attachment fixture.');
  const intent=await json(0,'/attachments/intents',{name:'fixture.txt',contentType:'text/plain',size:bytes.length,sha256:hash(bytes)},201);
  const upload=await json(0,`/attachments/${intent.id}/upload-url`,{});
  const put=await fetch(upload.url,{method:'PUT',headers:upload.headers,body:bytes,redirect:'error',signal:AbortSignal.timeout(30000)});assert.ok(put.ok,'Private Blob upload failed');
  await json(0,`/attachments/${intent.id}/commit`,{});
  assert.equal(await(await call(0,`/attachments/${intent.id}/content`,200)).text(),bytes.toString());
  assert.equal(await(await call(0,`/attachments/${intent.id}/content`,206,{headers:{Range:'bytes=4-13'}})).text(),bytes.subarray(4,14).toString());
  await call(1,`/attachments/${intent.id}/content`,404);
  await call(0,`/attachments/${intent.id}`,200,{method:'DELETE'});checks.push('actual private Blob upload, independent hash verification, ranges and ownership');
  const billing=await(await call(0,'/billing/subscription',200)).json();assert.equal(billing.subscription,null);assert.match(billing.credit.balance_micros,/^\d+$/);checks.push('truthful free billing snapshot');
  await json(0,'/auth/signout',{refreshToken:refresh,revokeScope:'refresh_token'});await call(0,'/auth/me',401);checks.push('actual session revocation');
} finally {
  syncKey?.fill(0);
  for(const id of ids){
    const owned=await sql`SELECT pathname FROM aux_attachments WHERE user_id=${id}`;
    for(const row of owned)await del(row.pathname);
    await sql`DELETE FROM aux_refresh_tokens WHERE session_id IN(SELECT id FROM aux_sessions WHERE user_id=${id})`;
    await sql`DELETE FROM aux_sessions WHERE user_id=${id}`;
    await sql`DELETE FROM aux_users WHERE id=${id} AND clerk_id=${`aux_fixture:${id}`}`;
  }
}
await mkdir('evidence',{recursive:true});await writeFile('evidence/development-boundaries.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,fixtureRemoved:true,realClerkSignInTested:false},null,2)+'\n');
console.log(JSON.stringify({checks,fixtureRemoved:true}));
