/** Atomic CSK, browser recovery and fixed macOS utility staging; state2 remains quarantined. */
import {readFileSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {adaptDaemonCodeWithAuxCrypto,adaptDaemonBinaryWithAuxCrypto,buildDaemonNodeDevelopmentWithAuxCrypto} from './aux-crypto-stage.mjs';
import {findMachOSeaSection,readSeaBlob,writeSeaBlob,injectMachOSeaBlob} from '../aside/lib/sea.mjs';
import {embedCloudSeaBlob} from './cloud-sea-embedding.mjs';
import {createMacUtilityLoader} from '../../docs/integration/proposed/aux-macos-utility-node/source/adapt.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from './aux-cold-entry-admission.mjs';
const root=new URL('../../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-macos-utility-integration/inputs.json',import.meta.url)));
export const MAC_UTILITY_GENERATOR='vendor/provided/aux-macos-utility-stage.mjs';
function check(record){const bytes=readFileSync(new URL(record.path,root));if(sha(bytes)!==record.sha256)throw Error('Aux utility staging dependency drift: '+record.path);return bytes;}
function project(text,kind,policy){
 const expected=pins.variants[policy]?.[kind];if(!expected||sha(text)!==expected.inputSha256||!text.startsWith(AUX_COLD_ENTRY_REFUSAL))throw Error('Unreviewed utility source projection');
 for(const dependency of pins.dependencies)check(dependency);
 const applied=[];for(const edit of pins.edits[kind]){if(text.split(edit.find).length-1!==edit.count)throw Error('Aux utility routing anchor drift');text=text.split(edit.find).join(edit.replace);applied.push({kind:'integration',name:edit.name??'Fixed macOS utility routing',...edit});}
 if(sha(text)!==expected.outputSha256||!text.startsWith(AUX_COLD_ENTRY_REFUSAL)||text.split(AUX_COLD_ENTRY_REFUSAL).length!==2)throw Error('Aux utility projection/quarantine differs');
 return {code:text,sha256:sha(text),applied};
}
export function adaptDaemonCodeWithMacUtilities(original,cloudOptions={},identityProfile='compatibility',stateIdentityVersion=1){
 const base=adaptDaemonCodeWithAuxCrypto(original,cloudOptions,identityProfile,stateIdentityVersion);if(stateIdentityVersion!==2)return base;
 const output=project(base.code,'sea',base.cloudPolicy?.mode??'local');return {...base,code:output.code,sha256:output.sha256,applied:[...base.applied,...output.applied]};
}
export function adaptDaemonBinaryWithMacUtilities(original,cloudOptions={},identityProfile='compatibility',stateIdentityVersion=1){
 if(stateIdentityVersion!==2)return adaptDaemonBinaryWithAuxCrypto(original,cloudOptions,identityProfile,stateIdentityVersion);
 if(sha(original)!==pins.originalBinarySha256)throw Error('Supplied daemon binary differs');
 const section=findMachOSeaSection(original),blob=readSeaBlob(original.subarray(section.offset,section.offset+section.size)),output=adaptDaemonCodeWithMacUtilities(blob.code,cloudOptions,identityProfile,stateIdentityVersion),sea=writeSeaBlob({...blob,code:output.code});
 const binary=output.cloudPolicy?embedCloudSeaBlob(original,sea):Buffer.from(original);if(!output.cloudPolicy)injectMachOSeaBlob(binary,sea);
 return {binary,codeSha256:output.sha256,applied:output.applied,...(output.cloudPolicy?{cloudPolicy:output.cloudPolicy,cloudAnchors:output.cloudAnchors}:{}),assets:blob.assets.map(([name,data])=>({name,bytes:data.length,sha256:sha(data)}))};
}
export function buildDaemonNodeDevelopmentWithMacUtilities(original,cloudOptions={},identityProfile='compatibility',stateIdentityVersion=1){
 const base=buildDaemonNodeDevelopmentWithAuxCrypto(original,cloudOptions,identityProfile,stateIdentityVersion);if(stateIdentityVersion!==2)return base;
 const index=base.files.find(f=>f.path.endsWith('/node-development/index.mjs'));if(!index)throw Error('Missing utility development entry');
 const projected=project(index.bytes.toString(),'node-development',base.manifest.cloudPolicy?.mode??'local');
 const files=base.files.map(f=>f===index?{...f,bytes:Buffer.from(projected.code),generatedBy:MAC_UTILITY_GENERATOR}:f);
 return {files,manifest:{...base.manifest,macOSUtilitiesEntry:{sourceSha256:sha(index.bytes),outputSha256:projected.sha256,activation:false},files:files.map(({path,bytes,mode})=>({path,bytes:bytes.length,mode,sha256:sha(bytes)}))}};
}
export function macUtilityResources(stateIdentityVersion=1){
 if(stateIdentityVersion!==2)return {files:[],manifest:undefined};
 const artifact=JSON.parse(check(pins.artifact));for(const dependency of artifact.inputs)check(dependency);
 const image=check(artifact.image),stat=lstatSync(new URL(artifact.image.path,root));
 if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1||(stat.mode&0o022)||image.length!==artifact.image.bytes||artifact.moduleLoaded!==false||artifact.productionOnly!==true)throw Error('Unreviewed utility production image');
 const loader=Buffer.from(createMacUtilityLoader({sha256:artifact.image.sha256,bytes:artifact.image.bytes})),prefix='apps/daemon/Aux Daemon.app/Contents/Resources/native/';
 const recovery=check(pins.recoveryArtifact),recoveryStat=lstatSync(new URL(pins.recoveryArtifact.path,root));for(const dependency of pins.recoveryArtifact.dependencies)check(dependency);
 if(!recoveryStat.isFile()||recoveryStat.isSymbolicLink()||recoveryStat.nlink!==1||(recoveryStat.mode&0o022)||recovery.length!==pins.recoveryArtifact.bytes)throw Error('Unreviewed fixed recovery asset');
 const recoveryFiles=['apps/daemon/Aux Daemon.app/Contents/Resources/aux-crypto/aux-sync-recovery.mjs','apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-crypto/aux-sync-recovery.mjs'].map(path=>({path,bytes:recovery,mode:0o644,generatedBy:MAC_UTILITY_GENERATOR}));
 const files=[{path:prefix+'aux-macos-utilities.node',bytes:image,mode:0o644,generatedBy:MAC_UTILITY_GENERATOR},{path:prefix+'aux-macos-utilities.cjs',bytes:loader,mode:0o644,generatedBy:MAC_UTILITY_GENERATOR}];
 return {files:[...files,...recoveryFiles],manifest:{syncRecovery:{format:'aux.sync-recovery.resources.v1',activation:false,files:recoveryFiles.map(({path,bytes,mode})=>({path,bytes:bytes.length,mode,sha256:sha(bytes)}))},format:'aux.macos.utilities.resources.v1',activation:false,protectedHostPolicy:'aux.development.host.policy.v4',files:files.map(({path,bytes,mode})=>({path,bytes:bytes.length,mode,sha256:sha(bytes)}))}};
}
