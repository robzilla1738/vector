// Existing selected session, synchronous native spawn boundary only.
std::shared_ptr<ExecReservation> LookupExec(void*) noexcept;
void RuntimeChildCohortSettled(const std::shared_ptr<RuntimeScope>&);
thread_local std::shared_ptr<SelectedBuiltinScope> selected_exec_spawn;
napi_value SelectedWithExecSpawn(napi_env env,napi_callback_info info) {
  if(kBrowserOnlyNativeStartup)return RefuseSupervisedTaskBinding(env,info);
  size_t count=1;napi_value args[1],receiver,result;napi_valuetype type;
  auto scope=SelectedScopeInfo(env,info,count,args);
  if(!scope||count!=1||napi_typeof(env,args[0],&type)!=napi_ok||type!=napi_function||!scope->Begin(env))
    return SelectedScopeFail(env,"Selected command spawn is unavailable");
  struct Exit {std::shared_ptr<SelectedBuiltinScope> scope,previous;~Exit(){selected_exec_spawn=previous;scope->Finish();}}exit{scope,selected_exec_spawn};
  auto workspace=scope->Root(3);
  int32_t account_fd=-1;
  if(!workspace||AuxCopySelectedAccountDirectory(scope->captured.owner->handle,scope->account,2,&account_fd)!=0)
    return SelectedScopeFail(env,"Stored selected workspace is unavailable");
  std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> account_path{};struct stat identity{};
  bool current=ReadExecRoot(account_fd,account_path.data(),&identity);
  if(close(account_fd)!=0){scope->MarkUnknown();return SelectedScopeFail(env,"Workspace validation descriptor closure is unknown");}
  const std::string account_root(account_path.data());
  if(!current||(!FixedPathAllowed(*workspace,scope->captured.owner->handle,false)&&
      *workspace!=account_root&&!workspace->starts_with(account_root+"/"))||!scope->Current(env))
    return SelectedScopeFail(env,"Stored workspace crosses a protected owner boundary");
  selected_exec_spawn=scope;
  if(napi_get_undefined(env,&receiver)!=napi_ok||napi_call_function(env,receiver,args[0],0,nullptr,&result)!=napi_ok)return nullptr;
  return result;
}
// Called only by the actual ProcessWrap original uv close callback or the
// synchronous runner after its original pipe/process loop has fully closed.
void ObserveExecOriginalHandleClosed(void* token) noexcept {
  if(getpid()!=kHostProcess)return;
  auto item=LookupExec(token);if(!item||item->process!=getpid())return;
  auto worker=item->worker.lock();if(!worker)return;
  std::shared_ptr<RuntimeScope> runtime;std::shared_ptr<SelectedBuiltinScope> selected;bool closed=false;
  {
    std::lock_guard lock(worker->mutex);
    if(item->transport_settled)return;
    item->transport_settled=true;
    if(item->descendant_completed&&item->descendant_counted&&!item->runtime_cohort_released) {
      item->runtime_cohort_released=true;runtime=item->runtime_scope;selected=std::move(item->selected_scope);
    }
    closed=worker->terminal;
  }
  if(runtime)RuntimeChildCohortSettled(runtime);
  if(selected)selected->Finish();
  if(closed)worker->Close();
  DetachCompletedEnvironment(worker);
}
