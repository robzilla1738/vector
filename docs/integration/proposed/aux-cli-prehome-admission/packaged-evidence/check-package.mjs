import {mkdtemp,mkdir,lstat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {SourceTextModule} from 'node:vm';
import {isBuiltin} from 'node:module';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';
import {assertAuxUiOriginPairing} from '../../../../../vendor/provided/aux-ui-origin-identity.mjs';
import {applyAuxBillingReturnFallback} from '../../../../../vendor/provided/aux-billing-return-fallback.mjs';
import {applyAuxUiOriginIdentity} from '../../../../../vendor/provided/aux-ui-origin-identity.mjs';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {assertAuxVisualAssets} from '../../../../../scripts/lib/aux-identity-contract.mjs';
import {assertAuxLaunchIdentity} from '../../../../../scripts/lib/aux-launch-identity.mjs';
const root=new URL('../../../../../',import.meta.url),app=new URL('out/provided-candidate-aux-cli-admission/Aux.app/',root);
const resources=new URL('Contents/Resources/aux/',app),agent=new URL('apps/extension/dist/',resources);
const packageBytes=await readFile(new URL('../package.json',app)),receipt=JSON.parse(packageBytes);
assert.equal(receipt.identityProfile,'aux-v1');assert.equal(receipt.stateIdentityVersion,2);assert.equal(receipt.signed,false);assert.equal(receipt.identityEvidence.coldEntryQuarantineChecked,true);
const nativeRaw=await readFile(new URL('out/aux-lifecycle-native-build.json',root)),native=JSON.parse(nativeRaw);
const probe=JSON.parse(await readFile(new URL('out/aux-native-startup-probe.json',root),'utf8'));
const compositionRaw=await readFile(new URL('out/native-reuse-composition-aux-lifecycle-callbacks/manifest.json',root)),composition=JSON.parse(compositionRaw);
assert.equal(createHash('sha256').update(nativeRaw).digest('hex'),receipt.nativeReceiptSha256);
assert.equal(createHash('sha256').update(compositionRaw).digest('hex'),receipt.compositionSha256);
assert.equal(native.buildExitCode,0);assert.equal(native.generatedKeyProbePassed,true);assert.equal(probe.exitCode,0);
const lifecycle=JSON.parse(await readFile(new URL('out/aux-daemon-lifecycle-probe.json',root),'utf8'));
assert.equal(lifecycle.exitCode,0);assert.equal(lifecycle.scope,'owned-direct-daemon-only');
assert.equal(lifecycle.passedCases.length,5);assert.equal(lifecycle.allWritersVerified,false);
assert.equal(lifecycle.compositionSha256,createHash('sha256').update(compositionRaw).digest('hex'));
for(const [path,sha] of Object.entries(lifecycle.sources))assert.equal(sha,composition.files.find(file=>file.path===path).outputSha256);

assert.equal(probe.headerSha256,composition.files.find(file=>file.path==='chrome/app/aux_packaged_state_identity.h').outputSha256);
const frameworkHash=createHash('sha256');let tail=Buffer.alloc(0);
const diagnostics=new Map(['Aux packaged state identity is unsupported or unaccepted','Owned direct daemon drain could not be verified'].map(text=>[text,false]));
for await(const chunk of createReadStream(new URL('Contents/Frameworks/Aux Framework.framework/Aux Framework',app),{highWaterMark:1024*1024})){
 frameworkHash.update(chunk);const scan=Buffer.concat([tail,chunk]);for(const [text,found]of diagnostics)if(!found&&scan.includes(Buffer.from(text)))diagnostics.set(text,true);tail=scan.subarray(-128);
}
const nativeFrameworkSha256=frameworkHash.digest('hex');
assert.equal(nativeFrameworkSha256,native.files.find(file=>file.path.endsWith('/Aux Framework')).sha256);
for(const found of diagnostics.values())assert.equal(found,true);
const visual=await assertAuxVisualAssets({agentRoot:decodeURIComponent(agent.pathname).replace(/\/$/,''),assetIdentity:'aux'});
const previousVisual=await assertAuxVisualAssets({agentRoot:new URL('out/provided-candidate-aux-runtime-envelope/Aux.app/Contents/Resources/aux/apps/extension/dist',root).pathname,assetIdentity:'aux'});
assert.deepEqual(visual,previousVisual);
const binary=await readFile(new URL('apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon',resources));
const section=findMachOSeaSection(binary),code=readSeaBlob(binary.subarray(section.offset,section.offset+section.size)).code;
const ephemeralPins=JSON.parse(await readFile(new URL('docs/integration/proposed/aux-ephemeral-runtime-identity/inputs.json',root),'utf8'));
const generatedEntry=await readFile(new URL('apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs',resources),'utf8');
new SourceTextModule(generatedEntry);
const cliBinary=await readFile(new URL('apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea',resources));
const cliSection=findMachOSeaSection(cliBinary),cliCode=readSeaBlob(cliBinary.subarray(cliSection.offset,cliSection.offset+cliSection.size)).code;
const coldEntries=[['daemonSEA',code,''],['cliSEA',cliCode,'#!/usr/bin/env node\n'],['generatedNode',generatedEntry,'']];
const coldEntryStaticImports={};
for(const [label,text,hashbang]of coldEntries){
 assert.ok(text.startsWith(hashbang+AUX_COLD_ENTRY_REFUSAL),label+' first throw');
 assert.equal(text.split(AUX_COLD_ENTRY_REFUSAL).length-1,1,label+' singular throw');
 const parsed=new SourceTextModule(text);assert.ok(parsed.dependencySpecifiers.every(isBuiltin),label+' builtin-only static imports');
 coldEntryStaticImports[label]=[...parsed.dependencySpecifiers];
}
const dynamicBinding='const { daemonResources: __auxDaemonResources, daemonMacOS: __auxDaemonMacOS, daemonAppRoot: __auxDaemonAppRoot, getAsset: __auxProvidedGetAsset } = await import("./assets.mjs");\n';
assert.ok(generatedEntry.startsWith(AUX_COLD_ENTRY_REFUSAL+dynamicBinding));
assert.ok(!coldEntryStaticImports.generatedNode.includes('./assets.mjs'));
const generatedAssets=await readFile(new URL('apps/daemon/Aux Daemon.app/Contents/Resources/node-development/assets.mjs',resources),'utf8');
new SourceTextModule(generatedAssets);
assert.equal(visual.actualFiles,135);assert.equal(visual.cssFiles,5);

for(const text of [code,generatedEntry])for(const rule of ephemeralPins.rules){
 assert.equal(text.split(rule.replace).length-1,rule.count);
 // Added protection can intentionally contain the old full prefix (HTML/legacy guard).
 assert.equal(text.split(rule.replace).join('').includes(rule.find),false);
}
const content=await readFile(new URL('content/content.js',agent),'utf8');
new SourceTextModule(code);new SourceTextModule(content);
const privatePins=JSON.parse(await readFile(new URL('docs/integration/proposed/aux-private-daemon-identity/inputs.json',root),'utf8'));
for(const rule of privatePins.rules){assert.equal(code.split(rule.find).length-1,0);assert.equal(code.split(rule.replace).length-1,rule.count)}
const capturePins=JSON.parse(await readFile(new URL('docs/integration/proposed/aux-capture-contract-identity/inputs.json',root),'utf8'));
const selectionPins=JSON.parse(await readFile(new URL('docs/integration/proposed/aux-selection-contract-identity/inputs.json',root),'utf8'));
for(const input of capturePins.inputs)for(const rule of input.rules){
 const text=input.component==='daemon'?code:content;
 let finalReplacement=rule.replace;
 if(input.component==='agent')for(const next of selectionPins.inputs.find(pin=>pin.path===input.path)?.rules??[])finalReplacement=finalReplacement.split(next.find).join(next.replace);
 assert.equal(text.split(rule.find).length-1,0);assert.equal(text.split(finalReplacement).length-1,rule.count);
}
const agentTexts=new Map([['content/content.js',content]]);
for(const path of ['background.js','assets/queries-ldd77hNk.js','assets/-types-Wy38XkNB.js']){const text=await readFile(new URL(path,agent),'utf8');agentTexts.set(path,text);new SourceTextModule(text)}
for(const input of selectionPins.inputs)for(const rule of input.rules){const text=agentTexts.get(input.path);assert.equal(text.split(rule.find).length-1,0);assert.equal(text.split(rule.replace).length-1,rule.count)}
const profilePins=JSON.parse(await readFile(new URL('docs/integration/proposed/aux-profile-context-identity/inputs.json',root),'utf8'));
let profileContextOccurrences=0;
for(const input of profilePins.inputs){const text=input.component==='daemon'?code:agentTexts.get(input.path);assert.equal(text.split(input.find).length-1,0);assert.equal(text.split(input.replace).length-1,input.count);profileContextOccurrences+=input.count}
assert.equal(profileContextOccurrences,24);
assert.ok(code.includes('Cn.agents.includes(`aux-code`)'));assert.ok(!code.includes('aside-code skill or CLI'));
assert.ok(code.includes('/aside[- ]?daemon/i.test(Cn)')); // Recovery edit deliberately inactive.
const originalAgent=new URL('out/provided-source-snapshot-1.26.1016.1852/agent/',root);
const manifestText=await readFile(new URL('manifest.json',agent),'utf8'),manifestOriginal=await readFile(new URL('manifest.json',originalAgent),'utf8');
assert.equal(JSON.parse(manifestText).version,'1.26.1016.1862');
const originOptions={enableCloud:true,profile:'development'};
const callers=[];
for(const path of ['background.js','assets/strip-markdown-DRcmtuJc.js']){
 const text=await readFile(new URL(path,agent),'utf8');new SourceTextModule(text);
 callers.push({path,text,original:await readFile(new URL(path,originalAgent),'utf8')});
}
const originPairing=assertAuxUiOriginPairing({manifestText,manifestOriginal,callers},originOptions);
const predecessor=new URL('out/provided-candidate-aux-runtime-envelope/Aux.app/Contents/Resources/aux/apps/extension/dist/',root);
for(const path of ['assets/chat-wBzshK0k.js','assets/artifact-test-CdjpLuI1.js','assets/add-on-credits-dialog-Dn5FxOyZ.js']){
 const original=await readFile(new URL(path,originalAgent),'utf8');let expected=await readFile(new URL(path,predecessor),'utf8');
 for(const apply of [applyAuxUiOriginIdentity,applyAuxBillingReturnFallback])expected=apply({component:'agent',path,text:expected,original},originOptions).text;
 const actual=await readFile(new URL(path,agent),'utf8');assert.equal(actual,expected,path+' exact output');new SourceTextModule(actual);
}
const billingText=await readFile(new URL('assets/add-on-credits-dialog-Dn5FxOyZ.js',agent),'utf8');
assert.ok(billingText.includes('if(typeof window>"u")return"https://dev-cloud.getaux.co/account";'));
const stageUi=JSON.parse(await readFile(new URL('out/provided-reuse-aux-cli-admission/ui/manifest.json',root),'utf8')).components.agent;
const manifestPin=stageUi.files.find(file=>file.path==='manifest.json'),revisionAnchor=manifestPin.anchors.at(-1);
assert.equal(createHash('sha256').update(manifestText).digest('hex'),manifestPin.outputSha256);
assert.equal(manifestText.split(revisionAnchor.replace).length-1,1);
const fingerprintFiles=stageUi.files.map(file=>[file.path,file.path==='manifest.json'?createHash('sha256').update(manifestText.replace(revisionAnchor.replace,revisionAnchor.find)).digest('hex'):file.outputSha256]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
const agentFingerprint=createHash('sha256').update(JSON.stringify(fingerprintFiles)).digest('hex');
assert.equal(agentFingerprint,'ea3bd2d5ba0f592015c673c9c74db3c52f3374614a6caf2edc703b8bf2a2c78e');
assert.deepEqual(stageUi.originPairing,originPairing);
const bundle=JSON.parse(await readFile(new URL('bundle.json',resources),'utf8'));
assert.throws(()=>assertAuxLaunchIdentity(bundle),/unaccepted migration candidate/);
const boundaryRaw=await readFile(new URL('out/provided-native-cli-admission/native-build-receipt.json',root));
const boundary=JSON.parse(boundaryRaw);
assert.equal(createHash('sha256').update(boundaryRaw).digest('hex'),receipt.boundaryReceiptSha256);
assert.equal(boundary.cliAdmissionFixturePassed,true);
const wrapperPath=new URL('apps/cli/Aux CLI.app/Contents/MacOS/aux-cli',resources);
const wrapper=await readFile(wrapperPath);
assert.equal(createHash('sha256').update(wrapper).digest('hex'),boundary.outputs.find(item=>item.path.endsWith('/aux-cli-launcher')).sha256);
const temporary=await mkdtemp(join(tmpdir(),'aux-cli-packaged-refusal-'));
let wrapperRefusal;
try {
 const home=join(temporary,'uncreated-home'),auxHome=join(temporary,'uncreated-aux-home');
 const markerPath=new URL('bundle.json',resources),before=await readFile(markerPath);
 const result=spawnSync(decodeURIComponent(wrapperPath.pathname),['--native-diagnostic'],{env:{PATH:'/usr/bin:/bin',HOME:home,AUX_HOME:auxHome,TMPDIR:temporary,AUX_ENABLE_PROVIDED_NATIVE_CARRIER:'1'},encoding:'utf8',timeout:10000,maxBuffer:65536});
 assert.equal(result.error,undefined);assert.equal(result.signal,null);assert.equal(result.status,1);
 assert.equal(result.stdout,'');assert.equal(result.stderr,'Aux packaged state identity is unsupported or unaccepted\n');
 for(const path of [home,auxHome])await assert.rejects(lstat(path),error=>error.code==='ENOENT');
 assert.deepEqual(await readFile(markerPath),before);
 assert.deepEqual(await readFile(wrapperPath),wrapper);
 wrapperRefusal={actualPackagedWrapperExecuted:true,exitCode:result.status,exactPreHomeDiagnostic:true,homeCreated:false,auxHomeCreated:false,markerUnchanged:true,seaExecuted:false,browserLaunched:false,keychainOperationInvoked:false,existingCarrierOptInCannotBypassMarker:true};
} finally {await rm(temporary,{recursive:true,force:true})}
const sha=value=>createHash('sha256').update(value).digest('hex');
const evidence={version:1,app:decodeURIComponent(app.pathname).replace(/\/$/,''),packageSha256:sha(packageBytes),identityProfile:receipt.identityProfile,stateIdentityVersion:2,visual,visualMatchesPreviousCandidate:true,privateDaemonRules:privatePins.rules.length,agentRevision:10,agentFingerprint,originPairing,billingFallbackPaired:true,coldEntryQuarantineChecked:true,coldEntryStaticImports,generatedAssetImportDeferred:true,cliWrapperPreSeaStateAccessVerified:true,wrapperRefusal,boundaryReceiptSha256:createHash('sha256').update(boundaryRaw).digest('hex'),capturePaired:true,selectionPaired:true,profileContextOccurrences,generatedDaemonEntryPaired:true,ephemeralRuntimeRules:ephemeralPins.rules.length,ephemeralRuntimeOccurrences:ephemeralPins.rules.reduce((n,r)=>n+r.count,0),behaviorOnlyCorrections:true,recoveryMatcherActivated:false,daemonCodeSha256:sha(code),packagedModulesParsed:12,nativeFrameworkSha256,nativeDiagnosticLiteralsPresent:true,nativeStartupPredicateFixturePassed:true,nativeQuiesceFixturePassed:true,nativeQuiesceScope:lifecycle.scope,ownedDirectDaemonLifecycleCases:lifecycle.passedCases.length,allWritersVerified:false,applicationCodeExecuted:true,startupRefused:true,launched:false,signed:false,runtimeAcceptance:false,acceptedAppReplaced:false};
await writeFile(new URL('out/aux-cli-admission-packaged-evidence.json',root),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({preserved:visual.preserved,visualMatchesPreviousCandidate:true,visualFiles:visual.actualFiles,cssFiles:visual.cssFiles,packagedModulesParsed:12,nativeFrameworkMatchesReceipt:true,nativeStartupPredicateFixturePassed:true,coldEntryQuarantineChecked:true,originPairing:originPairing.mode,billingFallbackPaired:true,packagedWrapperPreHomeRefusal:true,startupRefused:true,runtimeAcceptance:false}));
