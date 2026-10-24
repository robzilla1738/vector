// Exact finite Chromium rendezvous wire consumer, system ABI only; no base link.
#include "AuxNativeEndpointDelivery.h"
#include <bsm/libbsm.h>
#include <libproc.h>
#include <servers/bootstrap.h>
#include <sys/proc_info.h>
#include <unistd.h>
#include <algorithm>
#include <array>
#include <cstddef>
#include <span>
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
  struct alignas(mach_msg_audit_trailer_t) ReceiveStorage {
    mach_msg_base_t base{};
    std::array<std::byte, 1024 - sizeof(mach_msg_base_t)> tail{};
  };
  static_assert(sizeof(ReceiveStorage) == 1024);
  static_assert(offsetof(ReceiveStorage, base) == 0);
  std::array<ReceiveStorage, 1> received{};
  // The Mach receive ABI starts at this real header and has the full owned
  // storage extent below. Decode the variable wire tail by bounded copies;
  // its uint64 payload is not guaranteed to have C++ uint64 alignment.
  auto* header = &received.front().base.header;
  status = mach_msg(header, MACH_RCV_MSG | MACH_RCV_TIMEOUT |
      MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0) |
      MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT), 0, sizeof(received), reply.name,
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
  if (received.front().base.body.msgh_descriptor_count != 1) return MACH_PORT_NULL;
  constexpr size_t kPortOffset = sizeof(mach_msg_base_t);
  constexpr size_t kKeyOffset = kPortOffset + sizeof(mach_msg_port_descriptor_t);
  constexpr size_t kAdditionalOffset = kKeyOffset + sizeof(uint32_t);
  static_assert(kAdditionalOffset + sizeof(uint64_t) == kSize);
  static_assert(kSize + sizeof(mach_msg_audit_trailer_t) <= sizeof(received));
  const auto bytes = std::as_bytes(std::span(received));
  std::array<mach_msg_port_descriptor_t, 1> ports{};
  std::array<uint32_t, 1> keys{};
  std::array<uint64_t, 1> additional{};
  std::array<mach_msg_audit_trailer_t, 1> trailers{};
  std::ranges::copy(bytes.subspan(kPortOffset, sizeof(ports)),
                    std::as_writable_bytes(std::span(ports)).begin());
  std::ranges::copy(bytes.subspan(kKeyOffset, sizeof(keys)),
                    std::as_writable_bytes(std::span(keys)).begin());
  std::ranges::copy(bytes.subspan(kAdditionalOffset, sizeof(additional)),
                    std::as_writable_bytes(std::span(additional)).begin());
  std::ranges::copy(bytes.subspan(kSize, sizeof(trailers)),
                    std::as_writable_bytes(std::span(trailers)).begin());
  auto& port = ports.front();
  const auto& trailer = trailers.front();
  if (port.type != MACH_MSG_PORT_DESCRIPTOR || port.disposition != MACH_MSG_TYPE_PORT_SEND ||
      port.name == MACH_PORT_NULL || keys.front() != kEndpointKey || additional.front() != 0 ||
      trailer.msgh_trailer_type != MACH_MSG_TRAILER_FORMAT_0 ||
      trailer.msgh_trailer_size != sizeof(trailer) || audit_token_to_pid(trailer.msgh_audit) != parent ||
      getppid() != parent || !ReadParent(parent, after) ||
      before.pbi_start_tvsec != after.pbi_start_tvsec ||
      before.pbi_start_tvusec != after.pbi_start_tvusec) return MACH_PORT_NULL;
  const auto endpoint = port.name;
  port.name = MACH_PORT_NULL;
  // Update the original owned Mach descriptor, not merely the decoded value,
  // so MessageOwner transfers exactly this send right and destroys the rest.
  std::ranges::copy(std::as_bytes(std::span(ports)),
      std::as_writable_bytes(std::span(received))
          .subspan(kPortOffset, sizeof(ports)).begin());
  return endpoint; // Locator only: next mandatory sealed live-code handshake.
}
