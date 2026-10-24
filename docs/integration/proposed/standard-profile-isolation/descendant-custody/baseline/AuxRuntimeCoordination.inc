// Included after the seed publisher. All runtime mutation callbacks below are
// synchronous native OS work. JS close requests do not settle child custody.
struct RuntimeScope;
void ForgetRuntimeScope(RuntimeScope*);
struct RuntimeScope {
  BrokerOwner captured;
  std::unique_ptr<aux_runtime_publication::Lease> lease;
  std::string task_path, install_name;
  bool counted=false, closed=false, unknown=false;
  size_t pending_children=0, unsettled_children=0;
  bool replacement_started=false;
  // Worker mutex protects counters/state; FS calls are confined to its loop.
  bool Current() const {
    if(getpid()!=kHostProcess||!captured.worker||!captured.owner)return false;
    std::lock_guard<std::mutex> lock(captured.worker->mutex);const auto& w=*captured.worker;
    return !closed&&!unknown&&!w.terminal&&!w.broker_closed&&!w.environment_detached&&!w.initializing&&w.owner==captured.owner;
  }
  void Unknown(){std::lock_guard<std::mutex> lock(captured.worker->mutex);unknown=true;captured.worker->runtime_scope_unknown=true;}
  void RequestClose() {
    std::unique_ptr<aux_runtime_publication::Lease> settled;

    {
      std::lock_guard<std::mutex> lock(captured.worker->mutex);closed=true;
      if(!pending_children&&!unsettled_children&&!unknown&&counted){
        settled=std::move(lease);counted=false;--captured.worker->runtime_scope_pending;
      }
    } // Direct native unlock; no dispatcher entry is needed by a draining job.
    if(settled)ForgetRuntimeScope(this);
  }
};
struct RuntimeScopeRegistry {
  std::mutex mutex;
  std::vector<std::shared_ptr<RuntimeScope>> retained;
};
RuntimeScopeRegistry& RuntimeScopes(){static auto* r=new RuntimeScopeRegistry;return *r;}
void ForgetRuntimeScope(RuntimeScope* scope){
  std::lock_guard<std::mutex> lock(RuntimeScopes().mutex);auto& entries=RuntimeScopes().retained;
  entries.erase(std::remove_if(entries.begin(),entries.end(),[scope](const auto& entry){return entry.get()==scope;}),entries.end());
}
thread_local std::shared_ptr<RuntimeScope> active_runtime_scope;
std::shared_ptr<RuntimeScope> NewRuntimeScope(BrokerOwner captured,bool exclusive){
  auto scope=std::make_shared<RuntimeScope>();scope->captured=std::move(captured);
  scope->lease=std::make_unique<aux_runtime_publication::Lease>();
  scope->lease->mode=exclusive?aux_runtime_publication::Mode::kExclusiveMutation:aux_runtime_publication::Mode::kSharedUse;
  {
    std::lock_guard<std::mutex> lock(scope->captured.worker->mutex);auto& w=*scope->captured.worker;
    if(w.terminal||w.broker_closed||w.initializing||w.environment_detached||w.owner!=scope->captured.owner||w.runtime_scope_pending==std::numeric_limits<size_t>::max())return {};
    ++w.runtime_scope_pending;scope->counted=true;
  }
  try {std::lock_guard<std::mutex> lock(RuntimeScopes().mutex);RuntimeScopes().retained.push_back(scope);}
  catch(...){scope->RequestClose();throw;}
  return scope;
}
bool AcquireRuntimeScope(const std::shared_ptr<RuntimeScope>& scope,unsigned attempts=3000){
  int32_t control=-1,task=-1;uint64_t generation=0;
  if(!scope->Current()||AuxNativeContextCopyStorageRoots(scope->captured.owner->handle,&generation,&control,&task))return false;
  aux_runtime_cache::Fd c(control),t(task==control?-1:task);
  struct stat identity{};std::array<char,AUX_EXEC_DENIED_PATH_CAPACITY> name{};
  if(control<0||task<0||control==task||!generation||!ReadExecRoot(task,name.data(),&identity))return false;
  scope->task_path=name.data();
  const auto current=[scope](){return scope->Current();};
  return scope->lease->Acquire(task,current,scope->lease->mode,attempts)&&
    AuxNativeContextValidateCurrentAuthority(scope->captured.owner->handle)==0&&scope->Current();
}
// Called only before actual native exec/PTY spawn. Explicit installer run()
// scopes are synchronous, thread-local and cannot leak rights to other jobs.
std::shared_ptr<RuntimeScope> ReserveRuntimeChild(const std::shared_ptr<Worker>& worker,const std::shared_ptr<Owner>& owner){
  auto scope=active_runtime_scope;
  if(scope){if(scope->captured.worker!=worker||scope->captured.owner!=owner||!scope->Current())return {};}
  else {
    scope=NewRuntimeScope({worker,owner},false);
    if(!scope)return {};
    // Spawn admission may not block the JS loop waiting for an installer. The
    // async acquireAgentRuntimeUse gate normally precedes it; races refuse.
    if(!AcquireRuntimeScope(scope,1)){scope->RequestClose();return {};}
    {std::lock_guard<std::mutex> lock(worker->mutex);scope->closed=true;} // Native reservation owns it.
  }
  {std::lock_guard<std::mutex> lock(worker->mutex);++scope->pending_children;}
  return scope;
}
void RuntimeChildFailed(const std::shared_ptr<RuntimeScope>& scope){
  if(!scope)return;
  bool close=false;{std::lock_guard<std::mutex> lock(scope->captured.worker->mutex);
    if(scope->pending_children)--scope->pending_children;close=scope->closed;
  }
  if(close)scope->RequestClose();
}
void RuntimeChildCreatedLocked(const std::shared_ptr<RuntimeScope>& scope){
  if(!scope)return;
  // Caller already holds the actual Worker mutex.
  if(scope->pending_children)--scope->pending_children;
  // The existing native reservation has no descendant-completion proof.
  // Neither direct wait nor JS release may unlock this lease.
  ++scope->unsettled_children;scope->captured.worker->runtime_scope_unknown=true;
}


