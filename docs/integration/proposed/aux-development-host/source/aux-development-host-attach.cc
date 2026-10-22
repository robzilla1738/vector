// Retained ABI tombstone. No protected factory, publication or lifetime bypass.
#include "aux-development-host-attach.h"
extern "C" napi_status AuxAttachSignedDevelopmentDispatcher(napi_env env,
                                                            napi_value target) {
  if (!env || !target) return napi_invalid_arg;
  // Only the native WorkerHost path owns real Environment reservation, cleanup,
  // in-flight publication retirement and captured PDF lifetime. This obsolete
  // direct entry can establish none of them; never invoke the protected factory.
  return napi_generic_failure;
}
