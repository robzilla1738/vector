#ifndef AUX_AUTHENTICATED_PTY_HELPER_H_
#define AUX_AUTHENTICATED_PTY_HELPER_H_
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native host only. Call actual Owner authority validation around capture and
// revalidation, outside Worker locks. Retain until spawn commit/failure ends.
int32_t AuxCaptureAuthenticatedPtyHelper(void **output);
int32_t AuxAuthenticatedPtyHelperRevalidate(void *capability);
// Capacity <= 4096; count includes trailing NUL. Failure returns -1/count 0.
int32_t AuxAuthenticatedPtyHelperCopyPath(void *capability, char *output,
                                       uint32_t capacity, uint32_t *count);
void AuxAuthenticatedPtyHelperRelease(void *capability);
#ifdef __cplusplus
}
#endif
#endif
