// Inactive Aux-only consumer. No legacy selector, decrypt fallback or state IO.
import {encryptAuxBlob,decryptAuxBlob} from '../../../../../vendor/provided/aux-crypto-identity.mjs';
import {parseAuxIdentityJsonTokens} from '../../../../../vendor/provided/aux-identity-json-tokens.mjs';
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>object(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const account=x=>Number.isSafeInteger(x)&&x>=0;
function envelope(x){
 if(!exact(x,['format','purpose','nonce','ciphertext'])||x.format!=='aux.dk.v2'||x.purpose!=='csk'||typeof x.nonce!=='string'||typeof x.ciphertext!=='string')throw Error('Unsupported Aux CSK envelope');
 return x;
}
export function parseAuxCskV2Record(raw){
 if(typeof raw!=='string'||Buffer.byteLength(raw)>16384)throw Error('Bounded Aux CSK record required');
 const {value}=parseAuxIdentityJsonTokens(raw);
 if(value?.format==='aux.dk.v2')return {encryptedBlob:envelope(value)};
 const keys=['schemaVersion','accountId','boundUserId','encryptedBlob'];
 if(value?.syncGeneration!==undefined)keys.push('syncGeneration');
 if(!exact(value,keys)||value.schemaVersion!==1||!account(value.accountId)||!(value.boundUserId===null||typeof value.boundUserId==='string'&&value.boundUserId.length>0)||value.syncGeneration!==undefined&&value.syncGeneration!==null&&!account(value.syncGeneration))throw Error('Unsupported Aux CSK owner record');
 return {encryptedBlob:envelope(value.encryptedBlob),owner:{accountId:value.accountId,boundUserId:value.boundUserId},syncGeneration:value.syncGeneration??null};
}
export function encryptAuxCskV2(rootKey,purpose,plaintext){if(purpose!=='csk'||!(plaintext instanceof Uint8Array)||plaintext.length!==32)throw Error('Invalid Aux CSK material');return encryptAuxBlob(rootKey,'csk',plaintext);}
export function decryptAuxCskV2(rootKey,purpose,record){
 if(purpose!=='csk')throw Error('Invalid Aux CSK purpose');
 const plaintext=decryptAuxBlob(rootKey,'csk',envelope(record));
 if(plaintext.length!==32){plaintext.fill(0);throw Error('Invalid Aux CSK material');}return plaintext;
}
