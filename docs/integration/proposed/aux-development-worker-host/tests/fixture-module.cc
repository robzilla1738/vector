// TEST ONLY: synthetic authority factory and public JS test controls.
#include "AuxDevelopmentWorkerHost.h"
#include <node_api.h>
#include <atomic>
#include <cstdint>
extern "C" void* AuxFixtureCreateOwner(uint64_t*);
extern "C" void AuxFixtureReleaseOwner(void*);
extern "C" uint64_t AuxFixtureCreatedCount();
extern "C" uint64_t AuxFixtureReleasedCount();
static AuxDevelopmentWorkerHost host;
static AuxDevelopmentWorkerHost other;
static std::atomic<bool> fail_next{false};
static std::atomic<int32_t> drain_status{0};
extern "C" int32_t AuxFixtureActualOwnerOSAdmission(void*);
extern "C" int32_t AuxCloseDevelopmentOwnerOSAdmission(void* value) {
  const int32_t status=drain_status.load();
  return status?status:AuxFixtureActualOwnerOSAdmission(value);
}
static std::atomic<uint64_t> attempted{0};
static thread_local uint64_t worker_handle=0;
extern "C" int32_t AuxFixtureBeginBlockingLease(uint64_t);
extern "C" int32_t AuxFixtureLeaseCompleted();
extern "C" int32_t AuxCreateSignedDevelopmentOwner(uint64_t* handle, void** owner) {
  *handle=0;*owner=nullptr;++attempted;
  if (fail_next.exchange(false)) return -1;
  *owner=AuxFixtureCreateOwner(handle);worker_handle=*handle;
  return *owner && *handle ? 0:-1;
}
extern "C" void AuxReleaseSignedDevelopmentOwner(void* value) { AuxFixtureReleaseOwner(value); }
static napi_value Register(napi_env env,napi_callback_info info) {
  size_t argc=1;napi_value arg;void* data=nullptr;
  napi_get_cb_info(env,info,&argc,&arg,nullptr,&data);
  napi_value out;
  auto& current=data?other:host;
  napi_create_int32(env,argc?current.RegisterCurrentWorker(env,arg):napi_invalid_arg,&out);
  return out;
}
static napi_value BeginLease(napi_env env,napi_callback_info) {
  napi_value out;napi_create_int32(env,AuxFixtureBeginBlockingLease(worker_handle),&out);return out;
}
static napi_value LeaseCompleted(napi_env env,napi_callback_info) {
  napi_value out;napi_create_int32(env,AuxFixtureLeaseCompleted(),&out);return out;
}
static napi_value Close(napi_env env,napi_callback_info) {
  napi_value out;napi_create_int32(env,static_cast<int32_t>(host.CloseAndDrain()),&out);return out;
}
static napi_value FailNext(napi_env env,napi_callback_info) {
  fail_next=true;napi_value out;napi_get_undefined(env,&out);return out;
}
static napi_value SetDrain(napi_env env,napi_callback_info info) {
  size_t argc=1;napi_value arg;int32_t status=-1;
  napi_get_cb_info(env,info,&argc,&arg,nullptr,nullptr);
  if(argc)napi_get_value_int32(env,arg,&status);
  if(status<0 || status>2){napi_throw_error(env,nullptr,"bad captured drain status");return nullptr;}
  drain_status=status;napi_value out;napi_get_undefined(env,&out);return out;
}
static napi_value Counts(napi_env env,napi_callback_info) {
  napi_value out,value;napi_create_object(env,&out);
  napi_create_double(env,attempted.load(),&value);napi_set_named_property(env,out,"attempted",value);
  napi_create_double(env,AuxFixtureCreatedCount(),&value);napi_set_named_property(env,out,"created",value);
  napi_create_double(env,AuxFixtureReleasedCount(),&value);napi_set_named_property(env,out,"released",value);
  return out;
}
static napi_value Init(napi_env env,napi_value exports) {
  napi_property_descriptor props[]={
    {"register",nullptr,Register,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"registerOther",nullptr,Register,nullptr,nullptr,nullptr,napi_default,reinterpret_cast<void*>(1)},
    {"close",nullptr,Close,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"failNext",nullptr,FailNext,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"counts",nullptr,Counts,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"beginLease",nullptr,BeginLease,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"leaseCompleted",nullptr,LeaseCompleted,nullptr,nullptr,nullptr,napi_default,nullptr},
    {"setDrain",nullptr,SetDrain,nullptr,nullptr,nullptr,napi_default,nullptr}};
  napi_define_properties(env,exports,8,props);return exports;
}
NAPI_MODULE(AuxWorkerLifecycleFixture,Init)
