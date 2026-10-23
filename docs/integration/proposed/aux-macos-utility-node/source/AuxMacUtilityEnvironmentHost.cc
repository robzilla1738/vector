#include "AuxMacUtilityEnvironmentHost.h"
#include <node.h>
#include <uv.h>
#include <unistd.h>
#include <pthread.h>
#include <dlfcn.h>
#include <mutex>
#include <unordered_map>
#include <vector>
#include <string>
#include <cstdlib>
#include <limits>
extern "C" void* AuxCreateMacUtilityOwner();
extern "C" char* AuxRunMacUtilityOwner(void*,const char*,const char*);
extern "C" int32_t AuxCloseMacUtilityOwner(void*);
extern "C" void AuxReleaseMacUtilityOwner(void*);
namespace {
// Captured by image initialization, not first operation/pending observation.
// A child inheriting an already-loaded image cannot adopt a fresh PID later.
const pid_t kImageProcess=getpid();
struct Worker {
  const uint64_t generation;const pid_t process=getpid();
  node::Environment* const environment;v8::Isolate* const isolate;const pthread_t thread=pthread_self();
  std::mutex mutex;void* owner=nullptr;size_t active=0;bool closed=false,initializing=true,cleanup=false,draining=false;
  Worker(uint64_t g,node::Environment* e,v8::Isolate* i):generation(g),environment(e),isolate(i){}
  AuxMacUtilityDrain Close() {
    void* captured;
    {std::lock_guard lock(mutex);closed=true;if(initializing&&!owner)return AuxMacUtilityDrain::pending;captured=owner;}
    // Swift closure may wait/observe callbacks; never hold native mutex across it.
    if(!captured)return AuxMacUtilityDrain::drained;
    int32_t result=AuxCloseMacUtilityOwner(captured);
    if(result!=0)return result==1?AuxMacUtilityDrain::pending:AuxMacUtilityDrain::untracked;
    // Caller serializes drain invocations separately, with no callback lock held.
    {std::lock_guard lock(mutex);if(active||initializing)return AuxMacUtilityDrain::pending;if(owner==captured)owner=nullptr;else return AuxMacUtilityDrain::untracked;}
    AuxReleaseMacUtilityOwner(captured);return AuxMacUtilityDrain::drained;
  }
  // Drain concurrent/reentrant observation: reserve rather than block a callback.
  std::mutex drain_mutex;
  AuxMacUtilityDrain InspectClose(){
    if(!drain_mutex.try_lock())return AuxMacUtilityDrain::pending;
    {std::lock_guard lock(mutex);draining=true;}
    auto result=Close();{std::lock_guard lock(mutex);draining=false;}
    drain_mutex.unlock();return result;
  }
};
struct Registry {
 std::mutex mutex;uint64_t next=1;bool admission_closed=false;
 std::unordered_map<node::Environment*,std::shared_ptr<Worker>> active;
 std::unordered_map<uint64_t,std::shared_ptr<Worker>> retained;
};
Registry& registry(){static auto* value=new Registry;return *value;}
bool PinOwnCode(){
 // Pending callbacks may outlive Environment teardown. Retain this exact loaded
 // image natively; no caller path, load of a new image, or dlclose-on-timeout.
 static void* const image=[]()->void*{Dl_info info{};if(!dladdr(reinterpret_cast<void*>(&PinOwnCode),&info)||!info.dli_fname)return nullptr;
 return dlopen(info.dli_fname,RTLD_NOLOAD|RTLD_LOCAL|RTLD_NOW);}();return image!=nullptr;
}
void Detach(const std::shared_ptr<Worker>& worker){
 std::lock_guard w(worker->mutex);if(!worker->cleanup)return;
 std::lock_guard r(registry().mutex);auto i=registry().active.find(worker->environment);
 if(i!=registry().active.end()&&i->second==worker)registry().active.erase(i);
 if(!worker->owner&&!worker->active&&!worker->initializing)registry().retained.erase(worker->generation);
}
void Cleanup(void* data){if(getpid()!=kImageProcess)return;auto* retain=static_cast<std::shared_ptr<Worker>*>(data);auto worker=*retain;
 worker->InspectClose();{std::lock_guard lock(worker->mutex);worker->cleanup=true;}Detach(worker);delete retain;
}
struct Observation{napi_env expected;node::Environment* environment;v8::Isolate* isolate;bool matched=false;};
napi_value Observe(napi_env env,napi_callback_info info){void* data=nullptr;size_t argc=0;if(napi_get_cb_info(env,info,&argc,nullptr,nullptr,&data)!=napi_ok||!data)return nullptr;
 auto* o=static_cast<Observation*>(data);auto* i=v8::Isolate::GetCurrent();o->matched=env==o->expected&&i==o->isolate&&!i->GetCurrentContext().IsEmpty()&&node::GetCurrentEnvironment(i->GetCurrentContext())==o->environment;
 napi_value value=nullptr;napi_get_undefined(env,&value);return value;
}
bool SameEnvironment(napi_env env,node::Environment* e,v8::Isolate* i){Observation o{env,e,i};napi_value f,receiver,result;uv_loop_t* loop=nullptr;
 return napi_get_uv_event_loop(env,&loop)==napi_ok&&loop==node::GetCurrentEventLoop(i)&&napi_create_function(env,"auxObserveMacUtility",NAPI_AUTO_LENGTH,Observe,&o,&f)==napi_ok&&napi_get_undefined(env,&receiver)==napi_ok&&napi_call_function(env,receiver,f,0,nullptr,&result)==napi_ok&&o.matched;
}
napi_value Fail(napi_env env,const char* message){napi_throw_error(env,nullptr,message);return nullptr;}
bool Read(napi_env env,napi_value value,std::string& text){size_t size=0;if(napi_get_value_string_utf8(env,value,nullptr,0,&size)!=napi_ok)return false;
 text.resize(size+1);size_t actual=0;if(napi_get_value_string_utf8(env,value,text.data(),text.size(),&actual)!=napi_ok||actual!=size)return false;text.resize(size);return text.find('\0')==std::string::npos;
}
napi_value Run(napi_env env,napi_callback_info info){size_t argc=2;napi_value args[2];void* data=nullptr;
 if(napi_get_cb_info(env,info,&argc,args,nullptr,&data)!=napi_ok||!data)return Fail(env,"Native utility callback unavailable");
 auto* w=static_cast<Worker*>(data);auto* isolate=v8::Isolate::GetCurrent();
 if(getpid()!=kImageProcess||getpid()!=w->process||!pthread_equal(pthread_self(),w->thread)||isolate!=w->isolate||isolate->GetCurrentContext().IsEmpty()||node::GetCurrentEnvironment(isolate->GetCurrentContext())!=w->environment)return Fail(env,"Native utility Environment mismatch");
 if(!argc){napi_throw_type_error(env,nullptr,"run(command, input) requires a command");return nullptr;}
 std::string command,input;if(!Read(env,args[0],command)||(argc>1&&!Read(env,args[1],input))){napi_throw_type_error(env,nullptr,"Native utility command and input must be strings without NUL");return nullptr;}
 void* owner;{std::lock_guard lock(w->mutex);if(w->closed||!w->owner)return Fail(env,"Native utility admission is closed");if(w->active)return Fail(env,"Native utility call is reentrant");++w->active;owner=w->owner;}
 char* raw=AuxRunMacUtilityOwner(owner,command.c_str(),input.c_str());
 {std::lock_guard lock(w->mutex);--w->active;}
 napi_value output=nullptr;if(raw){auto status=napi_create_string_utf8(env,raw,NAPI_AUTO_LENGTH,&output);free(raw);if(status!=napi_ok)return nullptr;}else return Fail(env,"Native utility returned no output");
 return output;
}
}
struct AuxMacUtilityEnvironmentHost::State{const pid_t process=getpid();std::mutex mutex;bool closed=false;std::vector<std::shared_ptr<Worker>> workers;};
AuxMacUtilityEnvironmentHost::AuxMacUtilityEnvironmentHost():state_(std::make_shared<State>()){}
AuxMacUtilityEnvironmentHost::~AuxMacUtilityEnvironmentHost(){CloseAndDrain();}
napi_status AuxMacUtilityEnvironmentHost::AttachCurrentEnvironment(napi_env env,napi_value exports){
 if(getpid()!=kImageProcess)return napi_generic_failure;
 if(!env||!exports||getpid()!=state_->process)return napi_invalid_arg;
 if(!PinOwnCode())return napi_generic_failure;auto* isolate=v8::Isolate::GetCurrent();if(!isolate||isolate->GetCurrentContext().IsEmpty())return napi_generic_failure;
 auto* environment=node::GetCurrentEnvironment(isolate->GetCurrentContext());if(!environment||!SameEnvironment(env,environment,isolate))return napi_generic_failure;
 std::shared_ptr<Worker> w;auto* retain=static_cast<std::shared_ptr<Worker>*>(nullptr);
 {std::lock_guard h(state_->mutex);if(state_->closed)return napi_closing;
  std::lock_guard r(registry().mutex);if(registry().admission_closed)return napi_closing;if(registry().active.count(environment)||registry().next==std::numeric_limits<uint64_t>::max())return napi_generic_failure;
  w=std::make_shared<Worker>(registry().next++,environment,isolate);retain=new std::shared_ptr<Worker>(w);registry().active.emplace(environment,w);registry().retained.emplace(w->generation,w);state_->workers.push_back(w);
 }
 auto finish=[&](napi_status status){bool closed;{std::lock_guard lock(w->mutex);w->initializing=false;if(status!=napi_ok)w->closed=true;closed=w->closed;}if(closed)w->InspectClose();Detach(w);return status==napi_ok&&closed?napi_closing:status;};
 auto status=napi_add_env_cleanup_hook(env,Cleanup,retain);if(status!=napi_ok){node::AddEnvironmentCleanupHook(isolate,Cleanup,retain);return finish(status);}
 bool was_closed;{std::lock_guard lock(w->mutex);was_closed=w->closed;}if(was_closed)return finish(napi_closing);
 void* owner=AuxCreateMacUtilityOwner();{std::lock_guard lock(w->mutex);w->owner=owner;}
 if(!owner)return finish(napi_generic_failure);
 bool closed;{std::lock_guard lock(w->mutex);closed=w->closed;}if(closed)return finish(napi_closing);
 napi_value run;if((status=napi_create_function(env,"run",NAPI_AUTO_LENGTH,Run,w.get(),&run))!=napi_ok)return finish(status);
 napi_property_descriptor property{"run",nullptr,nullptr,nullptr,nullptr,run,napi_default,nullptr};
 status=napi_define_properties(env,exports,1,&property);return finish(status);
}
AuxMacUtilityDrain AuxMacUtilityEnvironmentHost::CloseAndDrain(){if(getpid()!=kImageProcess||getpid()!=state_->process)return AuxMacUtilityDrain::wrongProcess;
 std::vector<std::shared_ptr<Worker>> workers;{std::lock_guard lock(state_->mutex);state_->closed=true;workers=state_->workers;}
 auto result=AuxMacUtilityDrain::drained;for(auto& w:workers){auto current=w->InspectClose();Detach(w);if(current==AuxMacUtilityDrain::untracked)result=current;else if(current==AuxMacUtilityDrain::pending&&result==AuxMacUtilityDrain::drained)result=current;}return result;
}

