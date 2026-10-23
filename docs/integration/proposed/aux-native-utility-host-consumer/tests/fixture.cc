#ifndef AUX_UTILITY_HOST_CONSUMER_FIXTURE
#error("Fixture only, never production bootstrap")
#endif
#include "../source/AuxLoadedUtilityLifetime.h"
#include <node_api.h>
#include <memory>
// TEST-only producer. No policy/owner/protected operation is invoked. Native
// capture still derives the fixed running bundle path, never a JS path/flag.
static std::shared_ptr<AuxLoadedUtilityLifetime> captured;
static napi_value Capture(napi_env env,napi_callback_info){captured=AuxLoadedUtilityLifetime::CaptureAfterAuthenticatedOwner();napi_value v;napi_create_int32(env,static_cast<int>(captured->capture_status()),&v);return v;}
static napi_value Close(napi_env env,napi_callback_info){napi_value v;napi_create_int32(env,static_cast<int>(captured->CloseAndDrain()),&v);return v;}
static napi_value Retained(napi_env env,napi_callback_info){napi_value v;napi_create_double(env,AuxLoadedUtilityLifetime::RetainedUnresolvedImages(),&v);return v;}
static napi_value Inspect(napi_env env,napi_callback_info){auto result=captured->InspectIfClosureStarted();napi_value v;if(result)napi_create_int32(env,static_cast<int>(*result),&v);else napi_get_undefined(env,&v);return v;}
static napi_value Drop(napi_env env,napi_callback_info){captured.reset();napi_value v;napi_get_undefined(env,&v);return v;}
static napi_value ObserveRetained(napi_env env,napi_callback_info){napi_value v;napi_create_int32(env,static_cast<int>(AuxLoadedUtilityLifetime::InspectRetainedClosures()),&v);return v;}
NAPI_MODULE_INIT(){const napi_property_descriptor methods[]={{"retained",nullptr,Retained,nullptr,nullptr,nullptr,napi_default,nullptr},{"capture",nullptr,Capture,nullptr,nullptr,nullptr,napi_default,nullptr},{"close",nullptr,Close,nullptr,nullptr,nullptr,napi_default,nullptr},{"inspect",nullptr,Inspect,nullptr,nullptr,nullptr,napi_default,nullptr},{"drop",nullptr,Drop,nullptr,nullptr,nullptr,napi_default,nullptr},{"observeRetained",nullptr,ObserveRetained,nullptr,nullptr,nullptr,napi_default,nullptr}};napi_define_properties(env,exports,6,methods);return exports;}
