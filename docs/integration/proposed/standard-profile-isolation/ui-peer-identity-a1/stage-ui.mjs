/** Actual original UI staging pipeline only. No native build, app copy or launch. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {stageProvidedUi} from '../../../../../scripts/lib/provided-ui.mjs';
import {applyAuxUiPeerIdentity} from '../../../../../vendor/provided/aux-ui-peer-identity.mjs';
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

const root = '/Users/rcourson/Documents/Vibe/web';
const here = path.join(root, 'docs/integration/proposed/standard-profile-isolation/ui-peer-identity-a1');
const previous = path.join(root, 'out/standard-profile-finish-stage-pair-20261024');
const snapshot = path.join(root, 'out/provided-source-snapshot-1.26.1016.1852');
const output = '/private/tmp/aux-ui-peer-stage-20261024-a1';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const ledgerPath = path.join(root, 'vendor/provided/agent-revisions.json');
const ledgerBytes = await fs.readFile(ledgerPath), ledger = JSON.parse(ledgerBytes);
assert.equal(ledger.at(-1).revision, 17);
await fs.mkdir(output, {mode: 0o700});
const predicted = [];
for (const [index, featureProfile] of ['baseline', 'desktop-v1'].entries()) {
  const old = await read(path.join(previous, featureProfile, 'ui/manifest.json'));
  const files = old.components.agent.files;
  const manifest = files.find(file => file.path === 'manifest.json');
  const revision = manifest.anchors.at(-1);
  let text = await fs.readFile(path.join(previous, featureProfile, 'ui/agent/manifest.json'), 'utf8');
  assert.equal(text.split(revision.replace).length - 1, 1);
  text = text.replace(revision.replace, revision.find);
  const before = files.map(file => [file.path, file.path === 'manifest.json' ? sha(text) : file.outputSha256]);
  const canonical = rows => [...rows].sort((a,b) => a[0]<b[0]?-1:a[0]>b[0]?1:0);
  const oldReview = ledger.filter(review => review.profile === 'development' && (review.featureProfile ?? 'baseline') === featureProfile && review.identityProfile === 'aux-v1' && review.stateIdentityVersion === 2).at(-1);
  assert.equal(sha(JSON.stringify(canonical(before))), oldReview.fingerprint);
  const after = [];
  for (const [relative, hash] of before) {
    if (!JSON.parse(await fs.readFile(path.join(here, 'inputs.json'), 'utf8')).files.some(file => file.path === relative)) {after.push([relative, hash]); continue;}
    const original = await fs.readFile(path.join(snapshot, 'agent', relative), 'utf8');
    const current = await fs.readFile(path.join(previous, featureProfile, 'ui/agent', relative), 'utf8');
    assert.equal(sha(current), hash);
    const next = applyAuxUiPeerIdentity({component:'agent', path:relative, text:current, original, stateIdentityVersion:2});
    after.push([relative, sha(next.text)]);
  }
  predicted.push({revision:18+index, profile:'development', identityProfile:'aux-v1', stateIdentityVersion:2,
    ...(featureProfile === 'desktop-v1' ? {featureProfile} : {}), fingerprint:sha(JSON.stringify(canonical(after)))});
}
await fs.writeFile(path.join(here, 'revision-review.json'), JSON.stringify({format:'aux.ui-peer-revision-review.v1', previousLedgerSha256:sha(ledgerBytes),reviews:predicted,uiChanged:false,productExecuted:false},null,2)+'\n', {flag:'wx'});
await fs.writeFile(ledgerPath, JSON.stringify([...ledger,...predicted],null,2)+'\n');

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
const reports = [];
for (const featureProfile of ['baseline','desktop-v1']) {
  const report = await stageProvidedUi({sourceRoots:{agent:path.join(snapshot,'agent'),vault:path.join(snapshot,'vault')},
    outputRoot:path.join(output,featureProfile), identities, cloudProfile:'development', identityProfile:'aux-v1', stateIdentityVersion:2,
    featureProfile, transformText, postIdentityTransformText(input) {
      return featureProfile === 'desktop-v1' && input.component === 'agent'
        ? transformAuxBrowserFeatureUi({relative:input.path,text:input.text}) : {text:input.text,anchors:[]};
    }});
  const old = await read(path.join(previous, featureProfile, 'ui/manifest.json'));
  const deltas = [];
  for (const component of ['agent','vault']) {
    const expected = old.components[component].files;
    const actual = report.components[component].files;
    assert.deepEqual(actual.map(file=>file.path), expected.map(file=>file.path));
    for (const file of actual) {
      const prior = expected.find(prior=>prior.path===file.path);
      const absolute = path.join(output,featureProfile,component,file.path);
      assert.equal(sha(await fs.readFile(absolute)),file.outputSha256);
      if (file.outputSha256 !== prior.outputSha256) deltas.push(component+'/'+file.path);
      const oldMode = (await fs.stat(path.join(previous,featureProfile,'ui',component,file.path))).mode & 0o777;
      assert.equal((await fs.stat(absolute)).mode & 0o777,oldMode);
    }
  }
  assert.deepEqual(deltas.sort(), ['agent/manifest.json','agent/background.js','agent/content/content.js','agent/assets/queries-ldd77hNk.js','agent/assets/-types-Wy38XkNB.js'].sort());
  reports.push({featureProfile, output:path.join(output,featureProfile),fileCount:report.components.agent.files.length+report.components.vault.files.length,exactDelta:deltas,cssAssetsAndOtherFilesByteIdentical:true,modesPreserved:true});
}
assert.equal(sha(await fs.readFile(path.join(root,'scripts/stage-provided.mjs'))),sha(stageSource));
const result={format:'aux.ui-peer-original-stage.actual.v1',passed:true,reports,callbackSourceSha256:sha(stageSource),revisionReview:predicted,
  completedStages:reports.length,uiGeometryChanged:false,productExecuted:false,nativeBuildPerformed:false,packaged:false};
await fs.writeFile(path.join(here,'actual-stages-a1.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,stages:reports.length,changedFilesPerStage:5,productExecuted:false}));
