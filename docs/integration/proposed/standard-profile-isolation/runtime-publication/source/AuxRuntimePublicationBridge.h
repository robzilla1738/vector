#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native host only. Dispatcher retains admitted Owner/Entry and execution guard
// for the synchronous callback. task_fd and distribution_fd are borrowed; the latter is derived only from
// the authenticated daemon bundle policy and fixed agent-runtime layout; no JS FD/name/generation
// selects it. Caller keeps its native coordination lease until this returns,
// including the dispatcher's final fresh-authority validation.
typedef void (*AuxRuntimePublicationAction)(void* context, int32_t task_fd,
                                          int32_t distribution_fd,
                                          uint64_t transport_generation);
// 0: authenticated action and postcheck completed; any nonzero value refuses
// before callback or makes a callback's committed outcome unknown. The callback
// separately records whether any rename happened; callers never infer rollback.
int32_t AuxNativeContextWithRuntimePublication(
    uint64_t owner, uint64_t expected_transport_generation,
    AuxRuntimePublicationAction action, void* context);
#ifdef __cplusplus
}
#endif
