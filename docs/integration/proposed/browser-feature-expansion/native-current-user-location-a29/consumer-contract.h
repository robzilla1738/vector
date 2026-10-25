#pragma once
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Real retained Security references from the validated outer/embedded pair;
// the code hash is captured by that native owner, never supplied by UI/JSON.
// -1: refused; 8: fixed development roots; 9: OS-current-user fixed Aux roots.
// Read-only policy classification. No directory creation or startup admission.
int32_t AuxGetValidatedEmbeddedNativeDaemonLaunchLocationMode(
    const void* static_code, const void* requirement,
    const uint8_t* expected_cd_hash, uintptr_t hash_length);
#ifdef __cplusplus
}
#endif
