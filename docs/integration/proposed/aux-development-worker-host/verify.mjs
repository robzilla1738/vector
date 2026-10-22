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
assert(cc.includes('if (!owner) return initializing ? AuxDevelopmentWorkerDrain::pending'));
const unlock=cc.indexOf('host_lock.unlock();');
for(const operation of ['napi_add_env_cleanup_hook(env, Cleanup','int32_t prepared = AuxCreateSignedDevelopmentOwner','status = AuxAttachOwnedDispatcher'])assert(cc.indexOf(operation)>unlock,operation);
assert(cc.includes('Initialization initialization(worker)'));
assert(cc.includes('if (!worker->CanContinue()) return napi_closing;'));
assert(cc.includes('const bool closed = initialization.Complete(status == napi_ok)'));
assert(cc.includes('return status == napi_ok && closed ? napi_closing : status;'));
assert(swift.includes('closeOSAdmissionAndDrain(timeout:0)'));assert(swift.includes('case .notPresent,.drained:return 0'));assert(swift.includes('case .untracked:return 2'));
const evidence=JSON.parse(await readFile(path.join(here,'evidence/check.json')));
assert.equal(evidence.productionSourceCompiled,true);assert.equal(evidence.signedLoaderExecuted,false);assert.equal(evidence.actualSecurityCalls,0);assert(evidence.actualNodeLifecycleChecks>=23);assert.equal(evidence.state2Authorized,false);
console.log(`PASS ${pins.files.length} exact source pins; native callback/lifetime source and recorded bounded evidence`);
