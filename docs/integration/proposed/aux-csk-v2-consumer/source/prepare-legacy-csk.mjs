// External importer only. Never load into the clean Aux runtime.
import {createHash,timingSafeEqual} from 'node:crypto';
import {readLegacyDkBlob} from '../../../../../vendor/provided/aux-crypto-identity-legacy.mjs';
import {parseAuxIdentityJsonTokens} from '../../../../../vendor/provided/aux-identity-json-tokens.mjs';
import {encryptAuxCskV2,decryptAuxCskV2,parseAuxCskV2Record} from './aux-csk-v2-runtime.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const account=x=>Number.isSafeInteger(x)&&x>=0;
export function prepareLegacyCskV2({bytes,expectedSha256,rootKey,expectedOwner}){
 if(!(bytes instanceof Uint8Array)||bytes.length===0||bytes.length>16384||hash(bytes)!==expectedSha256||!(rootKey instanceof Uint8Array)||rootKey.length!==32)throw Error('Pinned CSK snapshot and root required');
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(!Buffer.from(text).equals(Buffer.from(bytes)))throw Error('Noncanonical CSK UTF8');
 const {value,root}=parseAuxIdentityJsonTokens(text);
 let old,token;
 if(exact(value,['purpose','nonce','ciphertext'])){
  if(expectedOwner!==undefined)throw Error('Legacy ownerless CSK cannot satisfy expected owner');old=value;token=root;
 }else{
  const keys=['schemaVersion','accountId','boundUserId','encryptedBlob'];if(value?.syncGeneration!==undefined)keys.push('syncGeneration');
  if(!exact(value,keys)||value.schemaVersion!==1||!account(value.accountId)||!(value.boundUserId===null||typeof value.boundUserId==='string'&&value.boundUserId.length>0)||value.syncGeneration!==undefined&&value.syncGeneration!==null&&!account(value.syncGeneration))throw Error('Unsupported legacy CSK owner record');
  if(!exact(expectedOwner,['accountId','boundUserId'])||expectedOwner.accountId!==value.accountId||expectedOwner.boundUserId!==value.boundUserId)throw Error('Explicit matching CSK owner required');
  old=value.encryptedBlob;token=root.fields.get('encryptedBlob');
 }
 if(!exact(old,['purpose','nonce','ciphertext'])||old.purpose!=='csk')throw Error('Unsupported legacy CSK envelope');
 let plaintext,verified;
 try{
  plaintext=readLegacyDkBlob(rootKey,'csk',old);if(plaintext.length!==32)throw Error('Invalid legacy CSK length');
  const next=encryptAuxCskV2(rootKey,'csk',plaintext);verified=decryptAuxCskV2(rootKey,'csk',next);
  if(!timingSafeEqual(plaintext,verified))throw Error('CSK continuity failure');
  // Replace only the exact encryptedBlob token; owner fields, order, whitespace,
  // schemaVersion and syncGeneration remain byte-for-byte untouched.
  const start=Buffer.byteLength(text.slice(0,token.start)),end=Buffer.byteLength(text.slice(0,token.end));
  const prepared=Buffer.concat([Buffer.from(bytes).subarray(0,start),Buffer.from(JSON.stringify(next)),Buffer.from(bytes).subarray(end)]);
  if(prepared.length>16384)throw Error('Prepared CSK exceeds capture budget');
  parseAuxCskV2Record(prepared.toString());
  return {bytes:prepared,receipt:{format:'aux.csk-rewrap.prepared.v2',originalSha256:expectedSha256,preparedSha256:hash(prepared),bytes:prepared.length,sameCskVerified:true,operation:'authenticated-reseal'}};
 }finally{plaintext?.fill(0);verified?.fill(0);}
}
