/** Changed metadata only; one marked disposable development account. */
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {SignJWT} from 'jose';
import {checkEnvironment} from './check-environment.mjs';
import resources from '../config/deployment-resources.json';
import {sql} from '../src/db';
assert.equal(process.env.AUX_CHECK_DISPOSABLE,'1');
assert.equal(checkEnvironment(process.env,resources).profile,'development');
assert.notEqual(process.env.VERCEL_ENV,'production');
const scope=new URL('../evidence/sync-recovery-status-scope.json',import.meta.url);
assert(process.argv.length===2||(process.argv.length===3&&process.argv[2]==='--cleanup-only'),'Unsupported fixture arguments');
const cleanupOnly=process.argv[2]==='--cleanup-only';
const initial=cleanupOnly?JSON.parse(await readFile(scope,'utf8')):{user:randomUUID(),session:randomUUID()};
const {user,session}=initial,marker='aux_recovery_status_fixture:'+user;
assert.match(user,/^[0-9a-f-]{36}$/);assert.match(session,/^[0-9a-f-]{36}$/);if(cleanupOnly)assert.equal(initial.marker,marker);
async function cleanup(){
 const rows=await sql`SELECT clerk_id FROM aux_users WHERE id=${user}`;
 if(rows.length){assert.equal(rows[0].clerk_id,marker,'Fixture ownership changed');
  await sql.transaction([sql`DELETE FROM aux_sync_recovery_challenges_v2 WHERE user_id=${user}`,sql`DELETE FROM aux_sync_recovery_v2 WHERE user_id=${user}`,sql`DELETE FROM sync_keys WHERE user_id=${user}`,sql`DELETE FROM aux_refresh_tokens WHERE session_id=${session}`,sql`DELETE FROM aux_sessions WHERE id=${session} AND user_id=${user}`,sql`DELETE FROM aux_users WHERE id=${user} AND clerk_id=${marker}`]);
 }
 assert.equal((await sql`SELECT id FROM aux_users WHERE id=${user}`).length,0);
 await writeFile(scope,JSON.stringify({user,session,marker,completed:true},null,2)+'\n',{mode:0o600});
}
if(cleanupOnly){await cleanup();console.log('Persisted owned recovery-status scope removed; no API check repeated.');process.exit(0);}
let passed=false,stage='scope';const checks:string[]=[];
try{const previous=JSON.parse(await readFile(scope,'utf8'));assert.equal(previous.completed,true,'Clean the retained fixture scope before another check');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
await writeFile(scope,JSON.stringify({user,session,marker,completed:false},null,2)+'\n',{mode:0o600});
try{
 const token=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(user).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('5m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
 stage='create-owned-fixture';
 await sql`INSERT INTO aux_users(id,clerk_id,email,name) VALUES(${user},${marker},${user+'@example.invalid'},'Disposable recovery status')`;
 await sql`INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES(${session},${user},${createHash('sha256').update(token).digest('hex')},now()+interval '5 minutes',now()+interval '10 minutes','macos')`;
 async function status(expected:{state:string;recoveryConfigured:boolean;recoveryRevision:number}){
  const response=await fetch('https://dev-cloud.getaux.co/api/v1/sync/key/status',{headers:{Authorization:'Bearer '+token,'Cache-Control':'no-store'},redirect:'error',signal:AbortSignal.timeout(20_000)});
  assert.equal(response.status,200,'Status request failed');const actual=await response.json() as Record<string,unknown>;
  for(const [key,value] of Object.entries(expected))assert.equal(actual[key],value,'Recovery status field mismatch: '+key);
  checks.push(expected.state+':'+expected.recoveryConfigured+':'+expected.recoveryRevision);
 }
 stage='unconfigured';await status({state:'provisioning',recoveryConfigured:false,recoveryRevision:0});
 // Only presence/metadata are read; fixture material never reaches key resolve.
 await sql`INSERT INTO sync_keys(user_id,generation,wrapped_key) VALUES(${user},0,${JSON.stringify({fixture:'status-only-not-a-key'})}::jsonb)`;
 stage='server-key-without-recovery';await status({state:'ready',recoveryConfigured:false,recoveryRevision:0});
 await sql`INSERT INTO aux_sync_recovery_v2(user_id,generation,revision,recovery_id,envelope,csk_commitment,created_by_session) VALUES(${user},0,1,${randomUUID()},${JSON.stringify({fixture:'status-only-not-an-envelope'})}::jsonb,${'a'.repeat(64)},${session})`;
 stage='configured';await status({state:'ready',recoveryConfigured:true,recoveryRevision:1});
 await sql`DELETE FROM sync_keys WHERE user_id=${user}`;
 stage='configured-missing-key';await status({state:'device_required',recoveryConfigured:true,recoveryRevision:1});passed=true;
}catch{console.error(JSON.stringify({fixture:'deployed-recovery-status',failedAt:stage}));process.exitCode=1;}
finally{
 await cleanup();
 await writeFile(new URL('../evidence/sync-recovery-status-deployed.json',import.meta.url),JSON.stringify({format:'aux.sync-recovery.status-deployed.v1',checkedAt:new Date().toISOString(),origin:'https://dev-cloud.getaux.co',checks,passed,fixtureRemoved:true,syntheticAuxJwt:true,clerkSignInRepeated:false,keyOrEnvelopeCryptographyRepeated:false,existingUserDataAccessed:false,desktopOrNativeExecuted:false,paidProviderCalls:0},null,2)+'\n');
}
if(passed)console.log('Four changed deployed recovery-status states passed; owned fixture removed.');
