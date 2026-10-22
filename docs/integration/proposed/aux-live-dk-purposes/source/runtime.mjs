// Inactive Aux-only live-purpose consumers; no legacy fallback or state IO.
import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {deriveAuxSubkey,encryptAuxBlob,decryptAuxBlob} from '../../../../../vendor/provided/aux-crypto-identity.mjs';
import {parseAuxIdentityJsonTokens} from '../../../../../vendor/provided/aux-identity-json-tokens.mjs';
export const AUX_EVIDENCE_FORMAT='aux.context-evidence.v2';
const account=x=>{if(!Number.isSafeInteger(x)||x<0)throw Error('Explicit evidence account required');return x;};
const cachePurpose=x=>{if(typeof x!=='string'||!/^skill-cache\.[A-Za-z0-9_-]{1,96}$/.test(x))throw Error('Unsupported cache purpose');return x;};
function cacheBytes(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length===0||bytes.length>2*1024*1024)throw Error('Bounded cache plaintext required');
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes),{value}=parseAuxIdentityJsonTokens(text);
 if(!Buffer.from(text).equals(Buffer.from(bytes))||value===null||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==3||!['cachedAt','expiresAt','value'].every(k=>Object.hasOwn(value,k))||!Number.isFinite(value.cachedAt)||!Number.isFinite(value.expiresAt))throw Error('Unsupported skill cache record');
}
export function encryptAuxSkillCache(root,purpose,bytes){cacheBytes(bytes);return encryptAuxBlob(root,cachePurpose(purpose),bytes);}
export function decryptAuxSkillCache(root,purpose,blob){const bytes=decryptAuxBlob(root,cachePurpose(purpose),blob);try{cacheBytes(bytes);return bytes;}catch(error){bytes.fill(0);throw error;}}
export function parseAuxSkillCacheBlob(text){if(typeof text!=='string'||Buffer.byteLength(text)>3*1024*1024)throw Error('Bounded cache envelope required');return parseAuxIdentityJsonTokens(text).value;}
export function deriveAuxDaemonTokenKey(root){return deriveAuxSubkey(root,'daemon.auth.token.v2');}
export function deriveAuxEvidenceKey(root,accountId){return deriveAuxSubkey(root,`context-awareness.evidence.${account(accountId)}`);}
export function encryptAuxEvidence(root,accountId,plaintext){
 if(!(plaintext instanceof Uint8Array)||plaintext.length>16*1024*1024-28)throw Error('Bounded evidence required');
 const key=deriveAuxEvidenceKey(root,accountId),nonce=randomBytes(12);
 try{const cipher=createCipheriv('aes-256-gcm',key,nonce);const body=Buffer.concat([cipher.update(plaintext),cipher.final()]);return Buffer.concat([nonce,cipher.getAuthTag(),body]);}finally{key.fill(0);}
}
export function decryptAuxEvidence(root,accountId,bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length<28||bytes.length>16*1024*1024)throw Error('Unsupported evidence container');
 const key=deriveAuxEvidenceKey(root,accountId),data=Buffer.from(bytes);
 try{const cipher=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));cipher.setAuthTag(data.subarray(12,28));return Buffer.concat([cipher.update(data.subarray(28)),cipher.final()]);}finally{key.fill(0);}
}
