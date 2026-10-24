// Static source adaptation and original dormant-entry projection only.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const sha = value => createHash('sha256').update(value).digest('hex');
const here = path.dirname(fileURLToPath(import.meta.url));
const pinsPath = path.join(here,'inputs.json');
const pinsBytes = await fs.readFile(pinsPath), pins = JSON.parse(pinsBytes);
const [outputArg] = process.argv.slice(2);
if (!outputArg) throw Error('Fresh absolute output directory required');
const output = path.resolve(outputArg), root = pins.root;
if (!path.isAbsolute(outputArg) || !output.startsWith('/private/tmp/'))
  throw Error('Use a fresh /private/tmp output');
const read = async name => JSON.parse(await fs.readFile(name));
const verify = async rows => {
  for (const row of rows) if (sha(await fs.readFile(row.path)) !== row.sha256)
    throw Error('Pinned input changed: '+row.path);
};
await verify(pins.inputs);
const priorPath = path.join(pins.baseline,'composition.json');
const prior = await read(priorPath);
if (!prior.passed || prior.coldFeatureEnabled || prior.runtimeAuthorityGranted || prior.productExecuted)
  throw Error('Successful inactive a4 composition required');
const adapterInputs = prior.adapterInputs.map(item=>({...item}));
for (const item of pins.inputs.filter(item=>item.path.startsWith(root+path.sep))) {
  const relative=path.relative(root,item.path), existing=adapterInputs.find(row=>row.path===relative);
  if (existing && existing.sha256!==item.sha256) throw Error('Adapter pin conflict');
  if (!existing) adapterInputs.push({path:relative,sha256:item.sha256});
}
if (!adapterInputs?.length) throw Error('Original adapter pins missing');
const adapterPaths = adapterInputs.map(item=>({...item,path:path.join(root,item.path)}));
await verify(adapterPaths);
const oldSourceReceipt = await read(path.join(pins.baseline,'source-receipt.json'));
const oldEntryReceipt = await read(path.join(pins.baseline,'projected-entry/results.json'));
if (!oldSourceReceipt.passed || !oldEntryReceipt.passed || !oldEntryReceipt.dormant ||
    !oldEntryReceipt.defaultEntryRefusalPreserved || oldEntryReceipt.executed ||
    oldEntryReceipt.runtimeAuthorityGranted ||
    oldSourceReceipt.compositionReceiptSha256 !== sha(await fs.readFile(priorPath)) ||
    oldEntryReceipt.sourceReceiptSha256 !== sha(await fs.readFile(path.join(pins.baseline,'source-receipt.json'))))
  throw Error('Actual predecessor projection chain required');
for (const row of prior.files) {
  if (sha(await fs.readFile(row.input)) !== row.beforeSha256 ||
      sha(await fs.readFile(row.output)) !== row.afterSha256) throw Error('a4 composition bytes changed');
}
const pairBytes = await fs.readFile(prior.predecessorSourcePair);
if (sha(pairBytes) !== prior.predecessorSourcePairSha256) throw Error('Protected predecessor changed');
const pair = JSON.parse(pairBytes);
const asyncRoot = path.join(root,pins.asyncIntegration);
const overlay = await read(path.join(asyncRoot,'source-overlay.json'));
const {applyRuntimeCacheInspection} = await import(pathToFileURL(path.join(asyncRoot,'transform.mjs')));
const {AUX_COLD_ENTRY_REFUSAL} = await import(pathToFileURL(path.join(root,'vendor/provided/aux-cold-entry-admission.mjs')));
await fs.mkdir(output,{mode:0o700});
// Actually rerun the existing feature composer; a historical receipt is not a
// new run. Require its produced source and independent entry to equal a4.
const baseOutput=path.join(output,'feature-base');
const baseRun=spawnSync(process.execPath,[path.join(root,'docs/integration/proposed/browser-feature-expansion/integration/compose-daemon.mjs'),baseOutput],{cwd:root,encoding:'utf8'});
await fs.writeFile(path.join(output,'feature-base.log'),baseRun.stdout+baseRun.stderr,{flag:'wx'});
if(baseRun.status!==0)throw Error('Original feature composition failed');
const baseComposition=await read(path.join(baseOutput,'composition.json'));
if(!baseComposition.passed)throw Error('Fresh feature composition unsuccessful');
for(const row of baseComposition.files){
 const old=prior.files.find(item=>item.kind===row.kind);
 if(!old||row.afterSha256!==old.afterSha256||sha(await fs.readFile(row.output))!==old.afterSha256)
  throw Error('Fresh feature composition differs from a4');
}
const report = {format:'aux.browser-features.daemon-source-composition.v1',passed:false,
  predecessorSourcePair:prior.predecessorSourcePair,
  predecessorSourcePairSha256:prior.predecessorSourcePairSha256,
  predecessorFeatureComposition:priorPath,predecessorFeatureCompositionSha256:sha(await fs.readFile(priorPath)),
  asyncProjectionInputsSha256:sha(pinsBytes),asyncProjectionInputs:pins.inputs,
  featureBaseComposition:path.join(baseOutput,'composition.json'),
  featureBaseCompositionSha256:sha(await fs.readFile(path.join(baseOutput,'composition.json'))),
  adapterInputs,files:[],helpers:[],coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false};
