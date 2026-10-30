#pragma once
#include <cstdint>

// Native host API only; never a JS export or a profile-admission receipt.
// Closure is permanent for this loaded image/process. Already admitted calls
// may finish (including writes); pending means the host must retain custody.
// Returns 0 drained, 1 pending, -1 wrong process. It never waits on a JS callback.
extern "C" __attribute__((visibility("default")))
int32_t AuxPdfCloseAdmissionAndDrain();
// UINT64_MAX means wrong process. A zero count alone does not close admission.
extern "C" __attribute__((visibility("default")))
uint64_t AuxPdfPendingOperations();
