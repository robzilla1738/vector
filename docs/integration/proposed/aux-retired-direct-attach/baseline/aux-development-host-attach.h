#ifndef AUX_DEVELOPMENT_HOST_ATTACH_H_
#define AUX_DEVELOPMENT_HOST_ATTACH_H_
#include <node_api.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native caller only, after genuine lifecycle admission. No module initializer,
// JS factory, environment scope, claimed receipt or admission Boolean argument.
napi_status AuxAttachSignedDevelopmentDispatcher(napi_env env,napi_value target);
#ifdef __cplusplus
}
#endif
#endif
