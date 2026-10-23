#pragma once
#include <Security/Security.h>
#include <mach/mach.h>
#include <stddef.h>
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native bootstrap only. Consumes exactly one owned send-right reference.
// No JS export, pointer publication or status/evidence authority constructor.
uint64_t AuxConnectActualNativeParent(mach_port_t owned_endpoint,
    SecRequirementRef exact_requirement, const uint8_t* cd_hash,
    size_t cd_hash_length, uint32_t timeout_ms);
int32_t AuxRetainNativeParentConnection(uint64_t native_handle);
void AuxReleaseNativeParentConnection(uint64_t native_handle);
// 0 authenticated,1 timeout,-1 refused,-2 closed,-3 wrong process.
int32_t AuxRevalidateNativeParentConnection(uint64_t native_handle, uint32_t timeout_ms);
#ifdef __cplusplus
}
#endif
