/** In-memory PostgreSQL only: never loads .env or contacts a DB/provider. */
import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';
const {PGlite}=await import(createRequire(new URL('../../../../../services/aux-cloud/package.json',import.meta.url)).resolve('@electric-sql/pglite'));
import {generateKeyPairSync,sign,randomUUID,createHash} from 'node:crypto';
import {SyncRecoveryService,recoveryActionHash,type RecoveryAction} from '../../../../../services/aux-cloud/src/sync-recovery';
import {SyncRecoveryStore} from '../../../../../services/aux-cloud/src/sync-recovery-store';
import {sealSyncRecovery,openSyncRecovery,recoveryEnrollmentProof} from '../../../../../services/aux-cloud/src/sync-recovery-crypto';
import {AuxSyncRecoveryClient} from '../source/desktop';
import {wrapRecoveryServerCsk,openRecoveryServerCsk} from '../../../../../services/aux-cloud/src/sync-recovery-server-key';
const db=new PGlite();
await db.exec(`CREATE TABLE aux_users(id uuid PRIMARY KEY,sync_generation integer NOT NULL,deleted_at timestamptz);CREATE TABLE aux_sessions(id uuid PRIMARY KEY,user_id uuid REFERENCES aux_users(id),device_fingerprint text,device_public_key jsonb,platform text,revoked_at timestamptz,expires_at timestamptz,access_expires_at timestamptz);CREATE TABLE sync_keys(user_id uuid PRIMARY KEY REFERENCES aux_users(id),generation integer NOT NULL,revision integer NOT NULL DEFAULT1,wrapped_key jsonb NOT NULL);`.replace('DEFAULT1','DEFAULT 1'));
await db.exec(readFileSync(new URL('../migrations/012-sync-recovery-v2.sql',import.meta.url),'utf8'));
const query=async(text:string,values:unknown[])=> (await db.query(text,values)).rows;
const actor={id:randomUUID(),sessionId:randomUUID()},other={id:randomUUID(),sessionId:randomUUID()},keys=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=keys.publicKey.export({format:'jwk'}),fp='sha256:'+createHash('sha256').update(Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,'base64url'),Buffer.from(jwk.y!,'base64url')])).digest('hex');
await query('INSERT INTO aux_users VALUES($1,0,NULL),($2,0,NULL)',[actor.id,other.id]);await query(`INSERT INTO aux_sessions VALUES($1,$2,$3,$4::jsonb,'macos',NULL,now()+interval '1hour',now()+interval '1hour')`,[actor.sessionId,actor.id,fp,JSON.stringify(jwk)]);
const serverKey=Buffer.alloc(32,13),csk=Buffer.alloc(32,29),secret=Buffer.alloc(16,47),store=new SyncRecoveryStore(query),service=new SyncRecoveryService(store,()=>Buffer.from(serverKey));
const wrapped=wrapRecoveryServerCsk(csk,actor.id,0,serverKey);await query('INSERT INTO sync_keys(user_id,generation,wrapped_key) VALUES($1,0,$2::jsonb)',[actor.id,JSON.stringify(wrapped)]);
const envelope=sealSyncRecovery(csk,secret,{userId:actor.id,generation:0,revision:1});assert.deepEqual(openSyncRecovery(envelope,secret,{userId:actor.id,generation:0}),csk);assert.throws(()=>openSyncRecovery(envelope,secret,{userId:other.id,generation:0}));
const enroll:RecoveryAction={operation:'enroll',generation:0,expectedRevision:0,envelope};
async function submission(action:RecoveryAction){const challenge=await service.challenge(actor,action),message=Buffer.from(challenge.messageB64,'base64');return {challengeId:challenge.challenge.id,signatureB64:sign('sha256',message,keys.privateKey).toString('base64'),action,...action.operation==='enroll'?{cskProofB64:recoveryEnrollmentProof(csk,message)}:{}};}
const publish=await submission(enroll),first=await service.submit(actor,publish),retry=await service.submit(actor,publish);assert.deepEqual(retry,first);assert.equal(first.recoveryRevision,1);assert.equal(Number((await query('SELECT count(*) AS n FROM aux_sync_recovery_v2',[]))[0].n),1);
await assert.rejects(service.submit(actor,{...publish,action:{...enroll,expectedRevision:1}}));await assert.rejects(service.challenge(other,{operation:'material',generation:0}));
const read=await service.submit(actor,await submission({operation:'material',generation:0}));assert.deepEqual(openSyncRecovery(read.recoveryBackup,secret,{userId:actor.id,generation:0}),csk);
// Simulate unavailable server key row only in the synthetic database; recovery
// must re-create the same authority and must never update an existing different key.
await query('DELETE FROM sync_keys WHERE user_id=$1',[actor.id]);
const restore:RecoveryAction={operation:'recover',generation:0,recoveryId:envelope.recoveryId,recoveryRevision:1,cskB64:csk.toString('base64')},restoreRequest=await submission(restore);
const restored=await service.submit(actor,restoreRequest);assert.equal(restored.state,'ready');assert.deepEqual(await service.submit(actor,restoreRequest),restored);const row=(await query('SELECT wrapped_key FROM sync_keys WHERE user_id=$1',[actor.id]))[0];assert.deepEqual(openRecoveryServerCsk(row.wrapped_key,actor.id,0,serverKey),csk);
const wrong=wrapRecoveryServerCsk(Buffer.alloc(32,99),actor.id,0,serverKey);await query('UPDATE sync_keys SET wrapped_key=$2::jsonb WHERE user_id=$1',[actor.id,JSON.stringify(wrong)]);await assert.rejects(service.submit(actor,await submission(restore)),/RECOVERY_KEY_CONFLICT/);assert.deepEqual((await query('SELECT wrapped_key FROM sync_keys WHERE user_id=$1',[actor.id]))[0].wrapped_key,wrong);
const forged=await submission({operation:'material',generation:0});forged.signatureB64=sign('sha256',Buffer.from('wrong'),keys.privateKey).toString('base64');await assert.rejects(service.submit(actor,forged),/RECOVERY_SIGNATURE_INVALID/);
await query('UPDATE sync_keys SET wrapped_key=$2::jsonb WHERE user_id=$1',[actor.id,JSON.stringify(wrapped)]);
let local:Buffer|null=Buffer.from(csk),stores=0,loseReply=true,raceLocal=false;
const client=new AuxSyncRecoveryClient({context:()=>({userId:actor.id,generation:0}),readCsk:async()=>local,publishRecoveredCsk:async(_id,key,expected)=>{if(expected.userId!==actor.id||expected.generation!==0)return 'conflict';if(local&&!local.equals(Buffer.from(key)))return 'conflict';if(local)return 'same';local=Buffer.from(key);stores++;return 'stored';},status:async()=>({state:'ready',syncGeneration:0}),sign:async message=>sign('sha256',message,keys.privateKey),request:async(_id,path,body)=>{if(path.endsWith('/challenge'))return service.challenge(actor,body);const response=await service.submit(actor,body);if(raceLocal&&(body as any).action.operation==='recover'){raceLocal=false;local=Buffer.alloc(32,77);}if(loseReply&&(body as any).action.operation==='enroll'){loseReply=false;throw Error('synthetic lost response');}return response;}});
const nextSecret=Buffer.alloc(16,55),prepared=await client.prepareEnrollment(7,nextSecret.toString('base64'),1);
await assert.rejects(client.publishEnrollment(prepared),/lost response/);const enrollment=await client.publishEnrollment(prepared);assert.equal(enrollment.recoveryRevision,2);await assert.rejects(service.submit(actor,publish));
local=null;await assert.rejects(client.recover(7,Buffer.alloc(16,99).toString('base64')));assert.equal(stores,0);await client.recover(7,nextSecret.toString('base64'));assert.deepEqual(local,csk);assert.equal(stores,1);
local=Buffer.alloc(32,99);await assert.rejects(client.recover(7,nextSecret.toString('base64')),/different local Sync key/);assert.equal(stores,1);assert.deepEqual(local,Buffer.alloc(32,99));
// A different key arrives after the initial local read but before publication.
local=null;raceLocal=true;await assert.rejects(client.recover(7,nextSecret.toString('base64')),/Atomic local Sync key publication refused/);assert.deepEqual(local,Buffer.alloc(32,77));assert.equal(stores,1);
// Borrowed boundary bytes were never cleared by preparation or recovery.
assert.deepEqual(csk,Buffer.alloc(32,29));
const races=await Promise.all([1,2].map(async()=>submission({operation:'enroll',generation:0,expectedRevision:2,envelope:sealSyncRecovery(csk,nextSecret,{userId:actor.id,generation:0,revision:3})})));
const raced=await Promise.allSettled(races.map(r=>service.submit(actor,r)));assert.equal(raced.filter(r=>r.status==='fulfilled').length,1);assert.equal(Number((await query('SELECT count(*) AS n FROM aux_sync_recovery_v2',[]))[0].n),3);
await query('UPDATE aux_users SET sync_generation=1 WHERE id=$1',[actor.id]);await assert.rejects(service.submit(actor,publish));assert.equal(Number((await query('SELECT count(*) AS n FROM aux_sync_recovery_v2',[]))[0].n),3);
await db.close();console.log('Aux recovery v2 passed: actual in-memory PostgreSQL transaction, native-format P256 proof, same-CSK recovery, lost-response replay, paired12-word client, concurrent revision CAS, owner/generation/key/conflicting request refusal');
