#pragma once
#include <stdint.h>

#ifdef __cplusplus
#define AUX_PTY_NOEXCEPT noexcept
extern "C" {
#else
#define AUX_PTY_NOEXCEPT
#endif
// Native-only ABI. No NAPI/JS exports. A reservation is lifetime/admission,
// Bound helper authority is acquired from the authenticated sealed policy,
// bracketed by this reservation's real Owner authority. No JS path is accepted.
// Begin is the FIRST operation in the producer, before callback-capable reads.
// It captures the actual current native Environment; it accepts no JS identity.
void* AuxNativePtyBeginCurrent(void) AUX_PTY_NOEXCEPT;
// Copy only the bound fixed helper path into native storage;0 success/-1 refusal.
// capacity <=4096, bytes includes NUL. No JS path/input supplies authority.
int32_t AuxNativePtyCopyHelperPath(void* reservation, char* output,
    uint32_t capacity, uint32_t* bytes_including_nul) AUX_PTY_NOEXCEPT;
// Revalidate bound helper and Owner after conversions, just before each syscall.
int32_t AuxNativePtyCanSpawn(void* reservation) AUX_PTY_NOEXCEPT;
// Call for argument/setup/prelaunch failure or a failed syscall only when the
// native producer proves no child was created. Never cancel
// after a successful spawn, wait failure, environment cleanup, or lost reply.
void AuxNativePtySpawnFailed(void* reservation) AUX_PTY_NOEXCEPT;
// Publish the actual successful syscall PID before any fallible/JS operation.
// This function performs no allocation and does not wait/reap or invoke JS.
void AuxNativePtyChildCreated(void* reservation, int64_t actual_child) AUX_PTY_NOEXCEPT;
// The sole native reaper reports its actual waitpid return and status. Only a
// matching successful terminal result settles this direct child. Descendant
// custody always remains unknown; this does not certify whole-owner drain.
void AuxNativePtyDirectWaitResult(void* reservation, int64_t wait_result,
                                int32_t wait_status) AUX_PTY_NOEXCEPT;
#ifdef __cplusplus
}
#endif

#undef AUX_PTY_NOEXCEPT
