#pragma once
#include <mach/mach.h>
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
// Consumes an owned current-process send right, including failure. On success
// caller owns one native connection reference; release via actual peer bridge.
int32_t AuxCreateSealedOuterBrowserParentConnection(mach_port_t endpoint,
                                                  uint64_t* connection);
#ifdef __cplusplus
}
#endif
