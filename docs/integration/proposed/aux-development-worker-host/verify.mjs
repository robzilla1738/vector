import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import path from 'node:path';import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../../../',import.meta.url)),here=fileURLToPath(new URL('.',import.meta.url));
const pins=JSON.parse(await readFile(path.join(here,'source-pins.json')));
for(const pin of pins.files){const bytes=await readFile(path.isAbsolute(pin.path)?pin.path:path.join(root,pin.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256,pin.path);}
const cc=await readFile(path.join(here,'source/AuxDevelopmentWorkerHost.cc'),'utf8');
const header=await readFile(path.join(here,'source/AuxDevelopmentWorkerHost.h'),'utf8');
const swift=await readFile(path.join(here,'source/AuxDevelopmentOwnerDrain.swift'),'utf8');
for(const text of [cc,header,swift]){assert(!text.toLowerCase().includes('aside'));assert(!text.includes('NAPI_MODULE'));assert(!text.includes('getenv('));assert(!text.includes('SecItem'));}
for(const required of ['node::GetCurrentEnvironment','node::GetCurrentEventLoop','napi_get_uv_event_loop','pthread_self()','napi_call_function','SameRuntimeEnvironment','AuxCreateSignedDevelopmentOwner','AuxNativeContextRetire','AuxCloseDevelopmentOwnerOSAdmission','DetachCompletedEnvironment','NextGeneration','Registry().retained.emplace(worker->generation','cleanup_completed','Registry().active.count(environment)'])assert(cc.includes(required),required);
assert(cc.indexOf('napi_add_env_cleanup_hook(env, Cleanup')<cc.indexOf('int32_t prepared = AuxCreateSignedDevelopmentOwner'));
assert(cc.includes('else if (os != 0) result = AuxDevelopmentWorkerDrain::pending'));
assert(cc.includes('if (initializing) result = AuxDevelopmentWorkerDrain::pending'));
assert(cc.includes('if (retiring) return AuxDevelopmentWorkerDrain::pending'));
assert(cc.includes('if (!owner && initializing) return AuxDevelopmentWorkerDrain::pending'));
for(const required of ['captured_pdf = pdf','worker->pdf = captured_pdf','pdf_close_requested','pdf_close_unresolved','worker->Close(true)','CaptureAfterAuthenticatedOwner','InspectIfClosureStarted'])assert(cc.includes(required),required);
assert(cc.indexOf('AuxLoadedPdfLifetime::CaptureAfterAuthenticatedOwner()')>cc.indexOf('int32_t prepared = AuxCreateSignedDevelopmentOwner'));
assert(cc.includes('!worker->pdf_close_unresolved && !worker->utility_close_unresolved) Registry().retained.erase'));
assert(cc.includes('if (!close_pdf && pdf_close_requested && result == AuxDevelopmentWorkerDrain::drained)'));
const unlock=cc.indexOf('host_lock.unlock();');
for(const operation of ['napi_add_env_cleanup_hook(env, Cleanup','int32_t prepared = AuxCreateSignedDevelopmentOwner','status = AuxAttachOwnedDispatcher'])assert(cc.indexOf(operation)>unlock,operation);
assert(cc.includes('Initialization initialization(worker)'));
assert(cc.includes('if (!worker->CanContinue()) return napi_closing;'));
assert(cc.includes('const bool closed = initialization.Complete(status == napi_ok)'));
assert(cc.includes('return status == napi_ok && closed ? napi_closing : status;'));
assert(swift.includes('closeOSAdmissionAndDrain(timeout:0)'));assert(swift.includes('case .notPresent,.drained:return 0'));assert(swift.includes('case .untracked:return 2'));
const evidence=JSON.parse(await readFile(path.join(here,'evidence/check.json')));
assert.equal(evidence.productionSourceCompiled,true);assert.equal(evidence.signedLoaderExecuted,false);assert.equal(evidence.actualSecurityCalls,0);assert(evidence.actualNodeLifecycleChecks>=23);assert.equal(evidence.state2Authorized,false);
const compiled=JSON.parse(await readFile(path.join(here,'evidence/compile-only.json')));
assert.equal(compiled.mode,'--compile-only');assert.equal(compiled.productionSourceCompiled,true);
assert.equal(compiled.actualTranslationUnits,compiled.swiftTranslationUnits+compiled.cppTranslationUnits);
assert.equal(compiled.lifecycleChecksRun,0);assert.equal(compiled.fixtureCompiled,false);assert.equal(compiled.historicalLifecycleEvidenceUpdated,false);
assert.equal(compiled.productionArtifactLoaded,false);assert.equal(compiled.actualSecurityCalls,0);assert.equal(compiled.state2Authorized,false);
console.log(`PASS ${pins.files.length} exact source pins; native callback/lifetime source and recorded bounded evidence`);
// Historical refusal successor evidence is distinct from this current compile and
// lifecycle receipts; source inventories authenticate what was compiled only.
const refusalBuild=JSON.parse(await readFile(path.join(here,'evidence/current-direct-attach-refusal-compile-only.json')));
assert.equal(refusalBuild.mode,'--compile-only');assert.equal(refusalBuild.productionSourceCompiled,true);
assert.equal(refusalBuild.swiftTranslationUnits,21);assert.equal(refusalBuild.cppTranslationUnits,5);
assert.equal(refusalBuild.actualTranslationUnits,26);assert.equal(refusalBuild.inputs.length,26);
assert.equal(createHash('sha256').update(await readFile(path.join(here,'evidence/current-direct-attach-refusal-compile-only.json'))).digest('hex'),pins.historicalReceipts['docs/integration/proposed/aux-development-worker-host/evidence/current-direct-attach-refusal-compile-only.json']);
// Historical source-pins hashes and inputs belong to that immutable old build.
assert.match(refusalBuild.sourcePinsSha256,/^[0-9a-f]{64}$/);assert.match(refusalBuild.hostSourcePinsSha256,/^[0-9a-f]{64}$/);
for(const input of refusalBuild.inputs)assert.match(input.sha256,/^[0-9a-f]{64}$/);
for(const [file,sha] of Object.entries(refusalBuild.historicalReceiptHashes))assert.equal(createHash('sha256').update(await readFile(path.join(root,file))).digest('hex'),sha,file);
for(const field of ['artifactRetained','fixtureCompiled','historicalEvidenceUpdated','productionArtifactLoaded','signedPolicyProducerExecuted','nativeAttachmentExecuted','signingPerformed','state2Authorized'])assert.equal(refusalBuild[field],false,field);
assert.equal(refusalBuild.actualSecurityCalls,0);assert.equal(refusalBuild.lifecycleChecksRun,0);assert.equal(refusalBuild.capturedPolicyChecksRun,0);
assert.equal(refusalBuild.architecture,'arm64');assert.equal(refusalBuild.minimumMacOS,'13.0');assert.equal(refusalBuild.terminalExitCode,0);
assert.equal(refusalBuild.attachObjectUndefinedImports,0);assert.equal(refusalBuild.retainedAttachABIExports,1);assert.equal(refusalBuild.compiledOldProductLiteralCount,0);
console.log('PASS: historical21-Swift/5-C++ refusal receipt authenticated; old inputs are not asserted equal to current source.');

// Strong pairing: BOTH image consumers must survive host/environment cleanup.
for(const token of ['worker->utility = captured_utility','utility_close_requested','utility_close_unresolved','captured_utility->InspectIfClosureStarted()','AuxLoadedUtilityLifetime::InspectRetainedClosures()'])assert(cc.includes(token),token);
assert(cc.indexOf('AuxLoadedUtilityLifetime::CaptureAfterAuthenticatedOwner()')>cc.indexOf('int32_t prepared = AuxCreateSignedDevelopmentOwner'));
assert(cc.includes('if (!close_utility && utility_close_requested && result == AuxDevelopmentWorkerDrain::drained)'));
const current=JSON.parse(await readFile(path.join(here,'evidence/current-utilities-atomic-v4-compile-only.json')));
assert.equal(current.productionSourceCompiled,true);assert.equal(current.mode,'--compile-only');assert.equal(current.swiftTranslationUnits,22);assert.equal(current.cppTranslationUnits,6);assert.equal(current.actualTranslationUnits,28);assert.equal(current.inputs.length,28);
assert.equal(current.sourcePinsSha256,createHash('sha256').update(await readFile(path.join(here,'source-pins.json'))).digest('hex'));
assert.equal(current.hostSourcePinsSha256,createHash('sha256').update(await readFile(path.join(root,'docs/integration/proposed/aux-development-host/source-pins.json'))).digest('hex'));
for(const input of current.inputs)assert.equal(createHash('sha256').update(await readFile(path.join(root,'docs/integration/proposed',input.path))).digest('hex'),input.sha256,input.path);
for(const [file,sha] of Object.entries(pins.historicalReceipts))assert.equal(createHash('sha256').update(await readFile(path.join(root,file))).digest('hex'),sha,file);
for(const field of ['productionArtifactLoaded','signedPolicyProducerExecuted','nativeAttachmentExecuted','signingPerformed','state2Authorized','historicalEvidenceUpdated','fixtureCompiled'])assert.equal(current[field],false,field);
assert.equal(current.actualSecurityCalls,0);assert.equal(current.actualOSOperations,0);assert.equal(current.lifecycleChecksRunByThisCheck,0);assert.equal(current.productionGraphRebuiltByThisCheck,false);
assert.equal(current.architecture,'arm64');assert.equal(current.minimumMacOS,'13.0');assert.equal(current.terminalExitCode,0);assert.equal(current.compiledOldProductLiteralCount,0);
console.log('PASS: current22-Swift/6-C++ v4/atomic/utility consumer compile receipt and all28 actual source inputs; no rebuild or protected execution.');
