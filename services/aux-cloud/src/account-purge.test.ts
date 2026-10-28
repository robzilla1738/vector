/** Account deletion end to end: the real DELETE /auth/me route, the real migrations and a loopback Blob store. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {SignJWT} from 'jose';
import {app} from './app';
import {userDataTables} from './auth';
import {withMigratedDatabase,type Query} from './test-database';

const sha=(value:string)=>createHash('sha256').update(value).digest('hex');
/** Puts a row in every table that holds user data, plus private files: two attachments and an avatar. */
async function seed(query:Query,blobs:Set<string>,user:string,tag:string){
  const session=randomUUID(),[a1,a2]=[randomUUID(),randomUUID()],jwt=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(user).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
  const email=`${tag}@example.invalid`,files=[`aux/${user}/${a1}/content`,`aux/${user}/${a2}/content`,`avatars/${user}/${randomUUID()}`];
  for(const file of files)blobs.add(file);
  const statements:[string,unknown[]][]=[
    ['INSERT INTO aux_users(id,clerk_id,email,name,avatar_path,avatar_mime) VALUES($1,$2,$3,$4,$5,$6)',[user,'clerk_'+tag,email,'Fixture '+tag,files[2],'image/png']],
    ["INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES($1,$2,$3,now()+interval '10 minutes',now()+interval '1 day','macos')",[session,user,sha(jwt)]],
    ['INSERT INTO aux_refresh_tokens(token_hash,session_id) VALUES($1,$2)',[sha('refresh'+tag),session]],
    ["INSERT INTO aux_email_challenges(email,code_hash,expires_at) VALUES($1,'x',now())",[email]],
    // Upload tokens have expired, so nothing can still arrive for these files.
    ...[a1,a2].map((id,n):[string,unknown[]]=>["INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at) VALUES($1,$2,$3,'f','text/plain',1,repeat('a',64),'attachment','ready',now()-interval '1 day')",[id,user,files[n]]]),
    ["INSERT INTO aux_attachment_bindings(user_id,session_id,local_path,attachment_id,blob_id) VALUES($1,'s1','attachments/a.txt','att',$2)",[user,a1]],
    ['INSERT INTO aux_retired_session_blobs(blob_id,user_id) VALUES($1,$2)',[a2,user]],
    ["INSERT INTO aux_session_snapshots(user_id,session_id,generation,blob_id) VALUES($1,'s1',0,$2)",[user,a1]],
    ["INSERT INTO aux_drive_cookies(user_id,generation,captured_at,sha256,size,object_sha256,object_size,content) VALUES($1,0,0,repeat('b',64),1,repeat('c',64),1,'\\x00')",[user]],
    ["INSERT INTO aux_drive_files(user_id,path,sha256,size,object_sha256,object_size,generation,content) VALUES($1,'notes.md',repeat('b',64),1,repeat('c',64),1,0,'\\x00')",[user]],
    ['INSERT INTO aux_drive_heads(user_id) VALUES($1)',[user]],
    ["INSERT INTO sync_heads(user_id,manifest) VALUES($1,'{}')",[user]],
    ["INSERT INTO sync_objects(user_id,sha256,content) VALUES($1,repeat('d',64),'\\x00')",[user]],
    ["INSERT INTO sync_entities(user_id,kind,entity_id,payload) VALUES($1,'settings','settings','{}')",[user]],
    ["INSERT INTO aux_sync_recovery_challenges_v2(id,user_id,session_id,fingerprint,generation,operation,request_hash,nonce,expires_at) VALUES($1,$2,$3,'fp',0,'material',repeat('e',64),'n',now())",[randomUUID(),user,session]],
    ["INSERT INTO aux_sync_recovery_v2(user_id,generation,revision,recovery_id,envelope,csk_commitment,created_by_session) VALUES($1,0,1,$2,'{}',repeat('f',64),$3)",[user,randomUUID(),session]],
    ["INSERT INTO sync_keys(user_id,wrapped_key) VALUES($1,'{}')",[user]],
    ["INSERT INTO shared_sessions(id,user_id,source_session_id,title,messages) VALUES($1,$2,'s1','Shared','[]')",[`share-${tag}-0001`,user]],
    ["INSERT INTO aux_device_requests(device_code_hash,user_code_hash,device_name,requested_email_hash,user_id) VALUES($1,$2,'Mac','h',$3)",['dc'+tag,'uc'+tag,user]],
    ['INSERT INTO aux_credit_refunds(charge_id,user_id,amount_micros) VALUES($1,$2,1)',['ch_'+tag,user]],
    ['INSERT INTO aux_credit_grants(source_id,user_id,amount_micros) VALUES($1,$2,1)',['src_'+tag,user]],
    ['INSERT INTO aux_credit_periods(subscription_id,user_id,period_start,amount_micros) VALUES($1,$2,now(),1)',['sub_'+tag,user]],
    ["INSERT INTO aux_checkout_requests(user_id,mode,request_id,request_key,expires_at) VALUES($1,'payment',$2,'k',now())",[user,randomUUID()]],
    ["INSERT INTO aux_usage(id,user_id,kind,units,cost_micros) VALUES($1,$2,'chat',1,1)",[randomUUID(),user]],
    ['INSERT INTO aux_wallets(user_id) VALUES($1)',[user]],
    ['INSERT INTO aux_subscriptions(user_id) VALUES($1)',[user]],
  ];
  for(const [text,values] of statements)await query(text,values);
  return {jwt,session,email,files};
}
const rowsFor=async(query:Query,user:string):Promise<Record<string,number>>=>Object.fromEntries(await Promise.all([...userDataTables,'aux_sessions'].map(async table=>[table,Number((await query(`SELECT count(*) AS n FROM ${table} WHERE user_id=$1`,[user]))[0].n)])));

