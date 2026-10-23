#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Finite paired capability from the actual retained Owner. Success transfers
// selected control-home and v5 task-home directory FDs, both CLOEXEC. No path,
// account/profile selector or caller-provided descriptor is accepted.
int32_t AuxNativeContextCopyStorageRoots(uint64_t owner,
    uint64_t* transport_generation, int32_t* control_home, int32_t* task_home);
#ifdef __cplusplus
}
#endif
