# Static source evidence capture only; never invokes checkout tools or runtime.
import pathlib,json,hashlib
root=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
spec={
'chrome/app/chrome_main_delegate.cc':['PackagedIdentityAllowsStartup()','AcquireProcessSingleton(','NotifyOtherProcessOrCreate()'],
'chrome/app/aux_packaged_state_identity.h':['PackagedIdentityAllowsStartup'],
'chrome/browser/chrome_browser_main.cc':['PreMainMessageLoopRunImpl()','CreateInitialProfile('],
'chrome/browser/profiles/profile_manager.cc':['void ProfileManager::CreateProfileAsync(','ProfileManager::CreateProfileHelper(','ProfileManager::CreateProfileAsyncHelper(','void ProfileManager::UnloadProfile(','There could still be pending tasks that write to','void ProfileManager::ShutdownSessionServices()'],
'chrome/browser/profiles/profile_impl.cc':['ProfileImpl::~ProfileImpl()','PerformInterlockedTwoPhaseShutdown(','ShutdownStoragePartitions();','ProfileImpl::GetOffTheRecordProfile('],
'chrome/browser/profiles/profile_destroyer.cc':['void ProfileDestroyer::Start(','void ProfileDestroyer::RenderProcessHostDestroyed(','void ProfileDestroyer::Timeout()'],
'chrome/browser/ui/aux_profile_switch_session_rebuild.cc':['void ProfileSwitchSessionRebuild::Schedule(','void ProfileSwitchSessionRebuild::FlushPendingBeforeClose()','PostDelayedTask('],
'chrome/browser/aux/browser_platform.cc':['void BrowserPlatform::QuiesceDirectDaemonForMigration(','CloseInstallationCarrierAdmission();'],
'chrome/browser/aux/daemon_supervisor.cc':['void DaemonSupervisor::QuiesceDirectDaemonForMigration(','launch_admission_->open = false;'],
'chrome/browser/aux/installation_carrier_custody.h':['struct Snapshot {','size_t active_calls;','size_t unresolved_children;','void ObservedChildExit();'],
'chrome/browser/aux/installation_auth.cc':['void internal::WaitForInstallationCarrierExit(','InspectInstallationCarrierCustody()'],
'content/browser/renderer_host/render_process_host_impl.cc':['bool RenderProcessHostImpl::Init()','if (IsInitializedAndNotDead())','std::make_unique<ChildProcessLauncher>','void RenderProcessHostImpl::ProcessDied('],
'content/browser/site_instance_impl.cc':['RenderProcessHost* SiteInstanceImpl::GetOrCreateProcess(','return site_instance_group_->process();'],
'extensions/browser/service_worker/service_worker_task_queue.cc':['void ServiceWorkerTaskQueue::MaybeStartWorker(','void ServiceWorkerTaskQueue::RetryStartWorker('],
'content/browser/browser_context_impl.cc':['void BrowserContextImpl::NotifyWillBeDestroyed()','void BrowserContextImpl::ShutdownStoragePartitions()'],
'content/browser/storage_partition_impl.cc':['void StoragePartitionImpl::OnBrowserContextWillBeDestroyed()','StoragePartitionImpl::~StoragePartitionImpl()','void StoragePartitionImpl::Flush()'],
'content/browser/dom_storage/dom_storage_context_wrapper.cc':['void DOMStorageContextWrapper::Shutdown()','void DOMStorageContextWrapper::Flush()'],
'content/browser/indexed_db/indexed_db_context_impl.cc':['void IndexedDBContextImpl::Shutdown(','void IndexedDBContextImpl::ShutdownOnIDBSequence(','ForceClose(bucket_locator, /*delete_bucket_data=*/true'],
'content/browser/indexed_db/indexed_db_context_impl.h':['bool delete_bucket_data,','base::OnceClosure callback);'],
'components/prefs/persistent_pref_store.h':['virtual void CommitPendingWrite(']}
records=[]
for relative,anchors in spec.items():
 file=root/relative;data=file.read_bytes();text=data.decode();entries=[]
 for anchor in anchors:
  count=text.count(anchor);assert count,(relative,anchor)
  entries.append({'anchor':anchor,'count':count,'firstLine':text[:text.index(anchor)].count('\n')+1})
 assert file.read_bytes()==data,relative
 records.append({'path':relative,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'anchors':entries})
base=pathlib.Path(__file__).resolve().parent
(base/'source-map.json').write_text(json.dumps({'format':'aux.native.applied.writer-boundary-map.v1','sourceRoot':str(root),'sourceFiles':records,'actualCheckoutReadOnly':True,'nativeBuildRun':False,'allWriterCustodyClaimed':False,'ownerDataOrProcessesInspected':False},indent=2)+'\n')
print(f'Captured {len(records)} static source files only')
