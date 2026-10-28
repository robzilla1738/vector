import test,{mock} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {Hono} from 'hono';
import {HTTPException} from 'hono/http-exception';
import {SignJWT} from 'jose';
import {app} from './app';
import {requireInstallation,userDataTables,type AuthVariables} from './auth';
import {publishShareForUser} from './sync';
import {withMigratedDatabase} from './test-database';

// Tables keyed by user that the purge clears by other means, with the reason.
const purgedSeparately:Record<string,string>={aux_sessions:'deleted after their refresh tokens'};

test('account purge covers every table that stores a user id',async()=>{
  await withMigratedDatabase(async query=>{
    const rows=await query("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='user_id' ORDER BY table_name");
    const keyed=rows.map(r=>r.table_name as string),covered=new Set<string>([...userDataTables,...Object.keys(purgedSeparately)]);
    assert.deepEqual(keyed.filter(t=>!covered.has(t)),[],'add new user tables to userDataTables');
    assert.deepEqual([...covered].filter(t=>!keyed.includes(t)),[],'remove dropped tables from userDataTables');
  });
});

test('route middleware stays inside its own mount',async()=>{
  await withMigratedDatabase(async query=>{
    const user=randomUUID(),session=randomUUID();
    const jwt=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(user).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
    await query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3)',[user,'fixture-user','fixture-user@example.invalid']);
    await query("INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES($1,$2,$3,now()+interval '10minutes',now()+interval '1day','macos')",[session,user,createHash('sha256').update(jwt).digest('hex')]);
    // A 20 KiB body is over recovery's 16 KiB cap but well inside the app's 4 MiB cap.
    const response=await app.request('/api/v1/users/settings',{method:'PUT',headers:{authorization:'Bearer '+jwt,'content-type':'application/json'},body:JSON.stringify({padding:'x'.repeat(20480)})});
    assert.notEqual(response.status,413);
    assert.equal(response.headers.get('cache-control'),'no-store');
    assert.ok(!JSON.stringify(await response.json()).includes('RECOVERY_'));
  });
});

test('user settings merge partial writes and always read a boolean sync',async()=>{
  await withMigratedDatabase(async query=>{
    const user=randomUUID(),session=randomUUID();
    const jwt=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(user).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
    await query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3)',[user,'fixture-user','fixture-user@example.invalid']);
    await query("INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES($1,$2,$3,now()+interval '10minutes',now()+interval '1day','macos')",[session,user,createHash('sha256').update(jwt).digest('hex')]);
    const settings=(method:string,body?:object)=>app.request('/api/v1/users/settings',{method,headers:{authorization:'Bearer '+jwt,'content-type':'application/json'},body:body&&JSON.stringify(body)});
    assert.deepEqual(await (await settings('GET')).json(),{sync:false});
    assert.equal((await settings('PUT',{timezone:'America/Chicago'})).status,200);
    assert.deepEqual(await (await settings('GET')).json(),{timezone:'America/Chicago',sync:false});
    assert.equal((await settings('PUT',{sync:true})).status,200);
    assert.deepEqual(await (await settings('GET')).json(),{timezone:'America/Chicago',sync:true});
    assert.equal((await settings('PUT',{sync:'yes'})).status,400);
  });
});

test('installation-only routes refuse web sign-in sessions',async()=>{
  const gated=new Hono<{Variables:AuthVariables}>();
  gated.use('*',async(c,next)=>{c.set('user',{id:'u',clerkId:'c',email:'e',sessionId:c.req.header('x-session')!});await next();});
  gated.get('/sync/key/status',requireInstallation,c=>c.json({ok:true}));
  const web=await gated.request('/sync/key/status',{headers:{'x-session':'clerk:sess_fixture'}});
  assert.equal(web.status,403);assert.equal((await web.json()).code,'DEVICE_REQUIRED');
  assert.equal((await gated.request('/sync/key/status',{headers:{'x-session':randomUUID()}})).status,200);
});

async function refusedWith(code:string,attempt:Promise<unknown>){
  const error=await attempt.then(()=>assert.fail(`expected ${code}`),(caught:unknown)=>caught);
  assert.ok(error instanceof HTTPException);assert.equal((await error.getResponse().json()).error.code,code);
}

test('share publishing enforces the count, storage and hourly limits',async()=>{
  await withMigratedDatabase(async query=>{
    const user=randomUUID(),message=[{role:'user',content:'hello',timestamp:0}];
    await query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3)',[user,'fixture-share','fixture-share@example.invalid']);
    const first=await publishShareForUser(user,{sourceSessionId:'s-0',title:'First',messages:message});
    // Republishing replaces the page in place instead of counting as a new share.
    assert.equal((await publishShareForUser(user,{sourceSessionId:'s-0',title:'Again',messages:message})).id,first.id);
    await query("INSERT INTO shared_sessions(id,user_id,source_session_id,title,messages) SELECT 'fixture-share-'||n,$1,'bulk-'||n,'t','[]'::jsonb FROM generate_series(1,499) n",[user]);
    await refusedWith('SHARE_LIMIT_REACHED',publishShareForUser(user,{sourceSessionId:'s-new',title:'Over',messages:message}));
    await query("UPDATE shared_sessions SET revoked_at=now() WHERE source_session_id LIKE 'bulk-%'");
    await query("UPDATE shared_sessions SET messages=to_jsonb(repeat('x',104857000)) WHERE source_session_id='s-0'");
    await refusedWith('SHARE_STORAGE_FULL',publishShareForUser(user,{sourceSessionId:'s-new',title:'Big',messages:[{role:'user',content:'y'.repeat(1000),timestamp:0}]}));
    await query("UPDATE shared_sessions SET messages='[]'::jsonb WHERE source_session_id='s-0'");
    await query('DELETE FROM aux_rate_limits');
    for(let n=0;n<60;n++)await publishShareForUser(user,{sourceSessionId:'s-0',title:'Burst',messages:message});
    await refusedWith('RATE_LIMITED',publishShareForUser(user,{sourceSessionId:'s-0',title:'Burst',messages:message}));
  });
});

test('recovery denials and failures log one JSON line with the request id',async()=>{
  await withMigratedDatabase(async query=>{
    const user=randomUUID(),session=randomUUID(),logs:unknown[]=[];
    const jwt=await new SignJWT({sid:session,sg:0}).setProtectedHeader({alg:'HS256'}).setSubject(user).setIssuer('https://api.getaux.co').setAudience('aux-desktop').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(process.env.AUX_AUTH_SECRET));
    await query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3)',[user,'fixture-user','fixture-user@example.invalid']);
    await query("INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform) VALUES($1,$2,$3,now()+interval '10minutes',now()+interval '1day','macos')",[session,user,createHash('sha256').update(jwt).digest('hex')]);
    for(const level of ['warn','error'] as const)mock.method(console,level,(line:string)=>logs.push(JSON.parse(line)));
    try{
      const response=await app.request('/api/v1/sync/recovery/v2/challenge',{method:'POST',headers:{authorization:'Bearer '+jwt,'content-type':'application/json','x-vercel-id':'iad1::recovery'},body:JSON.stringify({operation:'material',generation:7})});
      assert.equal(response.status,409);
      assert.deepEqual(logs,[{event:'aux.recovery.denied',requestId:'iad1::recovery',path:'/api/v1/sync/recovery/v2/challenge',code:'RECOVERY_SESSION_REQUIRED'}]);
    }finally{mock.restoreAll();}
  });
});
