#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// A separate native ABI preserves existing denied-roots v1 layout. The exact
// pending reservation retains these actual native directory capabilities.
typedef struct AuxExecNativeTaskBoundary {
  uint32_t version;
  char taskRoot[4096];
  char accountTaskRoot[4096];
  char workspace[4096];
  char application[4096];
} AuxExecNativeTaskBoundary;
#ifdef __cplusplus
int32_t AuxNativeExecCopyTaskBoundary(void*,AuxExecNativeTaskBoundary*) noexcept;
#else
int32_t AuxNativeExecCopyTaskBoundary(void*,AuxExecNativeTaskBoundary*);
#endif
#ifdef __cplusplus
}
#endif
