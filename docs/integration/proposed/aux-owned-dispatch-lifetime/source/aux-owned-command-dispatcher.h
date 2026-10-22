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
// 0 success, -1 invalid/already-retired, -2 attempted from this thread's lease.
int32_t AuxNativeContextRetire(uint64_t handle);
#ifdef __cplusplus
}
#endif
#endif
