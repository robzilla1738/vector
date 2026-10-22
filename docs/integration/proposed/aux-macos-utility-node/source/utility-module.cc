#include "AuxMacUtilityEnvironmentHost.h"
#include <node.h>
#include <new>
namespace {void CleanupHost(void* value){delete static_cast<AuxMacUtilityEnvironmentHost*>(value);}}
// A specific utility-only owner per actual Environment. No protected factory,
// generic core, scope, credentials, policy, JS enable flag or OS operation here.
NAPI_MODULE_INIT(){
 auto* host=new(std::nothrow) AuxMacUtilityEnvironmentHost;
 if(!host){napi_throw_error(env,nullptr,"Mac utility host allocation failed");return nullptr;}
 auto status=host->AttachCurrentEnvironment(env,exports);
 if(status!=napi_ok){delete host;napi_throw_error(env,nullptr,"Mac utility Environment attachment failed");return nullptr;}
 if(napi_add_env_cleanup_hook(env,CleanupHost,host)!=napi_ok){
  node::AddEnvironmentCleanupHook(v8::Isolate::GetCurrent(),CleanupHost,host);
  napi_throw_error(env,nullptr,"Mac utility host cleanup attachment failed");return nullptr;
 }
 return exports;
}
