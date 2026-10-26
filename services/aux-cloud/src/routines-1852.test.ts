import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, generateKeyPairSync, createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { neonConfig } from '@neondatabase/serverless';
import { Hono } from 'hono';
import { ZodError } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { routines1852Routes } from './routines-1852';
import type { AuthVariables } from './auth';

test('actual routine-v2 routes retain owner/device/revision boundaries and preserve legacy records', async () => {
  process.env.DATABASE_URL='postgresql://synthetic:synthetic@offline.invalid/routines';
  const pg=new PGlite(),owner=randomUUID(),other=randomUUID(),session=randomUUID(),otherSession=randomUUID();
  const originalTransport=neonConfig.fetchFunction;
  try {
    for(const name of(await readdir(new URL('../migrations/',import.meta.url))).filter(name=>name.endsWith('.sql')).sort())await pg.exec((await readFile(new URL('../migrations/'+name,import.meta.url),'utf8')).replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;',''));
    const query=async(text:string,params:unknown[])=>{
      const result=await pg.query(text,params),fields=result.fields.map(field=>({name:field.name,dataTypeID:field.dataTypeID}));
      return {fields,rows:result.rows.map(row=>fields.map(field=>{const value=(row as Record<string,unknown>)[field.name];if(value==null)return null;if(field.dataTypeID===114||field.dataTypeID===3802)return JSON.stringify(value);if(value instanceof Date)return value.toISOString();if(typeof value==='boolean')return value?'t':'f';return String(value);})),rowCount:result.affectedRows??result.rows.length,command:text.trim().split(/\s+/)[0]};
    };
    neonConfig.fetchFunction=async(_url:unknown,init:{body:string})=>{
      const body=JSON.parse(init.body);
      if(body.queries){await pg.exec('BEGIN');try{const results=[];for(const item of body.queries)results.push(await query(item.query,item.params));await pg.exec('COMMIT');return Response.json({results});}catch(error){await pg.exec('ROLLBACK');throw error;}}
      return Response.json(await query(body.query,body.params));
    };
    const jwk=generateKeyPairSync('ec',{namedCurve:'prime256v1'}).publicKey.export({format:'jwk'}),fingerprint='sha256:'+createHash('sha256').update(Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,'base64url'),Buffer.from(jwk.y!,'base64url')])).digest('hex');
    await pg.query('INSERT INTO aux_users(id,clerk_id,email) VALUES($1,$2,$3),($4,$5,$6)',[owner,'owner','owner@example.invalid',other,'other','other@example.invalid']);
    for(const[user,id]of [[owner,session],[other,otherSession]])await pg.query("INSERT INTO aux_sessions(id,user_id,access_hash,access_expires_at,expires_at,platform,device_fingerprint) VALUES($1,$2,$3,now()+interval '1 hour',now()+interval '1 day','macos',$4)",[id,user,'fixture-'+id,fingerprint]);
    let selectedUser=owner,selectedSession=session;
    const app=new Hono<{Variables:AuthVariables}>();app.use('*',async(c,next)=>{c.set('user',{id:selectedUser,clerkId:'fixture',email:'fixture@example.invalid',sessionId:selectedSession});await next();});app.route('/',routines1852Routes);app.onError((error,c)=>error instanceof HTTPException?error.getResponse():error instanceof ZodError?c.json({error:'Invalid routine'},400):c.json({error:error.message},500));
    const request=(path:string,method='GET',body?:unknown)=>app.request(path,{method,...body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}});
    const device={platform:'macos',installationScheme:'p256_v1',ikSigPublicKeyJwk:jwk,ikSigKeyFingerprint:fingerprint};
    const definition={id:'routine-one',type:'standalone',environment:'device',deviceId:session,name:'Synthetic routine',prompt:'Do not execute; schema fixture only.',rrule:'FREQ=DAILY',parentSessionId:null,channelId:null,projectId:null,status:'paused',nextRunAt:null,pausedAt:'2026-10-26T00:00:00Z',deletedAt:null,createdAt:'2026-10-26T00:00:00Z',metadata:{origin:{type:'user'}},sessionConfig:{permissionMode:'read-only'}};
    let response=await request('/routines','POST',definition);assert.equal(response.status,200,await response.clone().text());const created=await response.json() as {revision:number};assert.equal(created.revision,1);
    response=await request('/routines','POST',definition);assert.equal(response.status,200);assert.equal((await response.json() as {revision:number}).revision,1);
    response=await request('/routines/routine-one','PATCH',{revision:1,name:'Renamed'});assert.equal(response.status,200);assert.equal((await response.json() as {revision:number}).revision,2);
    assert.equal((await request('/routines/routine-one','PATCH',{revision:1,status:'deleted'})).status,412);
    assert.equal((await request('/routines','POST',{...definition,id:'wrong-device',deviceId:otherSession})).status,403);
    assert.equal((await request('/routines','POST',{...definition,id:'no-cloud-executor',environment:'cloud',deviceId:null})).status,409);
    selectedUser=other;selectedSession=otherSession;assert.equal((await request('/routines/routine-one')).status,404);selectedUser=owner;selectedSession=session;
    assert.equal((await request('/routines/device-sync','POST',{device,routines:[{id:'routine-one',revision:1,status:'completed',nextRunAt:null}]})).status,200);
    assert.equal((await(await request('/routines/routine-one')).json() as {status:string}).status,'paused');
    assert.equal((await request('/routines/device-sync','POST',{device,routines:[{id:'routine-one',revision:2,status:'active',nextRunAt:'2026-10-27T00:00:00Z'}]})).status,200);
    const settled=await(await request('/routines/routine-one')).json() as {status:string;appliedRevision:number;nextRunAt:null};assert.equal(settled.status,'paused');assert.equal(settled.appliedRevision,2);assert.equal(settled.nextRunAt,null);
    const cloud={format:'aux.routine.v2',...definition,id:'preserved-cloud',environment:'cloud',deviceId:session,status:'active',pausedAt:null,revision:1,appliedRevision:null,updatedAt:'2026-10-26T00:00:00Z'};
    await pg.query("INSERT INTO sync_entities(user_id,kind,entity_id,payload) VALUES($1,'routine',$2,$3::jsonb)",[owner,cloud.id,JSON.stringify(cloud)]);
    const cloudBytes=async()=>(await pg.query<{payload:string}>("SELECT payload::text AS payload FROM sync_entities WHERE user_id=$1 AND entity_id=$2",[owner,cloud.id])).rows[0].payload;
    const preserved=await cloudBytes();
    response=await request('/routines/preserved-cloud','PATCH',{revision:1,status:'paused'});assert.equal(response.status,409);assert.equal((await response.json() as {error:{code:string}}).error.code,'CLOUD_ROUTINE_UNAVAILABLE');
    assert.equal((await request('/routines/preserved-cloud','PATCH',{revision:1,status:'deleted'})).status,409);
    assert.equal((await request('/routines/device-sync','POST',{device,routines:[{id:cloud.id,revision:1,status:'completed',nextRunAt:null}]})).status,200);
    assert.equal(await cloudBytes(),preserved,'Cloud record with matching stale device ID is never changed by device-sync or PATCH');
    assert.equal((await(await request('/routines/preserved-cloud')).json() as {environment:string}).environment,'cloud');
    const legacy={id:'old-routine',kind:'cron',state:'active',private:'keep exact'};await pg.query("INSERT INTO sync_entities(user_id,kind,entity_id,payload) VALUES($1,'routine','old-routine',$2::jsonb)",[owner,JSON.stringify(legacy)]);
    assert.equal((await request('/routines')).status,409);assert.equal((await request('/routines/old-routine','PUT',legacy)).status,409);
    assert.deepEqual((await pg.query<{payload:unknown}>("SELECT payload FROM sync_entities WHERE user_id=$1 AND entity_id='old-routine'",[owner])).rows[0].payload,legacy);
    assert.equal((await request('/routines/routine-one','PATCH',{revision:2,status:'deleted'})).status,200);assert.equal((await request('/routines/routine-one','PATCH',{revision:3,status:'active'})).status,409);
  } finally {neonConfig.fetchFunction=originalTransport;await pg.close();}
});
