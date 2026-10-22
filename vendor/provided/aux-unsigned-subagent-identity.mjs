/** Offline unsigned-only typed tool-argument preparation. No runtime alias/I/O. */
import {createHash} from 'node:crypto';
import {parseAuxIdentityJsonTokens,replaceAuxIdentityJsonStringToken} from './aux-identity-json-tokens.mjs';
import {AUX_TRANSCRIPT_SOURCE_SHA256} from './aux-transcript-provider-identity.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const decoder=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.hasOwn(value,key);
const allowedArguments=new Set(['action','description','subagent_profile','model_category','model','prompt','run_in_background','task_id','request_id','query','limit']);
const allowedBlock=new Set(['type','id','name','arguments','namespace']);
function validateCandidate(message,block){
 const args=block.arguments,model=args.model;
 if(message.role!=='assistant'||typeof message.provider!=='string'||typeof message.api!=='string'||typeof message.model!=='string'||!Number.isFinite(message.timestamp)||typeof block.id!=='string'||!block.id.length)throw Error('Unknown assistant/subagent identity shape');
 if(Object.keys(message).some(key=>/signature/i.test(key))||Object.keys(block).some(key=>!allowedBlock.has(key)))throw Error('Signed or unreviewed subagent block refused');
 if(args.action!=='spawn'||Object.keys(args).some(key=>!allowedArguments.has(key))||own(args,'model_category')||Object.keys(model).sort().join(',')!=='modelId,provider'||typeof model.modelId!=='string'||!model.modelId.trim()||typeof args.description!=='string'||!args.description.trim()||typeof args.prompt!=='string'||!args.prompt.trim())throw Error('Unknown or ambiguous subagent spawn override refused');
 for(const key of ['subagent_profile','task_id','request_id','query'])if(own(args,key)&&typeof args[key]!=='string')throw Error('Unknown subagent optional argument');
 if(own(args,'run_in_background')&&typeof args.run_in_background!=='boolean'||own(args,'limit')&&(!Number.isInteger(args.limit)||args.limit<1||args.limit>50)||own(block,'namespace')&&typeof block.namespace!=='string')throw Error('Unknown subagent optional argument');
}
async function stopped(capability,sourceSha256,phase){if(!capability||!/^[-A-Za-z0-9]{8,128}$/.test(capability.id)||capability.disposable!==true||capability.exclusive!==true||typeof capability.assertStopped!=='function'||await capability.assertStopped({sourceSha256,phase})!==true)throw Error('Stopped disposable unsigned-subagent capability required')}
export async function prepareUnsignedSubagentIdentity({bytes,expectedSha256,capability}={}){
 if(!(bytes instanceof Uint8Array)||bytes.length>64*1024*1024)throw Error('Bounded unsigned-subagent transcript required');
 const input=Buffer.from(bytes),sourceSha256=sha(input);try{
  if(sourceSha256!==expectedSha256)throw Error('Unsigned-subagent source hash mismatch');
  if(input.length&&input.at(-1)!==10)throw Error('Incomplete transcript tail refused');
  await stopped(capability,sourceSha256,'unsigned-subagent-before-prepare');
  const output=Buffer.from(input);let offset=0,lines=0,changedCalls=0;const spans=[];
  while(offset<input.length){
   if(++lines>20000)throw Error('Unsigned-subagent transcript line count bound exceeded');
   const end=input.indexOf(10,offset),line=input.subarray(offset,end);if(line.length>2*1024*1024)throw Error('Unsigned-subagent line byte bound exceeded');
   const text=decoder.decode(line);if(text.startsWith('\uFEFF'))throw Error('BOM refused');
   const {value:message,root}=parseAuxIdentityJsonTokens(text);if(!object(message)||typeof message.role!=='string')throw Error('Unknown transcript record');
   if(message.role==='assistant'){
    if(!Array.isArray(message.content))throw Error('Unknown assistant content');
    const expected=structuredClone(message);let changed=false;
    for(const [index,block] of message.content.entries()){
     if(!object(block)||block.type!=='toolCall'||block.name!=='subagent'||!object(block.arguments)||!object(block.arguments.model))continue;
     const provider=block.arguments.model.provider;if(typeof provider!=='string'||provider.trim()!=='aside')continue;
     validateCandidate(message,block);
     const token=root.fields?.get('content')?.items?.[index]?.fields?.get('arguments')?.fields?.get('model')?.fields?.get('provider');
     if(token?.value!==provider)throw Error('Subagent token/schema conflict');
     spans.push(replaceAuxIdentityJsonStringToken({text,output,token,replacement:'aux',offset}));expected.content[index].arguments.model.provider='aux';changed=true;changedCalls++;
    }
    if(changed&&JSON.stringify(JSON.parse(decoder.decode(output.subarray(offset,end))))!==JSON.stringify(expected))throw Error('Unrelated subagent payload changed');
   }
   offset=end+1;
  }
  // Prove only the specifically planned string-token byte ranges differ.
  let cursor=0;for(const span of spans){if(!input.subarray(cursor,span.start).equals(output.subarray(cursor,span.start)))throw Error('Unrelated transcript bytes changed');cursor=span.end}if(!input.subarray(cursor).equals(output.subarray(cursor)))throw Error('Unrelated transcript suffix changed');
  if(output.length!==input.length)throw Error('Transcript byte length changed');
  for(let i=0;i<input.length;i++)if((input[i]===10)!==(output[i]===10))throw Error('Transcript newline offsets changed');
  await stopped(capability,sourceSha256,'unsigned-subagent-after-prepare');
  return {bytes:output,receipt:{format:'aux.unsigned-subagent-identity.v1',daemonSourceSha256:AUX_TRANSCRIPT_SOURCE_SHA256,sourceSha256,outputSha256:sha(output),lines,changedCalls,byteOffsetsPreserved:true,preparedOnly:true,signedMatchingPolicy:'refuse-entire-cohort',uncoveredReferences:['signed historical arguments','unknown model shapes outside exact typed selector','subagent tracking cache','startup/write fence']}};
 }finally{input.fill(0)}
}
