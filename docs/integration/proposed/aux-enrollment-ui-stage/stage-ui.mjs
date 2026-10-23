// Focused UI-only integration proof. No app/daemon/native/browser execution.
import assert from 'node:assert/strict';
import {readFile,writeFile,lstat,readdir} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {SourceTextModule} from 'node:vm';
import {stageProvidedUi,providedRecoveryEnrollmentUiResources} from '../../../../scripts/lib/provided-ui.mjs';
import {composeCloudDesktop} from '../../../../vendor/provided/cloud-desktop-composition.mjs';
import {transformProvidedPasswordManagerScope} from '../../../../scripts/lib/provided-password-manager-scope.mjs';
import {transformProvidedNativeUi} from '../../../../vendor/provided/native-ui-compat.mjs';
import {transformProvidedUiBoundary} from '../../../../scripts/lib/provided-ui-boundary.mjs';
import {transformProvidedNewTabUnavailableControls} from '../../../../scripts/lib/provided-newtab-unavailable-controls.mjs';
import {transformProvidedSettingsImportCopy} from '../../../../scripts/lib/provided-settings-import-copy.mjs';
import {transformProvidedDraftFlush} from '../../../../scripts/lib/provided-draft-flush.mjs';
import {transformProvidedPendingFiles} from '../../../../scripts/lib/provided-pending-files.mjs';
import {transformProvidedLassoOwnership} from '../../../../scripts/lib/provided-lasso-ownership.mjs';
import {transformProvidedNotificationRouting} from '../../../../scripts/lib/provided-notification-routing.mjs';
import {adaptAuxRecoveryEnrollmentUI} from '../aux-sync-recovery-enrollment-ui/source/adapt.mjs';
import {relocateAuxAssetPath} from '../../../../vendor/provided/aux-asset-path-identity.mjs';
import {loadAuxBrowserIconReplacement} from '../../../../scripts/lib/aux-browser-icon.mjs';
import {resolveProtocolIdentity} from '../../../../vendor/provided/aux-protocol-identity.mjs';
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'../../../..');
const root='/Users/rcourson/Documents/Vibe/web',output=join(root,'out/aux-enrollment-ui-review-20261022');
const frozen=join(root,'out/provided-source-snapshot-1.26.1016.1852');
const phase=process.argv[2];assert(['derive','check'].includes(phase));
const hash=x=>createHash('sha256').update(x).digest('hex');
const stageSource=await readFile(join(repository,'scripts/stage-provided.mjs'),'utf8');
const start=stageSource.indexOf('transformText(input) {');assert(start>=0);
const end=stageSource.indexOf('\n  } });',start);assert(end>start);
const body=stageSource.slice(start+'transformText(input) {'.length,end);
const functions={transformProvidedPasswordManagerScope,transformProvidedNativeUi,transformProvidedUiBoundary,transformProvidedNewTabUnavailableControls,transformProvidedSettingsImportCopy,transformProvidedDraftFlush,transformProvidedPendingFiles,transformProvidedLassoOwnership,transformProvidedNotificationRouting,composeCloudDesktop,adaptAuxRecoveryEnrollmentUI};
// Execute exactly the actual staging callback, not an independently copied chain.
const transformText=Function(...Object.keys(functions),'stateIdentityVersion','cloudOptions','return function(input){'+body+'\n}')(...Object.values(functions),2,{enableCloud:true,profile:'development'});
let report;
try{report=await stageProvidedUi({sourceRoots:{agent:join(frozen,'agent'),vault:join(frozen,'vault')},outputRoot:join(output,'ui'),identities:JSON.parse(await readFile(join(repository,'docs/design/extension-identities.json'),'utf8')),identityProfile:'aux-v1',stateIdentityVersion:2,cloudProfile:'development',transformText});}
catch(error){if(phase!=='derive')throw error;const fingerprint=/^Agent revision review mismatch: ([a-f0-9]{64})$/.exec(error.message)?.[1];assert(fingerprint,error.message);await assert.rejects(lstat(join(output,'ui')),e=>e.code==='ENOENT');console.log(JSON.stringify({phase:'derive',fingerprint,unacceptedOutputRetained:false,actualCallbackSha256:hash(body)}));process.exit(0)}
assert.equal(phase,'check','Derivation must stop at the unreviewed revision');
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const safe=p=>typeof p==='string'&&p&&!p.startsWith('/')&&!p.split('/').some(x=>['','.','..'].includes(x));
async function files(directory,relative=''){const result=[];for(const entry of await readdir(join(directory,relative),{withFileTypes:true})){const p=join(relative,entry.name);assert(!entry.isSymbolicLink());if(entry.isDirectory())result.push(...await files(directory,p));else{assert(entry.isFile());result.push(p)}}return result.sort()}
// Run only the ACTUAL shared checker UI boundary, with frozen static sources.
const checker=await readFile(join(repository,'scripts/check-provided.mjs'),'utf8');
const a=checker.indexOf("const pins = await json(join(repository, 'docs/source/provided-ui-inputs.json'));"),b=checker.indexOf("const apps = await json(join(output, 'apps/manifest.json'));");assert(a>0&&b>a);
const uiCheck=Function('return async function({repository,output,json,resolveProtocolIdentity,loadAuxBrowserIconReplacement,providedRecoveryEnrollmentUiResources,relocateAuxAssetPath,lstat,readFile,join,safe,files,hash}){const stateIdentityVersion=2,identityProfile="aux-v1",sourceSnapshot={roots:{agent:'+JSON.stringify(join(frozen,'agent'))+',vault:'+JSON.stringify(join(frozen,'vault'))+'}};'+checker.slice(a,b)+';return {unchanged,changed,css};}')();
const boundary=await uiCheck({repository,output,json,resolveProtocolIdentity,loadAuxBrowserIconReplacement,providedRecoveryEnrollmentUiResources,relocateAuxAssetPath,lstat,readFile,join,safe,files,hash});
const priorRoot=join(root,'out/provided-reuse-aux-recovery-utilities/ui/agent');
const previous=JSON.parse(await readFile(join(root,'out/provided-reuse-aux-recovery-utilities/ui/manifest.json'),'utf8')).components.agent;
const current=report.components.agent;assert.equal(previous.files.length,1215);assert.equal(current.files.length,1217);
const newPaths=current.files.filter(x=>x.added).map(x=>x.path);assert.equal(newPaths.length,2);
const changed=[];for(const old of previous.files){const entry=current.files.find(x=>x.path===old.path);assert(entry);const before=await readFile(join(priorRoot,old.path)),after=await readFile(join(output,'ui/agent',entry.path));assert.equal(hash(before),old.outputSha256);assert.equal(hash(after),entry.outputSha256);if(!before.equals(after))changed.push(entry.path)}
assert.deepEqual(changed.sort(),['assets/account-Dr_CA8LL.js','manifest.json']);
const sourcePins=await json(join(repository,'docs/integration/proposed/aux-sync-recovery-enrollment-ui/source-pins.json'));
const account=current.files.find(x=>x.path===sourcePins.ui.path);assert.equal(account.outputSha256,sourcePins.ui.outputSha256);
for(const edit of sourcePins.ui.stagePreBranding.edits)assert.equal(account.anchors.filter(x=>x.find===edit.find&&x.replace===edit.replace&&x.count===1).length,1);
for(const name of [sourcePins.ui.path,...newPaths]){const source=await readFile(join(output,'ui/agent',name),'utf8'),parsed=new SourceTextModule(source);for(const spec of parsed.dependencySpecifiers){assert(spec.startsWith('./'));await lstat(join(output,'ui/agent/assets',spec.slice(2)))} }
assert.deepEqual(await providedRecoveryEnrollmentUiResources(1),{files:[],manifest:undefined});
const result={format:'aux.enrollment-ui.stage-check.v1',outputRoot:output,originalAgentFiles:1215,agentFiles:1217,changedOriginalAgentPaths:changed.sort(),newAssets:current.recoveryEnrollment.files,originalAccountAnchorsReplayed:3,accountSha256:account.outputSha256,cssChanged:0,iconsChanged:0,originalFilesByteIdentical:1213,sharedCheckerBoundary:boundary,manifestVersion:JSON.parse(await readFile(join(output,'ui/agent/manifest.json'),'utf8')).version,state1NewResources:0,actualStagingCallbackSha256:hash(body),stageHookSha256:hash(stageSource),uiCheckerSha256:hash(checker),uiEvaluated:false,fullStageRun:false,nativeExecuted:false,appLaunched:false};
await writeFile(new URL('./evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