test('deleting an account removes its rows in every user table, its files and its Clerk identity, and nothing else',async()=>{
  await withMigratedDatabase(async(query,stats)=>{
    const [user,other]=[randomUUID(),randomUUID()],gone=await seed(query,stats.blobs,user,'leaving'),kept=await seed(query,stats.blobs,other,'staying');
    // The seed covers every table the purge clears, so a new user table must be seeded here too.
    for(const [table,count] of Object.entries(await rowsFor(query,user)))assert.ok(count>0,`seed a row in ${table}`);
    const before=await rowsFor(query,other);

    const response=await app.request('/api/v1/auth/me',{method:'DELETE',headers:{authorization:'Bearer '+gone.jwt}});
    assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true,purgePending:false});

    for(const [table,count] of Object.entries(await rowsFor(query,user)))assert.equal(count,0,table);
    assert.deepEqual(await query('SELECT * FROM aux_refresh_tokens WHERE session_id=$1',[gone.session]),[]);
    assert.deepEqual(await query('SELECT * FROM aux_email_challenges WHERE email=$1',[gone.email]),[]);
    assert.deepEqual(gone.files.filter(f=>stats.blobs.has(f)),[]);
    assert.deepEqual(stats.clerkDeletes,['clerk_leaving']);
    // Only an anonymous tombstone remains, so the email and Clerk identity are free again.
    const [tombstone]=await query('SELECT clerk_id,email,name,profile_url,avatar_path,avatar_mime,deleted_at IS NOT NULL AS deleted,data_purged_at IS NOT NULL AS purged FROM aux_users WHERE id=$1',[user]);
    assert.deepEqual(tombstone,{clerk_id:'deleted:'+user,email:`deleted+${user}@invalid`,name:'',profile_url:null,avatar_path:null,avatar_mime:null,deleted:true,purged:true});
    assert.equal((await app.request('/api/v1/auth/me',{headers:{authorization:'Bearer '+gone.jwt}})).status,401);

    assert.deepEqual(await rowsFor(query,other),before);
    assert.deepEqual(kept.files.filter(f=>!stats.blobs.has(f)),[]);
    assert.equal((await app.request('/api/v1/auth/me',{headers:{authorization:'Bearer '+kept.jwt}})).status,200);
  });
});
