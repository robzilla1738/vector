/** Actual original UI staging pipeline only. No native build, app copy or launch. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {stageProvidedUi} from '../../../../../scripts/lib/provided-ui.mjs';
import {transformAuxBrowserFeatureUi} from '../../../../../vendor/provided/aux-browser-feature-composition.mjs';
import {transformProvidedSettingsImportCopy} from '../../../../../scripts/lib/provided-settings-import-copy.mjs';
import {transformProvidedPendingFiles} from '../../../../../scripts/lib/provided-pending-files.mjs';
import {transformProvidedNotificationRouting} from '../../../../../scripts/lib/provided-notification-routing.mjs';
import {transformProvidedLassoOwnership} from '../../../../../scripts/lib/provided-lasso-ownership.mjs';
import {transformProvidedDraftFlush} from '../../../../../scripts/lib/provided-draft-flush.mjs';
import {transformProvidedPasswordManagerScope} from '../../../../../scripts/lib/provided-password-manager-scope.mjs';
import {transformProvidedUiBoundary} from '../../../../../scripts/lib/provided-ui-boundary.mjs';
import {transformProvidedNewTabUnavailableControls} from '../../../../../scripts/lib/provided-newtab-unavailable-controls.mjs';
import {transformProvidedNativeUi} from '../../../../../vendor/provided/native-ui-compat.mjs';
import {composeCloudDesktop} from '../../../../../vendor/provided/cloud-desktop-composition.mjs';
import {adaptAuxRecoveryEnrollmentUI} from '../../aux-sync-recovery-enrollment-ui/source/adapt.mjs';

const root='/Users/rcourson/Documents/Vibe/web';
const here=path.join(root,'docs/integration/proposed/browser-feature-expansion/completion-batch-a2');
const preflight=process.argv.includes('--preflight');
const output=preflight?'/private/tmp/aux-feature-completion-ui-preflight-20261024-a2':'/private/tmp/aux-feature-completion-ui-stage-20261024-a2';
const previous='/private/tmp/aux-feature-completion-ui-stage-20261024-a1';
const snapshot=path.join(root,'out/provided-source-snapshot-1.26.1016.1852');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
// Extract the exact existing stager-owned pure callback, avoiding a second
// independently maintained copy of its ordered composition pipeline.
const stageSource = await fs.readFile(path.join(root, 'scripts/stage-provided.mjs'), 'utf8');
const marker = 'transformText(input) {';
assert.equal(stageSource.split(marker).length - 1, 1);
const start = stageSource.indexOf(marker), end = stageSource.indexOf('\n  } });', start);
assert(end > start);
const method = stageSource.slice(start, end) + '\n}';
const transformText = runInNewContext('({' + method + '}).transformText', {
  transformProvidedSettingsImportCopy, transformProvidedPendingFiles, transformProvidedNotificationRouting,
  transformProvidedLassoOwnership, transformProvidedDraftFlush, transformProvidedPasswordManagerScope,
  transformProvidedUiBoundary, transformProvidedNewTabUnavailableControls, transformProvidedNativeUi,
  composeCloudDesktop, adaptAuxRecoveryEnrollmentUI, stateIdentityVersion:2,
  cloudOptions:{enableCloud:true, profile:'development'},
});
const identities = await read(path.join(root, 'docs/design/extension-identities.json'));
let report;
try {
 report=await stageProvidedUi({sourceRoots:{agent:path.join(snapshot,'agent'),vault:path.join(snapshot,'vault')},
  outputRoot:output,identities,cloudProfile:'development',identityProfile:'aux-v1',stateIdentityVersion:2,
  featureProfile:'desktop-v1',transformText,postIdentityTransformText(input){
   return input.component==='agent'?transformAuxBrowserFeatureUi({relative:input.path,text:input.text}):{text:input.text,anchors:[]};
  }});
} catch(error) {
 if(!preflight)throw error;
 const match=/Agent revision review mismatch: ([a-f0-9]{64})/.exec(String(error.message));
 if(!match)throw error;
 const receipt={format:'aux.feature-completion.ui-preflight.actual.v1',passed:false,expectedReviewRequired:true,
  observedFingerprint:match[1],output,reason:String(error.message),productExecuted:false};
 await fs.writeFile(path.join(here,'actual-ui-preflight-a1.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt));process.exit(0);
}
assert(!preflight,'Review preflight unexpectedly used an accepted predecessor fingerprint');
const current=await read(path.join(output,'manifest.json')),prior=await read(path.join(previous,'manifest.json'));
const allowed=new Set(['assets/tabsearch-3k_2hgil.js','manifest.json']),deltas=[];
for(const component of ['agent','vault']){
 const oldFiles=prior.components[component].files,newFiles=current.components[component].files;
 assert.deepEqual(oldFiles.map(f=>f.path),newFiles.map(f=>f.path));
 for(let i=0;i<oldFiles.length;i++){
  const old=oldFiles[i],next=newFiles[i];
  assert.equal(old.outputMode,next.outputMode);
  if(old.outputSha256!==next.outputSha256){
   assert.equal(component,'agent');assert(allowed.has(old.path),old.path);
   deltas.push({path:old.path,beforeSha256:old.outputSha256,afterSha256:next.outputSha256});
  }
 }
}
assert.equal(deltas.length,2);
const oldManifest=await read(path.join(previous,'agent/manifest.json'));
const nextManifest=await read(path.join(output,'agent/manifest.json'));
assert.equal(oldManifest.version,'1.26.1016.1880');assert.equal(nextManifest.version,'1.26.1016.1881');
oldManifest.version=nextManifest.version;assert.deepEqual(oldManifest,nextManifest);
const receipt={format:'aux.feature-completion.ui-stage.actual.v1',passed:true,output,
 stageManifestSha256:sha(await fs.readFile(path.join(output,'manifest.json'))),
 priorManifestSha256:sha(await fs.readFile(path.join(previous,'manifest.json'))),
 agentRevision:29,deltas,stylesAssetsFontsModesAndOtherBytesPreserved:true,
 identitiesAndPermissionsPreserved:true,productExecuted:false,appPackaged:false,runtimeAcceptance:false};
await fs.writeFile(path.join(here,'actual-ui-stage-a1.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
