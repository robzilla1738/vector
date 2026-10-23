// TEST ONLY immutable software producer. No production initializer.
#include "../../aux-owned-napi-adapter/source/aux-owned-napi-adapter.h"
#include "../../aux-owned-dispatch-lifetime/source/aux-owned-command-dispatcher.h"
extern "C" void* AuxFixtureCreateOwner(uint64_t*);
extern "C" void AuxFixtureReleaseOwner(void*);
namespace {
uint64_t fixture_handle = 0; // Fixed TEST module, never production selected scope.
napi_value Retire(napi_env env,napi_callback_info) {
  napi_value value;napi_create_int32(env,AuxNativeContextRetire(fixture_handle),&value);return value;
}
napi_value Init(napi_env env,napi_value exports) {
  void* owner=AuxFixtureCreateOwner(&fixture_handle);
  if(!owner || AuxAttachOwnedDispatcher(env,exports,fixture_handle,owner,AuxFixtureReleaseOwner)!=napi_ok){napi_throw_error(env,nullptr,"Synthetic producer failed");return nullptr;}
  napi_value retire;napi_create_function(env,"fixtureRetire",NAPI_AUTO_LENGTH,Retire,nullptr,&retire);napi_set_named_property(env,exports,"fixtureRetire",retire);
  return exports;
}
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,Init)
