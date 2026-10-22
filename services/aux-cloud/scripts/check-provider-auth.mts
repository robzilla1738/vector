/** Actual Clerk-development -> deployed Aux token exchange. No owner identity,
 * inbox, browser profile, Keychain or native helper is used. */
import assert from 'node:assert/strict';
import {createHash,generateKeyPairSync,randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {createClerkClient,verifyToken} from '@clerk/backend';
import {decodeJwt} from 'jose';
import {checkEnvironment} from './check-environment.mjs';
import resources from '../config/deployment-resources.json';
import {sql} from '../src/db';

if(process.env.AUX_CHECK_DISPOSABLE!=='1'||checkEnvironment(process.env,resources).profile!=='development')throw Error('Explicit Aux development fixture permission required.');
const clerk=createClerkClient({secretKey:process.env.CLERK_SECRET_KEY});
assert.equal((await clerk.instance.get()).id,'ins_3L28GxZikfIuuEfnf1FoIkNoQpk');
const marker=randomUUID(),email=`aux-auth-${marker}+clerk_test@example.com`,checks:string[]=[];
let clerkId:string|undefined,cleaned=false,stage='create-fixture';
const origin='https://dev-cloud.getaux.co';
const frontendHost=Buffer.from(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!.slice('pk_test_'.length),'base64').toString().replace(/\$$/,'');
assert.match(frontendHost,/^[a-z0-9-]+\.clerk\.accounts\.dev$/);
let devBrowserToken:string|undefined;
const cookies=new Map<string,string>();
async function frontend(method:string,path:string,body?:Record<string,string>){
  const url=new URL(path,'https://'+frontendHost);if(devBrowserToken)url.searchParams.set('__dev_session',devBrowserToken);
  const response=await fetch(url,{method,headers:{Origin:origin,...cookies.size?{Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; ')}:{},...body?{'Content-Type':'application/x-www-form-urlencoded'}:{}},...body?{body:new URLSearchParams(body)}:{},redirect:'error',signal:AbortSignal.timeout(20_000)});
  for(const value of response.headers.getSetCookie()){const first=value.split(';')[0],at=first.indexOf('=');if(at>0)cookies.set(first.slice(0,at),first.slice(at+1));}
  const data=await response.json();if(!response.ok){const code=data.errors?.[0]?.code;console.error(JSON.stringify({frontendStatus:response.status,code:typeof code==='string'&&/^[a-z_]{1,80}$/.test(code)?code:undefined}));throw Error('Development frontend request rejected.');}
  return data;
}
function device(){
  const {publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=publicKey.export({format:'jwk'});
  const raw=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,'base64url'),Buffer.from(jwk.y!,'base64url')]);
  return {platform:'macos',installationScheme:'p256_v1',deviceName:'Disposable Aux provider boundary',ikSigPublicKeyJwk:jwk,ikSigKeyFingerprint:'sha256:'+createHash('sha256').update(raw).digest('hex')};
}
async function request(path:string,body?:unknown,token?:string){
  const response=await fetch(origin+'/api/v1/auth'+path,{method:body?'POST':'GET',headers:{'User-Agent':'Aux disposable provider authentication check',...body?{'Content-Type':'application/json'}:{},...token?{Authorization:'Bearer '+token}:{}},...body?{body:JSON.stringify(body)}:{},redirect:'error',signal:AbortSignal.timeout(20_000)});
  return {status:response.status,body:await response.json()};
}
try{
  const user=await clerk.users.createUser({emailAddress:[email],firstName:'Aux',lastName:'Disposable auth',skipPasswordRequirement:true,privateMetadata:{auxDisposableFixture:marker}});clerkId=user.id;
  stage='provider-client';devBrowserToken=(await frontend('POST','/v1/dev_browser')).token;assert.ok(devBrowserToken);await frontend('POST','/v1/client',{});
  stage='provider-sign-in';const started=(await frontend('POST','/v1/client/sign_ins',{identifier:email})).response;
  const factor=started.supported_first_factors.find((f:{strategy:string})=>f.strategy==='email_code');assert.ok(factor?.email_address_id);
  await frontend('POST',`/v1/client/sign_ins/${started.id}/prepare_first_factor`,{strategy:'email_code',email_address_id:factor.email_address_id});
  const signedIn=(await frontend('POST',`/v1/client/sign_ins/${started.id}/attempt_first_factor`,{strategy:'email_code',code:'424242'})).response;
  assert.equal(signedIn.status,'complete');assert.ok(signedIn.created_session_id);
  const session=await clerk.sessions.getSession(signedIn.created_session_id);assert.equal(session.userId,clerkId);assert.equal(session.status,'active');
  const issued=await frontend('POST',`/v1/client/sessions/${session.id}/tokens`,{}),token=issued.response??issued;assert.ok(token.jwt);
  const claims=decodeJwt(token.jwt);assert.ok(claims.sub===clerkId&&claims.sid===session.id&&claims.azp===origin);
  await verifyToken(token.jwt,{secretKey:process.env.CLERK_SECRET_KEY,authorizedParties:[origin]});
  const installation=device();stage='exchange';
  const exchanged=await request('/token/exchange',{supabaseAccessToken:token.jwt,authProtocol:2,accountId:0,device:installation});
  if(exchanged.status!==200)console.error(JSON.stringify({exchangeStatus:exchanged.status,code:typeof exchanged.body.code==='string'&&/^[A-Z_]{1,80}$/.test(exchanged.body.code)?exchanged.body.code:undefined}));
  assert.equal(exchanged.status,200);stage='exchange-identity';
  assert.equal(exchanged.body.user.email,email);assert.equal(exchanged.body.expiresIn,900);
  const mapped=(await sql`SELECT id FROM aux_users WHERE clerk_id=${clerkId} AND email=${email}`)[0];assert.ok(mapped);assert.equal(exchanged.body.user.id,mapped.id);
  const linked=(await sql`SELECT clerk_session_id,device_fingerprint FROM aux_sessions WHERE user_id=${mapped.id}`)[0];assert.equal(linked.clerk_session_id,session.id);assert.equal(linked.device_fingerprint,installation.ikSigKeyFingerprint);
  assert.equal((await request('/me',undefined,exchanged.body.accessToken)).status,200);
  checks.push('real provider-signed Clerk development session exchanged for installation-bound Aux tokens on deployed backend');
  stage='refresh';const rotated=await request('/token/refresh',{refreshToken:exchanged.body.refreshToken,device:installation});assert.equal(rotated.status,200);
  const retry=await request('/token/refresh',{refreshToken:exchanged.body.refreshToken,device:installation});assert.equal(retry.status,200);
  // Never let assertion diagnostics contain token values.
  assert.ok(retry.body.accessToken===rotated.body.accessToken&&retry.body.refreshToken===rotated.body.refreshToken);
  const wrong=await request('/token/refresh',{refreshToken:rotated.body.refreshToken,device:device()});assert.equal(wrong.status,401);assert.equal(wrong.body.code,'REFRESH_TOKEN_DEVICE_MISMATCH');
  checks.push('actual Clerk-backed refresh rotates once, recovers lost response and rejects another installation');
  stage='provider-revocation';await clerk.sessions.revokeSession(session.id);
  const deadline=Date.now()+30_000;let revoked=false;
  while(Date.now()<deadline){const rows=await sql`SELECT revoked_at FROM aux_sessions WHERE user_id=${mapped.id} AND clerk_session_id=${session.id}`;if(rows[0]?.revoked_at){revoked=true;break;}await new Promise(resolve=>setTimeout(resolve,1000));}
  assert.ok(revoked,'Signed provider revocation did not reach the Aux session within the bounded check.');
  assert.equal((await request('/me',undefined,rotated.body.accessToken)).status,401);
  assert.equal((await request('/token/refresh',{refreshToken:rotated.body.refreshToken,device:installation})).status,401);
  assert.equal((await request('/token/exchange',{supabaseAccessToken:token.jwt,authProtocol:2,device:installation})).status,401);
  checks.push('actual signed Clerk revocation invalidates Aux access, refresh and replayed provider exchange');
}catch(error){console.error(JSON.stringify({fixture:'actual-provider-auth',failedAt:stage,checksPassed:checks.length,errorType:error instanceof Error?error.name:'Unknown',providerStatus:typeof (error as {status?:unknown}).status==='number'?(error as {status:number}).status:undefined}));process.exitCode=1;
}finally{
  // Deleting the owned user also revokes its remaining provider sessions if
  // ending this newly created frontend client has already become a no-op.
  if(devBrowserToken)await frontend('DELETE','/v1/client').catch(()=>{});
  if(clerkId){
    const user=await clerk.users.getUser(clerkId);assert.equal(user.privateMetadata.auxDisposableFixture,marker);await clerk.users.deleteUser(clerkId);
    await sql`DELETE FROM aux_refresh_tokens WHERE session_id IN(SELECT s.id FROM aux_sessions s JOIN aux_users u ON u.id=s.user_id WHERE u.clerk_id=${clerkId} AND u.email=${email})`;
    await sql`DELETE FROM aux_sessions WHERE user_id IN(SELECT id FROM aux_users WHERE clerk_id=${clerkId} AND email=${email})`;
    await sql`DELETE FROM aux_users WHERE clerk_id=${clerkId} AND email=${email}`;
  }
  cleaned=true;console.log(JSON.stringify({fixtureCleaned:true,checksPassed:checks.length,realEmailDelivery:false,nativeProductRun:false}));
}
if(checks.length===3&&cleaned)await writeFile(new URL('../evidence/provider-auth.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),origin,checks,fixtureRemoved:true,clerkFrontendReservedCodeSignIn:true,originClaimVerified:true,realEmailDelivery:false,nativeProductRun:false,paidProviderCalls:0},null,2)+'\n');
