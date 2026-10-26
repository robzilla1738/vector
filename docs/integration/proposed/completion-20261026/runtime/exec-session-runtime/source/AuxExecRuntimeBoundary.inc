struct ExecRuntimeBoundary {
  int32_t fd=-1;
  struct stat identity{};
  AuxExecNativeRuntimeBoundary value{};
  ~ExecRuntimeBoundary(){if(fd>=0)close(fd);}
};
std::shared_ptr<ExecRuntimeBoundary> CaptureExecRuntimeBoundary(const std::shared_ptr<RuntimeScope>& runtime) {
  if(!runtime||!runtime->lease||!runtime->lease->locked||runtime->lease->task.fd<0||getpid()!=kHostProcess)return {};
  auto result=std::make_shared<ExecRuntimeBoundary>();
  // The existing native lease holds task/use flocks through the actual cohort.
  // A child reservation may close future admission while retaining that lease.
  {
    std::lock_guard lock(runtime->captured.worker->mutex);
    if(runtime->unknown||!runtime->counted||runtime->captured.worker->terminal||!runtime->lease)return {};
  }
  result->value.version=1;
  result->value.exclusiveMutation=runtime->lease->mode==aux_runtime_publication::Mode::kExclusiveMutation?1:0;
  errno=0;result->fd=openat(runtime->lease->task.fd,"runtime",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK);
  if(result->fd<0){if(errno==ENOENT&&!result->value.exclusiveMutation)return result;return {};}
  std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> path{};
  if(!ReadExecRoot(result->fd,path.data(),&result->identity)||!FixedPrivateDirectory(result->fd))return {};
  const auto expected=runtime->task_path+"/runtime";
  if(expected!=path.data()||expected.size()>=sizeof(result->value.path))return {};
  result->value.present=1;memcpy(result->value.path,expected.c_str(),expected.size()+1);
  return result;
}
bool SameExecRuntimeBoundary(const ExecRuntimeBoundary& a,const ExecRuntimeBoundary& b) {
  return memcmp(&a.value,&b.value,sizeof(a.value))==0&&(!a.value.present||
      (a.identity.st_dev==b.identity.st_dev&&a.identity.st_ino==b.identity.st_ino));
}
int32_t CopyExecRuntimeBoundary(void* token,AuxExecNativeRuntimeBoundary* result) noexcept {
  if(getpid()!=kHostProcess||!result)return -1;*result={};
  try {
    auto pending=CapturePendingExec(token);if(!pending.owner||!StillPendingExec(pending))return -1;
    auto captured=CaptureExecRuntimeBoundary(pending.reservation->runtime_scope);if(!captured)return -1;
    {
      std::lock_guard lock(pending.worker->mutex);
      if(pending.reservation->phase!=PtyPhase::pending||pending.worker->terminal)return -1;
      if(pending.reservation->runtime_boundary&&!SameExecRuntimeBoundary(*pending.reservation->runtime_boundary,*captured))return -1;
      if(!pending.reservation->runtime_boundary)pending.reservation->runtime_boundary=captured;
    }
    *result=captured->value;return 0;
  }catch(...){return -1;}
}
