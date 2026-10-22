// Inactive Aux-only live-purpose consumers; no legacy fallback or state IO.
import {createCipheriv,createDecipheriv,randomBytes,hkdfSync} from 'node:crypto';
import {deriveAuxSubkey} from '../../../../../vendor/provided/aux-crypto-identity.mjs';
export const AUX_EVIDENCE_FORMAT='aux.context-evidence.v2';
const account=x=>{if(!Number.isSafeInteger(x)||x<0)throw Error('Explicit evidence account required');return x;};
// The supplied caller sanitizes the path only. The cryptographic purpose keeps
// the actual skill name, including slash/dot/Unicode and arbitrary JSON values.
const cachePurpose=x=>{if(typeof x!=='string'||!x.startsWith('skill-cache.'))throw Error('Unsupported cache purpose');return x;};
function cacheKey(root,purpose){if(!(root instanceof Uint8Array)||root.length!==32)throw Error('Installation DK required');return Buffer.from(hkdfSync('sha256',root,Buffer.alloc(0),`aux.dk.${cachePurpose(purpose)}.v2`,32));}
export function encryptAuxSkillCache(root,purpose,bytes){
 if(!(bytes instanceof Uint8Array))throw Error('Cache bytes required');
 const key=cacheKey(root,purpose),nonce=randomBytes(12);
 try{const cipher=createCipheriv('chacha20-poly1305',key,nonce,{authTagLength:16});cipher.setAAD(Buffer.from(`aux.dk.${purpose}.v2`));return {format:'aux.dk.v2',purpose,nonce:nonce.toString('base64'),ciphertext:Buffer.concat([cipher.update(bytes),cipher.final(),cipher.getAuthTag()]).toString('base64')};}finally{key.fill(0);}
}
export function decryptAuxSkillCache(root,purpose,blob){
 if(blob===null||typeof blob!=='object'||Array.isArray(blob)||Object.keys(blob).length!==4||!['format','purpose','nonce','ciphertext'].every(k=>Object.hasOwn(blob,k)))throw Error('Unsupported cache envelope');
 if(blob.format!=='aux.dk.v2'||blob.purpose!==cachePurpose(purpose))throw Error('Cache format or purpose mismatch');
 const decode=x=>{if(typeof x!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(x))throw Error('Invalid cache encoding');const b=Buffer.from(x,'base64');if(b.toString('base64')!==x)throw Error('Invalid cache encoding');return b;};
 const nonce=decode(blob.nonce),encrypted=decode(blob.ciphertext);if(nonce.length!==12||encrypted.length<16)throw Error('Invalid cache cipher');
 const key=cacheKey(root,purpose);try{const cipher=createDecipheriv('chacha20-poly1305',key,nonce,{authTagLength:16});cipher.setAAD(Buffer.from(`aux.dk.${purpose}.v2`));cipher.setAuthTag(encrypted.subarray(-16));return Buffer.concat([cipher.update(encrypted.subarray(0,-16)),cipher.final()]);}finally{key.fill(0);}
}
export function parseAuxSkillCacheBlob(text){return JSON.parse(text);}
export function deriveAuxDaemonTokenKey(root){return deriveAuxSubkey(root,'daemon.auth.token.v2');}
export function deriveAuxEvidenceKey(root,accountId){return deriveAuxSubkey(root,`context-awareness.evidence.${account(accountId)}`);}
export function encryptAuxEvidence(root,accountId,plaintext){
 if(!(plaintext instanceof Uint8Array))throw Error('Bounded evidence required');
 const key=deriveAuxEvidenceKey(root,accountId),nonce=randomBytes(12);
 try{const cipher=createCipheriv('aes-256-gcm',key,nonce);const body=Buffer.concat([cipher.update(plaintext),cipher.final()]);return Buffer.concat([nonce,cipher.getAuthTag(),body]);}finally{key.fill(0);}
}
export function decryptAuxEvidence(root,accountId,bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length<28)throw Error('Unsupported evidence container');
 const key=deriveAuxEvidenceKey(root,accountId),data=Buffer.from(bytes);
 try{const cipher=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));cipher.setAuthTag(data.subarray(12,28));return Buffer.concat([cipher.update(data.subarray(28)),cipher.final()]);}finally{key.fill(0);}
}
