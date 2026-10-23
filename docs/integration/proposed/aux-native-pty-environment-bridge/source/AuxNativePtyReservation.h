#pragma once
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif
// Native-only ABI. No NAPI/JS exports. A reservation is lifetime/admission,
// NOT authentication of a helper path, loaded addon, or signed spawn policy.
// The separately bound authenticated helper capability remains mandatory.
// Begin is the FIRST operation in the producer, before callback-capable reads.
// It captures the actual current native Environment; it accepts no JS identity.
void* AuxNativePtyBeginCurrent(void);
// Recheck after argument getters/conversion, immediately before the syscall.
int32_t AuxNativePtyCanSpawn(void* reservation);
// Call for argument/setup/prelaunch failure or a failed syscall only when the
// native producer proves no child was created. Never cancel
// after a successful spawn, wait failure, environment cleanup, or lost reply.
void AuxNativePtySpawnFailed(void* reservation);
// Publish the actual successful syscall PID before any fallible/JS operation.
// This function performs no allocation and does not wait/reap or invoke JS.
void AuxNativePtyChildCreated(void* reservation, int64_t actual_child);
// The sole native reaper reports its actual waitpid return and status. Only a
// matching successful terminal result settles this direct child. Descendant
// custody always remains unknown; this does not certify whole-owner drain.
void AuxNativePtyDirectWaitResult(void* reservation, int64_t wait_result,
                                int32_t wait_status);
#ifdef __cplusplus
}
#endif
