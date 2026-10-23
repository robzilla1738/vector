/** Extracted actual ABI/transport + new bridge only; no daemon startup/native/network. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {AuxSyncRecoveryClient} from '../source/desktop';
import {recoveryActionHash,recoveryChallengeBytes} from '../../../../../services/aux-cloud/src/sync-recovery-crypto';
const base=new URL('../../aux-sync-recovery-daemon/',import.meta.url),evidence=JSON.parse(readFileSync(new URL('source-evidence.json',base),'utf8')),bridgeOriginal=readFileSync(new URL('source/bridge.js.txt',base),'utf8');
const uiPin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url),'utf8'));let bridge=bridgeOriginal;for(const edit of uiPin.daemon.edits.slice(2,4)){assert.equal(bridge.split(edit.find).length-1,1);bridge=bridge.replace(edit.find,edit.replace);}
const table=JSON.parse(readFileSync(new URL('../../aux-atomic-csk-publication/source-pins.json',import.meta.url),'utf8'));
const publisher=table.edits.find((x:any)=>x.name==='typed native CSK publisher replaces generic setter').replace.split('async function saveInstallationDerivedKeyBlob(')[0];
const user=randomUUID(),csk=Buffer.alloc(32,29),entropy=Buffer.alloc(16,47).toString('base64'),token=()=> 'header.'+Buffer.from(JSON.stringify({sg:generation})).toString('base64url')+'.fixture';let generation=0,owner=user;
let network=0,signs=0,publishes=0,backup:any=null,local:Buffer|null=Buffer.from(csk),loseEnrollment=true,unknownMaterial=false,race=false,changeAccountDuringMaterial=false,serverState='ready',loseRestore=false,restoreConflict=false,changeOnRestore=false;const challenges=new Map(),receipts=new Map(),enrollRequests:any[]=[];
const AuxApiError=new Function('return ('+evidence.errorClass+')')();
const binding={withAccountRegistryLock(){throw Error('Unexpected actual accounts lock invocation');},run(command:string,text:string){assert.equal(command,'csk-publish-absent-or-same');const p=JSON.parse(text);publishes++;assert.equal(p.accountId,7);if(p.owner!==owner||p.generation!==generation)return JSON.stringify({status:'conflict'});const key=Buffer.from(p.keyB64,'base64');if(local&&!local.equals(key))return JSON.stringify({status:'conflict'});if(local)return JSON.stringify({status:'same'});local=key;return JSON.stringify({status:'stored'});}};
const transport=async(url:string,options:any)=>{
 network++;assert.equal(new URL(url).origin,'https://dev-cloud.getaux.co');assert.equal(options.method,'POST');assert.equal(typeof options.body,'string');assert.equal(new Headers(options.headers).get('authorization'),'Bearer '+token());assert.equal(new Headers(options.headers).get('content-type'),'application/json');
 const body=JSON.parse(options.body),path=new URL(url).pathname;assert.ok(path.startsWith('/sync/recovery/v2/'));
 if(path.endsWith('/challenge')){const c={id:randomUUID(),userId:owner,sessionId:randomUUID(),fingerprint:'sha256:'+'a'.repeat(64),generation,operation:body.operation,requestHash:recoveryActionHash(body),nonce:Buffer.alloc(32).toString('base64url'),expiresAt:new Date(Date.now()+60000).toISOString()};challenges.set(c.id,{c,action:body});return Response.json({challenge:c,messageB64:recoveryChallengeBytes(c).toString('base64')});}
 const saved=challenges.get(body.challengeId);assert.ok(saved);assert.equal(body.signatureB64,Buffer.from('captured-signature').toString('base64'));assert.equal(recoveryActionHash(body.action),saved.c.requestHash);
 if(receipts.has(body.challengeId))return Response.json(receipts.get(body.challengeId));
 if(body.action.operation==='material'){
  if(unknownMaterial)return Response.json({error:{code:'OTHER_FAILURE',message:'Captured unavailable'}},{status:409});
  if(!backup)return Response.json({error:{code:'RECOVERY_NOT_CONFIGURED',message:'Captured missing recovery'}},{status:409});
  if(changeAccountDuringMaterial){changeAccountDuringMaterial=false;owner=randomUUID();generation=1;}return Response.json({recoveryBackup:backup,recoveryId:backup.recoveryId,recoveryRevision:backup.revision,syncGeneration:0});
 }
 if(body.action.operation==='enroll'){assert.equal(body.action.expectedRevision,backup?.revision??0);enrollRequests.push(body);backup=body.action.envelope;const response={state:'ready',syncGeneration:0,revision:1,recoveryId:backup.recoveryId,recoveryRevision:backup.revision};receipts.set(body.challengeId,response);if(loseEnrollment){loseEnrollment=false;throw Error('captured lost response');}return Response.json(response);}
 if(restoreConflict)return Response.json({error:{code:'RECOVERY_KEY_CONFLICT',message:'Captured key conflict'}},{status:409});
 assert.ok(Buffer.from(body.action.cskB64,'base64').equals(csk));assert.equal(body.action.recoveryId,backup.recoveryId);assert.equal(body.action.recoveryRevision,backup.revision);serverState='ready';
 const receipt={state:'ready',syncGeneration:0,revision:1,recoveryId:backup.recoveryId,recoveryRevision:backup.revision};receipts.set(body.challengeId,receipt);
 if(changeOnRestore){changeOnRestore=false;owner=randomUUID();generation=1;}
 if(loseRestore){loseRestore=false;throw Error('captured lost restore response');}return Response.json(receipt);
};
const names=['AuxSyncRecoveryClient','AuxApiError','Buffer','process','createHash','AccountRegistry','getValidAccessToken','logger','fetch','Headers','AbortSignal','AUX_API_BASE_URL','isTimeoutError','getErrorMessage$2','getErrorStatus','isRecord$9','assertAvailable','isNativeHelperBindingAvailable','runNativeHelperCommand','signNativeCdpChallenge','toBase64','fromBase64$1','evaluateLocalChromeSyncKey','readLocalChromeSyncKey','fetchAccountSyncKeyStatus','init_src$6','loadBinding','ACCESS_TOKEN_REFRESH_ERROR_CODES'];
const values=[AuxSyncRecoveryClient,AuxApiError,Buffer,{platform:'darwin'},createHash,{getSession:()=>({accessToken:token()}),getAccount:()=>({userId:owner})},async()=>token(),{warn(){}},transport,Headers,AbortSignal,'https://dev-cloud.getaux.co',()=>false,()=> 'Captured transport error',(e:any)=>e.response?.status,(v:any)=>v!==null&&typeof v==='object'&&!Array.isArray(v),()=>{},()=>true,(command:string,text:string)=>{assert.equal(command,'cdp-sign');const p=JSON.parse(text),bytes=Buffer.from(p.challenge,'base64');assert.ok([...challenges.values()].some((v:any)=>recoveryChallengeBytes(v.c).equals(bytes)));signs++;return {signature:Buffer.from('captured-signature').toString('base64')};},()=>{throw Error('No platform fallback');},(v:Uint8Array)=>Buffer.from(v).toString('base64'),(v:string)=>Buffer.from(v,'base64'),async()=>local?{status:'usable_owned',syncGeneration:generation}:{status:'missing'},async()=>local?Buffer.from(local):null,async()=>({state:serverState,syncGeneration:generation,revision:1,recoveryConfigured:!!backup,recoveryRevision:backup?.revision??0}),()=>{},()=>binding,new Set()];
const source=Object.values(evidence.extracted).join('\n')+'\n'+publisher+'\n'+bridge;
const api=new Function(...names,source+'\nreturn {enrollAccountSyncKeyRecovery,recoverAccountSyncKey,getAuxSyncRecoveryContext,auxSyncRecoveryPendingEnrollments};')(...values);
const expected=()=>({userId:owner,generation});
await assert.rejects(api.enrollAccountSyncKeyRecovery(7,entropy,expected()),/Captured transport error/);await api.enrollAccountSyncKeyRecovery(7,entropy,expected());assert.equal(enrollRequests.length,1);
// Existing head + same local key: restore server row before revision2 enrollment.
serverState='device_required';await api.enrollAccountSyncKeyRecovery(7,entropy,expected());assert.equal(serverState,'ready');assert.equal(backup.revision,2);assert.equal(enrollRequests.length,2);assert.equal(publishes,0);assert.ok(local?.equals(csk));
// Lost server restore response cannot cause a new key/overwrite. Retry observes
// ready authority and proceeds with the same local CSK/current head.
serverState='device_required';loseRestore=true;await assert.rejects(api.enrollAccountSyncKeyRecovery(7,entropy,expected()),/Captured transport error/);assert.equal(backup.revision,2);assert.equal(enrollRequests.length,2);await api.enrollAccountSyncKeyRecovery(7,entropy,expected());assert.equal(backup.revision,3);assert.equal(publishes,0);
// Current server-key conflict is refusal, not an ordinary-enroll fallback.
serverState='device_required';restoreConflict=true;await assert.rejects(api.enrollAccountSyncKeyRecovery(7,entropy,expected()),/Captured transport error/);assert.equal(backup.revision,3);assert.equal(enrollRequests.length,3);assert.equal(publishes,0);restoreConflict=false;
// A changed owner during restore prevents new backup enrollment or local write.
serverState='device_required';changeOnRestore=true;await assert.rejects(api.enrollAccountSyncKeyRecovery(7,entropy,expected()),/restoration changed/);assert.equal(backup.revision,3);assert.equal(enrollRequests.length,3);assert.equal(publishes,0);
console.log('Source-authentic preflight passed: existing head/same local CSK server restore, lost reply retry, conflict and context refusal; no local republish, no ordinary enroll, no native/network/DB.');
