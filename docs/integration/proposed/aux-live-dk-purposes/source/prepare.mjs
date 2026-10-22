// External import only; the original-domain labels must never enter runtime assets.
import {createHash,hkdfSync,createDecipheriv,timingSafeEqual} from 'node:crypto';
import {readLegacyDkBlob} from '../../../../../vendor/provided/aux-crypto-identity-legacy.mjs';
import {parseAuxIdentityJsonTokens} from '../../../../../vendor/provided/aux-identity-json-tokens.mjs';
import {encryptAuxSkillCache,decryptAuxSkillCache,encryptAuxEvidence,decryptAuxEvidence,AUX_EVIDENCE_FORMAT} from './runtime.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
function snapshot(bytes,expectedSha256,rootKey,limit){if(!(bytes instanceof Uint8Array)||bytes.length===0||bytes.length>limit||hash(bytes)!==expectedSha256||!(rootKey instanceof Uint8Array)||rootKey.length!==32)throw Error('Explicit pinned snapshot and installation DK required');}
function receipt(family,old,next,expected){return {format:'aux.live-dk.prepared.v2',family,originalSha256:expected,preparedSha256:hash(next),originalBytes:old.length,preparedBytes:next.length,samePlaintextVerified:true,operation:'authenticated-reseal'};}
export function prepareLegacySkillCache({bytes,expectedSha256,rootKey,expectedPurpose}){
 snapshot(bytes,expectedSha256,rootKey,2*1024*1024);
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(!Buffer.from(text).equals(Buffer.from(bytes)))throw Error('Noncanonical cache UTF8');
 const {value}=parseAuxIdentityJsonTokens(text);let plaintext,verified;
 try{plaintext=readLegacyDkBlob(rootKey,expectedPurpose,value);const cacheText=new TextDecoder('utf-8',{fatal:true}).decode(plaintext),cache=parseAuxIdentityJsonTokens(cacheText).value;if(!Buffer.from(cacheText).equals(plaintext)||cache===null||typeof cache!=='object'||Array.isArray(cache)||Object.keys(cache).length!==3||!['cachedAt','expiresAt','value'].every(k=>Object.hasOwn(cache,k))||!Number.isFinite(cache.cachedAt)||!Number.isFinite(cache.expiresAt))throw Error('Unsupported captured skill cache record');const next=encryptAuxSkillCache(rootKey,expectedPurpose,plaintext);verified=decryptAuxSkillCache(rootKey,expectedPurpose,next);if(!timingSafeEqual(plaintext,verified))throw Error('Cache continuity failure');const prepared=Buffer.from(JSON.stringify(next,null,2));return {bytes:prepared,receipt:{...receipt('skill-cache',bytes,prepared,expectedSha256),purpose:expectedPurpose}};}finally{plaintext?.fill(0);verified?.fill(0);}
}
export function prepareLegacyEvidence({bytes,expectedSha256,rootKey,accountId,sourceFormat}){
 snapshot(bytes,expectedSha256,rootKey,16*1024*1024);
 if(sourceFormat!=='captured.evidence.v1'||!Number.isSafeInteger(accountId)||accountId<0||bytes.length<28)throw Error('Explicit original evidence variant/account required');
 const old=Buffer.from(bytes),key=Buffer.from(hkdfSync('sha256',rootKey,Buffer.alloc(0),`aside.dk.context-awareness.evidence.${accountId}.v1`,32));let plaintext,verified;
 try{const cipher=createDecipheriv('aes-256-gcm',key,old.subarray(0,12));cipher.setAuthTag(old.subarray(12,28));plaintext=Buffer.concat([cipher.update(old.subarray(28)),cipher.final()]);const prepared=encryptAuxEvidence(rootKey,accountId,plaintext);verified=decryptAuxEvidence(rootKey,accountId,prepared);if(!timingSafeEqual(plaintext,verified))throw Error('Evidence continuity failure');return {bytes:prepared,receipt:{...receipt('context-evidence',bytes,prepared,expectedSha256),containerFormat:AUX_EVIDENCE_FORMAT,accountId}};}finally{key.fill(0);plaintext?.fill(0);verified?.fill(0);}
}
export function prepareDaemonTokenRotation(){return {format:'aux.daemon-token-key.rotation.v2',operation:'invalidate-and-reacquire',oldTokenResigning:false,requires:'coordinated issuer/verifiers plus fresh existing challenge/session exchange'};}
