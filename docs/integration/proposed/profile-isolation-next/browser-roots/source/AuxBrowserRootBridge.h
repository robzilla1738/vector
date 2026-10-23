#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native-only finite directory capabilities. No path, PID or JS token input.
// Success transfers one owned CLOEXEC descriptor. Failure initializes fd=-1/gen=0.
// Parent form is used only by the retained native bootstrap guard.
int32_t AuxCopyAuthenticatedNativeParentBrowserRoot(uint64_t parent, uint32_t role,
    uint64_t* transport_generation, int32_t* descriptor);
// Owner form borrows the actual current dispatcher's retained native context.
int32_t AuxNativeContextCopyBrowserRoot(uint64_t owner, uint32_t role,
    uint64_t* transport_generation, int32_t* descriptor);
#ifdef __cplusplus
}
#endif
