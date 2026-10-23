#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Actual Security refs from kernel-audit-validated child only. Success returns
// an owned private parent FD bound to the exact sealed freshpolicy resource.
// This is not selected-home readiness or native writer-admission evidence.
int32_t AuxCopyAuthenticatedFreshChildParentDescriptor(
    const void* static_code, const void* requirement,
    const uint8_t* expected_cd_hash, uint32_t expected_cd_hash_bytes,
    int32_t* parent_descriptor);
#ifdef __cplusplus
}
#endif
