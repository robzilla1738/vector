// Exact finite Chromium rendezvous wire consumer, system ABI only; no base link.
#include "AuxNativeEndpointDelivery.h"
#include <bsm/libbsm.h>
#include <libproc.h>
#include <servers/bootstrap.h>
#include <sys/proc_info.h>
#include <unistd.h>
#include <array>
#include <cstdint>
#include <cstdio>
#include <cstring>

namespace {
constexpr mach_msg_id_t kRequest = 0x6d727a76; // Chromium 'mrzv'
constexpr mach_msg_id_t kResponse = 0x4d525a56; // Chromium 'MRZV'
constexpr uint32_t kEndpointKey = 0x41555850;   // AUXP, native launch only.
constexpr mach_msg_timeout_t kTimeout = 2000;
struct OwnedRight {
  mach_port_t name = MACH_PORT_NULL;
  const pid_t process = getpid();
  ~OwnedRight() {
    if (getpid() == process && name != MACH_PORT_NULL)
      mach_port_deallocate(mach_task_self(), name);
  }
};
struct OwnedReceiver {
  mach_port_t name = MACH_PORT_NULL;
  const pid_t process = getpid();
  ~OwnedReceiver() {
    if (getpid() == process && name != MACH_PORT_NULL)
      mach_port_mod_refs(mach_task_self(), name, MACH_PORT_RIGHT_RECEIVE, -1);
  }
};
bool ReadParent(pid_t parent, proc_bsdinfo& value) {
  return parent > 1 && proc_pidinfo(parent, PROC_PIDTBSDINFO, 0, &value,
      sizeof(value)) == static_cast<int>(sizeof(value)) && value.pbi_pid == static_cast<uint32_t>(parent) &&
      value.pbi_start_tvsec != 0;
}
}
extern "C" mach_port_t AuxTakeNativeParentEndpointForBootstrap(void) {
  const pid_t parent = getppid();
  proc_bsdinfo before{}, after{};
  if (!ReadParent(parent, before)) return MACH_PORT_NULL;
  char service[BOOTSTRAP_MAX_NAME_LEN]{};
  if (snprintf(service, sizeof(service), "dev.aux.browser.MachPortRendezvousServer.%d",
               parent) >= static_cast<int>(sizeof(service))) return MACH_PORT_NULL;
  OwnedRight server;
  if (bootstrap_look_up(bootstrap_port, service, &server.name) != KERN_SUCCESS)
    return MACH_PORT_NULL;
  OwnedReceiver reply;
  if (mach_port_allocate(mach_task_self(), MACH_PORT_RIGHT_RECEIVE, &reply.name) != KERN_SUCCESS)
    return MACH_PORT_NULL;
  mach_msg_header_t request{};
  request.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, MACH_MSG_TYPE_MAKE_SEND_ONCE);
  request.msgh_size = sizeof(request);
  request.msgh_remote_port = server.name;
  request.msgh_local_port = reply.name;
  request.msgh_id = kRequest;
  auto status = mach_msg(&request, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
      sizeof(request), 0, MACH_PORT_NULL, kTimeout, MACH_PORT_NULL);
  if (status != KERN_SUCCESS) {
    // As in reviewed peer transport, only pseudo-received recoverable errors
    // permit cleanup of the current local MOVE right. Unknown errors refuse;
    // never destroy the original stale MAKE_SEND_ONCE representation.
    if (status == MACH_SEND_INVALID_DEST || status == MACH_SEND_TIMED_OUT ||
        status == MACH_SEND_INTERRUPTED) {
      const auto local = MACH_MSGH_BITS_LOCAL(request.msgh_bits);
      if ((local == MACH_MSG_TYPE_MOVE_SEND || local == MACH_MSG_TYPE_MOVE_SEND_ONCE) &&
          request.msgh_local_port != MACH_PORT_NULL)
        mach_port_deallocate(mach_task_self(), request.msgh_local_port);
    }
    return MACH_PORT_NULL;
  }
  // Bounded maximum upstream response, though this cold role accepts exactly1.
  alignas(mach_msg_audit_trailer_t) std::array<uint8_t, 1024> received{};
  auto* header = reinterpret_cast<mach_msg_header_t*>(received.data());
  status = mach_msg(header, MACH_RCV_MSG | MACH_RCV_TIMEOUT |
      MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0) |
      MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT), 0, received.size(), reply.name,
      kTimeout, MACH_PORT_NULL);
  if (status != KERN_SUCCESS) return MACH_PORT_NULL;
  struct MessageOwner {
    mach_msg_header_t* header;
    ~MessageOwner() { mach_msg_destroy(header); }
  } message{header};
  constexpr size_t kSize = sizeof(mach_msg_base_t) + sizeof(mach_msg_port_descriptor_t) +
                           sizeof(uint32_t) + sizeof(uint64_t);
  if (header->msgh_id != kResponse || header->msgh_size != kSize ||
      !(header->msgh_bits & MACH_MSGH_BITS_COMPLEX)) return MACH_PORT_NULL;
  auto* base = reinterpret_cast<mach_msg_base_t*>(header);
  if (base->body.msgh_descriptor_count != 1) return MACH_PORT_NULL;
  auto* port = reinterpret_cast<mach_msg_port_descriptor_t*>(received.data() + sizeof(mach_msg_base_t));
  uint32_t key = 0;
  uint64_t additional = 1;
  memcpy(&key, received.data() + sizeof(mach_msg_base_t) + sizeof(*port), sizeof(key));
  memcpy(&additional, received.data() + sizeof(mach_msg_base_t) + sizeof(*port) + sizeof(key), sizeof(additional));
  auto* trailer = reinterpret_cast<mach_msg_audit_trailer_t*>(received.data() + kSize);
  if (port->type != MACH_MSG_PORT_DESCRIPTOR || port->disposition != MACH_MSG_TYPE_PORT_SEND ||
      port->name == MACH_PORT_NULL || key != kEndpointKey || additional != 0 ||
      trailer->msgh_trailer_type != MACH_MSG_TRAILER_FORMAT_0 ||
      trailer->msgh_trailer_size != sizeof(*trailer) || audit_token_to_pid(trailer->msgh_audit) != parent ||
      getppid() != parent || !ReadParent(parent, after) ||
      before.pbi_start_tvsec != after.pbi_start_tvsec ||
      before.pbi_start_tvusec != after.pbi_start_tvusec) return MACH_PORT_NULL;
  const auto endpoint = port->name;
  port->name = MACH_PORT_NULL; // Transfer exactly the received send right.
  return endpoint; // Locator only: next mandatory sealed live-code handshake.
}
