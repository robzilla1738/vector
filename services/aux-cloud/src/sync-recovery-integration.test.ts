/** Actual API + actual migrations, memory-only SQL transport; no provider/network. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash,generateKeyPairSync,randomUUID,sign} from 'node:crypto';
import {SignJWT} from 'jose';
import {neonConfig} from '@neondatabase/serverless';
import {PGlite} from '@electric-sql/pglite';
import {app} from './app';
import {cleanExpiredSyncRecoveryChallenges} from './sync-recovery-store';
import {purgeDeletedUserData} from './auth';
import manifest from './schema-manifest.json';

test('mounted recovery uses real JWT/session/signature auth, full schema and guarded key lifecycle',async()=>{
 const previous={url:process.env.DATABASE_URL,secret:process.env.AUX_AUTH_SECRET,key:process.env.AUX_DATA_ENCRYPTION_KEY,fetch:globalThis.fetch,transport:neonConfig.fetchFunction};
 const pg=new PGlite();let queries=0;
 process.env.DATABASE_URL='postgresql://synthetic:synthetic@offline.invalid/aux_fixture';
 process.env.AUX_AUTH_SECRET='synthetic-recovery-fixture-secret-not-a-credential';process.env.AUX_DATA_ENCRYPTION_KEY=Buffer.alloc(32,17).toString('base64');
 globalThis.fetch=async()=>{throw Error('Unexpected external network access');};
 try{
  // PGlite's PG build includes gen_random_uuid(), but no pgcrypto installer.
  // Omit only that extension-install directive; execute EVERY actual DDL file.
  const names=(await readdir(new URL('../migrations/',import.meta.url))).filter(n=>n.endsWith('.sql')).sort();
  assert.equal(names.length,12);
  for(const name of names){const bytes=await readFile(new URL('../migrations/'+name,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest[name as keyof typeof manifest]);let source=bytes.toString();if(name==='001-auth.sql'){assert.equal(source.split('CREATE EXTENSION IF NOT EXISTS pgcrypto;').length,2);source=source.replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;','');}await pg.exec(source);}
  const query=async(text:string,values:unknown[])=>(await pg.query(text,values)).rows as any[];
  // Neon documents fetchFunction as a custom transport. Actual app/sql/auth are
  // unchanged; only wire SQL requests to this real private in-memory database.
  neonConfig.fetchFunction=async(_url:unknown,init:{body:string})=>{
   queries++;const body=JSON.parse(init.body);assert.equal(typeof body.query,'string');assert.ok(Array.isArray(body.params));
   try{const result=await pg.query(body.query,body.params),fields=result.fields.map(f=>({name:f.name,dataTypeID:f.dataTypeID}));
    const rows=result.rows.map(row=>fields.map(f=>{const x=(row as any)[f.name];if(x==null)return null;if(f.dataTypeID===114||f.dataTypeID===3802)return JSON.stringify(x);if(typeof x==='boolean')return x?'t':'f';if(x instanceof Date)return x.toISOString().replace('T',' ').replace('Z','+00');return String(x);}));
    return Response.json({fields,rows,rowCount:result.affectedRows??result.rows.length,command:body.query.trim().split(/\s+/)[0]});
   }catch(error){const e=error as Error&{code?:string};return Response.json({message:e.message,code:e.code},{status:400});}
  };
  const owner=randomUUID(),session=randomUUID(),other=randomUUID(),keys=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=keys.publicKey.export({format:'jwk'}),fp='sha256:'+createHash('sha256').update(Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,'base64url'),Buffer.from(jwk.y!,'base64url')])).digest('hex');
  const jwt=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(owner).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
  await query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3),($4,$5,$6)',[owner,'fixture-owner','fixture-owner@example.invalid',other,'fixture-other','fixture-other@example.invalid']);
  await query("INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform,device_fingerprint,device_public_key) VALUES($1,$2,$3,now()+interval '10minutes',now()+interval '1day','macos',$4,$5::jsonb)",[session,owner,createHash('sha256').update(jwt).digest('hex'),fp,JSON.stringify(jwk)]);
  const headers={authorization:'Bearer '+jwt,'content-type':'application/json'},request=(path:string,body:unknown,custom:Record<string,string>=headers)=>app.request('/api/v1'+path,{method:'POST',headers:custom,body:JSON.stringify(body)});
  const before=queries;for(const operation of ['challenge','submit'])assert.equal((await request('/sync/recovery/v2/'+operation,{},{})).status,401);assert.equal(queries,before);
  const forged=jwt.slice(0,-1)+(jwt.endsWith('A')?'B':'A');assert.equal((await request('/sync/recovery/v2/challenge',{operation:'material',generation:0},{...headers,authorization:'Bearer '+forged})).status,401);assert.equal(queries,before);
  const challengeResponse=await request('/sync/recovery/v2/challenge',{operation:'material',generation:0});assert.equal(challengeResponse.status,200,await challengeResponse.clone().text());const challenge=await challengeResponse.json() as any;assert.equal(challengeResponse.headers.get('cache-control'),'no-store');
  assert.equal((await request('/sync/recovery/v2/challenge',{padding:'x'.repeat(17000)})).status,413);
  const crossOwner=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(other).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));assert.equal((await request('/sync/recovery/v2/challenge',{operation:'material',generation:0},{...headers,authorization:'Bearer '+crossOwner})).status,401);
  // Server-held key readiness is distinct from an enrolled recovery backup.
  const keyStatus=async()=>{const response=await app.request('/api/v1/sync/key/status',{headers});assert.equal(response.status,200);return await response.json() as any;};
  let observed=await keyStatus();assert.equal(observed.state,'provisioning');assert.equal(observed.recoveryConfigured,false);assert.equal(observed.recoveryRevision,0);
  await query('INSERT INTO sync_keys(user_id,generation,wrapped_key) VALUES($1,0,$2::jsonb)',[owner,JSON.stringify({fixture:'status-only'})]);
  observed=await keyStatus();assert.equal(observed.state,'ready');assert.equal(observed.recoveryConfigured,false);assert.equal(observed.recoveryRevision,0);
  await query('INSERT INTO aux_sync_recovery_v2(user_id,generation,revision,recovery_id,envelope,csk_commitment,created_by_session) VALUES($1,1,7,$2,$3::jsonb,$4,$5)',[owner,randomUUID(),JSON.stringify({fixture:'old-generation'}),'a'.repeat(64),session]);
  observed=await keyStatus();assert.equal(observed.recoveryConfigured,false);assert.equal(observed.recoveryRevision,0);
  await query('DELETE FROM aux_sync_recovery_v2 WHERE user_id=$1 AND generation=1',[owner]);
  const recoveryId=randomUUID(),encrypted={format:'aux.sync-recovery.v2',opaqueFixtureCiphertext:'unchanged-encrypted-bytes'};
  await query('INSERT INTO aux_sync_recovery_v2(user_id,generation,revision,recovery_id,envelope,csk_commitment,created_by_session) VALUES($1,0,1,$2,$3::jsonb,$4,$5)',[owner,recoveryId,JSON.stringify(encrypted),'a'.repeat(64),session]);
  observed=await keyStatus();assert.equal(observed.state,'ready');assert.equal(observed.recoveryConfigured,true);assert.equal(observed.recoveryRevision,1);
  await query('DELETE FROM sync_keys WHERE user_id=$1',[owner]);
  observed=await keyStatus();assert.equal(observed.state,'device_required');assert.equal(observed.recoveryConfigured,true);assert.equal(observed.recoveryRevision,1);
  const material=await request('/sync/recovery/v2/submit',{challengeId:challenge.challenge.id,signatureB64:sign('sha256',Buffer.from(challenge.messageB64,'base64'),keys.privateKey).toString('base64'),action:{operation:'material',generation:0}});assert.equal(material.status,200,await material.clone().text());assert.deepEqual((await material.json() as any).recoveryBackup,encrypted);
  // Recovery-only generation cannot create a new random CSK through ordinary APIs.
  const status=await app.request('/api/v1/sync/key/status',{headers});assert.equal((await status.json() as any).state,'device_required');
  assert.equal((await request('/sync/key/resolve',{})).status,409);assert.equal((await request('/sync/key/enroll',{cskB64:Buffer.alloc(32,2).toString('base64')})).status,409);assert.equal((await query('SELECT * FROM sync_keys WHERE user_id=$1',[owner])).length,0);
  // Unrecoverable new owner still provisions via the actual guarded SQL. Use the
  // exact query in source only for that unbound synthetic owner, never an auth bypass.
  const sync=await readFile(new URL('./sync.ts',import.meta.url),'utf8'),guarded=sync.match(/sql`(WITH existing AS[\s\S]*?)`/)![1]!;
  const values:unknown[]=[];const text=guarded.replace(/\$\{(user|account.sync_generation|JSON.stringify\(envelope\))\}/g,(_all,key)=>{values.push(key==='user'?other:key==='account.sync_generation'?0:JSON.stringify({fixture:'new-key'}));return '$'+values.length;});
  assert.equal((await query(text,values)).length,1);const first=(await query('SELECT wrapped_key FROM sync_keys WHERE user_id=$1',[other]))[0].wrapped_key;assert.equal((await query(text,values)).length,1);assert.deepEqual((await query('SELECT wrapped_key FROM sync_keys WHERE user_id=$1',[other]))[0].wrapped_key,first);
  // Bounded expiry maintenance cannot delete recovery revisions or recent receipts.
  await query("INSERT INTO aux_sync_recovery_challenges_v2(id,user_id,session_id,fingerprint,generation,operation,request_hash,nonce,expires_at) SELECT gen_random_uuid(),$1,$2,$3,0,'material',$4,'fixture',now()-interval '2days' FROM generate_series(1,3)",[owner,session,fp,'b'.repeat(64)]);
  assert.deepEqual(await cleanExpiredSyncRecoveryChallenges(2,query),{cleaned:2});assert.equal((await query('SELECT id FROM aux_sync_recovery_challenges_v2 WHERE id=$1',[challenge.challenge.id])).length,1);assert.equal((await query("SELECT * FROM aux_sync_recovery_challenges_v2 WHERE expires_at<now()-interval '1day'",[])).length,1);assert.deepEqual((await query('SELECT envelope FROM aux_sync_recovery_v2 WHERE user_id=$1',[owner]))[0].envelope,encrypted);await assert.rejects(cleanExpiredSyncRecoveryChallenges(0,query));
  // Ordinary expired-session deletion cannot block on historical encrypted backups.
  await query('DELETE FROM aux_sessions WHERE id=$1',[session]);assert.equal((await query('SELECT * FROM aux_sync_recovery_challenges_v2 WHERE session_id=$1',[session])).length,0);assert.equal((await query('SELECT created_by_session FROM aux_sync_recovery_v2 WHERE user_id=$1',[owner]))[0].created_by_session,session);
  // Actual account purge removes recovery data before its completion marker.
  await query('UPDATE aux_users SET deleted_at=now() WHERE id=$1',[owner]);assert.equal((await purgeDeletedUserData(owner)).complete,true);assert.equal((await query('SELECT * FROM aux_sync_recovery_v2 WHERE user_id=$1',[owner])).length,0);assert.ok((await query('SELECT data_purged_at FROM aux_users WHERE id=$1',[owner]))[0].data_purged_at);
 }finally{await pg.close();globalThis.fetch=previous.fetch;neonConfig.fetchFunction=previous.transport;for(const [name,value]of Object.entries({DATABASE_URL:previous.url,AUX_AUTH_SECRET:previous.secret,AUX_DATA_ENCRYPTION_KEY:previous.key}))if(value===undefined)delete process.env[name];else process.env[name]=value;}
});
