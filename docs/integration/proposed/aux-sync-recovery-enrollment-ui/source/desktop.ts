// Inactive client; only existing Aux auth/native/CSK boundaries may supply these.
import {timingSafeEqual} from 'node:crypto';
import {sealSyncRecovery,openSyncRecovery,recoveryHash,recoveryEnrollmentProof,recoveryActionHash,recoveryChallengeBytes,recoveryEnvelopeSchema,type RecoveryAction,type RecoveryChallenge} from '../../../../../services/aux-cloud/src/sync-recovery-crypto';
export type RecoveryContext={userId:string;generation:number};
export type DesktopRecoveryBoundary={
 context(accountId:number):RecoveryContext;
 request(accountId:number,path:string,body:unknown):Promise<any>;
 sign(message:Uint8Array):Promise<Uint8Array>;
 readCsk(accountId:number):Promise<Uint8Array|null>;
 /** Must atomically publish ONLY if persisted owner/generation still match and
  * the current key is absent or byte-identical. A generic key setter is unsafe.
  * It must copy key before resolving; the client clears its owned bytes.
  */
 publishRecoveredCsk(accountId:number,key:Uint8Array,expected:RecoveryContext):Promise<'stored'|'same'|'conflict'|'unsupported'>;
 status(accountId:number):Promise<any>;
 isRecoveryNotConfigured(error:unknown):boolean;
};
function same(a:RecoveryContext,b:RecoveryContext){return a.userId===b.userId&&a.generation===b.generation;}
function entropy(text:string){const b=Buffer.from(text,'base64');if(b.length!==16||b.toString('base64')!==text)throw Error('Use the 12-word Aux browser recovery key.');return b;}
export class AuxSyncRecoveryClient {
 constructor(private readonly boundary:DesktopRecoveryBoundary){}
 private async signed(accountId:number,context:RecoveryContext,action:RecoveryAction,csk?:Uint8Array){
  if(!same(context,this.boundary.context(accountId)))throw Error('Account changed during recovery.');
  const challenge=await this.boundary.request(accountId,'/sync/recovery/v2/challenge',action),c=challenge.challenge as RecoveryChallenge;
  if(c.userId!==context.userId||c.generation!==context.generation||c.operation!==action.operation||c.requestHash!==recoveryActionHash(action)||c.expiresAt<=new Date().toISOString()||Buffer.from(challenge.messageB64,'base64').toString('base64')!==challenge.messageB64||!Buffer.from(challenge.messageB64,'base64').equals(recoveryChallengeBytes(c)))throw Error('Recovery challenge binding mismatch.');
  const message=recoveryChallengeBytes(c),signature=await this.boundary.sign(message);
  if(!same(context,this.boundary.context(accountId)))throw Error('Account changed during recovery.');
  return {challengeId:c.id,signatureB64:Buffer.from(signature).toString('base64'),action,...csk?{cskProofB64:recoveryEnrollmentProof(csk,message)}:{}};
 }
 /** Authenticated current head; only the exact typed not-configured response
  * permits first enrollment. Unknown errors never imply missing recovery state.
  */
 async prepareConfirmedEnrollment(accountId:number,recoveryEntropyB64:string){
  const secret=entropy(recoveryEntropyB64);secret.fill(0);
  const context={...this.boundary.context(accountId)};let revision=0,head:ReturnType<typeof recoveryEnvelopeSchema.parse>|undefined;
  try{
   const request=await this.signed(accountId,context,{operation:'material',generation:context.generation});
   const response=await this.boundary.request(accountId,'/sync/recovery/v2/submit',request),envelope=recoveryEnvelopeSchema.parse(response.recoveryBackup);
   if(envelope.userId!==context.userId||envelope.generation!==context.generation||response.syncGeneration!==context.generation||response.recoveryRevision!==envelope.revision||response.recoveryId!==envelope.recoveryId)throw Error('Recovery material binding mismatch.');
   revision=envelope.revision;head=envelope;
  }catch(error){if(!this.boundary.isRecoveryNotConfigured(error))throw error;}
  if(!same(context,this.boundary.context(accountId)))throw Error('Account changed during recovery.');
  if(head)await this.restoreOwnedServerKey(accountId,context,head);
  return this.prepareEnrollment(accountId,recoveryEntropyB64,revision,context);
 }
 /** Existing authenticated head + owned current local CSK can restore only
  * that same server authority before a replacement recovery backup is sealed.
  * No local key publication, ordinary enroll or new authority is performed.
  */
 private async restoreOwnedServerKey(accountId:number,context:RecoveryContext,head:ReturnType<typeof recoveryEnvelopeSchema.parse>){
  const before=await this.boundary.status(accountId);
  if(!same(context,this.boundary.context(accountId))||before.syncGeneration!==context.generation)throw Error('Account changed during recovery.');
  if(before.state==='ready')return;
  if(before.state!=='device_required')throw Error('Current Sync authority is unavailable.');
  let key:Buffer|undefined;
  try{
   const borrowed=await this.boundary.readCsk(accountId);key=borrowed?Buffer.from(borrowed):undefined;
   if(!key||key.length!==32||!same(context,this.boundary.context(accountId)))throw Error('Current owned browser Sync key is unavailable.');
   const action:RecoveryAction={operation:'recover',generation:context.generation,recoveryId:head.recoveryId,recoveryRevision:head.revision,cskB64:key.toString('base64')};
   const response=await this.boundary.request(accountId,'/sync/recovery/v2/submit',await this.signed(accountId,context,action));
   if(response.state!=='ready'||response.syncGeneration!==context.generation||response.recoveryId!==head.recoveryId||response.recoveryRevision!==head.revision||!same(context,this.boundary.context(accountId)))throw Error('Sync authority restoration changed; existing keys are preserved.');
   const after=await this.boundary.status(accountId);
   if(after.state!=='ready'||after.syncGeneration!==context.generation||!same(context,this.boundary.context(accountId)))throw Error('Current Sync authority could not be verified.');
  }finally{key?.fill(0);}
 }
 /** Called only by the existing saved/verified recovery-key confirmation flow.
  * No automatic key generation or background upload can lose an unseen secret.
  */
 async prepareEnrollment(accountId:number,recoveryEntropyB64:string,expectedRevision:number,expectedContext?:RecoveryContext){
  const context={...this.boundary.context(accountId)},secret=entropy(recoveryEntropyB64);let key:Buffer|undefined,verified:Buffer|undefined;
  try{
   if(expectedContext&&!same(expectedContext,context))throw Error('Account changed during recovery.');
   const borrowed=await this.boundary.readCsk(accountId);key=borrowed?Buffer.from(borrowed):undefined;
   if(!key||key.length!==32||!same(context,this.boundary.context(accountId)))throw Error('Current browser Sync key is unavailable.');
   const envelope=sealSyncRecovery(key,secret,{userId:context.userId,generation:context.generation,revision:expectedRevision+1});verified=openSyncRecovery(envelope,secret,context);
   if(!timingSafeEqual(Buffer.from(key),verified))throw Error('Recovery verification failed.');
   const action:RecoveryAction={operation:'enroll',generation:context.generation,expectedRevision,envelope},submission=await this.signed(accountId,context,action,key);
   // Caller can retry these exact non-secret bytes after a lost response. No
   // private CSK/recovery entropy is retained in the prepared request.
   return {accountId,context,submission};
  }finally{secret.fill(0);key?.fill(0);verified?.fill(0);}
 }
 async publishEnrollment(prepared:Awaited<ReturnType<AuxSyncRecoveryClient['prepareEnrollment']>>){
  if(!same(prepared.context,this.boundary.context(prepared.accountId)))throw Error('Account changed during recovery.');
  const response=await this.boundary.request(prepared.accountId,'/sync/recovery/v2/submit',prepared.submission);
  const a=prepared.submission.action;if(a.operation!=='enroll'||response.syncGeneration!==prepared.context.generation||response.recoveryId!==a.envelope.recoveryId||response.recoveryRevision!==a.envelope.revision||!same(prepared.context,this.boundary.context(prepared.accountId)))throw Error('Recovery enrollment changed; retain the saved key and verify status.');return response;
 }
 async recover(accountId:number,recoveryEntropyB64:string){
  const context={...this.boundary.context(accountId)},secret=entropy(recoveryEntropyB64);let key:Buffer|undefined,current:Buffer|undefined;
  try{
   const materialRequest=await this.signed(accountId,context,{operation:'material',generation:context.generation}),material=await this.boundary.request(accountId,'/sync/recovery/v2/submit',materialRequest);
   key=openSyncRecovery(material.recoveryBackup,secret,context);
   if(material.recoveryId!==material.recoveryBackup.recoveryId||material.recoveryRevision!==material.recoveryBackup.revision||!same(context,this.boundary.context(accountId)))throw Error('Account or recovery revision changed.');
   const borrowed=await this.boundary.readCsk(accountId);current=borrowed?Buffer.from(borrowed):undefined;
   if(current&&(current.length!==32||!timingSafeEqual(Buffer.from(current),key)))throw Error('A different local Sync key exists; preserve it for explicit recovery.');
   const action:RecoveryAction={operation:'recover',generation:context.generation,recoveryId:material.recoveryId,recoveryRevision:material.recoveryRevision,cskB64:key.toString('base64')},submission=await this.signed(accountId,context,action),response=await this.boundary.request(accountId,'/sync/recovery/v2/submit',submission);
   if(response.state!=='ready'||response.syncGeneration!==context.generation||response.recoveryId!==material.recoveryId||response.recoveryRevision!==material.recoveryRevision||!same(context,this.boundary.context(accountId)))throw Error('Recovery result changed; existing data is preserved.');
   const publication=await this.boundary.publishRecoveredCsk(accountId,key,context);
   if(publication!=='stored'&&publication!=='same')throw Error('Atomic local Sync key publication refused; preserve existing authority.');
   if(!same(context,this.boundary.context(accountId)))throw Error('Account changed while storing recovered Sync key.');return this.boundary.status(accountId);
  }finally{secret.fill(0);key?.fill(0);current?.fill(0);}
 }
}