extern "C" uint64_t AuxMacUtilityPendingEnvironments(){
 if(getpid()!=kImageProcess)return std::numeric_limits<uint64_t>::max();
 std::vector<std::shared_ptr<Worker>> workers;
 {std::lock_guard lock(registry().mutex);for(const auto& entry:registry().retained)workers.push_back(entry.second);}
 uint64_t count=0;
 for(const auto& worker:workers){std::lock_guard lock(worker->mutex);if(worker->owner||worker->active||worker->initializing||worker->draining)++count;}
 return count;
}
extern "C" int32_t AuxMacUtilityCloseAdmissionAndDrain(){
 if(getpid()!=kImageProcess)return -1; // Before any inherited mutex/native owner.
 std::vector<std::shared_ptr<Worker>> workers;
 {std::lock_guard lock(registry().mutex);registry().admission_closed=true;for(const auto& entry:registry().retained)workers.push_back(entry.second);}
 int32_t result=0;
 for(const auto& worker:workers){auto status=worker->InspectClose();Detach(worker);
  if(status==AuxMacUtilityDrain::untracked)result=2;
  else if(status!=AuxMacUtilityDrain::drained&&result==0)result=1;
 }
 // A concurrent close/initialization/release cannot become success merely
 // because another observer still owns its drain reservation.
 if(result==0&&AuxMacUtilityPendingEnvironments()!=0)return 1;
 return result;
}
