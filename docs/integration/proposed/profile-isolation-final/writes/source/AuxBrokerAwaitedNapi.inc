// Exact Node 26.5 js_native_api_v8.h handle conversion, without importing its
// internal environment implementation. Source/header digest recorded in receipt.
static_assert(sizeof(v8::Local<v8::Value>) == sizeof(napi_value));
inline v8::Local<v8::Value> AuxBrokerV8Value(napi_value value) {
  v8::Local<v8::Value> local;memcpy(static_cast<void*>(&local),&value,sizeof(value));return local;
}
inline napi_value AuxBrokerNapiValue(v8::Local<v8::Value> local) {
  return reinterpret_cast<napi_value>(*local);
}
// Internal observer for the pinned finite producers. This is not a public
// Promise-drain capability: callers must establish that their exact Promise
// resolves only after all operations/owned handles have actually completed.
struct AwaitedBrokerWork {
  BrokerOwner captured;
  bool counted=false, finished=false;
  ~AwaitedBrokerWork(){Finish(false);}
  bool Finish(bool known){
    if(getpid()!=kHostProcess||!counted||finished)return false;
    std::lock_guard<std::mutex> lock(captured.worker->mutex);
    --captured.worker->broker_pending;finished=true;
    if(!known)captured.worker->broker_untracked=true;
    return known;
  }
};
struct AwaitedBrokerObserver {
  std::shared_ptr<AwaitedBrokerWork> work;
  bool success;
};
void FinalizeAwaitedBrokerObserver(napi_env,void* data,void*) {
  if(getpid()!=kHostProcess)return; // Inherited child must not release parent ownership.
  delete static_cast<AwaitedBrokerObserver*>(data);
}
napi_value SettleAwaitedBroker(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  size_t count=1;napi_value value;void* data=nullptr;
  if(napi_get_cb_info(env,info,&count,&value,nullptr,&data)!=napi_ok)return nullptr;
  auto* observer=static_cast<AwaitedBrokerObserver*>(data);
  auto& work=*observer->work;
  bool current=AuxNativeContextValidateCurrentAuthority(work.captured.owner->handle)==0;
  {std::lock_guard<std::mutex> lock(work.captured.worker->mutex);
    current=current&&CurrentWorker(*work.captured.worker)&&!work.captured.worker->terminal&&
      !work.captured.worker->environment_detached&&work.captured.worker->owner==work.captured.owner;
  }
  // Admission closure does not mean an already admitted finite writer ceased.
  // Rejection may represent failed cleanup, so it is always unknown custody.
  const bool known=work.Finish(observer->success&&current);
  if(!count)napi_get_undefined(env,&value);
  if(!observer->success){napi_throw(env,value);return nullptr;}
  if(!known){BrokerThrow(env,"AUX_BROKER_OUTCOME_UNKNOWN","Awaited writer authority changed or outcome is unknown");return nullptr;}
  return value;
}
napi_value WithBrokerAwaited(napi_env env,napi_callback_info info) {
  if(getpid()!=kHostProcess)return nullptr;
  try{
    auto work=std::make_shared<AwaitedBrokerWork>();
    work->captured=CaptureBrokerOwner(env);
    size_t count=2;napi_value args[2],receiver,result;napi_valuetype type;
    if(!work->captured.owner||napi_get_cb_info(env,info,&count,args,nullptr,nullptr)!=napi_ok||count!=1||napi_typeof(env,args[0],&type)!=napi_ok||type!=napi_function){BrokerThrow(env,"AUX_BROKER_OWNER_UNAVAILABLE","Current native broker owner is unavailable");return nullptr;}
    {std::lock_guard<std::mutex> lock(work->captured.worker->mutex);
      if(CurrentWorker(*work->captured.worker)&&!work->captured.worker->terminal&&!work->captured.worker->broker_closed&&work->captured.worker->owner==work->captured.owner&&work->captured.worker->broker_pending!=std::numeric_limits<size_t>::max()){
        ++work->captured.worker->broker_pending;work->counted=true;
      }
    }
    if(!work->counted){BrokerThrow(env,"AUX_BROKER_CLOSED","Broker write admission is closed");return nullptr;}
    if(napi_get_undefined(env,&receiver)!=napi_ok)return nullptr;
    if(napi_call_function(env,receiver,args[0],0,nullptr,&result)!=napi_ok)return nullptr;
    bool promise=false;
    if(napi_is_promise(env,result,&promise)!=napi_ok||!promise){BrokerThrow(env,"AUX_BROKER_EXPECTED_PROMISE","Reviewed awaited writer must return a native Promise");return nullptr;}
    napi_value callbacks[2];
    for(int i=0;i<2;++i){
      auto observer=std::make_unique<AwaitedBrokerObserver>(AwaitedBrokerObserver{work,i==0});
      if(napi_create_function(env,nullptr,0,SettleAwaitedBroker,observer.get(),&callbacks[i])!=napi_ok)return nullptr;
      if(napi_add_finalizer(env,callbacks[i],observer.get(),FinalizeAwaitedBrokerObserver,nullptr,nullptr)!=napi_ok)return nullptr;
      observer.release();
    }
    // Call V8's intrinsic Then, never a writable JS .then property.
    auto* isolate=v8::Isolate::GetCurrent();
    auto input=AuxBrokerV8Value(result).As<v8::Promise>();
    v8::Local<v8::Promise> observed;
    if(!input->Then(isolate->GetCurrentContext(),AuxBrokerV8Value(callbacks[0]).As<v8::Function>(),AuxBrokerV8Value(callbacks[1]).As<v8::Function>()).ToLocal(&observed))return nullptr;
    return AuxBrokerNapiValue(observed);
  }catch(...){BrokerThrow(env,"AUX_BROKER_OUTCOME_UNKNOWN","Awaited writer custody could not be established");return nullptr;}
}
