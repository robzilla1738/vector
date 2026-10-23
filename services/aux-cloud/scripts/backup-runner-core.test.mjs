import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,rm,writeFile,readFile,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {Readable} from 'node:stream';
import {createBackupJob,authenticateCapturedJob,deliverBackupJob,loadBackupJobStatuses} from './backup-job-core.mjs';
import {writeBundle} from './recovery-bundle.mjs';
import {validateRunnerReview,credentialState,pingMonitor,runBackupSchedule} from './backup-runner-core.mjs';
const future='2026-11-22T00:00:00.000Z';
async function fixture(){const root=await realpath(await mkdtemp(join(tmpdir(),'aux-runner-fixture-')));for(const d of ['jobs','delivery','control'])await mkdir(join(root,d),{mode:0o700});return {root,config:{format:'aux.backup.runner.review.v1',enabled:true,jobsRoot:join(root,'jobs'),deliveryRoot:join(root,'delivery'),controlRoot:join(root,'control'),keyFile:join(root,'recovery.key'),accountId:'a'.repeat(32),bucket:'aux-recovery-prod',prefix:'synthetic/',maxBytes:65536,maximumJobs:7,credentialExpiresAt:future}};}
test('private runner freezes interrupted capture and never automatically captures again; monitor URLs stay bounded',async()=>{
 const {root,config}=await fixture(),key=randomBytes(32),events=[];let captures=0;
 const input={config,key,now:Date.parse('2026-10-23T00:00:00.000Z'),capture:async()=>{captures++;throw Error('synthetic private failure');},remoteFactory:async()=>{throw Error('Unexpected R2 call');},monitor:async(c,p)=>events.push([c,p])};
 try{
  assert.equal(credentialState(config,input.now),'current');assert.equal(credentialState(config,Date.parse('2026-11-20')),'renewal-required');assert.equal(credentialState(config,Date.parse(future)),'expired');
  await assert.rejects(runBackupSchedule({...input,command:'capture'}),/stopped/);await assert.rejects(runBackupSchedule({...input,command:'capture'}),/stopped/);assert.equal(captures,1);assert.equal(events.filter(e=>e[1]==='success').length,0);assert.equal(JSON.parse(await readFile(join(config.controlRoot,'active.json'))).command,'capture');
  let calls=0;await assert.rejects(pingMonitor('https://example.com/private','success',async()=>{calls++;}),/Healthchecks/);assert.equal(calls,0);
  await pingMonitor('https://hc-ping.com/00000000-0000-4000-8000-000000000000','fail',async(url,options)=>{calls++;assert.ok(url.endsWith('/fail'));assert.equal(options.redirect,'error');assert.equal(options.body,'');return new Response(null,{status:200});});assert.equal(calls,1);
  assert.throws(()=>validateRunnerReview({...config,enabled:false}),/approved/);
 }finally{key.fill(0);await rm(root,{recursive:true,force:true});}
});
test('actual authenticated frozen job resume publishes ciphertext, then expiry removes remote before local and preserves uncertainty',async()=>{
 const {root,config}=await fixture(),key=randomBytes(32),data=new Map(),events=[];let job,captures=0,failRemote=true,failDelete=true;
 const remote={async list(prefix){return {keys:[...data.keys()].filter(k=>k.startsWith(prefix))};},async get(key){return data.has(key)?{body:Readable.from([data.get(key)]),size:data.get(key).length}:null;},async put(key,body){if(failRemote)throw Error('unknown synthetic outcome');const pieces=[];for await(const p of body)pieces.push(p);data.set(key,Buffer.concat(pieces));},async delete(key){events.push('delete:'+key.split('/').at(-1));data.delete(key);if(failDelete){failDelete=false;throw Error('Unknown deletion outcome');}}};
 const now=Date.now(),expires=now+1000;
 config.credentialExpiresAt=new Date(now+30*86400000).toISOString();
 const input={config,key,now,capture:async()=>{captures++;job=await createBackupJob(config.jobsRoot,config.deliveryRoot,key);await writeBundle({directory:join(job.path,'bundle'),key,maxBytes:config.maxBytes,entries:[{name:'database.dump',source:Readable.from([Buffer.from('small synthetic archive')])}],metadata:{retentionDeadline:new Date(expires).toISOString()}});await authenticateCapturedJob(job,key,config.maxBytes);await deliverBackupJob(job,key);},remoteFactory:async()=>remote,monitor:async(c,p)=>events.push(c+':'+p)};
 try{
  await assert.rejects(runBackupSchedule({...input,command:'capture'}),/stopped/);assert.equal(captures,1);assert.equal((await loadBackupJobStatuses(job,key)).at(-1).phase,'remote-deliver-unknown-outcome-review-required');
  failRemote=false;assert.equal((await runBackupSchedule({...input,command:'resume',jobId:job.id})).remoteVerified,true);assert.equal(captures,1);assert.equal(data.size,3);assert.ok(events.includes('capture:success'));
  // Real retention uses wall time for local deletion; wait only until this tiny fixture's deadline.
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,expires-Date.now()+10)));
  await assert.rejects(runBackupSchedule({...input,command:'expiry',now:Date.now()}),/stopped/);assert.equal(JSON.parse(await readFile(join(config.controlRoot,'active.json'))).command,'expiry');
  const deletions=events.filter(e=>e.startsWith('delete:')).length;await assert.rejects(runBackupSchedule({...input,command:'expiry',now:Date.now()}),/stopped/);assert.equal(events.filter(e=>e.startsWith('delete:')).length,deletions);
  assert.equal((await runBackupSchedule({...input,command:'resume-expiry',now:Date.now()})).expired,1);assert.equal(data.size,0);assert.equal(events.filter(e=>e.startsWith('delete:'))[0],'delete:bundle.json');assert.equal((await loadBackupJobStatuses(job,key)).at(-1).phase,'expired-owned-ciphertexts-removed');
  await assert.rejects(readFile(join(job.path,'bundle','database.dump.sealed')),{code:'ENOENT'});
 }finally{key.fill(0);await rm(root,{recursive:true,force:true});}
});
