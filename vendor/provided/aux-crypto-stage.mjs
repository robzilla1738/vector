/** Quarantined macOS crypto-source integration. Never grants startup admission. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {adaptDaemonCode,adaptDaemonBinary,DAEMON_BINARY_SHA256} from './daemon-adapter.mjs';
import {buildDaemonNodeDevelopment} from './daemon-node-development.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from './aux-cold-entry-admission.mjs';
import {embedCloudSeaBlob} from './cloud-sea-embedding.mjs';
import {findMachOSeaSection,readSeaBlob,writeSeaBlob,injectMachOSeaBlob} from '../aside/lib/sea.mjs';
import {materializeAuxCryptoRuntimeAssets} from '../../docs/integration/proposed/aux-crypto-runtime-assets/source/materialize.mjs';
const root=new URL('../../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/aux-crypto-stage-integration/inputs.json',import.meta.url)));
export const AUX_CRYPTO_GENERATOR='vendor/provided/aux-crypto-stage.mjs';
export const LEGACY_NODE_GENERATOR='vendor/provided/daemon-node-development.mjs';
function readPinned(record){const bytes=readFileSync(new URL(record.path,root));if(sha(bytes)!==record.sha256)throw Error('Aux crypto staging dependency drift: '+record.path);return bytes;}
function compose(mode,original,entry,policy){
 const expected=pins.variants[policy]?.[mode];
 if(!expected||sha(original)!==pins.originalSha256||sha(entry)!==expected.inputSha256)throw Error('Unreviewed Aux crypto source generation');
 if(!entry.startsWith(AUX_COLD_ENTRY_REFUSAL)||entry.split(AUX_COLD_ENTRY_REFUSAL).length!==2)throw Error('Aux crypto requires the first unconditional startup refusal');
 for(const dependency of pins.dependencies)readPinned(dependency);
 let code=entry;const applied=[];
 for(const record of pins.editTables){const table=JSON.parse(readPinned(record));for(const edit of table.edits){const count=edit.count??1;if(code.split(edit.find).length-1!==count)throw Error('Aux crypto exact source anchor drift');code=code.split(edit.find).join(edit.replace);applied.push({kind:'identity',name:'Aux crypto '+(edit.name??sha(edit.find).slice(0,16)),count});}}
 code=AUX_COLD_ENTRY_REFUSAL+pins.preloads[mode]+code.slice(AUX_COLD_ENTRY_REFUSAL.length);
 if(sha(code)!==expected.outputSha256)throw Error('Aux crypto source projection differs');
 return {code,applied,sha256:sha(code)};
}
export function adaptDaemonCodeWithAuxCrypto(original,cloudOptions={},identityProfile='compatibility',stateIdentityVersion=1){
 const adapted=adaptDaemonCode(original,cloudOptions,identityProfile,stateIdentityVersion);
 if(stateIdentityVersion!==2)return adapted;
 const result=compose('sea',original,adapted.code,adapted.cloudPolicy?.mode??'local');
 return {...adapted,code:result.code,sha256:result.sha256,applied:[...adapted.applied,...result.applied]};
}
export function adaptDaemonBinaryWithAuxCrypto(original,cloudOptions={},identityProfile='compatibility',stateIdentityVersion=1){
 if(stateIdentityVersion!==2)return adaptDaemonBinary(original,cloudOptions,identityProfile,stateIdentityVersion);
 if(sha(original)!==DAEMON_BINARY_SHA256||sha(original)!==pins.binarySha256)throw Error('Supplied daemon binary hash mismatch');
 const section=findMachOSeaSection(original),blob=readSeaBlob(original.subarray(section.offset,section.offset+section.size));
 const result=adaptDaemonCodeWithAuxCrypto(blob.code,cloudOptions,identityProfile,stateIdentityVersion),sea=writeSeaBlob({...blob,code:result.code});
 const binary=result.cloudPolicy?embedCloudSeaBlob(original,sea):Buffer.from(original);
 if(!result.cloudPolicy)injectMachOSeaBlob(binary,sea);
 return {binary,codeSha256:result.sha256,applied:result.applied,...(result.cloudPolicy?{cloudPolicy:result.cloudPolicy,cloudAnchors:result.cloudAnchors}:{}),assets:blob.assets.map(([name,data])=>({name,bytes:data.length,sha256:sha(data)}))};
}
export function auxCryptoSeaResources(stateIdentityVersion=1){
 if(stateIdentityVersion!==2)return {files:[],manifest:undefined};
 const materialized=materializeAuxCryptoRuntimeAssets({mode:'sea'});
 return {files:materialized.files.map(f=>({...f,generatedBy:AUX_CRYPTO_GENERATOR})),manifest:{...materialized.manifest,activation:false,startupRefusalPreserved:true}};
}
export function buildDaemonNodeDevelopmentWithAuxCrypto(originalBinary,cloudOptions={},identityProfile='compatibility',stateIdentityVersion=1){
 const development=buildDaemonNodeDevelopment(originalBinary,cloudOptions,identityProfile,stateIdentityVersion);
 if(stateIdentityVersion!==2)return {...development,files:development.files.map(f=>({...f,generatedBy:LEGACY_NODE_GENERATOR}))};
 const section=findMachOSeaSection(originalBinary),blob=readSeaBlob(originalBinary.subarray(section.offset,section.offset+section.size));
 const index=development.files.find(f=>f.path.endsWith('/node-development/index.mjs'));
 if(!index)throw Error('Missing actual daemon development entry');
 const integrated=compose('node-development',blob.code,index.bytes.toString(),development.manifest.cloudPolicy?.mode??'local');
 const assets=materializeAuxCryptoRuntimeAssets({mode:'node-development'});
 const files=[...development.files.map(f=>({...f,...(f===index?{bytes:Buffer.from(integrated.code)}:{}),generatedBy:AUX_CRYPTO_GENERATOR})),...assets.files.map(f=>({...f,generatedBy:AUX_CRYPTO_GENERATOR}))];
 return {files,manifest:{...development.manifest,cryptoIntegration:{format:'aux.crypto.stage.v1',activation:false,startupRefusalPreserved:true,sourceEntrySha256:sha(index.bytes),outputEntrySha256:integrated.sha256,assets:assets.manifest},files:files.map(({path,bytes,mode})=>({path,bytes:bytes.length,mode,sha256:sha(bytes)}))}};
}