// Reserved for a proved native cohort completion, never direct exit or JS.
// The reservation owner must invoke exactly once after its kernel cohort is
// settled. No selected predecessor invokes this hook; unknown remains today.
void RuntimeChildCohortSettled(const std::shared_ptr<RuntimeScope>& scope){
  if(!scope||getpid()!=kHostProcess)return;
  bool close=false;
  {
    std::lock_guard<std::mutex> lock(scope->captured.worker->mutex);
    if(!scope->unsettled_children)return;
    --scope->unsettled_children;close=scope->closed;
    bool unknown=false;
    std::lock_guard<std::mutex> registry_lock(RuntimeScopes().mutex);
    for(const auto& held:RuntimeScopes().retained)
      if(held->captured.worker==scope->captured.worker&&(held->unknown||held->unsettled_children)){unknown=true;break;}
    scope->captured.worker->runtime_scope_unknown=unknown;
  }
  if(close)scope->RequestClose();
}

std::string RuntimeRelative(const RuntimeScope& scope,const std::string& absolute){
  const auto prefix=scope.task_path+"/";
  if(absolute.size()>4096||absolute.compare(0,prefix.size(),prefix))throw std::runtime_error("Runtime path is outside the admitted task home");
  std::string relative=absolute.substr(prefix.size());size_t start=0;
  for(size_t end=0;;start=end+1){end=relative.find('/',start);auto part=relative.substr(start,end-start);
    if(part.empty()||part=="."||part==".."||part.find('\0')!=std::string::npos)throw std::runtime_error("Invalid runtime path");
    if(end==std::string::npos)break;
  }
  const auto top=relative.substr(0,relative.find('/'));
  if(top!="runtime"&&top!="runtime.backup"&&(scope.install_name.empty()||top!=scope.install_name))throw std::runtime_error("Runtime leaf is not owned by this operation");
  return relative;
}
void RuntimeMkdir(int root,const std::string& relative){
  aux_runtime_cache::Fd current(openat(root,".",aux_runtime_cache::kRead|O_DIRECTORY));
  if(current.fd<0)throw std::runtime_error("Runtime directory unavailable");
  size_t start=0;
  for(size_t end=0;;start=end+1){end=relative.find('/',start);auto part=relative.substr(start,end-start);
    if(mkdirat(current.fd,part.c_str(),0755)&&errno!=EEXIST)throw std::runtime_error("Runtime mkdir failed");
    aux_runtime_cache::Fd next(openat(current.fd,part.c_str(),aux_runtime_cache::kRead|O_DIRECTORY));
    struct stat st{};if(next.fd<0||fstat(next.fd,&st)||!aux_runtime_cache::Private(st))throw std::runtime_error("Unsafe runtime directory");
    std::swap(next.fd,current.fd);if(end==std::string::npos)break;
  }
}
void RuntimeRemoveAt(int parent,const std::string& name,size_t& count){
  if(++count>250000)throw std::runtime_error("Runtime cleanup exceeds bound");
  struct stat st{};
  if(fstatat(parent,name.c_str(),&st,AT_SYMLINK_NOFOLLOW)){if(errno==ENOENT)return;throw std::runtime_error("Runtime cleanup stat failed");}
  if(S_ISDIR(st.st_mode)){
    aux_runtime_cache::Fd child(openat(parent,name.c_str(),aux_runtime_cache::kRead|O_DIRECTORY));
    struct stat held{};if(child.fd<0||fstat(child.fd,&held)||held.st_dev!=st.st_dev||held.st_ino!=st.st_ino)throw std::runtime_error("Runtime cleanup identity changed");
    aux_runtime_cache::Fd scan(openat(child.fd,".",aux_runtime_cache::kRead|O_DIRECTORY));
    DIR* raw=scan.fd<0?nullptr:fdopendir(scan.fd);if(!raw)throw std::runtime_error("Runtime cleanup scan failed");scan.release();
    const std::unique_ptr<DIR,int(*)(DIR*)> directory(raw,closedir);
    for(;;){errno=0;auto* entry=readdir(raw);if(!entry){if(errno)throw std::runtime_error("Runtime cleanup scan failed");break;}
      std::string leaf(entry->d_name);if(leaf=="."||leaf=="..")continue;RuntimeRemoveAt(child.fd,leaf,count);
    }
    if(unlinkat(parent,name.c_str(),AT_REMOVEDIR))throw std::runtime_error("Runtime cleanup directory failed");
  }else if(unlinkat(parent,name.c_str(),0))throw std::runtime_error("Runtime cleanup leaf failed");
}
void RuntimeCopyAt(int from,const std::string& leaf,int to,size_t& count){
  if(++count>250000)throw std::runtime_error("Runtime copy exceeds bound");
  struct stat st{};if(fstatat(from,leaf.c_str(),&st,AT_SYMLINK_NOFOLLOW))throw std::runtime_error("Runtime copy stat failed");
  if(S_ISDIR(st.st_mode)){
    if(mkdirat(to,leaf.c_str(),st.st_mode&0777)&&errno!=EEXIST)throw std::runtime_error("Runtime copy mkdir failed");
    aux_runtime_cache::Fd src(openat(from,leaf.c_str(),aux_runtime_cache::kRead|O_DIRECTORY)),dst(openat(to,leaf.c_str(),aux_runtime_cache::kRead|O_DIRECTORY));
    if(src.fd<0||dst.fd<0)throw std::runtime_error("Runtime copy directory unavailable");
    aux_runtime_cache::Fd scan(openat(src.fd,".",aux_runtime_cache::kRead|O_DIRECTORY));DIR* raw=scan.fd<0?nullptr:fdopendir(scan.fd);
    if(!raw)throw std::runtime_error("Runtime copy scan failed");scan.release();const std::unique_ptr<DIR,int(*)(DIR*)> directory(raw,closedir);
    for(;;){errno=0;auto* entry=readdir(raw);if(!entry){if(errno)throw std::runtime_error("Runtime copy scan failed");break;}
      std::string child(entry->d_name);if(child!="."&&child!="..")RuntimeCopyAt(src.fd,child,dst.fd,count);
    }
    if(fsync(dst.fd))throw std::runtime_error("Runtime copied directory flush failed");
  }else if(S_ISREG(st.st_mode)){
    aux_runtime_cache::Fd src(openat(from,leaf.c_str(),aux_runtime_cache::kRead)),dst(openat(to,leaf.c_str(),O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW|O_CLOEXEC,0600));
    struct stat held{};
    if(src.fd<0||dst.fd<0||fstat(src.fd,&held)||!S_ISREG(held.st_mode)||held.st_nlink!=1||held.st_size<0||held.st_dev!=st.st_dev||held.st_ino!=st.st_ino)throw std::runtime_error("Runtime copy file unavailable");
    uint64_t total=0;std::array<char,65536> buffer{};
    for(;;){ssize_t n=read(src.fd,buffer.data(),buffer.size());if(n<0&&errno==EINTR)continue;if(n<0)throw std::runtime_error("Runtime copy read failed");if(!n)break;
      if(static_cast<uint64_t>(n)>static_cast<uint64_t>(held.st_size)-total)throw std::runtime_error("Runtime copy source changed");total+=n;
      if(!aux_runtime_publication::WriteAll(dst.fd,buffer.data(),n,[](){return true;}))throw std::runtime_error("Runtime copy write failed");}
    struct stat after{};
    if(total!=static_cast<uint64_t>(held.st_size)||fstat(src.fd,&after)||!aux_runtime_cache::Same(held,after)||fchmod(dst.fd,st.st_mode&0777)||fsync(dst.fd))throw std::runtime_error("Runtime copy source changed or flush failed");
  }else if(S_ISLNK(st.st_mode)){
    std::array<char,4096> target{};auto n=readlinkat(from,leaf.c_str(),target.data(),target.size());
    if(n<0||n>=static_cast<ssize_t>(target.size()))throw std::runtime_error("Runtime copy link failed");
    std::string value(target.data(),n);if(symlinkat(value.c_str(),to,leaf.c_str()))throw std::runtime_error("Runtime copy link create failed");
  }else throw std::runtime_error("Runtime copy refuses special file");
}
struct RuntimeMethod {std::shared_ptr<RuntimeScope> scope;std::string name;};
void FinalizeRuntimeMethod(napi_env,void* data,void*){
  if(getpid()!=kHostProcess)return;
  auto* method=static_cast<RuntimeMethod*>(data);
  delete method;
}
std::string RuntimeString(napi_env env,napi_value value){
  size_t size=0;napi_valuetype type;
  if(napi_typeof(env,value,&type)!=napi_ok||type!=napi_string||napi_get_value_string_utf8(env,value,nullptr,0,&size)!=napi_ok||size>4096)throw std::runtime_error("Invalid runtime string");
  std::vector<char> bytes(size+1);size_t copied=0;
  if(napi_get_value_string_utf8(env,value,bytes.data(),bytes.size(),&copied)!=napi_ok||copied!=size)throw std::runtime_error("Invalid runtime string");
  return std::string(bytes.data(),size);
}
napi_value RuntimeScopeMethod(napi_env env,napi_callback_info info){
  if(getpid()!=kHostProcess)return nullptr;
  size_t argc=4;napi_value args[4],result;void* raw=nullptr;
  if(napi_get_cb_info(env,info,&argc,args,nullptr,&raw)!=napi_ok||!raw)return nullptr;
  auto& method=*static_cast<RuntimeMethod*>(raw);auto scope=method.scope;
  try{
    napi_get_undefined(env,&result);
    if(method.name=="close") {if(argc)throw std::runtime_error("Runtime close takes no arguments");scope->RequestClose();return result;}
    if(method.name=="markUnknown") {scope->Unknown();return result;}
    if(method.name=="hasUnsettledWork") {
      std::lock_guard<std::mutex> lock(scope->captured.worker->mutex);
      napi_get_boolean(env,scope->unknown||scope->pending_children||scope->unsettled_children,&result);return result;
    }
    if(!scope->Current()||!CaptureBrokerOwner(env).owner||!scope->lease||!scope->lease->locked)throw std::runtime_error("Runtime operation admission is closed");
    const auto actual=CaptureBrokerOwner(env);
    if(actual.owner!=scope->captured.owner||actual.worker!=scope->captured.worker)throw std::runtime_error("Runtime scope owner changed");
    if(method.name=="run") {
      napi_valuetype type;if(argc!=1||napi_typeof(env,args[0],&type)!=napi_ok||type!=napi_function||active_runtime_scope)throw std::runtime_error("Invalid nested runtime operation");
      struct Entry {std::shared_ptr<RuntimeScope> previous;~Entry(){active_runtime_scope=std::move(previous);}} entry{active_runtime_scope};
      active_runtime_scope=scope;napi_value receiver;napi_get_undefined(env,&receiver);
      return napi_call_function(env,receiver,args[0],0,nullptr,&result)==napi_ok?result:nullptr;
    }
    if(method.name=="quarantined") {
      if(argc!=1)throw std::runtime_error("Invalid runtime quarantine query");
      const auto relative=RuntimeRelative(*scope,RuntimeString(env,args[0]));
      aux_runtime_cache::Fd parent(aux_runtime_cache::Parent(scope->lease->task.fd,relative.c_str()));
      aux_runtime_cache::Fd file(parent.fd<0?-1:openat(parent.fd,aux_runtime_cache::Leaf(relative.c_str()),aux_runtime_cache::kRead));
      if(file.fd<0)throw std::runtime_error("Runtime quarantine leaf unavailable");
      auto length=fgetxattr(file.fd,"com.apple.quarantine",nullptr,0,0,0);
      if(length<0&&errno!=ENOATTR)throw std::runtime_error("Runtime quarantine query failed");
      napi_get_boolean(env,length>=0,&result);return result;
    }
    if(scope->lease->mode!=aux_runtime_publication::Mode::kExclusiveMutation)throw std::runtime_error("Runtime mutation requires exclusive ownership");
    if(method.name=="stage") {
      if(argc||!scope->install_name.empty())throw std::runtime_error("Runtime stage already created");
      std::array<unsigned char,16> bytes{};arc4random_buf(bytes.data(),bytes.size());
      scope->install_name=".runtime-install-";constexpr char hex[]="0123456789abcdef";
      for(auto b:bytes){scope->install_name+=hex[b>>4];scope->install_name+=hex[b&15];}
      if(mkdirat(scope->lease->task.fd,scope->install_name.c_str(),0700))throw std::runtime_error("Runtime staging creation failed");
      auto absolute=scope->task_path+"/"+scope->install_name;
      napi_create_string_utf8(env,absolute.c_str(),NAPI_AUTO_LENGTH,&result);return result;
    }
    if(!argc)throw std::runtime_error("Runtime mutation path required");
    const auto first=RuntimeRelative(*scope,RuntimeString(env,args[0]));
    auto root=scope->lease->task.fd;
    if(method.name=="mkdir") {if(argc!=1)throw std::runtime_error("Invalid mkdir");RuntimeMkdir(root,first);return result;}
    aux_runtime_cache::Fd parent(aux_runtime_cache::Parent(root,first.c_str()));
    if(parent.fd<0)throw std::runtime_error("Runtime parent unavailable");
    const char* leaf=aux_runtime_cache::Leaf(first.c_str());
    if(method.name=="remove") {
      if(argc!=1||(first=="runtime"&&!scope->replacement_started))throw std::runtime_error("Runtime removal refused");
      size_t count=0;RuntimeRemoveAt(parent.fd,leaf,count);if(fsync(parent.fd))throw std::runtime_error("Runtime cleanup flush failed");
    }else if(method.name=="rename") {
      if(argc!=2)throw std::runtime_error("Invalid runtime rename");
      const auto second=RuntimeRelative(*scope,RuntimeString(env,args[1]));
      bool allowed=(first=="runtime"&&second=="runtime.backup")||(first=="runtime.backup"&&second=="runtime")||
        (!scope->install_name.empty()&&first.compare(0,(scope->install_name+"/extracted/aux-runtime-").size(),scope->install_name+"/extracted/aux-runtime-")==0&&second=="runtime");
      if(!allowed)throw std::runtime_error("Only whole runtime replacement is allowed");
      aux_runtime_cache::Fd target(aux_runtime_cache::Parent(root,second.c_str()));
      if(target.fd<0)throw std::runtime_error("Runtime target unavailable");
      if(renameatx_np(parent.fd,leaf,target.fd,aux_runtime_cache::Leaf(second.c_str()),RENAME_EXCL)){
        if(errno!=EEXIST)scope->Unknown();throw std::runtime_error("Runtime rename failed or outcome unknown");
      }
      scope->replacement_started=true;
      if(fsync(parent.fd)||fsync(target.fd)){scope->Unknown();throw std::runtime_error("Runtime replacement durability unknown");}
    }else if(method.name=="copy") {
      if(argc!=2)throw std::runtime_error("Invalid runtime copy");
      const auto second=RuntimeRelative(*scope,RuntimeString(env,args[1]));
      const std::string targetleaf=aux_runtime_cache::Leaf(second.c_str());
      if(targetleaf!=leaf)throw std::runtime_error("Runtime copy leaf mismatch");
      aux_runtime_cache::Fd target(aux_runtime_cache::Parent(root,second.c_str()));if(target.fd<0)throw std::runtime_error("Runtime copy target unavailable");
      size_t count=0;RuntimeCopyAt(parent.fd,leaf,target.fd,count);
    }else if(method.name=="write") {
      void* bytes=nullptr;size_t size=0;bool append=false,is_buffer=false;
      if(argc!=3||napi_is_buffer(env,args[1],&is_buffer)!=napi_ok||!is_buffer||napi_get_buffer_info(env,args[1],&bytes,&size)!=napi_ok||size>8*1024*1024||napi_get_value_bool(env,args[2],&append)!=napi_ok)throw std::runtime_error("Invalid runtime write");
      aux_runtime_cache::Fd file(openat(parent.fd,leaf,O_WRONLY|O_CREAT|O_NOFOLLOW|O_NONBLOCK|O_CLOEXEC|(append?O_APPEND:0),0600));
      struct stat st{};if(file.fd<0||fstat(file.fd,&st)||!S_ISREG(st.st_mode)||st.st_nlink!=1||!aux_runtime_cache::Private(st))throw std::runtime_error("Unsafe runtime write leaf");
      if((!append&&ftruncate(file.fd,0))||!aux_runtime_publication::WriteAll(file.fd,static_cast<const char*>(bytes),size,[scope](){return scope->Current();})||fsync(file.fd))throw std::runtime_error("Runtime write failed");
    }else if(method.name=="chmod") {
      uint32_t mode=0;if(argc!=2||napi_get_value_uint32(env,args[1],&mode)!=napi_ok||mode>0777||(mode&0022))throw std::runtime_error("Unsafe runtime mode");
      aux_runtime_cache::Fd file(openat(parent.fd,leaf,aux_runtime_cache::kRead));struct stat st{};
      if(file.fd<0||fstat(file.fd,&st)||!S_ISREG(st.st_mode)||st.st_nlink!=1||fchmod(file.fd,mode)||fsync(file.fd))throw std::runtime_error("Runtime chmod failed");
    }else if(method.name=="symlink") {
      if(argc!=2)throw std::runtime_error("Invalid runtime link");const auto target=RuntimeString(env,args[1]);
      if(target.empty()||target[0]=='/'||target.find('\0')!=std::string::npos||target.find('\\')!=std::string::npos)throw std::runtime_error("Unsafe runtime link");
      const auto floor=first.compare(0,scope->install_name.size(),scope->install_name)==0?3u:1u;
      size_t depth=std::count(first.begin(),first.end(),'/'),start=0;
      for(size_t end=0;;start=end+1){end=target.find('/',start);auto part=target.substr(start,end-start);
        if(part==".."){if(depth<=floor)throw std::runtime_error("Runtime link escapes archive root");--depth;}else if(!part.empty()&&part!=".")++depth;
        if(end==std::string::npos)break;
      }
      if(symlinkat(target.c_str(),parent.fd,leaf))throw std::runtime_error("Runtime link failed");
    }else throw std::runtime_error("Unknown runtime operation");
    return result;
  }catch(const std::exception& e){BrokerThrow(env,"AUX_RUNTIME_COORDINATION_REFUSED",e.what());return nullptr;}
  catch(...){scope->Unknown();BrokerThrow(env,"AUX_RUNTIME_COORDINATION_UNKNOWN","Runtime operation has an unknown outcome");return nullptr;}
}
void CleanupRuntimeScope(void* data){
  if(getpid()!=kHostProcess)return;
  auto* held=static_cast<std::shared_ptr<RuntimeScope>*>(data);(*held)->RequestClose();delete held;
}
napi_value RuntimeScopeObject(napi_env env,const std::shared_ptr<RuntimeScope>& scope){
  napi_value result;if(napi_create_object(env,&result)!=napi_ok)return nullptr;
  auto cleanup=std::make_unique<std::shared_ptr<RuntimeScope>>(scope);
  if(napi_add_env_cleanup_hook(env,CleanupRuntimeScope,cleanup.get())!=napi_ok)return nullptr;
  cleanup.release();
  for(const char* name:{"run","close","hasUnsettledWork","markUnknown","quarantined","stage","mkdir","remove","rename","copy","write","chmod","symlink"}){
    auto method=std::make_unique<RuntimeMethod>(RuntimeMethod{scope,name});napi_value fn;
    if(napi_create_function(env,name,NAPI_AUTO_LENGTH,RuntimeScopeMethod,method.get(),&fn)!=napi_ok||
       napi_add_finalizer(env,fn,method.get(),FinalizeRuntimeMethod,nullptr,nullptr)!=napi_ok)return nullptr;
    method.release();napi_property_descriptor property{name,nullptr,nullptr,nullptr,nullptr,fn,napi_enumerable,nullptr};
    if(napi_define_properties(env,result,1,&property)!=napi_ok)return nullptr;
  }
  auto held=std::make_unique<std::shared_ptr<RuntimeScope>>(scope);
  if(napi_add_finalizer(env,result,held.get(),[](napi_env,void* p,void*){if(getpid()!=kHostProcess)return;auto* scope=static_cast<std::shared_ptr<RuntimeScope>*>(p);(*scope)->RequestClose();delete scope;},nullptr,nullptr)!=napi_ok)return nullptr;
  held.release();if(napi_object_freeze(env,result)!=napi_ok)return nullptr;return result;
}
struct RuntimeAcquireWork {
  std::shared_ptr<RuntimeScope> scope;napi_env env=nullptr;napi_deferred deferred=nullptr;
  napi_async_work async=nullptr;napi_async_cleanup_hook_handle cleanup=nullptr;
  std::atomic<bool> cancelled{false};bool acquired=false,cleanup_started=false;
};
void ExecuteRuntimeAcquire(napi_env,void* data){auto* work=static_cast<RuntimeAcquireWork*>(data);try{if(!work->cancelled.load())work->acquired=AcquireRuntimeScope(work->scope);}catch(...){work->acquired=false;}}
void CleanupRuntimeAcquire(napi_async_cleanup_hook_handle,void* data){
  auto* work=static_cast<RuntimeAcquireWork*>(data);work->cleanup_started=true;work->cancelled.store(true);
  {std::lock_guard<std::mutex> lock(work->scope->captured.worker->mutex);work->scope->closed=true;}
  napi_cancel_async_work(work->env,work->async); // actual completion owns release
}
void CompleteRuntimeAcquire(napi_env env,napi_status status,void* data){
  std::unique_ptr<RuntimeAcquireWork> work(static_cast<RuntimeAcquireWork*>(data));bool delivered=false;
  if(env&&!work->cleanup_started&&status==napi_ok&&work->acquired&&work->scope->Current()){
    auto output=RuntimeScopeObject(env,work->scope);if(output)delivered=napi_resolve_deferred(env,work->deferred,output)==napi_ok;
  }
  if(!delivered){work->scope->RequestClose();if(env&&!work->cleanup_started){napi_value message,error;
    if(napi_create_string_utf8(env,"Runtime coordination unavailable or busy",NAPI_AUTO_LENGTH,&message)==napi_ok&&napi_create_error(env,nullptr,message,&error)==napi_ok)napi_reject_deferred(env,work->deferred,error);}}
  napi_delete_async_work(work->env,work->async);if(work->cleanup)napi_remove_async_cleanup_hook(work->cleanup);
}
napi_value AcquireRuntimeScopeBinding(napi_env env,napi_callback_info info,bool exclusive){
  std::unique_ptr<RuntimeAcquireWork> work;
  try{
    if(!BrokerZeroArgs(env,info))throw std::runtime_error("Runtime acquisition takes no arguments");
    auto captured=CaptureBrokerOwner(env);if(!captured.owner)throw std::runtime_error("Runtime owner unavailable");
    work=std::make_unique<RuntimeAcquireWork>();work->scope=NewRuntimeScope(std::move(captured),exclusive);work->env=env;
    if(!work->scope)throw std::runtime_error("Runtime admission closed");
    napi_value promise,name;
    if(napi_create_promise(env,&work->deferred,&promise)!=napi_ok||napi_create_string_utf8(env,"AuxRuntimeAcquire",NAPI_AUTO_LENGTH,&name)!=napi_ok||
       napi_create_async_work(env,nullptr,name,ExecuteRuntimeAcquire,CompleteRuntimeAcquire,work.get(),&work->async)!=napi_ok||
       napi_add_async_cleanup_hook(env,CleanupRuntimeAcquire,work.get(),&work->cleanup)!=napi_ok||napi_queue_async_work(env,work->async)!=napi_ok)throw std::runtime_error("Runtime acquisition could not queue");
    work.release();return promise;
  }catch(const std::exception& e){
    if(work){if(work->async)napi_delete_async_work(env,work->async);if(work->cleanup)napi_remove_async_cleanup_hook(work->cleanup);if(work->scope)work->scope->RequestClose();}
    BrokerThrow(env,"AUX_RUNTIME_COORDINATION_UNAVAILABLE",e.what());return nullptr;
  }
}
napi_value AcquireRuntimeMutation(napi_env env,napi_callback_info info){return AcquireRuntimeScopeBinding(env,info,true);}
napi_value AcquireRuntimeUse(napi_env env,napi_callback_info info){return AcquireRuntimeScopeBinding(env,info,false);}
