#pragma once
#include <mach/mach.h>
#ifdef __cplusplus
extern "C" {
#endif
// Native bootstrap only, called before Node initialization. Returns one owned
// send-right reference, or MACH_PORT_NULL. Delivery is not peer authentication.
// This header is the ONLY ABI between Chromium's C++ graph and Node's graph.
mach_port_t AuxTakeNativeParentEndpointForBootstrap(void);
#ifdef __cplusplus
}
#endif
