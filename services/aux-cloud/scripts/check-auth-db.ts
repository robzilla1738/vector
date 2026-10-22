/** Root-run, disposable real-Neon boundary check. No provider/email acceptance
 * is claimed: Clerk availability is mocked for synthetic fixture IDs only. */
import assert from 'node:assert/strict';
import { createHash, createHmac, generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';

if(process.env.AUX_ALLOW_DISPOSABLE_DB_CHECK!=='1')throw new Error('Explicit AUX_ALLOW_DISPOSABLE_DB_CHECK=1 is required');
let hostname:string;try{hostname=new URL(process.env.DATABASE_URL||'').hostname;}catch{throw new Error('A valid private DATABASE_URL is required');}
if(!/^ep-spring-darkness-b824br4r(?:-pooler)?\./.test(hostname))throw new Error('This check only permits the reviewed aux-cloud-dev endpoint');
const neonApiHost=hostname.replace(/^[^.]+\./,'api.');
if(process.env.VERCEL_ENV==='production')throw new Error('Never run disposable checks against production');
const fixtureSecret=randomBytes(48).toString('base64url');
process.env.AUX_AUTH_SECRET=fixtureSecret;
Object.assign(process.env,{NODE_ENV:'test'});
process.env.CLERK_SECRET_KEY='sk_test_YXV0aC1maXh0dXJlLmNsZXJrLmFjY291bnRzLmRldiQ';
const ids=[randomUUID(),randomUUID()],sessions=[randomUUID(),randomUUID()],clerkIds=ids.map(id=>`fixture_${id}`);
const originalFetch=globalThis.fetch;
let mockedClerkCalls=0;
let blockedNetwork=false;
function safeFailure(cause:unknown){
  const value=cause as {code?:unknown;constraint?:unknown;table?:unknown;cause?:unknown};
  const safe=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_]{1,100}$/.test(v)?v:undefined;
  const nested=value?.cause as {code?:unknown;constraint?:unknown;table?:unknown}|undefined;
  return {errorType:cause instanceof Error?cause.name:'Unknown',code:safe(value?.code)||safe(nested?.code),constraint:safe(value?.constraint)||safe(nested?.constraint),table:safe(value?.table)||safe(nested?.table),blockedNetwork};
}
globalThis.fetch=async(input,init)=>{
  const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
  if(url.hostname==='api.clerk.com'){
    const match=clerkIds.find(id=>url.pathname===`/v1/users/${id}`);
    if(!match)throw new Error('Fixture attempted an unexpected Clerk request');
    mockedClerkCalls++;
    return Response.json({object:'user',id:match,banned:false,locked:false,two_factor_enabled:false,external_accounts:[],email_addresses:[],phone_numbers:[],web3_wallets:[],passkeys:[],saml_accounts:[],enterprise_accounts:[],created_at:Date.now(),updated_at:Date.now(),public_metadata:{},private_metadata:{},unsafe_metadata:{}});
  }
  // Neon HTTP v1 replaces the endpoint label with api.; the connection header
  // still binds the selected database. Permit only that exact regional SQL API.
  const headers=new Headers(init?.headers??(input instanceof Request?input.headers:undefined));
  let target='';try{target=new URL(headers.get('Neon-Connection-String')||'').hostname;}catch{}
  if(url.protocol!=='https:'||url.hostname!==neonApiHost||url.pathname!=='/sql'||target!==hostname){blockedNetwork=true;throw new Error('Fixture attempted an unexpected network request');}
  return originalFetch(input,init);
};
const {sql}=await import('../src/db');
const {authRoutes,tokenHash}=await import('../src/auth');
const checks:string[]=[];
const initialRefresh=randomBytes(32).toString('base64url');
const ua='Aux disposable authentication boundary check';
function device(){
  const {publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=publicKey.export({format:'jwk'});
  const raw=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,'base64url'),Buffer.from(jwk.y!,'base64url')]);
  return {platform:'macos',installationScheme:'p256_v1',deviceName:'Disposable Aux fixture',ikSigPublicKeyJwk:jwk,ikSigKeyFingerprint:`sha256:${createHash('sha256').update(raw).digest('hex')}`};
}
const originalDevice=device();
async function sign(user:string,session:string){return new SignJWT({sg:0,sid:session}).setProtectedHeader({alg:'HS256',typ:'JWT'}).setSubject(user).setJti(randomUUID()).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('15m').sign(new TextEncoder().encode(fixtureSecret));}
async function post(path:string,body:unknown,access?:string,userAgent=ua){
  const response=await authRoutes.request(path,{method:'POST',headers:{'Content-Type':'application/json','User-Agent':userAgent,...access?{Authorization:`Bearer ${access}`}:{ }},body:JSON.stringify(body)});
  return {response,payload:await response.json()};
}
let cleaned=false;
try{
  const access=[await sign(ids[0],sessions[0]),await sign(ids[1],sessions[1])];
  for(let i=0;i<2;i++){
    await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES (${ids[i]},${clerkIds[i]},${`${ids[i]}@example.invalid`},'Disposable auth fixture')`;
    await sql`INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform,device_fingerprint)
      VALUES (${sessions[i]},${ids[i]},${tokenHash(access[i])},now()+interval '15 minutes',now()+interval '1 hour','macos',${originalDevice.ikSigKeyFingerprint})`;
  }
  await sql`INSERT INTO aux_refresh_tokens(token_hash,session_id) VALUES (${tokenHash(initialRefresh)},${sessions[0]})`;
  const valid=await authRoutes.request('/me',{headers:{Authorization:`Bearer ${access[0]}`}});
  assert.equal(valid.status,200);assert.equal((await valid.json()).userId,ids[0]);checks.push('signed session + real DB ownership');

  const cross=await post(`/devices/${sessions[1]}/signout`,{},access[0]);
  assert.equal(cross.response.status,404);
  const untouched=await sql`SELECT revoked_at FROM aux_sessions WHERE id=${sessions[1]}`;assert.equal(untouched[0].revoked_at,null);checks.push('cross-account device revocation denied');

  await sql`UPDATE aux_users SET sync_generation=1 WHERE id=${ids[0]}`;
  const stale=await authRoutes.request('/me',{headers:{Authorization:`Bearer ${access[0]}`}});
  assert.equal(stale.status,401);assert.equal((await stale.json()).code,'ACCESS_TOKEN_STALE_CLAIMS');
  await sql`UPDATE aux_users SET sync_generation=0 WHERE id=${ids[0]}`;checks.push('sync-generation claim checked against DB');

  const first=await post('/token/refresh',{refreshToken:initialRefresh,device:originalDevice});
  assert.equal(first.response.status,200);
  const retry=await post('/token/refresh',{refreshToken:initialRefresh,device:originalDevice});
  assert.equal(retry.response.status,200);assert.equal(retry.payload.refreshToken,first.payload.refreshToken);assert.equal(retry.payload.accessToken,first.payload.accessToken);
  const cipher=await sql`SELECT rotation_reply FROM aux_refresh_tokens WHERE token_hash=${tokenHash(initialRefresh)}`;
  assert.equal(cipher[0].rotation_reply.includes(first.payload.refreshToken),false);assert.equal(cipher[0].rotation_reply.includes(first.payload.accessToken),false);
  checks.push('lost-response retry returns same encrypted cached rotation');

  const concurrent=await Promise.all([post('/token/refresh',{refreshToken:first.payload.refreshToken,device:originalDevice}),post('/token/refresh',{refreshToken:first.payload.refreshToken,device:originalDevice})]);
  assert.equal(concurrent[0].response.status,200);assert.equal(concurrent[1].response.status,200);assert.equal(concurrent[0].payload.refreshToken,concurrent[1].payload.refreshToken);
  const current=concurrent[0].payload;checks.push('concurrent identical refresh commits one successor');

  const wrongDevice=await post('/token/refresh',{refreshToken:current.refreshToken,device:device()});
  assert.equal(wrongDevice.response.status,401);assert.equal(wrongDevice.payload.code,'REFRESH_TOKEN_DEVICE_MISMATCH');checks.push('different installation cannot refresh');

  // Simulate expiry of the retry grace without sleeping or changing real users.
  await sql`UPDATE aux_refresh_tokens SET used_at=now()-interval '11 seconds' WHERE token_hash=${tokenHash(first.payload.refreshToken)}`;
  const reuse=await post('/token/refresh',{refreshToken:first.payload.refreshToken,device:originalDevice});
  assert.equal(reuse.response.status,401);assert.equal(reuse.payload.code,'REFRESH_TOKEN_COMPROMISED');
  const denied=await authRoutes.request('/me',{headers:{Authorization:`Bearer ${current.accessToken}`}});
  assert.equal(denied.status,401);checks.push('reuse beyond grace revokes current family access');
}catch(cause){
  // Assertions may contain actual token values; do not print their raw errors.
  console.error(JSON.stringify({fixture:'aux-dev-auth-boundary',failedAfter:checks.length,...safeFailure(cause)}));
  process.exitCode=1;
}finally{
  try{
    for(const id of ids){
      await sql`DELETE FROM aux_refresh_tokens WHERE session_id IN (SELECT id FROM aux_sessions WHERE user_id=${id})`;
      await sql`DELETE FROM aux_sessions WHERE user_id=${id}`;
      await sql`DELETE FROM aux_users WHERE id=${id} AND clerk_id=${`fixture_${id}`}`;
    }
    const rateKey=createHmac('sha256',fixtureSecret).update('rate\0refresh:unknown').digest('hex');
    await sql`DELETE FROM aux_rate_limits WHERE key=${rateKey}`;
    cleaned=true;
  }catch(cause){
    console.error(JSON.stringify({fixture:'aux-dev-auth-boundary',cleanupFailed:true,...safeFailure(cause)}));
    process.exitCode=1;
  }finally{globalThis.fetch=originalFetch;}
  console.log(JSON.stringify({fixture:'aux-dev-auth-boundary',checks,clerk:'synthetic availability mocked; no Clerk or email acceptance claimed',mockedClerkCalls,cleaned}));
}
