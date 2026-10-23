/** ONE synthetic development-only recovery fixture. Never creates a Clerk user.
 * Execute only after the reviewed Preview is READY and dev-cloud points to it.
 * Credentials are supplied by the root-owned .env.local invocation, never copied.
 */
import assert from 'node:assert/strict';
import {createHash,createHmac,generateKeyPairSync,randomBytes,randomUUID,sign,timingSafeEqual} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {SignJWT} from 'jose';
import {checkEnvironment} from './check-environment.mjs';
import resources from '../config/deployment-resources.json';
import manifest from '../src/schema-manifest.json';
import {sql} from '../src/db';
import {sealSyncRecovery,openSyncRecovery,recoveryActionHash,recoveryChallengeBytes,recoveryEnrollmentProof,type RecoveryAction} from '../src/sync-recovery-crypto';
import {recoveryServerKey,wrapRecoveryServerCsk,openRecoveryServerCsk} from '../src/sync-recovery-server-key';

if(process.env.AUX_CHECK_DISPOSABLE!=='1'||checkEnvironment(process.env,resources).profile!=='development')throw Error('Explicit Aux development fixture permission required.');
const origin='https://dev-cloud.getaux.co';
const user=randomUUID(),session=randomUUID(),marker='aux_recovery_v2_fixture:'+user;
const csk=randomBytes(32),entropy=randomBytes(16),keys=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=keys.publicKey.export({format:'jwk'});
const hash=(value:Uint8Array|string)=>createHash('sha256').update(value).digest('hex');
const fingerprint='sha256:'+hash(Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,'base64url'),Buffer.from(jwk.y!,'base64url')]));
let stage='readiness',created=false,cleaned=false,passed=false,token='',wrapping:Buffer|undefined;
const checks:string[]=[];
async function call(path:string,expected:number,options:RequestInit={},privateHeaders:Record<string,string>={}){
 // Do not accept absolute URLs, arbitrary hosts or redirects carrying credentials.
 if(!path.startsWith('/api/v1/')||path.includes('://')||path.includes('\\')||path.includes('#'))throw Error('Invalid fixed-host fixture path');
 const response=await fetch(origin+path,{...options,headers:{'Cache-Control':'no-store',...privateHeaders,...options.headers},redirect:'error',signal:AbortSignal.timeout(25_000)});
 assert.equal(response.status,expected,'Unexpected recovery fixture HTTP status');return response;
}
const rateKey=createHmac('sha256',process.env.AUX_AUTH_SECRET!).update(Buffer.concat([Buffer.from('rate'),Buffer.from([0]),Buffer.from('sync-recovery:'+user)])).digest('hex');
const authHeaders=()=>({Authorization:'Bearer '+token});
async function post(path:string,body:unknown,expected=200){return call('/api/v1'+path,expected,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},authHeaders());}
async function signed(action:RecoveryAction){
 const response=await post('/sync/recovery/v2/challenge',action),challenge=await response.json() as any,c=challenge.challenge;
 assert.ok(c.userId===user&&c.sessionId===session&&c.fingerprint===fingerprint&&c.generation===0&&c.operation===action.operation&&c.requestHash===recoveryActionHash(action),'Challenge ownership mismatch');
 const message=recoveryChallengeBytes(c);assert.ok(message.equals(Buffer.from(challenge.messageB64,'base64')),'Challenge bytes mismatch');
 return {challengeId:c.id,signatureB64:sign('sha256',message,keys.privateKey).toString('base64'),action,...action.operation==='enroll'?{cskProofB64:recoveryEnrollmentProof(csk,message)}:{}};
}
try{
 assert.notEqual(process.env.VERCEL_ENV,'production');
 const ready=await call('/api/v1/internal/readiness',200,{}, {Authorization:'Bearer '+process.env.CRON_SECRET});
 const readiness=await ready.json() as any;assert.ok(readiness.status==='ready'&&readiness.schema==='current'&&readiness.mismatches===0,'Development schema not ready');assert.ok(Object.hasOwn(manifest,'012-sync-recovery-v2.sql'),'Recovery migration missing locally');
 stage='create-owned-fixture';
 await writeFile(new URL('../evidence/sync-recovery-fixture-scope.json',import.meta.url),JSON.stringify({fixtureUserId:user,fixtureSessionId:session,marker,rateKey,completed:false},null,2)+'\n',{mode:0o600});
 token=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(user).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
 const inserted=await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${user},${marker},${user+'@example.invalid'},'Disposable Aux-v2 recovery fixture') RETURNING id`;assert.ok(inserted.length===1,'Fixture owner not created');created=true;
 await sql`INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform,device_fingerprint,device_public_key) VALUES(${session},${user},${hash(token)},now()+interval '10 minutes',now()+interval '20 minutes','macos',${fingerprint},${JSON.stringify(jwk)}::jsonb)`;
 wrapping=recoveryServerKey();const wrapped=wrapRecoveryServerCsk(csk,user,0,wrapping);
 await sql`INSERT INTO sync_keys(user_id,generation,wrapped_key) VALUES(${user},0,${JSON.stringify(wrapped)}::jsonb)`;
 stage='enroll';
 const envelope=sealSyncRecovery(csk,entropy,{userId:user,generation:0,revision:1}),enrollment=await signed({operation:'enroll',generation:0,expectedRevision:0,envelope});
 const enrolled=await(await post('/sync/recovery/v2/submit',enrollment)).json() as any,replayed=await(await post('/sync/recovery/v2/submit',enrollment)).json();
 assert.ok(enrolled.state==='ready'&&enrolled.syncGeneration===0&&enrolled.recoveryRevision===1&&enrolled.recoveryId===envelope.recoveryId,'Enrollment receipt mismatch');assert.ok(JSON.stringify(enrolled)===JSON.stringify(replayed),'Enrollment retry changed receipt');
 const count=await sql`SELECT count(*)::integer AS n FROM aux_sync_recovery_v2 WHERE user_id=${user}`;assert.equal(count[0].n,1);checks.push('deployed bound-installation enrollment and exact idempotent retry');
 stage='material';
 const material=await(await post('/sync/recovery/v2/submit',await signed({operation:'material',generation:0}))).json() as any;
 const opened=openSyncRecovery(material.recoveryBackup,entropy,{userId:user,generation:0});try{assert.ok(timingSafeEqual(opened,csk),'Encrypted recovery changed original CSK');}finally{opened.fill(0);}
 checks.push('deployed authenticated encrypted material preserves original CSK');
 stage='owned-missing-key-guards';
 // Delete ONLY the exact key row just inserted for our newly marked fixture.
 // This does not simulate loss in or inspect any real user's data.
 const removed=await sql`DELETE FROM sync_keys WHERE user_id=${user} AND generation=0 AND wrapped_key=${JSON.stringify(wrapped)}::jsonb AND EXISTS(SELECT 1 FROM aux_users WHERE id=${user} AND clerk_id=${marker}) RETURNING user_id`;assert.equal(removed.length,1);
 const state=await(await call('/api/v1/sync/key/status',200,{},authHeaders())).json() as any;assert.equal(state.state,'device_required');
 await post('/sync/key/resolve',{},409);await post('/sync/key/enroll',{cskB64:csk.toString('base64')},409);
 const absent=await sql`SELECT count(*)::integer AS n FROM sync_keys WHERE user_id=${user}`;assert.equal(absent[0].n,0);checks.push('deployed missing-key resolve/enroll guards preserve recoverable generation');
 stage='restore-and-retry';
 const restore=await signed({operation:'recover',generation:0,recoveryId:material.recoveryId,recoveryRevision:material.recoveryRevision,cskB64:csk.toString('base64')}),restored=await(await post('/sync/recovery/v2/submit',restore)).json() as any,restoredRetry=await(await post('/sync/recovery/v2/submit',restore)).json();
 assert.ok(restored.state==='ready'&&restored.syncGeneration===0&&restored.recoveryId===envelope.recoveryId&&restored.recoveryRevision===1,'Recovery receipt mismatch');assert.ok(JSON.stringify(restored)===JSON.stringify(restoredRetry),'Recovery retry changed receipt');
 const rows=await sql`SELECT wrapped_key,generation FROM sync_keys WHERE user_id=${user}`;assert.ok(rows.length===1&&rows[0].generation===0,'Recovered key row mismatch');
 const recovered=openRecoveryServerCsk(rows[0].wrapped_key,user,0,wrapping);try{assert.ok(timingSafeEqual(recovered,csk),'Recovered server key changed authority');}finally{recovered.fill(0);}
 checks.push('deployed create-only same-CSK restoration and exact idempotent retry');passed=true;
}catch(error){console.error(JSON.stringify({event:'aux_recovery_fixture_failed',stage,errorType:error instanceof Error?error.name:'Unknown'}));process.exitCode=1;
}finally{
 stage='fixture-cleanup';
 try{
  if(created){
   // Every predicate is restricted to our exact successfully created marked user.
   await sql`DELETE FROM sync_keys WHERE user_id=${user} AND EXISTS(SELECT 1 FROM aux_users WHERE id=${user} AND clerk_id=${marker})`;
   await sql`DELETE FROM aux_sync_recovery_challenges_v2 WHERE user_id=${user} AND EXISTS(SELECT 1 FROM aux_users WHERE id=${user} AND clerk_id=${marker})`;
   await sql`DELETE FROM aux_sync_recovery_v2 WHERE user_id=${user} AND EXISTS(SELECT 1 FROM aux_users WHERE id=${user} AND clerk_id=${marker})`;
   await sql`DELETE FROM aux_rate_limits WHERE key=${rateKey} AND EXISTS(SELECT 1 FROM aux_users WHERE id=${user} AND clerk_id=${marker})`;
   await sql`DELETE FROM aux_sessions WHERE id=${session} AND user_id=${user} AND EXISTS(SELECT 1 FROM aux_users WHERE id=${user} AND clerk_id=${marker})`;
   const rates=await sql`SELECT count(*)::integer AS n FROM aux_rate_limits WHERE key=${rateKey}`;assert.equal(rates[0].n,0);
   const removed=await sql`DELETE FROM aux_users WHERE id=${user} AND clerk_id=${marker} RETURNING id`;assert.equal(removed.length,1);
   const remaining=await sql`SELECT count(*)::integer AS n FROM aux_users WHERE id=${user}`;assert.equal(remaining[0].n,0);
  }
  cleaned=true;
  if(created)await writeFile(new URL('../evidence/sync-recovery-fixture-scope.json',import.meta.url),JSON.stringify({fixtureUserId:user,fixtureSessionId:session,marker,rateKey,completed:true},null,2)+'\n',{mode:0o600});
 }catch(error){console.error(JSON.stringify({event:'aux_recovery_fixture_cleanup_failed',fixtureUserId:user,fixtureSessionId:session,errorType:error instanceof Error?error.name:'Unknown'}));process.exitCode=1;}
 csk.fill(0);entropy.fill(0);wrapping?.fill(0);token='';
 console.log(JSON.stringify({event:'aux_recovery_fixture_summary',checksPassed:checks.length,fixtureRemoved:cleaned&&created,existingUserDataAccessed:false,paidProviderCalls:0,clerkSignInVerified:false,nativeStorageVerified:false}));
}
if(passed&&cleaned){
 const evidence={checkedAt:new Date().toISOString(),origin,checks,requiredMigrations:Object.keys(manifest).length,schemaManifestSha256:hash(JSON.stringify(manifest)),fixtureRemoved:true,syntheticAuxJWTAndP256Session:true,clerkSignInVerified:false,desktopOrNativeStorageVerified:false,existingUserDataAccessed:false,paidProviderCalls:0};
 try{await writeFile(new URL('../evidence/sync-recovery-deployed.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');}catch{console.error(JSON.stringify({event:'aux_recovery_evidence_write_failed'}));process.exitCode=1;}
}
