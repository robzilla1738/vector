#pragma once
#include <stdint.h>
#ifdef __cplusplus
#define AUX_EXEC_NOEXCEPT noexcept
extern "C" {
#else
#define AUX_EXEC_NOEXCEPT
#endif
// Native producer ABI only. None is a JS export or a serializable capability.
// Root slots originate in authenticated native owners, never the command argv,
// environment, a JS profile selector or a caller-provided file descriptor.
#define AUX_EXEC_DENIED_ROOT_CAPACITY 4
#define AUX_EXEC_DENIED_PATH_CAPACITY 4096
typedef struct AuxExecNativeDeniedRoots {
  uint32_t version;
  uint32_t count;
  char paths[AUX_EXEC_DENIED_ROOT_CAPACITY][AUX_EXEC_DENIED_PATH_CAPACITY];
} AuxExecNativeDeniedRoots;
// FIRST producer operation, before any options getters/conversions. An exact
// current Environment/Owner/generation is retained through syscall publication.
void* AuxNativeExecBeginCurrent(void) AUX_EXEC_NOEXCEPT;
int32_t AuxNativeExecCopyDeniedRoots(void*, AuxExecNativeDeniedRoots*) AUX_EXEC_NOEXCEPT;
int32_t AuxNativeExecCanSpawn(void*) AUX_EXEC_NOEXCEPT;
// Scoped native uv producer handshake. Actual libuv posix_spawn sites repeat
// admission and publish success before cleanup can make uv_spawn return error.
// One active scope per creator thread; never a JS-visible token exchange.
int32_t AuxNativeExecEnterUvSpawn(void*) AUX_EXEC_NOEXCEPT;
int32_t AuxNativeExecUvCanSpawn(void) AUX_EXEC_NOEXCEPT;
void AuxNativeExecUvChildCreated(int64_t actual_child) AUX_EXEC_NOEXCEPT;
int32_t AuxNativeExecLeaveUvSpawn(void) AUX_EXEC_NOEXCEPT; //1=actual child created
// Only paths proven not to have created a child may cancel a pending token.
void AuxNativeExecSpawnFailed(void*) AUX_EXEC_NOEXCEPT;
// Actual successful uv_spawn PID before any JS publication/exception callback.
void AuxNativeExecChildCreated(void*, int64_t actual_child) AUX_EXEC_NOEXCEPT;
// Sole native libuv OnExit, before JS callbacks. No JS process identifier or
// synthesized wait result can settle this direct child. Lost exit stays pending.
void AuxNativeExecDirectExitObserved(void*, int64_t actual_child,
    int64_t exit_status, int32_t term_signal) AUX_EXEC_NOEXCEPT;
// Exact sole PTY native waitpid result, delivered by its existing reaper thread.
void AuxNativeExecDirectWaitResult(void*, int64_t wait_result,
    int32_t raw_status) AUX_EXEC_NOEXCEPT;
#ifdef __cplusplus
}
#endif
#undef AUX_EXEC_NOEXCEPT
