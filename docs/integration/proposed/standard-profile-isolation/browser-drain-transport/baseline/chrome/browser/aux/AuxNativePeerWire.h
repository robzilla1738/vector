#pragma once
#include <mach/mach.h>
#include <array>
#include <cstdint>

namespace aux::peer::detail {
constexpr mach_msg_id_t kRequest = 0x41555851;  // AUXQ
constexpr mach_msg_id_t kReply = 0x41555852;    // AUXR
constexpr uint32_t kVersion = 1;
constexpr uint32_t kMaximumTimeoutMs = 2'000;
inline constexpr bool ValidTimeout(uint32_t timeout_ms) {
  return timeout_ms > 0 && timeout_ms <= kMaximumTimeoutMs;
}
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

// Finite reverse native directory transfer. Never a JSON/path setter.
constexpr mach_msg_id_t kBrowserRootsRequest = 0x4155584e; // AUXN
constexpr mach_msg_id_t kBrowserRootsReply = 0x4155584f; // AUXO
constexpr uint32_t kBrowserRootsVersion = 5;
struct BrowserRootsWire {
  mach_msg_header_t header{};
  mach_msg_body_t body{};
  std::array<mach_msg_port_descriptor_t, 2> roots{};
  uint32_t version = kBrowserRootsVersion;
  uint32_t reserved = 0;
  uint64_t generation = 0;
  std::array<uint8_t, 32> nonce{};
  std::array<std::array<uint8_t, 32>, 2> canonical_path_sha256{};
};
struct BrowserRootsReceived { BrowserRootsWire wire; mach_msg_audit_trailer_t trailer; };
static_assert(sizeof(BrowserRootsWire) % 4 == 0);
inline bool ValidBrowserRootsWire(const BrowserRootsReceived& received) {
  if (received.wire.header.msgh_size != sizeof(BrowserRootsWire) ||
      received.wire.header.msgh_id != kBrowserRootsReply ||
      !(received.wire.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) ||
      received.wire.body.msgh_descriptor_count != 2 ||
      received.wire.version != kBrowserRootsVersion || received.wire.reserved != 0 ||
      received.wire.generation == 0 ||
      received.trailer.msgh_trailer_type != MACH_MSG_TRAILER_FORMAT_0 ||
      received.trailer.msgh_trailer_size < sizeof(mach_msg_audit_trailer_t)) return false;
  for (const auto& root : received.wire.roots)
    if (root.type != MACH_MSG_PORT_DESCRIPTOR || root.disposition != MACH_MSG_TYPE_PORT_SEND ||
        root.name == MACH_PORT_NULL) return false;
  return true;
}

// Finite native daemon authority RPC; never a generic command envelope.
constexpr mach_msg_id_t kAuthorityRegister = 0x4155584a; // AUXJ
constexpr mach_msg_id_t kAuthorityRegistered = 0x4155584b; // AUXK
constexpr mach_msg_id_t kAuthorityRequest = 0x4155584c; // AUXL
constexpr mach_msg_id_t kAuthorityReply = 0x4155584d; // AUXM
constexpr uint32_t kAuthorityVersion = 5;
constexpr uint32_t kSign = 1, kPublicKeys = 2, kInboxKey = 3, kObserve = 4, kAcknowledge = 5, kBrowserStartup = 6;
struct AuthorityWire {
  mach_msg_header_t header{};
  uint32_t version = kAuthorityVersion;
  uint32_t operation = 0;
  uint64_t generation = 0;
  uint64_t sequence = 0;
  std::array<uint8_t, 16> nonce{};
  std::array<uint8_t, 51> message{};
  uint8_t padding = 0;
};
struct AuthorityReceived { AuthorityWire wire; mach_msg_audit_trailer_t trailer; };
struct AuthorityReplyWire {
  mach_msg_header_t header{};
  uint32_t version = kAuthorityVersion;
  int32_t status = -1;
  uint64_t generation = 0;
  uint64_t sequence = 0;
  std::array<uint8_t, 16> nonce{};
  uint32_t length = 0;
  uint32_t reserved = 0;
  std::array<uint8_t, 8192> payload{};
};
struct AuthorityReplyReceived { AuthorityReplyWire wire; mach_msg_audit_trailer_t trailer; };
static_assert(sizeof(AuthorityWire) % 4 == 0);
static_assert(sizeof(AuthorityReplyWire) % 4 == 0);

// Apple libsyscall only treats these send errors as recoverable for cleanup.
inline bool RecoverableSendError(mach_msg_return_t result) {
  return result == MACH_SEND_INVALID_DEST || result == MACH_SEND_TIMED_OUT ||
      result == MACH_SEND_INTERRUPTED;
}
}  // namespace aux::peer::detail