const syntax = target => {
  const checked = spawnSync(process.execPath,['--check',target],{encoding:'utf8'});
  if (checked.status !== 0) throw Error('Syntax check failed: '+checked.stderr);
};
try {
  for (const kind of ['source','entry']) {
    const input = kind === 'source' ? path.join(pins.baseline,'index.mjs') :
      path.join(pins.baseline,'projected-entry/aux-native-entry.mjs');
    const expected = overlay.files.find(row=>row.kind==='daemon' && row.input===input);
    if (!expected) throw Error('Exact current source/entry overlay missing');
    const bytes = await fs.readFile(input);
    if (sha(bytes) !== (kind==='source' ? oldSourceReceipt.composedSha256 : oldEntryReceipt.entrySha256))
      throw Error('Predecessor source receipt association changed');
    const adapted = applyRuntimeCacheInspection(bytes.toString(),{kind:'daemon',inputSha256:expected.inputSha256});
    let replay = bytes.toString();
    for (const edit of adapted.edits) {
      if (replay.split(edit.before).length-1 !== edit.count) throw Error('Async source anchor drift');
      replay = replay.split(edit.before).join(edit.after);
    }
    if (replay !== adapted.source || sha(replay)!==expected.outputSha256 ||
        sha(await fs.readFile(expected.output))!==expected.outputSha256) throw Error('Independent adaptation differs');
    const target = path.join(output,kind==='source'?'index.mjs':'aux-native-entry.mjs');
    await fs.writeFile(target,replay,{flag:'wx',mode:0o600}); syntax(target);
    const feature=baseComposition.files.find(row=>row.kind===kind);
    const cacheAnchors=adapted.edits.map(edit=>({find:edit.before,replace:edit.after,count:edit.count}));
    const anchors=[...feature.anchors,...cacheAnchors];
    let complete=await fs.readFile(feature.input,'utf8');
    for(const edit of anchors){
      if(complete.split(edit.find).length-1!==edit.count)throw Error('Complete successor replay count changed');
      complete=complete.split(edit.find).join(edit.replace);
    }
    if(complete!==replay || feature.input!==pair[kind] || feature.beforeSha256!==pair[kind+'Sha256'])
      throw Error('Final leaf does not derive from exact protected predecessor');
    report.files.push({kind,input:feature.input,beforeSha256:feature.beforeSha256,
      output:target,afterSha256:sha(replay),anchors,
      stages:[{kind:'features',input:feature.input,beforeSha256:feature.beforeSha256,
        output:feature.output,afterSha256:feature.afterSha256},
        {kind:'async-runtime-inspection',input,beforeSha256:sha(bytes),output:target,
        afterSha256:sha(replay),anchors:cacheAnchors}]});
  }
  await fs.mkdir(path.join(output,'native'),{mode:0o700});
  for (const kind of ['seed','bootstrap']) {
    const item = overlay.files.find(row=>row.kind===kind);
    const bytes = await fs.readFile(item.output);
    if (sha(bytes)!==item.outputSha256 || sha(await fs.readFile(item.input))!==item.inputSha256)
      throw Error('Paired runtime helper changed');
    const target = path.join(output,'native',path.basename(item.output));
    await fs.writeFile(target,bytes,{flag:'wx',mode:0o600}); syntax(target);
    report.helpers.push({...item,preparedOutput:item.output,output:target});
  }
  await verify(pins.inputs); await verify(adapterPaths);
  report.passed=true;
} catch(error) { report.error=String(error); throw error; }
finally { await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600}); }
const source = report.files.find(row=>row.kind==='source');
const entry = report.files.find(row=>row.kind==='entry');
if (!(await fs.readFile(source.output,'utf8')).startsWith(AUX_COLD_ENTRY_REFUSAL)) throw Error('Ordinary refusal changed');
const sourceReceiptPath = path.join(output,'source-receipt.json');
const sourceReceipt = {format:'aux.browser-features.composed-source.v1',passed:true,
  inputSha256:source.beforeSha256,composedSha256:source.afterSha256,
  compositionReceiptSha256:sha(await fs.readFile(path.join(output,'composition.json'))),
  coldRefusalPreserved:true,executed:false,uiChanged:false,
  nativeAbiChanged:true,nativePairingPending:true};
await fs.writeFile(sourceReceiptPath,JSON.stringify(sourceReceipt,null,2)+'\n',{flag:'wx',mode:0o600});
const projector = path.join(root,'docs/integration/proposed/profile-isolation-final/integration/project-entry.mjs');
const projected = path.join(output,'projected-entry');
const result = spawnSync(process.execPath,[projector,source.output,sourceReceiptPath,projected],{encoding:'utf8'});
await fs.writeFile(path.join(output,'projection.log'),result.stdout+result.stderr,{flag:'wx'});
if (result.status!==0) throw Error('Original dormant-entry projection failed');
const receipt = await read(path.join(projected,'results.json'));
if (!receipt.passed || !receipt.defaultEntryRefusalPreserved || !receipt.dormant ||
    receipt.executed || receipt.runtimeAuthorityGranted ||
    receipt.sourceSha256!==source.afterSha256 || receipt.entrySha256!==entry.afterSha256 ||
    sha(await fs.readFile(path.join(projected,'aux-native-entry.mjs')))!==entry.afterSha256 ||
    receipt.loaderSha256!==pair.loaderSha256 ||
    sha(await fs.readFile(path.join(projected,'aux-owned-native.cjs')))!==pair.loaderSha256)
  throw Error('Actual projection, independent entry, loader or refusal flags differ');
await verify(pins.inputs); await verify(adapterPaths);
const evidence={format:'aux.async-daemon-projection.actual.v1',passed:true,output,
  compositionSha256:sha(await fs.readFile(path.join(output,'composition.json'))),
  sourceReceiptSha256:sha(await fs.readFile(sourceReceiptPath)),
  entryReceiptSha256:sha(await fs.readFile(path.join(projected,'results.json'))),
  sourceSha256:source.afterSha256,entrySha256:entry.afterSha256,loaderSha256:pair.loaderSha256,
  independentEntryMatchesProjection:true,nativeAbiChanged:true,nativePairingPending:true,
  coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false,packaged:false};
await fs.writeFile(path.join(output,'projection-evidence.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(evidence));
