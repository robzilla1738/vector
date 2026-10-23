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
// Sends only the actual provider-ready C service's retained home duplication.
// 0 authenticated transfer;1 timeout;-1 refused;-2 closed;-3 wrong process.
// -4 unresolved Mach right cleanup; connection is closed, never retried blindly.
int32_t AuxSendAuthenticatedFreshColdHome(uint64_t native_parent, uint64_t ready_service, uint32_t timeout_ms);
// Native-only actual backend/listener. No JS registration or generic commands.
int32_t AuxStartPreparedDaemonAuthorityServer(uint64_t parent, uint64_t provider, uint32_t timeout_ms);
int32_t AuxServicePreparedDaemonAuthorityServer(uint64_t parent, uint32_t timeout_ms);
// Close:0 actual retired;1 in-flight;2 untracked;-1 absent;-2 wrong process.
int32_t AuxClosePreparedDaemonAuthorityServer(uint64_t parent);
#ifdef __cplusplus
}
#endif
