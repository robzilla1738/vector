// Actual Node 26.5/NAPI8 host leaf. Included inside the real host anonymous
// namespace after BrokerOwner; all background checks avoid V8/CurrentWorker.
struct RuntimePublicationWork {
  BrokerOwner captured;
  napi_env env=nullptr;
  napi_deferred deferred=nullptr;
  napi_async_work async=nullptr;
  napi_async_cleanup_hook_handle cleanup=nullptr;
  std::atomic<bool> cancelled{false};
  bool cleanup_started=false, counted=false; // originating loop only
  uint64_t transport_generation=0;
  dev_t task_device=0;ino_t task_inode=0;
  aux_runtime_publication::Outcome result;
  std::unique_ptr<aux_runtime_publication::Lease> lease;
  bool action_started=false;
  ~RuntimePublicationWork(){
    if(counted&&getpid()==kHostProcess){std::lock_guard<std::mutex> lock(captured.worker->mutex);--captured.worker->broker_pending;}
  }
  bool CanContinue() const {
    if(getpid()!=kHostProcess||cancelled.load(std::memory_order_acquire)||!captured.owner||!captured.worker)return false;
    std::lock_guard<std::mutex> lock(captured.worker->mutex);const auto& w=*captured.worker;
    return w.process==kHostProcess&&!w.terminal&&!w.initializing&&!w.environment_detached&&!w.broker_closed&&w.owner==captured.owner;
  }
  bool NativeCurrent() const {
    if(getpid()!=kHostProcess||cancelled.load(std::memory_order_acquire)||
       !captured.owner||!captured.worker||AuxNativeContextValidateCurrentAuthority(captured.owner->handle)!=0)return false;
    std::lock_guard<std::mutex> lock(captured.worker->mutex);const auto& w=*captured.worker;
    return w.process==kHostProcess&&!w.terminal&&!w.initializing&&!w.environment_detached&&!w.broker_closed&&w.owner==captured.owner;
  }
  bool SameTaskRoot() const {
    if(!NativeCurrent())return false;
    int32_t control=-1,task=-1;uint64_t generation=0;
    const int status=AuxNativeContextCopyStorageRoots(captured.owner->handle,&generation,&control,&task);
    aux_runtime_cache::Fd c(control),t(task==control?-1:task);struct stat identity{};
    return status==0&&task>=0&&control>=0&&task!=control&&generation==transport_generation&&
      fstat(task,&identity)==0&&identity.st_dev==task_device&&identity.st_ino==task_inode&&NativeCurrent();
  }
};

