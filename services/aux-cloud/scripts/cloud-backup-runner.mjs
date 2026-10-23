/** Reviewed runner entrypoint. Does not install, provision or enroll monitoring. */
import assert from 'node:assert/strict';
import {realpath} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readRecoveryKey} from './recovery-bundle.mjs';
import {createR2Storage} from './backup-r2-storage.mjs';
import {readRunnerFile,validateRunnerReview,runBackupSchedule,pingMonitor} from './backup-runner-core.mjs';
const [command,reviewPath,jobId,...extra]=process.argv.slice(2);
let key;
try{
 assert(reviewPath&&extra.length===0&&(['resume'].includes(command)?jobId:!jobId),'Expected capture|expiry|credential|resume-expiry REVIEW_JSON, or resume REVIEW_JSON JOB_ID');
 const config=validateRunnerReview(await readRunnerFile(reviewPath));
 // Existing paid/Gateway credentials never become launch permissions here.
 assert(process.env.AUX_PAYMENTS_ENABLED==='false'&&process.env.AUX_HOSTED_AI_ENABLED==='false','Explicit no-payment/no-hosted-spend mode required');
 const urls={capture:process.env.AUX_BACKUP_CAPTURE_PING_URL,expiry:process.env.AUX_BACKUP_EXPIRY_PING_URL,credential:process.env.AUX_BACKUP_CREDENTIAL_PING_URL};
 for(const url of Object.values(urls))assert(typeof url==='string'&&/^https:\/\/hc-ping\.com\/[a-f0-9-]{36}$/.test(url),'Three private monitor connections required');
 assert.equal(await realpath(config.keyFile),config.keyFile,'Canonical recovery key required');
 key=await readRecoveryKey(config.keyFile);
 const capture=async config=>{
  assert(process.env.AUX_PG_DUMP?.startsWith('/')&&process.env.AUX_PG_RESTORE?.startsWith('/'),'Explicit Linux PostgreSQL client paths required');
  await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,[fileURLToPath(new URL('./cloud-backup-job.mjs',import.meta.url)),'capture',config.jobsRoot,config.deliveryRoot,config.keyFile,'--max-bytes='+config.maxBytes],{env:process.env,stdio:['ignore','ignore','ignore']});
   child.once('error',()=>reject(Error('Capture process failed')));
   child.once('close',(code,signal)=>code===0&&!signal?resolve():reject(Error('Capture requires operator review')));
  });
 };
 const result=await runBackupSchedule({command,jobId,config,key,capture,remoteFactory:createR2Storage,monitor:(channel,phase)=>pingMonitor(urls[channel],phase)});
 console.log(JSON.stringify({event:'aux_backup_schedule_verified',command,...result,productionActivated:false}));
}catch{console.error('Aux backup schedule stopped. Preserve private job, lock and intent records; inspect with the reviewed operator runbook.');process.exitCode=1;}
finally{key?.fill(0);}
