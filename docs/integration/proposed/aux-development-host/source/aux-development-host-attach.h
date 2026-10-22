#ifndef AUX_DEVELOPMENT_HOST_ATTACH_H_
#define AUX_DEVELOPMENT_HOST_ATTACH_H_
#include <node_api.h>
#ifdef __cplusplus
extern "C" {
#endif
// Retained obsolete ABI: always refuses valid-shaped arguments without calling
// any protected factory or publishing JS. New native embedding must use actual
// AuxDevelopmentWorkerHost lifetime ownership only after genuine admission.
// Neither that ownership nor this refusal establishes whole-profile custody.
napi_status AuxAttachSignedDevelopmentDispatcher(napi_env env,napi_value target);
#ifdef __cplusplus
}
#endif
#endif
