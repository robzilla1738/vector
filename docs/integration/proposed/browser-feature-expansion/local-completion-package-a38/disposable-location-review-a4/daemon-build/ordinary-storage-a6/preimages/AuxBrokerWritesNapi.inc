// Finite synchronous writer guard. No native token/owner selector is exported.
struct BrokerOwner {
  std::shared_ptr<Worker> worker;
  std::shared_ptr<Owner> owner;
};
BrokerOwner CaptureBrokerOwner(napi_env env) {
  if(getpid()!=kHostProcess)return {};
  auto* isolate=v8::Isolate::GetCurrent();
  if(!isolate||isolate->GetCurrentContext().IsEmpty())return {};
  auto* environment=node::GetCurrentEnvironment(isolate->GetCurrentContext());
  std::shared_ptr<Worker> worker;
  {std::lock_guard<std::mutex> lock(Registry().mutex);auto found=Registry().active.find(environment);if(found!=Registry().active.end())worker=found->second;}
  if(!worker||!SameRuntimeEnvironment(env,environment,isolate))return {};
  std::shared_ptr<Owner> owner;
  {std::lock_guard<std::mutex> lock(worker->mutex);if(CurrentWorker(*worker)&&!worker->terminal&&!worker->broker_closed&&!worker->initializing&&!worker->environment_detached)owner=worker->owner;}
  if(!owner||AuxNativeContextValidateCurrentAuthority(owner->handle)!=0)return {};
  {std::lock_guard<std::mutex> lock(worker->mutex);if(!CurrentWorker(*worker)||worker->terminal||worker->broker_closed||worker->initializing||worker->environment_detached||worker->owner!=owner)return {};}
  return {worker,owner};
}
void BrokerThrow(napi_env env,const char* code,const char* text) {
  bool pending=false;
  if(napi_is_exception_pending(env,&pending)==napi_ok&&pending){napi_value ignored;napi_get_and_clear_last_exception(env,&ignored);}
  napi_throw_error(env,code,text);
}
bool BrokerZeroArgs(napi_env env,napi_callback_info info) {
  size_t count=1;napi_value unused;
  return napi_get_cb_info(env,info,&count,&unused,nullptr,nullptr)==napi_ok&&count==0;
}
napi_value AssertBrokerOwner(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  try{
    if(!BrokerZeroArgs(env,info)||!CaptureBrokerOwner(env).owner){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
    napi_value result;napi_get_undefined(env,&result);return result;
  }catch(...){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
}
napi_value CloseBrokerWriteAdmission(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  try{
    auto captured=CaptureBrokerOwner(env);
    if(!BrokerZeroArgs(env,info)||!captured.owner){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
    {std::lock_guard<std::mutex> lock(captured.worker->mutex);captured.worker->broker_closed=true;}
    // This closes only guarded writer admission. It is NOT a drained result.
    napi_value result;napi_get_undefined(env,&result);return result;
  }catch(...){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
}
napi_value NoteUntrackedBrokerWork(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  try{
    auto captured=CaptureBrokerOwner(env);
    if(!BrokerZeroArgs(env,info)||!captured.owner){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
    {std::lock_guard<std::mutex> lock(captured.worker->mutex);captured.worker->broker_untracked=true;}
    // One-way strongest uncertainty, never a JS-provided completed-work flag.
    napi_value result;napi_get_undefined(env,&result);return result;
  }catch(...){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
}
napi_value WithBrokerSync(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  struct Active {
    BrokerOwner captured;
    bool counted=false,finished=false;
    ~Active(){if(counted&&!finished){std::lock_guard<std::mutex> lock(captured.worker->mutex);--captured.worker->broker_pending;captured.worker->broker_untracked=true;}}
    bool Finish(bool known){std::lock_guard<std::mutex> lock(captured.worker->mutex);--captured.worker->broker_pending;finished=true;if(!known)captured.worker->broker_untracked=true;return known;}
  } active;
  try{
    // Reserve before invoking the sole reviewed synchronous callback. No input
    // pathname/account/generation selects this native Owner.
    active.captured=CaptureBrokerOwner(env);
    size_t count=2;napi_value args[2],receiver,result;napi_valuetype type;
    if(!active.captured.owner||napi_get_cb_info(env,info,&count,args,nullptr,nullptr)!=napi_ok||count!=1||napi_typeof(env,args[0],&type)!=napi_ok||type!=napi_function){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
    bool admitted=false;
    {std::lock_guard<std::mutex> lock(active.captured.worker->mutex);
      admitted=CurrentWorker(*active.captured.worker)&&!active.captured.worker->terminal&&!active.captured.worker->broker_closed&&active.captured.worker->owner==active.captured.owner&&active.captured.worker->broker_pending!=std::numeric_limits<size_t>::max();
      if(admitted){++active.captured.worker->broker_pending;active.counted=true;}
    }
    if(!admitted){BrokerThrow(env,"AUX_BROKER_CLOSED","Broker write admission is closed");return nullptr;}
    if(napi_get_undefined(env,&receiver)!=napi_ok)return nullptr;
    const auto status=napi_call_function(env,receiver,args[0],0,nullptr,&result);
    // The finite sources call only synchronous filesystem/SQLite methods.
    // A Promise return is unsupported and retains uncertainty; its settlement
    // can never release underlying deferred/background work through this API.
    bool promise=false;
    if(status==napi_ok&&napi_is_promise(env,result,&promise)!=napi_ok)return nullptr;
    bool current=AuxNativeContextValidateCurrentAuthority(active.captured.owner->handle)==0;
    {std::lock_guard<std::mutex> lock(active.captured.worker->mutex);current=current&&CurrentWorker(*active.captured.worker)&&!active.captured.worker->terminal&&!active.captured.worker->broker_closed&&active.captured.worker->owner==active.captured.owner;}
    if(!active.Finish(current&&!promise&&(status==napi_ok||status==napi_pending_exception))){BrokerThrow(env,promise?"AUX_BROKER_UNTRACKED_ASYNC":"AUX_BROKER_OUTCOME_UNKNOWN",promise?"Deferred broker work cannot settle synchronously":"Broker write authority changed; outcome requires reconciliation");return nullptr;}
    return status==napi_ok?result:nullptr; // Preserve the original synchronous throw.
  }catch(...){BrokerThrow(env,"AUX_BROKER_OUTCOME_UNKNOWN","Broker operation did not establish a completed synchronous outcome");return nullptr;}
}
