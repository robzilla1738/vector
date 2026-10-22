// One production-only source graph compilation. Never loads the emitted module.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url)),root=fileURLToPath(new URL('../../../../',import.meta.url));
const proposal=path.join(root,'docs/integration/proposed');
const frozen='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const temporary=await mkdtemp(path.join(tmpdir(),'aux-worker-pdf-consumer-compile-'));
function compile(){return new Promise((resolve,reject)=>{
 const child=spawn('/usr/bin/python3',[path.join(root,'scripts/native-build.py'),'sh',path.join(proposal,'aux-development-worker-host/build.sh'),proposal,path.join(frozen,'include/node'),temporary,'--compile-only'],{stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';
 child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 child.once('error',error=>{reject(error);});child.once('close',code=>{code===0?resolve({stdout,stderr}):reject(Error(stdout+'\n'+stderr+`\nCompiler exit ${code}`));});
});}
try{
 const log=await compile();
 const inventoryBytes=await readFile(path.join(temporary,'production-source-inputs.json')),inventory=JSON.parse(inventoryBytes);
 assert.equal(inventory.format,'aux.worker.production.compile.inputs.v1');assert(inventory.inputs.length);
 let swift=0,cpp=0;const seen=new Set();
 for(const unit of inventory.inputs){
  assert(/^aux-[a-z0-9-]+\/source\/[A-Za-z0-9_-]+\.(swift|cc)$/.test(unit.path));assert(!seen.has(unit.path));seen.add(unit.path);
  const bytes=await readFile(path.join(proposal,unit.path));assert.equal(digest(bytes),unit.sha256,'Source changed during compile: '+unit.path);
  assert(!bytes.includes(Buffer.from('NAPI_MODULE')),'No standalone initializer/custody bypass may be introduced');
  unit.path.endsWith('.swift')?swift++:cpp++;
 }
 for(const expected of ['aux-native-macos-utilities/source/AuxOSJobCustody.swift','aux-native-macos-utilities/source/AuxUtilityCompletion.swift','aux-native-macos-utilities/source/AuxMacOSUtilityCommandCore.swift','aux-native-macos-utilities/source/AuxAppKitUtilityBoundary.swift','aux-development-host/source/AuxSignedDevelopmentOwner.swift','aux-development-worker-host/source/AuxDevelopmentOwnerDrain.swift','aux-native-pdf-host-consumer/source/AuxLoadedPdfLifetime.cc'])assert(seen.has(expected),expected);
 const recipe=await readFile(path.join(temporary,'source-build.sh'));
 for(const option of ['-D AUX_MACOS_UTILITY_DISPATCH','-framework AppKit','-framework QuickLookThumbnailing','-framework ImageIO'])assert(recipe.toString().includes(option),option);
 const artifact=await readFile(path.join(temporary,'aux-runtime-owned.node'));
 const oldProductCount=artifact.toString('latin1').toLowerCase().split('aside').length-1;assert.equal(oldProductCount,0);assert.equal(swift,21);assert.equal(cpp,5);
 const receipt={format:'aux.worker.pdf.consumer.production.compile.receipt.v1',baseCommit:'1f2390ab7',mode:'--compile-only',productionSourceCompiled:true,swiftTranslationUnits:swift,cppTranslationUnits:cpp,actualTranslationUnits:swift+cpp,sourceInventorySHA256:digest(inventoryBytes),productionRecipeSHA256:digest(recipe),compiledOldProductLiteralCount:oldProductCount,artifactSHA256:digest(artifact),artifactRetained:false,productionArtifactLoaded:false,standaloneModuleInitializerPresent:false,fixtureCompiled:false,lifecycleChecksRun:0,historicalLifecycleEvidenceUpdated:false,signedPolicyProducerExecuted:false,actualSecurityCalls:0,actualAppKitActions:0,signingPerformed:false,state2Authorized:false,terminalExitCode:0,actualSourceInventory:inventory.inputs};
 await writeFile(path.join(here,'evidence/production-source-inputs.json'),inventoryBytes);
 await writeFile(path.join(here,'evidence/compile.log'),log.stdout+log.stderr);
 await writeFile(path.join(here,'evidence/compile-only.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(`PASS one production-only combined graph: ${swift} Swift + ${cpp} C++ units, old-product literals0; no emitted module/factory/Security/OS execution. SHA256 ${receipt.artifactSHA256}`);
}finally{await rm(temporary,{recursive:true,force:true});}
