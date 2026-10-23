// Review producer only: materialize fixed assets and pin source projections; never execute application entries.
import {readFileSync,writeFileSync,mkdirSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {adaptDaemonCodeWithAuxCrypto,buildDaemonNodeDevelopmentWithAuxCrypto} from '../../../../vendor/provided/aux-crypto-stage.mjs';
import {adaptAtomicCskSource} from '../aux-atomic-csk-publication/source/adapt.mjs';
import {adaptAuxSyncRecoveryDaemon} from '../aux-sync-recovery-daemon/source/adapt.mjs';
import {materializeSyncRecoveryDesktop} from '../aux-sync-recovery-daemon/source/materialize-desktop.mjs';
import {adaptMacUtilityRouting} from '../aux-macos-utility-node/source/adapt.mjs';
import {findMachOSeaSection,readSeaBlob} from '../../../../vendor/aside/lib/sea.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../vendor/provided/aux-cold-entry-admission.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex'),binary=readFileSync('out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon'),section=findMachOSeaSection(binary),blob=readSeaBlob(binary.subarray(section.offset,section.offset+section.size));
const variants={},edits={},preloads={};
const atomic=JSON.parse(readFileSync(new URL('../aux-atomic-csk-publication/source-pins.json',import.meta.url)));
const recoveryPath='docs/integration/proposed/aux-sync-recovery-daemon/source-pins.json',recovery=JSON.parse(readFileSync(recoveryPath));
function apply(text,changes){for(const edit of changes){if(text.split(edit.find).length-1!==edit.count)throw Error('Combined source anchor differs: '+edit.name);text=text.split(edit.find).join(edit.replace);}return text;}
for(const [policy,options]of [['development',{enableCloud:true,profile:'development'}],['local',{}]]){
 const sea=adaptDaemonCodeWithAuxCrypto(blob.code,options,'aux-v1',2).code,node=buildDaemonNodeDevelopmentWithAuxCrypto(binary,options,'aux-v1',2).files.find(f=>f.path.endsWith('/index.mjs')).bytes.toString();variants[policy]={};
 for(const [mode,kind,source]of [['sea','sea',sea],['node-development','node',node]]){
  if(policy==='development'){
   const cas=adaptAtomicCskSource(source,{expectedInputSha256:sha(source)}).code;
   const recoveryOutput=adaptAuxSyncRecoveryDaemon(cas,{kind}).code;
   const recoveryEdits=[...recovery.edits,{...recovery.preloads[kind],name:'Aux recovery preload after quarantine',count:1}];
   if(apply(cas,recoveryEdits)!==recoveryOutput)throw Error('Recovery projection differs');
   const os=adaptMacUtilityRouting(source,{kind});edits[mode]=[...atomic.edits,...recoveryEdits,...os.anchors];
  }
  const output=apply(source,edits[mode]);
  const end=mode==='node-development'?output.indexOf('const { daemonResources: __auxDaemonResources,'):output.indexOf('\n',output.indexOf('const {AuxSyncRecoveryClient}'))+1;
  const preload=output.slice(AUX_COLD_ENTRY_REFUSAL.length,end);if(end<AUX_COLD_ENTRY_REFUSAL.length||!preload.includes('const {AuxSyncRecoveryClient}'))throw Error('Recovery preload prefix missing');
  if(preloads[mode]&&preloads[mode]!==preload)throw Error('Policy-dependent preloads unsupported');preloads[mode]=preload;
  variants[policy][mode]={inputSha256:sha(source),outputSha256:sha(output)};
 }
}
const asset=await materializeSyncRecoveryDesktop();mkdirSync('out/aux-sync-recovery-daemon',{recursive:true});
const assetPath='out/aux-sync-recovery-daemon/aux-sync-recovery.mjs';try{const st=lstatSync(assetPath);if(!st.isFile()||st.isSymbolicLink()||st.nlink!==1||(st.mode&0o022)||sha(readFileSync(assetPath))!==asset.sha256)throw Error('Existing recovery artifact differs; preserve it and review a successor');}catch(error){if(error.code!=='ENOENT')throw error;writeFileSync(assetPath,asset.bytes,{mode:0o644,flag:'wx'});}
const recoveryDependencies=recovery.bundle.dependencies.map(({id,sha256})=>({path:id.startsWith('workspace/')?id.slice('workspace/'.length):'services/aux-cloud/node_modules/'+id,sha256}));
for(const dep of recoveryDependencies)if(sha(readFileSync(dep.path))!==dep.sha256)throw Error('Recovery dependency path differs');
const dependencyPaths=['docs/integration/proposed/aux-sync-recovery-daemon/source/adapt.mjs','docs/integration/proposed/aux-sync-recovery-daemon/source/materialize-desktop.mjs',recoveryPath,'docs/integration/proposed/aux-atomic-csk-publication/source/adapt.mjs','docs/integration/proposed/aux-atomic-csk-publication/source-pins.json','vendor/provided/aux-crypto-stage.mjs','docs/integration/proposed/aux-crypto-stage-integration/inputs.json','docs/integration/proposed/aux-macos-utility-node/source/adapt.mjs','docs/integration/proposed/aux-macos-utility-node/source-pins.json'];
const artifactPath='docs/integration/proposed/aux-macos-utility-integration/artifact.json';
const pins={format:'aux.macos.utility.stage.inputs.v1',originalBinarySha256:sha(binary),artifact:{path:artifactPath,sha256:sha(readFileSync(artifactPath))},recoveryArtifact:{path:assetPath,sha256:asset.sha256,bytes:asset.bytes.length,dependencies:recoveryDependencies},dependencies:dependencyPaths.map(path=>({path,sha256:sha(readFileSync(path))})),variants,preloads,edits};
writeFileSync(new URL('./inputs.json',import.meta.url),JSON.stringify(pins,null,2)+'\n');console.log('Pinned atomic-CSK, recovery and OS routes for local/development SEA+Node; materialized one fixed recovery asset; no application executed.');
