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
}  // namespace aux::peer::detail
