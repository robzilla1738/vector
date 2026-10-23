#ifndef AUX_OWNED_COMMAND_DISPATCHER_H_
#define AUX_OWNED_COMMAND_DISPATCHER_H_
#include <stddef.h>
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Internal owned-context ABI. Handles are process-local and nonreusable, not an
// authentication capability. Only a trusted Swift host issues one. No C factory.
// Valid-handle input buffers must be readable for their explicit lengths.
// The result is UTF-8 JSON text: caller copies and frees exactly once.
char* AuxNativeContextRun(uint64_t handle, const uint8_t* command,
                         intptr_t command_length, const uint8_t* input,
                         intptr_t input_length);
void AuxNativeResultFree(char* result);
// Closes admission to this instance, drains acquired operations, then retires.
// 0 success, -1 invalid/already-retired, -2 reentrant observation/lease,
// -3 completed result/binding unresolved (owner retained), -4 wrong process,
// -5 other unresolved failure. Never treat -3/-4/-5 as already-retired.
// This observation excludes OS/PDF image custody:0 idle/no unknown result,
// 1 acquired call/reconciliation,2 unknown completed read,3 unknown completed
// write/generic operation,4 binding lost,-1 no entry,-4 wrong process.
int32_t AuxNativeContextObserveOperationState(uint64_t handle);
int32_t AuxNativeContextRetire(uint64_t handle);
// No command/action: exact retained owner only;0 currentvalid,1 unavailable,
// 2 priorresultunknown,3 closed/lost,-1 invalid,-2 wrongprocess. Not custody.
int32_t AuxNativeContextValidateCurrentAuthority(uint64_t handle);
#ifdef AUX_ATOMIC_CSK_DISPATCH
// Synchronous actual body runs under this instance's lease and fixed-home lock.
// No path, scope or lock-held declaration is accepted from the caller.
typedef int32_t (*AuxAccountRegistryBody)(void*);
int32_t AuxNativeContextWithAccountRegistryLock(uint64_t handle,
    AuxAccountRegistryBody body, void* context);
#endif
#ifdef __cplusplus
}
#endif
#endif
