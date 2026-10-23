#pragma once
#include <mach/mach.h>
#include <array>
#include <cstdint>

namespace aux::peer::detail {
constexpr mach_msg_id_t kRequest = 0x41555851;  // AUXQ
constexpr mach_msg_id_t kReply = 0x41555852;    // AUXR
constexpr uint32_t kVersion = 1;
constexpr uint32_t kMaximumTimeoutMs = 250;
struct Wire {
  mach_msg_header_t header{};
  uint32_t version = kVersion;
  uint32_t reserved = 0;
  uint64_t generation = 0;
  std::array<uint8_t, 32> nonce{};
};
struct Received {
  Wire wire;
  mach_msg_audit_trailer_t trailer;
};
static_assert(sizeof(Wire) % 4 == 0);
inline bool ValidWire(const Received& received, mach_msg_id_t kind) {
  return received.wire.header.msgh_size == sizeof(Wire) &&
      received.wire.header.msgh_id == kind &&
      !(received.wire.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) &&
      received.wire.version == kVersion && received.wire.reserved == 0 &&
      received.trailer.msgh_trailer_type == MACH_MSG_TRAILER_FORMAT_0 &&
      received.trailer.msgh_trailer_size >= sizeof(mach_msg_audit_trailer_t);
}

// Distinct complex protocol; v1 heartbeats remain byte-for-byte noncomplex.
constexpr mach_msg_id_t kSelectedHomeRequest = 0x41555848;  // AUXH
constexpr mach_msg_id_t kSelectedHomeReply = 0x41555849;    // AUXI
constexpr uint32_t kSelectedHomeVersion = 2;
struct SelectedHomeWire {
  mach_msg_header_t header{};
  mach_msg_body_t body{};
  mach_msg_port_descriptor_t fileport{};
  uint32_t version = kSelectedHomeVersion;
  uint32_t reserved = 0;
  uint64_t generation = 0;
  std::array<uint8_t, 32> nonce{};
};
struct SelectedHomeReceived {
  SelectedHomeWire wire;
  mach_msg_audit_trailer_t trailer;
};
static_assert(sizeof(SelectedHomeWire) % 4 == 0);
inline bool ValidSelectedHomeWire(const SelectedHomeReceived& received) {
  return received.wire.header.msgh_size == sizeof(SelectedHomeWire) &&
      received.wire.header.msgh_id == kSelectedHomeRequest &&
      (received.wire.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) &&
      received.wire.body.msgh_descriptor_count == 1 &&
      received.wire.fileport.type == MACH_MSG_PORT_DESCRIPTOR &&
      received.wire.fileport.disposition == MACH_MSG_TYPE_PORT_SEND &&
      received.wire.fileport.name != MACH_PORT_NULL &&
      received.wire.version == kSelectedHomeVersion && received.wire.reserved == 0 &&
      received.wire.generation == 0 &&
      received.trailer.msgh_trailer_type == MACH_MSG_TRAILER_FORMAT_0 &&
      received.trailer.msgh_trailer_size >= sizeof(mach_msg_audit_trailer_t);
}

// Apple libsyscall only treats these send errors as recoverable for cleanup.
inline bool RecoverableSendError(mach_msg_return_t result) {
  return result == MACH_SEND_INVALID_DEST || result == MACH_SEND_TIMED_OUT ||
      result == MACH_SEND_INTERRUPTED;
}
}  // namespace aux::peer::detail
