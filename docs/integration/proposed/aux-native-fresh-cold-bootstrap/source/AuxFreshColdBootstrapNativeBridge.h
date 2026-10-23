#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native-only, unregistered with Node. parent is an actual private-Connect
// routing handle from AuxNativeParentConnectionBridge, never a status receipt.
int32_t AuxCreateAuthenticatedFreshColdBootstrap(uint64_t parent,uint64_t* service);
int32_t AuxRetainAuthenticatedFreshColdBootstrap(uint64_t service);
void AuxReleaseAuthenticatedFreshColdBootstrap(uint64_t service);
// 0 ready (owns one copied provider ref);1 progressed;2 busy;3 stage unresolved;
// 4 stage blocked;5 target unresolved;6 target blocked;7 failure;8 guard stopped;
// -1 invalid/closed. Raw typed outcomes remain retained by the Swift service.
int32_t AuxAdvanceAuthenticatedFreshColdBootstrap(uint64_t service,uint64_t* provider);
// Owns one duplicate directory FD on success. Native child may create a kernel
// fileport transfer; integer/path serialization establishes no parent custody.
int32_t AuxCopyAuthenticatedFreshColdHomeDescriptor(uint64_t service,int32_t* descriptor);
#ifdef __cplusplus
}
#endif
