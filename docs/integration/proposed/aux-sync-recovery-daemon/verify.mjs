// Verify/parse actual projections; never evaluate a full daemon entry or preload.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {SourceTextModule} from 'node:vm';import {isBuiltin} from 'node:module';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../vendor/provided/aux-cold-entry-admission.mjs';
import {adaptAuxSyncRecoveryDaemon} from './source/adapt.mjs';
import {materializeSyncRecoveryDesktop} from './source/materialize-desktop.mjs';
const root=new URL('../../../../',import.meta.url),pin=JSON.parse(readFileSync(new URL('./source-pins.json',import.meta.url))),hash=x=>createHash('sha256').update(x).digest('hex');
for(const source of pin.dependencies)if(hash(readFileSync(new URL(source.path,root)))!==source.sha256)throw Error('Recovery dependency source drift: '+source.path);
const variants=[];
for(const[kind,file]of [['sea',process.argv[2]],['node',process.argv[3]]]){
 if(!file)throw Error('Provide the two exact CAS5-only SEA and Node source files');
 const input=readFileSync(file,'utf8'),out=adaptAuxSyncRecoveryDaemon(input,{kind}),module=new SourceTextModule(out.code);
 if(!module.dependencySpecifiers.every(isBuiltin))throw Error('Unexpected static nonbuiltin entry import');
 if(!out.code.startsWith(AUX_COLD_ENTRY_REFUSAL)||out.code.split(AUX_COLD_ENTRY_REFUSAL).length!==2||out.code.indexOf('await import(new URL("aux-sync-recovery.mjs"')<AUX_COLD_ENTRY_REFUSAL.length)throw Error('Cold refusal/preload ordering changed');
 variants.push({kind,sha256:out.sha256,entryEvaluated:false});
}
const asset=await materializeSyncRecoveryDesktop(),module=new SourceTextModule(asset.bytes.toString());if(!module.dependencySpecifiers.every(isBuiltin))throw Error('Recovery asset has nonbuiltin sibling/project imports');if(asset.bytes.toString().toLowerCase().includes('aside'))throw Error('Unexpected original product token');
console.log(JSON.stringify({variants,edits:pin.edits.length,assetSha256:asset.sha256,assetBytes:asset.bytes.length,assetEvaluated:false,activation:false}));
