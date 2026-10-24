// Project the feature source through the existing dormant native-entry owner.
// No daemon, native binding, loader, or product code is executed here.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
const root=process.cwd(), output=path.resolve(process.argv[2]);
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const compositionPath=path.join(output,'composition.json');
const composition=JSON.parse(await fs.readFile(compositionPath));
if(!composition.passed||composition.productExecuted||composition.runtimeAuthorityGranted)throw Error('Successful inactive composition required');
const pairPath=composition.predecessorSourcePair;
const pairBytes=await fs.readFile(pairPath);
if(sha(pairBytes)!==composition.predecessorSourcePairSha256)throw Error('Predecessor pair changed');
const pair=JSON.parse(pairBytes);
const source=composition.files.find(file=>file.kind==='source');
const entry=composition.files.find(file=>file.kind==='entry');
if(!source||!entry)throw Error('Both source kinds required');
for(const file of [source,entry]){
 if(sha(await fs.readFile(file.input))!==file.beforeSha256||sha(await fs.readFile(file.output))!==file.afterSha256)throw Error('Composed input/output changed');
}
const bytes=await fs.readFile(source.output);
if(!bytes.toString().startsWith(AUX_COLD_ENTRY_REFUSAL))throw Error('Ordinary cold refusal changed');
const sourceReceipt=path.join(output,'source-receipt.json');
const report={format:'aux.browser-features.composed-source.v1',passed:true,inputSha256:source.beforeSha256,composedSha256:sha(bytes),compositionReceiptSha256:sha(await fs.readFile(compositionPath)),coldRefusalPreserved:true,executed:false,uiChanged:false,nativeAbiChanged:false};
await fs.writeFile(sourceReceipt,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
const projected=path.join(output,'projected-entry');
const run=spawnSync(process.execPath,[path.join(root,'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs'),source.output,sourceReceipt,projected],{encoding:'utf8'});
if(run.status)throw Error(run.stderr||run.stdout||'Projection failed');
const actual=await fs.readFile(path.join(projected,'aux-native-entry.mjs'));
if(sha(actual)!==entry.afterSha256)throw Error('Native projection and exact prior-entry feature adaptation disagree');
if(sha(await fs.readFile(path.join(projected,'aux-owned-native.cjs')))!==pair.loaderSha256)throw Error('Native loader changed');
console.log(JSON.stringify({passed:true,sourceReceipt,entryReceipt:path.join(projected,'results.json'),entryProjectionMatchesIndependentComposition:true,executed:false}));