// This helper receives only the native record constructed on the authenticated
// JS callback. It never derives a global/current V8 environment in the pool.
void RuntimePublicationAction(void* data,int32_t task,int32_t distribution,uint64_t generation) {
  auto* work=static_cast<RuntimePublicationWork*>(data);
  using namespace aux_runtime_publication;
  work->action_started=true;
  try {
    struct stat identity{}, source{};std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> task_path{};
    if(generation!=work->transport_generation||!ReadExecRoot(task,task_path.data(),&identity)||
       identity.st_dev!=work->task_device||identity.st_ino!=work->task_inode||
       fstat(distribution,&source)||!S_ISDIR(source.st_mode)||!aux_runtime_cache::Private(source)||
       (source.st_dev==identity.st_dev&&source.st_ino==identity.st_ino)||!work->CanContinue())return;
    work->lease=std::make_unique<Lease>();
    // This callback runs under the real dispatcher Entry/action. Calling the
    // dispatcher recursively here would deadlock/refuse; cancellation checks
    // inspect only the retained native Worker. Fresh guards bracket the action.
    const auto current=[work](){return work->CanContinue();};
    if(!work->lease->Acquire(task,current))return;
    const auto admitted_commit=[work](const std::function<void()>& action) {
      // Close/cancel uses this same native mutex. Final local admission and the
      // sole publication syscall are one ordered boundary, not a bool recheck.
      std::lock_guard<std::mutex> lock(work->captured.worker->mutex);const auto& w=*work->captured.worker;
      if(work->cancelled.load(std::memory_order_acquire)||w.terminal||w.broker_closed||
         w.initializing||w.environment_detached||w.owner!=work->captured.owner)return false;
      action();return true;
    };
    PopulateAndPublish(*work->lease,distribution,std::string(task_path.data())+"/runtime",current,admitted_commit,work->result);
  }catch(...){work->result.status=(work->result.renamed||(work->lease&&work->lease->commit_uncertain))?Status::kUnknown:Status::kRefused;}
  // Own-stage cleanup is allowed after admission closes, but only before any
  // successful rename and under the still-held native exclusive lease.
  if(work->lease&&!work->lease->renamed){
    try {if(!Cleanup(*work->lease)){work->result.cleanup_unknown=true;work->result.status=Status::kUnknown;}}
    catch(...){work->result.cleanup_unknown=true;work->result.status=Status::kUnknown;}
  }
}
void ExecuteRuntimePublication(napi_env,void* data) {
  auto* work=static_cast<RuntimePublicationWork*>(data);
  using aux_runtime_publication::Status;
  try {
    if(!work->SameTaskRoot()){work->result.status=Status::kCancelled;return;}
    const int status=AuxNativeContextWithRuntimePublication(work->captured.owner->handle,
      work->transport_generation,RuntimePublicationAction,work);
    if(status!=0&&work->action_started){
      // The real dispatcher postguard may fail after RENAME_EXCL committed.
      // Never report failure-before-write or attempt cleanup/rollback then.
      work->result.status=(work->result.renamed||(work->lease&&work->lease->commit_uncertain))?Status::kUnknown:Status::kRefused;
      if(work->result.cleanup_unknown)work->result.status=Status::kUnknown;
    }else if(!work->CanContinue()||(work->result.renamed&&(!work->lease||!work->lease->SamePublished()))){
      work->result.status=(work->result.renamed||(work->lease&&work->lease->commit_uncertain))?Status::kUnknown:Status::kCancelled;
    }
  }catch(...){work->result.status=(work->result.renamed||(work->lease&&work->lease->commit_uncertain))?Status::kUnknown:Status::kRefused;}
  // Publish native outcome while still holding coordination, including unknown
  // completion. No JavaScript observation or Promise settlement releases it.
  if(work->result.status==Status::kUnknown||work->result.cleanup_unknown){
    std::lock_guard<std::mutex> lock(work->captured.worker->mutex);work->captured.worker->broker_untracked=true;
  }
  work->lease.reset(); // All synchronous copies, fsyncs and cleanup have ended.
}
void CleanupRuntimePublication(napi_async_cleanup_hook_handle,void* data) {
  auto* work=static_cast<RuntimePublicationWork*>(data);
  if(getpid()!=kHostProcess)return;
  work->cleanup_started=true;
  {std::lock_guard<std::mutex> lock(work->captured.worker->mutex);work->cancelled.store(true,std::memory_order_release);}
  // A running publisher is not cancelled by uv_cancel. In every case the actual
  // completion callback must run before pending/cleanup ownership can settle.
  if(work->async)napi_cancel_async_work(work->env,work->async);
}
const char* RuntimePublicationStatus(aux_runtime_publication::Status status){
  using aux_runtime_publication::Status;
  switch(status){
    case Status::kPublished:return "published";
    case Status::kRetained:return "retained";
    case Status::kCancelled:return "cancelled";
    case Status::kRefused:return "refused";
    case Status::kUnknown:return "unknown";
  }return "unknown";
}
void CompleteRuntimePublication(napi_env env,napi_status status,void* data) {
  if(getpid()!=kHostProcess)return;
  std::unique_ptr<RuntimePublicationWork> work(static_cast<RuntimePublicationWork*>(data));
  auto worker=work->captured.worker;
  try {
    bool bound=false;
    if(env&&!work->cleanup_started&&status==napi_ok&&work->SameTaskRoot()&&
       SameRuntimeEnvironment(env,worker->environment,worker->isolate)){
      std::lock_guard<std::mutex> lock(worker->mutex);
      bound=CurrentWorker(*worker)&&!worker->terminal&&!worker->environment_detached&&worker->owner==work->captured.owner;
    }
    if(env&&!work->cleanup_started){
      if(!bound){
        napi_value message,error;
        if(napi_create_string_utf8(env,"Runtime publication owner changed or work was cancelled",NAPI_AUTO_LENGTH,&message)==napi_ok&&
           napi_create_error(env,nullptr,message,&error)==napi_ok)napi_reject_deferred(env,work->deferred,error);
      }else{
        napi_value output,format,kind,owner,transport,renamed,relocated;
        const auto own=std::to_string(worker->generation),generation=std::to_string(work->transport_generation);
        const auto& r=work->result;
        bool ok=napi_create_object(env,&output)==napi_ok&&
          napi_create_string_utf8(env,"aux.runtime-publication.v1",NAPI_AUTO_LENGTH,&format)==napi_ok&&
          napi_create_string_utf8(env,RuntimePublicationStatus(r.status),NAPI_AUTO_LENGTH,&kind)==napi_ok&&
          napi_create_string_utf8(env,own.c_str(),NAPI_AUTO_LENGTH,&owner)==napi_ok&&
          napi_create_string_utf8(env,generation.c_str(),NAPI_AUTO_LENGTH,&transport)==napi_ok&&
          napi_get_boolean(env,r.renamed,&renamed)==napi_ok&&
          napi_create_double(env,r.relocated,&relocated)==napi_ok;
        if(ok){
          const napi_property_descriptor fields[]={
            {"format",nullptr,nullptr,nullptr,nullptr,format,napi_enumerable,nullptr},
            {"status",nullptr,nullptr,nullptr,nullptr,kind,napi_enumerable,nullptr},
            {"ownerGeneration",nullptr,nullptr,nullptr,nullptr,owner,napi_enumerable,nullptr},
            {"transportGeneration",nullptr,nullptr,nullptr,nullptr,transport,napi_enumerable,nullptr},
            {"renamed",nullptr,nullptr,nullptr,nullptr,renamed,napi_enumerable,nullptr},
            {"relocatedTextFiles",nullptr,nullptr,nullptr,nullptr,relocated,napi_enumerable,nullptr}};
          ok=napi_define_properties(env,output,std::size(fields),fields)==napi_ok&&napi_object_freeze(env,output)==napi_ok;
        }
        if(ok)napi_resolve_deferred(env,work->deferred,output);
        else {napi_value message,error;if(napi_create_string_utf8(env,"Runtime publication result unavailable",NAPI_AUTO_LENGTH,&message)==napi_ok&&napi_create_error(env,nullptr,message,&error)==napi_ok)napi_reject_deferred(env,work->deferred,error);}
      }
    }
  }catch(...){
    if(env&&!work->cleanup_started){napi_value message,error;if(napi_create_string_utf8(env,"Runtime publication failed",NAPI_AUTO_LENGTH,&message)==napi_ok&&napi_create_error(env,nullptr,message,&error)==napi_ok)napi_reject_deferred(env,work->deferred,error);}
  }
  // The async cleanup hook retains the real NAPI environment until the actual
  // completion. Delete work before releasing its hook; then settle the native
  // pending record only after actual native reply/cleanup bookkeeping is complete.
  if(work->async){napi_delete_async_work(work->env,work->async);work->async=nullptr;}
  if(work->cleanup){auto hook=work->cleanup;work->cleanup=nullptr;napi_remove_async_cleanup_hook(hook);}
  work.reset();
  bool terminal=false;{std::lock_guard<std::mutex> lock(worker->mutex);terminal=worker->terminal;}
  if(terminal)worker->Close();
  DetachCompletedEnvironment(worker);
}

