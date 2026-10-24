/** Static Aux memory distribution derivation, with original source provenance. */
import {readFileSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const planBytes=readFileSync(new URL('../../docs/integration/proposed/standard-profile-isolation/memory-runtime-v2-a1/source/stage-plan.json',import.meta.url));
const planSha256='3d9b1ab4e81596402de7cf159484ee214239914691e815a79fbb48e5758fc8ed';
if(hash(planBytes)!==planSha256)throw Error('Aux memory stage plan differs');
const plan=JSON.parse(planBytes);
if(plan.format!=='aux.memory-stage.derivation.v2'||plan.files.length!==31||!plan.modelsPreserved||plan.derivedCatalogSigned)
 throw Error('Exact unsigned Aux v2 memory plan required');

async function regular(root,relative){
 let current=root;
 for(const part of relative.split('/')){current=path.join(current,part);if((await fs.lstat(current)).isSymbolicLink())throw Error('Memory source traverses a link')}
 const stat=await fs.lstat(current);if(!stat.isFile())throw Error('Regular memory source required');
 return{stat,bytes:await fs.readFile(current)};
}

export async function describeAuxMemoryV2Stage({input,outputRoot}){
 if(input.sourceVersion!==plan.sourceVersion||input.files.length!==plan.files.length)throw Error('Original memory inventory differs');
 const originals=new Map(input.files.map(file=>[file.path,file]));
 for(const file of plan.files){
  const original=originals.get(file.sourcePath);if(!original||original.type!==file.type||original.mode!==file.mode)throw Error('Memory source mapping differs');
  originals.delete(file.sourcePath);
  const stat=await fs.lstat(path.join(input.inputRoot,file.sourcePath));
  if(stat.isSymbolicLink()||(stat.mode&0o777)!==file.mode||(file.type==='directory'?!stat.isDirectory():!stat.isFile()))throw Error('Memory source type/mode differs');
  if(file.type==='file'){
   if(original.sourceSha256!==file.sourceSha256)throw Error('Memory original hash differs');
   const source=await regular(input.inputRoot,file.sourcePath),derived=await regular(plan.distribution,file.path);
   if(hash(source.bytes)!==file.sourceSha256||hash(derived.bytes)!==file.outputSha256||(derived.stat.mode&0o777)!==file.mode)
    throw Error('Original or derived memory payload differs');
  }
 }
 if(originals.size)throw Error('Omitted original memory source records');
 return{sourceVersion:input.sourceVersion,inputRoot:input.inputRoot,outputRoot,files:structuredClone(plan.files),derivedMemory:{
  format:'aux.bundled-memory-stage.v2',planSha256,catalogSha256:plan.catalogSha256,seedManifestSha256:plan.seedManifestSha256,
  runtimeSha256:plan.runtimeSha256,modelsPreserved:true,originalSignatureVerifiedAtDerivation:true,derivedCatalogSigned:false,
  runtimeExecuted:false,runtimeAuthorityGranted:false}};
}

export async function stageAuxMemoryV2({input,outputRoot}){
 if(!path.isAbsolute(outputRoot))throw Error('Absolute fresh memory output required');
 const report=await describeAuxMemoryV2Stage({input,outputRoot});
 await fs.mkdir(outputRoot,{mode:0o700});
 for(const file of report.files){
  const target=path.join(outputRoot,file.path);
  if(file.type==='directory'){await fs.mkdir(target,{recursive:true,mode:file.mode});await fs.chmod(target,file.mode);continue}
  const source=await regular(plan.distribution,file.path);
  if(hash(source.bytes)!==file.outputSha256)throw Error('Derived memory changed during staging');
  await fs.writeFile(target,source.bytes,{flag:'wx',mode:file.mode});await fs.chmod(target,file.mode);
 }
 return report;
}

export async function verifyAuxMemoryV2Stage({input,outputRoot,report}){
 const expected=await describeAuxMemoryV2Stage({input,outputRoot});
 if(JSON.stringify(expected)!==JSON.stringify(report))throw Error('Memory derivation report differs');
 const pending=new Map(report.files.map(file=>[file.path,file]));let checkedFiles=0;
 async function walk(directory,relative=''){
  for(const name of await fs.readdir(directory)){
   const item=relative?relative+'/'+name:name,file=pending.get(item),absolute=path.join(directory,name);
   if(!file)throw Error('Unreported derived memory path');pending.delete(item);
   const stat=await fs.lstat(absolute);
   if(stat.isSymbolicLink()||(stat.mode&0o777)!==file.mode)throw Error('Derived memory type or mode differs');
   if(file.type==='directory'){if(!stat.isDirectory())throw Error('Derived memory directory differs');await walk(absolute,item)}
   else {if(!stat.isFile()||hash(await fs.readFile(absolute))!==file.outputSha256)throw Error('Derived memory file differs');checkedFiles++}
  }
 }
 await walk(outputRoot);if(pending.size)throw Error('Missing derived memory paths');return{checkedFiles};
}
