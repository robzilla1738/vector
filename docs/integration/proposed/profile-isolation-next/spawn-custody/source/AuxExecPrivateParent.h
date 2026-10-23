#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native host only; caller must bracket with its real current Owner validation.
// No path/hash/policy/owner selector is accepted. This returns a sealed parent
// pathname for mandatory exclusion, never a custody/admission receipt.
int32_t AuxCopyAuthenticatedExecPrivateParent(char *output, uint32_t capacity,
                                             uint32_t *count_including_nul);
#ifdef __cplusplus
}
#endif
