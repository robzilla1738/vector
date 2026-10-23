/** Private persistent operator scheduling. Importing performs no I/O/network.
 * Unknown capture/mutation outcomes remain frozen; no automatic recapture. */
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {open,realpath,readdir,unlink,statfs} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {withBackupJobLock,loadBackupJob,loadAuthenticatedBackupInventory,
 loadVerifiedBackupDelivery,recordBackupStatus,deliverBackupJob,expireBackupJob} from './backup-job-core.mjs';
import {runRemoteBackup} from './backup-remote-core.mjs';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const flags=constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK;
export async function readRunnerFile(path,max=16384){
 const file=await open(path,flags);
 try{const s=await file.stat();assert(s.isFile()&&s.nlink===1&&s.uid===process.getuid()&&(s.mode&0o7777)===0o600&&s.size<=max,'Private owned runner file required');return JSON.parse(await file.readFile('utf8'));}finally{await file.close();}
}
export function validateRunnerReview(c){
 const keys=['format','enabled','jobsRoot','deliveryRoot','controlRoot','keyFile','accountId','bucket','prefix','maxBytes','maximumJobs','credentialExpiresAt'];
 assert.deepEqual(Object.keys(c).sort(),keys.sort(),'Runner review fields differ');
 assert.equal(c.format,'aux.backup.runner.review.v1');assert.equal(c.enabled,true,'Runner is not approved/enabled');
 for(const k of ['jobsRoot','deliveryRoot','controlRoot','keyFile'])assert(typeof c[k]==='string'&&/^\/[a-zA-Z0-9_./-]+$/.test(c[k])&&!c[k].split('/').includes('..'),'Explicit canonical paths required');
 const dirs=[c.jobsRoot,c.deliveryRoot,c.controlRoot];for(const a of dirs)for(const b of dirs)if(a!==b)assert(!a.startsWith(b+'/'),'Separate private runner roots required');assert.equal(new Set(dirs).size,3);
 assert(dirs.every(d=>c.keyFile!==d&&!c.keyFile.startsWith(d+'/')),'Recovery key must remain outside job/delivery/control trees');
 assert(/^[a-f0-9]{32}$/.test(c.accountId)&&c.bucket==='aux-recovery-prod','Reviewed Aux R2 recipient required');
 assert(typeof c.prefix==='string'&&c.prefix.length<=256&&/^(?:[a-zA-Z0-9_-]+\/)+$/.test(c.prefix),'Exact bounded prefix required');
 assert(Number.isSafeInteger(c.maxBytes)&&c.maxBytes>0&&c.maxBytes<=1024**3,'Bounded capture budget required');
 assert(Number.isSafeInteger(c.maximumJobs)&&c.maximumJobs>=7&&c.maximumJobs<=366,'Bounded retained metadata count required');
 assert(typeof c.credentialExpiresAt==='string'&&new Date(c.credentialExpiresAt).toISOString()===c.credentialExpiresAt,'Exact credential deadline required');return c;
}
async function privateRoot(path){assert.equal(await realpath(path),path,'Canonical runner root required');const fd=await open(path,flags|constants.O_DIRECTORY);try{const s=await fd.stat();assert(s.isDirectory()&&s.uid===process.getuid()&&(s.mode&0o7777)===0o700,'Owned mode0700 runner root required');return s.dev;}finally{await fd.close();}}
async function syncDir(path){const d=await open(path,flags|constants.O_DIRECTORY);try{await d.sync();}finally{await d.close();}}
async function writeIntent(path,payload){const fd=await open(path,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);try{await fd.writeFile(JSON.stringify(payload)+'\n');await fd.sync();}finally{await fd.close();}}
async function pending(path){try{return await readRunnerFile(path);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function names(root){const entries=await readdir(root);assert(entries.every(n=>uuid.test(n)),'Unresolved job lock or unexpected job entry');return entries.sort();}
export function makeRemoteReview(config,inventory){return {format:'aux.backup.r2.review.v1',accountId:config.accountId,bucket:config.bucket,prefix:config.prefix,jobId:inventory.jobId,bundleId:inventory.bundleId,inventorySha256:createHash('sha256').update(JSON.stringify(inventory)).digest('hex'),maxBytes:config.maxBytes};}
export function credentialState(config,now=Date.now()) {const remaining=Date.parse(config.credentialExpiresAt)-now;return remaining<=0?'expired':remaining<=7*86400000?'renewal-required':'current';}
/** Monitor sends no payload. HTTP errors/redirects never leak the secret URL. */
export async function pingMonitor(url,phase,send=fetch){
 assert(typeof url==='string'&&/^https:\/\/hc-ping\.com\/[a-f0-9-]{36}$/.test(url),'Exact private Healthchecks ping URL required');
 assert(['start','success','fail'].includes(phase));
 try{const response=await send(url+(phase==='success'?'':'/'+phase),{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),body:''});assert(response.ok,'Monitor delivery failed');await response.body?.cancel();}catch{throw Error('Backup monitor delivery failed');}
}
/** Inject only the capture and R2 adapters in fixtures; all job authentication,
 * locking, pending intent, retention and exact ciphertext checks remain real. */
export async function runBackupSchedule({command,jobId,config,key,capture,remoteFactory,monitor,now=Date.now()}){
 validateRunnerReview(config);assert(['capture','resume','expiry','resume-expiry','credential'].includes(command));
 assert(Buffer.isBuffer(key)&&key.length===32,'Recovery key required');
 const devices=[];for(const root of [config.jobsRoot,config.deliveryRoot,config.controlRoot])devices.push(await privateRoot(root));assert.equal(new Set(devices).size,1,'One persistent filesystem required');
 let succeeded=false;
 const channel=command==='resume'?'capture':command==='resume-expiry'?'expiry':command;
 try{
  await monitor(channel,'start');
  const result=await withBackupJobLock(config.controlRoot,async()=>{
   const state=credentialState(config,now);
   if(command==='credential'){assert.equal(state,'current','Recovery credential renewal required');return {credential:state};}
   assert.notEqual(state,'expired','Recovery credential expired');
   const activePath=join(config.controlRoot,'active.json'),active=await pending(activePath);
   assert(!active||['resume','resume-expiry'].includes(command),'Pending capture/mutation requires operator review; never recapture');
   const before=await names(config.jobsRoot);assert(before.length<=config.maximumJobs,'Retained metadata limit reached');
   if(command==='resume'){
    assert(active?.command==='capture'&&uuid.test(jobId)&&Array.isArray(active.before)&&before.includes(jobId)&&!active.before.includes(jobId),'Resume must select exact pending capture');
    assert.deepEqual(before.filter(id=>!active.before.includes(id)),[jobId],'Ambiguous pending capture');
   }
   if(command==='resume-expiry')assert(active?.command==='expiry'&&JSON.stringify(active.before)===JSON.stringify(before),'Resume expiry requires the exact pending job set');
   // Refuse new snapshots while any previous capture is not authenticated or
   // lacks a verified remote completion. No success inferred from an empty map.
   if(command==='capture'){
    assert(before.length<config.maximumJobs,'Retained metadata limit reached');
    const disk=await statfs(config.jobsRoot,{bigint:true});assert(disk.bavail*disk.bsize>=BigInt(config.maxBytes)*4n+1073741824n,'Insufficient private disk reserve');
    for(const id of before){const job=await loadBackupJob(config.jobsRoot,id,key);await loadAuthenticatedBackupInventory(job,key);const phase=await latestPhase(job,key);assert(['remote-deliver-verified','expired-owned-ciphertexts-removed'].includes(phase),'Earlier job requires operator review');}
    await writeIntent(activePath,{format:'aux.backup.runner.intent.v1',command:'capture',before,startedAt:new Date(now).toISOString()});await syncDir(config.controlRoot);
    await capture(config);
    const after=await names(config.jobsRoot),created=after.filter(id=>!before.includes(id));assert.equal(created.length,1,'Capture job identity unknown');jobId=created[0];
   }
   const operate=async(id,operation)=>withBackupJobLock(config.jobsRoot,async()=>{
    const job=await loadBackupJob(config.jobsRoot,id,key),inventory=await loadAuthenticatedBackupInventory(job,key);
    if(operation==='expiry'&&(await latestPhase(job,key))==='expired-owned-ciphertexts-removed')return false;
    assert.equal(job.targetRoot,config.deliveryRoot,'Runner delivery root changed');
    if(operation==='expiry'&&inventory.expiresAt>now)return false;
    if(operation==='deliver')await deliverBackupJob(job,key); // frozen ciphertext only
    const directory=operation==='deliver'?(await loadVerifiedBackupDelivery(job,key)).directory:undefined;
    const review=makeRemoteReview(config,inventory),remote=await remoteFactory(review);
    try{
     const cmd=operation==='expiry'?'expire':'deliver';await recordBackupStatus(job,`remote-${cmd}-intent`,key);
     try{await runRemoteBackup({command:cmd,review,inventory,directory,remote,now});await recordBackupStatus(job,`remote-${cmd}-verified`,key);}
     catch{await recordBackupStatus(job,`remote-${cmd}-unknown-outcome-review-required`,key);throw Error('Remote outcome requires exact-job review');}
     if(operation==='expiry')await expireBackupJob(job,key);
     return true;
    }finally{remote.destroy?.();}
   });
   if(command==='capture'||command==='resume'){
    await operate(jobId,'deliver');await unlink(activePath);await syncDir(config.controlRoot);return {jobId,remoteVerified:true};
   }
   // Expiry never clears a pending capture. Frozen jobs remain available for
   // operator retry even when a prior deletion's network outcome was unknown.
   if(command==='expiry'){await writeIntent(activePath,{format:'aux.backup.runner.intent.v1',command:'expiry',before,startedAt:new Date(now).toISOString()});await syncDir(config.controlRoot);}
   let expired=0;for(const id of before)if(await operate(id,'expiry'))expired++;
   await unlink(activePath);await syncDir(config.controlRoot);return {expired};
  });
  succeeded=true;await monitor(channel,'success');return result;
 }catch{if(!succeeded)await monitor(channel,'fail').catch(()=>{});throw Error('Backup schedule stopped; preserve private job and intent records for operator review');}
}
import {loadBackupJobStatuses} from './backup-job-core.mjs';
async function latestPhase(job,key){const records=await loadBackupJobStatuses(job,key);assert(records.length,'Missing authenticated job status');return records.at(-1).phase;}
