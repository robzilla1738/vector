/** Static source/binary audit only. Never loads an addon, reads state or invokes crypto. */
import {createHash} from 'node:crypto';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function textFileOffset(binary,address,length){
 if(binary.readUInt32LE(0)!==0xfeedfacf||binary.readUInt32LE(4)!==0x0100000c)throw Error('Expected pinned ARM64 Mach-O');
 const commands=binary.readUInt32LE(16);if(commands>1024)throw Error('Mach-O command bound exceeded');let offset=32;
 for(let index=0;index<commands;index++){
  const command=binary.readUInt32LE(offset),size=binary.readUInt32LE(offset+4);if(size<8||offset+size>binary.length)throw Error('Invalid Mach-O command');
  if(command===0x19){const name=binary.subarray(offset+8,offset+24).toString().replace(/\0.*$/s,'');const vm=Number(binary.readBigUInt64LE(offset+24)),file=Number(binary.readBigUInt64LE(offset+40)),fileSize=Number(binary.readBigUInt64LE(offset+48));if(name==='__TEXT'&&address>=vm&&address+length<=vm+fileSize)return file+address-vm;}
  offset+=size;
 }
 throw Error('Pinned native code range outside file-backed TEXT');
}
function branchTarget(binary,offset,address){const instruction=binary.readUInt32LE(offset);if((instruction>>>26)!==0b100101)throw Error('Expected ARM64 BL instruction');let displacement=instruction&0x03ffffff;if(displacement&0x02000000)displacement-=0x04000000;return address+displacement*4}
export function inspectAuxNativeCryptoBoundary({binaryBytes,daemonSourceBytes,manifest}={}){
 if(!(binaryBytes instanceof Uint8Array)||binaryBytes.length>32*1024*1024||!(daemonSourceBytes instanceof Uint8Array)||daemonSourceBytes.length>32*1024*1024)throw Error('Bounded explicit static source buffers required');
 const binary=Buffer.from(binaryBytes),source=Buffer.from(daemonSourceBytes);
 if(manifest?.sourceBinarySha256!=='bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb'||manifest?.daemonSourceSha256!=='5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5'||sha(binary)!==manifest.sourceBinarySha256||sha(source)!==manifest.daemonSourceSha256)throw Error('Native crypto source pin mismatch');
 const text=source.toString('utf8');for(const anchor of manifest.sourceAnchors){if(text.split(anchor.find).length-1!==anchor.count)throw Error('Native JS contract anchor drift')}
 for(const entry of manifest.entries){const range=entry.range,offset=textFileOffset(binary,range.unslidVirtualStart,range.bytes);if(offset!==range.fileOffset||sha(binary.subarray(offset,offset+range.bytes))!==range.sha256)throw Error('Native function code range drift')}
 for(const call of manifest.calls){const offset=textFileOffset(binary,call.at,4);if(branchTarget(binary,offset,call.at)!==call.target)throw Error('Native crypto call target drift')}
 return {format:'aux.native-crypto-boundary-audit.v1',sourceBinarySha256:sha(binary),daemonSourceSha256:sha(source),verifiedFunctionRanges:manifest.entries.length,verifiedCallTargets:manifest.calls.length,verifiedJsAnchors:manifest.sourceAnchors.length,execution:false,authorityAccess:false,migrationActivated:false,macRawEcdhCommandEstablished:false,existingNativeWrapContextCallerControlled:false,remaining:['source recovery of native per-scheme authority read/wrap/unwrap','versioned native envelope/context readers and additive transaction','same-authority disposable native acceptance','complete addon module/ABI/selector identity successor']};
}
