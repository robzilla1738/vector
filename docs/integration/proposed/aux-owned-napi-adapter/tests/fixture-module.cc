// FIXTURE ONLY module init. Production adapter supplies NO standalone module init.
#include "../source/aux-owned-napi-adapter.h"
extern "C" void* AuxFixtureCreateOwner(uint64_t*);
extern "C" void AuxFixtureReleaseOwner(void*);
extern "C" uint64_t AuxFixtureCreatedCount();
extern "C" uint64_t AuxFixtureReleasedCount();
namespace {
napi_value Counts(napi_env env,napi_callback_info) {
  napi_value result,created,released;
  napi_create_object(env,&result);
  napi_create_double(env,static_cast<double>(AuxFixtureCreatedCount()),&created);
  napi_create_double(env,static_cast<double>(AuxFixtureReleasedCount()),&released);
  napi_set_named_property(env,result,"created",created);
  napi_set_named_property(env,result,"released",released);
  return result;
}
napi_value Init(napi_env env,napi_value exports) {
  // Failed target definition must consume/release its native retained owner once.
  uint64_t failed_handle=0;
  void* failed_owner=AuxFixtureCreateOwner(&failed_handle);
  napi_value frozen;
  napi_create_object(env,&frozen);napi_object_freeze(env,frozen);
  if(!failed_owner || AuxAttachOwnedDispatcher(env,frozen,failed_handle,failed_owner,AuxFixtureReleaseOwner)==napi_ok) {
    napi_throw_error(env,nullptr,"Synthetic failed attach case failed");return nullptr;
  }
  bool pending=false;napi_is_exception_pending(env,&pending);
  if(pending){napi_value ignored;napi_get_and_clear_last_exception(env,&ignored);}
  uint64_t handle=0;
  void* owner=AuxFixtureCreateOwner(&handle);
  if(!owner || AuxAttachOwnedDispatcher(env,exports,handle,owner,AuxFixtureReleaseOwner)!=napi_ok) {
    napi_throw_error(env,nullptr,"Synthetic native producer failed");return nullptr;
  }
  napi_value counts;
  napi_create_function(env,"fixtureCounts",NAPI_AUTO_LENGTH,Counts,nullptr,&counts);
  napi_set_named_property(env,exports,"fixtureCounts",counts);
  return exports;
}
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,Init)
