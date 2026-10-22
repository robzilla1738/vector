/** Offline transcript preparation only. No filesystem, credential or runtime access. */
import {createHash} from 'node:crypto';
import {parseAuxIdentityJsonTokens,replaceAuxIdentityJsonStringToken} from './aux-identity-json-tokens.mjs';
export const AUX_TRANSCRIPT_SOURCE_SHA256='5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5';
const sha=b=>createHash('sha256').update(b).digest('hex');
const decoder=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});
const MAX_BYTES=64*1024*1024,MAX_LINE=2*1024*1024,MAX_LINES=20000;
const replacements={provider:new Map([['aside','aux']]),api:new Map([['aside-provider','aux-provider'],['aside-images','aux-images']])};
async function stopped(capability,sourceSha256,phase){
 if(!capability||typeof capability.id!=='string'||capability.id.length<8||capability.disposable!==true||capability.exclusive!==true||typeof capability.assertStopped!=='function'||await capability.assertStopped({sourceSha256,phase})!==true)throw Error('Stopped exclusive disposable capability required');
}
export async function prepareAuxTranscriptProviderIdentity({bytes,expectedSha256,capability}={}){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength>MAX_BYTES)throw Error('Bounded transcript bytes required');
 const input=Buffer.from(bytes),sourceSha256=sha(input);
 try{
  if(sourceSha256!==expectedSha256)throw Error('Transcript source hash mismatch');
  if(input.length&&input.at(-1)!==10)throw Error('Incomplete transcript tail refused');
  await stopped(capability,sourceSha256,'transcript-before-prepare');
  const output=Buffer.from(input);let offset=0,lines=0,changedMessages=0;const counts={provider:0,api:0};
  while(offset<input.length){
   if(++lines>MAX_LINES)throw Error('Transcript line bound exceeded');
   const end=input.indexOf(10,offset),line=input.subarray(offset,end);
   if(line.length>MAX_LINE)throw Error('Transcript line bound exceeded');
   const text=decoder.decode(line);if(text.startsWith('\uFEFF'))throw Error('BOM refused');
   const {value:message,root}=parseAuxIdentityJsonTokens(text),tokens=root.fields;
   if(!message||Array.isArray(message)||typeof message!=='object'||typeof message.role!=='string')throw Error('Unknown transcript record');
   if(message.role==='assistant'){
    if(typeof message.provider!=='string'||typeof message.api!=='string'||typeof message.model!=='string'||!Array.isArray(message.content)||typeof message.timestamp!=='number'||!Number.isFinite(message.timestamp))throw Error('Unknown assistant metadata shape');
    const expected={...message};let changed=false;
    for(const field of ['provider','api']){
     const replacement=replacements[field].get(message[field]);if(!replacement)continue;
     const token=tokens.get(field);if(typeof token?.value!=='string')throw Error('Expected direct string token');
     replaceAuxIdentityJsonStringToken({text,output,token,replacement,offset});counts[field]++;changed=true;expected[field]=replacement;
    }
    if(changed){changedMessages++;if(JSON.stringify(JSON.parse(decoder.decode(output.subarray(offset,end))))!==JSON.stringify(expected))throw Error('Transcript preservation check failed');}
   }
   offset=end+1;
  }
  if(output.length!==input.length)throw Error('Transcript byte length changed');
  for(let i=0;i<input.length;i++)if((input[i]===10)!==(output[i]===10))throw Error('Transcript newline offsets changed');
  await stopped(capability,sourceSha256,'transcript-after-prepare');
  return {bytes:output,receipt:{format:'aux.transcript-provider-identity.v1',daemonSourceSha256:AUX_TRANSCRIPT_SOURCE_SHA256,sourceSha256,outputSha256:sha(output),byteLength:input.length,lines,changedMessages,changedFields:counts,byteOffsetsPreserved:true,lineReadSizesPreserved:true,preparedOnly:true,uncoveredReferences:['opaque queued/steering content','historical tool-call arguments including typed model overrides','SQLite assistant projections','startup fencing and transaction integration']}};
 }finally{input.fill(0)}
}
