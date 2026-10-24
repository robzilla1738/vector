/** Exact native API/source contract check. Does not compile or execute Chromium. */
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const here=new URL('./',import.meta.url),native='/private/tmp/aux-chromium-recovery-snapshot-20261023/src/';
const sha=value=>createHash('sha256').update(value).digest('hex');
const header='chrome/browser/aux/ui_storage_migration_worker.h',unit='chrome/browser/aux/ui_storage_migration_worker.cc';
const h=await readFile(new URL('source/'+header,here),'utf8'),cc=await readFile(new URL('source/'+unit,here),'utf8');
const apis=[
 ['extensions/browser/extension_function.h',['const std::optional<extensions::WorkerId>& worker_id() const','bool is_from_service_worker() const','int source_process_id() const','content::BrowserContext* browser_context() const']],
 ['extensions/browser/extension_function_dispatcher.cc',['function->set_worker_id(std::move(worker_id));','if (!ProcessManager::Get(browser_context_)->HasServiceWorker(worker_id))']],
 ['extensions/browser/service_worker/service_worker_host.cc',['void ServiceWorkerHost::RequestWorker(','render_process_host_->GetID().GetUnsafeValue()']],
 ['extensions/browser/service_worker/worker_id.h',['std::optional<blink::ServiceWorkerToken> start_token;']],
 ['extensions/browser/service_worker/worker_id.cc',['bool WorkerId::operator==(const WorkerId& other) const']],
 ['extensions/browser/process_manager.h',['bool HasServiceWorker(const WorkerId& worker_id) const;','base::Uuid GetContextIdForWorker(const WorkerId& worker_id) const;']],
 ['extensions/browser/process_manager.cc',['service_worker_context->StartingExternalRequest(service_worker_version_id,','std::vector<WorkerId> ProcessManager::GetServiceWorkersForExtension(']],
 ['extensions/browser/extension_util.h',['content::StoragePartition* GetStoragePartitionForExtensionId(']],
 ['extensions/browser/event_router.h',['std::optional<DispatchTarget> restrict_to_dispatch_target;','using DidDispatchCallback = base::RepeatingCallback<void(const EventTarget&)>;','CannotDispatchCallback cannot_dispatch_callback;']],
 ['extensions/browser/events/event_dispatch_helper.cc',['listener->process()->GetID() == target.render_process_id','listener->worker_thread_id() == target.worker_thread_id']],
 ['content/public/browser/service_worker_context.h',['virtual ServiceWorkerExternalRequestResult StartingExternalRequest(','virtual ServiceWorkerExternalRequestResult FinishedExternalRequest(','GetRunningServiceWorkerInfos() = 0;']],
 ['content/public/browser/service_worker_context_observer.h',['virtual void OnVersionStoppingRunning(int64_t version_id)','virtual void OnDestruct(ServiceWorkerContext* context)']],
 ['content/public/browser/service_worker_running_info.h',['blink::ServiceWorkerToken token;','blink::StorageKey key;','ServiceWorkerVersionStatus version_status;']],
 ['content/public/browser/service_worker_external_request_timeout_type.h',['kDoesNotTimeout,']],
 ['content/public/browser/service_worker_external_request_result.h',['kOk = 0,']],
 ['content/public/browser/render_process_host.h',['virtual StoragePartition* GetStoragePartition() = 0;','virtual bool IsInitializedAndNotDead() = 0;']],
 ['extensions/common/manifest_handlers/background_info.h',['static const GURL& GetBackgroundServiceWorkerScriptURL(']],
 ['extensions/browser/process_manager_observer.h',['virtual void OnStartedTrackingServiceWorkerInstance(','virtual void OnProcessManagerShutdown(']],
 ['extensions/browser/extension_registry_observer.h',['virtual void OnExtensionUnloaded(','virtual void OnShutdown(']],
 ['chrome/browser/aux/component_bootstrap.h',['inline constexpr char kAgentExtensionId[] = "gokkffaiccpmoeodpmeamcjajcagjmkm";']]
];
const dependencies=[];
for(const [path,anchors] of apis){const text=await readFile(native+path,'utf8');const counted=anchors.map(find=>{const count=text.split(find).length-1;assert.equal(count,1,path+':'+find);return{find,count}});dependencies.push({path,inputSha256:sha(text),countedAnchors:counted})}
const sourceChecks=[
 'return left == right && left.start_token && right.start_token &&',
 'left.start_token == right.start_token;',
 'manager->GetContextIdForWorker(workers.front()) != context_id_',
 'found->second.key == blink::StorageKey::CreateFirstParty(extension.origin())',
 'external_held_ = context_->StartingExternalRequest(',
 'keepalive_id_) == ExternalResult::kOk;',
 'context_->FinishedExternalRequest(worker_.version_id, keepalive_id_) != ExternalResult::kOk',
 'event->restrict_to_dispatch_target = extensions::Event::DispatchTarget{',
 '!sender.is_from_service_worker() || sender.render_frame_host()',
 'return *sender.worker_id() == worker_;',
 'operation != Name(found->second.operation)',
 'Text(report, "requestId", prepare_request_)',
 'report.FindBool("noLeaseCreated") == true && report.FindInt("deferredCount") == 0',
 'settled_result_ = result.Clone();',
 'superseded.Set("requestId", iterator->first).Set("transportSuperseded", true);'
];
const countedSource=sourceChecks.map(find=>{const count=cc.split(find).length-1;assert(count>=1,find);return{find,count}});
for(const forbidden of ['ExecuteScriptForTest','ExecuteJavaScriptForTests','PostDelayedTask','OneShotTimer','GetAllWorkersIdsForTesting'])assert.equal(cc.includes(forbidden),false,forbidden);
for(const name of ['BeginUiStorageMigrationWorker','ReadUiStorageMigrationWorker','ValidateUiStorageMigrationWorker','ReleaseUiStorageMigrationWorker','IsUiStorageMigrationWorkerPending','HasValidUiStorageMigrationWorkerLease','AcceptUiStorageMigrationWorkerReply']){assert.equal(h.split(name+'(').length-1,1);assert.equal(cc.split(name+'(').length-1,1)}
const files=[];for(const path of [header,unit]){let exists=true;try{await access(native+path)}catch{exists=false}assert.equal(exists,false,'Root owns projection; initial native target must be absent');const output=new URL('source/'+path,here);files.push({path,operation:'create',inputSha256:null,expectedNativeTargetAbsent:true,source:output.pathname,outputSha256:sha(await readFile(output))})}
const worker=JSON.parse(await readFile(new URL('../ui-background-writer-closure-a1/integration-request.json',here),'utf8'));
const receipt={format:'aux.ui-worker-native-control.source-contract.actual.v1',passed:true,files,dependencies,countedSource,
 workerProducerOutputSha256:worker.outputSha256,workerProducerProtocolSha256:worker.protocolSha256,
 actualApiSignaturesAndTargetDispatchSemanticsRead:true,workerIdTokenEqualityAndUncheckedWrapperDifferenceRecorded:true,
 sourceOnly:true,nativeCompiled:false,nativeExecuted:false,productExecuted:false,completeWriterCoverage:false,runtimeAccepted:false};
await writeFile(new URL('source-plan.json',here),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({passed:true,files:files.length,nativeDependencies:dependencies.length,sourceOnly:true,nativeCompiled:false}));
