// Include after AuxBrokerWritesNapi.inc, AuxStorageRootsNapi.inc, inspection
// implementation and compiled pins, inside the actual host anonymous namespace.
// This is deliberately NOT registered as an NAPI method in this proposal.
aux_runtime_cache::Result InspectCurrentAuxRuntimeCache(BrokerOwner captured) {
  using aux_runtime_cache::Fd;
  using aux_runtime_cache::Result;
  using aux_runtime_cache::Status;
  Result refused;
  if(getpid()!=kHostProcess||!captured.owner||!captured.worker)return refused;
  struct Pending {
    BrokerOwner captured;
    bool counted=false;
    ~Pending(){if(counted){std::lock_guard<std::mutex> lock(captured.worker->mutex);--captured.worker->broker_pending;}}
  } pending{captured};
  {
    std::lock_guard<std::mutex> lock(captured.worker->mutex);
    auto& w=*captured.worker;
    if(!CurrentWorker(w)||w.terminal||w.initializing||w.environment_detached||w.broker_closed||
       w.owner!=captured.owner||w.broker_pending==std::numeric_limits<size_t>::max())return refused;
    ++w.broker_pending;pending.counted=true;
  }
  auto current=[&](){
    if(getpid()!=kHostProcess||AuxNativeContextValidateCurrentAuthority(captured.owner->handle)!=0)return false;
    std::lock_guard<std::mutex> lock(captured.worker->mutex);const auto& w=*captured.worker;
    return CurrentWorker(w)&&!w.terminal&&!w.initializing&&!w.environment_detached&&!w.broker_closed&&w.owner==captured.owner;
  };
  if(!current())return refused;
  uint64_t generation=0;int32_t control=-1,task=-1;
  const int status=AuxNativeContextCopyStorageRoots(captured.owner->handle,&generation,&control,&task);
  Fd control_fd(control),task_fd(task==control?-1:task);
  if(status!=0||!generation||control<0||task<0||control==task||!current())return refused;
  std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> task_path{};struct stat task_identity{};
  if(!ReadExecRoot(task,task_path.data(),&task_identity))return refused;
  Fd runtime(openat(task,"runtime",aux_runtime_cache::kRead|O_DIRECTORY));
  if(runtime.fd<0){refused.status=errno==ENOENT?Status::kIncomplete:Status::kUnsafe;return refused;}
  struct stat before{};if(fstat(runtime.fd,&before)!=0)return refused;
  // No file contents, paths, credentials, version label or executable bytes are
  // returned to JS. Only finite status and aggregate counts leave this helper.
  auto result=aux_runtime_cache::Inspect(runtime.fd,std::string(task_path.data())+"/runtime",
    kAuxRuntimePins,std::size(kAuxRuntimePins),kAuxRuntimeSourceVersion,current);
  struct stat named{};
  if(fstatat(task,"runtime",&named,AT_SYMLINK_NOFOLLOW)!=0||!S_ISDIR(named.st_mode)||
     named.st_dev!=before.st_dev||named.st_ino!=before.st_ino){result.status=Status::kUnsafe;return result;}
  uint64_t after_generation=0;int32_t after_control=-1,after_task=-1;
  const int after=AuxNativeContextCopyStorageRoots(captured.owner->handle,&after_generation,&after_control,&after_task);
  Fd final_control(after_control),final_task(after_task==after_control?-1:after_task);
  struct stat after_task_identity{};
  if(after!=0||after_generation!=generation||after_task<0||after_task==after_control||
     fstat(after_task,&after_task_identity)!=0||after_task_identity.st_dev!=task_identity.st_dev||
     after_task_identity.st_ino!=task_identity.st_ino||!current())result.status=Status::kCancelled;
  return result; // pending settles only after every read and owned FD closes.
}
