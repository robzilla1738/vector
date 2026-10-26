struct ExecTaskBoundary {
  std::array<int32_t,3> fds{-1,-1,-1};
  std::array<struct stat,3> identities{};
  AuxExecNativeTaskBoundary value{};
  ~ExecTaskBoundary(){for(auto fd:fds)if(fd>=0)close(fd);}
};
std::shared_ptr<ExecTaskBoundary> CaptureExecTaskBoundary(const std::shared_ptr<SelectedBuiltinScope>& selected) {
  if(!selected||!selected->Current(selected->env))return {};
  auto boundary=std::make_shared<ExecTaskBoundary>();
  const auto handle=selected->captured.owner->handle;
  if(AuxCopySelectedAccountDirectory(handle,selected->account,3,&boundary->fds[0])!=0||
     AuxCopySelectedAccountDirectory(handle,selected->account,2,&boundary->fds[1])!=0||
     AuxCopySelectedSessionDirectory(handle,selected->session,3,&boundary->fds[2])!=0)return {};
  std::array<char*,3> paths{boundary->value.taskRoot,boundary->value.accountTaskRoot,boundary->value.workspace};
  for(size_t i=0;i<paths.size();++i)if(!ReadExecRoot(boundary->fds[i],paths[i],&boundary->identities[i]))return {};
  auto app=FixedContainingApp();if(!app)return {};
  const auto name=app->string();if(name.empty()||name.size()>=sizeof(boundary->value.application))return {};
  memcpy(boundary->value.application,name.c_str(),name.size()+1);
  boundary->value.version=1;
  const std::string root(boundary->value.taskRoot),account(boundary->value.accountTaskRoot);
  if(!account.starts_with(root+"/u/"))return {};
  const auto leaf=account.substr(root.size()+3);
  if(leaf.empty()||!std::all_of(leaf.begin(),leaf.end(),[](unsigned char c){return c>='0'&&c<='9';}))return {};
  return selected->Current(selected->env)?boundary:nullptr;
}
bool SameExecTaskBoundary(const ExecTaskBoundary& a,const ExecTaskBoundary& b) {
  if(memcmp(&a.value,&b.value,sizeof(a.value))!=0)return false;
  for(size_t i=0;i<a.fds.size();++i)
    if(a.identities[i].st_dev!=b.identities[i].st_dev||a.identities[i].st_ino!=b.identities[i].st_ino)return false;
  return true;
}
int32_t CopyExecTaskBoundary(void* token,AuxExecNativeTaskBoundary* result) noexcept {
  if(getpid()!=kHostProcess||!result)return -1;*result={};
  try {
    auto pending=CapturePendingExec(token);
    if(!pending.owner||!pending.reservation->selected_scope)return -1;
    auto boundary=CaptureExecTaskBoundary(pending.reservation->selected_scope);
    if(!boundary||!StillPendingExec(pending))return -1;
    {
      std::lock_guard lock(pending.worker->mutex);
      if(pending.reservation->phase!=PtyPhase::pending||pending.worker->terminal)return -1;
      if(pending.reservation->task_boundary&&!SameExecTaskBoundary(*pending.reservation->task_boundary,*boundary))return -1;
      if(!pending.reservation->task_boundary)pending.reservation->task_boundary=boundary;
    }
    *result=boundary->value;return 0;
  }catch(...){return -1;}
}
