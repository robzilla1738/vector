/** External captured-byte preparation only. No IO, native binding or credentials. */
import {createHash} from 'node:crypto';
import {parseAuxIdentityJsonTokens} from '../../../../../vendor/provided/aux-identity-json-tokens.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const account=x=>/^(0|[1-9][0-9]*)$/.test(x)&&Number.isSafeInteger(Number(x));
const exactOptional=(x,names)=>object(x)&&Object.keys(x).every(k=>names.includes(k));
function strings(x,names){return names.every(k=>x[k]===undefined||typeof x[k]==='string');}
function numeric(x,names){return names.every(k=>x[k]===undefined||typeof x[k]==='number'&&Number.isFinite(x[k]));}
export function classifyCredentialLogicalKey(key){
 if(typeof key!=='string'||Buffer.byteLength(key)>512)throw Error('Unsupported credential logical key');
 let m;
 if((m=/^aux\.csk_(.+)$/.exec(key))&&account(m[1]))return {family:'csk',accountId:Number(m[1])};
 if((m=/^mcp:index:(.+)$/.exec(key))&&account(m[1]))return {family:'mcp-index',accountId:Number(m[1])};
 if((m=/^mcp:([^:]+):([A-Za-z0-9_-]{1,32})$/.exec(key))&&account(m[1]))return {family:'mcp-oauth',accountId:Number(m[1]),server:m[2]};
 if((m=/^aux\.channel\.v1\.u([0-9]+)\.([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(slack|telegram|discord)\.(bot|app)$/.exec(key))&&account(m[1])&&(m[4]==='bot'||m[3]==='slack'))return {family:'channel',accountId:Number(m[1]),channelId:m[2],platform:m[3],kind:m[4]};
 throw Error('Unsupported credential logical key');
}
export function prepareCredentialPayloadCopy({logicalKey,bytes}){
 const descriptor=classifyCredentialLogicalKey(logicalKey);
 if(descriptor.family==='csk')throw Error('CSK requires authenticated legacy decrypt, explicit versioned Aux-v2 rewrap and coordinated Aux consumer; opaque copy refused');
 if(!(bytes instanceof Uint8Array)||bytes.byteLength===0||bytes.byteLength>16384)throw Error('Bounded credential bytes required');
 const output=Buffer.from(bytes),text=new TextDecoder('utf-8',{fatal:true}).decode(output);
 if(!Buffer.from(text).equals(output))throw Error('Noncanonical UTF-8 credential');
 if(descriptor.family!=='channel'){
  const {value}=parseAuxIdentityJsonTokens(text);
  if(descriptor.family==='mcp-index'){
   if(!Array.isArray(value)||!value.every(v=>typeof v==='string'&&v.length>=1&&v.length<=32))throw Error('Unsupported MCP index');
  }else{
   if(!exactOptional(value,['identity','clientInformation','tokens','codeVerifier','clientSecret'])||!strings(value,['identity','codeVerifier','clientSecret']))throw Error('Unsupported MCP OAuth record');
   if(value.clientInformation!==undefined){const x=value.clientInformation;if(!exactOptional(x,['client_id','client_secret','client_id_issued_at','client_secret_expires_at'])||typeof x.client_id!=='string'||!strings(x,['client_secret'])||!numeric(x,['client_id_issued_at','client_secret_expires_at']))throw Error('Unsupported MCP client information');}
   if(value.tokens!==undefined){const x=value.tokens;if(!exactOptional(x,['access_token','id_token','token_type','expires_in','scope','refresh_token'])||typeof x.access_token!=='string'||typeof x.token_type!=='string'||!strings(x,['id_token','scope','refresh_token'])||!numeric(x,['expires_in']))throw Error('Unsupported MCP token record');}
  }
 }
 // Preserve serialized values, formatting and opaque token content exactly.
 return {bytes:output,receipt:{format:'aux.credential.payload-copy.v1',family:descriptor.family,bytes:output.length,sha256:hash(output),operation:'unchanged-copy',cryptographicRewrap:false}};
}
