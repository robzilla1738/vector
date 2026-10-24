// Actual Node 26.5/NAPI8 host leaf. Included inside the real host anonymous
// namespace after BrokerOwner; all background checks avoid V8/CurrentWorker.
struct RuntimeCacheInspectionWork {
  BrokerOwner captured;
  napi_env env=nullptr;
  napi_deferred deferred=nullptr;
  napi_async_work async=nullptr;
  napi_async_cleanup_hook_handle cleanup=nullptr;
  std::atomic<bool> cancelled{false};
  bool cleanup_started=false, counted=false; // originating loop only
  uint64_t transport_generation=0;
  dev_t task_device=0;ino_t task_inode=0;
  aux_runtime_cache::Result result;
  ~RuntimeCacheInspectionWork(){
    if(counted&&getpid()==kHostProcess){std::lock_guard<std::mutex> lock(captured.worker->mutex);--captured.worker->broker_pending;}
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
void ExecuteRuntimeCacheInspection(napi_env,void* data) {
  auto* work=static_cast<RuntimeCacheInspectionWork*>(data);
  using aux_runtime_cache::Fd;using aux_runtime_cache::Status;
  try {
    if(!work->SameTaskRoot()){work->result.status=Status::kCancelled;return;}
    int32_t control=-1,task=-1;uint64_t generation=0;
    const int copied=AuxNativeContextCopyStorageRoots(work->captured.owner->handle,&generation,&control,&task);
    Fd c(control),t(task==control?-1:task);struct stat identity{};
    std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> task_path{};
    if(copied!=0||task<0||control<0||task==control||generation!=work->transport_generation||
       !ReadExecRoot(task,task_path.data(),&identity)||identity.st_dev!=work->task_device||identity.st_ino!=work->task_inode||!work->NativeCurrent()){
      work->result.status=Status::kCancelled;return;
    }
    Fd runtime(openat(task,"runtime",aux_runtime_cache::kRead|O_DIRECTORY));
    if(runtime.fd<0){work->result.status=errno==ENOENT?Status::kIncomplete:Status::kUnsafe;return;}
    struct stat before{};if(fstat(runtime.fd,&before)!=0)return;
    work->result=aux_runtime_cache::Inspect(runtime.fd,std::string(task_path.data())+"/runtime",
      kAuxRuntimePins,std::size(kAuxRuntimePins),kAuxRuntimeSourceVersion,[work](){return work->NativeCurrent();});
    struct stat named{};
    if(fstatat(task,"runtime",&named,AT_SYMLINK_NOFOLLOW)!=0||!S_ISDIR(named.st_mode)||
       named.st_dev!=before.st_dev||named.st_ino!=before.st_ino)work->result.status=Status::kUnsafe;
    if(!work->SameTaskRoot())work->result.status=Status::kCancelled;
  }catch(...){work->result.status=Status::kUnsafe;}
  // All reader FDs close before Node dispatches completion. Cancellation never
  // decrements pending or removes the async cleanup hook from this thread.
}
void CleanupRuntimeCacheInspection(napi_async_cleanup_hook_handle,void* data) {
  auto* work=static_cast<RuntimeCacheInspectionWork*>(data);
  if(getpid()!=kHostProcess)return;
  work->cleanup_started=true;work->cancelled.store(true,std::memory_order_release);
  // A running reader is not cancelled by uv_cancel. In every case the actual
  // completion callback must run before pending/cleanup ownership can settle.
  if(work->async)napi_cancel_async_work(work->env,work->async);
}
const char* RuntimeCacheInspectionStatus(aux_runtime_cache::Status status){
  using aux_runtime_cache::Status;
  switch(status){
    case Status::kMatchingSeed:return "matching-seed";
    case Status::kIncomplete:return "incomplete";
    case Status::kModifiedUnverified:return "unverified-modified";
    case Status::kNewerUnverified:return "unverified-newer";
    case Status::kOtherVersionUnverified:return "unverified-other-version";
    case Status::kCancelled:return "cancelled";
    case Status::kUnsafe:return "unsafe";
  }return "unsafe";
}
void CompleteRuntimeCacheInspection(napi_env env,napi_status status,void* data) {
  if(getpid()!=kHostProcess)return;
  std::unique_ptr<RuntimeCacheInspectionWork> work(static_cast<RuntimeCacheInspectionWork*>(data));
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
        if(napi_create_string_utf8(env,"Runtime inspection owner changed or reader was cancelled",NAPI_AUTO_LENGTH,&message)==napi_ok&&
           napi_create_error(env,nullptr,message,&error)==napi_ok)napi_reject_deferred(env,work->deferred,error);
      }else{
        napi_value output,format,authority,kind,owner,transport,checked,missing,modified,unsafe;
        const auto own=std::to_string(worker->generation),generation=std::to_string(work->transport_generation);
        const auto& r=work->result;
        bool ok=napi_create_object(env,&output)==napi_ok&&
          napi_create_string_utf8(env,"aux.runtime-cache-inspection.v1",NAPI_AUTO_LENGTH,&format)==napi_ok&&
          napi_create_string_utf8(env,"none",NAPI_AUTO_LENGTH,&authority)==napi_ok&&
          napi_create_string_utf8(env,RuntimeCacheInspectionStatus(r.status),NAPI_AUTO_LENGTH,&kind)==napi_ok&&
          napi_create_string_utf8(env,own.c_str(),NAPI_AUTO_LENGTH,&owner)==napi_ok&&
          napi_create_string_utf8(env,generation.c_str(),NAPI_AUTO_LENGTH,&transport)==napi_ok&&
          napi_create_double(env,r.checked,&checked)==napi_ok&&napi_create_double(env,r.missing,&missing)==napi_ok&&
          napi_create_double(env,r.modified,&modified)==napi_ok&&napi_create_double(env,r.unsafe,&unsafe)==napi_ok;
        if(ok){
          const napi_property_descriptor fields[]={
            {"format",nullptr,nullptr,nullptr,nullptr,format,napi_enumerable,nullptr},
            {"authority",nullptr,nullptr,nullptr,nullptr,authority,napi_enumerable,nullptr},
            {"status",nullptr,nullptr,nullptr,nullptr,kind,napi_enumerable,nullptr},
            {"ownerGeneration",nullptr,nullptr,nullptr,nullptr,owner,napi_enumerable,nullptr},
            {"transportGeneration",nullptr,nullptr,nullptr,nullptr,transport,napi_enumerable,nullptr},
            {"checkedEntries",nullptr,nullptr,nullptr,nullptr,checked,napi_enumerable,nullptr},
            {"missing",nullptr,nullptr,nullptr,nullptr,missing,napi_enumerable,nullptr},
            {"modified",nullptr,nullptr,nullptr,nullptr,modified,napi_enumerable,nullptr},
            {"unsafe",nullptr,nullptr,nullptr,nullptr,unsafe,napi_enumerable,nullptr}};
          ok=napi_define_properties(env,output,std::size(fields),fields)==napi_ok&&napi_object_freeze(env,output)==napi_ok;
        }
        if(ok)napi_resolve_deferred(env,work->deferred,output);
        else {napi_value message,error;if(napi_create_string_utf8(env,"Runtime inspection result unavailable",NAPI_AUTO_LENGTH,&message)==napi_ok&&napi_create_error(env,nullptr,message,&error)==napi_ok)napi_reject_deferred(env,work->deferred,error);}
      }
    }
  }catch(...){
    if(env&&!work->cleanup_started){napi_value message,error;if(napi_create_string_utf8(env,"Runtime inspection failed",NAPI_AUTO_LENGTH,&message)==napi_ok&&napi_create_error(env,nullptr,message,&error)==napi_ok)napi_reject_deferred(env,work->deferred,error);}
  }
  // The async cleanup hook retains the real NAPI environment until the actual
  // completion. Delete work before releasing its hook; then settle the native
  // pending record only after reply/cleanup bookkeeping is complete.
  if(work->async){napi_delete_async_work(work->env,work->async);work->async=nullptr;}
  if(work->cleanup){auto hook=work->cleanup;work->cleanup=nullptr;napi_remove_async_cleanup_hook(hook);}
  work.reset();
  bool terminal=false;{std::lock_guard<std::mutex> lock(worker->mutex);terminal=worker->terminal;}
  if(terminal)worker->Close();
  DetachCompletedEnvironment(worker);
}

