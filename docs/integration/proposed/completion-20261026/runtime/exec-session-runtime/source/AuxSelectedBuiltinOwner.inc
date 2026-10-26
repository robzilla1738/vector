// Actual-main finite selected-session capabilities. No JS root/handle selector.
napi_value PrepareSelectedExecScratch(napi_env,napi_callback_info);
napi_value SelectedReadUploadFile(napi_env,napi_callback_info);
napi_value SelectedPublishBrowserDownload(napi_env,napi_callback_info);
napi_value SelectedWithExecSpawn(napi_env,napi_callback_info);
struct FixedOutputs;
struct SelectedBuiltinScope;
struct SelectedUtilityWork;
void StopSelectedFileReaders(SelectedBuiltinScope*);
napi_value SelectedOpenReadFile(napi_env,napi_callback_info);
bool RetireSelectedUtilityOutput(const std::shared_ptr<FixedOutputs>&);
void MarkSelectedUtilityOutput(const std::shared_ptr<FixedOutputs>&);
struct SelectedScopeRegistry {
  std::mutex mutex;
  std::vector<std::weak_ptr<SelectedBuiltinScope>> scopes;
  std::vector<std::shared_ptr<SelectedUtilityWork>> utility;
};
SelectedScopeRegistry& SelectedScopes(){static auto* value=new SelectedScopeRegistry;return *value;}
thread_local std::shared_ptr<SelectedBuiltinScope> selected_builtin_scope;
struct SelectedBuiltinScope:std::enable_shared_from_this<SelectedBuiltinScope> {
  BrokerOwner captured;
  napi_env env=nullptr;
  napi_deferred deferred=nullptr;
  napi_ref close_promise=nullptr;
  napi_threadsafe_function wake=nullptr;
  uint64_t account=0,session=0;
  std::mutex mutex;
  size_t pending=0;
  bool closing=false,unknown=false,detached=false,releasing=false,released=false;
  bool wake_released=false,wake_closed=false;
  bool Current(napi_env current) {
    if(getpid()!=kHostProcess)return false;
    {std::lock_guard lock(mutex);if(closing||unknown||released)return false;}
    auto owner=CaptureBrokerOwner(current);
    return owner.worker==captured.worker&&owner.owner==captured.owner&&owner.owner&&
        AuxSelectedAccountStopRequested(owner.owner->handle,account)==0&&
        AuxValidateSelectedSession(owner.owner->handle,session)==0;
  }
  bool Begin(napi_env current) {
    if(!Current(current))return false;
    {std::lock_guard lock(mutex);if(closing||unknown||pending==std::numeric_limits<size_t>::max())return false;++pending;}
    bool admitted=false;
    {std::lock_guard lock(captured.worker->mutex);
      admitted=CurrentWorker(*captured.worker)&&!captured.worker->terminal&&!captured.worker->broker_closed&&
          captured.worker->owner==captured.owner&&captured.worker->broker_pending!=std::numeric_limits<size_t>::max();
      if(admitted)++captured.worker->broker_pending;
    }
    if(!admitted){std::lock_guard lock(mutex);--pending;}
    return admitted;
  }
  void MarkUnknown() {
    {std::lock_guard lock(mutex);unknown=true;closing=true;}
    std::lock_guard lock(captured.worker->mutex);captured.worker->broker_untracked=true;
  }
  void MaybeRelease() {
    {std::lock_guard lock(mutex);if(!closing||unknown||pending||releasing||released)return;releasing=true;}
    const auto handle=captured.owner->handle;
    if(AuxReleaseSelectedSession(handle,session)!=0||AuxReleaseSelectedAccount(handle,account)!=0){MarkUnknown();return;}
    napi_threadsafe_function signal;
    {std::lock_guard lock(mutex);released=true;releasing=false;wake_released=true;signal=wake;}
    // Finalization is the actual native handle closure, and resolves close only
    // after all registered producer threads and queued completions have ended.
    if(napi_release_threadsafe_function(signal,napi_tsfn_release)!=napi_ok)MarkUnknown();
  }
  void Finish() {
    {std::lock_guard lock(mutex);if(!pending){unknown=true;return;}--pending;}
    {std::lock_guard lock(captured.worker->mutex);--captured.worker->broker_pending;}
    MaybeRelease();
  }
  void RequestClose();
  std::optional<std::string> Root(uint32_t role) {
    int32_t fd=-1;
    if(AuxCopySelectedSessionDirectory(captured.owner->handle,session,role,&fd)!=0)return {};
    std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> path{};struct stat identity{};
    const bool current=ReadExecRoot(fd,path.data(),&identity);close(fd);
    return current?std::optional<std::string>(path.data()):std::nullopt;
  }
  bool Allows(napi_env current,const std::string& value,bool write) {
    if(!Current(current)||value.empty()||value.size()>=PATH_MAX||value.find('\0')!=std::string::npos)return false;
    std::error_code error;
    auto candidate=std::filesystem::weakly_canonical(std::filesystem::absolute(value,error),error);
    if(error)return false;
    for(uint32_t role:write?std::vector<uint32_t>{2}:std::vector<uint32_t>{1,2}) {
      auto root=Root(role);if(!root)return false;
      const auto text=candidate.string();
      if(text==*root||text.starts_with(*root+"/"))return Current(current);
    }
    return false;
  }
};
struct SelectedUtilityWork:std::enable_shared_from_this<SelectedUtilityWork> {
  std::shared_ptr<SelectedBuiltinScope> scope;
  std::shared_ptr<FixedOutputs> output;
  uint64_t job=0;
  std::thread thread;
  std::mutex mutex;
  int status=1;
  bool complete=false,unknown=false;
  void RequestClose() {
    std::lock_guard lock(mutex);
    if(complete||unknown||status==0)return;
    status=AuxCloseSelectedSessionUtility(scope->captured.owner->handle,job);
    if(status<0)unknown=true;
  }
};
void SelectedBuiltinScope::RequestClose() {
  if(getpid()!=kHostProcess)return;
  {std::lock_guard lock(mutex);closing=true;}
  std::vector<std::shared_ptr<SelectedUtilityWork>> jobs;
  {std::lock_guard lock(SelectedScopes().mutex);for(auto& job:SelectedScopes().utility)if(job->scope.get()==this)jobs.push_back(job);}
  for(auto& job:jobs)job->RequestClose();
  StopSelectedFileReaders(this);
  MaybeRelease();
}
std::shared_ptr<SelectedBuiltinScope> CurrentSelectedBuiltinScope(){return selected_builtin_scope;}
bool CurrentSelectedBuiltin(const std::shared_ptr<SelectedBuiltinScope>& scope,napi_env env){return !scope||scope->Current(env);}
bool SelectedBuiltinPathAllowed(const std::shared_ptr<SelectedBuiltinScope>& scope,napi_env env,const std::string& path,bool write){return scope&&scope->Allows(env,path,write);}
void SelectedBuiltinWake(napi_env env,napi_value,void* context,void* data) {
  auto* raw=static_cast<SelectedBuiltinScope*>(context);
  std::unique_ptr<std::shared_ptr<SelectedUtilityWork>> retained(static_cast<std::shared_ptr<SelectedUtilityWork>*>(data));
  if(getpid()!=kHostProcess||!retained)return;
  auto job=*retained;
  // Queueing occurs only after actual native closure; the original thread then
  // has no further effect. Join proves its own terminal lifetime before release.
  if(job->thread.joinable())job->thread.join();
  int status;
  {std::lock_guard lock(job->mutex);status=job->status;job->complete=true;}
  if(status!=0||!RetireSelectedUtilityOutput(job->output)) {raw->MarkUnknown();return;}
  {std::lock_guard lock(SelectedScopes().mutex);std::erase(SelectedScopes().utility,job);}
  if(!env) {std::lock_guard lock(raw->mutex);raw->detached=true;}
  job->scope->Finish();
}
void SelectedBuiltinFinalize(napi_env env,void* data,void*) {
  auto* retained=static_cast<std::shared_ptr<SelectedBuiltinScope>*>(data);auto scope=*retained;
  if(getpid()==kHostProcess) {
    bool unexpected;
    {std::lock_guard lock(scope->mutex);unexpected=!scope->released;scope->wake_closed=true;scope->wake=nullptr;}
    if(unexpected)scope->MarkUnknown();
    if(env&&scope->deferred) {
      bool unknown;{std::lock_guard lock(scope->mutex);unknown=scope->unknown;}
      napi_value value;
      if(unknown){napi_value message;napi_create_string_utf8(env,"Selected session outcome is unknown; native custody retained",NAPI_AUTO_LENGTH,&message);napi_create_error(env,nullptr,message,&value);napi_reject_deferred(env,scope->deferred,value);}
      else{napi_get_undefined(env,&value);napi_resolve_deferred(env,scope->deferred,value);}
      scope->deferred=nullptr;
      if(scope->close_promise){napi_delete_reference(env,scope->close_promise);scope->close_promise=nullptr;}
    }
  }
  delete retained;
}
void SelectedBuiltinCleanup(void* data) {
  auto* retained=static_cast<std::shared_ptr<SelectedBuiltinScope>*>(data);
  if(getpid()==kHostProcess) {
    bool pending;
    {std::lock_guard lock((*retained)->mutex);(*retained)->detached=true;pending=(*retained)->pending!=0;}
    if(pending)(*retained)->MarkUnknown();
    (*retained)->RequestClose();
  }
  delete retained;
}
void FinalizeSelectedScopeFunction(napi_env,void* data,void*) {if(getpid()==kHostProcess)delete static_cast<std::shared_ptr<SelectedBuiltinScope>*>(data);}
std::shared_ptr<SelectedBuiltinScope> SelectedScopeInfo(napi_env env,napi_callback_info info,size_t& count,napi_value* args) {
  void* data=nullptr;
  if(napi_get_cb_info(env,info,&count,args,nullptr,&data)!=napi_ok||!data)return {};
  return *static_cast<std::shared_ptr<SelectedBuiltinScope>*>(data);
}
napi_value SelectedScopeFail(napi_env env,const char* text) {BrokerThrow(env,"AUX_SELECTED_SESSION_UNAVAILABLE",text);return nullptr;}
napi_value SelectedAssert(napi_env env,napi_callback_info info) {
  size_t count=0;auto scope=SelectedScopeInfo(env,info,count,nullptr);
  if(!scope||!scope->Current(env))return SelectedScopeFail(env,"Selected account/session changed");
  napi_value value;napi_get_undefined(env,&value);return value;
}
napi_value SelectedClose(napi_env env,napi_callback_info info) {
  size_t count=0;auto scope=SelectedScopeInfo(env,info,count,nullptr);
  if(!scope)return SelectedScopeFail(env,"Selected session unavailable");
  napi_value promise;
  if(!scope->close_promise||napi_get_reference_value(env,scope->close_promise,&promise)!=napi_ok) {
    napi_value value;napi_get_undefined(env,&value);return value;
  }
  scope->RequestClose();return promise;
}
struct SelectedAwait {
  std::shared_ptr<SelectedBuiltinScope> scope;
  bool finished=false;
  void Finish(){if(!finished){finished=true;scope->Finish();}}
  ~SelectedAwait(){if(!finished)scope->MarkUnknown();}
};
struct SelectedAwaitObserver {std::shared_ptr<SelectedAwait> work;bool success;};
void FinalizeSelectedAwait(napi_env,void* data,void*) {delete static_cast<SelectedAwaitObserver*>(data);}
napi_value SettleSelectedAwait(napi_env env,napi_callback_info info) {
  size_t count=1;napi_value value;void* data=nullptr;
  if(napi_get_cb_info(env,info,&count,&value,nullptr,&data)!=napi_ok||!data)return nullptr;
  auto* observer=static_cast<SelectedAwaitObserver*>(data);
  const bool current=observer->work->scope->Current(env);
  observer->work->Finish();
  if(!count)napi_get_undefined(env,&value);
  if(!observer->success){napi_throw(env,value);return nullptr;}
  if(!current)return SelectedScopeFail(env,"Selected session closed before completion");
  return value;
}
napi_value SelectedAwaited(napi_env env,napi_callback_info info) {
  try {
    size_t count=2;napi_value args[2],receiver,result;napi_valuetype type;
    auto scope=SelectedScopeInfo(env,info,count,args);
    if(!scope||count!=1||napi_typeof(env,args[0],&type)!=napi_ok||type!=napi_function||!scope->Begin(env))
      return SelectedScopeFail(env,"Selected awaited owner unavailable");
    auto work=std::make_shared<SelectedAwait>();work->scope=scope;
    if(napi_get_undefined(env,&receiver)!=napi_ok||napi_call_function(env,receiver,args[0],0,nullptr,&result)!=napi_ok){work->Finish();return nullptr;}
    bool promise=false;
    if(napi_is_promise(env,result,&promise)!=napi_ok)return nullptr;
    if(!promise){const bool current=scope->Current(env);work->Finish();return current?result:SelectedScopeFail(env,"Selected session closed during callback");}
    napi_value callbacks[2];
    for(int i=0;i<2;++i) {
      auto observer=std::make_unique<SelectedAwaitObserver>(SelectedAwaitObserver{work,i==0});
      if(napi_create_function(env,nullptr,0,SettleSelectedAwait,observer.get(),&callbacks[i])!=napi_ok||
         napi_add_finalizer(env,callbacks[i],observer.get(),FinalizeSelectedAwait,nullptr,nullptr)!=napi_ok)return nullptr;
      observer.release();
    }
    v8::Local<v8::Promise> observed;auto* isolate=v8::Isolate::GetCurrent();
    if(!AuxBrokerV8Value(result).As<v8::Promise>()->Then(isolate->GetCurrentContext(),AuxBrokerV8Value(callbacks[0]).As<v8::Function>(),AuxBrokerV8Value(callbacks[1]).As<v8::Function>()).ToLocal(&observed))return nullptr;
    return AuxBrokerNapiValue(observed);
  }catch(...){return SelectedScopeFail(env,"Selected awaited custody interrupted");}
}
napi_value SelectedRoot(napi_env env,napi_callback_info info) {
  size_t count=1;napi_value args[1];auto scope=SelectedScopeInfo(env,info,count,args);
  if(!scope||!scope->Current(env))return SelectedScopeFail(env,"Selected path owner unavailable");
  // Getter uses no args; the deny-only assertion below uses one explicit path.
  auto root=scope->Root(2);if(!root)return SelectedScopeFail(env,"Selected Task session unavailable");
  napi_value result;napi_create_string_utf8(env,root->c_str(),root->size(),&result);return result;
}
bool SelectedReadString(napi_env env,napi_value value,std::string& text,size_t maximum=16*1024) {
  size_t count=0;if(napi_get_value_string_utf8(env,value,nullptr,0,&count)!=napi_ok||count>maximum)return false;
  text.resize(count+1);size_t actual=0;
  if(napi_get_value_string_utf8(env,value,text.data(),text.size(),&actual)!=napi_ok||actual!=count)return false;
  text.resize(count);return text.find('\0')==std::string::npos;
}
napi_value SelectedAssertPath(napi_env env,napi_callback_info info) {
  size_t count=1;napi_value args[1];auto scope=SelectedScopeInfo(env,info,count,args);std::string path;
  if(!scope||count!=1||!SelectedReadString(env,args[0],path,PATH_MAX)||!scope->Allows(env,path,true))
    return SelectedScopeFail(env,"Path is outside the actual selected Task session");
  napi_value value;napi_get_undefined(env,&value);return value;
}
napi_value SelectedAssertControlPath(napi_env env,napi_callback_info info) {
  size_t count=1;napi_value args[1];auto scope=SelectedScopeInfo(env,info,count,args);std::string path;
  if(!scope||count!=1||!SelectedReadString(env,args[0],path,PATH_MAX)||!scope->Current(env))return SelectedScopeFail(env,"Selected Control session unavailable");
  auto root=scope->Root(1);std::error_code error;auto canonical=std::filesystem::weakly_canonical(std::filesystem::absolute(path,error),error).string();
  if(error||!root||(canonical!=*root&&!canonical.starts_with(*root+"/")))return SelectedScopeFail(env,"Path is outside the actual stored session");
  napi_value value;napi_get_undefined(env,&value);return value;
}
struct SelectedFixedMethod {std::shared_ptr<SelectedBuiltinScope> scope;const char* method;bool utility;};
void FinalizeSelectedFixedMethod(napi_env,void* data,void*) {delete static_cast<SelectedFixedMethod*>(data);}
napi_value SelectedInvokeFixed(napi_env env,napi_callback_info info) {
  size_t count=3;napi_value args[3];void* data=nullptr;
  if(napi_get_cb_info(env,info,&count,args,nullptr,&data)!=napi_ok||!data)return nullptr;
  auto* method=static_cast<SelectedFixedMethod*>(data);auto scope=method->scope;
  if(!scope->Begin(env))return SelectedScopeFail(env,"Selected builtin owner unavailable");
  struct Exit {std::shared_ptr<SelectedBuiltinScope> scope,previous;~Exit(){selected_builtin_scope=previous;scope->Finish();}}exit{scope,selected_builtin_scope};
  selected_builtin_scope=scope;
  napi_value global,process,linked,name,binding,function,result;
  if(napi_get_global(env,&global)!=napi_ok||napi_get_named_property(env,global,"process",&process)!=napi_ok||
     napi_get_named_property(env,process,"_linkedBinding",&linked)!=napi_ok||
     napi_create_string_utf8(env,method->utility?"aux_macos_utilities_builtin":"aux_pdf_builtin",NAPI_AUTO_LENGTH,&name)!=napi_ok||
     napi_call_function(env,process,linked,1,&name,&binding)!=napi_ok||
     napi_get_named_property(env,binding,method->method,&function)!=napi_ok||
     napi_call_function(env,binding,function,count,args,&result)!=napi_ok)return nullptr;
  return result;
}
bool DefineSelectedMethod(napi_env env,napi_value object,const char* name,napi_callback callback,const std::shared_ptr<SelectedBuiltinScope>& scope) {
  auto* retain=new std::shared_ptr<SelectedBuiltinScope>(scope);napi_value function;
  if(napi_create_function(env,name,NAPI_AUTO_LENGTH,callback,retain,&function)!=napi_ok){delete retain;return false;}
  if(napi_add_finalizer(env,function,retain,FinalizeSelectedScopeFunction,nullptr,nullptr)!=napi_ok){delete retain;return false;}
  const napi_property_descriptor property{name,nullptr,nullptr,nullptr,nullptr,function,napi_default,nullptr};
  return napi_define_properties(env,object,1,&property)==napi_ok;
}
napi_value CaptureSelectedBuiltinSession(napi_env env,napi_callback_info info) {
  try {
    size_t count=4;napi_value args[4];void* bytes=nullptr;size_t size=0;int64_t account=-1;std::string session;
    auto captured=CaptureBrokerOwner(env);
    if(!captured.owner||!captured.worker->ordinary_main_service||napi_get_cb_info(env,info,&count,args,nullptr,nullptr)!=napi_ok||count!=3||
       napi_get_value_int64(env,args[0],&account)!=napi_ok||account<0||account>9007199254740991LL||
       !SelectedReadString(env,args[1],session,128)||napi_get_buffer_info(env,args[2],&bytes,&size)!=napi_ok||!bytes||!size||size>16384)
      return SelectedScopeFail(env,"Actual selected account/session snapshot is required");
    uint64_t account_lease=0,session_lease=0;
    struct CaptureCleanup {
      BrokerOwner captured;uint64_t& account;uint64_t& session;bool transferred=false;
      ~CaptureCleanup(){if(transferred)return;bool ok=true;if(session)ok=AuxReleaseSelectedSession(captured.owner->handle,session)==0;if(account)ok=AuxReleaseSelectedAccount(captured.owner->handle,account)==0&&ok;if(!ok){std::lock_guard lock(captured.worker->mutex);captured.worker->broker_untracked=true;}}
    } capture_cleanup{captured,account_lease,session_lease};
    if(AuxCaptureSelectedAccount(captured.owner->handle,account,static_cast<const uint8_t*>(bytes),size,&account_lease)!=0||!account_lease)
      return SelectedScopeFail(env,"Selected account binding changed");
    if(AuxCaptureSelectedSession(captured.owner->handle,account_lease,session.c_str(),&session_lease)!=0||!session_lease) {
      return SelectedScopeFail(env,"Stored session membership is unavailable");
    }
    auto scope=std::make_shared<SelectedBuiltinScope>();scope->captured=captured;scope->env=env;scope->account=account_lease;scope->session=session_lease;
    napi_value promise,name,object;
    if(napi_create_promise(env,&scope->deferred,&promise)!=napi_ok||napi_create_reference(env,promise,1,&scope->close_promise)!=napi_ok||
       napi_create_string_utf8(env,"AuxSelectedBuiltinSession",NAPI_AUTO_LENGTH,&name)!=napi_ok){if(scope->close_promise)napi_delete_reference(env,scope->close_promise);return nullptr;}
    auto* retained=new std::shared_ptr<SelectedBuiltinScope>(scope);
    if(napi_create_threadsafe_function(env,nullptr,nullptr,name,0,1,retained,SelectedBuiltinFinalize,scope.get(),SelectedBuiltinWake,&scope->wake)!=napi_ok){delete retained;if(scope->close_promise)napi_delete_reference(env,scope->close_promise);return nullptr;}
    capture_cleanup.transferred=true;
    {std::lock_guard lock(SelectedScopes().mutex);std::erase_if(SelectedScopes().scopes,[](const auto& weak){return weak.expired();});SelectedScopes().scopes.push_back(scope);}
    auto* cleanup=new std::shared_ptr<SelectedBuiltinScope>(scope);
    if(napi_add_env_cleanup_hook(env,SelectedBuiltinCleanup,cleanup)!=napi_ok){delete cleanup;scope->RequestClose();return nullptr;}
    if(napi_create_object(env,&object)!=napi_ok){scope->RequestClose();return nullptr;}
    for(const auto& item:std::vector<std::pair<const char*,napi_callback>>{{"prepareExecScratch",PrepareSelectedExecScratch},{"withExecSpawn",SelectedWithExecSpawn},{"readUploadFile",SelectedReadUploadFile},{"publishBrowserDownload",SelectedPublishBrowserDownload},{"assertCurrent",SelectedAssert},{"awaited",SelectedAwaited},{"close",SelectedClose},{"assertTaskSessionPath",SelectedAssertPath},{"assertControlSessionPath",SelectedAssertControlPath},{"openReadFile",SelectedOpenReadFile}})
      if(!DefineSelectedMethod(env,object,item.first,item.second,scope)){scope->RequestClose();return nullptr;}
    auto* path_retain=new std::shared_ptr<SelectedBuiltinScope>(scope);
    if(napi_add_finalizer(env,object,path_retain,FinalizeSelectedScopeFunction,nullptr,nullptr)!=napi_ok){delete path_retain;scope->RequestClose();return nullptr;}
    const napi_property_descriptor task_path{"taskSessionPath",nullptr,nullptr,SelectedRoot,nullptr,nullptr,napi_default,path_retain};
    if(napi_define_properties(env,object,1,&task_path)!=napi_ok){scope->RequestClose();return nullptr;}
    for(bool utility:{false,true}) {
      napi_value facade;if(napi_create_object(env,&facade)!=napi_ok){scope->RequestClose();return nullptr;}
      const auto methods=utility?std::vector<const char*>{"run"}:std::vector<const char*>{"extractText","merge","rotate","split","getFormFields","renderPages","fillFormFields"};
      for(auto* method:methods) {
        auto* data=new SelectedFixedMethod{scope,method,utility};napi_value function;
        if(napi_create_function(env,method,NAPI_AUTO_LENGTH,SelectedInvokeFixed,data,&function)!=napi_ok){delete data;scope->RequestClose();return nullptr;}
        if(napi_add_finalizer(env,function,data,FinalizeSelectedFixedMethod,nullptr,nullptr)!=napi_ok){delete data;scope->RequestClose();return nullptr;}
        const napi_property_descriptor property{method,nullptr,nullptr,nullptr,nullptr,function,napi_default,nullptr};
        if(napi_define_properties(env,facade,1,&property)!=napi_ok){scope->RequestClose();return nullptr;}
      }
      const napi_property_descriptor property{utility?"utility":"pdf",nullptr,nullptr,nullptr,nullptr,facade,napi_default,nullptr};
      if(napi_define_properties(env,object,1,&property)!=napi_ok){scope->RequestClose();return nullptr;}
    }
    return object;
  }catch(...){return SelectedScopeFail(env,"Selected session custody could not be established");}
}
std::optional<std::string> RunSelectedUtility(const std::shared_ptr<SelectedBuiltinScope>& scope,napi_env env,
    const std::string& command,const std::string& input,const std::shared_ptr<FixedOutputs>& output) {
  if(!scope->Begin(env))return {};
  auto work=std::make_shared<SelectedUtilityWork>();work->scope=scope;work->output=output;
  if(AuxBeginSelectedSessionUtility(scope->captured.owner->handle,scope->session,&work->job)!=0){scope->Finish();return {};}
  MarkSelectedUtilityOutput(output);
  {std::lock_guard lock(SelectedScopes().mutex);SelectedScopes().utility.push_back(work);}
  char* result=nullptr;
  const auto status=AuxRunSelectedSessionUtility(scope->captured.owner->handle,work->job,command.c_str(),reinterpret_cast<const uint8_t*>(input.data()),input.size(),&result);
  std::optional<std::string> response;if(status==0&&result)response=std::string(result);free(result);
  if(napi_acquire_threadsafe_function(scope->wake)!=napi_ok){scope->MarkUnknown();return {};}
  try {
  work->thread=std::thread([work] {
    do {
      work->RequestClose();
      {std::lock_guard lock(work->mutex);if(work->status!=1)break;}
      std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }while(true);
    auto* retain=new std::shared_ptr<SelectedUtilityWork>(work);
    if(napi_call_threadsafe_function(work->scope->wake,retain,napi_tsfn_nonblocking)!=napi_ok){delete retain;work->scope->MarkUnknown();}
    napi_release_threadsafe_function(work->scope->wake,napi_tsfn_release);
  });
  }catch(...){napi_release_threadsafe_function(scope->wake,napi_tsfn_release);scope->MarkUnknown();return {};}
  return response;
}
void AuxRequestSelectedBuiltinStopForWorker(const void* worker) noexcept {
  if(getpid()!=kHostProcess)return;
  try {
    std::vector<std::shared_ptr<SelectedBuiltinScope>> scopes;
    {std::lock_guard lock(SelectedScopes().mutex);for(auto& weak:SelectedScopes().scopes)if(auto scope=weak.lock();scope&&scope->captured.worker.get()==worker)scopes.push_back(scope);}
    for(auto& scope:scopes)if(AuxSelectedAccountStopRequested(scope->captured.owner->handle,scope->account)!=0)scope->RequestClose();
  }catch(...){}
}
AuxDevelopmentWorkerDrain AuxCloseSelectedBuiltinsForWorker(const void* worker) noexcept {
  if(getpid()!=kHostProcess)return AuxDevelopmentWorkerDrain::wrongProcess;
  try {
    std::vector<std::shared_ptr<SelectedBuiltinScope>> scopes;
    {std::lock_guard lock(SelectedScopes().mutex);for(auto& weak:SelectedScopes().scopes)if(auto scope=weak.lock();scope&&scope->captured.worker.get()==worker)scopes.push_back(scope);}
    auto result=AuxDevelopmentWorkerDrain::drained;
    for(auto& scope:scopes) {
      scope->RequestClose();std::lock_guard lock(scope->mutex);
      if(scope->unknown)result=AuxMergeWorkerDrain(result,AuxDevelopmentWorkerDrain::untracked);
      else if(!scope->released||!scope->wake_closed)result=AuxMergeWorkerDrain(result,AuxDevelopmentWorkerDrain::pending);
    }
    return result;
  }catch(...){return AuxDevelopmentWorkerDrain::untracked;}
}
