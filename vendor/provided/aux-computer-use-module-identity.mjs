/** Replay the reviewed Mach-O/Swift metadata plan; never execute or sign. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const planBytes=readFileSync(new URL('../../docs/integration/proposed/standard-profile-isolation/computer-use-module-identity-a1/source/patch-plan.json',import.meta.url));
const planSha256='578a7c8313b2d986a00dc1dcab582e8ba805625aac27aa924cfc3b5eb4a5fda6';
if(hash(planBytes)!==planSha256)throw Error('Computer Use private-module plan differs');
const plan=JSON.parse(planBytes);
if(plan.format!=='aux.computer-use-module.patch-plan.v1'||plan.namespace!=='AuxilComputerUse'
  ||plan.namespaceOccurrenceCount!==2027||plan.patches.length!==2031
  ||!plan.instructionBytesUnchanged||!plan.dynamicExportsUnchanged||!plan.swiftDemanglePureModuleEquivalence)
  throw Error('Exact reviewed Computer Use metadata plan required');

export function applyAuxComputerUseModuleIdentity(input){
  if(!Buffer.isBuffer(input)||input.length!==plan.inputBytes||hash(input)!==plan.inputSha256)
    throw Error('Exact already-branded Computer Use input required');
  const tail=plan.truncatedSignature;
  if(tail.offset!==plan.outputBytes||tail.offset+tail.bytes!==input.length||hash(input.subarray(tail.offset))!==tail.sha256)
    throw Error('Original Computer Use signature tail differs');
  const output=Buffer.from(input.subarray(0,plan.outputBytes));
  for(const patch of plan.patches){
    const before=Buffer.from(patch.beforeHex,'hex'),after=Buffer.from(patch.afterHex,'hex');
    if(patch.count!==1||before.length!==after.length||patch.offset<0||patch.offset+before.length>output.length
      ||!output.subarray(patch.offset,patch.offset+before.length).equals(before))
      throw Error('Computer Use metadata anchor differs');
    after.copy(output,patch.offset);
  }
  if(hash(output)!==plan.outputSha256||output.includes(Buffer.from('Aside')))
    throw Error('Computer Use metadata replay differs');
  return{bytes:output,report:{format:'aux.computer-use-module.identity.v1',inputSha256:plan.inputSha256,
    outputSha256:plan.outputSha256,planSha256,namespace:plan.namespace,namespaceOccurrences:2027,
    metadataPatches:2031,outputBytes:output.length,originalSignatureRemoved:true,
    instructionBytesUnchanged:true,dynamicExportsUnchanged:true,swiftDemanglePureModuleEquivalence:true,
    productExecuted:false,signed:false,runtimeAcceptance:false}};
}
