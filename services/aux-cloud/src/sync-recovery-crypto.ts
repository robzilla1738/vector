/** Aux browser-data recovery only. No passwords, Vault, legacy formats or IO. */
import {createCipheriv,createDecipheriv,createHash,createHmac,hkdfSync,randomBytes,randomUUID,createPublicKey,verify,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
const b64=(n:number)=>z.string().refine(x=>Buffer.from(x,'base64').length===n&&Buffer.from(x,'base64').toString('base64')===x);
export const recoveryEnvelopeSchema=z.object({format:z.literal('aux.sync-recovery.v2'),alg:z.literal('chacha20-poly1305'),kdf:z.literal('hkdf-sha256'),userId:z.string().uuid(),generation:z.number().int().nonnegative(),recoveryId:z.string().uuid(),revision:z.number().int().positive(),saltB64:b64(32),nonceB64:b64(12),ciphertextB64:b64(48)}).strict();
export type RecoveryEnvelope=z.infer<typeof recoveryEnvelopeSchema>;
export const recoveryHash=(value:Uint8Array|string)=>createHash('sha256').update(value).digest('hex');
export function recoveryCanonical(value:unknown){return Buffer.from(JSON.stringify(value));}
const binding=(e:RecoveryEnvelope)=>recoveryCanonical(['aux.sync-recovery.v2',e.userId,e.generation,e.recoveryId,e.revision]);
export function newRecoverySecret(){return randomBytes(16); }
export function sealSyncRecovery(csk:Uint8Array,secret:Uint8Array,owner:{userId:string;generation:number;revision:number;recoveryId?:string}):RecoveryEnvelope{
 if(csk.length!==32||secret.length!==16)throw Error('Recovery requires 32-byte Sync key and 12-word entropy');
 const salt=randomBytes(32),nonce=randomBytes(12),e=recoveryEnvelopeSchema.parse({format:'aux.sync-recovery.v2',alg:'chacha20-poly1305',kdf:'hkdf-sha256',...owner,recoveryId:owner.recoveryId??randomUUID(),saltB64:salt.toString('base64'),nonceB64:nonce.toString('base64'),ciphertextB64:Buffer.alloc(48).toString('base64')});
 const key=Buffer.from(hkdfSync('sha256',secret,salt,'aux.sync-recovery.csk.v2',32));
 try{const c=createCipheriv('chacha20-poly1305',key,nonce,{authTagLength:16});c.setAAD(binding(e));e.ciphertextB64=Buffer.concat([c.update(csk),c.final(),c.getAuthTag()]).toString('base64');return e;}finally{key.fill(0);}
}
export function openSyncRecovery(value:unknown,secret:Uint8Array,owner:{userId:string;generation:number}){
 const e=recoveryEnvelopeSchema.parse(value);if(secret.length!==16||e.userId!==owner.userId||e.generation!==owner.generation)throw Error('Recovery owner or generation mismatch');
 const key=Buffer.from(hkdfSync('sha256',secret,Buffer.from(e.saltB64,'base64'),'aux.sync-recovery.csk.v2',32)),bytes=Buffer.from(e.ciphertextB64,'base64');
 try{const c=createDecipheriv('chacha20-poly1305',key,Buffer.from(e.nonceB64,'base64'),{authTagLength:16});c.setAAD(binding(e));c.setAuthTag(bytes.subarray(-16));return Buffer.concat([c.update(bytes.subarray(0,-16)),c.final()]);}finally{key.fill(0);}
}
export function recoveryCommitment(csk:Uint8Array,e:RecoveryEnvelope){if(csk.length!==32)throw Error('Invalid Sync key');return createHmac('sha256',csk).update(recoveryCanonical(['aux.sync-recovery.commitment.v2',e.userId,e.generation,e.recoveryId,e.revision])).digest('hex');}
export function recoveryEnrollmentProof(csk:Uint8Array,message:Uint8Array){return createHmac('sha256',csk).update('aux.sync-recovery.enroll-proof.v2\0').update(message).digest('base64');}
export function sameRecoveryProof(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export const recoveryChallengeSchema=z.object({id:z.string().uuid(),userId:z.string().uuid(),sessionId:z.string().uuid(),fingerprint:z.string().regex(/^sha256:[a-f0-9]{64}$/),generation:z.number().int().nonnegative(),operation:z.enum(['enroll','material','recover']),requestHash:z.string().regex(/^[a-f0-9]{64}$/),nonce:z.string().regex(/^[A-Za-z0-9_-]{43}$/),expiresAt:z.string().datetime()}).strict();
export type RecoveryChallenge=z.infer<typeof recoveryChallengeSchema>;
export function recoveryChallengeBytes(value:RecoveryChallenge){const c=recoveryChallengeSchema.parse(value);return recoveryCanonical(['aux.sync-recovery.challenge.v2',c.id,c.userId,c.sessionId,c.fingerprint,c.operation,c.generation,c.requestHash,c.nonce,c.expiresAt]);}
/** Same native formats as cdp-sign: SHA256/DER P256; raw ML-DSA-65. */
export function verifyRecoveryInstallation(jwk:Record<string,unknown>,fingerprint:string,message:Uint8Array,signatureB64:string){
 try{
  if(Object.hasOwn(jwk,'d'))return false;
  const signature=Buffer.from(signatureB64,'base64');if(signature.toString('base64')!==signatureB64)return false;
  if(jwk.kty==='EC'&&jwk.crv==='P-256'&&typeof jwk.x==='string'&&typeof jwk.y==='string'){
   const x=Buffer.from(jwk.x,'base64url'),y=Buffer.from(jwk.y,'base64url');if(x.length!==32||y.length!==32||fingerprint!=='sha256:'+recoveryHash(Buffer.concat([Buffer.from([4]),x,y])))return false;
   return verify('sha256',message,createPublicKey({key:jwk as JsonWebKey,format:'jwk'}),signature);
  }
  if(jwk.kty==='RAW'&&jwk.alg==='ML-DSA-65'&&typeof jwk.public_key_b64==='string'){
   const raw=Buffer.from(jwk.public_key_b64,'base64');if(raw.length!==1952||raw.toString('base64')!==jwk.public_key_b64||fingerprint!=='sha256:'+recoveryHash(raw))return false;
   const key=createPublicKey({key:Buffer.concat([Buffer.from('308207b2300b0609608648016503040312038207a100','hex'),raw]),format:'der',type:'spki'});return verify(null,message,key,signature);
  }
 }catch{/* Unsupported backend/PQ or malformed key fails closed. */}return false;
}

const generation=z.number().int().nonnegative(),revision=z.number().int().nonnegative(),keyB64=z.string().refine(x=>Buffer.from(x,'base64').length===32&&Buffer.from(x,'base64').toString('base64')===x);
export const recoveryActionSchema=z.discriminatedUnion('operation',[
 z.object({operation:z.literal('enroll'),generation,expectedRevision:revision,envelope:recoveryEnvelopeSchema}).strict(),
 z.object({operation:z.literal('material'),generation}).strict(),
 z.object({operation:z.literal('recover'),generation,recoveryId:z.string().uuid(),recoveryRevision:z.number().int().positive(),cskB64:keyB64}).strict()
]);
export type RecoveryAction=z.infer<typeof recoveryActionSchema>;
export function recoveryActionHash(action:RecoveryAction){const a=recoveryActionSchema.parse(action);return recoveryHash(recoveryCanonical(a.operation==='enroll'?['aux.sync-recovery.request.v2',a.operation,a.generation,a.expectedRevision,a.envelope]:a.operation==='material'?['aux.sync-recovery.request.v2',a.operation,a.generation]:['aux.sync-recovery.request.v2',a.operation,a.generation,a.recoveryId,a.recoveryRevision,recoveryHash(Buffer.from(a.cskB64,'base64'))]));}
