/** Extracted actual ABI/transport + new bridge only; no daemon startup/native/network. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {AuxSyncRecoveryClient} from '../source/desktop';
import {recoveryActionHash,recoveryChallengeBytes} from '../../../../../services/aux-cloud/src/sync-recovery-crypto';
const base=new URL('../',import.meta.url),evidence=JSON.parse(readFileSync(new URL('source-evidence.json',base),'utf8')),bridge=readFileSync(new URL('source/bridge.js.txt',base),'utf8');
const table=JSON.parse(readFileSync(new URL('../../aux-atomic-csk-publication/source-pins.json',import.meta.url),'utf8'));
const publisher=table.edits.find((x:any)=>x.name==='typed native CSK publisher replaces generic setter').replace.split('async function saveInstallationDerivedKeyBlob(')[0];
const user=randomUUID(),csk=Buffer.alloc(32,29),entropy=Buffer.alloc(16,47).toString('base64'),token=()=> 'header.'+Buffer.from(JSON.stringify({sg:generation})).toString('base64url')+'.fixture';let generation=0,owner=user;
let network=0,signs=0,publishes=0,backup:any=null,local:Buffer|null=Buffer.from(csk),loseEnrollment=true,unknownMaterial=false,race=false,changeAccountDuringMaterial=false;const challenges=new Map(),receipts=new Map(),enrollRequests:any[]=[];
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
 if(body.action.operation==='enroll'){enrollRequests.push(body);backup=body.action.envelope;const response={state:'ready',syncGeneration:0,revision:1,recoveryId:backup.recoveryId,recoveryRevision:backup.revision};receipts.set(body.challengeId,response);if(loseEnrollment){loseEnrollment=false;throw Error('captured lost response');}return Response.json(response);}
 if(race){race=false;local=Buffer.alloc(32,77);}
 return Response.json({state:'ready',syncGeneration:0,revision:1,recoveryId:backup.recoveryId,recoveryRevision:backup.revision});
};
const names=['AuxSyncRecoveryClient','AuxApiError','Buffer','process','createHash','AccountRegistry','getValidAccessToken','logger','fetch','Headers','AbortSignal','AUX_API_BASE_URL','isTimeoutError','getErrorMessage$2','getErrorStatus','isRecord$9','assertAvailable','isNativeHelperBindingAvailable','runNativeHelperCommand','signNativeCdpChallenge','toBase64','fromBase64$1','evaluateLocalChromeSyncKey','readLocalChromeSyncKey','fetchAccountSyncKeyStatus','init_src$6','loadBinding','ACCESS_TOKEN_REFRESH_ERROR_CODES'];
const values=[AuxSyncRecoveryClient,AuxApiError,Buffer,{platform:'darwin'},createHash,{getSession:()=>({accessToken:token()}),getAccount:()=>({userId:owner})},async()=>token(),{warn(){}},transport,Headers,AbortSignal,'https://dev-cloud.getaux.co',()=>false,()=> 'Captured transport error',(e:any)=>e.response?.status,(v:any)=>v!==null&&typeof v==='object'&&!Array.isArray(v),()=>{},()=>true,(command:string,text:string)=>{assert.equal(command,'cdp-sign');const p=JSON.parse(text),bytes=Buffer.from(p.challenge,'base64');assert.ok([...challenges.values()].some((v:any)=>recoveryChallengeBytes(v.c).equals(bytes)));signs++;return {signature:Buffer.from('captured-signature').toString('base64')};},()=>{throw Error('No platform fallback');},(v:Uint8Array)=>Buffer.from(v).toString('base64'),(v:string)=>Buffer.from(v,'base64'),async()=>local?{status:'usable_owned',syncGeneration:generation}:{status:'missing'},async()=>local?Buffer.from(local):null,async()=>({state:'ready',syncGeneration:generation,revision:1}),()=>{},()=>binding,new Set()];
const source=Object.values(evidence.extracted).join('\n')+'\n'+publisher+'\n'+bridge;
const api=new Function(...names,source+'\nreturn {enrollAccountSyncKeyRecovery,recoverAccountSyncKey,getAuxSyncRecoveryContext,auxSyncRecoveryPendingEnrollments};')(...values);
await assert.rejects(api.enrollAccountSyncKeyRecovery(7), (e:any)=>e instanceof AuxApiError&&e.code==='SYNC_RECOVERY_CONFIRMATION_REQUIRED');assert.equal(network,0);assert.equal(signs,0);
await assert.rejects(api.enrollAccountSyncKeyRecovery(7,entropy),/Captured transport error/);const beforeRetry=network,first=enrollRequests[0];await api.enrollAccountSyncKeyRecovery(7,entropy);assert.equal(network,beforeRetry+1);assert.equal(enrollRequests.length,1);assert.equal(api.auxSyncRecoveryPendingEnrollments.size,0);assert.ok(first.cskProofB64);assert.ok(!JSON.stringify(first).includes(entropy));
local=null;await api.recoverAccountSyncKey(7,entropy);assert.ok(local&&Buffer.from(local).equals(csk));assert.equal(publishes,1);
local=null;race=true;await assert.rejects(api.recoverAccountSyncKey(7,entropy),/Atomic local Sync key publication refused/);assert.ok(local&&Buffer.from(local).equals(Buffer.alloc(32,77)));assert.equal(publishes,2);
unknownMaterial=true;await assert.rejects(api.enrollAccountSyncKeyRecovery(7,entropy),/Captured transport error/);assert.equal(enrollRequests.length,1);assert.equal(api.auxSyncRecoveryPendingEnrollments.size,1);
unknownMaterial=false;changeAccountDuringMaterial=true;await assert.rejects(api.enrollAccountSyncKeyRecovery(7,entropy),/Account changed during recovery/);assert.equal(enrollRequests.length,1);
assert.deepEqual(api.getAuxSyncRecoveryContext(7),{userId:owner,generation:1});
console.log('Extracted actual signer/JSON transport/native publisher ABI paired: no-entropy refusal, exact lost-response retry, local-key conflict, unknown material refusal. No daemon/native/network executed.');