napi_value SeedBundledRuntime(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  std::unique_ptr<RuntimePublicationWork> work;
  auto refuse=[&](){
    if(work){if(work->async)napi_delete_async_work(env,work->async);if(work->cleanup)napi_remove_async_cleanup_hook(work->cleanup);}
    BrokerThrow(env,"AUX_RUNTIME_PUBLICATION_UNAVAILABLE","Authenticated runtime publication unavailable");return static_cast<napi_value>(nullptr);
  };
  try {
    if(!BrokerZeroArgs(env,info))return refuse();
    work=std::make_unique<RuntimePublicationWork>();work->captured=CaptureBrokerOwner(env);work->env=env;
    if(!work->captured.owner)return refuse();
    {
      std::lock_guard<std::mutex> lock(work->captured.worker->mutex);auto& w=*work->captured.worker;
      if(CurrentWorker(w)&&!w.terminal&&!w.initializing&&!w.environment_detached&&!w.broker_closed&&w.owner==work->captured.owner&&w.broker_pending!=std::numeric_limits<size_t>::max()){
        ++w.broker_pending;work->counted=true;
      }
    }
    if(!work->counted)return refuse();
    int32_t control=-1,task=-1;uint64_t generation=0;
    const int copied=AuxNativeContextCopyStorageRoots(work->captured.owner->handle,&generation,&control,&task);
    aux_runtime_cache::Fd c(control),t(task==control?-1:task);struct stat identity{};
    if(copied!=0||!generation||control<0||task<0||task==control||fstat(task,&identity)!=0||!work->NativeCurrent())return refuse();
    work->transport_generation=generation;work->task_device=identity.st_dev;work->task_inode=identity.st_ino;
    napi_value promise,name;
    if(napi_create_promise(env,&work->deferred,&promise)!=napi_ok||
       napi_create_string_utf8(env,"AuxRuntimePublication",NAPI_AUTO_LENGTH,&name)!=napi_ok||
       napi_create_async_work(env,nullptr,name,ExecuteRuntimePublication,CompleteRuntimePublication,work.get(),&work->async)!=napi_ok||
       napi_add_async_cleanup_hook(env,CleanupRuntimePublication,work.get(),&work->cleanup)!=napi_ok)return refuse();
    if(!work->SameTaskRoot()||napi_queue_async_work(env,work->async)!=napi_ok)return refuse();
    work.release();return promise;
  }catch(...){return refuse();}
}
