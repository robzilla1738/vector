/** Unmounted Aux-v2 browser-data recovery. Auth and installation proof are separate. */
import {randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {Hono} from 'hono';import {bodyLimit} from 'hono/body-limit';import {HTTPException} from 'hono/http-exception';import {z} from 'zod';
import {requireUser,rateLimit,type AuthVariables} from './auth';
import {SyncRecoveryStore,type RecoveryActor} from './sync-recovery-store';
import {recoveryActionSchema,recoveryActionHash,type RecoveryAction,recoveryEnvelopeSchema,recoveryHash,recoveryCanonical,recoveryChallengeBytes,recoveryCommitment,recoveryEnrollmentProof,sameRecoveryProof,verifyRecoveryInstallation,type RecoveryChallenge} from './sync-recovery-crypto';
import {recoveryServerKey,openRecoveryServerCsk,wrapRecoveryServerCsk} from './sync-recovery-server-key';
export {recoveryActionHash} from './sync-recovery-crypto';
export type {RecoveryAction} from './sync-recovery-crypto';
export const recoverySubmissionSchema=z.object({challengeId:z.string().uuid(),signatureB64:z.string().min(8).max(8192),action:recoveryActionSchema,cskProofB64:z.string().max(100).optional()}).strict();
export type RecoverySubmission=z.infer<typeof recoverySubmissionSchema>;
function denied(code:string):never{throw Error(code);}
export class SyncRecoveryService {
 constructor(private readonly store=new SyncRecoveryStore(),private readonly wrappingKey:()=>Buffer=recoveryServerKey){}
 async challenge(actor:RecoveryActor,input:unknown){
  const action=recoveryActionSchema.parse(input),state=await this.store.state(actor);if(!state||state.sync_generation!==action.generation)denied('RECOVERY_SESSION_REQUIRED');
  if(action.operation==='enroll'&&(action.envelope.userId!==actor.id||action.envelope.generation!==action.generation||action.envelope.revision!==action.expectedRevision+1))denied('RECOVERY_OWNER_MISMATCH');
  const c:RecoveryChallenge={id:randomUUID(),userId:actor.id,sessionId:actor.sessionId,fingerprint:state.device_fingerprint,generation:action.generation,operation:action.operation,requestHash:recoveryActionHash(action),nonce:randomBytes(32).toString('base64url'),expiresAt:new Date(Date.now()+60000).toISOString()};
  await this.store.create(c);return {challenge:c,messageB64:recoveryChallengeBytes(c).toString('base64')};
 }
 async submit(actor:RecoveryActor,input:unknown){
  const p=recoverySubmissionSchema.parse(input),state=await this.store.state(actor),row=await this.store.challenge(actor,p.challengeId);
  if(!state||!row||row.operation!==p.action.operation||row.generation!==p.action.generation||state.sync_generation!==row.generation||state.device_fingerprint!==row.fingerprint||new Date(row.expires_at).getTime()<=Date.now())denied('RECOVERY_CHALLENGE_INVALID');
  const c:RecoveryChallenge={id:row.id,userId:row.user_id,sessionId:row.session_id,fingerprint:row.fingerprint,generation:row.generation,operation:row.operation,requestHash:row.request_hash,nonce:row.nonce,expiresAt:new Date(row.expires_at).toISOString()},message=recoveryChallengeBytes(c),requestHash=recoveryActionHash(p.action);
  if(requestHash!==row.request_hash||!verifyRecoveryInstallation(state.device_public_key,state.device_fingerprint,message,p.signatureB64))denied('RECOVERY_SIGNATURE_INVALID');
  if(p.action.operation==='material')return this.store.apply(actor,c.id,requestHash);
  const key=this.wrappingKey();let csk:Buffer|undefined,current:Buffer|undefined;
  try{
   if(p.action.operation==='enroll'){
    if(state.key_generation!==state.sync_generation||!state.wrapped_key)denied('RECOVERY_SYNC_KEY_REQUIRED');
    csk=openRecoveryServerCsk(state.wrapped_key,actor.id,state.sync_generation,key);
    if(!p.cskProofB64||!sameRecoveryProof(p.cskProofB64,recoveryEnrollmentProof(csk,message)))denied('RECOVERY_SYNC_PROOF_INVALID');
    return this.store.apply(actor,c.id,requestHash,{expectedRevision:p.action.expectedRevision,envelope:p.action.envelope,commitment:recoveryCommitment(csk,p.action.envelope),keyRevision:state.key_revision,capturedKey:state.wrapped_key});
   }
   const head=await this.store.head(actor,state.sync_generation);
   if(!head||head.revision!==p.action.recoveryRevision||head.recovery_id!==p.action.recoveryId)denied('RECOVERY_STATE_CHANGED');
   const envelope=recoveryEnvelopeSchema.parse(head.envelope);csk=Buffer.from(p.action.cskB64,'base64');
   if(!sameRecoveryProof(recoveryCommitment(csk,envelope),head.csk_commitment))denied('RECOVERY_KEY_INVALID');
   if(state.wrapped_key){
    if(state.key_generation!==state.sync_generation)denied('RECOVERY_GENERATION_CONFLICT');
    current=openRecoveryServerCsk(state.wrapped_key,actor.id,state.sync_generation,key);
    if(!timingSafeEqual(current,csk))denied('RECOVERY_KEY_CONFLICT');
   }
   return this.store.apply(actor,c.id,requestHash,{expectedRevision:head.revision,commitment:head.csk_commitment,keyRevision:state.key_revision,capturedKey:state.wrapped_key,newWrappedKey:state.wrapped_key?undefined:wrapRecoveryServerCsk(csk,actor.id,state.sync_generation,key)});
  }finally{key.fill(0);csk?.fill(0);current?.fill(0);}
 }
}
export const syncRecoveryRoutes=new Hono<{Variables:AuthVariables}>();
syncRecoveryRoutes.use('*',bodyLimit({maxSize:16384,onError:c=>c.json({error:{code:'RECOVERY_INVALID_REQUEST',message:'Recovery request exceeds 16 KiB.'}},413)}));
syncRecoveryRoutes.use('*',requireUser);
syncRecoveryRoutes.use('*',async(c,next)=>{c.header('Cache-Control','no-store');if(c.get('user').sessionId.startsWith('clerk:'))throw new HTTPException(403,{message:'A bound Aux installation session is required.'});if(!await rateLimit('sync-recovery:'+c.get('user').id,30,60))throw new HTTPException(429,{message:'Wait before retrying recovery.'});await next();});
const service=new SyncRecoveryService();
syncRecoveryRoutes.post('/sync/recovery/v2/challenge',async c=>c.json(await service.challenge(c.get('user'),await c.req.json())));
syncRecoveryRoutes.post('/sync/recovery/v2/submit',async c=>c.json(await service.submit(c.get('user'),await c.req.json())));
syncRecoveryRoutes.onError((error,c)=>{if(error instanceof HTTPException)return c.json({error:{code:'RECOVERY_REQUEST_REJECTED',message:error.message}},error.status);if(error instanceof z.ZodError)return c.json({error:{code:'RECOVERY_INVALID_REQUEST',message:'Invalid recovery request.'}},400);const known=/^RECOVERY_[A-Z_]+$/.test(error.message)?error.message:'RECOVERY_UNAVAILABLE';return c.json({error:{code:known,message:'Recovery could not complete; existing browser data and keys are preserved.'}},known==='RECOVERY_UNAVAILABLE'?503:409);});
