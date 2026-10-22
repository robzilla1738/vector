#include "../source/aux-owned-command-dispatcher.h"
#include <string.h>
char* AuxLifetimeProbeRun(uint64_t handle, const char* command, const char* input) {
  return AuxNativeContextRun(handle, (const uint8_t*)command, (intptr_t)strlen(command),
                            (const uint8_t*)input, (intptr_t)strlen(input));
}
char* AuxLifetimeProbeInvalidHandle(void) {
  // An invalid ID must be rejected before dereferencing deliberately invalid input.
  return AuxNativeContextRun(0, (const uint8_t*)1, 4, (const uint8_t*)1, 4);
}
int32_t AuxLifetimeProbeRetire(uint64_t handle) { return AuxNativeContextRetire(handle); }
void AuxLifetimeProbeFree(char* result) { AuxNativeResultFree(result); }
