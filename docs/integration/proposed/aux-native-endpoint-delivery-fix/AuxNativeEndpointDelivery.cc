#include "AuxNativeEndpointDelivery.h"
#include "base/apple/mach_port_rendezvous.h"
namespace {
constexpr uint32_t kNativeParentPeerPort = 0x41555850;
}
extern "C" mach_port_t AuxTakeNativeParentEndpointForBootstrap(void) {
  auto* actual = base::MachPortRendezvousClient::GetInstance();
  if (!actual) return MACH_PORT_NULL;
  auto right = actual->TakeSendRight(kNativeParentPeerPort);
  return right ? right.release() : MACH_PORT_NULL;
}