napi_value InspectRuntimeCache(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  std::unique_ptr<RuntimeCacheInspectionWork> work;
  auto refuse=[&](){
    if(work){if(work->async)napi_delete_async_work(env,work->async);if(work->cleanup)napi_remove_async_cleanup_hook(work->cleanup);}
    BrokerThrow(env,"AUX_RUNTIME_INSPECTION_UNAVAILABLE","Authenticated runtime inspection unavailable");return static_cast<napi_value>(nullptr);
  };
  try {
    if(!BrokerZeroArgs(env,info))return refuse();
    work=std::make_unique<RuntimeCacheInspectionWork>();work->captured=CaptureBrokerOwner(env);work->env=env;
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
       napi_create_string_utf8(env,"AuxRuntimeCacheInspection",NAPI_AUTO_LENGTH,&name)!=napi_ok||
       napi_create_async_work(env,nullptr,name,ExecuteRuntimeCacheInspection,CompleteRuntimeCacheInspection,work.get(),&work->async)!=napi_ok||
       napi_add_async_cleanup_hook(env,CleanupRuntimeCacheInspection,work.get(),&work->cleanup)!=napi_ok)return refuse();
    if(!work->SameTaskRoot()||napi_queue_async_work(env,work->async)!=napi_ok)return refuse();
    work.release();return promise;
  }catch(...){return refuse();}
}
