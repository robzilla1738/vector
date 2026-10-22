#include "aux-development-host-attach.h"
#include "aux-owned-napi-adapter.h"
#include <cstdint>
extern "C" int32_t AuxCreateSignedDevelopmentOwner(uint64_t*,void**);
extern "C" void AuxReleaseSignedDevelopmentOwner(void*);
extern "C" napi_status AuxAttachSignedDevelopmentDispatcher(napi_env env,
                                                            napi_value target) {
  if (!env || !target) return napi_invalid_arg;
  uint64_t handle=0;void* owner=nullptr;
  const int32_t status=AuxCreateSignedDevelopmentOwner(&handle,&owner);
  if (status || !handle || !owner) {
    if (owner) AuxReleaseSignedDevelopmentOwner(owner);
    return napi_generic_failure;
  }
  // Existing adapter consumes this exact one retain on every return, including
  // failure; native function/environment cleanup owns retirement thereafter.
  return AuxAttachOwnedDispatcher(env,target,handle,owner,
                                 AuxReleaseSignedDevelopmentOwner);
}
