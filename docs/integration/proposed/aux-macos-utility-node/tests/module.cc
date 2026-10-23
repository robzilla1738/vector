// Captured-only initializer, absent from production library.
#include "AuxMacUtilityEnvironmentHost.h"
#include <node_api.h>
#include <mutex>
static AuxMacUtilityEnvironmentHost& Host(){static auto* host=new AuxMacUtilityEnvironmentHost;return *host;}
extern "C" int32_t AuxFixtureUtilityReleaseCount();
extern "C" void AuxFixtureCompleteUtilityCallbacks();
static napi_value Releases(napi_env env,napi_callback_info){napi_value result;napi_create_int32(env,AuxFixtureUtilityReleaseCount(),&result);return result;}
static napi_value Complete(napi_env env,napi_callback_info){AuxFixtureCompleteUtilityCallbacks();napi_value result;napi_get_undefined(env,&result);return result;}
static napi_value Again(napi_env env,napi_callback_info){napi_value object,result;napi_create_object(env,&object);napi_create_int32(env,Host().AttachCurrentEnvironment(env,object),&result);return result;}
static napi_value ImageClose(napi_env env,napi_callback_info){napi_value result;napi_create_int32(env,AuxMacUtilityCloseAdmissionAndDrain(),&result);return result;}
static napi_value ImagePending(napi_env env,napi_callback_info){napi_value result;napi_create_bigint_uint64(env,AuxMacUtilityPendingEnvironments(),&result);return result;}
static napi_value Close(napi_env env,napi_callback_info){napi_value result;napi_create_int32(env,static_cast<int>(Host().CloseAndDrain()),&result);return result;}
NAPI_MODULE_INIT(){ if(Host().AttachCurrentEnvironment(env,exports)!=napi_ok){napi_throw_error(env,nullptr,"fixture attach refused");return nullptr;}napi_value close;napi_create_function(env,"close",NAPI_AUTO_LENGTH,Close,nullptr,&close);napi_set_named_property(env,exports,"fixtureClose",close);
 napi_create_function(env,"released",NAPI_AUTO_LENGTH,Releases,nullptr,&close);napi_set_named_property(env,exports,"fixtureReleased",close);
 napi_create_function(env,"complete",NAPI_AUTO_LENGTH,Complete,nullptr,&close);napi_set_named_property(env,exports,"fixtureComplete",close);
 napi_create_function(env,"again",NAPI_AUTO_LENGTH,Again,nullptr,&close);napi_set_named_property(env,exports,"fixtureAgain",close);
 napi_create_function(env,"imageClose",NAPI_AUTO_LENGTH,ImageClose,nullptr,&close);napi_set_named_property(env,exports,"fixtureImageClose",close);
 napi_create_function(env,"imagePending",NAPI_AUTO_LENGTH,ImagePending,nullptr,&close);napi_set_named_property(env,exports,"fixtureImagePending",close);
return exports;}
