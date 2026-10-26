#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Additional finite native role; prior denied/task boundary layouts unchanged.
typedef struct AuxExecNativeRuntimeBoundary {
  uint32_t version;
  uint32_t present;
  uint32_t exclusiveMutation;
  char path[4096];
} AuxExecNativeRuntimeBoundary;
#ifdef __cplusplus
int32_t AuxNativeExecCopyRuntimeBoundary(void*,AuxExecNativeRuntimeBoundary*) noexcept;
#else
int32_t AuxNativeExecCopyRuntimeBoundary(void*,AuxExecNativeRuntimeBoundary*);
#endif
#ifdef __cplusplus
}
#endif
